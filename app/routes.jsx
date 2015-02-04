'use strict';
var React = require('react/addons');
var ReactRouter = require('react-router');

var Route = ReactRouter.Route;
var DefaultRoute = ReactRouter.DefaultRoute;
var NotFoundRoute = ReactRouter.NotFoundRoute;
var RouteHandler = ReactRouter.RouteHandler;

var notfound = require('./routes/404.jsx');
var blank = require('./routes/blank.jsx');

/* ROUTES */
module.exports = (
  <Route handler={ReactRouter.RouteHandler}>
    <DefaultRoute handler={blank} />
    <Route path='/' handler={blank} />
    <NotFoundRoute handler={notfound} />
  </Route>
);
