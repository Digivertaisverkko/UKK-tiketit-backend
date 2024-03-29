


const chai = require("chai");

const allrolesTests = require("../allroles-tests.js");
const testhelpers = require("../testhelpers.js");

const CONSTS = require("../test-const.js");

const expect = chai.expect;

module.exports = {

  runTests: function(unsignedAgent, chai) {

    describe('Kirjautumattoman käyttäjän testausta', function() {

      this.beforeAll('alustataan tietokanta', function() {
        this.timeout(1000);
      });
    
      describe("Turhaa odottelua", function() {
        it("Hakee kurssitietoa ilman testausta.", function(done) {
      
          unsignedAgent.get(`/api/kurssi/${CONSTS.COURSE.DEFAULT}`)
          .send({})
          .end((err, res) => {
            done();
          });
        });
      });

      describe('Käyttäjän tilitietojen hakeminen', function() {
        it('hakee käyttäjän tiedot (kirjautumatta)', function(done) {
          unsignedAgent.get('/api/minun')
          .send({})
          .end((err, res) => {
            testhelpers.check.error.notSignedIn(res, done);
          });
        });
      });
    
      allrolesTests.performAllGenericFaqTests(unsignedAgent, 'kirjautumatta');
    
    
      describe('Laittomat operaatiot kirjautumattomalle käyttäjälle', function() {
        it('kieltäytyy kirjoittamasta uutta tikettiä', function(done) {
          unsignedAgent.post(`/api/kurssi/${CONSTS.COURSE.DEFAULT}/tiketti`)
          .send({
            'otsikko': 'Kirjautumattoman käyttäjän tiketti',
            'viesti': 'Kirjautumattoman käyttäjän kysymä kysymys',
            'kentat': [{
              'id': 1,
              'arvo': 'asd'
            },
            {
              'id': 2,
              'arvo': 'asdasd'
            }]
          })
          .end((err, res) => {
            testhelpers.check.error.notSignedIn(res, done);
          });
        })
    
        it('kieltäytyy kirjoittamasta uutta kommenttia', function(done) {
          unsignedAgent.post(`/api/kurssi/${CONSTS.COURSE.DEFAULT}/tiketti/${CONSTS.TICKET.BY_STUDENT}/kommentti`)
          .send({
            'viesti': 'Tämä kommentti ei mene läpi',
            'tila': 1
          })
          .end((err, res) => {
            testhelpers.check.error.notSignedIn(res, done);
          })
        })
      });
    
      describe('Tiketin hakeminen kirjautumatta', function() {
        it('hakee tiketin (ei ukk) kirjautumatta', function(done) {
          testhelpers.testNotSignedIn(`/api/kurssi/${CONSTS.COURSE.DEFAULT}/tiketti/${CONSTS.TICKET.BY_STUDENT}/`, 'get', unsignedAgent, done);
        });
      
        it('hakee tiketin kentät (ei ukk) kirjautumatta', function(done) {
          testhelpers.testNotSignedIn(`/api/kurssi/${CONSTS.COURSE.DEFAULT}/tiketti/${CONSTS.TICKET.BY_STUDENT}/kentat`, 'get', unsignedAgent, done);
        });
    
        it('hakee tiketin kommentit (ei ukk) kirjautumatta', function(done) {
          testhelpers.testNotSignedIn(`/api/kurssi/${CONSTS.COURSE.DEFAULT}/tiketti/${CONSTS.TICKET.BY_STUDENT}/kommentti/kaikki`, 'get', unsignedAgent, done);
        });
      });

      describe('Liitteiden hakeminen kirjautumatta', function() {
        it('hakee liitteen epäonnistuneesti', function(done) {
          unsignedAgent.get(`/api/kurssi/${CONSTS.COURSE.NO_ACCESS}/tiketti/${CONSTS.TICKET.NO_ACCESS}/kommentti/${CONSTS.COMMENT.NO_ACCESS}/liite/${CONSTS.ATTACHMENT.NO_ACCESS}/tiedosto`)
          .send({})
          .end((err, res) => {
            testhelpers.check.error.notSignedIn(res, done);
          });
        });
      });

    
      //allrolesTests.fetchTicketBaseUnsuccessfullyTest(unsignedAgent, 'kirjautumatta', 1);
      //allrolesTests.updateTicketBaseUnsuccessfullyTest(unsignedAgent, 'kirjautumatta', 1);
    
    });
    

  }

}

