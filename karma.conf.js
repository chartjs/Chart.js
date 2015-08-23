module.exports = function(config) {
	config.set({
		autoWatch: false,
		browsers: ['Chrome', 'Firefox'],
		frameworks: ['jasmine'],
		reporters: ['progress'],
		singleRun: false
	});
};