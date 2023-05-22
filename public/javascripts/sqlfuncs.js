var sql = require('../../routes/sql.js');
var arrayTools = require('./arrayTools.js');
const TicketState = require('./ticketstate.js');


module.exports = {

  removeAllDataRelatedToUser: function(profileid) {
    return sql.tickets.deleteCommentsFromUser(profileid)
    .then(() => {
      return sql.tickets.deleteTicketsFromUser(profileid);
    })
    .then(() => {
      return sql.courses.removeUserFromAllCourses(profileid);
    })
    .then(() => {
      return sql.users.removeSession(profileid);
    })
    .then(() => {
      return sql.users.removeAccount(profileid);
    })
    .then(() => {
      return sql.users.removeProfile(profileid);
    })
  }

}



