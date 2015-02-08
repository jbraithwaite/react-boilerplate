'use strict';

var React = require('react/addons');
var ReactRouter = require('react-router');
var RouteHandler = ReactRouter.RouteHandler;

var Header = require('../components/header.jsx');
var Footer = require('../components/footer.jsx');

// The outer wrapper for the Router
var Index = React.createClass({

  render: function() {
    return (
      <div className="container">
        <Header/>
        <main className="row">
          <RouteHandler className="twelve columns" {...this.props}/>
        </main>
        <Footer/>
      </div>
    );
  }

});

module.exports = Index;
