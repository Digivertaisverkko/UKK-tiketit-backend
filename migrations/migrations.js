const connection = require('../public/javascripts/connection.js');

module.exports = {
  doMigration: async function(version) {
    console.log('------------------------------');
    console.log('Starting database migration...');
    console.log('------------------------------');

    const { default: Postgrator } = await import('postgrator');

    // pg hakee automaattisesti DB-yhteyden parametrit ympäristömuuttujista
    const pool = connection.getConnection();
    const client = await pool.connect();

    // postgrator instanssin asetukset
    const postgrator = new Postgrator({
      migrationPattern: __dirname + '/sql/*',
      driver: "pg",
      database: process.env.PGDATABASE,
      schemaTable: "public.postgratorschemaversion",
      currentSchema: "public",  // SET search_path TO public;
      execQuery: (query) => client.query(query),
    });

    // Suoritetaan tietokannan päivittäminen tiettyyn versioon
    const appliedMigrations = await postgrator.migrate(version);
    console.log(appliedMigrations);

    // Suljetaan käytetty DB yhteys
    await client.release();

    console.log('--------------------------');
    console.log('Database migration - DONE!');
    console.log('--------------------------');
  }
};