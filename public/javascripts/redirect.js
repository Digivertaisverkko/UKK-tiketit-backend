

var path = require('path');




module.exports = {

  urlToTicket: function(courseId, ticketId) {
    let url = new URL(path.join('course', courseId.toString(), 
                                'ticket', ticketId.toString()),
                      process.env.LTI_REDIRECT);
    return url;
  },

  redirectUrlToGdprPage: function(language, storageId) {
    let url = new URL(path.join('data-consent'), process.env.LTI_REDIRECT);
    url.searchParams.append('lang', language);
    url.searchParams.append('tokenid', storageId);
    return url;
  },

  redirectUrlToCoursePage: function(language, courseId) {
    const coursePath = 'course';

    let url = new URL(path.join(coursePath, courseId.toString(), 'list-tickets'), process.env.LTI_REDIRECT);
    url.searchParams.append('lang', language);
    return url;
  },

  redirectToGdprPage: function(httpResponse, language, storageId) {
    httpResponse.redirect(this.redirectUrlToGdprPage(language, storageId));
  },

  redirectToCoursePage: function(httpResponse, language, courseId) {
    httpResponse.redirect(module.exports.redirectUrlToCoursePage(language, courseId));
  },

  redirectToGdprPageLtijs: function(lti, httpResponse, language, storageId) {
    lti.redirect(httpResponse, module.exports.redirectUrlToGdprPage(language, storageId));
  },

  redirectToCoursePageLtijs: function(lti, httpResponse, language, courseId) {
    lti.redirect(httpResponse, module.exports.redirectUrlToCoursePage(language, courseId));
  },

}