
const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');

const app = require('../app.js');
const publicTests = require("../testhelpers/roletests/public-tests.js");
const studentTicketlist = require("../testhelpers/roletests/student-ticketlist.js");
const teacherTests = require("../testhelpers/roletests/teacher-tests.js");

chai.use(chaiHttp);


let unsignedAgent = chai.request.agent(app);
let studentAgent = chai.request.agent(app);
let teacherAgent = chai.request.agent(app);


describe('Kaikki testit', function() {
  publicTests.runTests(unsignedAgent);
  studentTicketlist.runTests(studentAgent);
  teacherTests.runTests(teacherAgent);
});