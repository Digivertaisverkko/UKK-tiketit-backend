
var sql = require('../../routes/sql.js');
var arrayTools = require('./arrayTools.js');
const TicketState = require('./ticketstate.js');


module.exports = {

  insertCourseUserInfoToUserIdReferences: function(array, idReferenceKey, courseid) {
      var ids = arrayTools.extractAttributes(array, idReferenceKey);
      return sql.courses.getUserInfoListForCourse(ids, courseid)
      .then((userdata) => {
        return arrayTools.unionReplaceKey(array, userdata, idReferenceKey, 'id');
      });
  },

  insertTicketFieldsToIdReferences: function(ticketArray, idReferenceKey) {
    var ids = arrayTools.extractAttributes(ticketArray, idReferenceKey);
    return sql.tickets.getFieldsOfTicketList(ids)
    .then((fields) => {
      return arrayTools.unionNewKeyAsArray(ticketArray, fields, 'id', 'tiketti', 'kentat');
    });
  },

  removeArchivedTickets: function(ticketArray) {
    return ticketArray.filter(function(value, index, array) {
      return value.tila !== TicketState.archived;
    });
  },

  removeUnarchivedTickets: function(ticketArray) {
    return ticketArray.filter(function(value, index, array) {
      return value.tila === TicketState.archived;
    });
  }

}