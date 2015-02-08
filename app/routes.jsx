'use strict';

var React = require('react/addons');
var ReactRouter = require('react-router');

var Route = ReactRouter.Route;
var DefaultRoute = ReactRouter.DefaultRoute;
var NotFoundRoute = ReactRouter.NotFoundRoute;
var RouteHandler = ReactRouter.RouteHandler;

var notfound = require('./routes/404.jsx');
var home = require('./routes/home.jsx');
var index = require('./routes/_index.jsx');

module.exports = (
  <Route handler={index} path='/'>
    <DefaultRoute handler={home} />
    <NotFoundRoute handler={notfound} />
  </Route>
);
