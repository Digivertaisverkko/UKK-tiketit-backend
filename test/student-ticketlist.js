const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');

const app = require('../app.js');
const { forEach } = require("jszip");
const arrayTools = require("../public/javascripts/arrayTools.js");
const testhelpers = require("../testhelpers/testhelpers.js");
const allrolesTests = require("../testhelpers/allroles-tests.js");
const TicketState = require('./../public/javascripts/ticketstate.js');

chai.use(chaiHttp);
const expect = chai.expect;

let studentAgent = chai.request.agent(app);
let unsignedAgent = chai.request.agent(app);


describe('Opiskelijan oikeuksien testaamista', function() {

  this.beforeAll('alustataan tietokanta', function() {

  });

  describe("Turhaa odottelua", function() {
    it("Hakee kurssitietoa ilman testausta.", function(done) {
  
      studentAgent.get('/api/kurssi/1')
      .send({})
      .end((err, res) => {
        done();
      });
    });
  });
  
  
  describe('Opiskelijaksi sisäänkirjautuminen.', function() {
    allrolesTests.loginTest(studentAgent, 'TestiOpiskelija', 'salasana');
  });
  
  
  describe("Opiskelijan näkymä tikettilistaan.", function() {
    allrolesTests.getAllTicketsTest(studentAgent, 5);

    allrolesTests.getAllTicketsFromUnattentedCourseTest(studentAgent);
  });
  
  
  describe("Hae tiketti.", function() {
  
    it('Hakee tiketin perustiedot', function(done) {
      studentAgent.get('/api/kurssi/1/tiketti/5')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(['id', 'tila', 'otsikko', 'aikaleima',
                                       'aloittaja', 'kurssi', 'ukk', 
                                       'arkistoitava']);
        expect(res.body.id).to.equal(5);
        expect(res.body.aloittaja).to.be.an('object');
        expect(res.body.ukk).to.equal(false);
        done();
      });
    });
  
    it("Hakee tiketin kentät", function(done) {
      studentAgent.get('/api/kurssi/1/tiketti/5/kentat')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').with.length(2);
        expect(res.body[0]).to.have.keys(['id', 'arvo', 'otsikko', 'tyyppi',
                                          'ohje', 'esitaytettava', 'pakollinen',
                                          'valinnat']);
        expect(res.body[0].valinnat).to.be.an('array').with.length(1);
        expect(res.body[1].valinnat).to.be.an('array').with.length(3);
        done();
      });
    });
  
    it("Hakee tiketin kommentit", function(done) {
      studentAgent.get('/api/kurssi/1/tiketti/1/kommentti/kaikki')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').with.length(5);
        res.body.forEach(element => {
          expect(element).to.have.keys(['id', 'viesti', 'lahettaja', 
                                        'aikaleima', 'muokattu', 'tila', 
                                        'liitteet']);
        });
        done();
      });
    });

    it('hakee toisen aloittaman tiketin', function(done) {
      testhelpers.testNoAccess('/api/kurssi/1/tiketti/3', 'get', studentAgent, done);
    });

    it('hakee toisen aloittaman tiketin kentät', function(done) {
      testhelpers.testNoAccess('/api/kurssi/1/tiketti/3/kentat', 'get', studentAgent, done);
    });

    it('hakee toisen aloittaman tiketin kommentit', function(done) {
      testhelpers.testNoAccess('/api/kurssi/1/tiketti/3/kommentti/kaikki', 'get', studentAgent, done);
    });

    it('hakee tiketin (ei ukk) kirjautumatta', function(done) {
      testhelpers.testNotSignedIn('/api/kurssi/1/tiketti/1/', 'get', unsignedAgent, done);
    });
  
    it('hakee tiketin kentät (ei ukk) kirjautumatta', function(done) {
      testhelpers.testNotSignedIn('/api/kurssi/1/tiketti/1/kentat', 'get', unsignedAgent, done);
    });

    it('hakee tiketin kommentit (ei ukk) kirjautumatta', function(done) {
      testhelpers.testNotSignedIn('/api/kurssi/1/tiketti/1/kommentti/kaikki', 'get', unsignedAgent, done);
    });

  });
  
  
  allrolesTests.performAllGenericFaqTests(studentAgent, 'opiskelija');
  allrolesTests.performSettingsTests(studentAgent, 'opiskelija');
  
  allrolesTests.postNewTicketTests(studentAgent, 'opiskelija');
  
  
  
  
  
  
  
  describe('Tiketteihin kommentoiminen', function() {
  

    it('lisää uuden kommentin aloittamaansa tikettiin', function(done) {
      let message = 'Testirajapinnan kommentti 1';
      testhelpers.testSuccessfullCommenting(studentAgent, message, TicketState.sent, 1, 1, done);
    });
  
  
    it('lisää uuden kommentin toisen aloittamaan tikettiin', function(done) {
      let message = 'Tämä viesti ei mene läpi, koska käyttäjällä ei ole oikeuksia tikettiin.';
      testhelpers.testErrorResponseWithBody(
        '/api/kurssi/1/tiketti/3/kommentti',
        'post',
        studentAgent,
        {
          'viesti': message,
          'tila': TicketState.sent
        },
        403,
        1003,
        done);
    });
  
    it('lisää uuden kommentin arkistoituun tikettiin', function(done) {
      let message = 'Arkistoidun tiketin testikommentti';
      testhelpers.testSuccessfullCommenting(studentAgent, message, TicketState.sent, 1, 2, done);
    });



    it('päivittää oman kommentin', function(done) {
      let message = 'Automaattitestin päivittämä kommentti.';

      studentAgent.put('/api/kurssi/1/tiketti/1/kommentti/1')
      .send({
        'viesti': message
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(['success']);
        expect(res.body.success).to.equal(true);

        studentAgent.get('/api/kurssi/1/tiketti/1/kommentti/kaikki')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          let editedComment = res.body.find((element) => element.id == 1);
          expect(editedComment).to.exist;
          expect(editedComment.viesti).to.eql(message);
          done();
        });
      });
    });
  });
  
  
  
  
  
  describe('Tikettipohjan hakeminen', function() {
  
    it('hakee kurssin tikettipohjan kentät', function(done) {
      studentAgent.get('/api/kurssi/1/tikettipohja/kentat')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').with.length(2);
        res.body.forEach(element => {
          expect(element).to.have.keys(['id', 'otsikko', 'pakollinen',
                                        'esitaytettava', 'valinnat', 'ohje']);
        });
        done();
      });
    });


    it('yrittää muokata tikettipohjan kenttiä', function(done) {
      testhelpers.testErrorResponseWithBody(
        '/api/kurssi/1/tikettipohja/kentat',
        'put',
        studentAgent,
        {
          'kentat': [{
            'otsikko': 'otsikko',
            'pakollinen': true,
            'esitaytettava': false,
            'ohje': 'ohjeteksti',
            'valinnat': ['valinta 1', 'valinta 2']
          }]
        },
        403,
        1003,
        done
      );
    });

  });






});

