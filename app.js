var dotenv = require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const lti = require('ltijs').Provider;
const Database = require('ltijs-sequelize');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var filesRouter = require('./routes/files');
var ltiRouter   = require('./routes/lti.js');
var sqlSite = require('./routes/sql');
var redirect = require('./public/javascripts/redirect.js');

var express_session = require('express-session');
var pgSessionStore = require('connect-pg-simple')(express_session);
const connection = require('./public/javascripts/connection.js');

var cron = require('node-cron');
const timedJobs = require('./public/javascripts/timedJobs');

var app = express();

const cors = require('cors');
const auth = require('./public/javascripts/auth');
const access = require('./public/javascripts/access management/access.js')
app.use(cors());

const port = process.env.PORT || 3000;
const frontendDirectory = process.env.FRONTEND_DIRECTORY || __dirname + '/static/';


var cookieSecret = [process.env.COOKIE_SECRET];
updateCookieSecret()
.then(() => {
  setupApp();
})

function updateCookieSecret() {
  return timedJobs.refreshCookieSecrets()
  .then((secrets) => {
    cookieSecret.length = 0;
    cookieSecret.push(...secrets);
  })
}

cron.schedule('0 4 * * *', () => {
  //timedJobs.archiveOldTickets(); //Kommentoitu, koska aiheutti releasessa ongelmia, ja on nopeampaa vain poistaa suht turha ominaisuus.
  timedJobs.deletePendingLtiLogins();
  timedJobs.sendAggregateEmails();
  updateCookieSecret();
});

const sessionStoreManager = new pgSessionStore({
  pool : connection.getConnection(), // Connection pool
  schemaName: 'core',
  tableName : 'session'
  // Insert connect-pg-simple options here
})

function setupApp() {
  app.use(logger('dev'));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser(cookieSecret));

  const day = 86400000;

  let sessionSettings = {
    secret: cookieSecret,
    resave: false,
    store: sessionStoreManager,
    saveUninitialized: false,
    //proxy: true,
    rolling: true,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: day * 14 }
  };

  if (app.get('env') != 'development') {
    app.set('trust proxy', 1);
    sessionSettings.cookie.sameSite = 'None';
    sessionSettings.cookie.secure = true;
  }
  app.use(express_session(sessionSettings));

  app.use('/api', indexRouter);
  app.use('/lti', ltiRouter);
  app.use('/users', usersRouter);
  app.use('/api', filesRouter);
  app.use('/', express.static(frontendDirectory));

  // Mount Ltijs express app into preexisting express app with /lti prefix
  app.use('/lti/1p3', lti.app);


  // Routaa Angularin mukaan
  app.get('*', function(req, res, next) {
    let path = frontendDirectory + 'index.html';
    res.sendFile(path, function (err) {
      next(createError(404));
    });
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // send error status
    res.status(err.status || 500);
  });

  app.listen(port);
}


// Setup ltijs
const setupLti = async () => {
  // DB connection for LTI
  const db = new Database(process.env.PGDATABASE, process.env.LTIUSER, process.env.LTIPASSWORD, 
    { 
      host: process.env.PGHOST,
      dialect: 'postgres',
      logging: false 
    });

  lti.setup('EXAMPLEKEY', { plugin: db }, {
    cookies: {
      secure: false
    },
    devMode: true,
    dynRegRoute: '/register', // Setting up dynamic registration route. Defaults to '/register'
    dynReg: {
      url: process.env.LTI_TOOL_URL + '/lti', // Tool Provider URL. Required field.
      name: 'UKK-tiketit', // Tool Provider name. Required field.
      logo: '', // Tool Provider logo URL.
      description: 'Tikettijärjestelmä', // Tool Provider description.
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
}

setupLti();



module.exports = app;
