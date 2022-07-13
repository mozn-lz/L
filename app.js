const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var expressSession = require('express-session');

const indexRouter = require('./routes/index');
const registerRouter = require('./routes/register');
const usersRouter = require('./routes/users');
const searchRouter = require('./routes/search');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(expressSession({ secret: 'max', saveUninitialized: false, resave: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use('/', indexRouter);
app.use('/', registerRouter);
app.use('/', usersRouter);
app.use('/', searchRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log('err time ', Date.now());
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
