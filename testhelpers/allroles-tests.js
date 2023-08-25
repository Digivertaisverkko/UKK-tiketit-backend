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

          console.log('Kirjaudu sisään: ' + username + ' ' + password);
          
          
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
        expect(res.body).to.be.an('array').with.lengthOf.at.least(expectedTicketCount);
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
        let message = 'Tämän testiviestin pitäisi mennä läpi ilman kenttätauluja';
        agent.post('/api/kurssi/1/tiketti')
        .send({
          'otsikko': 'Viesti ilman kenttätauluja',
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



  updateTicketSuccessfullyTest: function(agent, agentDescription, courseId, ticketId) {
    describe(`Tiketin päivitys (${agentDescription})`, function() {

      it('päivittää tiketin tiedot', function(done) {
        let title = 'Päivitetyn tiketin otsikko (' + agentDescription + ')';
        let message = `Päivitetyn tiketin sisältö (${agentDescription})`;

        agent.put(`/api/kurssi/${courseId}/tiketti/${ticketId}`)
        .send({
          'otsikko': title,
          'viesti': message,
          'kentat': 
          [{
            'id': 1,
            'arvo': 'asd 1'
          },
          {
            'id': 2,
            'arvo': 'asd 2'
          }
        ]
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object').with.keys(['success']);
          expect(res.body.success).to.be.true;
          testhelpers.check.success.ticketHasCorrectData(agent, courseId, ticketId, title, message, true, done);
        });
      });

      it('päivittää tiketin tiedot ilman viestiä', function(done) {
        let title = 'Päivitetyn tiketin otsikko 2 (' + agentDescription + ')';

        agent.put(`/api/kurssi/${courseId}/tiketti/${ticketId}`)
        .send({
          'otsikko': title,
          'kentat': 
          [{
            'id': 1,
            'arvo': 'asd 1'
          },
          {
            'id': 2,
            'arvo': 'asd 2'
          }
        ]
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object').with.keys(['success']);
          expect(res.body.success).to.be.true;
          testhelpers.check.success.ticketHasCorrectData(agent, courseId, ticketId, title, null, true, done);
        });
      });

      it('päivittää tiketin tiedot ilman mitään sisältöä', function(done) {
        agent.put(`/api/kurssi/${courseId}/tiketti/${ticketId}`)
        .send({})
        .end((err, res) => {
          testhelpers.check.error.wrongParameters(res, () => {
            testhelpers.check.success.ticketHasCorrectData(agent, courseId, ticketId, "", "", false, done);
          });
        })
      });

      it('päivittää tiketin tiedot ilman mitään otsikkoa', function(done) {
        let message = `Päivitetyn tiketin sisältö 3 (${agentDescription})`;

        agent.put(`/api/kurssi/${courseId}/tiketti/${ticketId}`)
        .send({
          'viesti': message,
          'kentat': 
          [{
            'id': 1,
            'arvo': 'asd 1'
          },
          {
            'id': 2,
            'arvo': 'asd 2'
          }
        ]
        })
        .end((err, res) => {
          testhelpers.check.error.wrongParameters(res, () => {
            testhelpers.check.success.ticketHasCorrectData(agent, courseId, ticketId, null, message, false, done);
          });
        })
      });

      it('päivittää tiketin tiedot ilman kenttiä', function(done) {
        let title = 'Päivitetyn tiketin otsikko 4 (' + agentDescription + ')';
        let message = `Päivitetyn tiketin sisältö 4 (${agentDescription})`;

        agent.put(`/api/kurssi/${courseId}/tiketti/${ticketId}`)
        .send({
          'otsikko': title,
          'viesti': message
        })
        .end((err, res) => {
          testhelpers.check.error.wrongParameters(res, () => {
            testhelpers.check.success.ticketHasCorrectData(agent, courseId, ticketId, title, message, false, done);
          });
        });
      });

    });
  },

  updateTicketUnsuccessfullyTest: function(agent, agentDescription, courseId, ticketId, checkerAgent) {

    describe(`Tiketin muokkausta, oikeuksitta (${agentDescription})`, function() {
      it('päivittää tiketin tiedot ilman oikeuksia', function(done) {
        let title = 'Päivitetyn tiketin virheellinen otsikko (' + agentDescription + ')';
        let message = `Päivitetyn tiketin virheellinen sisältö (${agentDescription})`;

        agent.put(`/api/kurssi/${courseId}/tiketti/${ticketId}`)
        .send({
          'otsikko': title,
          'viesti': message,
          'kentat': 
          [{
            'id': 1,
            'arvo': 'asd 1'
          },
          {
            'id': 2,
            'arvo': 'asd 2'
          }
        ]
        })
        .end((err, res) => {
          testhelpers.check.error.noAccess(res, () => {
            testhelpers.check.success.ticketHasCorrectData(checkerAgent, courseId, ticketId, title, message, false, done);
          });
        });
      });
    });

  },


  fetchTicketBaseSuccessfullyTest: function(agent, agentDescription, courseId) {
    describe('Tikettipohjan hakeminen (' + agentDescription + ')', function() {
      it('hakee kurssin tikettipohjan', function(done) {
        agent.get(`/api/kurssi/${courseId}/tikettipohja/kentat`)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.all.keys(['kuvaus', 'kentat']);
          expect(res.body.kuvaus).to.be.a('string');
          expect(res.body.kentat).to.be.an('array');
          res.body.kentat.forEach(element => {
            expect(element).to.have.all.keys(['id','otsikko','pakollinen',
                                              'esitaytettava','esitaytto','ohje',
                                              'valinnat']);
          });
          if (done) done();
        });
      });
    });
  },


  updateTicketBaseSuccessfullyTest: function(agent, agentDescription, courseId) {

    describe(`Tikettipohjan muokkaminen (${agentDescription})`, function() {

      it('päivittää kurssin tikettipohjan', function(done) {
        let newFields = [
          {
            otsikko: 'Muokattu kenttä 1',
            pakollinen: true,
            esitaytettava: true,
            ohje: 'ohje 1',
            valinnat: ['Valinta 1', 'Valinta 2']
          },
          {
            otsikko: 'Muokattu kenttä 2',
            pakollinen: false,
            esitaytettava: false,
            ohje: 'ohje 2',
            valinnat: ['Valinta 3', 'Valinta 4']
          }
        ];

        agent.put(`/api/kurssi/${courseId}/tikettipohja/kentat`)
        .send({
          kentat: newFields
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(['success'])
          testhelpers.check.success.ticketBaseHasCorrectData(agent, courseId, null, newFields, true, done);
        });
      });

      it('päivittää kurssin tikettipohjan kuvauksen', function(done) {
        let description = "Automaattitestin luoma kuvaus";

        agent.put(`/api/kurssi/${courseId}/tikettipohja/kuvaus`)
        .send({
          "kuvaus": description
        })
        .end((err, res) => {
          testhelpers.check.success.normalSuccess(err, res, () => {
            testhelpers.check.success.ticketBaseHasCorrectData(agent, courseId, description, null, true, done);
          });
        });
      });

    });

  },

  fetchTicketBaseUnsuccessfullyTest: function(agent, agentDescription, courseId) {
    describe('Tikettipohjan haku ilman oikeuksia', function() {
      it('hakee kurssin tikettipohjan ilman oikeuksia (' + agentDescription + ')', function(doned) {
        agent.get(`/api/kurssi/${courseId}/tikettipohja/kentat`)
        .send({})
        .end((err, res) => {
          testhelpers.check.error.noAccess(res, doned);
        });
      });
    });
    console.log('qweqweqwe');
  },

  updateTicketBaseUnsuccessfullyTest: function(agent, agentDescription, courseId, checkerAgent) {

    describe(`Tikettipohjan päivitys ilman oikeuksia (${agentDescription})`, function() {
      
      it (`muokkaa tikettipohjan kenttiä ilman oikeuksia (${agentDescription})`, function(done) {
        let newFields = [
          {
            otsikko: 'Ei mene läpi -kenttä 1',
            pakollinen: true,
            esitaytettava: true,
            ohje: 'ohje 1',
            valinnat: ['Huono', 'Huonompi']
          },
          {
            otsikko: 'Ei mene läpi -kenttä 2',
            pakollinen: false,
            esitaytettava: false,
            ohje: 'ohje 2',
            valinnat: ['Paha', 'Pahempi', 'Pahin']
          }
        ]
  
        agent.put(`/api/kurssi/${courseId}/tikettipohja/kentat`)
        .send({
          kentat: newFields
        })
        .end((err, res) => {
          testhelpers.check.error.noAccess(res, () => {
            testhelpers.check.success.ticketBaseHasCorrectData(checkerAgent, courseId, null, newFields, false, done);
          });
        });
      });

      it('päivittää kurssin tikettipohjan kuvauksen ilman oikeuksia', function(done) {
        let description = "Automaattitestin luoma epäonnistuva kuvaus";

        agent.put(`/api/kurssi/${courseId}/tikettipohja/kuvaus`)
        .send({
          "kuvaus": description
        })
        .end((err, res) => {
          testhelpers.check.error.noAccess(res, () => {
            testhelpers.check.success.ticketBaseHasCorrectData(checkerAgent, courseId, description, null, false, done);
          });
        });
      });
    })

  },







  performAllCoursePrivilegesTests: function(agent, agentDescription, expectedPrivilege) {
    describe('Käyttäjän tilitietojen hakeminen', function() {
      it('hakee käyttäjän tiedot ('+agentDescription+')', function(done) {
        agent.get('/api/minun')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(['nimi', 'sposti', 'id']);
          done();
        });
      });

      it('hakee käyttäjän kurssioikeudet ('+agentDescription+')', function(done) {
        agent.get('/api/kurssi/1/oikeudet')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(['oikeudet', 'login']);
          expect(res.body.login).to.have.keys(['lti_login', 'perus']);
          expect(res.body.oikeudet).to.have.keys(['id', 'nimi', 'sposti', 'asema']);
          expect(res.body.oikeudet.asema).to.equal(expectedPrivilege);
          done();
        });
      });

      it('hakee käyttäjän kurssioikeudet väärältä kurssilta ('+agentDescription+')', function(done) {
        agent.get('/api/kurssi/6/oikeudet')
        .send({})
        .end((err, res) => {
          testhelpers.check.error.noAccess(res, done);
        });
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
  },


  performInvitationTests: function(teacherAgent, studentAgent, unsignedAgent) {

    describe('Kurssille kutsuminen', function() {

      it('opiskelija kutsuu kurssille opiskelijan', function(done) {
        studentAgent.post('/api/kurssi/1/osallistujat/kutsu')
        .send({
          'sposti': 'testi@example.com',
          'rooli': 'opiskelija'
        })
        .end((err, res) => {
          testhelpers.check.error.noAccess(res, done);
        })
      });

      it('opiskelija kutsuu kurssille opettajan', function(done) {
        studentAgent.post('/api/kurssi/1/osallistujat/kutsu')
        .send({
          'sposti': 'testi@example.com',
          'rooli': 'opettaja'
        })
        .end((err, res) => {
          testhelpers.check.error.noAccess(res, done);
        })
      });

      it('opiskelija kutsuu kurssille roskaa', function(done) {
        studentAgent.post('/api/kurssi/1/osallistujat/kutsu')
        .send({
          'sposti': 'testi@example.com',
          'rooli': 'sdflkjl'
        })
        .end((err, res) => {
          testhelpers.check.error.wrongParameters(res, done);
        })
      });

      it('opettaja kutsuu kurssille opiskelijan', function(done) {
        teacherAgent.post('/api/kurssi/1/osallistujat/kutsu')
        .send({
          'sposti': 'testi@example.com',
          'rooli': 'opiskelija'
        })
        .end((err, res) => {
          testhelpers.check.success.normalSuccess(err, res, done);
        })
      });

      it('opettaja kutsuu kurssille opettajan', function(done) {
        teacherAgent.post('/api/kurssi/1/osallistujat/kutsu')
        .send({
          'sposti': 'testi@example.com',
          'rooli': 'opettaja'
        })
        .end((err, res) => {
          testhelpers.check.success.normalSuccess(err, res, done);
        })
      });

      it('opettaja kutsuu kurssille ilman roolia', function(done) {
        teacherAgent.post('/api/kurssi/1/osallistujat/kutsu')
        .send({
          'sposti': 'testi@example.com'
        })
        .end((err, res) => {
          testhelpers.check.error.wrongParameters(res, done);
        })
      });

      let invitationId = '';

      it('opettaja kutsuu kurssille opiskelijan, joka on jo luonut tilin', function(done) {
        teacherAgent.post('/api/kurssi/3/osallistujat/kutsu')
        .send({
          'sposti': 'esko.seppa@example.com',
          'rooli': 'opiskelija'
        })
        .end((err, res) => {
          invitationId = res.body.kutsu;
          testhelpers.check.success.normalSuccess(err, res, done);
        })
      });

      it('opettaja kutsuu kurssille opettajan, joka on jo luonut tilin', function(done) {
        teacherAgent.post('/api/kurssi/3/osallistujat/kutsu')
        .send({
          'sposti': 'marianna.laaksonen@example.com',
          'rooli': 'opettaja'
        })
        .end((err, res) => {
          testhelpers.check.success.normalSuccess(err, res, done);
        })
      });

      it('kirjautumaton käyttäjä hakee kutsun tiedot', function(done) {
        unsignedAgent.get('/api/kurssi/3/osallistujat/kutsu/'+invitationId)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.all.keys(['id', 'kurssi', 'sposti', 'vanhenee', 'rooli']);
          done();
        });
      });

      it('opiskelija hakee kutsun tiedot', function(done) {
        studentAgent.get('/api/kurssi/3/osallistujat/kutsu/'+invitationId)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.all.keys(['id', 'kurssi', 'sposti', 'vanhenee', 'rooli']);
          done();
        });
      });

      it('hakee kutsun tiedot väärältä kurssilta', function(done) {
        studentAgent.get('/api/kurssi/2/osallistujat/kutsu/' + invitationId)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          done();
        });
      });

      it('opiskelija hyväksyy kutsun', function(done) {
        studentAgent.post('/api/kurssi/3/osallistujat')
        .send({
          'kutsu': invitationId
        })
        .end((err, res) => {
          testhelpers.check.success.normalSuccess(err, res, () => {
            studentAgent.get('/api/kurssi/3/oikeudet')
            .send({})
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.keys(['login', 'oikeudet']);
              expect(res.body.login).to.have.keys(['lti_login', 'perus']);
              done();
            });
          });
        });
      });

    });

  }

}