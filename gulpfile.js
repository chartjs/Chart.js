(function () {
  'use strict';
  
  var gulp = require('gulp'),
      plugins = require('gulp-load-plugins')(),
      yargs = require('yargs'),
      karma = require('karma').server,
      exec = require('child_process').exec,
      testGlob = [
        'spec/**'
      ],
      srcGlob = [
        'src/Chart.Core.js',
        'src/!(Chart.Core.js)'
      ];
  
  /*
   *  Usage : gulp build --types=Bar,Line,Doughnut
   *  Output: - A built Chart.js file with Core and types Bar, Line and Doughnut concatenated together
   *      - A minified version of this code, in Chart.min.js
   */

  gulp.task('build', function (done) {
    // Default to all of the chart types, with Chart.Core first
    var types = yargs.argv.types,
        outputDir = types ? 'dist/custom' : 'dist';
    
    if (types) {
      srcGlob = ['src/Chart.Core.js'];
      types.split(',').forEach(function (type) { 
        type = type.charAt(0).toUpperCase() + type.substr(1);
        srcGlob.push('src/Chart.' + type + '.js');
      });
    }
    
    gulp.src(srcGlob)
    .pipe(plugins.concat('Chart.js'))
    .pipe(gulp.dest(outputDir))
    .pipe(plugins.uglify({preserveComments: 'some'}))
    .pipe(plugins.rename('Chart.min.js'))
    .pipe(gulp.dest(outputDir))
    .on('end', done);
  });

  gulp.task('jshint', function (done) {
    gulp.src(srcGlob)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'))
    .on('finish', done);
  });

  gulp.task('library-size', ['build'], function (done) {
    gulp.src('Chart.min.js')
    .pipe(plugins.size({
      gzip: true
    }))
    .on('end', done);
  });

  gulp.task('module-sizes', function (done) {
    gulp.src(srcGlob)
    .pipe(plugins.uglify({preserveComments: 'some'}))
    .pipe(plugins.size({
      showFiles: true,
      gzip: true
    }))
    .on('end', done);
  });

  gulp.task('watch', function () {
    gulp.src(srcGlob)
    .pipe(plugins.watch({}, ['build']));
  });

  gulp.task('test', ['jshint'], function (done) {
    var reporter = yargs.argv.reporter || 'progress',
        conf = {
          browsers: ['PhantomJS'],
          frameworks: ['mocha', 'chai'],
          files: srcGlob.concat(testGlob),
          singleRun: true,
          reporters: [reporter]
        };
    karma.start(conf, done);
  });

  gulp.task('size', ['library-size', 'module-sizes']);

  gulp.task('default', ['watch']);

  gulp.task('server', function () {
    plugins.connect.server({
      port: 8000,
    });
  });

  // Convenience task for opening the project straight from the command line
  gulp.task('_open', function () {
    exec('open http://localhost:8000');
    exec('subl .');
  });

  gulp.task('dev', ['server', 'default']);
})();