const testhelpers = require("../testhelpers.js");
const allrolesTests = require("../allroles-tests.js");
const testobjects = require('../test-objects.js');

const chai = require("chai");
const expect = chai.expect;

module.exports = {

  runTests: function(teacherAgent, superTeacher, superStudent) {

    describe('Opettajan oikeuksien testaaminen', function() {

      this.beforeAll('alustataan tietokanta', function() {
        this.timeout(1000);
      });
    
      describe('Opettajaksi sisäänkirjautuminen.', function() {
        allrolesTests.loginTest(teacherAgent, 'TestiOpettaja', 'salasana');
      });

      allrolesTests.performAllCoursePrivilegesTests(teacherAgent, 'opettaja', 'opettaja');
    
      describe('Kurssin tikettilistojen hakeminen', function() {
        allrolesTests.getAllTicketsTest(teacherAgent, 8);
    
        allrolesTests.getAllTicketsFromUnattentedCourseTest(teacherAgent);
      })
    
      allrolesTests.performAllGenericFaqTests(teacherAgent, 'opettaja');
      allrolesTests.performSettingsTests(teacherAgent, 'opettaja');
    
      allrolesTests.fetchTicketSuccesfullyTest(teacherAgent, 'opettaja (opiskelijat tiketti)', 1, 1);
      allrolesTests.fetchTicketSuccesfullyTest(teacherAgent, 'opettaja (oma tiketti)', 1, 3);
    
      allrolesTests.postNewTicketTests(teacherAgent, 'opettaja');

      describe('Tiketin muokkausta, kun tiketti ei ole opiskelijan oma', function () {
        allrolesTests.updateTicketUnsuccessfullyTest(teacherAgent, 'opettaja', 1, 1, superTeacher);
      });

      describe('Tiketin muokkausta kurssilla, jolla opiskelija ei ole osallistujana', function() {
        allrolesTests.updateTicketUnsuccessfullyTest(teacherAgent, 'opettaja', 6, 12, superTeacher);
      });

      describe('Tiketin muokkausta kurssilla, jolla opiskelija on luonut tiketin, muttei ole enää osallistujana', function() {
        allrolesTests.updateTicketUnsuccessfullyTest(teacherAgent, 'opettaja', 2, 14, superTeacher);
      });
    
      describe('Opettajan tikettipohjan testit', function() {
        allrolesTests.fetchTicketBaseSuccessfullyTest(teacherAgent, 'opettaja', 1);
        allrolesTests.updateTicketBaseSuccessfullyTest(teacherAgent, 'opettaja', 1);
        allrolesTests.fetchTicketBaseUnsuccessfullyTest(teacherAgent, 'opettaja', 6);
        allrolesTests.updateTicketBaseUnsuccessfullyTest(teacherAgent, 'opettaja (vääräkurssi)', 6, superStudent);
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
            });
            done();
          });
        });
    
        it('lähettää tuodut tiketin palvelimelle', function(done) {
          teacherAgent.post('/api/kurssi/1/ukk/vienti')
          .send(testobjects.exportJson)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.all.keys(['success']);
            expect(res.body.success).to.be.true;
            done();
          });
      
        });
        
      });
    
    });

  }

}



