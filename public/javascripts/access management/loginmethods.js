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
          return { accountExists: false, storageId: storageId };
        });
      } else {
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

    return auth.ltiLogin(httpRequest, userid, contextid, clientid, username, email, coursename, courseroles)
    .then((logindata) => {
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
    .then((data) => {
      return sql.users.deleteStoredLtiToken(storageId)
      .then(() => {
        return data;
      });
    });
  }

  handleGdprRejection(httpRequest, storageId) {
    return sql.users.getStoredLtiToken(storageId)
    .then((tokenData) => {
      let contextId;
      let clientId;
      if (tokenData.lti_versio === '1.1') {
        contextId = tokenData.token.context_id;
        clientId = tokenData.token.lis_outcome_service_url
      } else if (tokenData.lti_versio === '1.3') {
        contextId = tokenData.token.platformContext.contextId;
        clientId = tokenData.token.clientId;
      }
      return sql.courses.getLtiCourseInfo(clientId, contextId);
    })
    .then((courseDataList) => {
      return sql.users.deleteStoredLtiToken(storageId)
      .then(() => {
        let courseExists;
        let courseId;
        if (courseDataList && courseDataList.length > 0) {
          courseExists = true;
          courseId = courseDataList[0].id;
        } else {
          courseExists = false;
          courseId = null;
        }
        return { courseExists: courseExists, courseId: courseId };
      })
    });
  }


}


module.exports = LoginMethods;