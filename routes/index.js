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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/', function(req, res, next) {
  res.send('Hello World!');
});

router.post('/api/login/', function(req, res, next) {
  let logintype = req.header('login-type');
  let codeChallenge = req.header('code-challenge');
  if (logintype != undefined && codeChallenge != undefined) {
    auth.startLogin(codeChallenge, logintype)
    .then((data) => res.send(data))
    .catch((error) => res.send('error: ' + error));
  } else {
    res.send(errorFactory.createError(300));
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
      res.send(errorFactory.createError(error));
    });
  }
});

router.post('/api/omalogin/', function(req, res, next) {
  sanitizer.hasRequiredHeaders(req, ['ktunnus', 'salasana', 'login-id'])
  .then((header) => auth.login(header.ktunnus, header.salasana, header['login-id']))
  .then((data) => res.send(data))
  .catch((error) => res.send(errorFactory.createError(error)));
});

router.post('/api/luotili/', function(req, res, next) {
  sanitizer.hasRequiredParameters(req, ['ktunnus', 'salasana', 'sposti'])
  .then((header) => auth.createAccount(header.ktunnus, header.salasana, header.sposti))
  .then((data) => {
    res.send({success: true});
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
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

router.get('/api/kurssi/:courseid', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.courses.getCourseInfo(req.params.courseid);
  })
  .then((coursedata) => {
    res.send(coursedata);
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});

router.get('/api/kurssi/:courseid/omat', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.tickets.getAllMyTickets(req.params.courseid, userid);
  })
  .then((ticketdata) => {
    return splicer.insertCourseUserInfoToUserIdReferences(ticketdata, 'aloittaja', req.params.courseid);
  })
  .then((sqldata) => {
    res.send(sqldata);
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});

router.get('/api/kurssi/:courseid/kaikki', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.courses.getUserInfoForCourse(userid, req.params.courseid);
  })
  .then((userdata) => {
    if (userdata != undefined && userdata.asema === 'opettaja') {
      return sql.tickets.getAllTickets(req.params.courseid);
    } else if (userdata != undefined) {
      return sql.tickets.getAllMyTickets(req.params.courseid, userdata.id);
    } else {
      return Promise.reject(103);
    }
  })
  .then((ticketdata) => {
    return splicer.insertCourseUserInfoToUserIdReferences(ticketdata, 'aloittaja', req.params.courseid);
  })
  .then((data) => res.send(data))
  .catch((error) => res.send(errorFactory.createError(error)));
});

router.get('/api/kurssi/:courseid/ukk', function(req, res, next) {
  //TODO: ukk-toteutus
    var array = [4];
    array[0] = {nimi: '”Index out of bounds”?', tyyppi: "Ongelma", tehtava: "Tehtävä 2", pvm: '16.9.2023'};
    array[1] = {nimi: 'Ohjelma tulostaa numeroita kirjainten sijasta!', tyyppi: "Ongelma", tehtava: "Tehtävä 2", pvm: '17.9.2023'};
    array[2] = {nimi: 'Tehtävänannossa ollut linkki ei vie mihinkään', tyyppi: "Kurssitieto", tehtava: "Tehtävä 3", pvm: '23.9.2023'};
    array[3] = {nimi: '”} Expected”?', tyyppi: "Ongelma", tehtava: "Tehtävä 4", pvm: '30.9.2023'};
  
    res.json(array);
});

router.get('/api/kurssit/', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.courses.getAllCourses();
  })
  .then((sqldata) =>
    res.send(sqldata)
  )
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});


router.get('/api/tiketti/:ticketid', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.tickets.hasAccess(userid, req.params.ticketid);
  })
  .then(() => {
    return sql.tickets.getTicket(req.params.ticketid);
  })
  .then((ticketdata) => {
    return splicer.insertCourseUserInfoToUserIdReferences([ticketdata], 'aloittaja', ticketdata.kurssi)
    .then((data) => {
      if (data.asema == 'opettaja') {
        return sql.tickets.setTicketStateIfAble(req.params.ticketid, 2)
        .then(() => {
          return data;
        });
      }
      return data;
    })
  })
  .then((data) => {
    if (data.length == 1) {
      res.send(data[0]);
    } else {
      Promise.reject(304);
    }
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});


router.get('/api/tiketti/:ticketid/kentat', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.tickets.getFieldsOfTicket(req.params.ticketid);
  })
  .then((sqldata) => res.send(sqldata))
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});

router.get('/api/tiketti/:ticketid/kommentit', function(req, res, next) {
  let courseid = null;
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.tickets.hasAccess(userid, req.params.ticketid);
  })
  .then((userid) => {
    return sql.tickets.getTicket(req.params.ticketid);
  })
  .then((ticket) => {
    courseid = ticket.kurssi;
    return sql.tickets.getComments(req.params.ticketid);
  })
  .then((comments) => {
    return splicer.insertCourseUserInfoToUserIdReferences(comments, 'lahettaja', courseid);
  })
  .then((data) => res.send(data))
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});

router.post('/api/tiketti/:ticketid/uusikommentti', function(req, res, next) {
  let storeduserid;
  sanitizer.hasRequiredParameters(req, ['viesti'])
  .then(() => auth.authenticatedUser(req))
  .then((userid) => {
    return sql.tickets.hasAccess(userid, req.params.ticketid);
  })
  .then((userid) => {
    storeduserid = userid;
  })
  .then((commentid) => {
    return sql.tickets.getTicket(req.params.ticketid)
    .then((ticketdata) => {
        return sql.courses.getUserInfoForCourse(storeduserid, ticketdata.kurssi);
    })
    .then((userinfo) => {
      if (userinfo.asema == 'opettaja') {
        return sql.tickets.setTicketStateIfAble(req.params.ticketid, 4);
      } else if (userinfo.asema == 'opiskelija' || userinfo.asema == 'oppilas') { 
        //TODO: poista oppilas-sanan tarkistus, kun kaikilla on päivitetty versio sample_datasta.
        return sql.tickets.setTicketStateIfAble(req.params.ticketid, 1);
      } else {
        return Promise.reject(userinfo.asema);
      }
    });
  })
  .then((state) => {
    //TODO: Tallenna kommenttiin oikea tiketin tila (se mihin tiketin tila vaihtuu kommentin myötä.)
    return sql.tickets.createComment(req.params.ticketid, userid, req.body.viesti, state);
  })
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});


router.post('/api/luokurssi', function(req, res, next) {
  var storeduserid = null;
  var storedcourseid = null;
  sanitizer.hasRequiredParameters(req, ['nimi', 'ohjeteksti'])
  .then(() => auth.authenticatedUser(req))
  .then((userid) => {
    storeduserid = userid;
    return sql.courses.createCourse(req.body.nimi);
  })
  .then((courseid) => {
    storedcourseid = courseid;
    return sql.courses.addUserToCourse(courseid, storeduserid, true);
  })
  .then(() => {
    return sql.courses.createTicketBase(req.body.ohjeteksti, storedcourseid);
  })
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});


router.post('/api/kurssi/:courseid/liity', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    sql.courses.addUserToCourse(req.params.courseid, userid, false);
  })
  .then((sqldata) => {
    res.send({success: true});
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});


router.get('/api/kurssi/:courseid/oikeudet', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.courses.getUserInfoForCourse(userid, req.params.courseid);
  })
  .then((sqldata) => {
    res.send(sqldata);
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});


router.get('/api/kurssi/:courseid/uusitiketti/kentat', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.courses.getTicketBasesOfCourse(req.params.courseid);
  })
  .then((tickedIdRows) => {
    if (tickedIdRows.length > 0) {
      return sql.courses.getFieldsOfTicketBase(tickedIdRows[0].id);
    } else {
      return Promise.reject(200);
    }
  })
  .then((sqldata) => {
    res.send(sqldata);
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});

router.get('/api/kurssi/:courseid/uusitiketti', function(req, res, next) {
//TODO: Forwardoi /api/kurssi/:courseid/uusitiketti/kentat metodiin
});

router.post('/api/kurssi/:courseid/uusitiketti', function(req, res, next) {
  var storeduserid = null;
  sanitizer.hasRequiredParameters(req, ['otsikko', 'viesti', 'kentat'])
  .then(() => auth.authenticatedUser(req))
  .then((userid) => {
    storeduserid = userid;
    return sql.tickets.createTicket(req.params.courseid, userid, req.body.otsikko);
  })
  .then((ticketid) => {
    return new Promise(function(resolve, reject) {
      var promises = [];
      req.body.kentat.forEach(kvp => {
        promises.push(sql.tickets.addFieldToTicket(ticketid, kvp.id, kvp.arvo));
      });
      Promise.all(promises)
      .then(() => resolve(ticketid))
      .catch(() => reject(304));
    });
  })
  .then((ticketid) => {
    return sql.tickets.createComment(ticketid, storeduserid, req.body.viesti, 1);
  })
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});

module.exports = router;
