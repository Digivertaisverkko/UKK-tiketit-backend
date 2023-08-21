require('dotenv').config();
const cron = require('node-cron');
const lti = require('ltijs').Provider;
const Database = require('ltijs-sequelize');
const db = require('./migrations/migrations.js');
const timedJobs = require('./public/javascripts/timedJobs');

async function setupLti() {
  console.log('--------------------------------');
  console.log('Starting ltijs initialization...');
  console.log('--------------------------------');

  // DB connection for LTI
  const db = new Database(
      process.env.PGDATABASE,
      process.env.PGUSER,
      process.env.PGPASSWORD, 
      { 
        host: process.env.PGHOST,
        dialect: 'postgres',
        logging: false 
      });

  lti.setup(
      'EXAMPLEKEY',
      { plugin: db },
      {
        cookies: {
          secure: false
        },
        devMode: true,
        dynRegRoute: '/register', // Setting up dynamic registration route. Defaults to '/register'
        dynReg: {
          url: process.env.LTI_TOOL_URL + '/lti', // Tool Provider URL. Required field.
          name: 'Tukki', // Tool Provider name. Required field.
          logo: '', // Tool Provider logo URL.
          description: 'Tukki', // Tool Provider description.
          redirectUris: [], // Additional redirection URLs. The main URL is added by default.
          customParameters: {}, // Custom parameters.
          autoActivate: true // Whether or not dynamically registered Platforms should be automatically activated. Defaults to false.
        }
      });

  // Start LTI provider in serverless mode
  await lti.deploy({ serverless: true });
  
  // Redirect to app after succesful connections
  lti.onConnect(async (token, req, res) => {
    return access.loginMethods()
    .then((handle) => {
      return handle.methods.handleUnsureLti1p3Login(req, token);
    })
    .then((results) => {
      if (results.accountExists) {
        var locale = token.platformContext.launchPresentation.locale;
        redirect.redirectToCoursePageLtijs(lti, res, locale, results.courseId);
      } else {
        var locale = token.platformContext.launchPresentation.locale;
        redirect.redirectToGdprPageLtijs(lti, res, locale, results.storageId, results.accountExists);
      }
    });
  });

  console.log('----------------------------');
  console.log('ltijs initialization - DONE!');
  console.log('----------------------------');
}

db.doMigration()
.then(() => setupLti() )
.then(() => {
  console.log('------------------------------');
  console.log('Starting app initialization...');
  console.log('------------------------------');

  const app = require('./app');

  // Mount Ltijs express app into preexisting express app with /lti prefix
  app.use('/lti/1p3', lti.app);

  const port = process.env.PORT || 3000;
  app.listen(port);

  cron.schedule('0 4 * * *', () => {
    //timedJobs.archiveOldTickets(); //Kommentoitu, koska aiheutti releasessa ongelmia, ja on nopeampaa vain poistaa suht turha ominaisuus.
    timedJobs.deletePendingLtiLogins();
    timedJobs.sendAggregateEmails();
    timedJobs.deleteGdprDumps();
    timedJobs.deleteUnusedAttachments();
    app.updateCookieSecret();
  });

  console.log('-------------------');
  console.log('App startup - DONE!');
  console.log('-------------------');
  console.log('-------------------------------');
  console.log('Server is running on port ' + port);
  console.log('-------------------------------');
})
.catch(error => {
  console.error(error);
});