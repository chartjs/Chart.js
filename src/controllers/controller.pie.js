import DoughnutController from './controller.doughnut';
import {merge} from '../helpers/helpers.core';


// Pie charts are Doughnut chart with different defaults
export default class PieController extends DoughnutController {

}
PieController.id = 'pie';
PieController.beforeRegister = () => {
	DoughnutController.beforeRegister();
	PieController.defaults = merge({}, [DoughnutController.defaults, {
		cutoutPercentage: 0
	}]);
};
