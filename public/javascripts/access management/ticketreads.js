const TicketState = require("../ticketstate");

const sql = require('../../../routes/sql.js');
const splicer = require('../sqlsplicer.js');
const arrayTools = require("../arrayTools");
const crypto = require('crypto');
const fs = require('fs');
const errorFactory = require('../error.js');



class TicketReads {

  addComment(ticketId, creatorId, content, wantedState) {
    return sql.tickets.getTicket(ticketId)
    .then((ticketdata) => {
      if (ticketdata.ukk == true) {
        return Promise.reject(3001);
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

  getTicketMetadata(ticketId) {
    return sql.tickets.getTicket(ticketId)
    .then((ticketdata) => {
      return splicer.insertCourseUserInfoToUserIdReferences([ticketdata], 'aloittaja', ticketdata.kurssi);
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

}



module.exports = TicketReads;