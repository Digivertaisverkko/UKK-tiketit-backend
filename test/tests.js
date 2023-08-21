const dotenv = require('dotenv');
dotenv.config({ path: '.env.test' });

const chai = require("chai");
var request = require("request");
const chaiHttp = require('chai-http');
const fs = require('fs');


const connection = require('../public/javascripts/connection.js');
const db = require('../migrations/migrations.js');

const publicTests = require("../testhelpers/roletests/public-tests.js");
const studentTicketlist = require("../testhelpers/roletests/student-ticketlist.js");
const teacherTests = require("../testhelpers/roletests/teacher-tests.js");

chai.use(chaiHttp);


describe('Kaikki testit', function() {
  before(async function () {
    await db.doMigration("001");

    const pool = connection.getConnection();
    const client = await pool.connect();
    const sampleData = fs.readFileSync(__dirname + "/sample_data.sql", "utf8");
    await client.query(sampleData);
    await client.release();
  });

  const app = require('../app.js');
  let unsignedAgent = chai.request.agent(app);
  let studentAgent = chai.request.agent(app);
  let teacherAgent = chai.request.agent(app);

  publicTests.runTests(unsignedAgent);
  studentTicketlist.runTests(studentAgent);
  teacherTests.runTests(teacherAgent);

  after(async function () {
    await db.doMigration("000"); // tyhjennetään kanta
  });
});

