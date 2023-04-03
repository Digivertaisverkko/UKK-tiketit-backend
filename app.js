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
var sqlSite = require('./routes/sql');

var express_session = require('express-session');
var pgSessionStore = require('connect-pg-simple')(express_session);
const connection = require('./public/javascripts/connection.js');

var app = express();

const cors = require('cors');
const auth = require('./public/javascripts/auth');
app.use(cors(/*{
  credentials: true,
  origin: ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}*/));

const port = process.env.PORT || 3000;
const frontendDirectory = process.env.FRONTEND_DIRECTORY || __dirname + '/UKK-tiketit/dist/tikettisysteemi/';


const sessionStoreManager = new pgSessionStore({
  pool : connection.getConnection(), // Connection pool
  schemaName: 'core',
  tableName : 'session'          // Use another table-name than the default "session" one
  // Insert connect-pg-simple options here
})

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));


const day = 86400000;
//app.set('trust proxy', 1) //If you have your node.js behind a proxy and are using secure: true, you need to set "trust proxy" in express 
app.use(express_session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  store: sessionStoreManager,
  saveUninitialized: false,
  //proxy: true,
  rolling: true,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: day * 14 /*, secure: true*/ }
}));

app.use('/api', indexRouter);
app.use('/users', usersRouter);
app.use('/api', filesRouter);
app.use('/', express.static(frontendDirectory));

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
    return auth.ltiLoginWithToken(token)
    .then((logindata) => {
      const coursePath = 'course';
      let url = new URL(path.join(coursePath, logindata.kurssi.toString(), 'list-tickets'), process.env.LTI_REDIRECT);
      url.searchParams.append('sessionID', logindata.sessionid);
      url.searchParams.append('lang', token.platformContext.launchPresentation.locale);
      return lti.redirect(res, url.toString());
    });
  });
}

setupLti();


// Mount Ltijs express app into preexisting express app with /lti prefix
app.use('/lti', lti.app);


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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port);

module.exports = app;
