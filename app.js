
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var flash = require('connect-flash');
var partials = require('express-partials');


var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');

  app.use(partials()); 
  app.use(flash());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret:settings.cookieSecret,
    store:new MongoStore({
      db:settings.db
    })
  }));
  

  app.use(function(req, res, next) {
    //res.user = req.session.user;

    res.locals.user = req.session.user;

    var err = req.flash('error');
    if (err.length) {
      res.locals.error = err;
    } else {
      res.locals.error = null;
    }

    var suc = req.flash('success');
    if (suc.length) {
      res.locals.success = suc;
    } else {
      res.locals.success = null;
    }

    next();
  });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// app.dynamicHelpers({
//   user: function(req, res) {
//     return req.session.user;
//   },

//   err : function(req, res) {
//     var error = req.flash('error');
//     if (error.length) {
//       return error;
//     } else {
//       return null;
//     }
//   },

//   suc : function(req, res) {
//     var success = req.flash('success');
//     if (success.length) {
//       return success;
//     } else {
//       return null;
//     }
//   }
// });

routes(app);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get('/', routes.index);
// app.get('/hello', routes.hello);
// app.get('/info', routes.info);
 

// // Ziqi Web Router
// app.get('/login', routes.login);
// app.get('/logout', routes.logout);
// app.get('/u/:users', routes.users);
// app.get('/reg', routes.doReg);

// app.post('/reg', routes.reg);
// app.post('/post', routes.post);
// app.post('/login', routes.doLogin);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
