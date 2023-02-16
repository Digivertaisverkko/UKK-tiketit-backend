const { countReset } = require('console');
const crypto = require('crypto');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const con = connection.getConnection();

module.exports = {

  getAllCourses: function() {
    return connection.query('SELECT id, nimi FROM core.kurssi', []);
  },

  getAllCoursesWithUser: function(userid) {
    const query = 'SELECT kurssi, asema FROM core.kurssinosallistujat WHERE profiili=$1'
    return connection.query(query, [userid]);
  },

  getCourseInfo: function(courseId) {
    const query = 'SELECT id, nimi FROM core.kurssi WHERE id=$1';
    return connection.queryOne(query, [courseId]);
  },

  getLtiCourseInfo: function(ltiClientId, ltiCourseId) {
    const query = 'SELECT k.id, k.nimi \
    FROM core.kurssi k INNER JOIN core.lti_kurssi lk\
    ON k.id = lk.kurssi \
    WHERE lk.clientid=$1 AND lk.contextid=$2';
    return connection.queryAll(query, [ltiClientId, ltiCourseId]);
  },

  createCourse: function(name) {
    const query = '\
    INSERT INTO core.kurssi (nimi) \
    VALUES ($1) \
    RETURNING id';
    return connection.queryOne(query, [name])
    .then((sqldata) => { return sqldata.id });
  },

  createCourseFromScratch: function(name, instruction, creatorId=null) {
    let storedcourseid;
    return module.exports.createCourse(name)
    .then((courseid) => {
      storedcourseid = courseid;
      if (creatorId !== null) {
        return module.exports.addUserToCourse(courseid, creatorId, true);
      }
    })
    .then(() => {
      return module.exports.createTicketBase(instruction, storedcourseid);
    })
    .then(() => {
      return storedcourseid;
    });
  },

  getAndCreateLtiCourse: function(name, ltiClientId, ltiContextId) {
    const query = 'INSERT INTO core.lti_kurssi (clientid, contextid, kurssi) VALUES ($1, $2, $3)';
    return module.exports.getLtiCourseInfo(ltiClientId, ltiContextId)
    .then((courseList) => {
      if (courseList.length == 0) {
        return module.exports.createCourseFromScratch(name, "")
        .then((courseid) => {
          return connection.queryNone(query, [ltiClientId, ltiContextId, courseid])
          .then(() => {
            return courseid;
          });
        });
      } else {
        return courseList[0].id;
      }
    });
  },

  createTicketBase: function(description, courseid) {
    const query = '\
    INSERT INTO core.tikettipohja (kurssi, kuvaus) \
    VALUES ($1, $2) \
    RETURNING id'
    return connection.queryOne(query, [courseid, description])
    .then((data) => { return data.id });
  },

  getFieldsOfTicketBaseForCourse: function(courseid) {
    return module.exports.getTicketBasesOfCourse(courseid)
    .then((tickedIdRows) => {
      return module.exports.getFieldsOfTicketBase(tickedIdRows[0].id);
    });
  },

  getTicketBasesOfCourse: function(courseid) {
    const query = '\
    SELECT id, kuvaus FROM tikettipohja \
    WHERE kurssi=$1';
    return connection.query(query, [courseid]);
  },

  getFieldsOfTicketBase: function(ticketbaseid) {
    const query = '\
    SELECT id, otsikko, pakollinen, esitaytettava, valinnat, ohje FROM tikettipohjankentat tk \
    INNER JOIN kenttapohja kp \
    ON kp.id=tk.kentta \
    WHERE tk.tikettipohja=$1';
    return connection.queryAll(query, [ticketbaseid])
    .then((ticketBaseList) => {
      console.log(1);
      for (let index in ticketBaseList) {
        console.log(2);
        let base = ticketBaseList[index];
        base.valinnat = base.valinnat.split(';');
      }
      console.log(3);
      return ticketBaseList;
    });
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
  },

  updateUserPositionInCourse: function(userid, courseid, newPosition) {
    const query = '\
    UPDATE core.kurssinosallistujat \
    SET asema=$1 \
    WHERE kurssi=$2 AND profiili=$3';
    return connection.queryNone(query, [newPosition, courseid, userid]);
  },
  
  roleInCourse: function(courseid, userid) {
    const query2 = '\
    SELECT profiili, asema FROM core.kurssinosallistujat \
    WHERE kurssi=$1 AND profiili=$2';
    return connection.queryOne(query2, [courseid, userid]);
  },

  removeAllFieldsFromTicketBase: function(courseid) {
    return module.exports.getTicketBasesOfCourse(courseid)
    .then((idList) => {
      const fieldQuery = '\
      DELETE FROM core.tikettipohjankentat \
      WHERE tikettipohja=$1'
      return connection.queryNone(fieldQuery, [idList[0].id]);
    });
  },

  insertFieldsToTicketBase: function(courseid, fieldArray) {
    let storedTicketId;
    return module.exports.getTicketBasesOfCourse(courseid)
    .then((ticketIdList) => {
      let promises = [];
      storedTicketId = ticketIdList[0].id;
      const query = '\
      INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) \
      VALUES ($1, $2, $3, $4, $5, $6) \
      RETURNING id';
      for (index in fieldArray) {
        let element = fieldArray[index];
        let choices = element.valinnat.join(';');
        promises.push(connection.queryAll(query, [element.otsikko, 1, element.esitaytettava, element.pakollinen, element.ohje, choices]));
      }
      return Promise.all(promises);
    })
    .then((fieldIdPromiseList) => {
      let promises = [];
      const query = '\
      INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) \
      VALUES ($1, $2)';
      for (index in fieldIdPromiseList) {
        /*Jokainen promise palauttaa erillisen taulun. 
        Index viittaa promiseen, jonka jälkeen promisen palauttamassa taulussa on vain 1 olio.*/
        let id = fieldIdPromiseList[index][0].id;
        promises.push(connection.queryNone(query, [storedTicketId, id]));
      }
      return Promise.all(promises);
    });
  }

};

