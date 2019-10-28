'use strict';

var LineController = require('./controller.line');
var defaults = require('../core/core.defaults');

defaults._set('scatter', {
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
				return '(' + item.label + ', ' + item.value + ')';
			}
		}
	}
});

defaults._set('global', {
	datasets: {
		scatter: {
			showLine: false
		}
	}
});

// Scatter charts use line controllers
module.exports = LineController;
