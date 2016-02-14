module.exports = function(config) {
	config.set({
		browsers: ['Chrome', 'Firefox'],

		frameworks: ['browserify', 'jasmine'],

		preprocessors: {
			'src/**/*.js': ['browserify']
		},
		browserify: {
			debug: true,
			transform: [['browserify-istanbul', {
				instrumenterConfig: {
					embed: true
				}
			}]]
		},
		
		reporters: ['progress', 'coverage'],
		coverageReporter: {
			dir: 'coverage/',
			reporters: [
				{ type: 'html', subdir: 'report-html' },
				{ type: 'lcovonly', subdir: '.', file: 'lcov.info' }
			]
		}
	});
};