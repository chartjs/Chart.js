import DoughnutController from './controller.doughnut';

// Pie charts are Doughnut chart with different defaults
export default class PieController extends DoughnutController {

}

PieController.id = 'pie';

/**
 * @type {any}
 */
PieController.defaults = /* #__PURE__*/Object.assign({}, DoughnutController.defaults, {
	cutoutPercentage: 0
});
