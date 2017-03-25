/* eslint camelcase: 0 */

module.exports = function(karma) {
	var args = karma.args || {};
	var config = {
		browsers: ['Firefox'],
		frameworks: ['browserify', 'jasmine'],
		reporters: ['progress', 'kjhtml'],

		preprocessors: {
			'./test/jasmine.index.js': ['browserify'],
			'./src/**/*.js': ['browserify']
		},

		browserify: {
			debug: true
		}
	};

	// https://swizec.com/blog/how-to-run-javascript-tests-in-chrome-on-travis/swizec/6647
	if (process.env.TRAVIS) {
		config.browsers.push('chrome_travis_ci');
		config.customLaunchers = {
			chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		};
	} else {
		config.browsers.push('Chrome');
	}

	if (args.coverage) {
		config.reporters.push('coverage');
		config.browserify.transform = ['browserify-istanbul'];

		// https://github.com/karma-runner/karma-coverage/blob/master/docs/configuration.md
		config.coverageReporter = {
			dir: 'coverage/',
			reporters: [
				{type: 'html', subdir: 'report-html'},
				{type: 'lcovonly', subdir: '.', file: 'lcov.info'}
			]
		};
	}

	karma.set(config);
};
