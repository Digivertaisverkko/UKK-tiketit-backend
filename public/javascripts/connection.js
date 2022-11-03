const { Pool, Client } = require('pg');

module.exports = {
    getConnection: function() {
        return con;
    }
};


const con = new Pool();

con.query('SELECT NOW()', (err, res) => {
  console.log(err, res);
  //con.end();
});