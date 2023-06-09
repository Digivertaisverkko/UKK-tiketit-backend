


const sql = require('../../routes/sql');
const arrayTools = require('./arrayTools.js');
const auth = require('./auth');
const mailer = require('./mailer');
const TicketState = require('./ticketstate');

module.exports = {

  archiveOldTickets: function() {
    return sql.tickets.getAllStatesFromUnarchivedTickets()
    .then((ticketStates) => {
      let ids = arrayTools.extractAttributes(ticketStates, 'tiketti');
      return sql.tickets.getAllTicketsFromList(ids);
    })
    .then((ticketDataList) => {
      return ticketDataList.filter((value, index, array) => {
        return value.ukk == false;
      })
    })
    .then((ticketStates) => {
      let ids = arrayTools.extractAttributes(ticketStates, 'id');
      return sql.tickets.getLatestCommentForEachTicketInList(ids);
    })
    .then((ticketList) => {
      const twoWeeks = 1000*60*60*24*30;
      let now = new Date();
      let oldTickets = ticketList.filter(ticket => {
        let time = new Date(ticket.aika);
        return time.getTime() < now - twoWeeks;
      });
      oldTickets = arrayTools.extractAttributes(oldTickets, 'tiketti');
      return sql.tickets.setStateToTicketList(oldTickets, TicketState.archived);

    });
  },

  deletePendingLtiLogins: function() {
    return sql.users.deleteAllStoredLtiTokens();
  },

  refreshCookieSecrets: function() {
    return auth.createNewCookieSecret()
    .then(() => {
      return auth.getAcceptedCookieSecrets();
    })
    .then((secretsData) => {
      return arrayTools.extractAttributes(secretsData, 'salaisuus');
    });
  },

  sendAggregateEmails: function() {
    return mailer.sendAggregateMails();
  }

}




