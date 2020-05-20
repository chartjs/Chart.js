import DoughnutController from './controller.doughnut';
import defaults from '../core/core.defaults';
import {clone} from '../helpers/helpers.core';

defaults.set('pie', clone(defaults.doughnut));
defaults.set('pie', {
	cutoutPercentage: 0
});

// Pie charts are Doughnut chart with different defaults
export default DoughnutController;
