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
