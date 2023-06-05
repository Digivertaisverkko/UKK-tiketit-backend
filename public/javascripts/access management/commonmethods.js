
const sql = require('../../../routes/sql.js');
const { getFaqTickets } = require('../sqltickets.js');
const splicer = require('../sqlsplicer.js');
const errorcodes = require('../errorcodes.js');


class CommonMethods {
  
  acceptInvitation(invitationId, userId, courseId) {
    let courseId;
    let role;
    let email;
    return sql.users.getUserInvitation(invitationId)
    .then((invitationData) => {
      if (invitationData.kurssi != courseId) {
        return Promise.reject(errorcodes.noPermission);
      }
      courseId = invitationData.kurssi;
      role = invitationData.rooli;
      email = invitationData.sposti;
      return sql.users.getUserProfile(userId);
    })
    .then((userData) => {
      if (userData.sposti == email) {
        return sql.courses.addUserToCourse(courseId, userData.id, role=='opettaja');
      } else {
        return Promise.reject(errorcodes.noPermission);
      }
    })
    .then(() => {
      return sql.users.removeUserInvitation(invitationId);
    });
  }

  rejectInvitation(invitationId, userId, courseId) {
    let email;
    return sql.users.getUserInvitation(invitationId)
    .then((invitationData) => {
      if (invitationData.kurssi != courseId) {
        return Promise.reject(errorcodes.noPermission);
      }
      email = invitationData.sposti;
      return sql.users.getUserProfile(userId);
    })
    .then((userData) => {
      if (userData.sposti == email) {
        return sql.users.removeUserInvitation(invitationId);
      } else {
        return Promise.reject(errorcodes.noPermission);
      }
    });
  }

}

module.exports = CommonMethods;