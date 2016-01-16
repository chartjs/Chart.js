var gulp = require('gulp');
var concat = require('gulp-concat');
var replace = require('gulp-replace');

var config = require('../config');
var package = require('../../package.json');

function concatTask() {

	return gulp.src(config.files.srcFiles)
		.pipe(concat('Chart.js'))
		.pipe(replace('{{ version }}', package.version))
		.pipe(gulp.dest(config.root.dest))
}

gulp.task('concat', concatTask);
module.exports = concatTask;