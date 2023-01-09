var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//added new
var usersRouter = require('./routes/users');
var adminsRouter = require('./routes/admin');
var hbs = require('express-handlebars');
var app = express();
var fileupload = require('express-fileupload');
var db = require('./config/connection');
var sessions = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//added new
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/' }))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//added new
app.use(fileupload());
app.use('/public/product-image', express.static(__dirname + '/public/product-image'));
app.use(sessions({ secret: "keyboard cat", cookie: { maxAge: 600000 } }))

db.connect((err) => {
  if (err)
    console.log('Connection error' + err);
  else
    console.log('Database Connected');
})


app.use('/', usersRouter);
app.use('/admin', adminsRouter);


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
