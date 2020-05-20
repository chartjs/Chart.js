import LineController from './controller.line';
import defaults from '../core/core.defaults';

defaults.set('scatter', {
	scales: {
		x: {
			type: 'linear'
		},
		y: {
			type: 'linear'
		}
	},

	datasets: {
		showLine: false
	},

	tooltips: {
		callbacks: {
			title() {
				return '';     // doesn't make sense for scatter since data are formatted as a point
			},
			label(item) {
				return '(' + item.label + ', ' + item.value + ')';
			}
		}
	}
});

// Scatter charts use line controllers
export default LineController;
