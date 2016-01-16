var gulp = require('gulp');
var exec = exec = require('child_process').exec;
var package = require('../../package.json');

function releaseTask() {
	exec('git tag -a v' + package.version);
}

gulp.task('release', ['build'], releaseTask);
module.exports = releaseTask;