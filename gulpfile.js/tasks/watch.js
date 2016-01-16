var gulp = require('gulp');

var karma = require('gulp-karma');
var path = require('path');
var util = require('gulp-util');

var config = require('../config');

function watchTask() {
	if (util.env.test) {
		return gulp.watch(path.join(config.root.src, '**'), ['build', 'unittest', 'unittestWatch']);
	}
	
	return gulp.watch(path.join(config.root.src, '**'), ['build']);
}

gulp.task('watch', watchTask);
module.exports = watchTask;