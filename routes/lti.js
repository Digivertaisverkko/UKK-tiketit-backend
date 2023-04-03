
const { json } = require('express');
var express = require('express');
var router = express.Router();
const auth = require('../public/javascripts/auth.js');
const sanitizer = require('../public/javascripts/sanitizer.js');
const access = require('../public/javascripts/access management/access.js');
const errorFactory = require('../public/javascripts/error.js');
const path = require('path');
const redirect = require('../public/javascripts/redirect.js');

router.use(express.json());

router.post('/1p1/start/', function(req, res, next) {

  sanitizer.objectHasRequiredParameters(req.body, ['user_id', 'context_id', 'lis_outcome_service_url',
    'lis_person_name_full', 'context_title', 'roles', 'launch_presentation_locale'])
  .then(() => {
    return auth.securityCheckLti1p1(req);
  })
  .then(() => {
    return access.loginMethods();
  })
  .then((handle) => {
    return handle.methods.handleUnsureLti1p1Login(req, req.body);
  })
  .then((results) => {
    console.log(3);
    if (results.accountExists) {
      console.log(4);
      console.dir(req.body);
      console.dir(results);
      let locale = req.body.launch_presentation_locale;
      return redirect.redirectToCoursePage(res, locale, results.courseId);
    } else {
      console.log(5);
      let locale = req.body.launch_presentation_locale;
      return redirect.redirectToGdprPage(res, locale, results.storageId);
    }
  })
  .catch((error) => {
    console.log('6 ' + error);
    errorFactory.createError(res, error);
  });
});


router.post('/gdpr-lupa-ok/', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'lupa-id', type: 'string'}
  ])
  .then(() => {
    return access.loginMethods();
  })
  .then((handle) => {
    return handle.methods.handleGdprAcceptance(req, req.body['lupa-id']);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


module.exports = router;