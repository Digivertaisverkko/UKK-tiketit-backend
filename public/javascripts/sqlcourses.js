const { countReset, error } = require('console');
const crypto = require('crypto');
const { Pool, Client } = require('pg');

const connection = require('./connection.js');
const con = connection.getConnection();

module.exports = {

  getAllCourses: function() {
    return connection.query('SELECT id, nimi FROM core.kurssi', []);
  },

  getCoursesWithIdList: function(courseIdList) {
    return connection.query('SELECT nimi FROM core.kurssi WHERE id=ANY($1)', [courseIdList]);
  },

  getAllCoursesWithUser: function(userid) {
    const query = 'SELECT kurssi, asema FROM core.kurssinosallistujat WHERE profiili=$1'
    return connection.query(query, [userid]);
  },

  getCourseInfo: function(courseId) {
    const query = 'SELECT id, nimi FROM core.kurssi WHERE id=$1';
    return connection.queryOne(query, [courseId]);
  },

  isCourseActive: function(courseId) {
    const query = 'SELECT kurssi \
    FROM core.tiketti t INNER JOIN core.kommentti k \
    ON t.id = k.tiketti \
    WHERE t.kurssi = $1 AND k.aikaleima >= NOW() - INTERVAL \'14 days\'';
    return connection.queryAll(query, [courseId])
    .then((courseIdList) => {
      if (courseIdList.length > 0) {
        return Promise.resolve(true);
      } else {
        return Promise.reject();
      }
    }); 

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
    SELECT id, kuvaus FROM core.tikettipohja \
    WHERE kurssi=$1';
    return connection.query(query, [courseid]);
  },

  getFieldsOfTicketBase: function(ticketbaseid) {
    const query = '\
    SELECT id, otsikko, pakollinen, esitaytettava, valinnat, ohje \
    FROM core.tikettipohjankentat tk \
    INNER JOIN core.kenttapohja kp \
      ON kp.id=tk.kentta \
    WHERE tk.tikettipohja=$1';
    return connection.queryAll(query, [ticketbaseid])
    .then((ticketBaseList) => {
      for (let index in ticketBaseList) {
        let base = ticketBaseList[index];
        base.valinnat = base.valinnat.split(';');
      }
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

  removeUserFromAllCourses: function(userid) {
    const query = 'DELETE FROM core.kurssinosallistujat WHERE profiili=$1';
    return connection.queryNone(query, [userid]);
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

  getTeachersOfCourse(courseid) {
    const query = '\
    SELECT p.id, p.nimi, p.sposti, ko.asema FROM core.kurssinosallistujat ko \
    INNER JOIN core.profiili p \
    ON p.id = ko.profiili \
    WHERE ko.kurssi=$1 AND ko.asema=$2'; 

    return connection.queryAll(query, [courseid, 'opettaja']);
  },

  getAllParticipantsOfCourse(courseid) {
    const query = '\
    SELECT p.id, p.nimi, p.sposti, ko.asema FROM core.kurssinosallistujat ko \
    INNER JOIN core.profiili p \
    ON p.id = ko.profiili \
    WHERE ko.kurssi=$1';

    return connection.queryAll(query, [courseid]);
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

  insertNewField(title, prefilled, mandatory, tip, choices) {
    const query = '\
    INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) \
    VALUES ($1, $2, $3, $4, $5, $6) \
    RETURNING id';
    let choicesString = choices.join(';');
    return connection.queryAll(query, [title,
                                       1,
                                       prefilled,
                                       mandatory,
                                       tip,
                                       choicesString]);
  },

  insertFieldsToTicketBase: function(courseid, fieldArray) {
    let storedTicketId;
    return module.exports.getTicketBasesOfCourse(courseid)
    .then((ticketIdList) => {
      storedTicketId = ticketIdList[0].id;
      let promiseChain = Promise.resolve();
      for (index in fieldArray) {
        let element = fieldArray[index];
        promiseChain = promiseChain.then(() => {
          return module.exports.insertNewField(element.otsikko, 
                                               element.esitaytettava, 
                                               element.pakollinen, 
                                               element.ohje, 
                                               element.valinnat);
        })
        .then((fieldIdList) => {
          let id = fieldIdList[0].id;
          return module.exports.connectTicketBaseToField(storedTicketId, id);
        });
      }
      return promiseChain;
    });
  },

  updateDescriptionOfTicketBase: function(courseid, description) {
    const query = '\
    UPDATE core.tikettipohja \
    SET kuvaus=$1 \
    WHERE kurssi=$2';
    return connection.queryNone(query, [description, courseid]);
  },

  connectTicketBaseToField: function(ticketbaseid, fieldid) {
    const query = '\
    INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) \
    VALUES ($1, $2)';
    return connection.queryNone(query, [ticketbaseid, fieldid]);
  }


};

