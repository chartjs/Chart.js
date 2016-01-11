var gulp = require('gulp');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var umd = require('gulp-umd');

var config = require('../config');
var package = require('../../package.json');

function buildTask() {

	return gulp.src(config.files.srcFiles)
		.pipe(concat('Chart.js'))
		.pipe(replace('{{ version }}', package.version))
		/*.pipe(umd({
			// We want a global always to ensure that we match previous behaviour
			templateSource: ";(function(root, factory) {\n" +
				"  if (typeof define === 'function' && define.amd) {\n" +
				"    define(<%= amd %>, factory);\n" +
				"  } else if (typeof exports === 'object') {\n" +
				"    module.exports = factory.call(root,<%= cjs %>);\n" +
				"  } else {\n" +
				"    root.<%= namespace %> = factory.call(root,<%= global %>);\n" +
				"  }\n" +
				"}(this || window, function(<%= param %>) {\n" +
				"<%= contents %>\n" +
				"return <%= exports %>;\n" +
				"}));\n",
			dependencies: function() {
				return ['moment']
			}
		}))*/
		.pipe(gulp.dest(config.root.dest))
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(concat('Chart.min.js'))
		.pipe(gulp.dest(config.root.dest));

}

gulp.task('build', buildTask);
module.exports = buildTask;