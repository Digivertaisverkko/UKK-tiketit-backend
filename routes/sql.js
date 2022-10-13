var mysql = require('mysql');
const { use } = require('.');

module.exports = {

  createLoginUrl: function(loginid, codeChallenge, frontcode) {
    return new Promise(function (resolve, reject) {
      const query = 'INSERT INTO LoginYritys (loginid, codeChallenge, fronttunnus) VALUES (?, ?, ?)';
      con.query(query, [loginid, codeChallenge, frontcode], function(err, rows, fields) {
        if (err) {
          return reject(err);
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

  createAccount: function(username, passwordhash, salt) {
    return new Promise(function(resolve, reject) {
      const query = 'INSERT INTO Login (ktunnus, salasana, salt) VALUES (?, ?, ?)';
      con.query(query, [username, passwordhash, salt], function(err, rows, fields) {
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