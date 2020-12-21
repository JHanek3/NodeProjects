var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash')

var indexRouter = require('./routes/index');
var firstProjectRouter = require('./routes/project1')
var secondProjectRouter = require('./routes/project2')
var thirdProjectRouter = require('./routes/project3')
var fourthProjectRouter = require('./routes/project4')
var fifthProjectRouter = require('./routes/project5')
var sixthProjectRouter = require('./routes/project6')

var compression = require('compression')
var helmet = require('helmet')
const { allowedNodeEnvironmentFlags } = require('process');

var app = express();

//dotenv
require('dotenv').config()

//middleware for helmet
app.use(helmet())

//Setup first mongo connection
var mongoose = require('mongoose')
//atlas gave us this url
var mongoDB = process.env.dev_db_url
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection'))

//Compress all routes
app.use(compression())

// view engine setup
app.engine('pug', require('pug').__express)
app.set('views', path.join(__dirname, 'views/'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//passport middleware setup, need flash for our success and failure messages
app.use(flash())
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())

//make messages accesible in every view
app.use(function(req, res, next) {
  //before every route attach the flash messages and current user to res.locals
  res.locals.alert = req.flash()
  res.locals.currentUser = req.user
  next()
})

//Setup the routers
app.use('/', indexRouter);
app.use('/firstProject', firstProjectRouter)
app.use('/secondProject', secondProjectRouter)
app.use('/thirdProject', thirdProjectRouter)
app.use('/fourthProject', fourthProjectRouter)
app.use('/fifthProject', fifthProjectRouter)
app.use('/sixthProject', sixthProjectRouter)

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

module.exports = app;
