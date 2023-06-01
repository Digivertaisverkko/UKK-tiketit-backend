
const sql = require('../../../routes/sql.js');
const { getFaqTickets } = require('../sqltickets.js');
const splicer = require('../sqlsplicer.js');
const errorcodes = require('../errorcodes.js');


class CommonMethods {
  
  acceptInvitation(invitationId, userId) {
    let courseId;
    let role;
    let email;
    return sql.users.getUserInvitation(invitationId)
    .then((invitationData) => {
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

}

module.exports = CommonMethods;