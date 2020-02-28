/* eslint-disable import/no-namespace, import/namespace */

/**
 * @namespace Chart
 */
import Chart from './core/core.controller';

import helpers from './helpers/index';
import _adapters from './core/core.adapters';
import Animation from './core/core.animation';
import Animator from './core/core.animator';
import animationService from './core/core.animations';
import controllers from './controllers/index';
import DatasetController from './core/core.datasetController';
import defaults from './core/core.defaults';
import Element from './core/core.element';
import * as elements from './elements/index';
import Interaction from './core/core.interaction';
import layouts from './core/core.layouts';
import platforms from './platform/platforms';
import pluginsCore from './core/core.plugins';
import Scale from './core/core.scale';
import scaleService from './core/core.scaleService';
import Ticks from './core/core.ticks';

Chart.helpers = helpers;
Chart._adapters = _adapters;
Chart.Animation = Animation;
Chart.Animator = Animator;
Chart.animationService = animationService;
Chart.controllers = controllers;
Chart.DatasetController = DatasetController;
Chart.defaults = defaults;
Chart.Element = Element;
Chart.elements = elements;
Chart.Interaction = Interaction;
Chart.layouts = layouts;
Chart.platforms = platforms;
Chart.plugins = pluginsCore;
Chart.Scale = Scale;
Chart.scaleService = scaleService;
Chart.Ticks = Ticks;

// Register built-in scales
import * as scales from './scales/index';
Object.keys(scales).forEach(key => Chart.scaleService.registerScale(scales[key]));

// Loading built-in plugins
import plugins from './plugins/index';
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
