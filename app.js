var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const lti = require('ltijs').Provider;
const Database = require('ltijs-sequelize');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sqlSite = require('./routes/sql')

var app = express();

const cors = require('cors');
app.use(cors());

const port = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Setup ltijs
const setupLti = async () => {
  // DB connection for LTI
  const db = new Database('dvvukk_lti', 'dvvukk_admin', 'salasana', 
    { 
      host: 'localhost',
      dialect: 'postgres',
      logging: false 
    });

  lti.setup('EXAMPLEKEY', { plugin: db }, {
    cookies: {
      secure: false,
      sameSite: ''
    },
    devMode: true});

  // Start LTI provider in serverless mode
  await lti.deploy({ serverless: true });

  // Register platform
  await lti.registerPlatform({
    url: 'http://localhost/moodle',
    name: 'Platform',
    clientId: 'dKxA5MpPAMAIvVd',
    authenticationEndpoint: 'http://localhost/moodle/mod/lti/auth.php',
    accesstokenEndpoint: 'http://localhost/moodle/mod/lti/token.php',
    authConfig: { method: 'JWK_SET', key: 'http://localhost/moodle/mod/lti/certs.php' }
  });

  // Redirect to app after succesful connections
  lti.onConnect(async (token, req, res) => {
    return lti.redirect(res, 'http://localhost:4200');
  })
}

setupLti();

// Mount Ltijs express app into preexisting express app with /lti prefix
app.use('/lti', lti.app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

