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
	if (plugins.hasOwnProperty(k)) {
		Chart.plugins.register(plugins[k]);
	}
}

Chart.platform.initialize();

module.exports = Chart;
if (typeof window !== 'undefined') {
	window.Chart = Chart;
}

// DEPRECATIONS

/**
 * Provided for backward compatibility, not available anymore
 * @namespace Chart.Chart
 * @deprecated since version 2.8.0
 * @todo remove at version 3
 * @private
 */
Chart.Chart = Chart;

/**
 * Provided for backward compatibility, not available anymore
 * @namespace Chart.Legend
 * @deprecated since version 2.1.5
 * @todo remove at version 3
 * @private
 */
Chart.Legend = plugins.legend._element;

/**
 * Provided for backward compatibility, not available anymore
 * @namespace Chart.Title
 * @deprecated since version 2.1.5
 * @todo remove at version 3
 * @private
 */
Chart.Title = plugins.title._element;

/**
 * Provided for backward compatibility, use Chart.plugins instead
 * @namespace Chart.pluginService
 * @deprecated since version 2.1.5
 * @todo remove at version 3
 * @private
 */
Chart.pluginService = Chart.plugins;

/**
 * Provided for backward compatibility, inheriting from Chart.PlugingBase has no
 * effect, instead simply create/register plugins via plain JavaScript objects.
 * @interface Chart.PluginBase
 * @deprecated since version 2.5.0
 * @todo remove at version 3
 * @private
 */
Chart.PluginBase = Chart.Element.extend({});

/**
 * Provided for backward compatibility, use Chart.helpers.canvas instead.
 * @namespace Chart.canvasHelpers
 * @deprecated since version 2.6.0
 * @todo remove at version 3
 * @private
 */
Chart.canvasHelpers = Chart.helpers.canvas;

/**
 * Provided for backward compatibility, use Chart.layouts instead.
 * @namespace Chart.layoutService
 * @deprecated since version 2.7.3
 * @todo remove at version 3
 * @private
 */
Chart.layoutService = Chart.layouts;

/**
 * Provided for backward compatibility, not available anymore.
 * @namespace Chart.LinearScaleBase
 * @deprecated since version 2.8
 * @todo remove at version 3
 * @private
 */
Chart.LinearScaleBase = require('./scales/scale.linearbase');

/**
 * Provided for backward compatibility, instead we should create a new Chart
 * by setting the type in the config (`new Chart(id, {type: '{chart-type}'}`).
 * @deprecated since version 2.8.0
 * @todo remove at version 3
 */
Chart.helpers.each(
	[
		'Bar',
		'Bubble',
		'Doughnut',
		'Line',
		'PolarArea',
		'Radar',
		'Scatter'
	],
	function(klass) {
		Chart[klass] = function(ctx, cfg) {
			return new Chart(ctx, Chart.helpers.merge(cfg || {}, {
				type: klass.charAt(0).toLowerCase() + klass.slice(1)
			}));
		};
	}
);
