var gulp = require('gulp');
var connect = require('gulp-connect');

function serverTask() {
	connect.server({
		port: 8000
	});
}

gulp.task('server', serverTask);

module.exports = serverTask;