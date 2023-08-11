const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');

const app = require('../app.js');
const { forEach } = require("jszip");
const arrayTools = require("../public/javascripts/arrayTools.js");
const testhelpers = require("../testhelpers/testhelpers.js");
const allrolesTests = require("../testhelpers/allroles-tests.js");

chai.use(chaiHttp);
const expect = chai.expect;

let teacherAgent = chai.request.agent(app);
let unsignedAgent = chai.request.agent(app);


describe('Opettajan oikeuksien testaaminen', function() {

  describe('Opettajaksi sisäänkirjautuminen.', function() {
    allrolesTests.loginTest(teacherAgent, 'TestiOpettaja', 'salasana');
  });

  describe('Kurssin tikettilistojen hakeminen', function() {
    allrolesTests.getAllTicketsTest(teacherAgent, 8);

    allrolesTests.getAllTicketsFromUnattentedCourseTest(teacherAgent);
  })

  allrolesTests.performAllGenericFaqTests(teacherAgent, 'opettaja');
  allrolesTests.performSettingsTests(teacherAgent, 'opettaja');

  allrolesTests.fetchTicketSuccesfullyTest(teacherAgent, 'opettaja (opiskelijat tiketti)', 1, 1);
  allrolesTests.fetchTicketSuccesfullyTest(teacherAgent, 'opettaja (oma tiketti)', 1, 3);

  allrolesTests.postNewTicketTests(teacherAgent, 'opettaja');

  describe('Opettajan tikettipohjan testit', function() {
    allrolesTests.fetchTicketBaseSuccessfullyTest(teacherAgent, 'opettaja', 1);
    allrolesTests.updateTicketBaseSuccessfullyTest(teacherAgent, 'opettaja', 1);
    allrolesTests.fetchTicketBaseUnsuccessfullyTest(teacherAgent, 'opettaja', 6);
    allrolesTests.updateTicketBaseUnsuccessfullyTest(teacherAgent, 'opettaja (vääräkurssi)', 6);
  });

});