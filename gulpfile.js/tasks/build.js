var gulp = require('gulp');
var concat = require('gulp-concat');
var path = require('path');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');

var config = require('../config');
var package = require('../../package.json');

function buildTask() {

	return gulp.src(path.join(config.root.dest, 'Chart.js'))
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(concat('Chart.min.js'))
		.pipe(gulp.dest(config.root.dest));

}

gulp.task('build', ['concat', 'pack'], buildTask);
module.exports = buildTask;