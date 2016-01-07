(function(Chart) {
	"use strict";

	var helpers = Chart.helpers;

	var defaultConfig = {
		aspectRatio: 1,
	};

	Chart.Radar = function(context, config) {
		config.options = helpers.configMerge(defaultConfig, config.options);
		config.type = 'radar';

		return new Chart(context, config);
	};
	
}).call(this, Chart);
