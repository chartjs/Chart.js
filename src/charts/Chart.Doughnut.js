(function() {
	"use strict";

	var root = this;
	var Chart = root.Chart;
	var helpers = Chart.helpers;

	Chart.Doughnut = function(context, config) {
		config.type = 'doughnut';

		return new Chart(context, config);
	};
	
}).call(this);
