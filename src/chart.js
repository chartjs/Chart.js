/**
 * @namespace Chart
 */
var Chart = require('./core/core')();

Chart.helpers = require('./helpers/index');

// @todo dispatch these helpers into appropriated helpers/helpers.* file and write unit tests!
require('./core/core.helpers')(Chart);

Chart.defaults = require('./core/core.defaults');
Chart.Element = require('./core/core.element');
Chart.elements = require('./elements/index');
Chart.Interaction = require('./core/core.interaction');
Chart.layouts = require('./core/core.layouts');
Chart.platform = require('./platforms/platform');
Chart.plugins = require('./core/core.plugins');
Chart.Ticks = require('./core/core.ticks');

require('./core/core.animation')(Chart);
require('./core/core.controller')(Chart);
require('./core/core.datasetController')(Chart);
require('./core/core.scaleService')(Chart);
require('./core/core.scale')(Chart);
require('./core/core.tooltip')(Chart);

require('./scales/scale.linearbase')(Chart);
require('./scales/scale.category')(Chart);
require('./scales/scale.linear')(Chart);
require('./scales/scale.logarithmic')(Chart);
require('./scales/scale.radialLinear')(Chart);
require('./scales/scale.time')(Chart);

// Controllers must be loaded after elements
// See Chart.core.datasetController.dataElementType
require('./controllers/controller.bar')(Chart);
require('./controllers/controller.bubble')(Chart);
require('./controllers/controller.doughnut')(Chart);
require('./controllers/controller.line')(Chart);
require('./controllers/controller.polarArea')(Chart);
require('./controllers/controller.radar')(Chart);
require('./controllers/controller.scatter')(Chart);

require('./charts/Chart.Bar')(Chart);
require('./charts/Chart.Bubble')(Chart);
require('./charts/Chart.Doughnut')(Chart);
require('./charts/Chart.Line')(Chart);
require('./charts/Chart.PolarArea')(Chart);
require('./charts/Chart.Radar')(Chart);
require('./charts/Chart.Scatter')(Chart);

// Loading built-it plugins
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
 * @deprecated since version 2.8.0
 * @todo remove at version 3
 * @private
 */
Chart.layoutService = Chart.layouts;
