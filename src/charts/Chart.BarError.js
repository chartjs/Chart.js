'use strict';

module.exports = function(Chart) {

	Chart.Bar = function(context, config) {
		config.type = 'barError';

		return new Chart(context, config);
	};

};
