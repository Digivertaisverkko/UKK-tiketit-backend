const { json } = require('express');
var express = require('express');
const { login } = require('../public/javascripts/auth.js');
const auth = require('../public/javascripts/auth.js');
var router = express.Router();
var sql = require('./sql.js');
const crypto = require('crypto');
const { setFlagsFromString } = require('v8');
const errorFactory = require('../public/javascripts/error.js')
const splicer = require('../public/javascripts/sqlsplicer.js');
const { use } = require('express/lib/application.js');
const sqlsplicer = require('../public/javascripts/sqlsplicer.js');
const sanitizer = require('../public/javascripts/sanitizer.js');
const { send } = require('process');
const access = require('../public/javascripts/access management/access.js');
const { hasRequiredParameters } = require('../public/javascripts/sanitizer.js');
const path = require('path');
const fs = require('fs');

router.use(express.json());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/', function(req, res, next) {
  res.send('Hello World!');
});

router.post('/lti/1p1/start/', function(req, res, next) {

  sanitizer.objectHasRequiredParameters(req.body, ['user_id', 'context_id', 'lis_outcome_service_url',
    'lis_person_name_full', 'context_title', 'roles', 'launch_presentation_locale'])
  .then(() => {
    return auth.securityCheckLti1p1(req);
  })
  .then(() => {
    let userid = req.body.user_id;
    let contextid = req.body.context_id;
    let clientid = req.body.lis_outcome_service_url;
    let username = req.body.lis_person_name_full;
    let coursename = req.body.context_title;
    let courseroles = req.body.roles.split(',');
    return auth.ltiLogin(userid, contextid, clientid, username, coursename, courseroles);
  })
  .then((logindata) => {
    let locale = req.body.launch_presentation_locale;

    const coursePath = 'course';

    let url = new URL(path.join(coursePath, logindata.kurssi.toString(), 'list-tickets'), process.env.LTI_REDIRECT);
    url.searchParams.append('sessionID', logindata.sessionid);
    url.searchParams.append('lang', locale);
    res.redirect(url.toString());
  })
  .catch((error) => {
    res.send(errorFactory.createError(res, error));
  });
});


router.post('/api/login/', function(req, res, next) {
  let logintype = req.header('login-type');
  let codeChallenge = req.header('code-challenge');
  if (logintype != undefined && codeChallenge != undefined) {
    auth.startLogin(codeChallenge, logintype)
    .then((data) => res.send(data))
    .catch((error) => res.send('error: ' + error));
  } else {
    errorFactory.createError(res, 300);
  }
});

router.get('/api/authtoken/', function(req, res, next) {
  let logintype = req.header('login-type');
  let codeVerify = req.header('code-verifier');
  let logincode = req.header('login-code');
  if (logintype === 'own') {
    auth.requestAccess(logincode, codeVerify)
    .then((data) => {
      res.send({'success': true, 'session-id': data[0].sessionid});
      return data;
    })
    .then((data) => {
      return sql.users.removeLoginAttempt(logincode);
    })
    .catch((error) => {
      errorFactory.createError(res, error);
    });
  }
});

router.post('/api/omalogin/', function(req, res, next) {
  sanitizer.hasRequiredHeaders(req, ['ktunnus', 'salasana', 'login-id'])
  .then((header) => auth.login(header.ktunnus, header.salasana, header['login-id']))
  .then((data) => res.send(data))
  .catch((error) => errorFactory.createError(res, error));
});

router.post('/api/luotili/', function(req, res, next) {
  sanitizer.hasRequiredParameters(req, ['ktunnus', 'salasana', 'sposti'])
  .then((header) => auth.createAccount(header.ktunnus, header.salasana, header.sposti))
  .then((data) => {
    res.send({success: true});
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});




router.get('/api/echoheaders/', function(req, res, next) {
  res.json(req.headers);
});

router.post('/api/echoheaders/', function(req, res) {
  res.json(req.headers);
});

router.get('/api/echobody', function(req, res, next) {
  res.json(req.body);
});

router.post('/api/echobody', function(req, res) {
  res.json(req.body);
});

router.get('/api/hash/:password', function(req, res) {
  var array = [];
  var i=0;
  var salt;
  for (i=0; i<2; ++i) {
    salt = crypto.randomBytes(8).toString('hex');
    let hash = auth.hash(req.params.password, salt);
    array[i] = {salasana: req.params.password, hash: hash, salt: salt};
  }

  let pass2 = req.params.password + 'asd';
  let hash = auth.hash(pass2, salt);
  array[i] = {salasana: pass2, hash: hash, salt: salt};

  res.send(array);
});


router.post('/api/LTI/', function(req, res, next) {
  sanitizer.hasRequiredParameters(req, ["token"])
  .then(() => {
    return auth.ltiLogin(req.body.token);
  })
  .then((logindata) => {
    res.send(logindata);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


router.get('/api/minun/poistatili', function(req, res, next) {
//TODO: Toteuta tilin poistaminen kannasta.
  auth.authenticatedUser(req)
  .then((userid) =>  {
    res.send();
  });
});


// '/api/minun/kurssit'
router.get('/api/kurssi/omatkurssit', function(req, res, next) {
  //ACCESS
  access.listCourses(req)
  .then((handle) => {
    return handle.methods.coursesOfUser(handle.userid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


// '/api/kurssi/:kurssi-id/'
router.get('/api/kurssi/:courseid', function(req, res, next) {
  //ACCESS
  access.publicMethods()
  .then((handle) => {
    return handle.methods.courseInfo(req.params.courseid);
  })
  .then((coursedata) => {
    res.send(coursedata);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});

// '/api/kurssi/:kurssi-id/tiketti/omat'
router.get('/api/kurssi/:courseid/omat', function(req, res, next) {
  //ACCESS
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getAllTicketsMadeByUser(handle.userid, req.params.courseid);
  })
  .then((sqldata) => {
    res.send(sqldata);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});

// '/api/kurssi/:kurssi-id/tiketti/kaikki'
router.get('/api/kurssi/:courseid/kaikki', function(req, res, next) {
  //ACCESS
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getAllTicketsVisibleToUser(handle.userid, req.params.courseid);
  })
  .then((data) => res.send(data))
  .catch((error) => errorFactory.createError(res, error));
});

// '/api/kurssi/:kurssi-id/ukk/kaikki'
router.get('/api/kurssi/:courseid/ukk', function(req, res, next) {
  //ACCESS
  access.publicMethods()
  .then((handle) => {
    return handle.methods.getFaqTickets(req.params.courseid);
  })
  .then((data) => res.send(data) )
  .catch((error) => errorFactory.createError(res, error) );
});

// '/api/kurssi/:kurssi-id/ukk' POST
router.post('/api/kurssi/:courseid/ukk', function(req, res, next) {
  //ACCESS
  sanitizer.hasRequiredParameters(req, ['otsikko', 'viesti', 'kentat', 'vastaus'])
  .then(() => {
    return access.writeCourse(req, req.params.courseid);
  })
  .then((handle) => {
    handle.methods.createFaqTicket(req.params.courseid, handle.userid, req.body.otsikko,
       req.body.viesti, req.body.vastaus, req.body.kentat);
  })
  .then(() => {
    res.send({"success": true});
  })
  .catch((error) => errorFactory.createError(res, error));
});

// '/api/kurssit/'
router.get('/api/kurssit/', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.courses.getAllCourses();
  })
  .then((sqldata) =>
    res.send(sqldata)
  )
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


// '/api/kurssi/:kurssi-id/tiketti/:tiketti-id'
router.get('/api/tiketti/:ticketid', function(req, res, next) {
  //ACCESS
  access.readTicket(req, req.params.ticketid)
  .then((handle) => {
    return handle.methods.getTicketMetadata(req.params.ticketid);
  })
  .then((data) => {
    if (data.length == 1) {
      res.send(data[0]);
    } else {
      Promise.reject(3004);
    }
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});

//TODO: '/api/kurssi/:kurssi-id/tiketti/tiketti-id/kooste

// '/api/kurssi/:kurssi-id/tiketti/:tiketti-id/kentat'
router.get('/api/tiketti/:ticketid/kentat', function(req, res, next) {
  //ACCESS
  access.readTicket(req, req.params.ticketid)
  .then((handle) => {
    return handle.methods.getFields(req.params.ticketid);
  })
  .then((sqldata) => res.send(sqldata))
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


// '/api/kurssi/:kurssi-id/tiketti/tiketti-id/kommentit'
router.get('/api/tiketti/:ticketid/kommentit', function(req, res, next) {
  //ACCESS
  access.readTicket(req, req.params.ticketid)
  .then((handle) => {
    return handle.methods.getComments(req.params.ticketid);
  })
  .then((data) => res.send(data))
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


// '/api/kurssi/:kurssi-id/tiketti/:tiketti-id/kommentit' POST
router.post('/api/tiketti/:ticketid/uusikommentti', function(req, res, next) {
  //ACCESS
  sanitizer.hasRequiredParameters(req, ['viesti', 'tila'])
  .then(() => {
    return access.readTicket(req, req.params.ticketid);
  })
  .then((handle) => {
    return handle.methods.addComment(req.params.ticketid, handle.userid, req.body.viesti, req.body.tila);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


// '/api/kurssi/:kurssi-id/ukk/:tiketti-id/arkistoi
router.post('/api/tiketti/:ticketid/arkistoiukk', function(req, res, next) {
  //ACCESS
  access.writeTicket(req, req.params.ticketid)
  .then((handle) => {
    return handle.methods.archiveFaqTicket(req.params.ticketid);
  })
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


// '/api/kurssi/:kurssi-id/ukk/:tiketti-id/' PUT
router.post('/api/tiketti/:ticketid/muokkaaukk', function(req, res, next) {
  //ACCESS
  sanitizer.objectHasRequiredParameters(req.body, ['otsikko', 'viesti', 'kentat', 'vastaus'])
  .then(() => {
    return access.writeTicket(req, req.params.ticketid);
  })
  .then((handle) => {
    return handle.methods.editFaqTicket(req.params.ticketid, req.body.otsikko, req.body.viesti, req.body.vastaus, req.body.kentat);
  })
  .then((data) => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  })

});


// '/api/kurssi/' POST
router.post('/api/luokurssi', function(req, res, next) {
  errorFactory.createError(res, errorFactory.code.unfinishedAPI);
  //Kommentoitu tilapäisesti, kunnes oikea toteutus tarvitaan.
  /*
  sanitizer.hasRequiredParameters(req, ['nimi', 'ohjeteksti'])
  .then(() => auth.authenticatedUser(req))
  .then((userid) => {
    return sql.courses.createCourseFromScratch(req.body.nimi, req.body.ohjeteksti, userid);
  })
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
  */
});


// '/api/kurssi/:kurssi-id/osallistujat' POST
router.post('/api/kurssi/:courseid/liity', function(req, res, next) {
  errorFactory.createError(res, errorFactory.code.unfinishedAPI);
  //TODO: Tietoturva-aukko: Kuka tahansa voi liittyä mille tahansa kurssille.
  //Kommentoitu tilapäisesti tietoturva-aukon korjaamista odotellessa.
  /*
  auth.authenticatedUser(req)
  .then((userid) => {
    sql.courses.addUserToCourse(req.params.courseid, userid, false);
  })
  .then((sqldata) => {
    res.send({success: true});
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
  */
});


// '/api/kurssi/:kurssi-id/osallistujat/kutsu'
router.post('/api/kurssi/:courseid/kutsu', function(req, res, next) {
  errorFactory.createError(res, errorFactory.code.unfinishedAPI);
  //Kommentoitu tiläpäisesti, kunnes oikea toteutus tarvitaan.
  /*
  sanitizer.hasRequiredParameters(req, ["sposti", "opettaja"])
  .then(() => auth.authenticatedUser(req))
  .then((userid) => {
    return sql.courses.getUserInfoForCourse(userid, req.params.courseid);
  })
  .then((userinfo) => {
    if (userinfo.asema !== "opettaja") {
      return Promise.reject(1003);
    } else {
      return sql.users.userIdsWithEmail(req.body.sposti);
    }
  })
  .then((usersWithMatchingEmail) => {
    if (usersWithMatchingEmail.length == 0) {
      //TODO: Lähetä kutsu ihmiselle, joka ei käytä ohjelmaa tällä hetkellä.
      return Promise.reject(2000);
    } else {
      sql.courses.addUserToCourse(req.params.courseid, usersWithMatchingEmail[0], req.body.opettaja);
    }
  })
  .then(() => res.send({success: true}))
  .catch((error) => errorFactory.createError(res, error));
  */
});


// '/api/kurssi/:kurssi-id/minunoikeudet'
router.get('/api/kurssi/:courseid/oikeudet', function(req, res, next) {
  //ACCESS
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getUserInfo(handle.userid, req.params.courseid);
  })
  .then((sqldata) => {
    res.send(sqldata);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


// '/api/kurssi/:kurssi-id/tikettipohja/kentat'
router.get('/api/kurssi/:courseid/tiketinkentat', function(req, res, next) {
  //ACCESS
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getFieldsOfTicketBase(req.params.courseid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


// '/api/kurssi/:kurssi-id/tikettipohja/kentat' PUT
router.put('/api/kurssi/:courseid/tiketinkentat', function(req, res, next) {
  //ACCESS
  sanitizer.hasRequiredParameters(req, ['kentat'])
  .then(() => sanitizer.arrayObjectsHaveRequiredParameters(req.body.kentat, ['otsikko', 'pakollinen', 'esitaytettava', 'ohje']))
  .then(() => access.writeCourse(req, req.params.courseid))
  .then((handle) => handle.methods.replaceFieldsOfTicketBase(req.params.courseid, req.body.kentat))
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  })
});


// POISTA UUDESTA MUOTOILUSTA
router.get('/api/kurssi/:courseid/uusitiketti/kentat', function(req, res, next) {
  //ACCESS
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getFieldsOfTicketBase(req.params.courseid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


// POISTA UUDESTA MUOTOILUSTA
router.get('/api/kurssi/:courseid/uusitiketti', function(req, res, next) {
  //ACCESS
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getFieldsOfTicketBase(req.params.courseid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


// '/api/kurssi/:kurssi-id/tiketti' POST
router.post('/api/kurssi/:courseid/uusitiketti', function(req, res, next) {
  //ACCESS
  sanitizer.hasRequiredParameters(req, ['otsikko', 'viesti', 'kentat'])
  .then(() => access.readCourse(req, req.params.courseid))
  .then((handle) => {
    return handle.methods.createTicket(req.params.courseid, handle.userid, req.body.otsikko,
       req.body.viesti, req.body.kentat, req.body.liitteet, false);
  })
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


module.exports = router;
