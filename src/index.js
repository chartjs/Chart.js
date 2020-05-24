/* eslint-disable import/no-namespace, import/namespace */

/**
 * @namespace Chart
 */
import Chart from './core/core.controller';

import helpers from './helpers/index';
import _adapters from './core/core.adapters';
import Animation from './core/core.animation';
import animator from './core/core.animator';
import animationService from './core/core.animations';
import * as controllers from './controllers';
import DatasetController from './core/core.datasetController';
import defaults from './core/core.defaults';
import Element from './core/core.element';
import * as elements from './elements/index';
import Interaction from './core/core.interaction';
import layouts from './core/core.layouts';
import * as platforms from './platform/index';
import * as plugins from './plugins';
import pluginsCore from './core/core.plugins';
import registry from './core/core.registry';
import Scale from './core/core.scale';
import * as scales from './scales';
import Ticks from './core/core.ticks';

Chart.register = (...items) => registry.add(...items);

// Register built-ins
Chart.register(controllers, scales, elements, plugins);

Chart.helpers = helpers;
Chart._adapters = _adapters;
Chart.Animation = Animation;
Chart.animator = animator;
Chart.animationService = animationService;
Chart.controllers = registry.controllers.items;
Chart.DatasetController = DatasetController;
Chart.defaults = defaults;
Chart.Element = Element;
Chart.elements = elements;
Chart.Interaction = Interaction;
Chart.layouts = layouts;
Chart.platforms = platforms;
Chart.plugins = pluginsCore;
Chart.registry = registry;
Chart.Scale = Scale;
Chart.Ticks = Ticks;

for (const k in plugins) {
	if (Object.prototype.hasOwnProperty.call(plugins, k)) {
		Chart.plugins.register(plugins[k]);
	}
}

if (typeof window !== 'undefined') {
	// @ts-ignore
	window.Chart = Chart;
}

export default Chart;
