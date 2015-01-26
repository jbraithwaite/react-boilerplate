'use strict';

require('../globals/client');

var routes = require('./routes.jsx');

var rootInstance = null;

var InitializeRouter = function(View) {
  rootInstance = React.render(<View />, document.getElementById('app-container'));
};

if (module.hot) {
  require('react-hot-loader/Injection').RootInstanceProvider.injectProvider({
    getRootInstances: function () {
      // Help React Hot Loader figure out the root component instances on the page:
      return [rootInstance];
    }
  });
}

ReactRouter.run(routes, ReactRouter.HistoryLocation, InitializeRouter);
