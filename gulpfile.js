const gulp = require('gulp');
const glob =  require('glob');
const clean = require('gulp-clean');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const minify = require('gulp-minify');
const source = require('vinyl-source-stream');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const browserify = require('browserify');
const babelify = require('babelify');
const argv = require('yargs').argv;
const path = require('path');
const mkdir = require('safe-mkdir');
const _ = require('lodash');
const resolve = require('resolve');
const KarmaServer = require('karma').Server;

//------------------------------------------------------------------------------
// Command line args for target, theme, and production.
//
// gulp                            (do not minify)
// gulp --production               (minify js)
//------------------------------------------------------------------------------
var production = argv.production;

if (production) console.log('Using PRODUCTION mode')
else console.log('Using DEVELOPMENT mode')

// extracts all dependencies from package.json, used to
// build vendor bundle
function getNPMPackageIds() {
  var packageManifest = {};
  try {
    packageManifest = require('./package.json');
  } catch (e) {
  }
  return _.keys(packageManifest.dependencies) || [];
}

//------------------------------------------------------------------------------
// Create vendor bundle
//------------------------------------------------------------------------------
function bundleVendor(done) {
  var b = browserify({
    //debug: !production
  });
  getNPMPackageIds().forEach(function (id) {
    b.require(resolve.sync(id), { expose: id });
  });
  b.bundle()
    .pipe(source('./vendor.js'))
    .pipe(gulp.dest('./dist'))
    .on('end', function () {
      done();
  });
}

//------------------------------------------------------------------------------
// Create app bundle - vendor modules marked as external
//------------------------------------------------------------------------------
function bundleApp(done) {
  var b = browserify({
    entries: ['./src/app.js'],
    extensions: ['.jsx', '.js'],
    cache: {},
    packageCache: {},
    fullPaths: false
  }).transform(babelify, {
    presets: ["es2015", "react"],
    extensions: ['.js', '.jsx']
  });
  getNPMPackageIds().forEach(function (id) {
    b.external(id);
  });
  b.bundle()
    .pipe(source('./app.js'))
    .pipe(gulp.dest('./dist'))
    .on('end', function () {
      done();
  });
}

//------------------------------------------------------------------------------
// Create test files bundle
//------------------------------------------------------------------------------
function bundleTest(done) {
  console.log('making test bundle')
  var testFiles = glob.sync('./test/**/*.js');
  var b = browserify(testFiles);
  b.transform("babelify", {presets: ["es2015"]})
    .bundle()
    .pipe(source('./test-bundle.js'))
    .pipe(gulp.dest('./'))
    .on('end', function () {
      console.log('test bundle done')
      done();
    })
}

//---------------------------------------------------------------
// tasks
//---------------------------------------------------------------

// bundling strategy thanks to:
// https://github.com/sogko/gulp-recipes/tree/master/browserify-separating-app-and-vendor-bundles

gulp.task('bundle', ['bundle-vendor', 'bundle-app']);

gulp.task('bundle-app', function (done) {
  bundleApp(done);
});
gulp.task('bundle-vendor', function (done) {
  bundleVendor(done);
});
gulp.task('bundle-test', function (done) {
  bundleTest(done);
});

gulp.task('sass', function (done) {
  gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./dist'))
    .on('end', function () { done() });
});

gulp.task('jquery', function (done) {
  gulp.src('node_modules/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('./dist'))
    .on('end', function () {done();});
 });

gulp.task('content', function (done) {
  gulp.src('content/**/*.*')
   .pipe(gulp.dest('./dist'))
   .on('end', function () {done();});
});

gulp.task('dist', ['bundle', 'sass', 'jquery', 'bootstrap', 'content'], function () {
  gulp.src('./index.html')
  .pipe(gulp.dest('./dist'));
});

//
// Copy bootstrap distribution plus the extra themes
// to the bootstrap dist folder
//
gulp.task('bootstrap', function (done) {
  gulp.src(['node_modules/bootstrap/dist/css/*.min.css',
            'node_modules/bootstrap/dist/js/*.min.js'])
    .pipe(gulp.dest('./dist/bootstrap'))
    .on('end', function () {
      gulp.src('node_modules/bootstrap/dist/fonts/*')
        .pipe(gulp.dest('./dist/fonts'))
        .on('end', function () {
          done();
        })
    });
});

gulp.task('test', ['bundle-test', 'dist'], function (done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false
  }, done).start();
})

gulp.task('clean', function() {
  gulp.src(['./dist', './test-bundle.js'])
    .pipe(clean({force: true}));
});

gulp.task('watch', ['bundle-app', 'sass', 'content'], function () {
  gulp.watch(['./src/**/*.jsx', 'src/**/*.js', 'content/*', 'index.html', 'sass/**/*'], ['dist']);
});

gulp.task('test-watch', ['bundle-app', 'bundle-test'], function () {
  gulp.watch(['./src/**/*.jsx', 'src/**/*.js', 'test/**/*.js'], ['bundle-app', 'bundle-test']);
});

gulp.task('default', ['dist']);
