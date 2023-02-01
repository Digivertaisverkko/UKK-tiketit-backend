
const crypto = require('crypto');
const { use } = require('express/lib/router');
const sql = require('../../routes/sql');
const ltiparser = require('./ltiparser');
const lti = require('ims-lti')

var authsBySession = new Object();
var sessionsByLogin = new Object();

module.exports = {
    
  startLogin: function(codeChallenge, logintype) {
    let storedData;
    return new Promise(function(resolve, reject) {
      if (logintype === 'own') {
        let loginid = crypto.randomUUID();
        let fronttunnus = crypto.randomUUID();
        storedData = {cc: codeChallenge, lid: loginid, fcode: fronttunnus};
        resolve(storedData)
      } else {
        reject(1001);
      }
    }).then((data) => {
      return sql.users.createLoginUrl(data.lid, data.cc, data.fcode);
    }).then((data) => {
      return {'login-url': data, "login-id": storedData.lid};
    });
  },

  login: function(username, password, loginid) {
    return new Promise(function(resolve, reject) {
      sql.users.getSalt(username).then((saltData) => {
        if (saltData.length === 1) {
          let hash = module.exports.hash(password, saltData[0].salt);
          sql.users.checkUserAccount(username, hash).then((accountData) => {
            if (accountData.length === 1) {
              sql.users.updateLoginAttemptWithAccount(loginid, accountData[0].profiili).then((updateData) => {
                sql.users.getLoginAttemptWithId(loginid).then((attemptData) => {
                  if (attemptData.length === 1) {
                    resolve({success: true, 'login-code': attemptData[0].fronttunnus});
                  } else {
                    reject(1003);
                  }
                });
              });
            } else {
              reject(1002);
            }
          });
        } else {
          reject(1002);
        }
      });
    });
  },

  requestAccess: function(accessCode, codeVerify) {
    return new Promise(function(resolve, reject) {
      sql.users.getLoginAttemptWithAccessCode(accessCode)
      .then((loginData) => {
        if (loginData.length > 0) {
          sql.users.createSession(loginData[0].profiili)
          .then((sessionData) => {
            resolve(sessionData);
          });
        } else {
          reject(1003);
        }
      })
      .catch((error) => {
        reject(error);
      });
    });
  },

  createAccount: function(username, password, email) {
    return sql.users.createEmptyUser(username, email)
    .then((newuserId) => {
      let salt = crypto.randomBytes(8).toString('hex');
      let hash = module.exports.hash(password, salt);
      return sql.users.createAccount(username, hash, salt, newuserId);
    });
  },

  securityCheckLti1p1: function(request) {
    //TODO: Toteuta oikea client secret -hallintamekanismi tietokantaan.
    return new Promise(function(resolve, reject) {
      let consumerKey = request.body.oauth_consumer_key;
      let clientSecret = process.env.TEMP_CLIENT_SECRET;
      let provider = new lti.Provider(consumerKey, clientSecret);
      console.log(consumerKey + ' ' + clientSecret);
      provider.valid_request(request, request.body, function(err, isValid) {
        if (isValid) {
          resolve();
        } else {
          reject(err + ' ' + request.body.oauth_signature);
        }
      });
    }); 
  },

  ltiLoginWithToken: function(token) {
    let userid = token.user;
    let contextid = token.platformContext.contextId;
    let clientid = token.clientId;
    let username = token.userInfo.name;
    let coursename = token.platformContext.context.title;
    let courseroles = token.platformContext.roles;

    return module.exports.ltiLogin(userid, contextid, clientid, username, coursename, courseroles);
  },

  ltiLogin: function(userid, contextid, clientid, username, coursename, courseroles) {

    let storedProfileId;
    let storedCourseId;

    return sql.users.getLtiUser(clientid, userid)
    .then((userList) => {
      if (userList.length == 0) {
        return sql.users.createLtiUser(username, clientid, userid);
      } else if (userList[0].nimi !== username) {
        return sql.users.updateUserProfile(userList[0].id, username)
        .then(() => {
            return userList[0].id;
        });
      } else {
        return userList[0].id;
      }
    })
    .then((profileid) => {
      storedProfileId = profileid;
      return sql.courses.getAndCreateLtiCourse(coursename, clientid, contextid);
    })
    .then((courseid) => {
      storedCourseId = courseid;
      return sql.courses.getUserInfoForCourse(storedProfileId, courseid)
      .then((userInfo) => {
        let position = ltiparser.coursePositionFromLtiRoles(courseroles);
        if (userInfo.asema !== position) {
          return sql.courses.updateUserPositionInCourse(userInfo.id, storedCourseId, position);
        }
      })
      .catch((error) => {
        if (error === 2000) {
          let position = ltiparser.coursePositionFromLtiRoles(courseroles);
          return sql.courses.addUserToCourse(courseid, storedProfileId, position === 'opettaja');
        } else {
          return Promise.reject(error);
        }
      });
    })
    .then(() => {
      return sql.users.createSession(storedProfileId);
    })
    .then((sessiondata) => {
      return {"sessionid": sessiondata[0].sessionid, "profiili": storedProfileId, "kurssi": storedCourseId};
    });
  },

  hash: function(hashable, salt) {
    return crypto.createHash('sha256').update(hashable).update(salt).digest('hex');
  },

  authenticatedUser: function(httpRequest) {
    var sessionid = httpRequest.header('session-id');
    if (sessionid == undefined) {
      return Promise.reject(3000);
    }

    return sql.users.userIdForSession(sessionid)
    .then((userids) => {
      if (userids.length == 1) {
        return userids[0].profiili;
      } else {
        return Promise.reject(1000);
      }
    });
  },

  hasTicketAccess: function(request, ticketId) {
    return sql.tickets.isFaqTicket(ticketId)
    .then((isFaq) => {
      if (isFaq === false) {
        return module.exports.authenticatedUser(request)
        .then((userid) => {
          return sql.tickets.hasAccess(userid, ticketId);
        })
        .then((access) => {
          if (access.asema === 'opettaja') {
            return sql.tickets.setTicketStateIfAble(ticketId, 2);
          }
        })
      } else {
        return;
      }
    });
  },

  hasTicketModifyAccess: function(request, ticketId) {
    let storedUserid;
    auth.authenticatedUser(req)
    .then((userid) => {
      storedUserid = userid;
      //TODO: hasTicketAccess ei riitä oikeuksien tarkistamiseen
      return auth.hasTicketAccess(req, req.params.ticketid);
    })
    .then(() => {
      return sql.tickets.getTicket(req.params.ticketid);
    })
    .then((ticketdata) => {
      return module.exports.roleInCourse(ticketdata.kurssi, storedUserId)
      .then((roledata) => {
        if (roledata.asema === 'opettaja' && ticketdata.ukk === true) {
          return;
        } else {
          Promise.reject(1003);
      }
      });
    })
  }
  
};