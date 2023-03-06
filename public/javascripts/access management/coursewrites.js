const sql = require('../../../routes/sql.js');
const TicketState = require('../ticketstate.js');

const CourseReads = require("./coursereads");


class CourseWrites extends CourseReads {

  createFaqTicket(courseid, creatorid, title, body, answer, fields) {
    return sql.tickets.createTicket(courseid, creatorid, title, fields, body, true)
    .then((ticketid) => {
      return sql.tickets.createComment(ticketid, creatorid, answer, 5)
      .then((commentid) => {
        return { tiketti: ticketid, kommentti: commentid };
      });
    });
  }


  archiveFaqTicket(ticketid) {
    return sql.tickets.isFaqTicket(ticketid)
    .then((isFaq) => {
      if (isFaq === true) {
        sql.tickets.archiveTicket(ticketid);
      } else {
        return Promise.reject(3001);
      }
    })
  }

  editFaqTicket(ticketid, newTitle, newBody, newAnswer, newFields) {
    let storedTicketData;
    return sql.tickets.isFaqTicket(ticketid)
    .then((isFaq) => {
      if (isFaq) {
        return sql.tickets.getTicket(ticketid)
        .then((ticketData) => {
          if (ticketData.tila === TicketState.archived) {
            return Promise.reject(3001);
          } else {
            storedTicketData = ticketData;
            return this.archiveFaqTicket(ticketid);
          }
        })
        .then(() => {
          return this.createFaqTicket(storedTicketData.kurssi, storedTicketData.aloittaja, newTitle, newBody, newAnswer, newFields)
        });
      } else {
        return Promise.reject(3001);
      }
    })
  }

  replaceFieldsOfTicketBase(courseId, fields) {
    sql.courses.removeAllFieldsFromTicketBase(courseId)
    .then(() => sql.courses.insertFieldsToTicketBase(courseId, fields))
  }

}


module.exports = CourseWrites;

