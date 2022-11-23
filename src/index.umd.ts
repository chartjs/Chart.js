// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/**
 * @namespace Chart
 */
import Chart from './core/core.controller.js';

import * as helpers from './helpers/index.js';
import _adapters from './core/core.adapters.js';
import Animation from './core/core.animation.js';
import animator from './core/core.animator.js';
import Animations from './core/core.animations.js';
import * as controllers from './controllers/index.js';
import DatasetController from './core/core.datasetController.js';
import Element from './core/core.element.js';
import * as elements from './elements/index.js';
import Interaction from './core/core.interaction.js';
import layouts from './core/core.layouts.js';
import * as platforms from './platform/index.js';
import * as plugins from './plugins/index.js';
import registry from './core/core.registry.js';
import Scale from './core/core.scale.js';
import * as scales from './scales/index.js';
import Ticks from './core/core.ticks.js';

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

