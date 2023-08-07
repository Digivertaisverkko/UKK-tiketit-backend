


const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');

const app = require('../app.js');
const allrolesTests = require("../testhelpers/allroles-tests.js");
const testhelpers = require("../testhelpers/testhelpers.js");

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


  describe('Laittomat operaatiot kirjautumattomalle käyttäjälle', function() {
    it('kieltäytyy kirjoittamasta uutta tikettiä', function(done) {
      unsignedAgent.post('/api/kurssi/1/tiketti')
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
        testhelpers.checkNotSignedIn(res, done);
      });
    })

    it('kieltäytyy kirjoittamasta uutta kommenttia', function(done) {
      unsignedAgent.post('/api/kurssi/1/tiketti/1/kommentti')
      .send({
        'viesti': 'Tämä kommentti ei mene läpi',
        'tila': 1
      })
      .end((err, res) => {
        testhelpers.checkNotSignedIn(res, done);
      })
    })
  });

});
