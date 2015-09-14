module.exports = function(config) {
	config.set({
		browsers: ['Chrome', 'Firefox'],

		coverageReporter: {
			type: 'html',
			dir: 'coverage/'
		},

		frameworks: ['jasmine'],

		preprocessors: {
			'src/**/*.js': ['coverage']
		},
		
		reporters: ['progress', 'coverage'],
	});
};