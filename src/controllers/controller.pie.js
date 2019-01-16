'use strict';

var DoughnutController = require('./controller.doughnut');
var defaults = require('../core/core.defaults');
var helpers = require('../helpers/index');

defaults._set('pie', helpers.clone(defaults.doughnut));
defaults._set('pie', {
	cutoutPercentage: 0
});

// Pie charts are Doughnut chart with different defaults
module.exports = DoughnutController;
