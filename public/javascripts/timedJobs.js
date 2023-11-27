


const { forEach } = require('jszip');
const sql = require('../../routes/sql');
const arrayTools = require('./arrayTools.js');
const auth = require('./auth');
const filessystem = require('./filessystem');
const mailer = require('./mailer');
const TicketState = require('./ticketstate');
const sqlfuncs = require('./sqlfuncs.js');

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

  deleteGdprDumps: function() {
    return filessystem.removeAllGdprDumps();
  },

  deletePendingLtiLogins: function() {
    return sql.users.deleteAllStoredLtiTokens();
  },

  deleteUnusedAttachments: function() {
    return filessystem.removeAllUnusedAttachments();
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
  },

  deleteInactiveUsers: function() {
    return sql.users.getAllInactiveUserIds()
    .then((inactiveIds) => {
      let promise = Promise.resolve();
      inactiveIds.forEach(element => {
        promise.then(() => { return sqlfuncs.removeAllDataRelatedToUser(element.id)})
        .catch((error) => { console.error('Käyttäjän automaattinen poistaminen epäonnistui.');}) //catch, jotta yhden käyttäjän virhe ei estä muita poistumasta.
      });
    })
  }

}




