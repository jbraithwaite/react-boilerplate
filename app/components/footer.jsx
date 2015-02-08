'use strict';

var React = require('react/addons');

// The outer wrapper for the Router
var Footer = React.createClass({

  render: function() {
    return (
      <footer className="row" style={{marginBottom: 20}}>
        <div className="twelve columns">
          This is <code>footer.jsx</code> rendered inside of <code>index.jsx</code>
        </div>
      </footer>
    );
  }

});

module.exports = Footer;
