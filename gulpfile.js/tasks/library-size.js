var gulp = require('gulp');
var path = require('path');
var size = require('gulp-size');

var config = require('../config');

function librarySizeTask() {
	return gulp.src(path.join(config.root.dest, 'Chart.min.js'))
		.pipe(size({
			gzip: true
		}));
}

gulp.task('library-size', librarySizeTask);
module.exports = librarySizeTask;