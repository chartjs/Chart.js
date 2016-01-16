var gulp = require('gulp');
var htmlv = require('gulp-html-validator');
var path = require('path');
var config = require('../config');

function validHTMLTask() {
	return gulp.src(path.join(config.tasks.validHTML.src, '**/*.html'))
		.pipe(htmlv());
}

gulp.task('validHTML', validHTMLTask);
module.exports = validHTMLTask;