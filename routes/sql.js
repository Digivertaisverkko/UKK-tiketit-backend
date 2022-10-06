
var mysql = require('mysql');
const { use } = require('.');


module.exports = {


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