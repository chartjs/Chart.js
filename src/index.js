/**
 * @namespace Chart
 */
var Chart = require('./core/core.controller');

Chart.helpers = require('./helpers/index');

// @todo dispatch these helpers into appropriated helpers/helpers.* file and write unit tests!
require('./core/core.helpers')(Chart);

Chart._adapters = require('./core/core.adapters');
Chart.Animation = require('./core/core.animation');
Chart.animationService = require('./core/core.animations');
Chart.controllers = require('./controllers/index');
Chart.DatasetController = require('./core/core.datasetController');
Chart.defaults = require('./core/core.defaults');
Chart.Element = require('./core/core.element');
Chart.elements = require('./elements/index');
Chart.Interaction = require('./core/core.interaction');
Chart.layouts = require('./core/core.layouts');
Chart.platform = require('./platforms/platform');
Chart.plugins = require('./core/core.plugins');
Chart.Scale = require('./core/core.scale');
Chart.scaleService = require('./core/core.scaleService');
Chart.Ticks = require('./core/core.ticks');
Chart.Tooltip = require('./core/core.tooltip');

// Register built-in scales
var scales = require('./scales');
Chart.helpers.each(scales, function(scale, type) {
	Chart.scaleService.registerScaleType(type, scale, scale._defaults);
});

// Load to register built-in adapters (as side effects)
require('./adapters');

// Loading built-in plugins
var plugins = require('./plugins');
for (var k in plugins) {
	if (Object.prototype.hasOwnProperty.call(plugins, k)) {
		Chart.plugins.register(plugins[k]);
	}
}

Chart.platform.initialize();

module.exports = Chart;
if (typeof window !== 'undefined') {
	window.Chart = Chart;
}
