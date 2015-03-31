// Allow for jsx files
require('node-jsx').install({extension: '.jsx'});

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

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(compression());
app.use(express.static(path.join(process.cwd(), 'public')));

// Let the config file overrule the environment
var port = config.get('port');
var environment = config.get('environment');

// React App - Rendering
// -----------------------------------------------------------------------------
var renderApp = function(req, res, cb) {

  // Create the router
  var router = ReactRouter.create({

    // All of the routes for the application
    routes: routes,

    // The current requested URL
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

    // This is a hack way of figuring out if a route should 404. We check the
    // display name of the last matching route.
    var displayName = state.routes[state.routes.length - 1].handler.displayName;

    // If the display name is `PageNotFound` (what is returned in `404.jsx`)
    if (displayName === 'PageNotFound') {

      // We set the error to not found
      err = {notFound: true};
    }

    // Not using JSX here because it's nice to have a plain .js file for index.
    // Make sure to match the params the same way you do in your `router.jsx`
    cb(err, React.renderToString(React.createElement(Handler, {params: state.params})));
  });
};

// Route - Catch all
// -----------------------------------------------------------------------------
app.get('*', function(req, res, next) {

  // Time to render the React App.
  renderApp(req, res, function(err, html, token) {

    // There was a redirect
    if (err && err.redirect){
      return res.redirect(err.redirect.to);
    }

    // Page wasn't found
    if (err && err.notFound){
      res.status(404);
    }

    // Render the jade template, passing the required information
    res.render('index', {
      title: package.description,
      appName: package.name,
      app: html,
      version: package.version,
      environment: environment,
      HOT_RELOAD: process.env.HOT_RELOAD,
      webpackPort: config.get('webpack.port'),
      webpackHost: config.get('webpack.host'),
      webpackFile: config.get('webpack.file'),
      webpackPath: config.get('webpack.path')
    });
  });
});

// Start server
// -----------------------------------------------------------------------------
app.listen(port, function() {
  // If this is being run from gulp
  if (process.env.HOT_RELOAD){

    console.log('Express Server Started');

    // Notify gulp that express has been started.
    // This is used for browser sync.
    try { process.send('CONNECTED'); } catch(e) {}
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
