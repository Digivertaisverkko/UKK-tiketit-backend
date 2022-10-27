const crypto = require('crypto');
const { Pool, Client } = require('pg');

module.exports = {

  createLoginUrl: function(loginid, codeChallenge, frontcode) {
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
    return new Promise( function (resolve, reject) {
      const query = 'UPDATE core.loginyritys SET tili=$1 WHERE loginid=$2';
      con.query(query, [userid, loginid], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  getLoginAttemptWithId: function(loginid) {
    return new Promise( function (resolve, reject) {
      const query = 'SELECT * FROM core.loginyritys WHERE loginid=$1';
      con.query(query, [loginid], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  getLoginAttemptWithAccessCode: function(accessCode) {
    return new Promise( function (resolve, reject) {
      const query = 'SELECT * FROM core.loginyritys WHERE fronttunnus=$1 AND tili IS NOT NULL';
      con.query(query, [accessCode], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  createSession: function(userid) {
    const sessionid = crypto.randomUUID();
    return new Promise( function (resolve, reject) {
      const query = 'INSERT INTO core.sessio (sessionid, vanhenee, tili) VALUES ($1, NOW()+interval \'1 days\', $2)'
      con.query(query, [sessionid, userid], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    }).then(() => {
      const query = 'SELECT * FROM core.sessio WHERE sessionid=$1';
      return new Promise(function (resolve, reject) {
        con.query(query, [sessionid], function(err, res) {
          if (err) {
            return reject(err);
          } else if (res.rows.length == 0) {
            return reject(404);
          }
          resolve(res.rows);
        });
      });
    });
  },

  getSalt: function(username) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT salt FROM core.login WHERE ktunnus=$1';
      con.query(query, [username], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  checkUserAccount: function(username, passwordhash) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT * FROM core.login WHERE ktunnus=$1 AND salasana=$2';
      con.query(query, [username, passwordhash], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  removeLoginAttempt: function(frontcode) {
    return new Promise(function(resolve, reject) {
      const query = 'DELETE FROM core.loginyritys WHERE fronttunnus=$1';
      con.query(query, [frontcode], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });  
  },


  createEmptyUser: function() {
    return new Promise(function(resolve, reject) {
      const query = 'INSERT INTO core.tili (nimi, sposti) VALUES ("", "")';
      con.query(query, [], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.insertId);
      });
    });
  },

  createAccount: function(username, passwordhash, salt, userid) {
    return new Promise(function(resolve, reject) {
      const query = 'INSERT INTO core.login (ktunnus, salasana, salt, tili) VALUES ($1, $2, $3, $4)';
      con.query(query, [username, passwordhash, salt, userid], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },









  getAllCourses: function() {
    return new Promise(function(resolve, reject) {
      con.query('SELECT * FROM core.kurssi', function (err, res) {
          if (err) {
              return reject(err);
          }
          resolve(res.rows);
      });
    });
  },

  getAllMyTickets: function(courseId, userId) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT * FROM core.ketju WHERE aloittaja=$1 AND kurssi=$2';
      con.query(query, [userId, courseId], function (err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  getAllTickets: function(courseId) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT * FROM core.ketju WHERE kurssi=$1';
      con.query(query, [courseId], function (err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  getTicket: function(messageId) {
    return new Promise(function(resolve, reject) {
      const query = '\
        SELECT * FROM Ketju k \
        INNER JOIN (SELECT ketju, tila FROM core.ketjuntila WHERE ketju=$1 ORDER BY aikaleima DESC LIMIT 1) kt \
        ON k.id = kt.ketju \
        WHERE k.id=$1';
      con.query(query, [messageId], function (err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  getFieldsOfTicket: function(messageId) {
    return new Promise(function(resolve, reject) {
      const query = '\
        SELECT kk.arvo, pohja.otsikko, pohja.tyyppi, pohja.ohje FROM core.ketjunkentat kk \
        INNER JOIN (SELECT id, otsikko, tyyppi, ohje FROM core.kenttapohja) pohja \
        ON kk.kentta = pohja.id \
        WHERE kk.ketju=$1';
      con.query(query, [messageId], function (err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  getComments: function(messageId) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT viesti, lahettaja, aikaleima FROM core.kommentti WHERE ketju=$1 ORDER BY aikaleima';
      con.query(query, [messageId], function (err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },




  createTicket: function(courseid, userid, title) {
    return new Promise(function(resolve, reject) {
      const query = '\
      INSERT INTO core.ketju (kurssi, aloittaja, otsikko, aikaleima) \
      VALUES ($1, $2, $3, NOW())';
      con.query(query, [courseid, userid, title], function (err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    }).then((rows) => {
      const query = '\
      INSERT INTO core.ketjuntila (ketju, tila, aikaleima) \
      VALUES ($1, 1, NOW())';
      console.log(rows);
      con.query(query, [rows[0].insertId], function (err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      })
    });
  }

};


const con = new Pool();

con.query('SELECT NOW()', (err, res) => {
  console.log(err, res);
  //con.end();
});
