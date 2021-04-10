import Element from '../core/core.element';
import layouts from '../core/core.layouts';
import {PI, isArray, toPadding, toFont} from '../helpers';
import {_toLeftRightCenter, _alignStartEnd} from '../helpers/helpers.extras';
import {renderText} from '../helpers/helpers.canvas';

export class Title extends Element {
  /**
	 * @param {{ ctx: any; options: any; chart: any; }} config
	 */
  constructor(config) {
    super();

    this.chart = config.chart;
    this.options = config.options;
    this.ctx = config.ctx;
    this._padding = undefined;
    this.top = undefined;
    this.bottom = undefined;
    this.left = undefined;
    this.right = undefined;
    this.width = undefined;
    this.height = undefined;
    this.position = undefined;
    this.weight = undefined;
    this.fullSize = undefined;
  }

  update(maxWidth, maxHeight) {
    const me = this;
    const opts = me.options;

    me.left = 0;
    me.top = 0;

    if (!opts.display) {
      me.width = me.height = me.right = me.bottom = 0;
      return;
    }

    me.width = me.right = maxWidth;
    me.height = me.bottom = maxHeight;

    const lineCount = isArray(opts.text) ? opts.text.length : 1;
    me._padding = toPadding(opts.padding);
    const textSize = lineCount * toFont(opts.font).lineHeight + me._padding.height;

    if (me.isHorizontal()) {
      me.height = textSize;
    } else {
      me.width = textSize;
    }
  }

  isHorizontal() {
    const pos = this.options.position;
    return pos === 'top' || pos === 'bottom';
  }

  _drawArgs(offset) {
    const {top, left, bottom, right, options} = this;
    const align = options.align;
    let rotation = 0;
    let maxWidth, titleX, titleY;

    if (this.isHorizontal()) {
      titleX = _alignStartEnd(align, left, right);
      titleY = top + offset;
      maxWidth = right - left;
    } else {
      if (options.position === 'left') {
        titleX = left + offset;
        titleY = _alignStartEnd(align, bottom, top);
        rotation = PI * -0.5;
      } else {
        titleX = right - offset;
        titleY = _alignStartEnd(align, top, bottom);
        rotation = PI * 0.5;
      }
      maxWidth = bottom - top;
    }
    return {titleX, titleY, maxWidth, rotation};
  }

  draw() {
    const me = this;
    const ctx = me.ctx;
    const opts = me.options;

    if (!opts.display) {
      return;
    }

    const fontOpts = toFont(opts.font);
    const lineHeight = fontOpts.lineHeight;
    const offset = lineHeight / 2 + me._padding.top;
    const {titleX, titleY, maxWidth, rotation} = me._drawArgs(offset);

    renderText(ctx, opts.text, 0, 0, fontOpts, {
      color: opts.color,
      maxWidth,
      rotation,
      textAlign: _toLeftRightCenter(opts.align),
      textBaseline: 'middle',
      translation: [titleX, titleY],
    });
  }
}

function createTitle(chart, titleOpts) {
  const title = new Title({
    ctx: chart.ctx,
    options: titleOpts,
    chart
  });

  layouts.configure(chart, title, titleOpts);
  layouts.addBox(chart, title);
  chart.titleBlock = title;
}

export default {
  id: 'title',

  /**
	 * For tests
	 * @private
	 */
  _element: Title,

  start(chart, _args, options) {
    createTitle(chart, options);
  },

  stop(chart) {
    const titleBlock = chart.titleBlock;
    layouts.removeBox(chart, titleBlock);
    delete chart.titleBlock;
  },

  beforeUpdate(chart, _args, options) {
    const title = chart.titleBlock;
    layouts.configure(chart, title, options);
    title.options = options;
  },

  defaults: {
    align: 'center',
    display: false,
    font: {
      weight: 'bold',
    },
    fullSize: true,
    padding: 10,
    position: 'top',
    text: '',
    weight: 2000         // by default greater than legend (1000) to be above
  },

  defaultRoutes: {
    color: 'color'
  },

  descriptors: {
    _scriptable: true,
    _indexable: false,
  },
};
