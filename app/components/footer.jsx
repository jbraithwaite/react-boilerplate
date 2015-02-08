'use strict';

var React = require('react/addons');

// The outer wrapper for the Router
var Footer = React.createClass({

  render: function() {
    return (
      <footer className="row" style={{marginBottom: 20}}>
        <div className="twelve columns">
          <a className="button button-primary" href="https://github.com/jbraithwaite/react-boilerplate" target="_blank">View on Github.com</a>
        </div>
      </footer>
    );
  }

});

module.exports = Footer;
