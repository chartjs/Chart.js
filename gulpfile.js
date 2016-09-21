var gulp = require('gulp');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var eslint = require('gulp-eslint');
var file = require('gulp-file');
var htmlv = require('gulp-html-validator');
var insert = require('gulp-insert');
var replace = require('gulp-replace');
var size = require('gulp-size');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var zip = require('gulp-zip');
var exec = require('child_process').exec;
var karma = require('gulp-karma');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var merge = require('merge-stream');
var collapse = require('bundle-collapser/plugin');
var package = require('./package.json');

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
  '!./test/defaultConfig.tests.js'
];

gulp.task('bower', bowerTask);
gulp.task('build', buildTask);
gulp.task('package', packageTask);
gulp.task('coverage', coverageTask);
gulp.task('watch', watchTask);
gulp.task('lint', lintTask);
gulp.task('test', ['lint', 'validHTML', 'unittest']);
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

/**
 * Generates the bower.json manifest file which will be pushed along release tags.
 * Specs: https://github.com/bower/spec/blob/master/json.md
 */
function bowerTask() {
  var json = JSON.stringify({
      name: package.name,
      description: package.description,
      homepage: package.homepage,
      license: package.license,
      version: package.version,
      main: outDir + "Chart.js"
    }, null, 2);

  return file('bower.json', json, { src: true })
    .pipe(gulp.dest('./'));
}

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

function lintTask() {
  var files = [
    srcDir + '**/*.js',
  ];

  // NOTE(SB) codeclimate has 'complexity' and 'max-statements' eslint rules way too strict
  // compare to what the current codebase can support, and since it's not straightforward
  // to fix, let's turn them as warnings and rewrite code later progressively.
  var options = {
    rules: {
      'complexity': [1, 6],
      'max-statements': [1, 30]
    }
  };

  return gulp.src(files)
    .pipe(eslint(options))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
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
