const sql = require('../../../routes/sql.js');

const CourseLists = require('./courselists.js');

const splicer = require('../sqlsplicer.js');
const TicketState = require('../ticketstate.js');
const sqlsplicer = require('../sqlsplicer.js');
const mailer = require('../mailer.js');
const errorcodes = require('./../errorcodes.js');
const arrayTools = require('../arrayTools.js');
const { forEach } = require('jszip');


class CourseReads extends CourseLists {

  createTicket(courseId, creatorId, title, content, fieldList, isFaq=false) {
    let storedTicketId = null;
    return sql.tickets.insertTicketMetadata(courseId, creatorId, title, isFaq)
    .then((sqldata) => { return sqldata.id })
    .then((ticketid) => {
      storedTicketId = ticketid;
      return sql.tickets.setTicketState(ticketid, TicketState.sent)
      .then((sqldata) => { return ticketid; });
    })
    .then((ticketid) => {
      return sql.courses.getFieldsOfTicketBaseForCourse(courseId)
      .then((databaseFieldList) => {

        //Tarkistaa, että kaikki annetut tiketin kentät ovat osa kurssin tikettipohjaa.
        if (isFaq == false) {
          let databaseFieldIds = arrayTools.extractAttributes(databaseFieldList, 'id');
          for (let i=0; i<fieldList.length; ++i) {
            if (databaseFieldIds.includes(fieldList[i].id) == false) {
              return Promise.reject(errorcodes.wrongParameters);
            }
          }
        }
        return new Promise(function(resolve, reject) {
          var promises = [];
          fieldList.forEach(kvp => {
            promises.push(sql.tickets.addFieldToTicket(ticketid, creatorId, kvp.id, kvp.arvo));
          });
          Promise.all(promises)
          .then(() => resolve(ticketid))
          .catch(() => reject(errorcodes.somethingWentWrong));
        });
      });
    })
    .then((ticketid) => {
      if (isFaq == false) {
        return sql.tickets.updatePrefilledAnswersFromList(creatorId, fieldList)
        .then(() => {
          return ticketid;
        });
      } else {
        return ticketid;
      }
    })
    .then((ticketid) => {
      return sql.tickets.createComment(ticketid, creatorId, content, 1)
      .then((commentid) => {
        return {tiketti: ticketid, kommentti: commentid};
      });
    })
    .then((results) => {
      if (isFaq == false) { //UKK-tiketit hoitavat ilmoituksensa erikseen eri paikassa.
        mailer.sendMailNotificationForNewTicket(results.tiketti, [creatorId]);
      }
      return results;
    }).catch((error) => {
      if (storedTicketId == null) {
        return Promise.reject(error);
      } else {
        return sql.tickets.deleteTicket(storedTicketId)
        .then(() => {
          return Promise.reject(error);
        })
        .catch((error) => {
          return Promise.reject(error);
        })
      }
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
    })
    .then((ticketData) => {
      return sql.tickets.insertTimestampsToTicketIdReferences(ticketData, 'id');
    })
    .then((ticketData) => {
      return sql.tickets.insertAttachmentInfoToTicketIdReferences(ticketData, 'id');
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
    return sql.courses.getUserInfoForCourse(userId, courseId)
    .then((userData) => {
      return sql.users.getUserLoginType(userId)
      .then((loginType) => {
        return { oikeudet: userData, login: loginType };
      })
    })
  }

  getFieldsOfTicketBase(courseId, userId) {
    return sql.courses.getFieldsOfTicketBaseForCourse(courseId)
    .then((ticketFields) => {
      let fieldIdList = arrayTools.extractAttributes(ticketFields, 'id');
      return sql.tickets.getPrefilledAnswersFromFieldIdList(userId, fieldIdList)
      .then((prefilledList) => {
        return arrayTools.unionExtractKey(ticketFields, prefilledList, 'id', 'kentta', 'esitaytto', 'arvo');
      });
    })
  }

  getDescriptionOfTicketBase(courseId) {
    return sql.courses.getTicketBasesOfCourse(courseId)
    .then((dataList) => {
      return dataList[0];
    });
  }

}

module.exports = CourseReads;
