
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
    console.log(0);
    return sql.tickets.updateTicket(ticketId, title, fieldList)
    .then(() => {
      console.log(3);
      if (content) {
        console.log(4);
        return sql.tickets.getComments(ticketId)
        .then((commentList) => {
          console.log(5);
          commentList.sort(function(a,b) { a.aikaleima - b.aikaleima });
          let firstComment = commentList[0];
          console.log(6);
          return sql.tickets.updateComment(firstComment.id, content);
        });
      }
    });
  }

}



module.exports = TicketWrites;