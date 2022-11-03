const crypto = require('crypto');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const con = connection.getConnection();

module.exports = {
 

  getAllCourses: function() {
    return new Promise(function(resolve, reject) {
      con.query('SELECT id, nimi FROM core.kurssi', function (err, res) {
          if (err) {
              return reject(err);
          }
          resolve(res.rows);
      });
    });
  },

  getCourseInfo: function(courseId) {
    return new Promise(function(resolve, reject) {
      const query = 'SELECT id, nimi FROM core.kurssi WHERE id=$1';
      con.query(query, [courseId], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },


  createCourse: function(name) {
    return new Promise(function(resolve, reject) {
      const query = '\
      INSERT INTO core.kurssi (nimi) \
      VALUES ($1) \
      RETURNING id';
      con.query(query, [name], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows[0].id);
      });
    });
  },

  createTicketBase: function(description, courseid) {
    return new Promise(function(resolve, reject) {
      const query = '\
      INSERT INTO core.tikettipohja (kurssi, kuvaus) \
      VALUES ($1, $2) \
      RETURNING id'
      con.query(query, [courseid, description], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows[0].id);
      });
    });
  },

  getTicketBasesOfCourse: function(courseid) {
    return new Promise(function(resolve, reject) {
      const query = '\
      SELECT id, kuvaus FROM tikettipohja \
      WHERE kurssi=$1';
      con.query(query, [courseid], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  getFieldsOfTicketBase: function(ticketbaseid) {
    return new Promise(function(resolve, reject) {
      const query = '\
      SELECT id, otsikko, pakollinen, esitaytettava FROM tiketinkentat tk \
      INNER JOIN kenttapohja kp \
      ON kp.id=tk.kentta \
      WHERE tk.tikettipohja=$1';
      con.query(query, [ticketbaseid], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  },

  addUserToCourse: function(courseid, userid, isTeacher) {
    return new Promise(function(resolve, reject) {
      const position = isTeacher ? 'opettaja' : 'opiskelija';
      const query = '\
      INSERT INTO core.kurssinosallistujat (kurssi, tili, asema) \
      VALUES ($1, $2, $3)';
      con.query(query, [courseid, userid, position], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve({});
      });
    });
  },

  getUserInfoForCourse(userid, courseid) {
    return new Promise(function(resolve, reject) {
      const query = '\
      SELECT id, nimi, sposti, asema FROM core.kurssinosallistujat ko \
      INNER JOIN core.tili t \
      ON t.id = ko.tili \
      WHERE ko.kurssi=$1 AND t.id=userid';
      con.query(query, [courseid, userid], function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows);
      });
    });
  }

};

