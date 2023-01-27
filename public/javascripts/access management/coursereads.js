const sql = require('../../../routes/sql.js');

const CourseLists = require('./courselists.js');

const splicer = require('../sqlsplicer.js');


class CourseReads extends CourseLists {

  getAllTicketsMadeByUser(userid, courseid) {
    return sql.tickets.getAllMyTickets(courseid, userid)
    .then((ticketdata) => {
      return splicer.insertCourseUserInfoToUserIdReferences(ticketdata, 'aloittaja', courseid);
    })
    .then((data) => {
      if (data.length === 0) {
        return Promise.reject(2000);
      } else {
        return data;
      }
    });
  };

  getAllTicketsVisibleToUser(userid, courseid) {
    return sql.courses.getUserInfoForCourse(userid, courseid)
    .then((userdata) => {
      if (userdata != undefined && userdata.asema === 'opettaja') {
        return sql.tickets.getAllTickets(courseid);
      } else if (userdata != undefined) {
        return sql.tickets.getAllMyTickets(courseid, userdata.id);
      } else {
        return Promise.reject(1003);
      }
    })
    .then((ticketdata) => {
      return splicer.insertCourseUserInfoToUserIdReferences(ticketdata, 'aloittaja', courseid);
    });
  }

  getUserInfo(userId, courseId) {
    return sql.courses.getUserInfoForCourse(userId, courseId);
  }

  getTicketBases(courseId) {
    return sql.courses.getCombinedTicketBasesOfCourse(courseId);
  }

}

module.exports = CourseReads;
