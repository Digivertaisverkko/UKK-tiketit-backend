const TicketState = require("../ticketstate");

const sql = require('../../../routes/sql.js');



class TicketReads {

  addComment(ticketId, creatorId, content, wantedState) {
    return sql.tickets.getTicket(ticketId)
    .then((ticketdata) => {
      console.log(2);
      if (ticketdata.ukk == true) {
        return Promise.reject(3001);
      }
      return sql.courses.getUserInfoForCourse(creatorId, ticketdata.kurssi);
    })
    .then((userinfo) => {
      console.log(3);
      if (userinfo.asema == 'opettaja') {
        let state = wantedState || TicketState.commented;
        return sql.tickets.setTicketStateIfAble(ticketId, state);
      } else if (userinfo.asema == 'opiskelija') {
        return sql.tickets.setTicketStateIfAble(ticketId, 1);
      } else {
        return Promise.reject(userinfo.asema);
      }
    })
    .then((newTicketState) => {
      console.log(4);
      return sql.tickets.createComment(ticketId, creatorId, content, wantedState);
    })

  }

}



module.exports = TicketReads;