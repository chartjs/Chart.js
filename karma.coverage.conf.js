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
			type: 'html',
			dir: 'coverage/'
		}
	});
};