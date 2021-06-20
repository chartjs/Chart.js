import {Title} from './plugin.title';
import layouts from '../core/core.layouts';

export default {
  id: 'subtitle',

  start(chart, _args, options) {
    const title = new Title({
      ctx: chart.ctx,
      options,
      chart
    });

    layouts.configure(chart, title, options);
    layouts.addBox(chart, title);
    this._title = title;
  },

  stop(chart) {
    layouts.removeBox(chart, this.title);
    delete this._title;
  },

  beforeUpdate(chart, _args, options) {
    const title = this._title;
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
    weight: 1500         // by default greater than legend (1000) and smaller that title (2000)
  },

  defaultRoutes: {
    color: 'color'
  },

  descriptors: {
    _scriptable: true,
    _indexable: false,
  },
};
