
const sql = require('../../../routes/sql.js');
const { getFaqTickets } = require('../sqltickets.js');
const splicer = require('../sqlsplicer.js');



class CommonMethods {
  
  acceptInvitation(invitationId, userId) {
    let courseId;
    let role;
    return sql.users.getUserInvitation(invitationId)
    .then((invitationData) => {
      courseId = invitationData.kurssi;
      role = invitationData.rooli;
      return sql.users.getUserProfile(userId);
    })
    .then((userData) => {
      return sql.courses.addUserToCourse(courseId, userData.id, role=='opettaja');
    })
  }

}

module.exports = CommonMethods;