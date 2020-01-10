'use strict';

import LineController from './controller.line';
import defaults from '../core/core.defaults';

defaults._set('scatter', {
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

defaults._set('datasets', {
	scatter: {
		showLine: false
	}
});

// Scatter charts use line controllers
export default LineController;
