var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

function sizeTask() {
	gulpSequence('library-size');
}

gulp.task('size', sizeTask);
module.exports = sizeTask;