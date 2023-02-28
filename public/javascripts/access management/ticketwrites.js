
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

}



module.exports = TicketWrites;