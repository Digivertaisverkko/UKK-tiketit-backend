const testhelpers = require("../testhelpers.js");
const allrolesTests = require("../allroles-tests.js");
const TicketState = require('./../../public/javascripts/ticketstate.js');

const CONSTS = require("../test-const.js");

const chai = require("chai");
const expect = chai.expect;



module.exports = {

  runTests: function(studentAgent, superTeacher, superStudent) {

    describe('Opiskelijan oikeuksien testaamista', function() {

      this.beforeAll('alustataan tietokanta', function() {
        this.timeout(1000);
      });
    
      describe("Turhaa odottelua", function() {
        it("Hakee kurssitietoa ilman testausta.", function(done) {
      
          studentAgent.get(`/api/kurssi/${CONSTS.COURSE.DEFAULT}`)
          .send({})
          .end((err, res) => {
            done();
          });
        });
      });
      
      
      describe('Opiskelijaksi sisäänkirjautuminen.', function() {
        allrolesTests.loginTest(studentAgent, 'TestiOpiskelija', 'salasana');
      });

      allrolesTests.performAllCoursePrivilegesTests(studentAgent, 'opiskelija', 'opiskelija');
      
      
      describe('Opiskelijan näkymä tikettilistaan.', function() {
        allrolesTests.getAllTicketsTest(studentAgent, 5);
    
        allrolesTests.getAllTicketsFromUnattentedCourseTest(studentAgent);
      });
      
      
      
      
      allrolesTests.performAllGenericFaqTests(studentAgent, 'opiskelija');
      allrolesTests.performSettingsTests(studentAgent, 'opiskelija');
      
      allrolesTests.postNewTicketTests(studentAgent, 'opiskelija');
      allrolesTests.fetchTicketSuccesfullyTest(studentAgent, 'opiskelija', CONSTS.COURSE.DEFAULT, CONSTS.TICKET.BY_STUDENT);
      allrolesTests.fetchTicketUnsuccessfullyTest(studentAgent, 'opiskelija', CONSTS.COURSE.DEFAULT, CONSTS.TICKET.BY_TEACHER);
    
      allrolesTests.updateTicketSuccessfullyTest(studentAgent, 'opiskelija', CONSTS.COURSE.DEFAULT, CONSTS.TICKET.BY_STUDENT);

      describe('Tiketin muokkausta, kun tiketti ei ole opiskelijan oma', function () {
        allrolesTests.updateTicketUnsuccessfullyTest(studentAgent, 'opiskelija', CONSTS.COURSE.DEFAULT, CONSTS.TICKET.BY_TEACHER, superTeacher);
      });

      describe('Tiketin muokkausta kurssilla, jolla opiskelija ei ole osallistujana', function() {
        allrolesTests.updateTicketUnsuccessfullyTest(studentAgent, 'opiskelija', CONSTS.COURSE.NO_ACCESS, CONSTS.TICKET.NO_ACCESS, superTeacher);
      });

      describe('Tiketin muokkausta kurssilla, jolla opiskelija on luonut tiketin, muttei ole enää osallistujana', function() {
        allrolesTests.updateTicketUnsuccessfullyTest(studentAgent, 'opiskelija', CONSTS.COURSE.OLD_ACCESS, CONSTS.TICKET.OLD_ACCESS_BY_TEACHER, superTeacher);
      });
    
    
      describe('Opiskelijan tikettipohjan testit', function() {
        allrolesTests.fetchTicketBaseSuccessfullyTest(studentAgent, 'opiskelija', CONSTS.COURSE.DEFAULT);
        allrolesTests.updateTicketBaseUnsuccessfullyTest(studentAgent, 'opiskelija', CONSTS.COURSE.DEFAULT, superStudent);
        allrolesTests.fetchTicketBaseUnsuccessfullyTest(studentAgent, 'opiskelija', CONSTS.COURSE.NO_ACCESS);
      });
      
      
      
      
      
      
      
      describe('Tiketteihin kommentoiminen', function() {
      
    
        it('lisää uuden kommentin aloittamaansa tikettiin', function(done) {
          let message = 'Testirajapinnan kommentti 1';
          testhelpers.testSuccessfullCommenting(studentAgent, message, TicketState.sent, CONSTS.COURSE.DEFAULT, CONSTS.TICKET.BY_STUDENT, done);
        });
      
      
        it('lisää uuden kommentin toisen aloittamaan tikettiin', function(done) {
          let message = 'Tämä viesti ei mene läpi, koska käyttäjällä ei ole oikeuksia tikettiin.';
          testhelpers.testErrorResponseWithBody(
            `/api/kurssi/${CONSTS.COURSE.DEFAULT}/tiketti/${CONSTS.TICKET.BY_TEACHER}/kommentti`,
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
          testhelpers.testSuccessfullCommenting(studentAgent, message, TicketState.sent, CONSTS.COURSE.DEFAULT, CONSTS.TICKET.BY_STUDENT_2, done);
        });
    
    
    
        it('päivittää oman kommentin', function(done) {
          let message = 'Automaattitestin päivittämä kommentti.';
    
          studentAgent.put(`/api/kurssi/${CONSTS.COURSE.DEFAULT}/tiketti/${CONSTS.TICKET.BY_STUDENT}/kommentti/${CONSTS.COMMENT.INITIAL_BY_STUDENT}`)
          .send({
            'viesti': message
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.keys(['success']);
            expect(res.body.success).to.equal(true);
    
            studentAgent.get(`/api/kurssi/${CONSTS.COURSE.DEFAULT}/tiketti/${CONSTS.TICKET.BY_STUDENT}/kommentti/kaikki`)
            .send({})
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.an('array');
              let editedComment = res.body.find((element) => element.id == CONSTS.COMMENT.INITIAL_BY_STUDENT);
              expect(editedComment).to.exist;
              expect(editedComment.viesti).to.eql(message);
              done();
            });
          });
        });
      });   


    });
    

  }

}


