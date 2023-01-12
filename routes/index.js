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


router.get('/api/kurssi/omatkurssit', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.courses.getAllCoursesWithUser(userid);
  })
  .then((data) => {
    res.send(data);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
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
    errorFactory.createError(res, error);
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
    errorFactory.createError(res, error);
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
      return Promise.reject(1003);
    }
  })
  .then((ticketdata) => {
    return splicer.insertCourseUserInfoToUserIdReferences(ticketdata, 'aloittaja', req.params.courseid);
  })
  .then((data) => res.send(data))
  .catch((error) => errorFactory.createError(res, error));
});

router.get('/api/kurssi/:courseid/ukk', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.tickets.getFaqTickets(req.params.courseid)
  })
  .then((ticketData) => {
    return splicer.insertTicketFieldsToIdReferences(ticketData, 'id')
  })
  .then((data) => res.send(data) )
  .catch((error) => errorFactory.createError(res, error) );
});

router.post('/api/kurssi/:courseid/ukk', function(req, res, next) {
  let storedUserId;
  //TODO: Estää opiskelijaa luomasta ukk-tikettiä
  auth.authenticatedUser(req)
  .then((userid) => {
    storedUserId = userid;
    sanitizer.hasRequiredParameters(req, ['otsikko', 'viesti', 'kentat', 'vastaus']);
  })
  .then(() => {
    return sql.tickets.createTicket(req.params.courseid, storedUserId, req.body.otsikko, req.body.kentat, req.body.viesti, true);
  })
  .then((ticketid) => {
    return sql.tickets.createComment(ticketid, storedUserId, req.body.vastaus, 5);
  })
  .then(() => {
    res.send({"success": true});
  })
  .catch((error) => errorFactory.createError(res, error));
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
    errorFactory.createError(res, error);
  });
});


router.get('/api/tiketti/:ticketid', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.tickets.hasAccess(userid, req.params.ticketid);
  })
  .then((access) => {
    if (access.asema == 'opettaja') {
      return sql.tickets.setTicketStateIfAble(req.params.ticketid, 2)
    }
  })
  .then(() => {
    return sql.tickets.getTicket(req.params.ticketid);
  })
  .then((ticketdata) => {
    return splicer.insertCourseUserInfoToUserIdReferences([ticketdata], 'aloittaja', ticketdata.kurssi)
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


router.get('/api/tiketti/:ticketid/kentat', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.tickets.getFieldsOfTicket(req.params.ticketid);
  })
  .then((sqldata) => res.send(sqldata))
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});

router.get('/api/tiketti/:ticketid/kommentit', function(req, res, next) {
  let courseid = null;
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.tickets.hasAccess(userid, req.params.ticketid);
  })
  .then((access) => {
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
    errorFactory.createError(res, error);
  });
});

router.post('/api/tiketti/:ticketid/uusikommentti', function(req, res, next) {
  let storeduserid;

  console.log(req.body);

  sanitizer.hasRequiredParameters(req, ['viesti', 'tila'])
  .then(() => auth.authenticatedUser(req))
  .then((userid) => {
    return sql.tickets.hasAccess(userid, req.params.ticketid);
  })
  .then((access) => {
    storeduserid = access.profiili;
  })
  .then(() => {
    return sql.tickets.getTicket(req.params.ticketid)
    .then((ticketdata) => {
        if (ticketdata.ukk == true) {
          return Promise.reject(1003);
        }
        return sql.courses.getUserInfoForCourse(storeduserid, ticketdata.kurssi);
    })
    .then((userinfo) => {
      if (userinfo.asema == 'opettaja') {
        let state = req.body.tila || 4
        return sql.tickets.setTicketStateIfAble(req.params.ticketid, state);
      } else if (userinfo.asema == 'opiskelija') {
        return sql.tickets.setTicketStateIfAble(req.params.ticketid, 1);
      } else {
        return Promise.reject(userinfo.asema);
      }
    });
  })
  .then((newTicketState) => {
    return sql.tickets.createComment(req.params.ticketid, storeduserid, req.body.viesti, req.body.tila);
  })
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});


router.post('/api/luokurssi', function(req, res, next) {
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
});


router.post('/api/kurssi/:courseid/liity', function(req, res, next) {
  //TODO: Tietoturva-aukko: Kuka tahansa voi liittyä mille tahansa kurssille.
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
});

router.post('/api/kurssi/:courseid/kutsu', function(req, res, next) {
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
    errorFactory.createError(res, error);
  });
});


router.get('api/kurssi/:courseid/tiketinkentat', function(req, res, next) {
  getTicketBases(req, res, next);
})

router.get('/api/kurssi/:courseid/uusitiketti/kentat', function(req, res, next) {
  getTicketBases(req, res, next);
});

router.get('/api/kurssi/:courseid/uusitiketti', function(req, res, next) {
  getTicketBases(req, res, next);
});

router.post('/api/kurssi/:courseid/uusitiketti', function(req, res, next) {
  var storeduserid = null;
  sanitizer.hasRequiredParameters(req, ['otsikko', 'viesti', 'kentat'])
  .then(() => auth.authenticatedUser(req))
  .then((userid) => {
    return sql.tickets.createTicket(req.params.courseid, userid, req.body.otsikko, req.body.kentat, req.body.viesti);
  })
  .then(() => {
    res.send({success: true});
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});





function getTicketBases(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.courses.getCombinedTicketBasesOfCourse(req.params.courseid);
  })
  .then((sqldata) => {
    res.send(sqldata);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
}

module.exports = router;
