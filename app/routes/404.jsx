var PageNotFound = React.createClass({

  getInitialState: function(){
    return {
      statusCode: 404
    }
  },

  componentDidMount: function() {
    setInterval(function(){

      var code = this.state.statusCode;

      this.setState({
        statusCode: code + 1
      });

    }.bind(this),300);
  },

  render: function() {
    return (
      <div>
        <h1>{this.state.statusCode}</h1>
        <p>The page you were looking for could not be found.</p>
      </div>
    );
  }
});

module.exports = PageNotFound;
