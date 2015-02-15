'use strict';

var React = require('react/addons');

// The outer wrapper for the Router
var Header = React.createClass({

  render: function() {
    return (
      <header className="row">
        <h4>React Boilerplate</h4>
      </header>
    );
  }

});

module.exports = Header;
