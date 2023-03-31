const sql = require('../../../routes/sql.js');
const TicketState = require('../ticketstate.js');
const errorcodes = require('./../errorcodes.js');
const auth = require('../auth.js');
const crypto = require('crypto');
const { token } = require('morgan');

class LoginMethods {

  handleUnsureLti1p1Login(httpRequest, reqBody) {

    let userid   = reqBody.user_id;
    let clientid = reqBody.lis_outcome_service_url;

    return sql.users.getLtiUser(clientid, userid)
    .then((data) => {
      if (data.length == 0) {
        let storageId = crypto.randomUUID();
        return sql.users.temporarilyStoreLtiToken(reqBody, '1.1', storageId)
        .then(() => {
          console.log('0a');
          return { accountExists: false, storageId: storageId };
        });
      } else {
        console.log('0b');
        return this.handleAcceptedLti1p1Login(httpRequest, reqBody);
      }
    });

  }

  handleAcceptedLti1p1Login(httpRequest, reqBody) {
    let userid      = reqBody.user_id;
    let contextid   = reqBody.context_id;
    let clientid    = reqBody.lis_outcome_service_url;
    let username    = reqBody.lis_person_name_full;
    let email       = reqBody.lis_person_contact_email_primary;
    let coursename  = reqBody.context_title;
    let courseroles = reqBody.roles.split(',');

    console.log(1);

    return auth.ltiLogin(httpRequest, userid, contextid, clientid, username, email, coursename, courseroles)
    .then((logindata) => {
      console.log(2);
      return { accountExists: true, courseId: logindata.kurssi };
    });
  }

  handleUnsureLti1p3Login(httpRequest, token) {
    
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
        return this.handleAcceptedLti1p3Login(httpRequest, token);
      }
    });
  }

  handleAcceptedLti1p3Login(httpRequest, token) {
    return auth.ltiLoginWithToken(httpRequest, token)
    .then((logindata) => {
      return { accountExists: true, courseId: logindata.kurssi };
    });
  }

  handleGdprAcceptance(httpRequest, storageId) {
    return sql.users.getStoredLtiToken(storageId)
    .then((tokenData) => {
      console.dir(tokenData);
      if (tokenData.lti_versio === '1.1') {
        return this.handleAcceptedLti1p1Login(httpRequest, tokenData.token);
      } else if (tokenData.lti_versio === '1.3') {
        return this.handleAcceptedLti1p3Login(httpRequest, tokenData.token);
      } else {
        return Promise.reject(errorcodes.noPermission);
      }
    })
    .then(() => {
      return sql.users.deleteStoredLtiToken(storageId);
    });
  }


}


module.exports = LoginMethods;