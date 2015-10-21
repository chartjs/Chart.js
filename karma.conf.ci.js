module.exports = function(config) {
	config.set({
		browsers: ['Firefox'],
		frameworks: ['jasmine'],
		reporters: ['progress', 'html'],
	});
};