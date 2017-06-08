'use strict';

module.exports = function(Chart) {

	Chart.HeatMap = function(context, config) {
		config.type = 'heatmap';

		return new Chart(context, config);
	};

};
