var gulp = require('gulp');
var exec = exec = require('child_process').exec;

/*
 * Convenience task for opening the project straight from the command line
 */
function _openTask() {
	exec('open http://localhost:8000');
	exec('subl .');
}

gulp.task('_open', _openTask);
module.exports = _openTask;