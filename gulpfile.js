var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  util = require('gulp-util'),
  jshint = require('gulp-jshint'),
  size = require('gulp-size'),
  connect = require('gulp-connect'),
  replace = require('gulp-replace'),
  htmlv = require('gulp-html-validator'),
  insert = require('gulp-insert'),
  zip = require('gulp-zip'),
  inquirer = require('inquirer'),
  semver = require('semver'),
  exec = require('child_process').exec,
  fs = require('fs'),
  package = require('./package.json'),
  karma = require('gulp-karma'),
  browserify = require('browserify'),
  streamify = require('gulp-streamify'),
  source = require('vinyl-source-stream'),
  merge = require('merge-stream'),
  collapse = require('bundle-collapser/plugin');

var srcDir = './src/';
var outDir = './dist/';

var header = "/*!\n" +
  " * Chart.js\n" +
  " * http://chartjs.org/\n" +
  " * Version: {{ version }}\n" +
  " *\n" +
  " * Copyright 2016 Nick Downie\n" +
  " * Released under the MIT license\n" +
  " * https://github.com/chartjs/Chart.js/blob/master/LICENSE.md\n" +
  " */\n";

var preTestFiles = [
  './node_modules/moment/min/moment.min.js',
];

var testFiles = [
  './test/mockContext.js',
  './test/*.js',

  // Disable tests which need to be rewritten based on changes introduced by
  // the following changes: https://github.com/chartjs/Chart.js/pull/2346
  '!./test/core.layoutService.tests.js',
  '!./test/defaultConfig.tests.js',
];

gulp.task('build', buildTask);
gulp.task('package', packageTask);
gulp.task('coverage', coverageTask);
gulp.task('watch', watchTask);
gulp.task('bump', bumpTask);
gulp.task('release', ['build'], releaseTask);
gulp.task('jshint', jshintTask);
gulp.task('test', ['jshint', 'validHTML', 'unittest']);
gulp.task('size', ['library-size', 'module-sizes']);
gulp.task('server', serverTask);
gulp.task('validHTML', validHTMLTask);
gulp.task('unittest', unittestTask);
gulp.task('unittestWatch', unittestWatchTask);
gulp.task('library-size', librarySizeTask);
gulp.task('module-sizes', moduleSizesTask);
gulp.task('_open', _openTask);
gulp.task('dev', ['server', 'default']);

gulp.task('default', ['build', 'watch']);


function buildTask() {

  var bundled = browserify('./src/chart.js', { standalone: 'Chart' })
    .plugin(collapse)
    .bundle()
    .pipe(source('Chart.bundle.js'))
    .pipe(insert.prepend(header))
    .pipe(streamify(replace('{{ version }}', package.version)))
    .pipe(gulp.dest(outDir))
    .pipe(streamify(uglify()))
    .pipe(insert.prepend(header))
    .pipe(streamify(replace('{{ version }}', package.version)))
    .pipe(streamify(concat('Chart.bundle.min.js')))
    .pipe(gulp.dest(outDir));

  var nonBundled = browserify('./src/chart.js', { standalone: 'Chart' })
    .ignore('moment')
    .plugin(collapse)
    .bundle()
    .pipe(source('Chart.js'))
    .pipe(insert.prepend(header))
    .pipe(streamify(replace('{{ version }}', package.version)))
    .pipe(gulp.dest(outDir))
    .pipe(streamify(uglify()))
    .pipe(insert.prepend(header))
    .pipe(streamify(replace('{{ version }}', package.version)))
    .pipe(streamify(concat('Chart.min.js')))
    .pipe(gulp.dest(outDir));

  return merge(bundled, nonBundled);

}

function packageTask() {
  return merge(
      // gather "regular" files landing in the package root
      gulp.src([outDir + '*.js', 'LICENSE.md']),

      // since we moved the dist files one folder up (package root), we need to rewrite
      // samples src="../dist/ to src="../ and then copy them in the /samples directory.
      gulp.src('./samples/**/*', { base: '.' })
        .pipe(streamify(replace(/src="((?:\.\.\/)+)dist\//g, 'src="$1')))
  )
  // finally, create the zip archive
  .pipe(zip('Chart.js.zip'))
  .pipe(gulp.dest(outDir));
}

/*
 *  Usage : gulp bump
 *  Prompts: Version increment to bump
 *  Output: - New version number written into package.json
 */
function bumpTask(complete) {
  util.log('Current version:', util.colors.cyan(package.version));
  var choices = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'].map(function(versionType) {
    return versionType + ' (v' + semver.inc(package.version, versionType) + ')';
  });
  inquirer.prompt({
    type: 'list',
    name: 'version',
    message: 'What version update would you like?',
    choices: choices
  }, function(res) {
    var increment = res.version.split(' ')[0],
      newVersion = semver.inc(package.version, increment),
      oldVersion = package.version;

    // Set the new versions into the package object
    package.version = newVersion;

    // Write these to their own files, then build the output
    fs.writeFileSync('package.json', JSON.stringify(package, null, 2));

    var oldCDN = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/'+oldVersion+'/Chart.min.js',
      newCDN = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/'+newVersion+'/Chart.min.js';

    gulp.src(['./README.md'])
      .pipe(replace(oldCDN, newCDN))
      .pipe(gulp.dest('./'));

    complete();
  });
}


function releaseTask() {
  exec('git tag -a v' + package.version);
}


function jshintTask() {
  return gulp.src(srcDir + '**/*.js')
    .pipe(jshint('config.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
}


function validHTMLTask() {
  return gulp.src('samples/*.html')
    .pipe(htmlv());
}

function startTest() {
  var files = ['./src/**/*.js'];
  Array.prototype.unshift.apply(files, preTestFiles);
  Array.prototype.push.apply(files, testFiles);
  return files;
}

function unittestTask() {
  return gulp.src(startTest())
    .pipe(karma({
      configFile: 'karma.conf.ci.js',
      action: 'run'
    }));
}

function unittestWatchTask() {
  return gulp.src(startTest())
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
}

function coverageTask() {
  return gulp.src(startTest())
    .pipe(karma({
      configFile: 'karma.coverage.conf.js',
      action: 'run'
    }));
}

function librarySizeTask() {
  return gulp.src('dist/Chart.bundle.min.js')
    .pipe(size({
      gzip: true
    }));
}

function moduleSizesTask() {
  return gulp.src(srcDir + '**/*.js')
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }));
}

function watchTask() {
  if (util.env.test) {
    return gulp.watch('./src/**', ['build', 'unittest', 'unittestWatch']);
  }
  return gulp.watch('./src/**', ['build']);
}

function serverTask() {
  connect.server({
    port: 8000
  });
}

// Convenience task for opening the project straight from the command line

function _openTask() {
  exec('open http://localhost:8000');
  exec('subl .');
}
