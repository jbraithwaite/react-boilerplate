'use strict';

var React = require('react/addons');
var ReactRouter = require('react-router');
var routes = require('./routes.jsx');

var InitializeRouter = function(View, state) {
  React.render(<View params={state.params}/>, document.getElementById('app-container'));
};

ReactRouter.run(routes, ReactRouter.HistoryLocation, InitializeRouter);
