(function(Chart) {
	"use strict";

	var helpers = Chart.helpers;

	Chart.Bar = function(context, config) {
		config.type = 'bar';

		return new Chart(context, config);
	};

}).call(this, Chart);
