'use strict';

var React = require('react/addons');
var ReactRouter = require('react-router');

var Route = ReactRouter.Route;
var DefaultRoute = ReactRouter.DefaultRoute;
var NotFoundRoute = ReactRouter.NotFoundRoute;
var RouteHandler = ReactRouter.RouteHandler;

var notfound = require('./routes/404.jsx');
var blank = require('./routes/blank.jsx');
var index = require('./routes/index.jsx');

module.exports = (
  <Route handler={index}>
    <DefaultRoute handler={blank} />
    <Route path='/' handler={blank} />
    <NotFoundRoute handler={notfound} />
  </Route>
);
