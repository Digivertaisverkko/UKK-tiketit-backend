
const sql = require('../../../routes/sql.js');


class ProfileReads {

  getProfile(profileId) {
    return sql.users.getProfile(profileId);
  }

}

module.exports = ProfileReads;