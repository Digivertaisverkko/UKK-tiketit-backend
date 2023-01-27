
const { use } = require('express/lib/application.js');
const sql = require('../../../routes/sql.js')
const auth = require('../auth.js');
const CommentWrites = require('./commentwrites.js');
const CourseLists = require('./courselists.js');
const CourseReads = require('./coursereads.js');
const CourseWrites = require('./coursewrites.js');
const ProfileReads = require('./profilereads.js');
const ProfileWrites = require('./profilewrites.js');
const PublicMethods = require('./publicmethods.js');

const TicketReads = require('./ticketreads.js');
const TicketWrites = require('./ticketwrites.js');


const ticketreads = new TicketReads();
const ticketwrites = new TicketWrites();
const courselists = new CourseLists();
const coursereads = new CourseReads();
const coursewrites = new CourseWrites();

module.exports = {

  publicMethods: function() {
    return new Promise(function(resolve, reject) {
      resolve({ userid: undefined, methods: PublicMethods });
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
            return Promise.reject(1003)
          }
        })
        .then((access) => {
          if (access.asema === 'opettaja') {
            //TODO: Tämä ei kuuluu oikeuksien tarkistukseen, koska tämä kirjoittaa tietokantaan
            return sql.tickets.setTicketStateIfAble(ticketId, 2);
          }
        })
      } else {
        return auth.authenticatedUser(request)
        .then((userid) => {
          storedUserId = userid;
        })
      }
    })
    .then(() => {
      return { userid: storedUserId, methods: ticketreads };
    });
  },

  writeTicket: function(request, ticketId) {
    //Palauttaa saman kuin writeCourse, mutta hakee kurssi-id:n tiketistä.
    return sql.tickets.getPlainTicket(ticketId)
    .then((ticketData) => {
      storedTicketData = ticketData;
      return this.writeCourse(request, ticketData.kurssi);
    })
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
        return Promise.reject(1003)
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

  readProfile: function(request, profileId) {

  },

  writeProfile: function(request, profileId) {

  }

};