module.exports = function(config) {
	config.set({
		browsers: ['Chrome', 'Firefox'],

		coverageReporter: {
			type: 'html',
			dir: 'coverage/'
		},

		frameworks: ['browserify', 'jasmine'],

		preprocessors: {
			'src/**/*.js': ['browserify', 'coverage']
		},
		browserify: {
			debug: true,
			transform: ['browserify-istanbul']
		},
		
		reporters: ['progress', 'coverage'],
	});
};