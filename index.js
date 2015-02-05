// Allow for jsx files
require('node-jsx').install();

// Requires
// -----------------------------------------------------------------------------
var fs = require('fs');
var path = require('path');
var React = require('react/addons');
var config = require('config');
var routes = require('./app/routes.jsx');
var package = require('./package.json');
var express = require('express');
var ReactRouter = require('react-router');
var compression = require('compression');
var expressBeautify = require('express-beautify');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(compression());
app.use(express.static(path.join(process.cwd(), 'public')));

// Let the config file overrule the environment
var port = config.get('port') || process.env.PORT;
var environment = config.get('environment') || process.env.NODE_ENV;

// Only use expressBeautify on development
if (environment == 'development') {
  app.use(expressBeautify());
}

// React App - Rendering
// -----------------------------------------------------------------------------
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

    if (displayName === 'PageNotFound') {
      err = {notFound: true};
    }

    cb(err, React.renderToString(React.createElement(Handler)));
  });
};

// Route - Catch all
// -----------------------------------------------------------------------------
app.get('*', function(req, res, next) {
  renderApp(req, res, function(err, html, token) {

    if (err && err.redirect){
      return res.redirect(err.redirect.to);
    }

    if (err && err.notFound){
      res.status(404);
    }

    res.render('index', {
      title: package.description,
      appName: package.name,
      app: html,
      version: package.version,
      environment: environment,
      WPORT: process.env.WPORT,
      WHOST: process.env.WHOST
    });
  });
});

// Start server
// -----------------------------------------------------------------------------
app.listen(port, function() {
  // If this is being run from gulp
  if (process.env.FOR_GULP){
    console.log('Express Server Started');

    // Notify gulp that express has been started.
    // This is used for browser sync.
    try {
      process.send('CONNECTED');
    } catch(e) {}
  } else {
    var name = package.name;
    var dashes = '';
    for (var i = 0; i < name.length; i++) dashes += '-';

    console.log('\n');
    console.log(',-' + dashes + '-,');
    console.log('| ' + name +' |');
    console.log('\'-'+ dashes + '-\'');
    console.log('\n');
    console.log('PORT: ' + port);
    console.log('VERSION: '+ package.version);
    console.log('ENVIRONMENT: ' + environment);
    console.log('DATE: ' + (new Date).toString() + '\n');
  }
});

// On Error
// -----------------------------------------------------------------------------
process.on('uncaughtException', function(err) {
  console.log(arguments);
  process.exit(0);
});
