
const crypto = require('crypto');
const sql = require('mysql');

var authsBySession = new Object();
var sessionsByLogin = new Object();

module.exports = {

    sqlLoginStart: function(codeChallenge) {
        return new Promise(function(resolve, reject) {
            let loginid = crypto.randomUUID();
            let fronttunnus = crypto.randomUUID();
            sql.createLoginUrl(loginid, codeChallenge, fronttunnus).then((data) => {
                resolve(data);
            });
        });
    },

    startLogin: function(codeChallenge, logintype) {
        return new Promise(function(resolve, reject) {
            if (logintype == 'own') {
                return sqlLoginStart(codeChallenge).then((data) => {resolve(data)});
            }
        });        
    },

    login: function(username, password, loginid) {
        return new Promise(function(resolve, reject) {
            sql.getSalt(username).then((saltData) => {

                let hash = crypto.createHash('sha256', password).update(salt).digest('hex');

                sql.checkUserAccount(username, hash).then((accountData) => {
                    if (data2 != null) {
                        sql.updateLoginAttemptWithAccount(loginid, accountData.tili).then((updateData) => {
                            sql.getLoginAttemptWithId(loginid).then((attemptData) => {
                                resolve(json({success: true, 'login-code': attemptData.fronttunnus}));
                            });
                        });
                    }
                });
            });
        });
    },

    createSession: function(authCode) {
        //TODO: Hae oikeat authit serveriltä.
        return new Promise(function(resolve, reject) {
            let sessionId = crypto.randomUUID();
            authsBySession[sessionId] = authCode;
            resolve(json({ idtoken: '', sessionid: sessionId}))
        });
    },

    createAccount: function(username, passwork) {

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