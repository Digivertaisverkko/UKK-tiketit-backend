
var path = require('path');
const sql = require('./../../routes/sql.js');
const arrayTools = require('./arrayTools.js');

// Configure nodemailer
const nodemailer = require('nodemailer');
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
    return sql.tickets.getTicket(ticketId)
    .then((ticketData) => {
      storedCourse = ticketData.kurssi;
      return sql.courses.getUserInfoForCourse(ticketData.aloittaja, ticketData.kurssi);
    })
    .then((creatorData) => {
      storedCreator = creatorData;
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
      let receiverAddressList = arrayTools.extractAttributes(receiverList, 'sposti');

      if (receiverAddressList.length > 0) {
        let url = new URL(path.join('course', storedCourse.toString(), 'ticket-view', ticketId.toString()), process.env.LTI_REDIRECT);

        content = content == null ? '' : content;
        
        const mailOptions = {
          from: process.env.SMTP_USERNAME,
          bcc: receiverAddressList,
          subject: 'DVV-tiketti-ilmoitus',
          html: '<p>DVV-tiketeissä on sinulle viesti. Viestin sisältö:</p>' + content + '<p>Voit käydä vastaamassa siihen osoitteessa: ' + url + '</p>'
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Sähköposti lähetettiin: ' + info.response);
          }
        });
      }

    });
  }

}