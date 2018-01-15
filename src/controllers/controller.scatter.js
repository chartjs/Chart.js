'use strict';

var defaults = require('../core/core.defaults');
var helpers = require('../helpers/index');

defaults._set('scatter', {
	hover: {
		mode: 'single'
	},

	scales: {
		xAxes: [{
			id: 'x-axis-1',    // need an ID so datasets can reference the scale
			type: 'linear',    // scatter should not use a category axis
			position: 'bottom'
		}],
		yAxes: [{
			id: 'y-axis-1',
			type: 'linear',
			position: 'left'
		}]
	},

	tooltips: {
		callbacks: {
			title: function() {
				return '';     // doesn't make sense for scatter since data are formatted as a point
			},
			label: function(item) {
				return '(' + item.xLabel + ', ' + item.yLabel + ')';
			}
		}
	}
});

module.exports = function(Chart) {

	Chart.controllers.scatter = Chart.controllers.line.extend({

		/**
		 * @private
		 */
		_lineEnabled: function(dataset, options) {
			return helpers.valueOrDefault(dataset.showLine, helpers.valueOrDefault(options.showLines, false));
		}

	});

};
