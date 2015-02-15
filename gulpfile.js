// Requires
// ------------------------------------------------------------------
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('watch');
var chalk = require('chalk');
var gutil = require('gulp-util');
var config = require('config');
var insert = require('gulp-insert');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglifyjs');
var replace = require('gulp-replace');
var webpack = require('gulp-webpack');
var package = require('./package.json');
var dwebpack = require('webpack');
var minifycss = require('gulp-minify-css');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var child_process = require('child_process');
var WebpackDevServer = require('webpack-dev-server');

// Settings
// ------------------------------------------------------------------
var appName = package.name;
var port = config.get('port') || process.env.PORT;
var webpackPort = config.get('webpack.port');
var webpackHost = config.get('webpack.host');
var webpackFile = config.get('webpack.file');
var webpackPath = config.get('webpack.path');
var environment = config.get('environment') || process.env.NODE_ENV;

// Paths (feel free to edit)
// ------------------------------------------------------------------
var paths = {
  // Watch - express
  express: 'index.js',

  // Watch - browsersync
  jsx: ['app/**/*.jsx'],

  // Watch - browsersync
  scss: ['stylesheets/**/*.scss'],

  // Path - The start of the React App (the router)
  reactEntryPoint: './app/router.jsx',

  // Path - Public folders
  public : {
    js : './public/js',
    css : './public/css',
    img : './public/img',
    font : './public/font'
  },

  // Why bloat our "application.js" file with third party plugins?
  // If we move these files to `external.js`, it won't change as often as our
  // "application.js" and can be more aggresively cached by the user's browser.
  //
  // This is a two step process.
  //
  // Step one: Add the files to both dev and pro below
  // (make sure to link to the minified version in production)
  //
  // Step two: See externals below to make sure the file is not included.
  minifyplugins : {
    development : [
      './node_modules/react/dist/react-with-addons.js',
      './node_modules/react-router/dist/react-router.js'
    ],
    production : [
      './node_modules/react/dist/react-with-addons.min.js',
      './node_modules/react-router/dist/react-router.min.js'
    ]
  }
};

// Webpack config
// ------------------------------------------------------------------

// If you require('module-name') and want to take advantage of moving this file
// to external.js (instead of having it bundled with our "application.js")
// we add it to the extenals of webpack.
//
// For example, we would add "module-name" : "ModuleOnGlobalNameSpace"
var externals = {
  "react": "React",
  "react/addons": "React",
  "react-router": "ReactRouter"
};

// The loaders for webpack and webpack dev server
var loaders = [
  {test: /[\.jsx|\.js]$/, loaders: ['react-hot', 'jsx-loader?harmony']}
];

// Utility Functions
// ------------------------------------------------------------------

// Copywrite and version banner for js and css files
var banner = function() {
  return '/*! ' + package.name + ' - v' + package.version+' - ' +
    gutil.date(new Date(), "yyyy-mm-dd") +
    ' [copyright: '+package.copyright+']' + ' */';
};

function boldLog(data){
  gutil.log(chalk.white.bgMagenta.bold(data));
}

// Browser Sync
var createMonitor = function() {

  var callback = function(file) {
    browserSync.reload(file);
  };

  return function(path) {
    watch.createMonitor(path, function(monitor) {
      monitor.on('created', callback);
      monitor.on('changed', callback);
      monitor.on('removed', callback);
    });
  };
};

if(environment == 'development') {
  var monitors = {};

  monitors.images = createMonitor();
  monitors.images(paths.public.img);

  // Add any additonal monitors here.
}


// Gulp - Stylesheets
// ------------------------------------------------------------------

/**
 * sass
 *
 * Convert the stylesheets from scss to css
 */
gulp.task('sass', function() {
  return gulp.src('./stylesheets/*.scss')
    .pipe(sass({
      // Helpful for debugging
      sourceComments: 'normal'
    }))

    // Add banner
    .pipe(insert.prepend(banner()+'\n'))

    // Add charset
    .pipe(insert.prepend('@charset "UTF-8";\n'))

    // Pipe to css folder
    .pipe(gulp.dest(paths.public.css))

    // Trigger a browser sync reload
    .pipe(browserSync.reload({stream:true}));
});

/**
 * Minify Css
 *
 * Takes the stylesheet in the public css folder and minifies it
 */
gulp.task('minifycss', function() {
  return gulp.src([paths.public.css + '/main.css'])
    .pipe(minifycss())
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest(paths.public.css));
});

// Gulp - React
// ------------------------------------------------------------------

/**
 * React Development
 *
 * Uses WebpackDevServer to recompile the React app (w/ hotloading)
 */
gulp.task('react:development', function() {
  var wconfig = {
    cache: true,
    entry: [
      'webpack-dev-server/client?http://' + webpackHost + ':' + webpackPort,
      'webpack/hot/only-dev-server',
      paths.reactEntryPoint
    ],
    output: {
      path: process.cwd(),
      contentBase: 'http://' + webpackHost + ':' + webpackPort,
      filename: webpackFile,
      publicPath: 'http://' + webpackHost + ':' + webpackPort + webpackPath
    },
    plugins: [
      new dwebpack.HotModuleReplacementPlugin(),
      new dwebpack.NoErrorsPlugin()
    ],
    module: {
      loaders: loaders
    },
    externals: externals,
  };

  var server = new WebpackDevServer(dwebpack(wconfig), {
    publicPath: wconfig.output.publicPath,
    hot: true,
    noInfo: true,
    stats: {
      colors: true,
      progress: true
    }
  });

  server.listen(webpackPort, function (err, result) {
    if (err) console.log(err);
    boldLog('Webpack Dev Server started');
  });
});

/**
 * React Production
 *
 * No WebpackDevServer or react-hot
 */
gulp.task('react:compile', function() {
  return gulp.src(paths.reactEntryPoint)
    .pipe(webpack({
      cache: false,
      module: {
        loaders: loaders
      },
      externals: externals
    }))
    .pipe(rename(appName+'.js'))
    .pipe(gulp.dest(paths.public.js));
});

/**
 * Ugify React App
 */
gulp.task('uglify', ['react:compile'], function() {
  return gulp.src(paths.public.js + '/' + appName + '.js')
    .pipe(uglify(appName + '.min.js', {
      preserveComments: false,
      compress: {
        warnings: false
      }
    }))
    .pipe(insert.prepend(banner()))
    .pipe(gulp.dest(paths.public.js));
});

// Gulp - "Minify" 3rd party plugins
// ------------------------------------------------------------------

/**
 * "Minify" plugins for development
 *
 * To increase speed, we concat the 3rd part plugins into a file
 * "external.js" and serve that outside of the React App. This
 * file changes a lot less often then the App will.
 *
 * The plugins will attached at the global namepace
 * (on the client: window)
 */
gulp.task('minifyplugins:development', function() {
  gulp.src(paths.minifyplugins.development).pipe(concat('external.js'))
    .pipe(gulp.dest(paths.public.js));
});

/**
 * "Minify plugins for production"
 *
 * Instead of using uglify, simply concat the already minified files.
 * In the case of React, this will allow you to skip development code
 * as well. Resulting in smaller file.
 */
gulp.task('minifyplugins:production', function() {
  gulp.src(paths.minifyplugins.production).pipe(concat('external.min.js'))
    .pipe(gulp.dest(paths.public.js));
});

// Gulp - Express
// ------------------------------------------------------------------
var child = null, browserSyncConnected = false;
gulp.task('express', function() {

  // Kill any existing children
  if(child) child.kill();

  // Create a new child
  child = child_process.spawn(process.execPath, ['./index.js'], {
    env: {
      // We are hotloading
      HOT_RELOAD: true,
    },
    // http://nodejs.org/api/child_process.html#child_process_options_stdio
    stdio: ['ipc']
  });

  // Log standard out
  child.stdout.on('data', function(data) {
    boldLog(data.toString().trim());
  });

  // Log standard error
  child.stderr.on('data', function(data) {
    data = data.toString().trim();
    gutil.log(chalk.white.bgRed.bold(data));
    browserSync.notify('ERROR: ' + data, 5000);
  });

  // On a message from child
  child.on('message', function(m) {

    // In the server express app, we emit a 'CONNECTED' when the app
    // starts listening. If we get that message and browser sync has
    // not been established
    if(m === 'CONNECTED' && !browserSyncConnected) {

      boldLog('Starting BrowserSync');

      browserSync({
        proxy: 'localhost:' + port,
        port: port,
        // Don't automatically open a new window
        open: false
      }, function() {
        browserSyncConnected = true;
      });
    }
    // every other message
    else {
      browserSync.notify(m, 5000);
    }
  });
});

// If something unexpected happens
process.on('uncaughtException', function(err) {
  // kill the child
  if(child) child.kill();

  // throw an error
  throw new Error(err);
});

// Gulp - notify
// ------------------------------------------------------------------
gulp.task('notify', function() {
  browserSync.notify('Live reloading ...');
});

// Gulp - Watch
// ------------------------------------------------------------------
gulp.task('watch', function() {
  gulp.watch(paths.index, ['express']);
  gulp.watch(paths.scss, ['sass']);
  gulp.watch(paths.jsx.concat(paths.scss), ['notify']);
});

// Gulp - Compile
// ===================================================================
gulp.task('compile', function() {
  runSequence('sass', 'minifycss', 'minifyplugins:production', 'uglify', function() {

    gutil.log(chalk.black.bgWhite.bold('[          BUILD PROCESS COMPLETE          ]'));

    console.log('\nTo start the Express application:\n');
    console.log('node ' + paths.express + '\n');

    process.exit();
  });
});

// Gulp - Default
// ===================================================================
gulp.task('default', function(callback) {
  runSequence('react:development', 'sass', 'minifyplugins:development', ['express', 'watch'], callback);
});
