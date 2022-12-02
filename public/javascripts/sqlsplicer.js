
var sql = require('../../routes/sql.js');
const { arrayUnionByAddingPartsOfObjects } = require('./arrayTools.js');
var arrayTools = require('./arrayTools.js');


module.exports = {

  insertCourseUserInfoToUserIdReferences: function(array, idReferenceKey, courseid) {
      var ids = arrayTools.extractAttributes(array, idReferenceKey);
      return sql.courses.getUserInfoListForCourse(ids, courseid)
      .then((userdata) => {
        return arrayTools.arrayUnionWithKeys(array, userdata, idReferenceKey, 'id');
      });
  },

  insertTicketFieldsToIdReferences: function(ticketArray, idReferenceKey) {
    var ids = arrayTools.extractAttributes(ticketArray, idReferenceKey);
    return sql.tickets.getOneFieldOfTicketList(ids, 2)
    .then((fields) => {
      return arrayUnionByAddingPartsOfObjects(ticketArray, fields, idReferenceKey, 'tiketti', 'tyyppi', 'arvo');
    });
  }

}