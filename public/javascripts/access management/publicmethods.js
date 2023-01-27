
const sql = require('../../../routes/sql.js');
const { getFaqTickets } = require('../sqltickets.js');
const splicer = require('../sqlsplicer.js');



class PublicMethods {
  courseInfo(courseId) {
    return sql.courses.getCourseInfo(courseId);
  }

  getFaqTickets(courseId) {
    return sql.tickets.getFaqTickets(courseId)
    .then((ticketData) => {
      return splicer.insertTicketFieldsToIdReferences(ticketData, 'id')
    })
  }
}

module.exports = PublicMethods;