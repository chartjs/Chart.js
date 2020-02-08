'use strict';

import LineController from './controller.line';
import defaults from '../core/core.defaults';

defaults.set('scatter', {
	scales: {
		x: {
			type: 'linear',
			position: 'bottom'
		},
		y: {
			type: 'linear',
			position: 'left'
		}
	},

	datasets: {
		showLine: false
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

// Scatter charts use line controllers
export default LineController;
