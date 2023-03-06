
let TicketReads = require('./ticketreads.js');

let sql = require('../../../routes/sql.js');


class TicketWrites extends TicketReads {

  deleteTicket(ticketId) {
    return this.canDeleteTicket(ticketId)
    .then(() => {
      return sql.tickets.deleteTicket(ticketId);
    });
  }

  canDeleteTicket(ticketId) {
    return sql.tickets.getComments(ticketId)
    .then((commentList) => {
      if (commentList.length > 1) {
        return Promise.reject(3001);
      } else {
        return Promise.resolve(true);
      }
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