/* eslint camelcase: 0 */

module.exports = function(karma) {
	var args = karma.args || {};
	var config = {
		frameworks: ['browserify', 'jasmine'],
		reporters: ['progress', 'kjhtml'],
		browsers: ['chrome', 'firefox'],

		// Explicitly disable hardware acceleration to make image
		// diff more stable when ran on Travis and dev machine.
		// https://github.com/chartjs/Chart.js/pull/5629
		customLaunchers: {
			chrome: {
				base: 'Chrome',
				flags: [
					'--disable-accelerated-2d-canvas'
				]
			},
			firefox: {
				base: 'Firefox',
				prefs: {
					'layers.acceleration.disabled': true
				}
			}
		},

		preprocessors: {
			'./test/jasmine.index.js': ['browserify'],
			'./src/**/*.js': ['browserify']
		},

		browserify: {
			debug: true
		},

		// These settings deal with browser disconnects. We had seen test flakiness from Firefox
		// [Firefox 56.0.0 (Linux 0.0.0)]: Disconnected (1 times), because no message in 10000 ms.
		// https://github.com/jasmine/jasmine/issues/1327#issuecomment-332939551
		browserDisconnectTolerance: 3
	};

	// https://swizec.com/blog/how-to-run-javascript-tests-in-chrome-on-travis/swizec/6647
	if (process.env.TRAVIS) {
		config.customLaunchers.chrome.flags.push('--no-sandbox');
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
