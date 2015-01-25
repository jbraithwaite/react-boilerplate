'use strict';

var routes = require('./routes.jsx');


var InitializeRouter = function(View) {
  React.render(<View />, document.getElementById('app-container'));
};

if(Modernizr.history)
  ReactRouter.run(routes, ReactRouter.HistoryLocation, InitializeRouter);
else
  ReactRouter.run(routes, InitializeRouter);
