
const sql = require('../../../routes/sql.js');


class ProfileReads {

  getProfile(profileId) {
    return sql.users.getUserProfile(profileId);
  }

  getProfileSettings(profileId) {
    return sql.users.getUserProfileSettings(profileId);
  }

}

module.exports = ProfileReads;