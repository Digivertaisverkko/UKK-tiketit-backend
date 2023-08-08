const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');

const ERROR = require('./../public/javascripts/errorcodes.js');

const expect = chai.expect;

/* METODIEN NIMEÄMISKÄYTÄNTÄ
Jos alkaa verbillä:
- check: Sisältää pelkästään expect-lausekkeita (ja ehkä alikutsuja muihin test-lauseisiin)
- test: toteuttaa http-pyynnöön, muttei sisällä describe- tai it-kutsuja
*/


module.exports = {

  check: {
    error: {
      response: function(res, httpStatus, errorCode, done) {
        expect(res).to.have.status(httpStatus);
        expect(res.body).to.have.all.keys(['success', 'error']);
        if (errorCode == ERROR.somethingWentWrong) {
          expect(res.body.error).to.have.all.keys(['tunnus', 'virheilmoitus', 'originaali']);
        } else {
          expect(res.body.error).to.have.all.keys(['tunnus', 'virheilmoitus']);
        }
        expect(res.body.error.tunnus).to.equal(errorCode);
        expect(res.body.error.virheilmoitus).to.exist;
        if (done) done();
      },

      notSignedIn: function(res, done) {
        this.response(res, 403, 1000, done);
      },
    
      wrongParameters: function(res, done) {
        this.response(res, 400, 3000, done);
      },
    
      unknownError: function(res, done) {
        this.response(res, 500, 3004, done);
      },
    
      noAccess: function(res, done) {
        this.response(res, 403, 1003, done);
      }
    }, //END ERROR





    success: {
      ticketPost: function(agent, res, courseId, message, done) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(['success', 'uusi']);
        expect(res.body.success).to.be.true;
        expect(res.body.uusi).to.be.an('object').that.has.all.keys(['tiketti', 'kommentti']);
        module.exports.testIfTicketWentThrough(agent, courseId, res.body.uusi.tiketti, res.body.uusi.kommentti, message, done);
      },

      //Ei testaa titleä tai messagea, jos ne on asetettu nulleiksi
      ticketHasCorrectData: function(agent, courseId, ticketId, title, initialMessage, valuesMustMatch, done) {
        agent.get(`/api/kurssi/${courseId}/tiketti/${ticketId}`)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          if (title != null) {
            expect(res.body.otsikko == title).to.equal(valuesMustMatch);
            //expect(res.body.otsikko).to.eql(title);
          }

          if (initialMessage != null) {
            this.ticketHasCorrectInitialMessage(agent, courseId, ticketId, initialMessage, valuesMustMatch, done);
          } else {
            if (done) done();
          }
        });
      },

      ticketHasCorrectInitialMessage: function(agent, courseId, ticketId, initialMessage, valuesMustMatch, done) {
        agent.get(`/api/kurssi/${courseId}/tiketti/${ticketId}/kommentti/kaikki`)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          
          res.body.sort((a,b) => {
            if (a.aikaleima < b.aikaleima) {
              return -1;
            } else if (a.aikaleima > b.aikaleima) {
              return 1;
            }
            return 0;
          });
          let firstMessage = res.body[0].viesti;

          expect(firstMessage == initialMessage).to.equal(valuesMustMatch);
          if (done) done();
        });
      }
    } //END SUCCESS
  },


  testQuery: function(url, verb, agent, body) {
    switch (verb.toLowerCase()) {
      case 'get':
        return agent.get(url).send(body);
      case 'post':
        return agent.post(url).send(body);
      case 'put':
        return agent.put(url).send(body);
      case 'delete':
        return agent.delete(url).send(body);
    }
  },




  testNoAccess: function(url, verb, agent, done) {
    this.testErrorResponse(url, verb, agent, 403, 1003, done);
  },

  testNotSignedIn: function(url, verb, agent, done) {
    this.testErrorResponse(url, verb, agent, 403, 1000, done);
  },

  testErrorResponse: function(url, verb, agent, httpStatus, errorCode, done) {
    this.testErrorResponseWithBody(url, verb, agent, {}, httpStatus, errorCode, done);
  },

  testErrorResponseWithBody: function(url, verb, agent, body, httpStatus, errorCode, done) {
    this.testQuery(url, verb, agent, body)
    .end((err, res) => {
      this.check.error.response(res, httpStatus, errorCode, done);
    });
  },

  testNoContent: function(url, verb, agent, body, done) {
    this.testQuery(url, verb, agent, body)
    .end((err, res) => {
      expect(res).to.have.status(204);
      expect(res.body).to.be.empty;
      if (done) done();
    })
  },


  testIfTicketWentThrough: function(agent, courseId, ticketId, commentId, message, done) {
    agent.get(`/api/kurssi/${courseId}/tiketti/${ticketId}/kommentti/kaikki`)
    .send({})
    .end((err, res) => {
      expect(res).to.have.status(200);
      let newComment = res.body.find((element) => element.id == commentId);
      expect(newComment).to.not.be.undefined;
      expect(newComment.viesti).to.eql(message);
      if (done) done();
    });
  },

 testSuccessfullCommenting: function(agent, message, state, courseId, ticketId, done) {

    agent.post(`/api/kurssi/${courseId}/tiketti/${ticketId}/kommentti`)
    .send({
      'viesti': message,
      'tila': state
    })
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body).to.have.keys(['success', 'kommentti']);
      expect(res.body.success).to.equal(true);
      let commentId = res.body.kommentti;

      agent.get(`/api/kurssi/${courseId}/tiketti/${ticketId}/kommentti/kaikki`)
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        let newComment = res.body.find((element) => element.id == commentId);
        expect(newComment).to.not.be.undefined;
        expect(newComment.viesti).to.eql(message);
        if (done) done();
      });
    })

 },

 performAllGenericFaqTestsToOneCourse: function(agent, agentDescription, courseId, ticketId) {

  describe('UKK-tikettien haku kurssilta '+courseId+' ('+agentDescription+')', function() {
    it('hakee kaikki kurssin ukk-tiketit ('+agentDescription+')', function(done) {
      agent.get('/api/kurssi/'+courseId+'/ukk/kaikki')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').with.lengthOf(1);
        res.body.forEach(element => {
          expect(element).to.have.keys(['id', 'otsikko', 'aikaleima', 
                                        'tila', 'kentat']);
        });
        if (done) done();
      });
    });
  
    it('hakee yhden ukk-tiketin ('+agentDescription+')', function(done) {
      agent.get('/api/kurssi/'+courseId+'/tiketti/'+ticketId)
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(['id', 'tila', 'otsikko', 'aikaleima', 
                                       'aloittaja', 'kurssi', 'ukk', 
                                       'arkistoitava']);
        expect(res.body.arkistoitava).to.eql(false);
        expect(res.body.ukk).to.eql(true);
        if (done) done();
      });
    });
  
    it('hakee ukk-tiketin kentät ('+agentDescription+')', function(done) {
      agent.get('/api/kurssi/'+courseId+'/tiketti/'+ticketId+'/kentat')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').with.length(2);
        expect(res.body[0]).to.have.keys(['id', 'arvo', 'otsikko', 'tyyppi',
                                          'ohje', 'esitaytettava', 'pakollinen',
                                          'valinnat']);
        expect(res.body[0].valinnat).to.be.an('array').with.length(1);
        expect(res.body[1].valinnat).to.be.an('array').with.length(3);
        if (done) done();
      });
    });
  
    it('hakee ukk-tiketin kommentit ('+agentDescription+')', function(done) {
      agent.get('/api/kurssi/'+courseId+'/tiketti/'+ticketId+'/kommentti/kaikki')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').with.length(2);
        res.body.forEach(element => {
          expect(element).to.have.keys(['id', 'viesti', 'lahettaja', 'aikaleima',
                                        'muokattu', 'tila', 'liitteet']);
        });
        if (done) done();
      });
    });
  })

}

}

