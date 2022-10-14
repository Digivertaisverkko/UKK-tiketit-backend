const crypto = require('crypto');
var mysql = require('mysql');
const { use } = require('.');

module.exports = {

  createLoginUrl: function(loginid, codeChallenge, frontcode) {
    return new Promise(function (resolve, reject) {
      const query = 'INSERT INTO LoginYritys (loginid, codeChallenge, fronttunnus, tili) VALUES (?, ?, ?, NULL)';
      con.query(query, [loginid, codeChallenge, frontcode], function(err, rows, fields) {
        if (err) {
          reject('createLogin: ' + err + ' loginid: ' + loginid);
        }
        resolve('/login?loginid=' + loginid);
      });
    });
  },

  updateLoginAttemptWithAccount: function(loginid, userid) {
    return new Promise( function (resolve, reject) {
      const query = 'UPDATE LoginYritys SET tili=? WHERE loginid=?';
      con.query(query, [userid, loginid], function(err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  getLoginAttemptWithId: function(loginid) {
    return new Promise( function (resolve, reject) {
      const query = 'SELECT * FROM LoginYritys WHERE loginid=?';
      con.query(query, [loginid], function(err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  getLoginAttemptWithAccessCode: function(accessCode) {
    return new Promise( function (resolve, reject) {
      const query = 'SELECT * FROM LoginYritys WHERE fronttunnus=? AND tili IS NOT NULL';
      con.query(query, [accessCode], function(err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  createSession: function(userid) {
    const sessionid = crypto.randomUUID();
    return new Promise( function (resolve, reject) {
      const query = 'INSERT INTO Sessio (sessionid, vanhenee, tili) VALUES (?, NOW()+1, ?)'
      con.query(query, [sessionid, userid], function(err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    }).then(() => {
      const query = 'SELECT * FROM Sessio WHERE sessionid=?';
      return new Promise(function (resolve, reject) {
        con.query(query, [sessionid], function(err, rows, fields) {
          if (err) {
            return reject(err);
          } else if (rows.length == 0) {
            return reject(404);
          }
          resolve(rows);
        });
      });
    });
  },

  getSalt: function(username) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT salt FROM Login WHERE ktunnus=?';
      con.query(query, [username], function(err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  checkUserAccount: function(username, passwordhash) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT * FROM Login WHERE ktunnus=? AND salasana=?';
      con.query(query, [username, passwordhash], function(err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  removeLoginAttempt: function(frontcode) {
    return new Promise(function(resolve, reject) {
      const query = 'DELETE FROM LoginYritys WHERE fronttunnus=?';
      con.query(query, [frontcode], function(err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });  
  },


  createEmptyUser: function() {
    return new Promise(function(resolve, reject) {
      const query = 'INSERT INTO Tili (nimi, sposti) VALUES ("", "")';
      con.query(query, [], function(err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows.insertId);
      });
    });
  },

  createAccount: function(username, passwordhash, salt, userid) {
    return new Promise(function(resolve, reject) {
      const query = 'INSERT INTO Login (ktunnus, salasana, salt, tili) VALUES (?, ?, ?, ?)';
      con.query(query, [username, passwordhash, salt, userid], function(err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },









  getAllCourses: function() {
    return new Promise(function(resolve, reject) {
      con.query('SELECT * FROM Kurssi', function (err, rows, fields) {
          if (err) {
              return reject(err);
          }
          resolve(rows);
      });
    });
  },

  getAllMyTickets: function(courseId, userId) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT * FROM Ketju WHERE aloittaja=? AND kurssi=?';
      con.query(query, [userId, courseId], function (err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  getAllTickets: function(courseId) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT * FROM Ketju WHERE kurssi=?';
      con.query(query, [courseId], function (err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  getTicket: function(messageId) {
    return new Promise(function(resolve, reject) {
      const query = '\
        SELECT * FROM Ketju k \
        INNER JOIN (SELECT ketju, tila FROM KetjunTila WHERE ketju=? ORDER BY aikaleima DESC LIMIT 1) kt \
        ON k.id = kt.ketju \
        WHERE k.id=?';
      con.query(query, [messageId, messageId, messageId], function (err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  getFieldsOfTicket: function(messageId) {
    return new Promise(function(resolve, reject) {
      const query = '\
        SELECT kk.arvo, pohja.otsikko, pohja.tyyppi, pohja.ohje FROM KetjunKentat kk \
        INNER JOIN (SELECT id, otsikko, tyyppi, ohje FROM KenttaPohja) pohja \
        ON kk.kentta = pohja.id \
        WHERE kk.ketju=?';
      con.query(query, [messageId], function (err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },

  getComments: function(messageId) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT viesti, lahettaja, aikaleima FROM Kommentti WHERE Ketju=? ORDER BY aikaleima';
      con.query(query, [messageId], function (err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  },




  createTicket: function(courseid, userid, title) {
    return new Promise(function(resolve, reject) {
      const query = '\
      INSERT INTO Ketju (kurssi, aloittaja, otsikko, aikaleima) \
      VALUES (?, ?, ?, NOW())';
      con.query(query, [courseid, userid, title], function (err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    }).then((rows) => {
      const query = '\
      INSERT INTO KetjunTila (ketju, tila, aikaleima) \
      VALUES (?, 1, NOW())';
      console.log(rows);
      con.query(query, [rows[0].insertId], function (err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      })
    });
  }


};


var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MK;N2wsx",
    database: "dvvukk"
  });


  con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT * FROM Kurssi", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
    });
  });