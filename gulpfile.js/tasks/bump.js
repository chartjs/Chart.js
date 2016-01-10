var gulp = require('gulp');

var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var semver = require('semver');
var util = require('gulp-util');

var config = require('../config');
var bower = require('../../bower.json');
var package = require('../../package.json');

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

gulp.task('bump', bumpTask);
module.exports = bumpTask;