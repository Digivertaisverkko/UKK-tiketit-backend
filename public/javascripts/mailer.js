
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

  getTicketDataAndRecipients: function(ticketId, excludedList) {
    var storedTicketData;
    var storedCourseData;
    return sql.tickets.getTicket(ticketId)
    .then((ticketData) => {
      storedTicketData = ticketData;
      return sql.courses.getUserInfoForCourse(ticketData.aloittaja, ticketData.kurssi);
    })
    .then((creatorData) => {
      storedCreator = creatorData;
      return sql.courses.getCourseInfo(storedTicketData.kurssi);
    })
    .then((courseData) => {
      storedCourseData = courseData;
      if (storedTicketData.ukk) {
        return sql.courses.getAllParticipantsOfCourse(courseData.id);
      } else {
        return sql.courses.getTeachersOfCourse(courseData.id);
      }
    })
    .then((receiverList) => {
      receiverList.push(storedCreator);
      receiverList = receiverList.filter(function(value, index, array) {
        return excludedList.indexOf(value.id) === -1;
      });

      let receiverIdList = arrayTools.extractAttributes(receiverList, 'id');
      return { recipients: receiverIdList, ticket: storedTicketData, course: storedCourseData };
    })

  },

  sendMailNotificationForNewComment: function(ticketId, excludedList, content) {
    var storedCreator;
    var storedCourse;
    var storedCourseName;
    var storedIsFaq;
    var storedTicketTitle;
    return sql.tickets.getTicket(ticketId)
    .then((ticketData) => {
      storedCourse = ticketData.kurssi;
      storedTicketTitle = ticketData.otsikko;
      storedIsFaq = ticketData.ukk;
      return sql.courses.getUserInfoForCourse(ticketData.aloittaja, ticketData.kurssi);
    })
    .then((creatorData) => {
      storedCreator = creatorData;
      return sql.courses.getCourseInfo(storedCourse);
    })
    .then((courseData) => {
      storedCourseName = courseData.nimi;
      if (storedIsFaq) {
        return sql.courses.getAllParticipantsOfCourse(storedCourse);
      } else {
        return sql.courses.getTeachersOfCourse(storedCourse);
      }
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

        let subject = 'TUKKI viesti - message: ' + storedCourseName;
        let message = '<h1>' + storedCourseName + '</h1> \
        <p>Kysymykseen <b>' + storedTicketTitle + '</b> on tullut viesti:<br>\
        Question <b>' + storedTicketTitle + '</b> has received a comment:</b></p> \
        <p>' + content + '</p><hr> \
        <p>Voit käydä vastaamassa siihen osoitteessa:<br>\
        You may answer it in the following address:<br>\
        ' + url + '</p>';
        
        module.exports.sendMailToUserList(receiverIdList, subject, message);
      }

    });
  },

  sendMailNotificationForNewTicket: function (ticketId, excludedList) {
    var storedNotificationData;
    return module.exports.getTicketDataAndRecipients(ticketId, excludedList)
    .then((notificationData) => {
      storedNotificationData = notificationData;
      return sql.tickets.getCommentsFromTicketList([ticketId]);
    })
    .then((commentDataList) => {
      commentDataList.sort((a,b) => {
        if (a.aikaleima < b.aikaleima) {
          return -1;
        }
        if (a.aikaleima > b.aikaleima) {
          return 1;
        }
        return 0;
      });

      if (storedNotificationData.ticket.ukk) {
        let url = redirect.urlToFaqTicket(storedNotificationData.course.id, ticketId);

        let subject = 'TUKKI Uusi UKK - New FAQ: ' + storedNotificationData.course.nimi;
        let message = '<h1>' + storedNotificationData.course.nimi + '</h1> \
        <p>Uusi usein kysytty kysymys on saanut vastauksen:<br>\
        A frequently asked question has received an answer:</b></p> \
        <h2>' + storedNotificationData.ticket.otsikko + '</h2>\
        <p>' + commentDataList[0].viesti + '</p> \
        <br>- - - <b>Vastaus - Answer</b>- - -<br>\
        <p>' + commentDataList[1].viesti + '</p><hr> \
        <p>Voit käydä katsomassa sen osoitteessa:<br>\
        You may view it at:<br>\
        ' + url + '</p>';
        
        module.exports.sendMailToUserList(storedNotificationData.recipients, subject, message);

      } else {
        let url = redirect.urlToTicket(storedNotificationData.course.id, ticketId);

        let subject = 'TUKKI Uusi kysymys - New question: ' + storedNotificationData.course.nimi;
        let message = '<h1>' + storedNotificationData.course.nimi + '</h1> \
        <p>Tukissa on uusi kysymys:<br>\
        Tukki has a new question:</p> \
        <h2>' + storedNotificationData.ticket.otsikko + '</h2>\
        <p>' + commentDataList[0].viesti + '</p><hr> \
        <p>Voit käydä vastaamassa siihen osoitteessa:<br>\
        You may answer it in the following address:<br>\
        ' + url + '</p>';
        
        module.exports.sendMailToUserList(storedNotificationData.recipients, subject, message);

      }

    })
  },

  sendMailNotificationForUpdatedFaq: function (ticketId, excludedList) {
    var storedNotificationData;
    return module.exports.getTicketDataAndRecipients(ticketId, excludedList)
    .then((notificationData) => {
      storedNotificationData = notificationData;
      return sql.tickets.getCommentsFromTicketList([ticketId]);
    })
    .then((commentDataList) => {
      commentDataList.sort((a,b) => {
        if (a.aikaleima < b.aikaleima) {
          return -1;
        }
        if (a.aikaleima > b.aikaleima) {
          return 1;
        }
        return 0;
      });

      if (storedNotificationData.ticket.ukk) {
        let url = redirect.urlToFaqTicket(storedNotificationData.course.id, ticketId);

        let subject = 'TUKKI Päivitetty UKK - Updated FAQ: ' + storedNotificationData.course.nimi;
        let message = '<h1>' + storedNotificationData.course.nimi + '</h1> \
        <p>Usein kysytty kysymys on muuttunut:<br>\
        A frequently asked question has changed:</b></p> \
        <h2>' + storedNotificationData.ticket.otsikko + '</h2>\
        <p>' + commentDataList[0].viesti + '</p> \
        <br>- - - <b>Vastaus - Answer</b>- - -<br>\
        <p>' + commentDataList[1].viesti + '</p><hr> \
        <p>Voit käydä katsomassa sen osoitteessa:<br>\
        You may view it at:<br>\
        ' + url + '</p>';
        
        module.exports.sendMailToUserList(storedNotificationData.recipients, subject, message);

      }

    })
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
        let subject = 'TUKKI kooste - summary ' + dateString;
        module.exports.sendMailToUserList([profileId], subject, data.message);
      }
      return data.message;
    });

  },

  sendInvitationToRegisterMail: function(email, courseId, invitationId) {

    return sql.courses.getCourseInfo(courseId)
    .then((courseData) => {

      let title = 'Kutsu kirjautumaan Tukki-järjestelmään<br>Invitation to Tukki system';
      let content = '<p>Sinut on kutsuttu Tukki-järjestelmän kurssille ' + courseData.nimi + '.</p> \
      <p>Paina alla olevaa linkkiä liittyäksesi kurssille, ja luodaksesi tili järjestelmään.<br>\
      ' + redirect.urlToRegisterationPage(courseId, invitationId) + '</p>\
      <p>Jos olet saanut tämän sähköpostin turhaan, sinun ei tarvitse tehdä mitään.</p><br>\
      <p>You have been invited to join the course ' + courseData.nimi + ' in Tukki.</p>\
      <p>Click the following link to join the course and to create an account:<br>\
      ' + redirect.urlToRegisterationPage(courseId, invitationId) + '</p>\
      <p>If you have received this mail in error, no action is needed from you.</p>';

      return module.exports.sendMail([email], title, content);
    })
  },

  sendInvitationToJoinMail: function(email, courseId, invitationId) {

    return sql.courses.getCourseInfo(courseId)
    .then((courseData) => {
      let title = 'TUKKI Kutsu kurssille: - Invitation to course: ' + courseData.nimi;
      let content = '<p>Sinut on kutsuttu kurssille ' + courseData.nimi + '.</p> \
      <p>Paina alla olevaa linkkiä liittyäksesi kurssille.<br>\
      ' + redirect.urlToJoinPage(courseId, invitationId) + '</p>\
      <p>Jos olet saanut tämän sähköpostin turhaan, sinun ei tarvitse tehdä mitään.</p><br>\
      <p>You have been invited to join ' + courseData.nimi + ' course.<p/>\
      <p>Click the following link to join the course: ' + redirect.urlToJoinPage(courseId, invitationId) + '</p>\
      <p>If you have received this email in error, no action is needed from you.</p>';

      return module.exports.sendMail([email], title, content);
    })
  },

  createAggregateMailForUser: function(profileId) {
    return sql.courses.getAllCoursesWithUser(profileId)
    .then((courseStatus) => {
      let dateString = new Intl.DateTimeFormat('fi-FI', { dateStyle: 'short' }).format(Date.now());
      let content = 'Tässä on lyhyt kooste siitä, mitä Tukki-järjestelmässä on tapahtunut eilen:<br>\
      The following is a summary of what has happened in Tukki since yesterday.';

      let promise = Promise.resolve({ contentCount: 0, rowCount: 0, message: content });
      for (course of courseStatus) {
        promise = this.createAggregateMailWithCourseData(course.kurssi, 
                                                         profileId,
                                                         course.asema,
                                                         promise);
      }
      return promise
      .then((content) => {
        content.message += '<br><br>Jos et halua saada sähköpostia tiketeistä, \
        voit muuttaa asetuksia Tukki-järjestelmän profiilisivulta.<br>\
        If you wish to not receive email notifications from Tukki, you can change \
        the settings from the settings page of Tukki system.';
        return content;
      });
    })
  },

  createAggregateMailWithCourseData: function(courseId, profileId, status, chainedPromise) {
    
    if (status === 'opettaja') {
      chainedPromise = chainedPromise.then((content) => {
        return this.createTeacherAggregateForCourse(courseId, profileId, content);
      })
    } else {
      chainedPromise = chainedPromise.then((content) => {
        return this.createStudentAggregateForCourse(courseId, profileId, content);
      })
    }
    return chainedPromise;

  },

  sendMail: function(receiverList, subject, content) {
    if (Array.isArray(receiverList) == false) {
      receiverList = [receiverList];
    } else if (receiverList.length < 1) {
      return;
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
      let addressList = arrayTools.extractAttributes(userDataList, 'sposti');
      module.exports.sendMail(addressList, subject, content);
    });
  },

  createStudentAggregateForCourse: function(courseId, profileId, oldContent) {
    let title = '<h2>[Kurssi]</h2>';
    let ingress = '<h3>Seuraavissa kysymyksissä on tapahtunut jotain eilen:<br>Activity since yesterday:</h3>';
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
      return ticketList.filter((value, index, array) => {
        return value.aloittaja == profileId;
      })
    })
    .then((ticketList) => {
      if (ticketList.length > 0) {
        content += ingress;
        rowCount += ticketList.length;
        for (ticket of ticketList) {
          if (ticket.ukk == false) {
            let newRow = row.replace('[Tiketin otsikko]', ticket.otsikko)
            .replace('[linkki]', redirect.urlToTicket(courseId, ticket.id));
            content = content + newRow;
          }
        }

        content += "<h3>Uusia usein kysyttyjä kysymyksiä:<br>Frequently asked questions</h3>"

        for (ticket of ticketList) {
          if (ticket.ukk == true) {
            let newRow = row.replace('[Tiketin otsikko]', ticket.otsikko)
            .replace('[linkki]', redirect.urlToFaqTicket(courseId, ticket.id));
            content = content + newRow;
          }
        }
      }
    })
    .then(() => {
      let contentCount = oldContent.contentCount;
      let message = oldContent.message;
      if (rowCount > 0) {
        contentCount += 1;
        message += content;
      }
      return { contentCount: contentCount, rowCount: rowCount, message: message };
    })
  },

  createTeacherAggregateForCourse: function(courseId, profileId, oldContent) {
    let title = '<h2>[Kurssi]</h2>';
    let ingress1 = '<h3>Seuraavat kysymykset odottavat vastausta:<br>Pending questions:</h3>';
    let row = '<b>[Tiketin otsikko]</b> ([linkki])<br>';
    let ingress2 = '<h3>Uudet kysymykset eiliseltä:<br>New questions since yesterday:</h3>';

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
          if (ticket.ukk == false) {
            content += row.replace('[Tiketin otsikko]', ticket.otsikko)
                          .replace('[linkki]', redirect.urlToTicket(courseId, ticket.id));
          }
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
      let contentCount = oldContent.contentCount;
      let message = oldContent.message;
      if (rowCount > 0) {
        contentCount += 1;
        message += content;
      }
      return { contentCount: contentCount, rowCount: rowCount,
               message: message };
    });

  }

}