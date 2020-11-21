import LineController from './controller.line';

export default class ScatterController extends LineController {

}

ScatterController.id = 'scatter';

/**
 * @type {any}
 */
ScatterController.defaults = {
	scales: {
		x: {
			type: 'linear'
		},
		y: {
			type: 'linear'
		}
	},

	datasets: {
		showLine: false,
		fill: false
	},

	plugins: {
		tooltip: {
			callbacks: {
				title() {
					return '';     // doesn't make sense for scatter since data are formatted as a point
				},
				label(item) {
					return '(' + item.label + ', ' + item.formattedValue + ')';
				}
			}
		}
	}
};
