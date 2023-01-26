
const sql = require('../../../routes/sql.js');


class CourseLists {

  coursesOfUser(userid) {
    return sql.courses.getAllCoursesWithUser(userid);
  }

};

module.exports = CourseLists;