const ProfileReads = require("./profilereads");

const sql = require('../../../routes/sql.js');
const sqlfuncs = require('../sqlfuncs.js');
const arrayTools = require("../arrayTools");


class ProfileWrites extends ProfileReads {

  deleteProfile(profileid) {
    return sqlfuncs.removeAllDataRelatedToUser(profileid);
  }



  exportAllUserData(profileid) {
    var collection = {};
    return sql.users.getUserProfile(profileid)
    .then((userData) => {
      collection.profiili = userData;
      return sql.tickets.getAllTicketsCreatedBy(profileid);
    })
    .then((ticketDataList) => {
      return sql.tickets.getAllCommentCreatedBy(profileid)
      .then((commentDataList) => {
        let commentIds = arrayTools.extractAttributes(commentDataList, 'id');
        return sql.tickets.getAttachmentListForCommentList(commentIds)
        .then((attachmentDataList) => {
          return arrayTools.unionNewKeyAsArray(commentDataList, attachmentDataList, 'id', 'kommentti', 'liitteet');
        })
        .then((commentAttachmentList) => {
          let ticketIds = arrayTools.extractAttributes(ticketDataList, 'id');
          collection.tiketit = arrayTools.unionNewKeyAsArray(ticketDataList, commentAttachmentList, 'id', 'tiketti', 'omat kommentit');
          collection.kommentit = commentAttachmentList;
          return sql.tickets.getFieldsOfTicketList(ticketIds);
        })
      })
      .then((fieldDataList) => {
        fieldDataList = arrayTools.removeAttributes(fieldDataList, ['tyyppi', 'ohje']);
        collection.tiketit = arrayTools.unionNewKeyAsArray(collection.tiketit, fieldDataList, 'id', 'tiketti', 'kentat');
      })
      .then(() => {
        return sql.courses.getAllCoursesWithUser(profileid);
      });
    })
    .then((courseAttendanceDataList) => {
      let courseIds = arrayTools.extractAttributes(courseAttendanceDataList, 'kurssi');
      return sql.courses.getCoursesWithIdList(courseIds)
      .then((courseDataList) => {
        collection.kurssit = courseDataList;
      });
    })
    .then(() => {
      return collection;
    })
  }

  getAllUserAttachments(profileId) {
    return sql.tickets.getAllCommentCreatedBy(profileId)
    .then((commentDataList) => {
      let commentIds = arrayTools.extractAttributes(commentDataList, 'id');
      return sql.tickets.getAttachmentListForCommentList(commentIds);
    });
  }


  updateUserSettings(userId, emailNotification, emailAggregate, emailFeedback) {
    return sql.users.updateUserProfileSettings(userId, emailNotification, 
                                               emailAggregate, emailFeedback);
  }

}

module.exports = ProfileWrites;