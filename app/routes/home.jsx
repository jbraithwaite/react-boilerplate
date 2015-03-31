'use strict';

var React = require('react/addons');
var ReactRouter = require('react-router');
var HomePage = React.createClass({

  render: function() {

    var technologies = [
      {
        name: 'React',
        link: 'http://facebook.github.io/react/',
        description: 'A javascript library for building user interfaces'
      },
      {
        name: 'Express',
        link: 'http://expressjs.com/',
        description: 'Fast, unopinionated, minimalist web framework for Node.js'
      },
      {
        name: 'React Router',
        link: 'https://github.com/rackt/react-router',
        description: 'A complete routing solution for React.js'
      },
      {
        name: 'webpack',
        link: 'http://webpack.github.io/docs/',
        description: 'Module bundler'
      },
      {
        name: 'BrowserSync',
        link: 'http://www.browsersync.io/',
        description: 'Time-saving synchronised browser testing.'
      },
      {
        name: 'Gulp',
        link: 'http://gulpjs.com/',
        description: 'Automate and enhance your workflow'
      },
      {
        name: 'jade',
        link: 'http://jade-lang.com/',
        description: 'Node template language'
      },
      {
        name: 'Sass',
        link: 'http://sass-lang.com/',
        description: 'Sass is the most mature, stable, and powerful professional grade CSS extension language in the world.'
      },
      {
        name: 'Node-config',
        link: 'http://lorenwest.github.io/node-config/',
        description: 'Node.js Application Configuration'
      }
    ]

    return (
      <div>
        <table className="u-full-width">
          <thead>
            <tr>
              <th>Technology</th>
              <th>Discription</th>
            </tr>
          </thead>
          <tbody>
            {technologies.map(function(tech, key){
              return (
               <tr key={key}>
                 <td><a href={tech.link} target="_blank">{tech.name}</a></td>
                 <td>{tech.description}</td>
               </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = HomePage;
