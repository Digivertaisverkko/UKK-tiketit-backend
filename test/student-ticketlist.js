var expect = require("chai").expect;
var request = require("request");


describe("Opiskelijan näkymä tikettilistaan.", function() {

  it("Palauttaa kaikki kurssin tiketit.", function() {
    let url = "http://localhost:3000/api/kurssi/1/";
    request(url, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
    });
  });

});
