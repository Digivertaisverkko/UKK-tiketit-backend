const crypto = require('crypto');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const errorcodes = require('./errorcodes.js');
const con = connection.getConnection();

module.exports = {

  createLoginUrl: function(loginid, codeChallenge, frontcode, courseId) {
    const query = 'INSERT INTO core.loginyritys (loginid, codeChallenge, fronttunnus, profiili) VALUES ($1, $2, $3, NULL)';
    return connection.queryAll(query, [loginid, codeChallenge, frontcode])
    .then((sqldata) => { return 'course/' + courseId + '/login?loginid=' + loginid })
    .catch((error) => { return Promise.reject('createLogin: ' + error + ' loginid: ' + loginid) });
  },

  getAllUsersFromListWhoWantNotifications: function(userIdList) {
    const query = 'SELECT p.id, p.sposti \
    FROM core.profiili p \
    INNER JOIN core.profiiliasetukset a \
    ON p.id=a.profiili \
    WHERE p.id=ANY($1) AND a.sposti_ilmoitus=true';
    return connection.queryAll(query, [userIdList]);
  },

  updateLoginAttemptWithAccount: function(loginid, userid) {
    const query = 'UPDATE core.loginyritys SET profiili=$1 WHERE loginid=$2';
    return connection.queryAll(query, [userid, loginid]);
  },

  getLoginAttemptWithId: function(loginid) {
    const query = 'SELECT * FROM core.loginyritys WHERE loginid=$1';
    return connection.queryAll(query, [loginid]);
  },

  getLoginAttemptWithAccessCode: function(accessCode) {
    const query = 'SELECT * FROM core.loginyritys WHERE fronttunnus=$1 AND profiili IS NOT NULL';
    return connection.queryAll(query, [accessCode]);
  },

  createSession: function(userid) {
    const sessionid = crypto.randomUUID();

    const query = 'INSERT INTO core.sessio (sessionid, vanhenee, profiili) VALUES ($1, NOW()+interval \'14 days\', $2)'
    return connection.queryNone(query, [sessionid, userid])
    .then(() => {
        const query = 'SELECT * FROM core.sessio WHERE sessionid=$1';
        return connection.query(query, [sessionid]);
    });
  },

  temporarilyStoreLtiToken: function(token, profileId, version, storageId) {
    const query = 'INSERT INTO core.lti_tilipyynto (id, olemassa_oleva_profiili, lti_versio, token) VALUES ($1, $2, $3, $4)';
    return connection.queryNone(query, [storageId, profileId, version, JSON.stringify(token)]);
  },

  getStoredLtiToken: function(storageId) {
    const query = 'SELECT * FROM core.lti_tilipyynto WHERE id=$1';
    return connection.queryOne(query, [storageId])
    .then((tokenData) => {
      tokenData.token = JSON.parse(tokenData.token);
      return tokenData;
    });
  },

  deleteAllStoredLtiTokens: function() {
    const query = 'DELETE FROM core.lti_tilipyynto';
    return connection.queryNone(query);
  },

  deleteStoredLtiToken(storageId) {
    const query = 'DELETE FROM core.lti_tilipyynto WHERE id=$1';
    return connection.queryNone(query, [storageId]);
  },

  getSession: function(sessionid) {
    const query = 'SELECT * from core.sessio WHERE sessionid=$1';
    return connection.queryAll(query, [sessionid]);
  },

  getAllSessions: function() {
    const query = 'SELECT * from core.sessio';
    return connection.queryAll(query);
  },

  getSalt: function(username) {
    const query = 'SELECT salt FROM core.login WHERE ktunnus=$1';
    return connection.queryAll(query, [username]);
  },

  checkUserAccount: function(username, passwordhash) {
    const query = 'SELECT * FROM core.login WHERE ktunnus=$1 AND salasana=$2';
    return connection.queryAll(query, [username, passwordhash]);
  },

  getLtiUser: function(ltiClientId, ltiUserId) {
    const query = 'SELECT p.id, p.nimi, p.sposti \
    FROM core.lti_login ll INNER JOIN core.profiili p\
    ON ll.profiili=p.id\
    WHERE ll.clientid=$1 AND ll.userid=$2';
    return connection.queryAll(query, [ltiClientId, ltiUserId])
  },

  createLtiUser: function(name, email, ltiClientId, ltiUserId) {
    const ltiQuery = 'INSERT INTO core.lti_login (clientid, userid, profiili) VALUES ($1, $2, $3)';
    let storedProfileId;
    return module.exports.createEmptyUser(name, email)
    .then((profileId) => {
      storedProfileId = profileId;
      return connection.queryNone(ltiQuery, [ltiClientId, ltiUserId, profileId]);
    })
    .then(() => {
      return storedProfileId;
    });
  },

  removeLoginAttempt: function(frontcode) {
    const query = 'DELETE FROM core.loginyritys WHERE fronttunnus=$1';
    return connection.queryAll(query, [frontcode]); 
  },


  createEmptyUser: function(name, email) {
    const query = 'INSERT INTO core.profiili (nimi, sposti) VALUES ($1, $2) RETURNING id';
    return connection.queryOne(query, [name, email])
    .then((sqldata) => {
      return module.exports.createEmptyProfileSettings(sqldata.id)
      .then(() => {
        return sqldata.id;
      });
    });
  },

  createEmptyProfileSettings: function(userid) {
    const query = 'INSERT INTO core.profiiliasetukset (profiili, sposti_ilmoitus, sposti_kooste, sposti_palaute, gdpr_lupa) \
    VALUES ($1, true, true, false, true)';
    return connection.queryNone(query, [userid]);
  },

  createAccount: function(username, passwordhash, salt, userid) {
    const query = 'INSERT INTO core.login (ktunnus, salasana, salt, profiili) VALUES ($1, $2, $3, $4)';
    return connection.queryAll(query, [username, passwordhash, salt, userid])
    .catch((error) => {
      if (error.code == '23505') {
        return Promise.reject(errorcodes.accountAlreadyExists);
      } else {
        return Promise.reject(error);
      }
    });
  },

  userIdForSession: function(sessionid) {
    const query = 'SELECT profiili FROM core.sessio WHERE sessionid=$1 AND vanhenee>NOW()';
    return connection.queryAll(query, [sessionid]);
  },

  userIdsWithEmail: function(email) {
    const query = 'SELECT id FROM core.profiili WHERE sposti=$1';
    return connection.queryAll(query, [email]);
  },

  getUserProfile: function(userid) {
    const query = 'SELECT nimi, sposti from core.profiili WHERE id=$1';
    return connection.queryOne(query, [userid]);
  },

  getAllUsersWhoWantAggregateMails: function() {
    const query = 'SELECT p.id, p.nimi, p.sposti \
    FROM core.profiili p \
    INNER JOIN core.profiiliasetukset a \
    ON p.id=a.profiili \
    WHERE a.sposti_kooste=true AND a.sposti_ilmoitus=true';
    return connection.queryAll(query, []);
  },

  getUserProfileSettings: function(userid) {
    const query = 'SELECT * from core.profiiliasetukset WHERE profiili=$1';
    return connection.queryOne(query, [userid]);
  },

  updateUserProfile: function(userid, newName, newEmail) {
    const query = '\
    UPDATE core.profiili \
    SET nimi=$1, sposti=$2 \
    WHERE id=$3';
    return connection.queryNone(query, [newName, newEmail, userid]);
  },

  updateUserProfileSettings: function(userid, emailNotification, emailAggregate, emailFeedback) {
    const query = '\
    INSERT INTO core.profiiliasetukset (profiili, sposti_ilmoitus, \
       sposti_kooste, sposti_palaute, gdpr_lupa) \
    VALUES ($1, $2, $3, $4, true) \
    ON CONFLICT (profiili) \
    DO \
    UPDATE SET sposti_ilmoitus = EXCLUDED.sposti_ilmoitus, \
               sposti_kooste   = EXCLUDED.sposti_kooste, \
               sposti_palaute  = EXCLUDED.sposti_palaute';
    return connection.queryNone(query, [userid, emailNotification, 
                                        emailAggregate, emailFeedback]);
  },

  updateUserProfileGDPRPermission(userid, hasPermission) {
    const query = '\
    UPDATE core.profiiliasetukset \
    SET gdpr_lupa=$1 \
    WHERE profiili=$2';
    return connection.queryNone(query, [hasPermission, userid]);
  },

  removeProfile: function(profileid) {
    const query = '\
    DELETE FROM core.profiili \
    WHERE id=$1';
    return connection.queryNone(query, [profileid]);
  },

  removeAccount: function(profileid) {
    const defaultQuery = 'DELETE FROM core.login WHERE profiili=$1';
    const ltiQuery     = 'DELETE FROM core.lti_login WHERE profiili=$1';
    return connection.queryNone(defaultQuery, [profileid])
    .then(() => {
      return connection.queryNone(ltiQuery, [profileid]);
    });
  },

  removeSession: function(profileid) {
    const query = 'DELETE FROM core.sessio WHERE profiili=$1';
    return connection.queryNone(query, [profileid]);
  },

  removeSessionWithId: function(sessionid) {
    const query = 'DELETE FROM core.sessio WHERE sessionid=$1';
    return connection.queryNone(query, [sessionid]);
  }
 

};
