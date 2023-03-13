const ProfileReads = require("./profilereads");

const sql = require('../../../routes/sql.js');


class ProfileWrites extends ProfileReads {

  deleteProfile(profileid) {
    return sql.tickets.deleteCommentsFromUser(profileid)
    .then(() => {
      return sql.tickets.deleteTicketsFromUser(profileid);
    })
    .then(() => {
      return sql.courses.removeUserFromAllCourses(profileid);
    })
    .then(() => {
      return sql.users.removeSession(profileid);
    })
    .then(() => {
      return sql.users.removeAccount(profileid);
    })
    .then(() => {
      return sql.users.removeProfile(profileid);
    })
  }

}

module.exports = ProfileWrites;