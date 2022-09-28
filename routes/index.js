const { json } = require('express');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/', function(req, res, next) {
  res.send('Hello World!');
});

router.get('/api/kirjautuminen/', function(req, res, next) {
  
});

router.get('/api/api-key/', function(req, res, next) {
  req['login-code'];
});



function hasAccess(req, res) {
  if (req.header['api-key']) {
    return true;
  } else {
    res.json({success: false, error: 'no authorization', 'login-url': 'none'});
    return false;
  }
}

router.get('/api/echoheaders/', function(req, res, next) {
  //res.json(JSON.stringify(req.headers));
  res.json(req.headers['api-key']);
});

router.get('/api/kurssi/:courseid', function(req, res, next) {
  if (hasAccess(req, res)) {
    res.json({'kurssi-nimi': 'Ohjelmistomatematiikan perusteet.'});
  }
});

router.get('/api/kurssi/omat/:courseid', function(req, res, next) {
  if (hasAccess(req, res)) {
    var array = [3];
    array[0] = {nimi: 'Kotitehtävä ei käänny', tila: 5, tehtava: "Tehtävä 1", pvm: '9.9.2023'};
    array[1] = {nimi: 'Miten char* ja char eroaa toisistaan?', tila: 3, tehtava: "Tehtävä 2", pvm: '14.9.2023'};
    array[2] = {nimi: 'Kotitehtävä ei käänny', tila: 2, tehtava: "Tehtävä 2", pvm: '18.9.2023'};
  
    res.json(array);
  }
});

router.get('/api/kurssi/ukk/:courseid', function(req, res, next) {
  if (hasAccess(req, res)) {
    var array = [4];
    array[0] = {nimi: '”Index out of bounds”?', tyyppi: "Ongelma", tehtava: "Tehtävä 2", pvm: '16.9.2023'};
    array[1] = {nimi: 'Ohjelma tulostaa numeroita kirjainten sijasta!', tyyppi: "Ongelma", tehtava: "Tehtävä 2", pvm: '17.9.2023'};
    array[2] = {nimi: 'Tehtävänannossa ollut linkki ei vie mihinkään', tyyppi: "Kurssitieto", tehtava: "Tehtävä 3", pvm: '23.9.2023'};
    array[3] = {nimi: '”} Expected”?', tyyppi: "Ongelma", tehtava: "Tehtävä 4", pvm: '30.9.2023'};
  
    res.json(array);
  }
});

router.get('/api/kurssit/', function(req, res, next) {
  if (hasAccess) {
    var array = [1];

    array[0] = { nimi: 'Ohjelmistomatematiikan perusteet.', id: 'asd' };
    
    res.json(array);
  }
});

router.get('api/viesti/:messageid', function(req, res, next) {
  if (hasAccess(req, res)) {
    res.json({ otsikko: 'Miten char* ja char eroaa toisistaan?', 
               viesti: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sednisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis.',
               'liite-nimi': 'kotitehtävä.zip',
               'liite-url': 'none' });
  }

});


router.get('api/viesti/kentat/:messageid', function(req, res, next) {
  if (hasAccess(req, res)) {
    var array = [3];

    array[0] = { nimi: 'Ongelma', arvo : 'Epäselvä tehtävänanto' };
    array[1] = { nimi: 'Tehtävä', arvo : 'Tehtävä 2' };
    array[2] = { nimi: 'IDE', arvo: 'Eclipse' };
  
    res.json(array);
  }

});

router.get('api/viesti/kommentit/:messageid', function(req, res, next) {
  if (hasAccess(req, res)) {
    var array = [3];

    array[0] = { 'kirjoittaja-id': '123', pvm: '9.9.2023', tila: 3, teksti : 'Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis. Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum.' };
    array[0] = { 'kirjoittaja-id': '234', pvm: '9.9.2023', tila: 1, teksti : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus.' };
    array[0] = { 'kirjoittaja-id': '234', pvm: '11.9.2023', tila: 1, teksti : 'Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris.' };
    array[0] = { 'kirjoittaja-id': '345', pvm: '14.9.2023', tila: 5, teksti : 'Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula.' };
  
    res.json(array);
  }

});

module.exports = router;
