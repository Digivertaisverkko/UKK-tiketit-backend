
const crypto = require('crypto');
const sql = require('../../routes/sql');

var authsBySession = new Object();
var sessionsByLogin = new Object();

module.exports = {

    startLogin: function(codeChallenge, logintype) {
        return new Promise(function(resolve, reject) {
            if (logintype === 'own') {
                let loginid = crypto.randomUUID();
                let fronttunnus = crypto.randomUUID();
                resolve({cc: codeChallenge, lid: loginid, fcode: fronttunnus})
            } else {
                reject(500);
            }
        }).then((data) => {
            return sql.createLoginUrl(data.lid, data.cc, data.fcode);
        });
    },

    login: function(username, password, loginid) {
        return new Promise(function(resolve, reject) {
            sql.getSalt(username).then((saltData) => {
                if (saltData.length === 1) {
                    let hash = crypto.createHash('sha256', password).update(saltData[0].salt).digest('hex');
                    sql.checkUserAccount(username, hash).then((accountData) => {
                        if (accountData.length === 1) {
                            sql.updateLoginAttemptWithAccount(loginid, accountData[0].tili).then((updateData) => {
                                sql.getLoginAttemptWithId(loginid).then((attemptData) => {
                                    resolve({success: true, 'login-code': attemptData[0].fronttunnus});
                                });
                            });
                        } else {
                            reject(403)
                        }
                    });
                } else {
                    reject(500);
                }
            });
        });
    },

    requestAccess: function(accessCode, codeVerify) {
        return new Promise(function(resolve, reject) {
            sql.getLoginAttemptWithAccessCode(accessCode).then((loginData) => {
                if (loginData != null) {
                    sql.createSessio(data.tili).then((sessionData) => {
                        resolve(sessionData);
                    });
                } else {
                    reject();
                }
            });
        });
    },

    createSession: function(accessCode) {
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