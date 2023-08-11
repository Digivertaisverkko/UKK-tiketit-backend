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
  
  
  describe('Opiskelijan näkymä tikettilistaan.', function() {
    allrolesTests.getAllTicketsTest(studentAgent, 5);

    allrolesTests.getAllTicketsFromUnattentedCourseTest(studentAgent);
  });
  
  
  
  
  allrolesTests.performAllGenericFaqTests(studentAgent, 'opiskelija');
  allrolesTests.performSettingsTests(studentAgent, 'opiskelija');
  
  allrolesTests.postNewTicketTests(studentAgent, 'opiskelija');
  allrolesTests.fetchTicketSuccesfullyTest(studentAgent, 'opiskelija', 1, 1);
  allrolesTests.fetchTicketUnsuccessfullyTest(studentAgent, 'opiskelija', 1, 3);

  allrolesTests.updateTicketSuccessfullyTest(studentAgent, 'opiskelija', 1, 1);
  allrolesTests.updateTicketUnsuccessfullyTest(studentAgent, 'opiskelija', 1, 3);


  describe('Opiskelijan tikettipohjan testit', function() {
    allrolesTests.fetchTicketBaseSuccessfullyTest(studentAgent, 'opiskelija', 1);
    allrolesTests.updateTicketBaseUnsuccessfullyTest(studentAgent, 'opiskelija', 1);
    allrolesTests.fetchTicketBaseUnsuccessfullyTest(studentAgent, 'opiskelija', 6);
  });
  
  
  
  
  
  
  
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
  
  
  
  
  
  describe('Tikettipohjan testit', function() {
  
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

