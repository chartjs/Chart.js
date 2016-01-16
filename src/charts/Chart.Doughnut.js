(function(Chart) {
	"use strict";

	var helpers = Chart.helpers;

	Chart.Doughnut = function(context, config) {
		config.type = 'doughnut';

		return new Chart(context, config);
	};
	
}).call(this, Chart);
