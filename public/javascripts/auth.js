
const crypto = require('crypto');
const { use } = require('express/lib/router');
const sql = require('../../routes/sql');
const ltiparser = require('./ltiparser');
const lti = require('ims-lti');
const { env } = require('process');
const errorcodes = require('./errorcodes.js');
const connection = require('./connection.js');

var authsBySession = new Object();
var sessionsByLogin = new Object();

module.exports = {
    
  startLogin: function(codeChallenge, logintype, courseId) {
    let storedData;
    return new Promise(function(resolve, reject) {
      if (logintype === 'own') {
        let loginid = crypto.randomUUID();
        let fronttunnus = crypto.randomUUID();
        storedData = {cc: codeChallenge, lid: loginid, fcode: fronttunnus};
        resolve(storedData)
      } else {
        reject(errorcodes.noConnection);
      }
    }).then((data) => {
      return sql.users.createLoginUrl(data.lid, data.cc, data.fcode, courseId);
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
                    reject(errorcodes.noPermission);
                  }
                });
              });
            } else {
              reject(errorcodes.wrongCredentials);
            }
          });
        } else {
          reject(errorcodes.wrongCredentials);
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
          reject(errorcodes.noPermission);
        }
      })
      .catch((error) => {
        reject(error);
      });
    });
  },

  createAccount: function(username, password, email, invitationId) {
    let storedInvitation;
    let storedUserId;
    return sql.users.getUserInvitation(invitationId)
    .then((invitationData) => {
      if (invitationData.sposti == email) {
        storedInvitation = invitationData;
        return sql.users.createEmptyUser(username, email)
      } else {
        return Promise.reject(errorcodes.noPermission);
      }
    })
    .then((newuserId) => {
      storedUserId = newuserId;
      let salt = crypto.randomBytes(8).toString('hex');
      let hash = module.exports.hash(password, salt);
      return sql.users.createAccount(username, hash, salt, newuserId);
    })
    .then(() => {
      return sql.courses.addUserToCourse(storedInvitation.kurssi,
                                         storedUserId,
                                         storedInvitation.rooli == 'opettaja');
    })
    .then(() => {
      return sql.users.removeUserInvitation(invitationId);
    })
  },

  securityCheckLti1p1: function(request) {
    //TODO: Toteuta oikea client secret -hallintamekanismi tietokantaan.
    return new Promise(function(resolve, reject) {

      console.log(request.body);

      let consumerKey = request.body.oauth_consumer_key;
      if (consumerKey !== process.env.TEMP_CLIENT_KEY) {
        console.warn('Väärä consumerKey');
        return reject(errorcodes.noPermission);
      }
      let clientSecret = process.env.TEMP_CLIENT_SECRET;
      let provider = new lti.Provider(consumerKey, clientSecret);

      provider.valid_request(request, request.body, function(err, isValid) {
        if (isValid) {
          console.log('lti 1.1 signature on oikein.');
          return resolve();
        } else if (err == 'Error: Invalid Signature') {
          console.warn('lti 1.1 Invalid signature.');
          if (process.env.LTI_CHECK_SIGNATURE === 'false') {
            console.warn('lti 1.1 hyväksytiin väärällä signaturella.')
            return resolve();
          } else {
            return reject(err);
          }
        } else {
          console.warn('lti 1.1 error: ' + err);
          return reject(err);
        }
      });
    }); 
  },

  ltiLoginWithToken: function(httpRequest, token) {
    console.dir(token);
    let userid = token.user;
    let contextid = token.platformContext.contextId;
    let clientid = token.clientId;
    let username = token.userInfo.name;
    let email = token.userInfo.email;
    let coursename = token.platformContext.context.title;
    let courseroles = token.platformContext.roles;

    return module.exports.ltiLogin(httpRequest, userid, contextid, clientid, username, email, coursename, courseroles);
  },

  ltiLogin: function(httpRequest, userid, contextid, clientid, username, email, coursename, courseroles) {

    let storedProfileId;
    let storedCourseId;

    return sql.users.getLtiUser(clientid, userid)
    .then((userList) => {
      if (userList.length == 0) {
        return sql.users.createLtiUser(username, email, clientid, userid);
      } else if (userList[0].nimi !== username || userList[0].sposti !== email) {
        return sql.users.updateUserProfile(userList[0].id, username, email)
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
        if (userInfo.asema !== position && userInfo.asema !== 'opettaja') {
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
      return module.exports.regenerateSession(httpRequest, storedProfileId);
    })
    .then(() => {
      return {"profiili": storedProfileId, "kurssi": storedCourseId};
    });
  },

  hash: function(hashable, salt) {
    return crypto.createHash('sha256').update(hashable).update(salt).digest('hex');
  },

  authenticatedUser: function(httpRequest) {
    return new Promise(function(resolve, reject) {
      if (httpRequest.session.profiili) {
        return resolve(httpRequest.session.profiili);
      } else {
        return reject(errorcodes.notSignedIn);
      }
    });
  },

  createNewCookieSecret: function() {
    let uuid = crypto.randomUUID();
    const query = '\
    INSERT INTO core.keksisalaisuus (salaisuus, vanhenee) \
    VALUES ($1, NOW() + interval \'7 days\')';
    return connection.queryNone(query, [uuid]);
  },

  getAcceptedCookieSecrets: function() {
    const query ='\
    SELECT * FROM core.keksisalaisuus \
    WHERE vanhenee > NOW() \
    ORDER BY vanhenee';
    return connection.query(query);
  },



  regenerateSession: function(request, profileid) {
    return new Promise(function(resolve, reject) {
      request.session.regenerate(function(error) {
        if (error) return reject(error);
        request.session.profiili = profileid;
        resolve();
      });
    })
    .then(() => {
      return this.saveSession(request);
    });
  },

  saveSession: function(request) {
    return new Promise(function(resolve, reject) {
      request.session.save(function(error) {
        if (error) return reject(error);
        resolve();
      })
    });
  },

  logoutSession: function(request) {
    return this.regenerateSession(request, null);
  },

  destroySession: function(request) {
    return new Promise(function(resolve, reject) {
      request.session.destroy(function(error) {
        if (error) return reject(error);
        resolve();
      })
    });
  }
  
};