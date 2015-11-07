module.exports = function(config) {
	var configuration = {
		browsers: ['Firefox'],
		customLaunchers: {
			Chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		},
		frameworks: ['jasmine'],
		reporters: ['progress', 'html'],
	};

	if (process.env.TRAVIS) {
		configuration.browsers.push('Chrome_travis_ci');
	}

	config.set(configuration);
};