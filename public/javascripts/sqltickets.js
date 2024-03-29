
const crypto = require('crypto');
const { stat } = require('fs');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const arrayTools = require('./arrayTools.js');
const con = connection.getConnection();
const errorcodes = require('./errorcodes.js');

const TicketState = require('./ticketstate.js');
const { json } = require('express/lib/response.js');
const { forEach } = require('jszip');

module.exports = {


  getPlainTicket: function(ticketid) {
    const query = 'SELECT aloittaja, kurssi, ukk \
    FROM core.tiketti \
    WHERE id=$1';
    return connection.queryOne(query, [ticketid]);
  },

  hasAccess: function(userid, ticketid) {
    let storedData;
    const query = 'SELECT aloittaja, kurssi, ukk \
    FROM core.tiketti \
    WHERE id=$1';
    return connection.queryOne(query, [ticketid])
    .then((data) => {
      storedData = data;
      const query2 = '\
      SELECT profiili, asema FROM core.kurssinosallistujat \
      WHERE kurssi=$1 AND profiili=$2';
      return connection.queryOne(query2, [data.kurssi, userid]);
    })
    .then((courseStatus) => {
      if (courseStatus.asema == 'opettaja' || storedData.aloittaja == userid || storedData.ukk == true) {
        return courseStatus;
      } else {
        return Promise.reject(errorcodes.noPermission)
      }
    })
    .catch(() => Promise.reject(errorcodes.noPermission));
  },

  getAllAttachments: function() {
    const query = 'SELECT * from core.liite';
    return connection.queryAll(query, []);
  },

  getAllMyTickets: function(courseId, userId) {
    const query = 'SELECT id, otsikko, aikaleima, aloittaja  \
    FROM core.tiketti \
    WHERE aloittaja=$1 AND kurssi=$2 AND ukk=FALSE';
    return connection.queryAll(query, [userId, courseId])
    .then((ticketdata) => {
      return module.exports.insertTicketStateToTicketIdReferences(ticketdata, 'id');
    });
  },
  
  getAllTickets: function(courseId) {
    const query = 'SELECT * FROM core.tiketti WHERE kurssi=$1 AND ukk=FALSE';
    return connection.queryAll(query, [courseId])
    .then((ticketdata) => {
      return module.exports.insertTicketStateToTicketIdReferences(ticketdata, 'id');
    });
  },

  getAllTicketsFromList: function(ticketIdList) {
    const query = 'SELECT * FROM core.tiketti WHERE id=ANY($1)';
    return connection.queryAll(query, [ticketIdList]);
  },

  getAllTicketsCreatedBy(userId) {
    const query = 'SELECT * from core.tiketti WHERE aloittaja=$1';
    return connection.queryAll(query, [userId]);
  },

  getFaqTickets: function(courseId) {
    const query = 'SELECT id, otsikko, aikaleima FROM core.tiketti WHERE kurssi=$1 AND ukk=TRUE';
    return connection.queryAll(query, [courseId])
    .then((ticketdata) => {
      return module.exports.insertTicketStateToTicketIdReferences(ticketdata, 'id');
    })
    .then((ticketdata) => {
      return ticketdata.filter(function(value, index, array) {
        return value.tila != TicketState.archived;
      });
    });
  },

  isFaqTicket: function(ticketId) {
    const query = 'SELECT * FROM core.tiketti WHERE id=$1 AND ukk=TRUE';
    return connection.queryOne(query, [ticketId])
    .then((results) => {
      return true;
    })
    .catch((error) => {
      return Promise.resolve(false);
    })
  },

  getTicket: function(ticketId) {
    const query = '\
    SELECT id, otsikko, aikaleima, aloittaja, tila, kurssi, ukk FROM core.tiketti t \
    INNER JOIN (SELECT tiketti, tila FROM core.tiketintila WHERE tiketti=$1 ORDER BY aikaleima DESC LIMIT 1) tt \
    ON t.id = tt.tiketti \
    WHERE t.id=$1';
    return connection.queryOne(query, [ticketId]);
  },

  archiveTicket: function(ticketId) {
    module.exports.setTicketState(ticketId, TicketState.archived);
  },

  archiveTicketList: function(ticketIdList) {
    
  },

  getFieldsOfTicket: function(ticketId) {
    const query = '\
    SELECT pohja.id, kk.arvo, pohja.otsikko, pohja.tyyppi, pohja.ohje, pohja.esitaytettava, pohja.pakollinen, pohja.valinnat FROM core.tiketinkentat kk \
    INNER JOIN core.kenttapohja pohja \
    ON kk.kentta = pohja.id \
    WHERE kk.tiketti=$1';
    return connection.queryAll(query, [ticketId])
    .then((dataList) => {
      for (field of dataList) {
        field.valinnat = field.valinnat.split(';');
      }
      return dataList;
    });
  },

  getFieldsOfTicketList: function(ticketIdList) {
    const query = '\
    SELECT tk.tiketti, tk.arvo, pohja.otsikko, pohja.tyyppi, pohja.ohje FROM core.tiketinkentat tk \
    INNER JOIN (SELECT id, otsikko, tyyppi, ohje FROM core.kenttapohja) pohja \
    ON tk.kentta = pohja.id \
    WHERE tk.tiketti= ANY($1)';
    return connection.queryAll(query, [ticketIdList]);
  },

  getOneFieldOfTicketList: function(ticketIdList, fieldid) {
    const query = '\
    SELECT tk.tiketti, tk.arvo, pohja.otsikko, pohja.tyyppi, pohja.ohje FROM core.tiketinkentat tk \
    INNER JOIN (SELECT id, otsikko, tyyppi, ohje FROM core.kenttapohja) pohja \
    ON tk.kentta = pohja.id \
    WHERE tk.tiketti= ANY($1) AND pohja.id=$2';
    return connection.queryAll(query, [ticketIdList, fieldid]);
  },

  getComments: function(ticketId) {
    const query = 'SELECT id, viesti, lahettaja, aikaleima, tila, muokattu FROM core.kommentti WHERE tiketti=$1 ORDER BY aikaleima';
    return connection.queryAll(query, [ticketId]);
  },

  getCommentsFromTicketList(ticketIdList) {
    const query = 'SELECT * from core.kommentti WHERE tiketti=ANY($1)';
    return connection.queryAll(query, [ticketIdList]);
  },

  getCommentsWithAttachmentsFromTicketList(ticketIdList) {
    const query = 'SELECT * FROM core.kommentti ck \
    INNER JOIN core.liite cl ON ck.id=cl.kommentti \
    WHERE ck.tiketti=ANY($1)';
    return connection.queryAll(query, [ticketIdList]);
  },

  getAllCommentCreatedBy: function(userId) {
    const query = 'SELECT id, tiketti, lahettaja, viesti, aikaleima from core.kommentti WHERE lahettaja=$1';
    return connection.queryAll(query, [userId]);
  },

  getAllTicketsCreatedToCourseYesterday: function(courseId, profileBlackList) {
    //TODO: Toteuta
    const query = 'SELECT * \
    FROM core.tiketti t \
    WHERE t.kurssi=$1 AND t.aikaleima>= NOW() - INTERVAL \'24 hours\' AND NOT t.aloittaja=ANY($2) AND t.ukk=false';
    return connection.queryAll(query, [courseId, profileBlackList]);
  },

  getAllCommentsFromCourseSinceYesterdayWithFaqs: function(courseId, profileBlackList) {
    const query = 'SELECT * \
    FROM core.kommentti k \
    INNER JOIN core.tiketti t \
    ON k.tiketti = t.id \
    WHERE t.kurssi=$1 AND k.aikaleima>= NOW() - INTERVAL \'24 hours\' AND NOT k.lahettaja=ANY($2)';
    return connection.queryAll(query, [courseId, profileBlackList]);
  },

  getComment: function(commentId) {
    const query = 'SELECT id, viesti, lahettaja, aikaleima, tila FROM core.kommentti WHERE id=$1';
    return connection.queryAll(query, [commentId]);
  },

  insertTicketMetadata: function(courseid, userid, title, isFaq=false) {
    const query = '\
    INSERT INTO core.tiketti (kurssi, aloittaja, otsikko, aikaleima, ukk) \
    VALUES ($1, $2, $3, NOW(), $4) \
    RETURNING id';
    return connection.queryOne(query, [courseid, userid, title, isFaq]);
  },

  addFieldToTicket: function(ticketid, userid, fieldid, value) {
    return new Promise(function(resolve, reject) {
      if (ticketid != undefined && fieldid != undefined && value != undefined) {
        const query = '\
        INSERT INTO core.tiketinkentat (tiketti, kentta, arvo) \
        VALUES ($1, $2, $3)';
        connection.queryNone(query, [ticketid, fieldid, value])
        .then(() => resolve())
        .catch((error) => { reject(error); });
      } else {
        reject(errorcodes.wrongParameters);
      }
    });
  },

  getLatestCommentForTicket: function(ticketId) {
    const query = 'SELECT * FROM core.kommentti WHERE tiketti=$1 ORDER BY aikaleima DESC LIMIT 1';
    return connection.queryOne(query, [ticketId]);
  },

  getLatestCommentForEachTicketInList: function(ticketIdList) {
    const query = 'SELECT tiketti, MAX(aikaleima) AS aika FROM core.kommentti WHERE tiketti=ANY($1) GROUP BY tiketti';
    return connection.queryAll(query, [ticketIdList]);
  },

  getLatestCommentForEachTicket: function() {
    const query = 'SELECT tiketti, MAX(aikaleima) AS aika FROM core.kommentti GROUP BY tiketti';
    return connection.queryAll(query);
  },

  getAllStatesFromUnarchivedTickets: function() {
    const query = 'SELECT tt.tiketti, tt.tila FROM core.tiketintila tt \
    INNER JOIN (SELECT tiketti, MAX(aikaleima) AS aikaleima FROM core.tiketintila GROUP BY tiketti) uusimmat \
    ON uusimmat.tiketti = tt.tiketti AND uusimmat.aikaleima = tt.aikaleima \
    WHERE tila!=$1';
    return connection.queryAll(query, [TicketState.archived]);
  },

  getAttachmentListForCommentList: function(commentIdList) {
    const query = '\
    SELECT kommentti, tiedosto, nimi, koko \
    FROM core.liite \
    WHERE kommentti=ANY($1)';
    return connection.queryAll(query, [commentIdList]);
  },

  getAttachmentForComment: function(commentid, fileid) {
    const query = '\
    SELECT kommentti, tiedosto, nimi, koko \
    FROM core.liite \
    WHERE kommentti=$1 AND tiedosto=$2';
    return connection.queryOne(query, [commentid, fileid]);
  },

  addAttachmentToComment: function(commentid, attachmentid, filename, filesize) {
    const query = '\
        INSERT INTO core.liite (kommentti, tiedosto, nimi, koko) \
        VALUES ($1, $2, $3, $4)';
    return connection.queryNone(query, [commentid, attachmentid, filename, filesize]);
  },

  updateTicket(ticketid, title, fieldList) {
    const ticketQuery = 'UPDATE core.tiketti SET otsikko=$1 WHERE id=$2';
    const fieldsQuery = 'UPDATE core.tiketinkentat SET arvo=$1 WHERE kentta=$2 AND tiketti=$3';
    return connection.queryNone(ticketQuery, [title, ticketid])
    .then(() => {
      var promises = []
      for (field of fieldList) {
        promises.push(connection.queryNone(fieldsQuery, [field.arvo, field.id, ticketid]));
      }
      return Promise.all(promises);
    });
  },

  deleteComment(commentId) {
    return module.exports.deleteComments([commentId]);
  },

  deleteComments(commentIdList) {
    const commentQuery    = 'DELETE FROM core.kommentti WHERE id=ANY($1)';
    const attachmentQuery = 'DELETE FROM core.liite WHERE kommentti=ANY($1)';
    
    return connection.queryNone(attachmentQuery, [commentIdList] )
    .then(() => { return connection.queryNone(commentQuery, [commentIdList]) })
    .then(() => { return {} });
  },

  deleteTicket(ticketid) {
    return module.exports.deleteTickets([ticketid]);
  },

  deleteTickets(ticketidList) {
    const fieldQuery = 'DELETE FROM core.tiketinkentat WHERE tiketti=ANY($1)';
    const stateQuery = 'DELETE FROM core.tiketintila WHERE tiketti=ANY($1)';
    const getComments= 'SELECT * FROM core.kommentti WHERE tiketti=ANY($1)';
    const attachmentQuery = 'DELETE FROM core.liite WHERE kommentti=ANY($1)';
    const commentQuery = 'DELETE FROM core.kommentti WHERE tiketti=ANY($1)';
    const ticketQuery = 'DELETE FROM core.tiketti WHERE id=ANY($1)';

    return connection.queryNone(fieldQuery, [ticketidList])
    .then(() => connection.queryNone(stateQuery, [ticketidList]))
    .then(() => connection.queryAll(getComments, [ticketidList]))
    .then((commentList) => {
      let commentIdList = arrayTools.extractAttributes(commentList, 'id');
      return connection.queryNone(attachmentQuery, [commentIdList]);
    })
    .then(() => { return connection.queryNone(commentQuery, [ticketidList]); })
    .then(() => { return connection.queryNone(ticketQuery, [ticketidList]); });
  },

  deleteCommentsFromUser: function(userid) {
    var commentIds;
    const getComments     = 'SELECT * FROM core.kommentti WHERE lahettaja=$1';
    const commentQuery    = 'DELETE FROM core.kommentti WHERE id=ANY($1)';
    const attachmentQuery = 'DELETE FROM core.liite WHERE kommentti=ANY($1)';
    return connection.queryAll(getComments, [userid])
    .then((commentList) => {
      commentIds = arrayTools.extractAttributes(commentList, 'id');
      return connection.queryNone(attachmentQuery, [commentIds]);
    })
    .then(() => {
      return connection.queryNone(commentQuery, [commentIds]);
    });
  },

  deleteTicketsFromUser: function(userid) {
    const query = 'SELECT * FROM core.tiketti WHERE aloittaja=$1';
    return connection.queryAll(query, [userid])
    .then((ticketList) => {
      let ticketIds = arrayTools.extractAttributes(ticketList, 'id');
      return module.exports.deleteTickets(ticketIds);
    })
  },


  insertTicketStateToTicketIdReferences: function(array, idReferenceKey) {
    var ids = arrayTools.extractAttributes(array, idReferenceKey);
    return module.exports.getTicketStates(ids)
    .then((stateData) => {
      return arrayTools.unionExtractKey(array, stateData, idReferenceKey, 'tiketti', 'tila', 'tila');
    });
  },

  insertTicketFieldsToTicketIdReferences: function(array, idReferenceKey) {
    var ids = arrayTools.extractAttributes(array, idReferenceKey);
    return module.exports.getFieldsOfTicketList(ids)
    .then((fieldDataList) => {
      fieldDataList = arrayTools.removeAttributes(fieldDataList, ['tyyppi', 'ohje']);
      return arrayTools.unionNewKeyAsArray(array, fieldDataList, idReferenceKey, 'tiketti', 'kentat');
    });
  },

  insertTimestampsToTicketIdReferences: function(array, idReferenceKey) {
    var ids = arrayTools.extractAttributes(array, idReferenceKey);
    return module.exports.getLatestCommentForEachTicketInList(ids)
    .then((commentList) => {
      return arrayTools.unionExtractKey(array, commentList, idReferenceKey, 'tiketti', 'viimeisin', 'aika');
    })
  },

  insertAttachmentInfoToTicketIdReferences: function(array, idReferenceKey) {

    const query = 'SELECT * FROM core.kommentti ck \
    INNER JOIN core.liite cl ON ck.id=cl.kommentti \
    WHERE ck.tiketti=ANY($1)';

    var ids = arrayTools.extractAttributes(array, idReferenceKey);
    return module.exports.getCommentsWithAttachmentsFromTicketList(ids)
    .then((commentList) => {
      return arrayTools.unionExtractKey(array, commentList, idReferenceKey, 'tiketti', 'liite', 'tiedosto')
    })
    .then((ticketList) => {
      ticketList.forEach((ticket) => {
        if (ticket.liite != undefined) {
          ticket.liite = true;
        } else {
          ticket.liite = false;
        }
      });
      return ticketList;
    });
  },
 
  createComment: function(ticketid, userid, content, state) {
    const query = '\
    INSERT INTO core.kommentti (tiketti, lahettaja, viesti, tila, aikaleima) \
    VALUES ($1, $2, $3, $4, NOW()) \
    RETURNING id';
    return connection.queryOne(query, [ticketid, userid, content, state])
    .then((sqldata) => { return sqldata.id; });
  },

  updateComment: function(commentid, content, state) {
    const query = '\
    UPDATE core.kommentti \
    SET viesti=$1, tila=COALESCE($2, tila), muokattu=NOW() \
    WHERE id=$3';
    return connection.queryNone(query, [content, state, commentid]);
  },

  updatePrefilledAnswer: function(userid, fieldId, value) {
    const query1 = 'SELECT esitaytettava FROM core.kenttapohja WHERE id=$1';
    return connection.queryAll(query1, [fieldId])
    .then((fieldData) => {
      if (fieldData[0].esitaytettava == true) {
        const query2 = '\
        INSERT INTO core.esitaytetytvastaukset (kentta, profiili, arvo) \
        VALUES ($1, $2, $3) \
        ON CONFLICT (kentta, profiili) DO \
        UPDATE SET arvo = excluded.arvo';
        return connection.queryNone(query2, [fieldId, userid, value]);
      }
    })
  },

  updatePrefilledAnswersFromList: function(userid, fieldList) {
    let promises = [];
    fieldList.forEach(field => {
      promises.push(this.updatePrefilledAnswer(userid, field.id, field.arvo));
    });
    return Promise.all(promises);
  },

  getPrefilledAnswer: function(userid, fieldId) {
    const query = 'SELECT kentta, arvo FROM core.esitaytetytvastaukset \
    WHERE kentta=$1 AND profiili=$2';
    return connection.queryOne(query, [fieldId, userid])
    .catch((error) => {
      if (error == errorcodes.noResults) {
        return { kentta: fieldId, arvo: "" };
      } else {
        return Promise.reject(error);
      }
    });
  },

  getPrefilledAnswersFromFieldIdList: function(userid, fieldIdList) {
    let promises = [];
    fieldIdList.forEach(fieldId => {
      promises.push(this.getPrefilledAnswer(userid, fieldId));
    });
    return Promise.all(promises);
  },

  removeAttachmentFromComment: function(attachmentId, commentId) {
    const query = 'DELETE FROM core.liite WHERE kommentti=$1 AND tiedosto=$2';
    return connection.queryNone(query, [commentId, attachmentId]);
  },

  removePrefilledAnswersFromUser: function(userid) {
    const query = 'DELETE FROM core.esitaytetytvastaukset WHERE profiili=$1';
    return connection.queryNone(query, [userid]);
  },

  getTicketStates: function(ticketidList) {
    const query = '\
    SELECT DISTINCT ON (tiketti) tila, tiketti FROM core.tiketintila \
    WHERE tiketti = ANY ($1) \
    ORDER BY tiketti, aikaleima DESC';
    return connection.queryAll(query, [ticketidList]);
  },

  getStateHistoryOfTicket: function(ticketId) {
    const query = '\
    SELECT tila, aikaleima \
    FROM core.tiketintila \
    WHERE tiketti=$1 \
    ORDER BY aikaleima DESC';
    return connection.queryAll(query, [ticketId]);
  },

  setTicketState: function(ticketid, state) {
    const query = '\
    INSERT INTO core.tiketintila (tiketti, tila, aikaleima) \
    VALUES ($1, $2, NOW()) \
    RETURNING tila'
    return connection.queryOne(query, [ticketid, state]);
  },

  setStateToTicketList: function(ticketIdList, state) {
    let promises = [];
    ticketIdList.sort();
    for (ticketIndex in ticketIdList) {
      const query = '\
      INSERT INTO core.tiketintila (tiketti, tila, aikaleima) \
      VALUES ($1, $2, NOW()) \
      RETURNING tiketti';
      
      let promise = connection.queryOne(query, [ticketIdList[ticketIndex], state]);
      promises.push(promise);
    }
    return Promise.all(promises);
  },

  setTicketStateIfAble: function(ticketid, newState) {
    return module.exports.getTicketStates([ticketid])
    .then((stateList) => {
      if (stateList.length == 1) {
        let stateObject = stateList[0];
        let oldState = stateObject.tila;

        if (newState == oldState) {
          return oldState;
        } else if (newState == TicketState.sent) {
          //Päästä läpi
        } else if (newState == TicketState.read) {
          if (oldState != TicketState.sent) {
            return oldState;
          }
        } else if (newState == TicketState.infoneeded) {
          if (oldState != TicketState.read && oldState != TicketState.commented) {
            return oldState;
          }
        } else if (newState == TicketState.commented) {
          if (oldState != TicketState.read) {
            return oldState;
          }
        } else if (newState == TicketState.resolved) {
          if (oldState != TicketState.read && oldState != TicketState.commented && oldState != TicketState.infoneeded) {
            return oldState;
          }
        } else if (newState == TicketState.archived) {
          //Päästä läpi
        } else {
          return oldState;
        }

        return module.exports.setTicketState(ticketid, newState)
        .then((data) => {
          return data.tila;
        });
      }
    });
  }

};

