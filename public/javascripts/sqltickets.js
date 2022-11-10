const crypto = require('crypto');
const { stat } = require('fs');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const arrayTools = require('./arrayTools.js');
const con = connection.getConnection();

module.exports = {
 
  hasAccess: function(userid, ticketid) {
      const query = 'SELECT aloittaja, kurssi \
      FROM core.ketju \
      WHERE id=$1';
      return connection.queryOne(query, [ticketid])
      .then((data) => {
          if (data.aloittaja == userid) {
              return Promise.resolve(data.aloittaja);
          } else {
              //Kurssin opettajillakin pitäisi olla oikeus lukea tikettejä.
              const query2 = '\
              SELECT tili FROM core.kurssinosallistujat \
              WHERE kurssi=$1 AND asema=$2 AND tili=$3';
              return connection.queryOne(query2, [data.kurssi, 'opettaja', userid])
              .then(() => { 
                return userid;
                });
          }
      })
      .catch(() => Promise.reject(103));
  },

  getAllMyTickets: function(courseId, userId) {
      const query = 'SELECT id, otsikko, aikaleima, aloittaja  \
      FROM core.ketju \
      WHERE aloittaja=$1 AND kurssi=$2';
      return connection.queryAll(query, [userId, courseId])
      .then((ticketdata) => {
        return module.exports.insertTicketStateToTicketIdReferences(ticketdata, 'id');
      });
    },
  
  getAllTickets: function(courseId) {
    const query = 'SELECT * FROM core.ketju WHERE kurssi=$1';
    return connection.queryAll(query, [courseId])
    .then((ticketdata) => {
      return module.exports.insertTicketStateToTicketIdReferences(ticketdata, 'id');
    });
  },

  getTicket: function(messageId) {
    const query = '\
    SELECT id, otsikko, aikaleima, aloittaja, tila, kurssi FROM core.ketju k \
    INNER JOIN (SELECT ketju, tila FROM core.ketjuntila WHERE ketju=$1 ORDER BY aikaleima DESC LIMIT 1) kt \
    ON k.id = kt.ketju \
    WHERE k.id=$1';
    return connection.queryOne(query, [messageId]);
  },

  getFieldsOfTicket: function(messageId) {
    const query = '\
    SELECT kk.arvo, pohja.otsikko, pohja.tyyppi, pohja.ohje FROM core.ketjunkentat kk \
    INNER JOIN (SELECT id, otsikko, tyyppi, ohje FROM core.kenttapohja) pohja \
    ON kk.kentta = pohja.id \
    WHERE kk.ketju=$1';
    return connection.queryAll(query, [messageId]);
  },

  getComments: function(messageId) {
    const query = 'SELECT viesti, lahettaja, aikaleima FROM core.kommentti WHERE ketju=$1 ORDER BY aikaleima';
    return connection.queryAll(query, [messageId]);
  },



  createTicket: function(courseid, userid, title) {
    const query = '\
    INSERT INTO core.ketju (kurssi, aloittaja, otsikko, aikaleima) \
    VALUES ($1, $2, $3, NOW()) \
    RETURNING id';
    return connection.queryOne(query, [courseid, userid, title])
    .then((sqldata) => { return sqldata.id })
    .then((ticketid) => {
        const query = '\
        INSERT INTO core.ketjuntila (ketju, tila, aikaleima) \
        VALUES ($1, 1, NOW())';
        return connection.queryAll(query, [ticketid])
        .then((sqldata) => { return ticketid; });
    });
  },

  addFieldToTicket: function(ticketid, fieldid, value) {
    return new Promise(function(resolve, reject) {
      if (ticketid != undefined && fieldid != undefined && value != undefined) {
        const query = '\
        INSERT INTO core.ketjunkentat (ketju, kentta, arvo) \
        VALUES ($1, $2, $3)';
        connection.queryNone(query, [ticketid, fieldid, value])
        .then(() => resolve())
        .catch((error) => { reject(error); });
      } else {
        reject(300);
      }
    });
  },

  insertTicketStateToTicketIdReferences: function(array, idReferenceKey) {
    var ids = arrayTools.extractAttributes(array, idReferenceKey);
    return module.exports.getTicketStates(ids)
    .then((stateData) => {
      array.forEach(element => {
        var state = stateData.find((stateElement) => stateElement.ketju===element[idReferenceKey]);
        if (state != undefined) {
          element.tila = state.tila;
        }          
      });
      return array;
    });
  },

  createComment: function(ticketid, userid, content) {
    const query = '\
    INSERT INTO core.kommentti (ketju, lahettaja, viesti, aikaleima) \
    VALUES ($1, $2, $3, NOW()) \
    RETURNING id';
    return connection.queryOne(query, [ticketid, userid, content])
    .then((sqldata) => { return sqldata.id; });
  },

  getTicketStates: function(ticketidList) {
    const query = '\
    SELECT DISTINCT ON (ketju) tila, ketju FROM core.ketjuntila \
    WHERE ketju = ANY ($1) \
    ORDER BY ketju, aikaleima DESC';
    return connection.queryAll(query, [ticketidList]);
  }

};

