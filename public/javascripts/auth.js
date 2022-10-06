
const crypto = require('crypto');
const sql = require('mysql');

var authsBySession = new Object();

var loginRequestsByCodeChallenge = new Object();

module.exports = {

    createLoginPage: function() {

    },

    startLogin: function(codeChallenge, logintype) {

    },

    login: function(username, password) {

    },

    authenticate: function(authCode) {
        //TODO: Hae oikeat authit serveriltä.
        return new Promise(function(resolve, reject) {
            let sessionId = crypto.randomUUID();
            authsBySession[sessionId] = authCode;
            resolve(json({ idtoken: '', sessionid: sessionId}))
        });
    },

    hasAuth: function(sessionId) {
        return new Promise(function(resolve, reject) {
            if (sessionId in authsBySession) {
                resolve(true);
            } else {
                reject(403);
            }
        });
    }
  
};