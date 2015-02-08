'use strict';

var React = require('react/addons');

var PageNotFound = React.createClass({
  render: function() {
    return (
      <div>
        <h1>404</h1>
        <p>The page you were looking for could not be found.
        Notice how the http status code is <code>404</code></p>
      </div>
    );
  }
});

module.exports = PageNotFound;
