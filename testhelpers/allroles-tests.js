const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');
const testhelpers = require("./testhelpers");

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
      testhelpers.testNoContent('/api/kurssi/6/tiketti/kaikki',
                                'get', agent, {}, done);
    });
  },

  getAllFaqTicketsFromUnattentedCourseTest: function(agent) {
    it('hakee väärän kurssin ukk-tiketit', function(done) {
      agent.get('/api/kurssi/6/ukk/kaikki')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').with.length(1);
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
  }

}