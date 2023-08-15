const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');

const app = require('../app.js');
const { forEach } = require("jszip");
const arrayTools = require("../public/javascripts/arrayTools.js");
const testhelpers = require("../testhelpers/testhelpers.js");
const allrolesTests = require("../testhelpers/allroles-tests.js");
const testobjects = require('../testhelpers/test-objects.js');

chai.use(chaiHttp);
const expect = chai.expect;

let teacherAgent = chai.request.agent(app);
let unsignedAgent = chai.request.agent(app);


describe('Opettajan oikeuksien testaaminen', function() {

  this.beforeAll('alustataan tietokanta', function() {
    this.timeout(1000);
  });

  describe('Opettajaksi sisäänkirjautuminen.', function() {
    allrolesTests.loginTest(teacherAgent, 'TestiOpettaja', 'salasana');
  });

  describe('Kurssin tikettilistojen hakeminen', function() {
    allrolesTests.getAllTicketsTest(teacherAgent, 8);

    allrolesTests.getAllTicketsFromUnattentedCourseTest(teacherAgent);
  })

  allrolesTests.performAllGenericFaqTests(teacherAgent, 'opettaja');
  allrolesTests.performSettingsTests(teacherAgent, 'opettaja');

  allrolesTests.fetchTicketSuccesfullyTest(teacherAgent, 'opettaja (opiskelijat tiketti)', 1, 1);
  allrolesTests.fetchTicketSuccesfullyTest(teacherAgent, 'opettaja (oma tiketti)', 1, 3);

  allrolesTests.postNewTicketTests(teacherAgent, 'opettaja');

  describe('Opettajan tikettipohjan testit', function() {
    allrolesTests.fetchTicketBaseSuccessfullyTest(teacherAgent, 'opettaja', 1);
    allrolesTests.updateTicketBaseSuccessfullyTest(teacherAgent, 'opettaja', 1);
    allrolesTests.fetchTicketBaseUnsuccessfullyTest(teacherAgent, 'opettaja', 6);
    allrolesTests.updateTicketBaseUnsuccessfullyTest(teacherAgent, 'opettaja (vääräkurssi)', 6);
  });


  describe('Opettajan tiketin vienti ja tuonti', function() {

    it('hakee tuotavat ukk-tiedot palvelimelta', function(done) {
      teacherAgent.get('/api/kurssi/1/ukk/vienti')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        res.body.forEach(bodyElement => {
          expect(bodyElement).to.have.all.keys(['id', 'otsikko', 'aikaleima', 'tila', 'kommentit', 'kentat']);
          expect(bodyElement.kommentit).to.be.an('array');
          expect(bodyElement.kentat).to.be.an('array');
          bodyElement.kommentit.forEach(element => {
            expect(element).to.have.all.keys(['id', 'tiketti', 'lahettaja', 'viesti', 'aikaleima', 'muokattu', 'tila']);
          });
          bodyElement.kentat.forEach(element => {
            expect(element).to.have.all.keys(['tiketti', 'arvo', 'otsikko', 'tyyppi', 'ohje']);
          });
          done();
        });
      });
    });

    it('lähettää tuodut tiketin palvelimelle', function(done) {
      teacherAgent.post('/api/kurssi/1/ukk/vienti')
      .send(testobjects.exportJson)
      .end((err, res) => {
        console.dir(res.body);
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(['success']);
        expect(res.body.success).to.be.true;
        done();
      });
  
    });
    
  });

});