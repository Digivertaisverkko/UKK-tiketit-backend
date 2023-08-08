const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');
const testhelpers = require("./testhelpers");
const TicketState = require("../public/javascripts/ticketstate");

const expect = chai.expect;



module.exports = {

  loginTest: function(agent, username, password) {
    it('kirjautuu sisään', function(done) {
      agent.post('/api/login')
      .set('login-type', 'own')
      .set('code-challenge', 'ei ole')
      .set('kurssi', 1)
      .send({})
      .end((err, res) => {
        if (err != null) {
          expect(res).to.exist();
          done();
        } else {
          expect(res.body).to.include.keys(['login-url', 'login-id']);
          expect(res).to.have.status(200);
          loginid = res.body['login-id'];
          
          
          agent.post('/api/omalogin')
          .set('ktunnus', username)
          .set('salasana', password)
          .set('login-id', loginid)
          .send({})
          .end((err, res) => {
            if (err != null) {
              expect(res).to.exist();
              done();
            } else {
              expect(res.body).to.include.keys(['success', 'login-code']);
              expect(res).to.have.status(200);
              expect(res.body.success).to.equal(true);
              logincode = res.body['login-code'];
              
              
              agent.get('/api/authtoken')
              .set('login-type', 'own')
              .set('code-verifier', 'ei ole')
              .set('login-code', logincode)
              .send({})
              .end((error, response) => {
                expect(response.body).to.include.keys(['success']);
                expect(response).to.have.status(200);
                expect(response.body.success).to.equal(true);
                done();
              })
            }
          })
  
        }
      });
    });
  },


  getAllTicketsTest: function(agent, expectedTicketCount) {
    it("Palauttaa kurssin tikettilistan", function(done) {
      agent.get('/api/kurssi/1/tiketti/kaikki')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').with.length(expectedTicketCount);
        expect(res.body[0]).to.include.keys(['id', 'otsikko', 'aikaleima',
                                          'aloittaja', 'tila', 'kentat', 
                                          'liite', 'viimeisin']);
        done();
      })
    });
  },

  getAllTicketsFromUnattentedCourseTest: function(agent) {
    it('hakee väärän kurssin tikettilistan', function(done) {
      testhelpers.testNoAccess('/api/kurssi/6/tiketti/kaikki',
                                'get', agent, done);
    });
  },


  postNewTicketTests: function(agent, agentDescription) {

    let newTicketId

    describe('Uuden tiketin luominen ('+agentDescription+')', function() {
      it('luo uuden tiketin kurssille', function(done) {

        let message = 'Tämän viestin on lähettänyt ' + agentDescription;

        agent.post('/api/kurssi/1/tiketti')
        .send({
          'otsikko': 'automaattitestin onnistunut tiketti (' + agentDescription + ')',
          'viesti': message,
          'kentat': [{
            'id': 1,
            'arvo': 'arvo1'
          },
          {
            'id': 2,
            'arvo': 'arvo2'
          }]
        })
        .end((err, res) => {
          testhelpers.check.success.ticketPost(agent, res, 1, message, done);
          newTicketId = res.body.uusi.tiketti;
        });
      });

      it('luo uuden tiketin ilman kenttätauluja', function(done) {
        let message = 'Tämän testiviestin ei pitäisi olla mennyt läpi ilman kenttätauluja';
        agent.post('/api/kurssi/1/tiketti')
        .send({
          'otsikko': 'Viallinen viesti ilman kenttätauluja',
          'viesti': message,
          'kentat': []
        })
        .end((err, res) => {
          testhelpers.check.success.ticketPost(agent, res, 1, message, done);
        })
      });

      it('luo uuden tiketin tyhjällä kenttätaululla', function(done) {
        let message = 'Tämän testiviestin ei pitäisi olla mennyt läpi tyhjällä kenttätaululla';
        agent.post('/api/kurssi/1/tiketti')
        .send({
          'otsikko': 'Viallinen viesti tyhjällä kenttätaululla',
          'viesti': message,
          'kentat': [{}]
        })
        .end((err, res) => {
          testhelpers.check.error.wrongParameters(res, done);
        })
      });

      it('luo uuden tiketin väärillä kenttätauluilla', function(done) {
        let message = 'Tämän testiviestin ei pitäisi olla mennyt läpi väärillä kenttätauluilla';
        agent.post('/api/kurssi/1/tiketti')
        .send({
          'otsikko': 'Viallinen viesti väärillä kenttätauluilla',
          'viesti': message,
          'kentat': [{
            'id': 3,
            'arvo': 'asd'
          },
          {
            'id': 4,
            'arvo': 'dfg'
          }]
        })
        .end((err, res) => {
          testhelpers.check.error.wrongParameters(res, done);
        })
      });

      it('luo uuden tiketin väärälle kurssille', function(done) {

        let message = 'Tämän viestin on lähettänyt ' + agentDescription;

        agent.post('/api/kurssi/6/tiketti')
        .send({
          'otsikko': 'automaattitestin onnistunut tiketti (' + agentDescription + ')',
          'viesti': message,
          'kentat': [{
            'id': 1,
            'arvo': 'arvo1'
          },
          {
            'id': 2,
            'arvo': 'arvo2'
          }]
        })
        .end((err, res) => {
          testhelpers.check.error.noAccess(res, done);
        });
      });

      it('luo uuden tiketin ilman http-vartaloa', function(done) {
        agent.post('/api/kurssi/1/tiketti')
        .send({})
        .end((err, res) => {
          testhelpers.check.error.wrongParameters(res, done);
        })
      });


    });

  },


  fetchTicketSuccesfullyTest: function(agent, agentDescription, courseId, ticketId) {
    describe("Hae tiketti (" + agentDescription + ")", function() {
      it('Hakee tiketin perustiedot', function(done) {
        agent.get(`/api/kurssi/${courseId}/tiketti/${ticketId}`)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(['id', 'tila', 'otsikko', 'aikaleima',
                                         'aloittaja', 'kurssi', 'ukk', 
                                         'arkistoitava']);
          expect(res.body.id).to.equal(ticketId);
          expect(res.body.aloittaja).to.be.an('object');
          expect(res.body.ukk).to.equal(false);
          done();
        });
      });
    
      it("Hakee tiketin kentät", function(done) {
        agent.get(`/api/kurssi/${courseId}/tiketti/${ticketId}/kentat`)
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
        agent.get(`/api/kurssi/${courseId}/tiketti/${ticketId}/kommentti/kaikki`)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array').lengthOf.at.least(1);
          res.body.forEach(element => {
            expect(element).to.have.keys(['id', 'viesti', 'lahettaja', 
                                          'aikaleima', 'muokattu', 'tila', 
                                          'liitteet']);
          });
          done();
        });
      });
    });
  },

  fetchTicketUnsuccessfullyTest: function(agent, agentDescription, courseId, ticketId) {
    describe('Tiketin hakeminen ilman lupaa (' + agentDescription +')', function () {
      it('hakee tiketin, johon ei ole pääsyä', function(done) {
        testhelpers.testNoAccess(`/api/kurssi/${courseId}/tiketti/${ticketId}`, 'get', agent, done);
      });
  
      it('hakee tiketin kentät, johon ei ole pääsyä', function(done) {
        testhelpers.testNoAccess(`/api/kurssi/${courseId}/tiketti/${ticketId}/kentat`, 'get', agent, done);
      });
  
      it('hakee tiketin kommentit, johon ei ole pääsyä', function(done) {
        testhelpers.testNoAccess(`/api/kurssi/${courseId}/tiketti/${ticketId}/kommentti/kaikki`, 'get', agent, done);
      });
    });
  },










  performAllGenericFaqTests: function(agent, agentDescription) {
    describe('UKK-tikettien haku luvalliselta kurssilta ('+agentDescription+')', function() {
      testhelpers.performAllGenericFaqTestsToOneCourse(agent, agentDescription, 1, 7);
    });
    describe('UKK-tikettien haku kurssilta, jolle ei osallistuta ('+agentDescription+')', function() {
      testhelpers.performAllGenericFaqTestsToOneCourse(agent, agentDescription, 6, 13);
    });
  },


  performSettingsTests: function(agent, agentDescription) {
    describe('Tilitietojen käsittely ('+agentDescription+')', function() {
      it('hakee tilin tiedot', function(done) {
        agent.get('/api/minun')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.all.keys(['id', 'nimi', 'sposti']);
          done();
        });
      });
    });

    describe('Tilin asetusten käsittely ('+agentDescription+')', function() {
      it('hakee tilin asetukset', function(done) {
        agent.get('/api/minun/asetukset')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.all.keys(['sposti-ilmoitus', 'sposti-kooste', 'sposti-palaute']);
          done();
        });
      });

      it('muuttaa tilin asetuksia', function(done) {
        agent.post('/api/minun/asetukset')
        .send({
          'sposti-ilmoitus': false,
          'sposti-kooste': false,
          'sposti-palaute': false
        })
        .end((err, res) => {
          expect(res).to.have.status(200);

          agent.get('/api/minun/asetukset')
          .send({})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.all.keys(['sposti-ilmoitus', 'sposti-kooste', 'sposti-palaute']);
            expect(res.body['sposti-ilmoitus']).to.be.false;
            expect(res.body['sposti-kooste']).to.be.false;
            expect(res.body['sposti-palaute']).to.be.false;
            done();
          });

        })
      })
    })
  }

}