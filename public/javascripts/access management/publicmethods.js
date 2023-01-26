
const sql = require('../../../routes/sql.js');


module.exports = {

  courseInfo: function(courseid) {
    console.log(4);
    return sql.courses.getCourseInfo(courseid);
  }

}