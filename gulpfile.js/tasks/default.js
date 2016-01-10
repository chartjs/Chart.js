var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

function defaultTask() {
	gulpSequence('build', 'watch');
}

gulp.task('default', defaultTask);
module.exports = defaultTask;