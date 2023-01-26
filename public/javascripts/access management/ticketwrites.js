
let TicketReads = require('./ticketreads.js');

let sql = require('../../../routes/sql.js');


class TicketWrites extends TicketReads {

  archiveFaqTicket(ticketid) {
    return sql.tickets.isFaqTicket(ticketid)
    .then((isFaq) => {
      if (isFaq === true) {
        sql.tickets.archiveTicket(ticketid);
      } else {
        return Promise.reject(3000);
      }
    })
  }

}



module.exports = TicketWrites;