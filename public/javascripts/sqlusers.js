const crypto = require('crypto');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const con = connection.getConnection();

module.exports = {

  createLoginUrl: function(loginid, codeChallenge, frontcode) {
    const query = 'INSERT INTO core.loginyritys (loginid, codeChallenge, fronttunnus, tili) VALUES ($1, $2, $3, NULL)';
    return connection.queryAll(query, [loginid, codeChallenge, frontcode])
    .then((sqldata) => { return '/login?loginid=' + loginid })
    .catch((error) => { return Promise.reject('createLogin: ' + error + ' loginid: ' + loginid) });

    return new Promise(function (resolve, reject) {
      const query = 'INSERT INTO core.loginyritys (loginid, codeChallenge, fronttunnus, tili) VALUES ($1, $2, $3, NULL)';
      con.query(query, [loginid, codeChallenge, frontcode], function(err, res) {
        if (err) {
          reject('createLogin: ' + err + ' loginid: ' + loginid);
        }
        resolve('/login?loginid=' + loginid);
      });
    });
  },

  updateLoginAttemptWithAccount: function(loginid, userid) {
    const query = 'UPDATE core.loginyritys SET tili=$1 WHERE loginid=$2';
    return connection.queryAll(query, [userid, loginid]);
  },

  getLoginAttemptWithId: function(loginid) {
    const query = 'SELECT * FROM core.loginyritys WHERE loginid=$1';
    return connection.query(query, [loginid]);
  },

  getLoginAttemptWithAccessCode: function(accessCode) {
    const query = 'SELECT * FROM core.loginyritys WHERE fronttunnus=$1 AND tili IS NOT NULL';
    return connection.queryAll(query, [accessCode]);
  },

  createSession: function(userid) {
    const sessionid = crypto.randomUUID();

    const query = 'INSERT INTO core.sessio (sessionid, vanhenee, tili) VALUES ($1, NOW()+interval \'1 days\', $2)'
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

  removeLoginAttempt: function(frontcode) {
    const query = 'DELETE FROM core.loginyritys WHERE fronttunnus=$1';
    return connection.queryAll(query, [frontcode]); 
  },


  createEmptyUser: function(name) {
    const query = 'INSERT INTO core.tili (nimi, sposti) VALUES ($1, "") RETURNING id';
    return connection.queryOne(query, [name])
    .then((sqldata) => { return sqldata.id });
  },

  createAccount: function(username, passwordhash, salt, userid) {
    const query = 'INSERT INTO core.login (ktunnus, salasana, salt, tili) VALUES ($1, $2, $3, $4)';
    return connection.queryAll(query, [username, passwordhash, salt, userid]);
  },

  userIdForSession: function(sessionid) {
    const query = 'SELECT tili FROM core.sessio WHERE sessionid=$1 AND vanhenee>NOW()';
    return connection.queryAll(query, [sessionid]);
  }
 

};
