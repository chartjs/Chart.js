var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

function testTask() {
	gulpSequence('jshint', 'validHTML', 'unittest');
}

gulp.task('test', testTask);
module.exports = testTask;