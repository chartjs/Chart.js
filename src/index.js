/**
 * @namespace Chart
 */
import Chart from './core/core.controller';

import helpers from './helpers';
import _adapters from './core/core.adapters';
import Animation from './core/core.animation';
import Animator from './core/core.animator';
import animationService from './core/core.animations';
import controllers from './controllers';
import DatasetController from './core/core.datasetController';
import defaults from './core/core.defaults';
import Element from './core/core.element';
import elements from './elements';
import Interaction from './core/core.interaction';
import layouts from './core/core.layouts';
import platform from './platforms/platform';
import plugins from './core/core.plugins';
import Scale from './core/core.scale';
import scaleService from './core/core.scaleService';
import Ticks from './core/core.ticks';
import Tooltip from './core/core.tooltip';

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
Chart.platform = platform;
Chart.plugins = plugins;
Chart.Scale = Scale;
Chart.scaleService = scaleService;
Chart.Ticks = Ticks;
Chart.Tooltip = Tooltip;

// Register built-in scales
import './scales';

// Load to register built-in adapters (as side effects)
import './adapters';

// Loading built-in plugins
import './plugins';

Chart.platform.initialize();

if (typeof window !== 'undefined') {
	window.Chart = Chart;
}

export default Chart;
