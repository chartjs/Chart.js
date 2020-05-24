import DoughnutController from './controller.doughnut';

/**
 * @type {any}
 */
const defaults = /*#__PURE__*/Object.assign({}, [DoughnutController.defaults, {
	cutoutPercentage: 0
}]);

// Pie charts are Doughnut chart with different defaults
export default class PieController extends DoughnutController {

}
PieController.id = 'pie';
PieController.defaults = defaults;
PieController.beforeRegister = () => {
	DoughnutController.beforeRegister();
};
