(function(Chart) {
	"use strict";

	var helpers = Chart.helpers;

	Chart.PolarArea = function(context, config) {
		config.type = 'polarArea';

		return new Chart(context, config);
	};
	
}).call(this, Chart);
