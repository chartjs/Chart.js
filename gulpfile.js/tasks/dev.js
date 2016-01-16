var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

function devTask() {
	gulpSequence('server', 'default');
}

gulp.task('dev', devTask);
module.exports = devTask;