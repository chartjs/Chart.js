module.exports = function(config) {
	config.set({
		browsers: ['Chrome', 'Firefox'],
		frameworks: ['jasmine'],
		reporters: ['progress', 'html'],
	});
};