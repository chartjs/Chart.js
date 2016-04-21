'use strict';

module.exports = function(Chart) {

	Chart.Line = function(context, config) {
		config.type = 'lineError';

		return new Chart(context, config);
	};

};
