"use strict";

module.exports = function(Chart) {

	Chart.Band = function(context, config) {
		config.type = 'band';
		return new Chart(context, config);
	};

}