const TicketState = require("../ticketstate");

const sql = require('../../../routes/sql.js');
const splicer = require('../sqlsplicer.js');
const arrayTools = require("../arrayTools");
const crypto = require('crypto');
const fs = require('fs');
const errorcodes = require('./../errorcodes.js');
const mailer = require('./../mailer.js');



class TicketReads {

  addComment(ticketId, creatorId, content, wantedState) {
    var storedTicketData;
    return sql.tickets.getTicket(ticketId)
    .then((ticketdata) => {
      storedTicketData = ticketdata;
      if (ticketdata.ukk == true) {
        return Promise.reject(errorcodes.operationNotPossible);
      }
      return sql.courses.getUserInfoForCourse(creatorId, ticketdata.kurssi);
    })
    .then((userinfo) => {
      if (userinfo.asema == 'opettaja') {
        let state = wantedState || TicketState.commented;
        return sql.tickets.setTicketStateIfAble(ticketId, state);
      } else if (userinfo.asema == 'opiskelija') {
        return sql.tickets.setTicketStateIfAble(ticketId, 1);
      } else {
        return Promise.reject(userinfo.asema);
      }
    })
    .then((newTicketState) => {
      return sql.tickets.createComment(ticketId, creatorId, content, wantedState);
    })
    .then((commentId) => {
      if (creatorId === storedTicketData.aloittaja) {
        mailer.sendMailNotifications(ticketId, [creatorId], content);
      } else {
        sql.courses.getTeachersOfCourse(storedTicketData.kurssi)
        .then((teacherIdList) => {
          let ids = arrayTools.extractAttributes(teacherIdList, 'id');
          mailer.sendMailNotifications(ticketId, ids, content);
        })
      }
      return commentId;
    })

  }

  getAttachment(commentid, fileid) {
    return sql.tickets.getAttachmentForComment(commentid, fileid)
    .then((foundDataList) => {
      let foundData = foundDataList[0];
      let filePath = process.env.ATTACHMENT_DIRECTORY + foundData.tiedosto;
      foundData.polku = filePath;
      return foundData;
    });
  }

  getComments(ticketId) {
    let storedCourseId;
    return sql.tickets.getTicket(ticketId)
    .then((ticket) => {
      storedCourseId = ticket.kurssi;
      return sql.tickets.getComments(ticketId);
    })
    .then((comments) => {
      return splicer.insertCourseUserInfoToUserIdReferences(comments, 'lahettaja', storedCourseId);
    })
    .then((comments) => {
      let commentIdList = arrayTools.extractAttributes(comments, 'id');
      return sql.tickets.getAttachmentListForCommentList(commentIdList)
      .then((attachmentList) => {
        return arrayTools.arrayUnionByAddingObjectsToArray(comments, attachmentList, 'id', 'kommentti', 'liitteet');
      })
    });
  }

  getFields(ticketId) {
    return sql.tickets.getFieldsOfTicket(ticketId);
  }

  getTicketMetadata(currentUserId, ticketId) {
    return sql.tickets.getTicket(ticketId)
    .then((ticketdata) => {
      return splicer.insertCourseUserInfoToUserIdReferences([ticketdata], 'aloittaja', ticketdata.kurssi);
    })
    .then((results) => {
      if (currentUserId == null) {
        //Koska käyttäjän ei ole välttämättä pitänyt kirjautua sisään UKK-tikettejä varten.
        return results;
      } else {
        return sql.courses.getUserInfoForCourse(currentUserId, results[0].kurssi)
        .then((userInfo) => {
          if (userInfo.asema === "opettaja") {
            return sql.tickets.setTicketStateIfAble(ticketId, TicketState.read);
          }
        })
        .then(() => {
          return results;
        })
      }
    });
  }

}



module.exports = TicketReads;