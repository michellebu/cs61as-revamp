var express = require('express'),
    app = module.exports = express.createServer(),
    mongoose = require('mongoose'),
    mongoStore = require('connect-mongodb'),
    schema = require('./schema.js'),
    db,
    User;

var check = require('validator').check,
    sanitize = require('validator').sanitize;

var iform = require('iform');
var fs = require('fs');


// Converts a database connection URI string to
// the format connect-mongodb expects
/*function mongoStoreConnectionArgs() {
  return { dbname: db.db.databaseName,
           host: db.db.serverConfig.host,
           port: db.db.serverConfig.port,
           username: db.uri.username,
           password: db.uri.password };
}*/

app.set('db-uri', 'mongodb://admin:scheme@staff.mongohq.com:10082/cs61as');

schema.defineModels(mongoose, function() {
  app.User = User = mongoose.model('User');
  app.LoginToken = LoginToken = mongoose.model('LoginToken');
  db = mongoose.connect(app.set('db-uri'));
});

db = mongoose.connect(app.set('db-uri'));

app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
  secret: 'this sucks',
  store: mongoStore(db)
}));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


function loadUser(req, res, next) {
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/home');
      }
    });
  } else {
    res.redirect('/home');
  }
}


app.get('/', loadUser, function(req, res){
  res.render('index', {page: 'dashboard', currentUser: req.currentUser});
});

app.get('/home', function(req, res){
  res.render('index', {page: 'home'});
});

app.post('/login', function(req, res) {
  User.findOne({ username: req.body.user.username }, function(err, user) {
    if (user && user.authenticate(req.body.user.password)) {
      req.session.user_id = user.id;
      res.redirect('/dashboard');
    } else {
      // TODO: Show error
      res.redirect('/home');
    }
  }); 
});

var port = process.env.PORT || 8084;
app.listen(port);


