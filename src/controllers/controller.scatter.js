import LineController from './controller.line';

export default class ScatterController extends LineController {

}

ScatterController.id = 'scatter';
ScatterController.defaults = /* #__PURE__*/Object.assign({}, LineController.defaults, {
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
