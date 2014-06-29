var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	util = require('gulp-util'),
	jshint = require('gulp-jshint'),
	size = require('gulp-size'),
	connect = require('gulp-connect'),
	exec = require('child_process').exec;

var srcDir = './src/';
/*
 *	Usage : gulp build --types=Bar,Line,Doughnut
 *	Output: - A built Chart.js file with Core and types Bar, Line and Doughnut concatenated together
 *			- A minified version of this code, in Chart.min.js
 */

gulp.task('build', function(){

	// Default to all of the chart types, with Chart.Core first
	var srcFiles = [FileName('Core')],
		isCustom = !!(util.env.types),
		outputDir = (isCustom) ? 'custom' : '.';
	if (isCustom){
		util.env.types.split(',').forEach(function(type){ return srcFiles.push(FileName(type))});
	}
	else{
		// Seems gulp-concat remove duplicates - nice!
		// So we can use this to sort out dependency order - aka include Core first!
		srcFiles.push(srcDir+'*');
	}
	return gulp.src(srcFiles)
		.pipe(concat('Chart.js'))
		.pipe(gulp.dest(outputDir))
		.pipe(uglify({preserveComments:'some'}))
		.pipe(concat('Chart.min.js'))
		.pipe(gulp.dest(outputDir));

	function FileName(moduleName){
		return srcDir+'Chart.'+moduleName+'.js';
	};
});

gulp.task('jshint', function(){
	return gulp.src(srcDir + '*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('library-size', function(){
	return gulp.src('Chart.min.js')
		.pipe(size({
			gzip: true
		}));
});

gulp.task('module-sizes', function(){
	return gulp.src(srcDir + '*.js')
	.pipe(uglify({preserveComments:'some'}))
	.pipe(size({
		showFiles: true,
		gzip: true
	}))
});

gulp.task('watch', function(){
	gulp.watch('./src/*', ['build']);
});

gulp.task('test', ['jshint']);

gulp.task('size', ['library-size', 'module-sizes']);

gulp.task('default', ['build', 'watch']);

gulp.task('server', function(){
	connect.server({
		port: 8000,
	});
});

// Convenience task for opening the project straight from the command line
gulp.task('_open', function(){
	exec('open http://localhost:8000');
	exec('subl .');
});

gulp.task('dev', ['server', 'default']);
