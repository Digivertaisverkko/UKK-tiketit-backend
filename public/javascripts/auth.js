
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
        }).then((data) => {
            return {'login-url': data};
        });
    },

    login: function(username, password, loginid) {
        return new Promise(function(resolve, reject) {
            sql.getSalt(username).then((saltData) => {
                if (saltData.length === 1) {
                    let hash = module.exports.hash(password, saltData[0].salt);
                    sql.checkUserAccount(username, hash).then((accountData) => {
                        if (accountData.length === 1) {
                            sql.updateLoginAttemptWithAccount(loginid, accountData[0].tili).then((updateData) => {
                                sql.getLoginAttemptWithId(loginid).then((attemptData) => {
                                    if (attemptData.length === 1) {
                                        resolve({success: true, 'login-code': attemptData[0].fronttunnus});
                                    } else {
                                        reject(403);
                                    }
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
                if (loginData.length > 0) {
                    sql.createSession(loginData[0].tili).then((sessionData) => {
                        resolve(sessionData);
                    });
                } else {
                    reject(403);
                }
            });
        });
    },

    createAccount: function(username, password) {
        return sql.createEmptyUser()
        .then((newuserId) => {
            let salt = crypto.randomBytes(8).toString('hex');
            let hash = module.exports.hash(password, salt);
            return sql.createAccount(username, hash, salt, newuserId);
        });
    },

    hash: function(hashable, salt) {
        return crypto.createHash('sha256').update(hashable).update(salt).digest('hex');
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