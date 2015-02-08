'use strict';

var React = require('react/addons');
var ReactRouter = require('react-router');

var routes = require('./routes.jsx');

var InitializeRouter = function(View) {
  React.render(<View />, document.getElementById('app-container'));
};

ReactRouter.run(routes, ReactRouter.HistoryLocation, InitializeRouter);
