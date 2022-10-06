
var mysql = require('mysql');


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

  getAllMessages: function(courseId, userId) {
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

  getMessage: function(messageId) {
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

  getMessageState: function(messageId) {
    return new Promise(function(resolve, reject) {
      const query = '\
      select t.ketju, t.tila, t.aikaleima \
      from KetjunTila t \
      inner join ( \
          select ketju, max(aikaleima) as MaxDate \
          from KetjunTila \
          group by ketju \
      ) tm \
      on t.ketju = tm.ketju and t.aikaleima = tm.MaxDate \
      where t.ketju=?';
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
      const query = 'SELECT * FROM Kommentti WHERE Ketju=? ORDER BY aikaleima';
      con.query(query, [messageId], function (err, rows, fields) {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
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