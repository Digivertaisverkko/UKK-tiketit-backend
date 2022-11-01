const { json } = require('express');
var express = require('express');
const { login } = require('../public/javascripts/auth.js');
const auth = require('../public/javascripts/auth.js');
var router = express.Router();
var sql = require('./sql.js');
const crypto = require('crypto');
const { setFlagsFromString } = require('v8');
const errorFactory = require('../public/javascripts/error.js')

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
    }).then((data) => {
      return sql.removeLoginAttempt(logincode);
    }).catch((error) => {
      res.send(errorFactory.createError(error));
    });
  }
});

router.post('/api/omalogin/', function(req, res, next) {
  let username = req.header('ktunnus');
  let password = req.header('salasana');
  let loginid = req.header('login-id');
  auth.login(username, password, loginid)
  .then((data) => res.send(data))
  .catch((error) => res.send(errorFactory.createError(error) ));
});

router.post('/api/luotili/', function(req, res, next) {
  let username = req.header('ktunnus');
  let password = req.header('salasana');
  if (username != null && password != null) {
    auth.createAccount(username, password)
    .then((data) => {
      res.send({success: true});
    }).catch((error) => {
      res.send(errorFactory.createError(error));
    });
  } else {
    res.send(errorFactory.createError(300));
  }
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
    return sql.getCourseInfo(req.params.courseid);
  })
  .then((sqldata) => {
    if (sqldata.length == 1) {
      res.send(sqldata[0]);
    } else {
      res.send(errorFactory.createError(200));
    }
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});

router.get('/api/kurssi/:courseid/omat', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.getAllMyTickets(req.params.courseid, userid);
  })
  .then((sqldata) => {
    res.send(sqldata);
  })
  .catch((error) => {
    res.send(errorFactory.createError(error));
  });
});

router.get('/api/kurssi/:courseid/kaikki', function(req, res, next) {
  //TODO: Lisää authin tarkistus ja tarkistus sille, että hakija on opettaja
  sql.getAllTickets(req.params.courseid).then((data) => res.send(data));
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
    return sql.getAllCourses();
  })
  .then((sqldata) =>
    res.send(sqldata)
  );
});


router.get('/api/tiketti/:ticketid', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.getTicket(req.params.ticketid);
  })
  .then((sqldata) => {
    if (sqldata.length == 1) {
      res.send(sqldata);
    } else {
      res.send(errorFactory.createError(200));
    }
  }).catch((error) => {
    res.send(errorFactory.createError(error));
  });
});


router.get('/api/tiketti/:ticketid/kentat', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.getFieldsOfTicket(req.params.ticketid);
  })
  .then((sqldata) => res.send(sqldata));
});

router.get('/api/tiketti/:ticketid/kommentit', function(req, res, next) {
  auth.authenticatedUser(req)
  .then((userid) => {
    return sql.getComments(req.params.ticketid);
  })
  .then((data) => res.send(data));
});



router.get('/api/tiketti/uusi/:courseid/:userid/:title', function (req, res, next) {
  sql.createTicket(req.params.courseid, req.params.userid, req.params.title).then((data) => res.send(data));
});

module.exports = router;
