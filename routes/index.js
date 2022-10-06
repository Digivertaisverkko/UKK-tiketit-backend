const { json } = require('express');
var express = require('express');
var router = express.Router();
var sql = require('./sql.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/', function(req, res, next) {
  res.send('Hello World!');
});

router.get('/api/login/', function(req, res, next) {
  
});

router.get('/api/api-key/', function(req, res, next) {
  
});



function hasAccess(req, res) {
  if (req.header['session-id']) {
    return true;
  } else {
    res.json({success: false, error: 'no authorization', 'login-url': 'none'});
    return false;
  }
}

router.get('/api/echoheaders/', function(req, res, next) {
  res.json(req.headers);
});

router.get('/api/echobody', function(req, res, next) {
  res.json(req.body);
});

router.get('/api/kurssi/:courseid', function(req, res, next) {
  if (hasAccess(req, res)) {
    res.json({'kurssi-nimi': 'Ohjelmistomatematiikan perusteet.'});
  }
});

router.get('/api/kurssi/:courseid/omat', function(req, res, next) {
  sql.getAllMessages(courseId, '2').then((data) => res.send(data));
});

router.get('/api/kurssi/:courseid/ukk', function(req, res, next) {
  if (hasAccess(req, res)) {
    var array = [4];
    array[0] = {nimi: '”Index out of bounds”?', tyyppi: "Ongelma", tehtava: "Tehtävä 2", pvm: '16.9.2023'};
    array[1] = {nimi: 'Ohjelma tulostaa numeroita kirjainten sijasta!', tyyppi: "Ongelma", tehtava: "Tehtävä 2", pvm: '17.9.2023'};
    array[2] = {nimi: 'Tehtävänannossa ollut linkki ei vie mihinkään', tyyppi: "Kurssitieto", tehtava: "Tehtävä 3", pvm: '23.9.2023'};
    array[3] = {nimi: '”} Expected”?', tyyppi: "Ongelma", tehtava: "Tehtävä 4", pvm: '30.9.2023'};
  
    res.json(array);
  }
});

router.get('/api/kurssi/kaikki', function(req, res, next) {
  sql.getCourses().then((data) =>
    res.send(data)
  );
});

router.get('/api/viesti/:messageid', function(req, res, next) {
  sql.getMessage(req.params.messageid).then((data) => res.send(data));
});


router.get('/api/viesti/kentat/:messageid', function(req, res, next) {
  sql.getMessage(req.params.messageid).then((data) => res.send(data));

});

router.get('/api/viesti/tila/:messageid', function(req, res, next) {
  sql.getMessageState(req.params.messageid).then((data) => res.send(data));
});

router.get('/api/viesti/kommentit/:messageid', function(req, res, next) {
  sql.getComments(req.params.messageid).then((data) => res.send(data));
});

module.exports = router;
