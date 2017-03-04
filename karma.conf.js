/* eslint camelcase: 0 */

module.exports = function(karma) {
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

	karma.set(config);
};
