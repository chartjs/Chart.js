var gulp = require('gulp');
var jshint = require('gulp-jshint');
var path = require('path');
var config = require('../config');

function jshintTask() {
	return gulp.src(path.join(config.root.src, '**/*.js'))
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
}

gulp.task('jshint', jshintTask);
module.exports = jshintTask;