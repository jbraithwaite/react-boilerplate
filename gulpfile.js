var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var watch = require('watch');
var config = require('config');
var browserSync = require('browser-sync');
var child_process = require('child_process');

var argv = require('yargs').argv;

var sass = require('gulp-sass');
var gutil = require('gulp-util');
var insert = require('gulp-insert');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglifyjs');
var webpack = require('gulp-webpack');
var minifycss = require('gulp-minify-css');

var WebpackDevServer = require('webpack-dev-server');
var dwebpack = require('webpack');
var wport = argv.wport ? argv.wport : 8079;
var whost = argv.whost ? argv.whost : 'localhost';

var runSequence = require('run-sequence');

var package = require('./package.json');

var appName = package.name;
var port = config.get('port') || process.env.PORT;
var environment = config.get('environment') || process.env.NODE_ENV;

/* file patterns to watch */
var paths = {
  index: ['index.js', 'server.jsx'],
  jsx: ['app/**/*.jsx'],
  scss: ['stylesheets/**/*.scss'],
  reactEntryPoint: './app/main.jsx',
  public : {
    js : './public/js',
    css : './public/css',
    img : './public/img',
    font : './public/font'
  }
};

var banner = function() {
  return '/*! '+package.name+' - v'+package.version+' - '+gutil.date(new Date(), "yyyy-mm-dd")+
          ' [copyright: '+package.copyright+']'+' */';
};

function logData(data) {
  gutil.log(
    gutil.colors.bold(
      gutil.colors.green(data)
    )
  );
}

logData('Name : ' + appName);
logData('PORT : ' + port);
logData('Environment : '+ environment);

/* ---------------------------------- */
/* --------- BEGIN APP:SASS --------- */
/* ---------------------------------- */
gulp.task('sass', function() {
  return gulp.src('./stylesheets/*.scss')
    .pipe(sass({
      sourceComments: 'normal'
    }))
    .pipe(insert.prepend(banner()+'\n'))
    .pipe(insert.prepend('@charset "UTF-8";\n'))
    .pipe(gulp.dest(paths.public.css))
    .pipe(browserSync.reload({stream:true}));
});


gulp.task('minifycss', function() {
  return gulp.src([paths.public.css + '/main.css'])
    .pipe(minifycss())
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest(paths.public.css));
});

/* -------------------------------- */
/* --------- END APP:SASS --------- */
/* -------------------------------- */

/* --------------------------------- */
/* ---------- BEGIN APP:JS --------- */
/* --------------------------------- */
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
    stats: {
      colors: true,
      progress: true
    }
  });

  server.listen(wport, function (err, result) {
    if (err) {
      console.log(err);
    }

    gutil.log('Webpack Dev Server started. Compiling...');
  });
});

gulp.task('react:app', function() {
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

gulp.task('uglify', ['react:app'], function() {
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
/* ------------------------------- */
/* ---------- END APP:JS --------- */
/* ------------------------------- */

/* --------------------------------- */
/* --------- BEGIN EXPRESS --------- */
/* --------------------------------- */
var child = null, browserSyncConnected = false;
gulp.task('express', function() {
  if(child) child.kill();
  child = child_process.spawn(process.execPath, ['./index.js'], {
    env: {
      NODE_ENV: environment,
      APP: appName,
      PORT: port,
      WPORT: wport,
      WHOST: whost
    },
    stdio: ['ipc']
  });
  child.stdout.on('data', function(data) {
    gutil.log(gutil.colors.bgCyan(gutil.colors.blue(data.toString().trim())));
  });
  child.stderr.on('data', function(data) {
    gutil.log(gutil.colors.bgRed(gutil.colors.white(data.toString().trim())));
    browserSync.notify('ERROR: ' + data.toString().trim(), 5000);
  });
  child.on('message', function(m) {
    if(m === 'CONNECTED' && !browserSyncConnected) {
      gutil.log(gutil.colors.bgMagenta(gutil.colors.white('Server spawned! Starting proxy...')));
      browserSync({
        proxy: 'localhost:' + port,
        port: port
      }, function() {
        browserSyncConnected = true;
      });
    } else {
      browserSync.notify(m, 5000);
    }
  });
});

process.on('uncaughtException', function(err) {
  if(child) child.kill();
  throw new Error(err);
});
/* ------------------------------- */
/* --------- END EXPRESS --------- */
/* ------------------------------- */

gulp.task('minifyplugins:development', function() {
  gulp.src([
    './node_modules/react/dist/react-with-addons.js',
    './node_modules/react-router/dist/react-router.js'
  ]).pipe(concat('external.js'))
    .pipe(gulp.dest(paths.public.js));
});

gulp.task('minifyplugins:production', function() {
  gulp.src([
    './node_modules/react/dist/react-with-addons.min.js',
    './node_modules/react-router/dist/react-router.min.js'
  ]).pipe(concat('external.min.js'))
    .pipe(gulp.dest(paths.public.js));
});

/* ------------------------------- */
/* -------- BEGIN NOTIFY --------- */
/* ------------------------------- */

gulp.task('notify', function() {
  browserSync.notify('Live reloading ...');
});

/* ------------------------------- */
/* ---------- END NOTIFY --------- */
/* ------------------------------- */


/* ------------------------------------ */
/* -------- BEGIN BROWSERSYNC --------- */
/* ------------------------------------ */

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

if(environment != 'production') {
  var m = createMonitor();
  m(paths.public.img);
}

/* ------------------------------------ */
/* ---------- END BROWSERSYNC --------- */
/* ------------------------------------ */




/* ------------------------------ */
/* --------- GULP TASKS --------- */
/* ------------------------------ */

gulp.task('production', function(callback) {
  runSequence('sass', 'minifycss', 'minifyplugins:production', 'uglify', function() {
    callback();
    gutil.log(
      gutil.colors.bgMagenta(
        gutil.colors.red(
          gutil.colors.bold('[          COMPLETED BUILD PROCESS          ]')
        )
      )
    );
  });
});

gulp.task('default', function(callback) {
  runSequence('react:development', 'sass', 'minifyplugins:development', ['express', 'watch'], callback);
});


/*BEGIN: ALIASES FOR CERTAIN TASKS (for Watch)*/
gulp.task('build:css:watch', ['sass'], ready);
gulp.task('express:watch', ['express'], ready);
gulp.task('rebuild:css', ['sass'], ready);
/*END: ALIASES*/

gulp.task('watch', function() {
  gulp.watch(paths.index, ['express:watch']);
  gulp.watch(paths.scss, ['rebuild:css']);
  gulp.watch(paths.jsx.concat(paths.scss), ['notify']);
});

function ready() {
  gutil.log(
    gutil.colors.bgMagenta(
      gutil.colors.white(
        gutil.colors.bold('[          STATUS: READY          ]')
      )
    )
  );
}
