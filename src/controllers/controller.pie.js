'use strict';

import DoughnutController from './controller.doughnut';
import defaults from '../core/core.defaults';
import helpers from '../helpers';

defaults._set('pie', helpers.clone(defaults.doughnut));
defaults._set('pie', {
	cutoutPercentage: 0
});

// Pie charts are Doughnut chart with different defaults
export default DoughnutController;
