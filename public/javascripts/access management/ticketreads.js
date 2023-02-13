const TicketState = require("../ticketstate");

const sql = require('../../../routes/sql.js');
const splicer = require('../sqlsplicer.js');
const arrayTools = require("../arrayTools");



class TicketReads {

  addComment(ticketId, creatorId, content, wantedState) {
    return sql.tickets.getTicket(ticketId)
    .then((ticketdata) => {
      if (ticketdata.ukk == true) {
        return Promise.reject(3001);
      }
      return sql.courses.getUserInfoForCourse(creatorId, ticketdata.kurssi);
    })
    .then((userinfo) => {
      if (userinfo.asema == 'opettaja') {
        let state = wantedState || TicketState.commented;
        return sql.tickets.setTicketStateIfAble(ticketId, state);
      } else if (userinfo.asema == 'opiskelija') {
        return sql.tickets.setTicketStateIfAble(ticketId, 1);
      } else {
        return Promise.reject(userinfo.asema);
      }
    })
    .then((newTicketState) => {
      return sql.tickets.createComment(ticketId, creatorId, content, wantedState);
    })

  }

  getTicketMetadata(ticketId) {
    return sql.tickets.getTicket(ticketId)
    .then((ticketdata) => {
      return splicer.insertCourseUserInfoToUserIdReferences([ticketdata], 'aloittaja', ticketdata.kurssi)
    })
    .then((ticketdataList) => {
      return sql.tickets.getAttachmentsForTicket(ticketId)
      .then((attachments) => {
        ticketdataList[0].liitteet = attachments;
        return ticketdataList;
      });
    });
  }

  getComments(ticketId) {
    let storedCourseId;
    return sql.tickets.getTicket(ticketId)
    .then((ticket) => {
      storedCourseId = ticket.kurssi;
      return sql.tickets.getComments(ticketId);
    })
    .then((comments) => {
      return splicer.insertCourseUserInfoToUserIdReferences(comments, 'lahettaja', storedCourseId);
    });
  }

  getFields(ticketId) {
    return sql.tickets.getFieldsOfTicket(ticketId);
  }

}



module.exports = TicketReads;