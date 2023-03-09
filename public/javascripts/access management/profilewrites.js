const ProfileReads = require("./profilereads");

const sql = require('../../../routes/sql.js');


class ProfileWrites extends ProfileReads {

  deleteProfile(profileid) {
    console.log(1);
    return sql.tickets.deleteCommentsFromUser(profileid)
    .then(() => {
      console.log(2);
      return sql.tickets.deleteTicketsFromUser(profileid);
    })
    .then(() => {
      console.log(3);
      return sql.courses.removeUserFromAllCourses(profileid);
    })
    .then(() => {
      console.log(4);
      return sql.users.removeSession(profileid);
    })
    .then(() => {
      console.log(5);
      return sql.users.removeAccount(profileid);
    })
    .then(() => {
      console.log(6);
      return sql.users.removeProfile(profileid);
    })
  }

}

module.exports = ProfileWrites;