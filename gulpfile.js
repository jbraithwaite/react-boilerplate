// Requires
// ------------------------------------------------------------------
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('watch');
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
var wport = config.get('wport');
var whost = config.get('whost');
var environment = config.get('environment') || process.env.NODE_ENV;

// Paths (and for watch)
// ------------------------------------------------------------------
var paths = {
  // Watch - express
  index: ['index.js', 'server.jsx'],

  // Watch - browsersync
  jsx: ['app/**/*.jsx'],

  // Watch - browsersync
  scss: ['stylesheets/**/*.scss'],

  // Path - The start of the React App
  reactEntryPoint: './app/main.jsx',

  // Path - Public folders
  public : {
    js : './public/js',
    css : './public/css',
    img : './public/img',
    font : './public/font'
  }
};

// Utility Functions
// ------------------------------------------------------------------

// Copywrite and version banner for js and css files
var banner = function() {
  return '/*! ' + package.name + ' - v' + package.version+' - ' +
    gutil.date(new Date(), "yyyy-mm-dd") +
    ' [copyright: '+package.copyright+']' + ' */';
};

// Ready function for Watch
function ready() {
  gutil.log(
    gutil.colors.bgMagenta(
      gutil.colors.white(
        gutil.colors.bold('[          STATUS: READY          ]')
      )
    )
  );
}

// Browser Sync
var createMonitor = function() {
  var callback = function(f) {
    browserSync.reload(f);
  };

  return function(p) {
    watch.createMonitor(p, function(m) {
      m.on('created', callback);
      m.on('changed', callback);
      m.on('removed', callback);
    });
  };
};

if(environment == 'development') {
  var m = createMonitor();
  m(paths.public.img);
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
 * Uses WebpackDevServer to create a proxy to the express
 */
gulp.task('react:development', function() {
  var wconfig = {
    cache: true,
    entry: [
      'webpack-dev-server/client?http://'+whost+':'+wport,
      'webpack/hot/only-dev-server',
      paths.reactEntryPoint
    ],
    output: {
      path: process.cwd(),
      contentBase: 'http://'+whost+':'+wport,
      filename: 'bundle.js',
      publicPath: 'http://'+whost+':'+wport+'/scripts/'
    },
    plugins: [
      new dwebpack.HotModuleReplacementPlugin(),
      new dwebpack.NoErrorsPlugin()
    ],
    module: {
      loaders: [
        {test: /\.txt$/, loaders: ['raw']},
        {test: /\package\.json$/, loaders: ['json']},
        {test: /\/app\/(.*?)\.txt$/, loaders: ['raw']},
        {test: /\/app\/(.*?)\.json$/, loaders: ['json']},
        {test: /[\.jsx|\.js]$/, loaders: ['react-hot', 'jsx-loader?harmony']}
      ]
    },
    externals: {
      'react': 'React'
    }
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

  server.listen(wport, function (err, result) {
    if (err) console.log(err);
    gutil.log('Webpack Dev Server started. Compiling...');
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
      cache: true,
      module: {
        loaders: [
          {test: /\.txt$/, loaders: ['raw']},
          {test: /\package\.json$/, loaders: ['json']},
          {test: /\/app\/(.*?)\.txt$/, loaders: ['raw']},
          {test: /\/app\/(.*?)\.json$/, loaders: ['json']},
          {test: /[\.jsx|\.js]$/, loaders: ['jsx-loader?harmony']}
        ]
      },
      externals: {
        'react': 'React'
      }
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
 *
 * To have access to the resources on the server and client, edit
 * `./globals/universal.js` and `./globals/server`
 */
gulp.task('minifyplugins:development', function() {
  gulp.src([
    './node_modules/react/dist/react-with-addons.js',
    './node_modules/react-router/dist/react-router.js'
  ]).pipe(concat('external.js'))
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
  gulp.src([
    './node_modules/react/dist/react-with-addons.min.js',
    './node_modules/react-router/dist/react-router.min.js'
  ]).pipe(concat('external.min.js'))
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
      NODE_ENV: environment,
      APP: appName,
      FOR_GULP: true,
      PORT: port,
      WPORT: wport,
      WHOST: whost
    },
    stdio: ['ipc']
  });

  // Log standard out
  child.stdout.on('data', function(data) {
    gutil.log(
      gutil.colors.bgCyan(
        gutil.colors.blue(
            data.toString().trim()
        )
      )
    );
  });

  // Log standard error
  child.stderr.on('data', function(data) {
    gutil.log(
      gutil.colors.bgRed(
        gutil.colors.white(
          data.toString().trim()
        )
      )
    );
    browserSync.notify('ERROR: ' + data.toString().trim(), 5000);
  });

  // On a message from child
  child.on('message', function(m) {

    // In the server express app, we emit a 'CONNECTED' when the app
    // starts listening. If we get that message and browser sync has
    // not been established
    if(m === 'CONNECTED' && !browserSyncConnected) {
      gutil.log(
        gutil.colors.bgMagenta(
          gutil.colors.white('Server spawned! Starting proxy...')
        )
      );
      browserSync({
        proxy: 'localhost:' + port,
        port: port
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
  gulp.watch(paths.index, ['express:watch']);
  gulp.watch(paths.scss, ['rebuild:css']);
  gulp.watch(paths.jsx.concat(paths.scss), ['notify']);
});

gulp.task('build:css:watch', ['sass'], ready);
gulp.task('express:watch', ['express'], ready);
gulp.task('rebuild:css', ['sass'], ready);

// Gulp - Production
// ===================================================================
gulp.task('production', function(callback) {
  runSequence('sass', 'minifycss', 'minifyplugins:production', 'uglify', function() {
    gutil.log(
      gutil.colors.bgMagenta(
        gutil.colors.red(
          gutil.colors.bold('[          COMPLETED BUILD PROCESS          ]')
        )
      )
    );

    console.log('\nTo start the Express application:\n');
    console.log('NODE_ENV=production node index.js\n');
    // Exit
    process.exit();
    callback();
  });
});

// Gulp - Default
// ===================================================================
gulp.task('default', function(callback) {
  runSequence('react:development', 'sass', 'minifyplugins:development', ['express', 'watch'], callback);
});
