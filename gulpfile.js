var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util'),
    jshint = require('gulp-jshint'),
    size = require('gulp-size'),
    connect = require('gulp-connect'),
    replace = require('gulp-replace'),
    htmlv = require('gulp-html-validator'),
    inquirer = require('inquirer'),
    semver = require('semver'),
    exec = require('child_process').exec,
    fs = require('fs'),
    package = require('./package.json'),
    bower = require('./bower.json');

var srcDir = './src/';
/*
 *  Usage : gulp build --types=Bar,Line,Doughnut
 *  Output: - A built Chart.js file with Core and types Bar, Line and Doughnut concatenated together
 *          - A minified version of this code, in Chart.min.js
 */

gulp.task('build', function() {

    var srcFiles = [
            './src/core/core.js',
            './src/core/core.helpers.js',
            './src/core/core.chart.js',
            './src/core/core.element.js',
            './src/core/**',
            './src/controllers/**',
            './src/scales/**',
            './src/elements/**',
            './src/charts/chart.bar.js',
            './node_modules/color/dist/color.min.js'
        ],
        isCustom = !!(util.env.types),
        outputDir = (isCustom) ? 'custom' : '.';

    return gulp.src(srcFiles)
        .pipe(concat('Chart.js'))
        .pipe(replace('{{ version }}', package.version))
        .pipe(gulp.dest(outputDir))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(concat('Chart.min.js'))
        .pipe(gulp.dest(outputDir));

});

/*
 *  Usage : gulp bump
 *  Prompts: Version increment to bump
 *  Output: - New version number written into package.json & bower.json
 */

gulp.task('bump', function(complete) {
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
            newVersion = semver.inc(package.version, increment);

        // Set the new versions into the bower/package object
        package.version = newVersion;
        bower.version = newVersion;

        // Write these to their own files, then build the output
        fs.writeFileSync('package.json', JSON.stringify(package, null, 2));
        fs.writeFileSync('bower.json', JSON.stringify(bower, null, 2));

        complete();
    });
});

gulp.task('release', ['build'], function() {
    exec('git tag -a v' + package.version);
});

gulp.task('jshint', function() {
    return gulp.src(srcDir + '*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('valid', function() {
    return gulp.src('samples/*.html')
        .pipe(htmlv());
});

gulp.task('library-size', function() {
    return gulp.src('Chart.min.js')
        .pipe(size({
            gzip: true
        }));
});

gulp.task('module-sizes', function() {
    return gulp.src(srcDir + '*.js')
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(size({
            showFiles: true,
            gzip: true
        }));
});

gulp.task('watch', function() {
    gulp.watch('./src/**', ['build']);
});

gulp.task('test', ['jshint', 'valid']);

gulp.task('size', ['library-size', 'module-sizes']);

gulp.task('default', ['build', 'watch']);

gulp.task('server', function() {
    connect.server({
        port: 8000
    });
});

// Convenience task for opening the project straight from the command line
gulp.task('_open', function() {
    exec('open http://localhost:8000');
    exec('subl .');
});

gulp.task('dev', ['server', 'default']);
