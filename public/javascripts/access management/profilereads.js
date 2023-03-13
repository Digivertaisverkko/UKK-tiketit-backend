
const sql = require('../../../routes/sql.js');


class ProfileReads {

  getProfile(profileId) {
    return sql.users.getUserProfile(profileId);
  }

}

module.exports = ProfileReads;