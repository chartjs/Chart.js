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
var exec = require('child-process-promise').exec;
var karma = require('karma');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var merge = require('merge-stream');
var collapse = require('bundle-collapser/plugin');
var argv  = require('yargs').argv
var path = require('path');
var package = require('./package.json');

var srcDir = './src/';
var outDir = './dist/';

var header = "/*!\n" +
  " * Chart.js\n" +
  " * http://chartjs.org/\n" +
  " * Version: {{ version }}\n" +
  " *\n" +
  " * Copyright " + (new Date().getFullYear()) + " Chart.js Contributors\n" +
  " * Released under the MIT license\n" +
  " * https://github.com/chartjs/Chart.js/blob/master/LICENSE.md\n" +
  " */\n";

gulp.task('bower', bowerTask);
gulp.task('build', buildTask);
gulp.task('package', packageTask);
gulp.task('watch', watchTask);
gulp.task('lint', lintTask);
gulp.task('docs', docsTask);
gulp.task('test', ['lint', 'validHTML', 'unittest']);
gulp.task('size', ['library-size', 'module-sizes']);
gulp.task('server', serverTask);
gulp.task('validHTML', validHTMLTask);
gulp.task('unittest', unittestTask);
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
      main: outDir + "Chart.js",
      ignore: [
        '.github',
        '.codeclimate.yml',
        '.gitignore',
        '.npmignore',
        '.travis.yml',
        'scripts'
      ]
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
    'samples/**/*.js',
    'src/**/*.js',
    'test/**/*.js'
  ];

  // NOTE(SB) codeclimate has 'complexity' and 'max-statements' eslint rules way too strict
  // compare to what the current codebase can support, and since it's not straightforward
  // to fix, let's turn them as warnings and rewrite code later progressively.
  var options = {
    rules: {
      'complexity': [1, 10],
      'max-statements': [1, 30]
    }
  };

  return gulp.src(files)
    .pipe(eslint(options))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function docsTask(done) {
  const script = require.resolve('gitbook-cli/bin/gitbook.js');
  const cmd = process.execPath;

  exec([cmd, script, 'install', './'].join(' ')).then(() => {
    return exec([cmd, script, 'build', './', './dist/docs'].join(' '));
  }).catch((err) => {
    console.error(err.stdout);
  }).then(() => {
    done();
  });
}

function validHTMLTask() {
  return gulp.src('samples/*.html')
    .pipe(htmlv());
}

function startTest() {
  return [
    {pattern: './test/fixtures/**/*.json', included: false},
    {pattern: './test/fixtures/**/*.png', included: false},
    './node_modules/moment/min/moment.min.js',
    './test/jasmine.index.js',
    './src/**/*.js',
  ].concat(
    argv.inputs ?
      argv.inputs.split(';') :
      ['./test/specs/**/*.js']
  );
}

function unittestTask(done) {
  new karma.Server({
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: !argv.watch,
    files: startTest(),
    args: {
      coverage: !!argv.coverage
    }
  },
  // https://github.com/karma-runner/gulp-karma/issues/18
  function(error) {
    error = error ? new Error('Karma returned with the error code: ' + error) : undefined;
    done(error);
  }).start();
}

function librarySizeTask() {
  return gulp.src('dist/Chart.bundle.min.js')
    .pipe(size({
      gzip: true
    }));
}

function moduleSizesTask() {
  return gulp.src(srcDir + '**/*.js')
    .pipe(uglify())
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
