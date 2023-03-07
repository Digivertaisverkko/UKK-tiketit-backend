const crypto = require('crypto');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const errorcodes = require('./errorcodes.js');
const con = connection.getConnection();

module.exports = {

  createLoginUrl: function(loginid, codeChallenge, frontcode) {
    const query = 'INSERT INTO core.loginyritys (loginid, codeChallenge, fronttunnus, profiili) VALUES ($1, $2, $3, NULL)';
    return connection.queryAll(query, [loginid, codeChallenge, frontcode])
    .then((sqldata) => { return '/login?loginid=' + loginid })
    .catch((error) => { return Promise.reject('createLogin: ' + error + ' loginid: ' + loginid) });
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
    .then((sqldata) => { return sqldata.id });
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

  updateUserProfile: function(userid, newName, newEmail) {
    const query = '\
    UPDATE core.profiili \
    SET nimi=$1, sposti=$2 \
    WHERE id=$3';
    return connection.queryNone(query, [newName, newEmail, userid]);
  }
 

};
