var gulp = require('gulp');

var concat = require('gulp-concat');
var path = require('path');
var replace = require('gulp-replace');
var util = require('gulp-util');
var webpack = require('webpack');

var config = require('../config');
var package = require('../../package.json');

function packTask(callback) {
	var c = webpack({
		context: process.cwd(),
		entry: ['Chart.js'],
		output: {
			filename: 'Chart.js',
			library: "Chart",
			libraryTarget: "umd",
			umdNamedDefine: true
		},
		plugins: [
			new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
			new webpack.IgnorePlugin(/^moment$/)
		],
		resolve: {
			root: [process.cwd(), path.join(process.cwd(), 'node_modules')]
		}
	});

	c.run(function(err, stats) {
		if (err) {
			throw new gutil.PluginError("webpack", err);
		}

		util.log("[webpack]", stats.toString({
			// output options
			errorDetails: true
		}));
		callback();
	})
}

gulp.task('pack', packTask);
module.exports = packTask;