const crypto = require('crypto');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const con = connection.getConnection();

module.exports = {

  getAllCourses: function() {
    return connection.query('SELECT id, nimi FROM core.kurssi', []);
  },

  getCourseInfo: function(courseId) {
    const query = 'SELECT id, nimi FROM core.kurssi WHERE id=$1';
    return connection.queryOne(query, [courseId]);
  },


  createCourse: function(name) {
    const query = '\
    INSERT INTO core.kurssi (nimi) \
    VALUES ($1) \
    RETURNING id';
    return connection.queryOne(query, [name])
    .then((sqldata) => { return sqldata.id });
  },

  createTicketBase: function(description, courseid) {
    const query = '\
    INSERT INTO core.tikettipohja (kurssi, kuvaus) \
    VALUES ($1, $2) \
    RETURNING id'
    return connection.queryOne(query, [courseid, description])
    .then((data) => { return data.id });

  },

  getTicketBasesOfCourse: function(courseid) {
    const query = '\
    SELECT id, kuvaus FROM tikettipohja \
    WHERE kurssi=$1';
    return connection.queryAll(query, [courseid]);
  },

  getFieldsOfTicketBase: function(ticketbaseid) {
    const query = '\
    SELECT id, otsikko, pakollinen, esitaytettava FROM tikettipohjankentat tk \
    INNER JOIN kenttapohja kp \
    ON kp.id=tk.kentta \
    WHERE tk.tikettipohja=$1';
    return connection.queryAll(query, [ticketbaseid]);
  },

  addUserToCourse: function(courseid, userid, isTeacher) {
    const position = isTeacher ? 'opettaja' : 'opiskelija';
    const query = '\
    INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) \
    VALUES ($1, $2, $3)';

    return connection.queryNone(query, [courseid, userid, position]);
  },

  getUserInfoForCourse(userid, courseid) {
    const query = '\
    SELECT t.id, t.nimi, t.sposti, ko.asema FROM core.kurssinosallistujat ko \
    INNER JOIN core.profiili t \
    ON t.id = ko.profiili \
    WHERE ko.kurssi=$1 AND t.id=$2';

    return connection.queryOne(query, [courseid, userid]);
  },

  getUserInfoListForCourse(useridList, courseid) {
    const query = '\
    SELECT p.id, p.nimi, p.sposti, ko.asema FROM core.kurssinosallistujat ko \
    INNER JOIN core.profiili p \
    ON p.id = ko.profiili \
    WHERE ko.kurssi=$1 AND p.id = ANY ($2)'

    return connection.queryAll(query, [courseid, useridList]);
  }

};

