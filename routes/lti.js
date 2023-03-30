
const { json } = require('express');
var express = require('express');
var router = express.Router();
const auth = require('../public/javascripts/auth.js');
const sanitizer = require('../public/javascripts/sanitizer.js');
const access = require('../public/javascripts/access management/access.js');
const errorFactory = require('../public/javascripts/error.js');
const path = require('path');

router.use(express.json());

router.post('/1p1/start/', function(req, res, next) {

  console.log(-1);
  sanitizer.objectHasRequiredParameters(req.body, ['user_id', 'context_id', 'lis_outcome_service_url',
    'lis_person_name_full', 'context_title', 'roles', 'launch_presentation_locale'])
  .then(() => {
    console.log(0);
    return auth.securityCheckLti1p1(req);
  })
  .then(() => {
    console.log(1);
    return access.loginMethods();
  })
  .then((handle) => {
    console.log(2);
    console.dir(handle);
    return handle.methods.handleUnsureLti1p1Login(req.body);
  })
  .then((results) => {
    console.log(3 + ' ' + results.accountExists);
    if (results.accountExists) {
      let locale = req.body.launch_presentation_locale;
      const coursePath = 'course';
  
      let url = new URL(path.join(coursePath, logindata.kurssi.toString(), 'list-tickets'), process.env.LTI_REDIRECT);
      url.searchParams.append('sessionID', logindata.sessionid);
      url.searchParams.append('lang', locale);
      res.redirect(url.toString());
    } else {
      let locale = req.body.launch_presentation_locale;

      let url = new URL(path.join('data-consent'), process.env.LTI_REDIRECT);
      url.searchParams.append('lang', locale);
      url.searchParams.append('tokenid', results.storageId);
      console.log(url.toString());
      res.redirect(url.toString());
    }
  })
  .catch((error) => {
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
    return handle.methods.handleGdprAcceptance(req.body['lupa-id']);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


module.exports = router;