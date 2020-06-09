import DoughnutController from './controller.doughnut';

// Pie charts are Doughnut chart with different defaults
export default class PieController extends DoughnutController {

}

PieController.id = 'pie';

/**
 * @type {any}
 */
PieController.defaults = {
	cutoutPercentage: 0
};
