'use strict';

var React = require('react/addons');
var ReactRouter = require('react-router');
var RouteHandler = ReactRouter.RouteHandler;

var Footer = require('../components/footer.jsx');

// The outer wrapper for the Router
var Index = React.createClass({

  render: function() {
    return (
      <div className="container">
        <div className="row">
          <RouteHandler className="twelve columns" {...this.props}/>
        </div>
        <Footer/>
      </div>
    );
  }

});

module.exports = Index;
