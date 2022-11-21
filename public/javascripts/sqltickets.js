const crypto = require('crypto');
const { stat } = require('fs');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const arrayTools = require('./arrayTools.js');
const con = connection.getConnection();

module.exports = {
 
  hasAccess: function(userid, ticketid) {
    const query = 'SELECT aloittaja, kurssi \
    FROM core.tiketti \
    WHERE id=$1';
      return connection.queryOne(query, [ticketid])
      .then((data) => {
        if (data.aloittaja == userid) {
            return Promise.resolve(data.aloittaja);
        } else {
            //Kurssin opettajillakin pitäisi olla oikeus lukea tikettejä.
            const query2 = '\
            SELECT profiili FROM core.kurssinosallistujat \
            WHERE kurssi=$1 AND asema=$2 AND profiili=$3';
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
      FROM core.tiketti \
      WHERE aloittaja=$1 AND kurssi=$2';
      return connection.queryAll(query, [userId, courseId])
      .then((ticketdata) => {
        return module.exports.insertTicketStateToTicketIdReferences(ticketdata, 'id');
      });
    },
  
  getAllTickets: function(courseId) {
    const query = 'SELECT * FROM core.tiketti WHERE kurssi=$1';
    return connection.queryAll(query, [courseId])
    .then((ticketdata) => {
      return module.exports.insertTicketStateToTicketIdReferences(ticketdata, 'id');
    });
  },

  getTicket: function(messageId) {
    const query = '\
    SELECT id, otsikko, aikaleima, aloittaja, tila, kurssi FROM core.tiketti t \
    INNER JOIN (SELECT tiketti, tila FROM core.tiketintila WHERE tiketti=$1 ORDER BY aikaleima DESC LIMIT 1) tt \
    ON t.id = tt.tiketti \
    WHERE t.id=$1';
    return connection.queryOne(query, [messageId]);
  },

  getFieldsOfTicket: function(messageId) {
    const query = '\
    SELECT kk.arvo, pohja.otsikko, pohja.tyyppi, pohja.ohje FROM core.tiketinkentat kk \
    INNER JOIN (SELECT id, otsikko, tyyppi, ohje FROM core.kenttapohja) pohja \
    ON kk.kentta = pohja.id \
    WHERE kk.tiketti=$1';
    return connection.queryAll(query, [messageId]);
  },

  getComments: function(messageId) {
    const query = 'SELECT viesti, lahettaja, aikaleima FROM core.kommentti WHERE tiketti=$1 ORDER BY aikaleima';
    return connection.queryAll(query, [messageId]);
  },



  createTicket: function(courseid, userid, title) {
    const query = '\
    INSERT INTO core.tiketti (kurssi, aloittaja, otsikko, aikaleima) \
    VALUES ($1, $2, $3, NOW()) \
    RETURNING id';
    return connection.queryOne(query, [courseid, userid, title])
    .then((sqldata) => { return sqldata.id })
    .then((ticketid) => {
        const query = '\
        INSERT INTO core.tiketintila (tiketti, tila, aikaleima) \
        VALUES ($1, 1, NOW())';
        return connection.queryAll(query, [ticketid])
        .then((sqldata) => { return ticketid; });
    });
  },

  addFieldToTicket: function(ticketid, fieldid, value) {
    return new Promise(function(resolve, reject) {
      if (ticketid != undefined && fieldid != undefined && value != undefined) {
        const query = '\
        INSERT INTO core.tiketinkentat (tiketti, kentta, arvo) \
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
        var state = stateData.find((stateElement) => stateElement.tiketti===element[idReferenceKey]);
        if (state != undefined) {
          element.tila = state.tila;
        }          
      });
      return array;
    });
  },

  createComment: function(ticketid, userid, content) {
    const query = '\
    INSERT INTO core.kommentti (tiketti, lahettaja, viesti, aikaleima) \
    VALUES ($1, $2, $3, NOW()) \
    RETURNING id';
    return connection.queryOne(query, [ticketid, userid, content])
    .then((sqldata) => { return sqldata.id; });
  },

  getTicketStates: function(ticketidList) {
    const query = '\
    SELECT DISTINCT ON (tiketti) tila, tiketti FROM core.tiketintila \
    WHERE tiketti = ANY ($1) \
    ORDER BY tiketti, aikaleima DESC';
    return connection.queryAll(query, [ticketidList]);
  },

  setTicketState: function(ticketid, state) {
    const query = '\
    INSERT INTO core.tiketintila (tiketti, tila, aikaleima) \
    VALUES ($1, $2, NOW()) \
    RETURNING id'
    return connection.queryOne(query, [ticketid, state]);
  },

  setTicketStateIfAble: function(ticketid, newState) {
    module.exports.getTicketStates([ticketid])
    .then((stateList) => {
      if (stateList.length == 1) {
        let stateObject = stateList[0];
        let oldState = stateObject.tila;

        if (newState == oldState) {
          return;
        } else if (newState == 1) {
          if (oldState == 2) {
            return;
          }
        } else if (newState == 2) {
          if (oldState != 1) {
            return;
          }
        } else if (newState == 3 || newState == 4 || newState == 5) {
          if (oldState != 2) {
            return;
          }
        } else if (newState == 6) {
          if (oldState == 1 || oldState == 2) {
            return;
          }
        } else {
          return;
        }

        return module.exports.setTicketState(ticketid, newState);
      }
    });
  }

};

