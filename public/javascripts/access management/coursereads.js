const sql = require('../../../routes/sql.js');

const CourseLists = require('./courselists.js');


class CourseReads extends CourseLists {

  getAllTicketsMadeByUser(userid, courseid) {
    return sql.tickets.getAllMyTickets(courseid, userid)
    .then((ticketdata) => {
      return splicer.insertCourseUserInfoToUserIdReferences(ticketdata, 'aloittaja', courseid);
    });
  };

}

module.exports = CourseReads;
