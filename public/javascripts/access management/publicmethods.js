
const sql = require('../../../routes/sql.js');
const { getFaqTickets } = require('../sqltickets.js');
const splicer = require('../sqlsplicer.js');
const errorcodes = require('../errorcodes.js');



class PublicMethods {
  getCourseInfo(courseId) {
    return sql.courses.getCourseInfo(courseId);
  }

  getFaqTickets(courseId) {
    return sql.tickets.getFaqTickets(courseId)
    .then((ticketData) => {
      return splicer.insertTicketFieldsToIdReferences(ticketData, 'id')
    })
  }

  getInvitation(invitationId, courseId) {
    return sql.users.getUserInvitation(invitationId)
    .then((data) => {
      console.log(data.kurssi + ' ;; ' + courseId);
      if (data.kurssi == courseId) {
        return data;
      } else {
        return Promise.reject(errorcodes.noResults);
      }
    })
  }
}

module.exports = PublicMethods;