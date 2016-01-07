(function(Chart) {
	"use strict";

	var helpers = Chart.helpers;

	Chart.Line = function(context, config) {
		config.type = 'line';

		return new Chart(context, config);
	};
	
}).call(this, Chart);
