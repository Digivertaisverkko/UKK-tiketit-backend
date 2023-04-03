


const sql = require('../../routes/sql');
const arrayTools = require('./arrayTools.js');
const TicketState = require('./ticketstate');

module.exports = {

  archiveOldTickets() {
    return sql.tickets.getLatestCommentForEachTicket()
    .then((ticketList) => {
      const twoWeeks = 1000*60*60*24*4;
      let now = new Date();
      let oldTickets = ticketList.filter(ticket => {
        let time = new Date(ticket.aika);
        return time.getTime() < now - twoWeeks;
      });
      console.dir(oldTickets);
      oldTickets = arrayTools.extractAttributes(oldTickets, 'tiketti');
      return sql.tickets.setStateToTicketList(oldTickets, TicketState.archived);

    });
  }

}




