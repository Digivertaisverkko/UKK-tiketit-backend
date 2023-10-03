const testhelpers = require("../testhelpers.js");
const allrolesTests = require("../allroles-tests.js");
const testobjects = require('../test-objects.js');

const CONSTS = require("../test-const.js");

const chai = require("chai");
const { all } = require("express/lib/application.js");
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
    
      allrolesTests.fetchTicketSuccesfullyTest(teacherAgent, 'opettaja (opiskelijat tiketti)', CONSTS.COURSE.DEFAULT, CONSTS.TICKET.BY_STUDENT);
      allrolesTests.fetchTicketSuccesfullyTest(teacherAgent, 'opettaja (oma tiketti)', CONSTS.COURSE.DEFAULT, CONSTS.TICKET.BY_TEACHER);
    
      allrolesTests.postNewTicketTests(teacherAgent, 'opettaja');

      describe('Tiketin muokkausta, kun tiketti ei ole opettajan oma', function () {
        allrolesTests.updateTicketUnsuccessfullyTest(teacherAgent, 'opettaja', CONSTS.COURSE.DEFAULT, CONSTS.TICKET.BY_STUDENT, superTeacher);
      });

      describe('Tiketin muokkausta kurssilla, jolla opettaja ei ole osallistujana', function() {
        allrolesTests.updateTicketUnsuccessfullyTest(teacherAgent, 'opettaja', CONSTS.COURSE.NO_ACCESS, CONSTS.TICKET.NO_ACCESS, superTeacher);
      });

      describe('Tiketin muokkausta kurssilla, jolla opettaja on luonut tiketin, muttei ole enää osallistujana', function() {
        allrolesTests.updateTicketUnsuccessfullyTest(teacherAgent, 'opettaja', CONSTS.COURSE.OLD_ACCESS, CONSTS.TICKET.OLD_ACCESS_BY_TEACHER, superTeacher);
      });
    
      describe('Opettajan tikettipohjan testit', function() {
        allrolesTests.fetchTicketBaseSuccessfullyTest(teacherAgent, 'opettaja', CONSTS.COURSE.DEFAULT);
        allrolesTests.updateTicketBaseSuccessfullyTest(teacherAgent, 'opettaja', CONSTS.COURSE.DEFAULT);
        allrolesTests.fetchTicketBaseUnsuccessfullyTest(teacherAgent, 'opettaja', CONSTS.COURSE.NO_ACCESS);
        allrolesTests.updateTicketBaseUnsuccessfullyTest(teacherAgent, 'opettaja (vääräkurssi)', CONSTS.COURSE.NO_ACCESS, superStudent);
      });

      describe('Opettajan liitetestit', function() {
        allrolesTests.performAllSuccesfullAttachmentTests(teacherAgent, 'opettaja', CONSTS.COURSE.DEFAULT, CONSTS.TICKET.BY_STUDENT, CONSTS.COMMENT.RESPONSE_BY_TEACHER);
        allrolesTests.postAttachmentUnsuccesfully(teacherAgent, 'opettaja', CONSTS.COURSE.NO_ACCESS, CONSTS.TICKET.NO_ACCESS, CONSTS.COMMENT.NO_ACCESS);
        allrolesTests.fetchAttachmentUnsuccesfully(teacherAgent, 'opettaja', CONSTS.COURSE.NO_ACCESS, CONSTS.TICKET.NO_ACCESS, CONSTS.COMMENT.NO_ACCESS, CONSTS.ATTACHMENT.NO_ACCESS);
      });
    
    
      describe('Opettajan tiketin vienti ja tuonti', function() {
    
        it('hakee tuotavat ukk-tiedot palvelimelta', function(done) {
          teacherAgent.get(`/api/kurssi/${CONSTS.COURSE.DEFAULT}/ukk/vienti`)
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
          teacherAgent.post(`/api/kurssi/${CONSTS.COURSE.DEFAULT}/ukk/vienti`)
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



