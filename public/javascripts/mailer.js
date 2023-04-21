
var path = require('path');
const sql = require('./../../routes/sql.js');
const arrayTools = require('./arrayTools.js');

// Configure nodemailer
const nodemailer = require('nodemailer');
const TicketState = require('./ticketstate.js');
const redirect = require('./redirect.js');
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});







module.exports = {

  sendMailNotifications: function(ticketId, excludedList, content) {
    var storedCreator;
    var storedCourse;
    var storedCourseName;
    var storedTicketTitle;
    return sql.tickets.getTicket(ticketId)
    .then((ticketData) => {
      storedCourse = ticketData.kurssi;
      storedTicketTitle = ticketData.otsikko;
      return sql.courses.getUserInfoForCourse(ticketData.aloittaja, ticketData.kurssi);
    })
    .then((creatorData) => {
      storedCreator = creatorData;
      return sql.courses.getCourseInfo(storedCourse);
    })
    .then((courseData) => {
      storedCourseName = courseData.nimi;
      return sql.courses.getTeachersOfCourse(storedCourse);
    })
    .then((receiverList) => {
      receiverList.push(storedCreator);
      receiverList = receiverList.filter(function(value, index, array) {
        return excludedList.indexOf(value.id) === -1;
      });
      return receiverList;
    })
    .then((receiverList) => {
      let receiverIdList = arrayTools.extractAttributes(receiverList, 'id');

      if (receiverIdList.length > 0) {
        let url = redirect.urlToTicket(storedCourse, ticketId);

        content = content == null ? '' : content;

        let subject = 'TUKKI-viesti ' + storedCourseName;
        let message = '<h1>' + storedCourseName + '</h1> \
        <p>Kysymykseen <b>' + storedTicketTitle + '</b> on tullut viesti:</p> \
        <p>' + content + '</p> \
        <p>Voit käydä vastaamassa siihen osoitteessa: ' + url + '</p>';
        
        module.exports.sendMailToUserList(receiverIdList, subject, message);
      }

    });
  },

  sendAggregateMails: function() {

    return sql.users.getAllUsersWhoWantAggregateMails()
    .then((userDataList) => {
      let promises = [];
      for (user of userDataList) {
        promises.push(module.exports.sendAggregateMailToUser(user.id));
      }
      return Promise.all(promises);
    });

  },

  sendAggregateMailToUser: function(profileId) {

    return module.exports.createAggregateMailForUser(profileId)
    .then((data) => {
      if (data.contentCount > 0) {
        let now = Date.now();
        let dateString = new Intl.DateTimeFormat('fi-FI', { dateStyle: 'short' }).format(now);
        let subject = 'TUKKI-järjestelmän kooste ' + dateString;
        module.exports.sendMailToUserList([profileId], subject, data.message);
      }
      return data.message;
    });

  },

  createAggregateMailForUser: function(profileId) {
    return sql.courses.getAllCoursesWithUser(profileId)
    .then((courseStatus) => {
      let contentCount = 0;
      let promise = Promise.resolve();
      let dateString = new Intl.DateTimeFormat('fi-FI', { dateStyle: 'short' }).format(Date.now());
      let content = '<h1>TUKKI-kooste ' + dateString + '</h1> \
      Tässä on lyhyt kooste siitä, mitä TUKKI-järjestelmässä on tapahtunut eilen:';
      for (course of courseStatus) {
        if (course.asema === 'opettaja') {
          promise = promise.then(() => {
            return this.createTeacherAggregateForCourse(course.kurssi, profileId);
          })
        } else {
          promise = promise.then(() => {
            return this.createStudentAggregateForCourse(course.kurssi, profileId);
          })
        }
        promise = promise.then((newContent) => {
          if (newContent.rowCount > 0) {
            contentCount += 1;
            content += newContent.message;
          }
        })
      }
      return promise
      .then(() => {
        content += '<br><br>Jos et halua saada sähköpostia tiketeistä, voit muuttaa asetuksia TUKKI-järjestelmän profiilisivulta.';
        return { contentCount: contentCount, message: content };
      });
    })
  },

  sendMail: function(receiverList, subject, content) {
    if (Array.isArray(receiverList) == false) {
      receiverList = [receiverList];
    }

    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      bcc: receiverList,
      subject: subject,
      html: content
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log('Sähköpostin lähetyksessä virhe: ' + error);
      } else {
        console.log('Sähköposti lähetettiin: ' + info.response);
      }
    });
  },

  sendMailToUserList: function(userIdList, subject, content) {
    sql.users.getAllUsersFromListWhoWantNotifications(userIdList)
    .then((userDataList) => {
      console.log('yritetään lähettää: ' + userIdList);
      console.log('voidaan lähettää:   ' + arrayTools.extractAttributes(userDataList, 'id'));
      let addressList = arrayTools.extractAttributes(userDataList, 'sposti');
      module.exports.sendMail(addressList, subject, content);
    });
  },

  createStudentAggregateForCourse: function(courseId, profileId) {
    let title = '<h2>[Kurssi]</h2>';
    let ingress = '<h3>Seuraaviin kysymyksiin on tullut vastaus:</h3>';
    let row = '<b>[Tiketin otsikko]</b> ([linkki])<br>';

    let rowCount = 0;
    let content = '';

    return sql.courses.getCourseInfo(courseId)
    .then((courseData) => {
      content = content + title.replace('[Kurssi]', courseData.nimi);
      return sql.tickets.getAllCommentsFromCourseSinceYesterday(courseId, [profileId])
    })
    .then((commentList) => {
      let ticketIds = arrayTools.extractAttributes(commentList, 'tiketti');
      return sql.tickets.getAllTicketsFromList(ticketIds);
    })
    .then((ticketList) => {
      if (ticketList.length > 0) {
        content += ingress;
        rowCount += ticketList.length;
        for (ticket of ticketList) {
          let newRow = row.replace('[Tiketin otsikko]', ticket.otsikko)
                          .replace('[linkki]', redirect.urlToTicket(courseId, ticket.id));
          content = content + newRow;
        }
      }
    })
    .then(() => {
      return { rowCount: rowCount, message: content };
    })
  },

  createTeacherAggregateForCourse: function(courseId, profileId) {
    let title = '<h2>[Kurssi]</h2>';
    let ingress1 = '<h3>Seuraavat kysymykset odottavat vastausta:</h3>';
    let row = '<b>[Tiketin otsikko]</b> ([linkki])<br>';
    let ingress2 = '<h3>Uudet kysymykset eiliseltä:</h3>';

    let rowCount = 0;
    let content = '';

    return sql.courses.getCourseInfo(courseId)
    .then((courseData) => {
      content = content + title.replace('[Kurssi]', courseData.nimi);
      return sql.tickets.getAllTickets(courseId);
    })
    .then((ticketList) => {
      ticketList.filter((value, index, array) => {
        return value.tila == TicketState.sent || value.tila == TicketState.read;
      })
      if (ticketList.length > 0) {
        content += ingress1;
        rowCount += ticketList.length;
        for (ticket of ticketList) {
          content += row.replace('[Tiketin otsikko]', ticket.otsikko)
                        .replace('[linkki]', redirect.urlToTicket(courseId, ticket.id));
        }
      }
      return sql.tickets.getAllCommentsFromCourseSinceYesterday(courseId, []);
    })
    .then((commetList) => {
      let ticketIds = arrayTools.extractAttributes(commetList, 'tiketti');
      return sql.tickets.getAllTicketsFromList(ticketIds);
    })
    .then((ticketList) => {
      if (ticketList.length > 0) {
        content += ingress2;
        rowCount += ticketList.length;
        for (ticket of ticketList) {
          let newRow = row.replace('[Tiketin otsikko]', ticket.otsikko)
                          .replace('[linkki]', redirect.urlToTicket(courseId, ticket.id));
          content = content + newRow;
        }
      }
    })
    .then(() => {
      return { rowCount: rowCount, message: content };
    });

  }

}