const { json } = require('express');
var express = require('express');
const { login } = require('../public/javascripts/auth.js');
const auth = require('../public/javascripts/auth.js');
var router = express.Router();
var sql = require('./sql.js');
const crypto = require('crypto');
const { setFlagsFromString } = require('v8');
const errorFactory = require('../public/javascripts/error.js');
const splicer = require('../public/javascripts/sqlsplicer.js');
const { use, handle } = require('express/lib/application.js');
const sqlsplicer = require('../public/javascripts/sqlsplicer.js');
const sanitizer = require('../public/javascripts/sanitizer.js');
const { send } = require('process');
const access = require('../public/javascripts/access management/access.js');
const { hasRequiredParameters } = require('../public/javascripts/sanitizer.js');
const path = require('path');
const fs = require('fs');
const { sendMailNotifications } = require('../public/javascripts/mailer.js');
const { profile, timeEnd } = require('console');
var session = require('express-session');
const timedJobs = require('../public/javascripts/timedJobs.js');
const TicketState = require('../public/javascripts/ticketstate.js');
const mailer = require('../public/javascripts/mailer.js');
const { errorMonitor } = require('events');
const filessystem = require('../public/javascripts/filessystem.js');

router.use(express.json());



router.post('/login/', function(req, res, next) {
  let logintype = req.header('login-type');
  let codeChallenge = req.header('code-challenge');
  let courseId = req.header('kurssi');
  sanitizer.test(req.headers, [
    {key: 'login-type', type:'string'},
    {key: 'code-challenge', type: 'string'},
    {key: 'kurssi', regex: /^[0-9]+$/}
  ]).then(() => {
    if (logintype != undefined && codeChallenge != undefined) {
      return auth.startLogin(codeChallenge, logintype, courseId)
      .then((data) => res.send(data))
      .catch((error) => res.send('error: ' + error));
    } else {
      return Promise.reject(3000);
    }
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});

router.get('/authtoken/', function(req, res, next) {
  let logintype = req.header('login-type');
  let codeVerify = req.header('code-verifier');
  let logincode = req.header('login-code');
  if (logintype === 'own') {
    auth.requestAccess(logincode, codeVerify)
    .then((data) => {
      return auth.regenerateSession(req, data[0].profiili)
      .then(() => {
        return data;
      });
    })
    .then((data) => {
      res.send({'success': true });
    })
    .then(() => {
      return sql.users.removeLoginAttempt(logincode);
    })
    .catch((error) => {
      errorFactory.createError(req, res, error);
    });
  }
});

router.post('/omalogin/', function(req, res, next) {
  sanitizer.hasRequiredHeaders(req, ['ktunnus', 'salasana', 'login-id'])
  .then((header) => auth.login(header.ktunnus, header.salasana, header['login-id']))
  .then((data) => res.send(data))
  .catch((error) => errorFactory.createError(req, res, error));
});

router.post('/kirjauduulos/', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => auth.destroySession(req))
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});

router.post('/luotili/', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'ktunnus', type: 'string', min: 5, max: 255},
    {key: 'salasana', type: 'string'},
    {key: 'sposti', type: 'string', min: 1, max: 255},
    {key: 'kutsu', type: 'string', min: 36, max: 36}
  ])
  .then(() => { 
    return auth.createAccount(req.body.ktunnus, req.body.salasana, req.body.sposti, req.body.kutsu)
  })
  .then((data) => {
    res.send({success: true});
  })
  .catch((error) => {
    if (error === errorFactory.code.noResults) {
      errorFactory.createError(req, res, errorFactory.code.wrongParameters);
    } else {
      errorFactory.createError(req, res, error);
    }
  });
});

router.post('/testi-cron/', function(req, res, next) {
  //timedJobs.archiveOldTickets();
  //timedJobs.deletePendingLtiLogins();
  timedJobs.sendAggregateEmails()
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  })
})

router.get('/testi/', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'piip', min: 0, value: 'terve!'},
    {keyPath: ['a', 'b', 'c'], type: 'string', value: ['1', '2', '3', '4', 'asd']},
    {key: 'r', min: 4, max: 10, optional: true}
  ])
  .then(() => {
    res.send(true);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});

router.get('/testicron/', function(req, res, next) {
  filessystem.removeAllGdprDumps()
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});

router.get('/echoheaders/', function(req, res, next) {
  res.json(req.headers);
});

router.post('/echoheaders/', function(req, res) {
  res.json(req.headers);
});

router.get('/echobody', function(req, res, next) {
  res.json(req.body);
});

router.post('/echobody', function(req, res) {
  res.json(req.body);
});

router.get('/hash/:password', function(req, res) {
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


router.get('/minun/', function(req, res, next) {
  access.authenticatedUser(req)
  .then((userid) => {
    return access.readProfile(req, userid);
  })
  .then((handle) => {
    return handle.methods.getProfile(handle.userid);
  })
  .then((userData) => {
    res.send(userData);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});

router.get('/minun/asetukset/', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return access.readProfile(req, userid);
  })
  .then((handle) => {
    return handle.methods.getProfileSettings(handle.userid);
  })
  .then((settings) => {
    res.send({ 'sposti-ilmoitus': settings.sposti_ilmoitus,
               'sposti-kooste':   settings.sposti_kooste, 
               'sposti-palaute':  settings.sposti_palaute });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});

router.post('/minun/asetukset/', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'sposti-ilmoitus', type: 'boolean'},
    {key: 'sposti-kooste',  type: 'boolean'},
    {key: 'sposti-palaute', type: 'boolean'}
  ])
  .then(() => {
    return access.authenticatedUser(req);
  })
  .then((userid) => {
    return access.writeProfile(req, userid);
  })
  .then((handle) => {
    return handle.methods.updateUserSettings(handle.userid, 
                                             req.body['sposti-ilmoitus'], 
                                             req.body['sposti-kooste'], 
                                             req.body['sposti-palaute']);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});

router.get('/minun/gdpr/', function(req, res, next) {
  access.authenticatedUser(req)
  .then((userid) => access.writeProfile(req, userid))
  .then((handle) => {
    return handle.methods.exportAllUserData(handle.userid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});


router.delete('/minun/', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'id', type: 'number'},
    {key: 'sposti', type: 'string', optional: true}
  ])
  .then(() => {
    return access.writeProfile(req, req.body.id);
  })
  .then((handle) => {
    return handle.methods.getProfile(handle.userid)
    .then((profileData) => {
      if (profileData.sposti == req.body.sposti || 
          (profileData.sposti === undefined && 
           req.body.sposti === undefined)) {

        return handle.methods.deleteProfile(handle.userid);
      } else {
        return Promise.reject(errorFactory.code.noPermission);
      }
    });
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


router.get('/minun/kurssit/', function(req, res, next) {
  //ACCESS
  access.listCourses(req)
  .then((handle) => {
    return handle.methods.coursesOfUser(handle.userid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


router.get('/kurssi/:courseid', function(req, res, next) {
  //ACCESS
  access.publicMethods()
  .then((handle) => {
    return handle.methods.getCourseInfo(req.params.courseid);
  })
  .then((coursedata) => {
    res.send(coursedata);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


router.get('/kurssi/:courseid/tiketti/omat/', function(req, res, next) {
  //ACCESS
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getAllTicketsMadeByUser(handle.userid, req.params.courseid);
  })
  .then((sqldata) => {
    res.send(sqldata);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


router.get('/kurssi/:courseid/tiketti/kaikki/', function(req, res, next) {
  //ACCESS
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getAllTicketsVisibleToUser(handle.userid, req.params.courseid);
  })
  .then((data) => res.send(data))
  .catch((error) => errorFactory.createError(req, res, error));
});

router.get('/kurssi/:courseid/tiketti/arkisto', function(req, res, next) {
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getAllArchivedTicketsVisibleToUser(handle.userid, req.params.courseid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});


router.get('/kurssi/:courseid/ukk/kaikki', function(req, res, next) {
  //ACCESS
  access.publicMethods()
  .then((handle) => {
    return handle.methods.getFaqTickets(req.params.courseid);
  })
  .then((data) => res.send(data) )
  .catch((error) => errorFactory.createError(req, res, error) );
});

router.get('/kurssi/:courseid/ukk/vienti', function(req, res, next) {
  access.writeCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.exportFaqsFromCourse(req.params.courseid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});

router.post('/kurssi/:courseid/ukk/vienti', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'otsikko', type: 'string', min: 1,  max: 255},
    {key: 'aikaleima', type: 'string'},
    {keyPath: ['kommentit', 'viesti'], type: 'string'},
    {keyPath: ['kommentit', 'aikaleima'], type: 'string'},
    {key: 'kentat', type: 'object'},
    {keyPath: ['kentat', 'otsikko'], type: 'string'},
    {keyPath: ['kentat', 'arvo'], type: 'string', max: 255},
    {keyPath: ['kentat', 'tyyppi'], type: 'number'},
    {keyPath: ['kentat', 'ohje'], type: 'string', max: 255}
  ])
  .then(() => {
    return access.writeCourse(req, req.params.courseid);
  })
  .then((handle) => {
    return handle.methods.importFaqsToCourse(req.params.courseid, handle.userid, req.body);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});


router.post('/kurssi/:courseid/ukk', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'otsikko', type: 'string', min: 1,  max: 255},
    {key: 'viesti', type: 'string'},
    {key: 'kentat', type: 'object'},
    {keyPath: ['kentat', 'id'], type: 'number'},
    {keyPath: ['kentat', 'arvo'], type: 'string', max: 255},
    {key: 'vastaus', type: 'string'}
  ])
  .then(() => {
    return access.writeCourse(req, req.params.courseid);
  })
  .then((handle) => {
    return handle.methods.createFaqTicket(req.params.courseid,
                                          handle.userid, 
                                          req.body.otsikko,
                                          req.body.viesti,
                                          req.body.vastaus,
                                          req.body.kentat);
  })
  .then((insertedData) => {
    res.send({ success: true, uusi: insertedData });
  })
  .catch((error) => errorFactory.createError(req, res, error));
});


router.get('/kurssit/', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.courses.getAllCourses();
  })
  .then((sqldata) =>
    res.send(sqldata)
  )
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


// TODO: Tarkista, että tiketti on pyydetyllä kurssilla!
router.get('/kurssi/:courseid/tiketti/:ticketid', function(req, res, next) {
  //ACCESS
  access.readTicket(req, req.params.courseid, req.params.ticketid)
  .then((handle) => {
    return handle.methods.getTicketMetadata(handle.userid, req.params.ticketid);
  })
  .then((data) => {
    if (data.length == 1) {
      res.send(data[0]);
    } else {
      return Promise.reject(errorFactory.code.somethingWentWrong);
    }
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


// TODO: Tarkista, että tiketti on pyydetyllä kurssilla!
router.put('/kurssi/:courseid/tiketti/:ticketid', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'otsikko', type: 'string', min: 1, max: 255},
    {key: 'viesti', type: 'string', min: 1, optional: true},
    {key: 'kentat', type: 'object'},
    {keyPath: ['kentat', 'id'], type: 'number'},
    {keyPath: ['kentat', 'arvo'], type: 'string', max: 255}
  ])
  .then(() => {
    return access.writeTicket(req, req.params.courseid, req.params.ticketid);
  })
  .then((handle) => {
    return handle.methods.updateTicket(req.params.ticketid, 
                                       req.body.otsikko, 
                                       req.body.viesti, 
                                       req.body.kentat);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});


// TODO: Tarkista, että tiketti on pyydetyllä kurssilla!
router.delete('/kurssi/:courseid/tiketti/:ticketid', function(req, res, next) {
  access.writeTicket(req, req.params.courseid, req.params.ticketid)
  .then((handle) => {
    return handle.methods.deleteTicket(req.params.ticketid);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});


// TODO: Tarkista, että tiketti on pyydetyllä kurssilla!
router.get('/kurssi/:courseid/tiketti/:ticketid/kooste', function(req, res, next) {
  access.readTicket(req, req.params.courseid, ticketid)
  .then((handle) => {
    return handle.methods.getTicketMetadata(handle.userid, ticketid);
  })
});


// TODO: Tarkista, että tiketti on pyydetyllä kurssilla!
router.get('/kurssi/:courseid/tiketti/:ticketid/kentat', function(req, res, next) {
  access.readTicket(req, req.params.courseid, req.params.ticketid)
  .then((handle) => {
    return handle.methods.getFields(req.params.ticketid);
  })
  .then((sqldata) => res.send(sqldata))
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


router.get('/kurssi/:courseid/tiketti/:ticketid/kommentti/kaikki', function(req, res, next) {
  access.readTicket(req, req.params.courseid, req.params.ticketid)
  .then((handle) => {
    return handle.methods.getComments(req.params.ticketid);
  })
  .then((data) => res.send(data))
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});



router.post('/kurssi/:courseid/tiketti/:ticketid/kommentti', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'viesti', type: 'string'},
    {key: 'tila', type: 'number', min: 0, max: 6}
  ])
  .then(() => {
    return access.readTicket(req, req.params.courseid, req.params.ticketid);
  })
  .then((handle) => {
    return handle.methods.addComment(req.params.ticketid,
                                     handle.userid,
                                     req.body.viesti, 
                                     req.body.tila);
  })
  .then((newCommentId) => {
    res.send({ success: true, kommentti: newCommentId });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});



router.put('/kurssi/:courseid/tiketti/:ticketid/kommentti/:commentid', function(req, res, next) {
  sanitizer.test(req.body, [
    { key: 'viesti', type: 'string' },
    { key: 'tila',   type: 'number', optional: true, 
          value: [TicketState.infoneeded,
                  TicketState.commented, 
                  TicketState.resolved] 
    }
  ])
  .then(() => {
    return access.writeComment(req, req.params.courseid, req.params.ticketid, req.params.commentid)
  })
  .then((handle) => {
    let commentid = req.params.commentid;
    let viesti = req.body.viesti;
    let tila = req.body.tila;
    return handle.methods.updateCommentText(commentid, viesti, tila);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});


router.delete('/kurssi/:courseid/tiketti/:ticketid/kommentti/:commentid', function(req, res, next) {
  access.writeComment(req, req.params.courseid, req.params.ticketid, req.params.commentid)
  .then((handle) => {
    return handle.methods.deleteComment(req.params.commentid);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});


router.post('/kurssi/:courseid/tiketti/arkisto/', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'tiketti', type: 'number'}
  ])
  .then(() => {
    return access.readTicket(req, req.params.courseid, req.body.tiketti);
  })
  .then((handle) => {
    return handle.methods.archiveFinishedTicket(req.body.tiketti, handle.userid);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});


router.post('/kurssi/:courseid/ukk/arkisto/', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'tiketti', type: 'number'}
  ])
  .then(() => {
    return access.writeFaq(req, req.params.courseid, req.body.tiketti);
  })
  .then((handle) => {
    return handle.methods.archiveFaqTicket(req.body.tiketti);
  })
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


router.put('/kurssi/:courseid/ukk/:ticketid/', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'otsikko', type: 'string', max: 255},
    {key: 'viesti', type: 'string'},
    {key: 'kentat', type: 'object'},
    {keyPath: ['kentat', 'id'], type: 'number', min: 0},
    {keyPath: ['kentat', 'arvo'], type: 'string', max: 255},
    {key: 'vastaus', type: 'string'}
  ])
  .then(() => {
    return access.writeFaq(req, req.params.courseid, req.params.ticketid);
  })
  .then((handle) => {
    return handle.methods.editFaqTicket(req.params.ticketid, req.body.otsikko, req.body.viesti, req.body.vastaus, req.body.kentat);
  })
  .then((data) => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })

});


router.post('/kurssi/', function(req, res, next) {
  errorFactory.createError(req, res, errorFactory.code.unfinishedAPI);
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
    errorFactory.createError(req, res, error);
  });
  */
});


router.post('/kurssi/:courseid/osallistujat', function(req, res, next) {

  sanitizer.test(req.body, [
    {key: 'kutsu', type: 'string', min: 36, max: 36}
  ])
  .then(() => {
    return access.commonMethods(req);
  })
  .then((handle) => {
    return handle.methods.acceptInvitation(req.body.kutsu, handle.userid, req.params.courseid);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


router.post('/kurssi/:courseid/osallistujat/kutsu', function(req, res, next) {
  sanitizer.test(req.body, [
    {key: 'sposti', type: 'string'},
    {key: 'rooli', type: 'string', value: ['opettaja', 'opiskelija']}
  ])
  .then(() => {
    return access.writeCourse(req, req.params.courseid);
  })
  .then((handle) => {
    return handle.methods.inviteUserToCourse(req.params.courseid, req.body.sposti, req.body.rooli);
  })
  .then((invitationId) => {
    res.send({ success: true, kutsu: invitationId });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});

router.get('/kurssi/:courseid/osallistujat/kutsu/:invitationid', function(req, res, next) {
  access.publicMethods()
  .then((handle) => {
    return handle.methods.getInvitation(req.params.invitationid, req.params.courseid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});

router.delete('/kurssi/:courseid/osallistujat/kutsu/:invitationid', function(req, res, next) {
  access.commonMethods(req)
  .then((handle) => {
    return handle.methods.rejectInvitation(req.params.invitationid, handle.userid, req.params.courseid);
  })
  .then(() => {
    res.send({ success: true});
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});


router.get('/kurssi/:courseid/oikeudet', function(req, res, next) {
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getUserInfo(handle.userid, req.params.courseid);
  })
  .then((sqldata) => {
    res.send(sqldata);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


router.get('/kurssi/:courseid/tikettipohja/kentat', function(req, res, next) {
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getFieldsOfTicketBase(req.params.courseid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


router.put('/kurssi/:courseid/tikettipohja/kentat', function(req, res, next) {
  //ACCESS
  sanitizer.test(req.body, [
    {key: 'kentat', type: 'object'},
    {keyPath: ['kentat', 'otsikko'], type: 'string', min: 1, max: 255},
    {keyPath: ['kentat', 'pakollinen'], type: 'boolean'},
    {keyPath: ['kentat', 'esitaytettava'], type: 'boolean'},
    {keyPath: ['kentat', 'ohje'], type: 'string', max: 255},
    {keyPath: ['kentat', 'valinnat'], type: 'object', optional: true}
  ])
  .then(() => {
    return sanitizer.arrayObjectsHaveRequiredParameters(req.body.kentat,
      ['otsikko', 'pakollinen', 'esitaytettava', 'ohje', 'valinnat']);
  })
  .then(() => { 
    return access.writeCourse(req, req.params.courseid);
  })
  .then((handle) => { 
    return handle.methods.replaceFieldsOfTicketBase(req.params.courseid, req.body.kentat)
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});


/*
// POISTA UUDESTA MUOTOILUSTA
router.get('/kurssi/:courseid/uusitiketti/kentat', function(req, res, next) {
  //ACCESS
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getFieldsOfTicketBase(req.params.courseid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});
*/


/*
// POISTA UUDESTA MUOTOILUSTA
router.get('/kurssi/:courseid/uusitiketti', function(req, res, next) {
  //ACCESS
  access.readCourse(req, req.params.courseid)
  .then((handle) => {
    return handle.methods.getFieldsOfTicketBase(req.params.courseid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});
*/

router.post('/kurssi/:courseid/tiketti', function(req, res, next) {
  //ACCESS
  sanitizer.test(req.body, [
    {key: 'otsikko', type: 'string', min: 1, max: 255},
    {key: 'viesti', type: 'string'},
    {key: 'kentat', type: 'object'},
    {keyPath: ['kentat', 'id'], type: 'number'},
    {keyPath: ['kentat', 'arvo'], type: 'string', max: 255}
  ])
  .then(() => access.readCourse(req, req.params.courseid))
  .then((handle) => {
    return handle.methods.createTicket(req.params.courseid, handle.userid, req.body.otsikko,
       req.body.viesti, req.body.kentat, false);
  })
  .then((newData) => {
    res.send({success: true, uusi: newData});
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});


module.exports = router;
