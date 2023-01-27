
const sql = require('../../../routes/sql.js');


module.exports = {

  courseInfo: function(courseid) {
    return sql.courses.getCourseInfo(courseid);
  }

}