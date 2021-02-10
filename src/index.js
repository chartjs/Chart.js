// @ts-nocheck

/**
 * @namespace Chart
 */
import Chart from './core/core.controller';

import * as helpers from './helpers/index';
import _adapters from './core/core.adapters';
import Animation from './core/core.animation';
import animator from './core/core.animator';
import Animations from './core/core.animations';
import * as controllers from './controllers';
import DatasetController from './core/core.datasetController';
import Element from './core/core.element';
import * as elements from './elements/index';
import Interaction from './core/core.interaction';
import layouts from './core/core.layouts';
import * as platforms from './platform/index';
import * as plugins from './plugins';
import registry from './core/core.registry';
import Scale from './core/core.scale';
import * as scales from './scales';
import Ticks from './core/core.ticks';

// Register built-ins
Chart.register(controllers, scales, elements, plugins);

Chart.helpers = {...helpers};
Chart._adapters = _adapters;
Chart.Animation = Animation;
Chart.Animations = Animations;
Chart.animator = animator;
Chart.controllers = registry.controllers.items;
Chart.DatasetController = DatasetController;
Chart.Element = Element;
Chart.elements = elements;
Chart.Interaction = Interaction;
Chart.layouts = layouts;
Chart.platforms = platforms;
Chart.Scale = Scale;
Chart.Ticks = Ticks;

// Compatibility with ESM extensions
Object.assign(Chart, controllers, scales, elements, plugins, platforms);
Chart.Chart = Chart;

if (typeof window !== 'undefined') {
  window.Chart = Chart;
}

export default Chart;
