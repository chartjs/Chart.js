import {Title} from './plugin.title.js';
import layouts from '../core/core.layouts.js';
import type Chart from '../core/core.controller.js';
import type {EmptyObject} from '../types/basic.js';
import type {TitleOptions} from '../types/index.js';

const map = new WeakMap();

export default {
  id: 'subtitle',

  start(chart: Chart, _args: EmptyObject, options: TitleOptions) {
    const title = new Title({
      ctx: chart.ctx,
      options,
      chart
    });

    layouts.configure(chart, title, options);
    layouts.addBox(chart, title);
    map.set(chart, title);
  },

  stop(chart: Chart) {
    layouts.removeBox(chart, map.get(chart));
    map.delete(chart);
  },

  beforeUpdate(chart: Chart, _args, options: TitleOptions) {
    const title = map.get(chart);
    layouts.configure(chart, title, options);
    title.options = options;
  },

  defaults: {
    align: 'center',
    display: false,
    font: {
      weight: 'normal',
    },
    fullSize: true,
    padding: 0,
    position: 'top',
    text: '',
    weight: 1500         // by default greater than legend (1000) and smaller than title (2000)
  },

  defaultRoutes: {
    color: 'color'
  },

  descriptors: {
    _scriptable: true,
    _indexable: false,
  },
};
