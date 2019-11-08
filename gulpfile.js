var gulp = require('gulp');
var eslint = require('gulp-eslint');
var file = require('gulp-file');
var jsdoc = require('gulp-jsdoc3');
var replace = require('gulp-replace');
var size = require('gulp-size');
var streamify = require('gulp-streamify');
var terser = require('gulp-terser');
var zip = require('gulp-zip');
var exec = require('child_process').exec;
var karma = require('karma');
var merge = require('merge-stream');
var yargs = require('yargs');
var path = require('path');
var htmllint = require('gulp-htmllint');
var pkg = require('./package.json');

var argv = yargs
  .option('verbose', {default: false})
  .argv;

var srcDir = './src/';
var outDir = './dist/';

gulp.task('bower', bowerTask);
gulp.task('build', buildTask);
gulp.task('package', packageTask);
gulp.task('lint-html', lintHtmlTask);
gulp.task('lint-js', lintJsTask);
gulp.task('lint', gulp.parallel('lint-html', 'lint-js'));
gulp.task('docs', docsTask);
gulp.task('unittest', unittestTask);
gulp.task('test', gulp.parallel('lint', 'unittest'));
gulp.task('library-size', librarySizeTask);
gulp.task('module-sizes', moduleSizesTask);
gulp.task('size', gulp.parallel('library-size', 'module-sizes'));
gulp.task('default', gulp.parallel('build'));

function run(bin, args, done) {
  return new Promise(function(resolve, reject) {
    var exe = '"' + process.execPath + '"';
    var src = require.resolve(bin);
    var cmd = [exe, src].concat(args || []).join(' ');
    var ps = exec(cmd);

    ps.stdout.pipe(process.stdout);
    ps.stderr.pipe(process.stderr);
    ps.on('close', function(error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Generates the bower.json manifest file which will be pushed along release tags.
 * Specs: https://github.com/bower/spec/blob/master/json.md
 */
function bowerTask() {
  var json = JSON.stringify({
      name: pkg.name,
      description: pkg.description,
      homepage: pkg.homepage,
      license: pkg.license,
      version: pkg.version,
      main: outDir + 'Chart.js',
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
  return run('rollup/dist/bin/rollup', ['-c', argv.watch ? '--watch' : '']);
}

function packageTask() {
  return merge(
      // gather "regular" files landing in the package root
      gulp.src([outDir + '*.js', outDir + '*.css', 'LICENSE.md']),

      // since we moved the dist files one folder up (package root), we need to rewrite
      // samples src="../dist/ to src="../ and then copy them in the /samples directory.
      gulp.src('./samples/**/*', { base: '.' })
        .pipe(streamify(replace(/src="((?:\.\.\/)+)dist\//g, 'src="$1')))
  )
  // finally, create the zip archive
  .pipe(zip('Chart.js.zip'))
  .pipe(gulp.dest(outDir));
}

function lintJsTask() {
  var files = [
    'samples/**/*.html',
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

function lintHtmlTask() {
  return gulp.src('samples/**/*.html')
    .pipe(htmllint({
      failOnError: true,
    }));
}

function docsTask(done) {
  var bin = require.resolve('gitbook-cli/bin/gitbook.js');
  var cmd = argv.watch ? 'serve' : 'build';

  return run(bin, ['install', './'])
    .then(() => run(bin, [cmd, './', './dist/docs']))
    .then(() => {
      var config = {
        opts: {
          destination: './dist/docs/jsdoc'
        },
        recurse: true
      };
      gulp.src(['./src/**/*.js'], {read: false})
        .pipe(jsdoc(config, done));
    }).catch((err) => {
      done(new Error(err.stdout || err));
    });
}

function unittestTask(done) {
  new karma.Server({
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: !argv.watch,
    args: {
      coverage: !!argv.coverage,
      inputs: (argv.inputs || 'test/specs/**/*.js').split(';'),
      browsers: (argv.browsers || 'chrome,firefox').split(','),
      watch: argv.watch
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
    .pipe(terser())
    .pipe(size({
      showFiles: true,
      gzip: true
    }));
}
