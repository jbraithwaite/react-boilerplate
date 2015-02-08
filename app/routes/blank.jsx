'use strict';

var React = require('react/addons');
var ReactRouter = require('react-router');

var BlankPage = React.createClass({

  getInitialState: function(){
    return {
      adjective: 'boring',
      adjectives: ['bad','barbarous','bashful','bawdy','beautiful','befitting',
        'belligerent','beneficial','bent','berserk','best','better',
        'bewildered','big','billowy','bite-sized','bitter','bizarre',
        'black','black-and-white','bloody','blue','blue-eyed','blushing',
        'boiling','boorish','bored','bouncy','boundless','brainy','brash',
        'brave','brawny','breakable','breezy','brief','bright','bright','broad',
        'broken','brown','bumpy','burly','bustling','busy']
    }
  },

  componentDidMount: function() {

    // This is purely for demostration purposes. Cycle through adjectives until
    // we run out. This shows that React is working.

    var intervalID = setInterval(function(){
      var adjectives = this.state.adjectives;
      // http://stackoverflow.com/questions/7158654/how-to-get-random-elements-from-an-array/7158691#7158691
      adjectives.sort( function() { return 0.5 - Math.random() } );
      var adjective = adjectives.pop();

      if (!adjective) return clearInterval(intervalID);

      this.setState({
        adjective: adjective,
        adjectives: adjectives
      });

    }.bind(this),1000);
  },

  render: function() {
    return (
      <div>
        <h1>This pages is intentionally {this.state.adjective}</h1>
        <p>This is <code>blank.jsx</code> which is rendered inside of <code>index.jsx</code></p>
      </div>
    );
  }
});

module.exports = BlankPage;
