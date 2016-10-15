(function() {
  var MongoClient, Server, app, bodyParser, configDB, cookieParser, express, flash, mongoose, morgan, passport, path, session;

  express = require('express');

  mongoose = require('mongoose');

  passport = require('passport');

  flash = require('connect-flash');

  morgan = require('morgan');

  cookieParser = require('cookie-parser');

  session = require('express-session');

  configDB = require('./config/database.js');

  path = require('path');

  bodyParser = require('body-parser');

  MongoClient = require('mongodb').MongoClient;

  Server = require('mongodb').Server;

  app = express();

  app.set('port', process.env.PORT || 3000);

  mongoose.connect(configDB.url);

  require('./config/passport')(passport);

  app.use(morgan('dev'));

  app.use(cookieParser());

  app.use(bodyParser());

  app.set('view engine', 'ejs');

  app.use(session({
    secret: 'smartins'
  }));

  app.use(passport.initialize());

  app.use(passport.session());

  app.use(flash());

  require('./app/routes.js')(app, passport);

  app.use(express["static"](path.join(__dirname, 'public')));

  app.listen(process.env.PORT || 3000, function() {
    return console.log('Server listening on port 3000...');
  });

}).call(this);
