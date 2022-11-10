
var sql = require('../../routes/sql.js');
var arrayTools = require('./arrayTools.js');


module.exports = {

  insertCourseUserInfoToUserIdReferences: function(array, idReferenceKey, courseid) {
      var ids = arrayTools.extractAttributes(array, idReferenceKey);
      return sql.courses.getUserInfoListForCourse(ids, courseid)
      .then((userdata) => {
        return arrayTools.arrayUnionWithKeys(array, userdata, idReferenceKey, 'id');
      });
  }

}