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
	bower = require('./bower.json'),
	karma = require('gulp-karma'),
	umd = require('gulp-umd');

var srcDir = './src/';
var testDir = './test/';
/*
 *  Usage : gulp build --types=Bar,Line,Doughnut
 *  Output: - A built Chart.js file with Core and types Bar, Line and Doughnut concatenated together
 *          - A minified version of this code, in Chart.min.js
 */

var srcFiles = [
	'./node_modules/color/dist/color.min.js',
	'./src/core/core.js',
	'./src/core/core.helpers.js',
	'./src/core/core.element.js',
	'./src/core/**',
	'./src/controllers/**',
	'./src/scales/**',
	'./src/elements/**',
	'./src/charts/**',
];

var preTestFiles = [
	'./node_modules/moment/min/moment.min.js',
];

var testFiles = [
	'./test/mockContext.js',
	'./test/*.js'
];

gulp.task('build', buildTask);
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

	var isCustom = !!(util.env.types),
		outputDir = (isCustom) ? 'custom' : '.';

	return gulp.src(srcFiles)
		.pipe(concat('Chart.js'))
		.pipe(replace('{{ version }}', package.version))
		.pipe(umd({
			// We want a global always to ensure that we match previous behaviour
			templateSource:
				";(function(root, factory) {\n"+
				"  if (typeof define === 'function' && define.amd) {\n"+
				"    define(<%= amd %>, factory);\n"+
				"  } else if (typeof exports === 'object') {\n"+
				"    module.exports = factory.call(root,<%= cjs %>);\n"+
				"  } else {\n"+
				"    root.<%= namespace %> = factory.call(root,<%= global %>);\n"+
				"  }\n"+
				"}(this, function(<%= param %>) {\n"+
				"<%= contents %>\n"+
				"return <%= exports %>;\n"+
				"}));\n",
			dependencies: function() {
				return ['moment']
			}
		}))
		.pipe(gulp.dest(outputDir))
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(concat('Chart.min.js'))
		.pipe(gulp.dest(outputDir));

}

/*
 *  Usage : gulp bump
 *  Prompts: Version increment to bump
 *  Output: - New version number written into package.json & bower.json
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
			newVersion = semver.inc(package.version, increment);

		// Set the new versions into the bower/package object
		package.version = newVersion;
		bower.version = newVersion;

		// Write these to their own files, then build the output
		fs.writeFileSync('package.json', JSON.stringify(package, null, 2));
		fs.writeFileSync('bower.json', JSON.stringify(bower, null, 2));

		complete();
	});
}


function releaseTask() {
	exec('git tag -a v' + package.version);
}


function jshintTask() {
	return gulp.src(srcDir + '**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
}


function validHTMLTask() {
	return gulp.src('samples/*.html')
		.pipe(htmlv());
}


function unittestTask() {
	var files = srcFiles.slice();
	Array.prototype.unshift.apply(files, preTestFiles);
	Array.prototype.push.apply(files, testFiles);

	return gulp.src(files)
		.pipe(karma({
			configFile: 'karma.conf.ci.js',
			action: 'run'
		}));
}

function unittestWatchTask() {
	var files = srcFiles.slice();
	Array.prototype.unshift.apply(files, preTestFiles);
	Array.prototype.push.apply(files, testFiles);

	return gulp.src(files)
		.pipe(karma({
			configFile: 'karma.conf.js',
			action: 'watch'
		}));
}

function coverageTask() {
	var files = srcFiles.slice();
	Array.prototype.unshift.apply(files, preTestFiles);
	Array.prototype.push.apply(files, testFiles);

	return gulp.src(files)
		.pipe(karma({
			configFile: 'karma.coverage.conf.js',
			action: 'run'
		}));
}

function librarySizeTask() {
	return gulp.src('Chart.min.js')
		.pipe(size({
			gzip: true
		}));
}

function moduleSizesTask() {
	return gulp.src(srcDir + '*.js')
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
