var gulp = require('gulp');
var karma = require('gulp-karma');
var config = require('../config');

function unittestTask() {
	var files = config.files.srcFiles.slice();
	Array.prototype.unshift.apply(files, config.files.preTestFiles);
	Array.prototype.push.apply(files, config.files.testFiles);

	return gulp.src(files)
		.pipe(karma({
			configFile: config.tasks.unittest.config,
			action: 'run'
		}));
}

gulp.task('unittest', unittestTask);
module.exports = unittestTask;