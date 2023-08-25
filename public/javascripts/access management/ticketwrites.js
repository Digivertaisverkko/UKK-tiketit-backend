
let TicketReads = require('./ticketreads.js');

let sql = require('../../../routes/sql.js');
const errorcodes = require('./../errorcodes.js');


class TicketWrites extends TicketReads {

  canDeleteTicket(ticketId) {
    return Promise.resolve(true);
  }

  deleteTicket(ticketId) {
    return this.canDeleteTicket(ticketId)
    .then(() => {
      return sql.tickets.deleteTicket(ticketId);
    });
  }

  updateTicket(ticketId, userId, title, content, fieldList) {
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
    })
    .then(() => {
      return sql.tickets.updatePrefilledAnswersFromList(userId, fieldList);
    });
  }

}



module.exports = TicketWrites;