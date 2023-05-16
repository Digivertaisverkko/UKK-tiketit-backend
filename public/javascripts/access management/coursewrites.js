const sql = require('../../../routes/sql.js');
const arrayTools = require('../arrayTools.js');
const TicketState = require('../ticketstate.js');
const errorcodes = require('./../errorcodes.js');

const CourseReads = require("./coursereads");


class CourseWrites extends CourseReads {


  archiveFaqTicket(ticketid) {
    return sql.tickets.isFaqTicket(ticketid)
    .then((isFaq) => {
      if (isFaq === true) {
        sql.tickets.archiveTicket(ticketid);
      } else {
        return Promise.reject(errorcodes.operationNotPossible);
      }
    })
  }

  createFaqTicket(courseid, creatorid, title, body, answer, fields) {
    return sql.tickets.createTicket(courseid, creatorid, title, fields, body, true)
    .then((ticketid) => {
      return sql.tickets.createComment(ticketid, creatorid, answer, 5)
      .then((commentid) => {
        return { tiketti: ticketid, kommentti: commentid };
      });
    });
  }

  exportFaqsFromCourse(courseId) {
    let storedTicketList;
    let storedCommentList;

    let ticketIds
    return sql.tickets.getFaqTickets(courseId)
    .then((ticketList) => {
      storedTicketList = ticketList;
      ticketIds = arrayTools.extractAttributes(ticketList, 'id');
      return sql.tickets.getCommentsFromTicketList(ticketIds);
    })
    .then((commentList) => {
      storedCommentList = commentList;
      return sql.tickets.getFieldsOfTicketList(ticketIds);
    })
    .then((fieldList) => {

      storedTicketList = arrayTools.unionNewKeyAsArray(storedTicketList, storedCommentList, 'id', 'tiketti', 'kommentit');
      storedTicketList = arrayTools.unionNewKeyAsArray(storedTicketList, fieldList, 'id', 'tiketti', 'kentat');
      return storedTicketList;
    })
  }

  importFaqsToCourse(courseId, creatorId, faqList) {
    let promiseChain = Promise.resolve();
    
    for (let i=0; i<faqList.length; ++i) {
      let faq = faqList[i];

      for (let j=0; j<faq.kentat.length; ++j) {
        let field = faq.kentat[j];

        promiseChain = promiseChain.then(() => {
          return sql.courses.insertNewField(field.otsikko, false, false, field.ohje, []);
        })
        .then((fieldIdList) => {
          field.id = fieldIdList[0].id;
        })
      }

      promiseChain = promiseChain.then(() => {
        return this.createFaqTicket(courseId, creatorId, faq.otsikko, faq.kommentit[0].viesti, faq.kommentit[1].viesti, faq.kentat);
      });
    }
    
    return Promise.resolve();
  }

  editFaqTicket(ticketid, newTitle, newBody, newAnswer, newFields) {
    let storedTicketData;
    return sql.tickets.isFaqTicket(ticketid)
    .then((isFaq) => {
      if (isFaq) {
        return sql.tickets.getTicket(ticketid)
        .then((ticketData) => {
          if (ticketData.tila === TicketState.archived) {
            return Promise.reject(errorcodes.operationNotPossible);
          }
        })
        .then(() => {
          return sql.tickets.updateTicket(ticketid, newTitle, newFields);
        })
        .then(() => {
          return sql.tickets.getComments(ticketid);
        })
        .then((commentList) => {
          commentList.sort((a, b) => { 
            if (a.aikaleima < b.aikaleima) {
              return -1;
            } else if (a.aikaleima > b.aikaleima) {
              return 1;
            }
            return 0;
          });
          return sql.tickets.updateComment(commentList[0].id, newBody, null)
          .then(() => {
            return sql.tickets.updateComment(commentList[1].id, newAnswer, null);
          });
        });
      } else {
        return Promise.reject(errorcodes.operationNotPossible);
      }
    })
  }

  replaceFieldsOfTicketBase(courseId, fields) {
    return sql.courses.removeAllFieldsFromTicketBase(courseId)
    .then(() => sql.courses.insertFieldsToTicketBase(courseId, fields))
  }

}


module.exports = CourseWrites;

