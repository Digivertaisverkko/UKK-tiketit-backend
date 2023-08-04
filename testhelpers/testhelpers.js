const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');

const expect = chai.expect;


module.exports = {

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
      expect(res).to.have.status(httpStatus);
      expect(res.body.error.tunnus).to.equal(errorCode);
      expect(res.body.error.virheilmoitus).to.exist;
      done();
    });
  },

  testNoContent: function(url, verb, agent, body, done) {
    this.testQuery(url, verb, agent, body)
    .end((err, res) => {
      expect(res).to.have.status(204);
      expect(res.body).to.be.empty;
      done();
    })
  },







 testSuccessfullStudentCommenting: function(agent, message, courseId, ticketId, done) {

    agent.post(`/api/kurssi/${courseId}/tiketti/${ticketId}/kommentti`)
    .send({
      'viesti': message,
      'tila': 1
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
        done();
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
        done();
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
        done();
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
        done();
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
        done();
      });
    });
  })

}

}

