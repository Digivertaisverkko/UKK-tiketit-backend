
let TicketReads = require('./ticketreads.js');

let sql = require('../../../routes/sql.js');
const errorcodes = require('./../errorcodes.js');


class TicketWrites extends TicketReads {

  canDeleteTicket(ticketId) {
    return sql.tickets.getComments(ticketId)
    .then((commentList) => {
      if (commentList.length > 1) {
        return Promise.reject(errorcodes.operationNotPossible);
      } else {
        return Promise.resolve(true);
      }
    });
  }

  deleteTicket(ticketId) {
    return this.canDeleteTicket(ticketId)
    .then(() => {
      return sql.tickets.deleteTicket(ticketId);
    });
  }

  updateTicket(ticketId, title, content, fieldList) {
    return sql.tickets.updateTicket(ticketId, title, fieldList)
    .then(() => {
      if (content) {
        return sql.tickets.getComments(ticketId)
        .then((commentList) => {
          commentList.sort(function(a,b) { a.aikaleima - b.aikaleima });
          let firstComment = commentList[0];
          return sql.tickets.updateComment(firstComment.id, content);
        });
      }
    });
  }

}



module.exports = TicketWrites;