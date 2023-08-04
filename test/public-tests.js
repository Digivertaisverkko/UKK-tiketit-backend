


const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');

const app = require('../app.js');
const allrolesTests = require("../testhelpers/allroles-tests.js");

chai.use(chaiHttp);
const expect = chai.expect;

let unsignedAgent = chai.request.agent(app);
/*
describe("Kurssin julkiset tiedot", function() {
  it("Palauttaa kurssin nimet.", function(done) {

    agent.get('/api/kurssi/1')
    .send({})
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body).to.include.any.keys(['id', 'nimi']);
      done();
    });
  });
});
*/

describe('Kirjautumattoman käyttäjän testausta', function() {

  this.beforeAll('alustataan tietokanta', function() {

  });

  describe("Turhaa odottelua", function() {
    it("Hakee kurssitietoa ilman testausta.", function(done) {
  
      unsignedAgent.get('/api/kurssi/1')
      .send({})
      .end((err, res) => {
        done();
      });
    });
  });

  allrolesTests.performAllGenericFaqTests(unsignedAgent, 'kirjautumatta');

});
