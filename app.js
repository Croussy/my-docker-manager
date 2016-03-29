// Express
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var session = require('express-session');
// Body Parser
var bodyParser = require('body-parser');
// Passport
var passport = require('passport');
var LocalStrategy = require('passport-local');
var async = require("async");
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
// Mongo db
var mongoose = require('mongoose');
// flash
var flash = require('connect-flash');

// Configuration
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

// require('./config/password.js')(passport);

// set up express
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({ extended: true })); 

// required for passport
app.use(session({secret: 'secret'}));
app.use(passport.initialize());
app.use(passport.session());

// Public
app.use('/static', express.static('public'));

// setup flash
app.use(flash());

// Routes
require('./routes/routes.js')(app, passport);

// pass passport for configuration
require('./config/passport')(passport);

app.listen(3000);