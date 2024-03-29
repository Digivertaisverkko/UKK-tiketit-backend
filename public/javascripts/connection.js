const { Pool, Client } = require('pg');
const errorcodes = require('./errorcodes.js');

module.exports = {
    getConnection: function() {
        return con;
    },

    query: function(query, array) {
      return module.exports.queryAll(query, array)
      .then((sqldata) => {
        if (sqldata.length == 0) {
          return Promise.reject(errorcodes.noResults);
        } else {
          return sqldata;
        }
      });
    },

    queryOne: function(query, array) {
      return module.exports.queryAll(query, array)
      .then((sqldata) => {
        if (sqldata.length == 1) {
          return sqldata[0];
        } else {
          return Promise.reject(errorcodes.noResults);
        }
      }); 
    },

    queryNone: function(query, array) {
      return module.exports.queryAll(query, array)
      .then((sqldata) => {
        return {};
      }); 
    },

    queryAll: function(query, array) {
      return new Promise(function(resolve, reject) {
        con.query(query, array, function(err, res) {
          if (err) {
            return reject(err);
          }
          resolve(res.rows);
        });
      });
    }
};


const con = new Pool();

con.query('SELECT NOW()', (err, res) => {
  console.log(err, res);
  //con.end();
});