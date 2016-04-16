module.exports = function(config) {
	config.set({
		browsers: ['Chrome', 'Firefox'],
		frameworks: ['browserify', 'jasmine'],
		reporters: ['progress', 'html'],

		preprocessors: {
			'src/**/*.js': ['browserify']
		},
		browserify: {
			debug: true
		}
	});
};