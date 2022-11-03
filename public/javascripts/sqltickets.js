const crypto = require('crypto');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const con = connection.getConnection();

module.exports = {
 
    getAllMyTickets: function(courseId, userId) {
        return new Promise(function(resolve, reject) {
          const query = 'SELECT id, otsikko, aikaleima, aloittaja FROM core.ketju WHERE aloittaja=$1 AND kurssi=$2';
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
            SELECT id, otsikko, aikaleima, aloittaja, tila FROM Ketju k \
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
      VALUES ($1, $2, $3, NOW()) \
      RETURNING id';
      con.query(query, [courseid, userid, title], function (err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res.rows[0].id);
      });
    }).then((ticketid) => {
      return new Promise(function(resolve, reject) {
        const query = '\
        INSERT INTO core.ketjuntila (ketju, tila, aikaleima) \
        VALUES ($1, 1, NOW())';
        con.query(query, [ticketid], function (err, res) {
          if (err) {
            return reject(err);
          }
          resolve(ticketid);
        });
      });
    });
  },

  addFieldToTicket: function(ticketid, fieldid, value) {
    return new Promise(function(resolve, reject) {
      if (ticketid != undefined && fieldid != undefined && value != undefined) {
        const query = '\
        INSERT INTO core.ketjunkentat (ketju, kentta, arvo) \
        VALUES ($1, $2, $3)';
        con.query(query, [ticketid, fieldid, value], function (err, res) {
          if (err) {
            return reject(err);
          }
          resolve({});
        });
      } else {
        reject(300);
      }
    });
  },

  createComment: function(ticketid, userid, content) {
      return new Promise(function(resolve, reject) {
        const query = '\
        INSERT INTO core.kommentti (ketju, lahettaja, viesti, aikaleima) \
        VALUES ($1, $2, $3, NOW()) \
        RETURNING id';
        con.query(query, [ticketid, userid, content], function(err, res) {
          if (err) {
            return reject(err);
          }
          resolve(res.rows[0].id);
        });
      });
  }

};

