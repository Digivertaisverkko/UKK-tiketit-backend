const sql = require('../../../routes/sql.js');

const CourseLists = require('./courselists.js');

const splicer = require('../sqlsplicer.js');
const TicketState = require('../ticketstate.js');
const sqlsplicer = require('../sqlsplicer.js');
const mailer = require('../mailer.js');
const errorcodes = require('./../errorcodes.js');


class CourseReads extends CourseLists {

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
        .catch(() => reject(errorcodes.somethingWentWrong));
      });
    })
    .then((ticketid) => {
      return sql.tickets.createComment(ticketid, creatorId, content, 1)
      .then((commentid) => {
        return {tiketti: ticketid, kommentti: commentid};
      });
    })
    .then((results) => {
      mailer.sendMailNotifications(results.tiketti, [creatorId], content)
      return results;
    });
  }


  getAllTicketsMadeByUser(userid, courseid) {
    return sql.tickets.getAllMyTickets(courseid, userid)
    .then((ticketdata) => {
      return splicer.insertCourseUserInfoToUserIdReferences(ticketdata, 'aloittaja', courseid);
    })
    .then((data) => {
      if (data.length === 0) {
        return Promise.reject(errorcodes.noResults);
      } else {
        return data;
      }
    });
  };

  getUnfilteredTicketVisibleToUser(userId, courseId) {
    return sql.courses.getUserInfoForCourse(userId, courseId)
    .then((userdata) => {
      if (userdata != undefined && userdata.asema === 'opettaja') {
        return sql.tickets.getAllTickets(courseId);
      } else if (userdata != undefined) {
        return sql.tickets.getAllMyTickets(courseId, userdata.id);
      } else {
        return Promise.reject(errorcodes.noPermission);
      }
    })
    .then((ticketData) => {
      return splicer.insertCourseUserInfoToUserIdReferences(ticketData, 'aloittaja', courseId);
    })
    .then((ticketData) => {
      return sql.tickets.insertTicketStateToTicketIdReferences(ticketData, 'id');
    })
    .then((ticketData) => {
      return sql.tickets.insertTicketFieldsToTicketIdReferences(ticketData, 'id');
    });
  }

  getAllArchivedTicketsVisibleToUser(userId, courseId) {
    return sql.courses.getUserInfoForCourse(userId, courseId)
    .then ((userInfo) => {
      if (userInfo.asema === 'opiskelija') {
        return Promise.reject(errorcodes.noResults);
      } else {
        return this.getUnfilteredTicketVisibleToUser(userId, courseId)
      }
    })
    .then((ticketData) => {
      return sqlsplicer.removeUnarchivedTickets(ticketData);
    });
  }

  getAllTicketsVisibleToUser(userId, courseId) {
    let storedStatus;
    return sql.courses.getUserInfoForCourse(userId, courseId)
    .then((userInfo) => {
      storedStatus = userInfo.asema;
      return this.getUnfilteredTicketVisibleToUser(userId, courseId);
    })
    .then((ticketData) => {
      if (storedStatus !== 'opiskelija') {
        return sqlsplicer.removeArchivedTickets(ticketData);
      } else {
        return ticketData;
      }
    });
  }

  getUserInfo(userId, courseId) {
    return sql.courses.getUserInfoForCourse(userId, courseId);
  }

  getFieldsOfTicketBase(courseId) {
    return sql.courses.getFieldsOfTicketBaseForCourse(courseId);
  }

}

module.exports = CourseReads;
