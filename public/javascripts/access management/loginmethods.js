const sql = require('../../../routes/sql.js');
const TicketState = require('../ticketstate.js');
const errorcodes = require('./../errorcodes.js');
const auth = require('../auth.js');
const crypto = require('crypto');
const { token } = require('morgan');

class LoginMethods {

  handleUnsureLti1p1Login(reqBody) {

    let userid   = reqBody.user_id;
    let clientid = reqBody.lis_outcome_service_url;

    console.log(11);

    return sql.users.getLtiUser(clientid, userid)
    .then((data) => {
      console.log(12);
      if (data.length == 0) {
        let storageId = crypto.randomUUID();
        console.log('13a');
        console.dir(reqBody);
        return sql.users.temporarilyStoreLtiToken(reqBody, '1.1', storageId)
        .then(() => {
          console.log('14a');
          return { accountExists: false, storageId: storageId };
        });
      } else {
        console.log('13b');
        return this.handleAcceptedLti1p1Login(reqBody);
      }
    });

  }

  handleAcceptedLti1p1Login(reqBody) {
    let userid      = reqBody.user_id;
    let contextid   = reqBody.context_id;
    let clientid    = reqBody.lis_outcome_service_url;
    let username    = reqBody.lis_person_name_full;
    let email       = reqBody.lis_person_contact_email_primary;
    let coursename  = reqBody.context_title;
    let courseroles = reqBody.roles.split(',');
    console.log(1);
    return auth.ltiLogin(userid, contextid, clientid, username, email, coursename, courseroles)
    .then((logindata) => {
      console.log(2);
      return { accountExists: true, courseId: logindata.kurssi };
    });
  }

  handleUnsureLti1p3Login(token) {
    
    let ltiUserId = token.user;
    let ltiClientId = token.clientId;

    return sql.users.getLtiUser(ltiClientId, ltiUserId)
    .then((data) => {
      if (data.length == 0) {
        let storageId = crypto.randomUUID();
        return sql.users.temporarilyStoreLtiToken(token, '1.3', storageId)
        .then(() => {
          return { accountExists: false, storageId: storageId };
        })
      } else {
        return this.handleAcceptedLti1p3Login(token);
      }
    });
  }

  handleAcceptedLti1p3Login(token) {
    return auth.ltiLoginWithToken(token)
    .then((logindata) => {
      const coursePath = 'course';
      let redirectUrl = new URL(path.join(coursePath, logindata.kurssi.toString(), 'list-tickets'), process.env.LTI_REDIRECT);
      redirectUrl.searchParams.append('sessionID', logindata.sessionid);
      redirectUrl.searchParams.append('lang', token.platformContext.launchPresentation.locale);
      return { accountExists: true, courseId: logindata.kurssi };
    });
  }

  handleGdprAcceptance(storageId) {
    return sql.users.getStoredLtiToken(storageId)
    .then((tokenData) => {
      if (tokenData.lti_versio === '1.1') {
        return this.handleAcceptedLti1p1Login(tokenData.token);
      } else if (tokenData.lti_versio === '1.3') {
        return this.handleAcceptedLti1p3Login(tokenData.token);
      } else {
        return Promise.reject(errorcodes.noPermission);
      }
    })
    .then(() => {
      console.log(4);
      return sql.users.deleteStoredLtiToken(storageId);
    })
  }


}


module.exports = LoginMethods;