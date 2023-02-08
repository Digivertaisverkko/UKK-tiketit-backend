const sql = require('../../../routes/sql.js');

const CourseLists = require('./courselists.js');

const splicer = require('../sqlsplicer.js');
const TicketState = require('../ticketstate.js');


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

  getFieldsOfTicketBase(courseId) {
    return sql.courses.getFieldsOfTicketBaseForCourse(courseId);
  }

  createTicket(courseId, creatorId, title, content, fieldList, isFaq=false) {
    return sql.tickets.insertTicketMetadata(courseId, creatorId, title, isFaq)
    .then((sqldata) => { return sqldata.id })
    .then((ticketid) => {
        return sql.tickets.setTicketState(ticketid, TicketState.sent)
        .then((sqldata) => { return ticketid; });
    })
    .then((ticketid) => {
      return new Promise(function(resolve, reject) {
        var promises = [];
        fieldList.forEach(kvp => {
          promises.push(sql.tickets.addFieldToTicket(ticketid, kvp.id, kvp.arvo));
        });
        Promise.all(promises)
        .then(() => resolve(ticketid))
        .catch(() => reject(3004));
      });
    })
    .then((ticketid) => {
      return sql.tickets.createComment(ticketid, creatorId, content, 1)
      .then(() => {
        return ticketid;
      });
    });
  }

}

module.exports = CourseReads;
