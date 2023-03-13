
const { use } = require('express/lib/application.js');
const sql = require('../../../routes/sql.js')
const auth = require('../auth.js');
const errorcodes = require('./../errorcodes.js');
const CommentWrites = require('./commentwrites.js');
const CourseLists = require('./courselists.js');
const CourseReads = require('./coursereads.js');
const CourseWrites = require('./coursewrites.js');
const ProfileReads = require('./profilereads.js');
const ProfileWrites = require('./profilewrites.js');
const PublicMethods = require('./publicmethods.js');

const TicketReads = require('./ticketreads.js');
const TicketWrites = require('./ticketwrites.js');


const publicmethds = new PublicMethods();
const ticketreads = new TicketReads();
const ticketwrites = new TicketWrites();
const courselists = new CourseLists();
const coursereads = new CourseReads();
const coursewrites = new CourseWrites();
const profilereads = new ProfileReads();
const profilewrites = new ProfileWrites();
const commentWrites = new CommentWrites();

module.exports = {

  authenticatedUser: function(request) {
    return auth.authenticatedUser(request);
  },

  publicMethods: function() {
    return new Promise(function(resolve, reject) {
      resolve({ userid: undefined, methods: publicmethds });
    });
  },

  readTicket: function(request, ticketId) {
    let storedUserId;
    let storedTicketData;
    return sql.tickets.isFaqTicket(ticketId)
    .then((isFaq) => {
      if (isFaq === false) {
        return auth.authenticatedUser(request)
        .then((userid) => {
          storedUserId = userid;
          return sql.tickets.getPlainTicket(ticketId);
        })
        .then((ticketData) => {
          storedTicketData = ticketData;
          return sql.courses.roleInCourse(ticketData.kurssi, storedUserId);
        })  
        .then((courseStatus) => {
          if (courseStatus.asema == 'opettaja' || storedTicketData.aloittaja == storedUserId) {
            return courseStatus;
          } else {
            return Promise.reject(errorcodes.noPermission)
          }
        });
      } else {
        //Jos on UKK
        return auth.authenticatedUser(request)
        .then((userid) => {
          storedUserId = userid
        })
        .catch(() => {
          //UKK:t näkee, vaikka ei ole kirjautunut sisään.
          storedUserId = undefined;
        });
      }
    })
    .then(() => {
      return { userid: storedUserId, methods: ticketreads };
    });
  },

  writeTicket: function(request, ticketId) {
    let storedUserId;
    return auth.authenticatedUser(request)
    .then((userid) => {
      storedUserId = userid;
      return sql.tickets.getPlainTicket(ticketId);
    })
    .then((ticketData) => {
      if (ticketData.ukk === true) {
        return Promise.reject(errorcodes.operationNotPossible);
      } else if (ticketData.aloittaja != storedUserId) {
        return Promise.reject(errorcodes.noPermission);
      } else {
        return { userid: storedUserId, methods: ticketwrites };
      }
    });
  },

  writeFaq: function(request, ticketId) {
    //Palauttaa saman kuin writeCourse, mutta hakee kurssi-id:n tiketistä.
    return sql.tickets.getPlainTicket(ticketId)
    .then((ticketData) => {
      if (ticketData.ukk === false) {
        return Promise.reject(errorcodes.operationNotPossible);
      } else {
        return this.writeCourse(request, ticketData.kurssi);
      }
    })
  },

  writeComment: function(request, ticketId, commentId) {
    let storedUserId;
    return module.exports.readTicket(request, ticketId)
    .then((handle) => {
      storedUserId = handle.userid;
      return sql.tickets.getComment(commentId);
    })
    .then((commentDataList) => {
      let commentData = commentDataList[0];
      if (commentData.lahettaja === storedUserId) {
        return {userid: storedUserId, methods: commentWrites};
      } else {
        return Promise.reject(errorcodes.noPermission);
      }
    });
  },

  writeCourse: function(request, courseId) {
    let storedUserId;
    return auth.authenticatedUser(request)
    .then((userid) => {
      storedUserId = userid;
      return sql.courses.roleInCourse(courseId, userid);
    })
    .then((courseStatus) => {
      if (courseStatus.asema === 'opettaja') {
        return courseStatus;
      } else {
        return Promise.reject(errorcodes.noPermission)
      }
    })
    .then(() => {
      return { userid: storedUserId, methods: coursewrites };
    })
  },

  listCourses: function(request) {
    return auth.authenticatedUser(request)
    .then((userid) => {
      return {userid: userid, methods: courselists };
    });
  },

  readCourse: function(request, courseid) {
    let storedUserId;
    return auth.authenticatedUser(request)
    .then((userid) => {
      storedUserId = userid;
      return sql.courses.roleInCourse(courseid, userid);
    })
    .then(() => {
      return { userid: storedUserId, methods: coursereads };
    });
  },

  readProfile: function(request, profileid) {
    return auth.authenticatedUser(request)
    .then((userid) => {
      if (profileid === userid) {
        return { userid: userid, methods: profilereads }
      } else {
        return Promise.reject(errorcodes.noPermission);
      }
    });
  },

  writeProfile: function(request, profileId) {
    return auth.authenticatedUser(request)
    .then((userid) => {
      if (userid === profileId) {
        return { userid: userid, methods: profilewrites};
      } else {
        return Promise.reject(errorcodes.noPermission);
      }
    });
  }

};