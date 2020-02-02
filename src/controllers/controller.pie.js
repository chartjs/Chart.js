'use strict';

import DoughnutController from './controller.doughnut';
import defaults from '../core/core.defaults';
import {clone} from '../helpers/helpers.core';

defaults._set('pie', clone(defaults.doughnut));
defaults._set('pie', {
	cutoutPercentage: 0
});

// Pie charts are Doughnut chart with different defaults
export default DoughnutController;
