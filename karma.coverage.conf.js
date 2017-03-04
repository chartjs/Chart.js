module.exports = function(config) {
	var configuration = {
		browsers: ['Firefox'],
		frameworks: ['browserify', 'jasmine'],
		reporters: ['progress', 'coverage'],

		preprocessors: {
			'./test/jasmine.index.js': ['browserify'],
			'./src/**/*.js': ['browserify']
		},

		browserify: {
			debug: true,
			transform: [['browserify-istanbul', {
				instrumenterConfig: {
					embed: true
				}
			}]]
		},

		coverageReporter: {
			dir: 'coverage/',
			reporters: [
				{ type: 'html', subdir: 'report-html' },
				{ type: 'lcovonly', subdir: '.', file: 'lcov.info' }
			]
		}
	};

	// If on the CI, use the CI chrome launcher
	if (process.env.TRAVIS) {
		configuration.browsers.push('Chrome_travis_ci');
		configuration.customLaunchers = {
			Chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		};
	} else {
		configuration.browsers.push('Chrome');
	}

	config.set(configuration);
};