require('./globals');

var fs = require('fs');
var path = require('path');
var config = require('config');
var express = require('express');
var compression = require('compression');
var expressBeautify = require('express-beautify')();

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(compression());
app.use(express.static(path.join(process.cwd(), 'public')));

var package = require('./package.json');

// Let the config file overrule the environment
var port = config.get('port') || process.env.PORT;
var environment = config.get('environment') || process.env.NODE_ENV;

// Only use expressBeautify on development
if (environment == 'development') {
  app.use(expressBeautify);
}

var routes = require('./app/routes.jsx');

// Render the React application
var renderApp = function(req, res, cb) {

  // Create the router
  var router = ReactRouter.create({
    routes: routes,
    location: req.url,
    onAbort: function(redirect) {
      cb({redirect: redirect});
    },
    onError: function(err) {
      console.log(err);
    }
  });

  // Run the router
  router.run(function(Handler, state) {

    var err = null;

    var displayName = state.routes[state.routes.length - 1].handler.displayName;

    if(displayName === 'PageNotFound') {
      err = {notFound: true};
    }

    cb(err, React.renderToString(<Handler/>));
  });
};

/** CATCH-ALL ROUTE **/
app.get('*', function(req, res, next) {
  renderApp(req, res, function(err, html, token) {

    if (err && err.redirect){
      return res.redirect(err.redirect.to);
    }

    if (err && err.notFound){
      res.status(404);
    }

    res.render('index', {
      title: 'React Boilerplate App',
      app: html,
      version: package.version,
      production: environment == 'production'
    });
  });
});

var server = app.listen(port, function() {
  try {
    process.send('CONNECTED');
  } catch(e) {}
});

process.on('uncaughtException', function(err) {
  console.log(arguments);
  process.exit(0);
});

console.log('\n');
console.log(",-------------,");
console.log('| App Started |');
console.log("'-------------'");
console.log('\n');
console.log('PORT: ' + port);
console.log('VERSION: '+ package.version);
console.log('ENVIRONMENT: ' + environment + '\n');
