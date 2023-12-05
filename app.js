var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var filesRouter = require('./routes/files');
var ltiRouter   = require('./routes/lti.js');
var sqlSite = require('./routes/sql');
var redirect = require('./public/javascripts/redirect.js');

var express_session = require('express-session');
var pgSessionStore = require('connect-pg-simple')(express_session);
const connection = require('./public/javascripts/connection.js');

var app = express();

const cors = require('cors');
const auth = require('./public/javascripts/auth');
const access = require('./public/javascripts/access management/access.js')
app.use(cors());

const frontendDirectory = process.env.FRONTEND_DIRECTORY || __dirname + '/static/';

let cookieSecret = [ process.env.COOKIE_SECRET ];
const timedJobs = require('./public/javascripts/timedJobs');
function updateCookieSecret() {
  return timedJobs.refreshCookieSecrets()
  .then((secrets) => {
    cookieSecret.length = 0;
    cookieSecret.push(...secrets);
  })
}
updateCookieSecret();

const sessionStoreManager = new pgSessionStore({
  pool : connection.getConnection(), // Connection pool
  schemaName: 'core',
  tableName : 'session'
  // Insert connect-pg-simple options here
})

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(cookieSecret));

const day = 86400000;

let sessionSettings = {
  secret: cookieSecret,
  resave: false,
  store: sessionStoreManager,
  saveUninitialized: false,
  proxy: true,
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


module.exports = app;
