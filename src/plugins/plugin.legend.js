import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import layouts from '../core/core.layouts';
import {drawPoint, renderText} from '../helpers/helpers.canvas';
import {
  callback as call, valueOrDefault, toFont, isObject,
  toPadding, getRtlAdapter, overrideTextDirection, restoreTextDirection,
  clipArea, unclipArea
} from '../helpers/index';
import {_toLeftRightCenter, _alignStartEnd} from '../helpers/helpers.extras';
/**
 * @typedef { import("../platform/platform.base").ChartEvent } ChartEvent
 */

const getBoxSize = (labelOpts, fontSize) => {
  let {boxHeight = fontSize, boxWidth = fontSize} = labelOpts;

  if (labelOpts.usePointStyle) {
    boxHeight = Math.min(boxHeight, fontSize);
    boxWidth = Math.min(boxWidth, fontSize);
  }

  return {
    boxWidth,
    boxHeight,
    itemHeight: Math.max(fontSize, boxHeight)
  };
};

export class Legend extends Element {

  /**
	 * @param {{ ctx: any; options: any; chart: any; }} config
	 */
  constructor(config) {
    super();

    this._added = false;

    // Contains hit boxes for each dataset (in dataset order)
    this.legendHitBoxes = [];

    /**
 		 * @private
 		 */
    this._hoveredItem = null;

    // Are we in doughnut mode which has a different data type
    this.doughnutMode = false;

    this.chart = config.chart;
    this.options = config.options;
    this.ctx = config.ctx;
    this.legendItems = undefined;
    this.columnSizes = undefined;
    this.lineWidths = undefined;
    this.maxHeight = undefined;
    this.maxWidth = undefined;
    this.top = undefined;
    this.bottom = undefined;
    this.left = undefined;
    this.right = undefined;
    this.height = undefined;
    this.width = undefined;
    this._margins = undefined;
    this.position = undefined;
    this.weight = undefined;
    this.fullSize = undefined;
  }

  update(maxWidth, maxHeight, margins) {
    const me = this;

    me.maxWidth = maxWidth;
    me.maxHeight = maxHeight;
    me._margins = margins;

    me.setDimensions();
    me.buildLabels();
    me.fit();
  }

  setDimensions() {
    const me = this;

    if (me.isHorizontal()) {
      me.width = me.maxWidth;
      me.left = 0;
      me.right = me.width;
    } else {
      me.height = me.maxHeight;
      me.top = 0;
      me.bottom = me.height;
    }
  }

  buildLabels() {
    const me = this;
    const labelOpts = me.options.labels || {};
    let legendItems = call(labelOpts.generateLabels, [me.chart], me) || [];

    if (labelOpts.filter) {
      legendItems = legendItems.filter((item) => labelOpts.filter(item, me.chart.data));
    }

    if (labelOpts.sort) {
      legendItems = legendItems.sort((a, b) => labelOpts.sort(a, b, me.chart.data));
    }

    if (me.options.reverse) {
      legendItems.reverse();
    }

    me.legendItems = legendItems;
  }

  fit() {
    const me = this;
    const {options, ctx} = me;

    // The legend may not be displayed for a variety of reasons including
    // the fact that the defaults got set to `false`.
    // When the legend is not displayed, there are no guarantees that the options
    // are correctly formatted so we need to bail out as early as possible.
    if (!options.display) {
      me.width = me.height = 0;
      return;
    }

    const labelOpts = options.labels;
    const labelFont = toFont(labelOpts.font, me.chart.options.font);
    const fontSize = labelFont.size;
    const titleHeight = me._computeTitleHeight();
    const {boxWidth, itemHeight} = getBoxSize(labelOpts, fontSize);

    let width, height;

    ctx.font = labelFont.string;

    if (me.isHorizontal()) {
      width = me.maxWidth; // fill all the width
      height = me._fitRows(titleHeight, fontSize, boxWidth, itemHeight) + 10;
    } else {
      height = me.maxHeight; // fill all the height
      width = me._fitCols(titleHeight, fontSize, boxWidth, itemHeight) + 10;
    }

    me.width = Math.min(width, options.maxWidth || me.maxWidth);
    me.height = Math.min(height, options.maxHeight || me.maxHeight);
  }

  /**
	 * @private
	 */
  _fitRows(titleHeight, fontSize, boxWidth, itemHeight) {
    const me = this;
    const {ctx, maxWidth} = me;
    const padding = me.options.labels.padding;
    const hitboxes = me.legendHitBoxes = [];
    // Width of each line of legend boxes. Labels wrap onto multiple lines when there are too many to fit on one
    const lineWidths = me.lineWidths = [0];
    let totalHeight = titleHeight;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    me.legendItems.forEach((legendItem, i) => {
      const itemWidth = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

      if (i === 0 || lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
        totalHeight += itemHeight + padding;
        lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0;
      }

      // Store the hitbox width and height here. Final position will be updated in `draw`
      hitboxes[i] = {left: 0,	top: 0,	width: itemWidth, height: itemHeight};

      lineWidths[lineWidths.length - 1] += itemWidth + padding;

    });
    return totalHeight;
  }

  _fitCols(titleHeight, fontSize, boxWidth, itemHeight) {
    const me = this;
    const {ctx, maxHeight} = me;
    const padding = me.options.labels.padding;
    const hitboxes = me.legendHitBoxes = [];
    const columnSizes = me.columnSizes = [];
    let totalWidth = padding;
    let currentColWidth = 0;
    let currentColHeight = 0;

    const heightLimit = maxHeight - titleHeight;
    me.legendItems.forEach((legendItem, i) => {
      const itemWidth = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

      // If too tall, go to new column
      if (i > 0 && currentColHeight + fontSize + 2 * padding > heightLimit) {
        totalWidth += currentColWidth + padding;
        columnSizes.push({width: currentColWidth, height: currentColHeight}); // previous column size
        currentColWidth = currentColHeight = 0;
      }

      // Get max width
      currentColWidth = Math.max(currentColWidth, itemWidth);
      currentColHeight += fontSize + padding;

      // Store the hitbox width and height here. Final position will be updated in `draw`
      hitboxes[i] = {left: 0,	top: 0,	width: itemWidth, height: itemHeight};
    });

    totalWidth += currentColWidth;
    columnSizes.push({width: currentColWidth, height: currentColHeight}); // previous column size

    return totalWidth;
  }

  isHorizontal() {
    return this.options.position === 'top' || this.options.position === 'bottom';
  }

  draw() {
    const me = this;
    if (me.options.display) {
      const ctx = me.ctx;
      clipArea(ctx, me);

      me._draw();

      unclipArea(ctx);
    }
  }

  /**
	 * @private
	 */
  _draw() {
    const me = this;
    const {options: opts, columnSizes, lineWidths, ctx, legendHitBoxes} = me;
    const {align, labels: labelOpts} = opts;
    const defaultColor = defaults.color;
    const rtlHelper = getRtlAdapter(opts.rtl, me.left, me.width);
    const labelFont = toFont(labelOpts.font, me.chart.options.font);
    const {color: fontColor, padding} = labelOpts;
    const fontSize = labelFont.size;
    let cursor;

    me.drawTitle();

    // Canvas setup
    ctx.textAlign = rtlHelper.textAlign('left');
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = fontColor; // for strikethrough effect
    ctx.fillStyle = fontColor; // render in correct colour
    ctx.font = labelFont.string;

    const {boxWidth, boxHeight, itemHeight} = getBoxSize(labelOpts, fontSize);

    // current position
    const drawLegendBox = function(x, y, legendItem) {
      if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
        return;
      }

      // Set the ctx for the box
      ctx.save();

      const lineWidth = valueOrDefault(legendItem.lineWidth, 1);
      ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
      ctx.lineCap = valueOrDefault(legendItem.lineCap, 'butt');
      ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0);
      ctx.lineJoin = valueOrDefault(legendItem.lineJoin, 'miter');
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);

      ctx.setLineDash(valueOrDefault(legendItem.lineDash, []));

      if (labelOpts.usePointStyle) {
        // Recalculate x and y for drawPoint() because its expecting
        // x and y to be center of figure (instead of top left)
        const drawOptions = {
          radius: boxWidth * Math.SQRT2 / 2,
          pointStyle: legendItem.pointStyle,
          rotation: legendItem.rotation,
          borderWidth: lineWidth
        };
        const centerX = rtlHelper.xPlus(x, boxWidth / 2);
        const centerY = y + fontSize / 2;

        // Draw pointStyle as legend symbol
        drawPoint(ctx, drawOptions, centerX, centerY);
      } else {
        // Draw box as legend symbol
        // Adjust position when boxHeight < fontSize (want it centered)
        const yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0);

        ctx.fillRect(rtlHelper.leftForLtr(x, boxWidth), yBoxTop, boxWidth, boxHeight);
        if (lineWidth !== 0) {
          ctx.strokeRect(rtlHelper.leftForLtr(x, boxWidth), yBoxTop, boxWidth, boxHeight);
        }
      }

      ctx.restore();
    };

    const fillText = function(x, y, legendItem) {
      const halfFontSize = fontSize / 2;
      const xLeft = rtlHelper.xPlus(x, boxWidth + halfFontSize);
      renderText(ctx, legendItem.text, xLeft, y + (itemHeight / 2), labelFont, {strikethrough: legendItem.hidden});
    };

    // Horizontal
    const isHorizontal = me.isHorizontal();
    const titleHeight = this._computeTitleHeight();
    if (isHorizontal) {
      cursor = {
        x: _alignStartEnd(align, me.left + padding, me.right - lineWidths[0]),
        y: me.top + padding + titleHeight,
        line: 0
      };
    } else {
      cursor = {
        x: me.left + padding,
        y: _alignStartEnd(align, me.top + titleHeight + padding, me.bottom - columnSizes[0].height),
        line: 0
      };
    }

    overrideTextDirection(me.ctx, opts.textDirection);

    const lineHeight = itemHeight + padding;
    me.legendItems.forEach((legendItem, i) => {
      const textWidth = ctx.measureText(legendItem.text).width;
      const width = boxWidth + (fontSize / 2) + textWidth;
      let x = cursor.x;
      let y = cursor.y;

      rtlHelper.setWidth(me.width);

      if (isHorizontal) {
        if (i > 0 && x + width + padding > me.right) {
          y = cursor.y += lineHeight;
          cursor.line++;
          x = cursor.x = _alignStartEnd(align, me.left + padding, me.right - lineWidths[cursor.line]);
        }
      } else if (i > 0 && y + lineHeight > me.bottom) {
        x = cursor.x = x + columnSizes[cursor.line].width + padding;
        cursor.line++;
        y = cursor.y = _alignStartEnd(align, me.top + titleHeight + padding, me.bottom - columnSizes[cursor.line].height);
      }

      const realX = rtlHelper.x(x);

      drawLegendBox(realX, y, legendItem);

      legendHitBoxes[i].left = rtlHelper.leftForLtr(realX, legendHitBoxes[i].width);
      legendHitBoxes[i].top = y;

      // Fill the actual label
      fillText(realX, y, legendItem);

      if (isHorizontal) {
        cursor.x += width + padding;
      } else {
        cursor.y += lineHeight;
      }
    });

    restoreTextDirection(me.ctx, opts.textDirection);
  }

  /**
	 * @protected
	 */
  drawTitle() {
    const me = this;
    const opts = me.options;
    const titleOpts = opts.title;
    const titleFont = toFont(titleOpts.font, me.chart.options.font);
    const titlePadding = toPadding(titleOpts.padding);

    if (!titleOpts.display) {
      return;
    }

    const rtlHelper = getRtlAdapter(opts.rtl, me.left, me.width);
    const ctx = me.ctx;
    const position = titleOpts.position;
    const halfFontSize = titleFont.size / 2;
    const topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize;
    let y;

    // These defaults are used when the legend is vertical.
    // When horizontal, they are computed below.
    let left = me.left;
    let maxWidth = me.width;

    if (this.isHorizontal()) {
      // Move left / right so that the title is above the legend lines
      maxWidth = Math.max(...me.lineWidths);
      y = me.top + topPaddingPlusHalfFontSize;
      left = _alignStartEnd(opts.align, left, me.right - maxWidth);
    } else {
      // Move down so that the title is above the legend stack in every alignment
      const maxHeight = me.columnSizes.reduce((acc, size) => Math.max(acc, size.height), 0);
      y = topPaddingPlusHalfFontSize + _alignStartEnd(opts.align, me.top, me.bottom - maxHeight - opts.labels.padding - me._computeTitleHeight());
    }

    // Now that we know the left edge of the inner legend box, compute the correct
    // X coordinate from the title alignment
    const x = _alignStartEnd(position, left, left + maxWidth);

    // Canvas setup
    ctx.textAlign = rtlHelper.textAlign(_toLeftRightCenter(position));
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = titleOpts.color;
    ctx.fillStyle = titleOpts.color;
    ctx.font = titleFont.string;

    renderText(ctx, titleOpts.text, x, y, titleFont);
  }

  /**
	 * @private
	 */
  _computeTitleHeight() {
    const titleOpts = this.options.title;
    const titleFont = toFont(titleOpts.font, this.chart.options.font);
    const titlePadding = toPadding(titleOpts.padding);
    return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
  }

  /**
	 * @private
	 */
  _getLegendItemAt(x, y) {
    const me = this;
    let i, hitBox, lh;

    if (x >= me.left && x <= me.right && y >= me.top && y <= me.bottom) {
      // See if we are touching one of the dataset boxes
      lh = me.legendHitBoxes;
      for (i = 0; i < lh.length; ++i) {
        hitBox = lh[i];

        if (x >= hitBox.left && x <= hitBox.left + hitBox.width && y >= hitBox.top && y <= hitBox.top + hitBox.height) {
          // Touching an element
          return me.legendItems[i];
        }
      }
    }

    return null;
  }

  /**
	 * Handle an event
	 * @param {ChartEvent} e - The event to handle
	 */
  handleEvent(e) {
    const me = this;
    const opts = me.options;
    if (!isListened(e.type, opts)) {
      return;
    }

    // Chart event already has relative position in it
    const hoveredItem = me._getLegendItemAt(e.x, e.y);

    if (e.type === 'mousemove') {
      const previous = me._hoveredItem;
      if (previous && previous !== hoveredItem) {
        call(opts.onLeave, [e, previous, me], me);
      }

      me._hoveredItem = hoveredItem;

      if (hoveredItem) {
        call(opts.onHover, [e, hoveredItem, me], me);
      }
    } else if (hoveredItem) {
      call(opts.onClick, [e, hoveredItem, me], me);
    }
  }
}

function isListened(type, opts) {
  if (type === 'mousemove' && (opts.onHover || opts.onLeave)) {
    return true;
  }
  if (opts.onClick && (type === 'click' || type === 'mouseup')) {
    return true;
  }
  return false;
}

export default {
  id: 'legend',

  /**
	 * For tests
	 * @private
	 */
  _element: Legend,

  start(chart, _args, options) {
    const legend = chart.legend = new Legend({ctx: chart.ctx, options, chart});
    layouts.configure(chart, legend, options);
    layouts.addBox(chart, legend);
  },

  stop(chart) {
    layouts.removeBox(chart, chart.legend);
    delete chart.legend;
  },

  // During the beforeUpdate step, the layout configuration needs to run
  // This ensures that if the legend position changes (via an option update)
  // the layout system respects the change. See https://github.com/chartjs/Chart.js/issues/7527
  beforeUpdate(chart, _args, options) {
    const legend = chart.legend;
    layouts.configure(chart, legend, options);
    legend.options = options;
  },

  // The labels need to be built after datasets are updated to ensure that colors
  // and other styling are correct. See https://github.com/chartjs/Chart.js/issues/6968
  afterUpdate(chart) {
    chart.legend.buildLabels();
  },


  afterEvent(chart, args) {
    chart.legend.handleEvent(args.event);
  },

  defaults: {
    display: true,
    position: 'top',
    align: 'center',
    fullSize: true,
    reverse: false,
    weight: 1000,

    // a callback that will handle
    onClick(e, legendItem, legend) {
      const index = legendItem.datasetIndex;
      const ci = legend.chart;
      if (ci.isDatasetVisible(index)) {
        ci.hide(index);
        legendItem.hidden = true;
      } else {
        ci.show(index);
        legendItem.hidden = false;
      }
    },

    onHover: null,
    onLeave: null,

    labels: {
      boxWidth: 40,
      padding: 10,
      // Generates labels shown in the legend
      // Valid properties to return:
      // text : text to display
      // fillStyle : fill of coloured box
      // strokeStyle: stroke of coloured box
      // hidden : if this legend item refers to a hidden item
      // lineCap : cap style for line
      // lineDash
      // lineDashOffset :
      // lineJoin :
      // lineWidth :
      generateLabels(chart) {
        const datasets = chart.data.datasets;
        const {labels} = chart.legend.options;
        const usePointStyle = labels.usePointStyle;
        const overrideStyle = labels.pointStyle;

        return chart._getSortedDatasetMetas().map((meta) => {
          const style = meta.controller.getStyle(usePointStyle ? 0 : undefined);
          const borderWidth = isObject(style.borderWidth) ? (valueOrDefault(style.borderWidth.top, 0) + valueOrDefault(style.borderWidth.left, 0) + valueOrDefault(style.borderWidth.bottom, 0) + valueOrDefault(style.borderWidth.right, 0)) / 4 : style.borderWidth;

          return {
            text: datasets[meta.index].label,
            fillStyle: style.backgroundColor,
            hidden: !meta.visible,
            lineCap: style.borderCapStyle,
            lineDash: style.borderDash,
            lineDashOffset: style.borderDashOffset,
            lineJoin: style.borderJoinStyle,
            lineWidth: borderWidth,
            strokeStyle: style.borderColor,
            pointStyle: overrideStyle || style.pointStyle,
            rotation: style.rotation,

            // Below is extra data used for toggling the datasets
            datasetIndex: meta.index
          };
        }, this);
      }
    },

    title: {
      display: false,
      position: 'center',
      text: '',
    }
  },

  defaultRoutes: {
    'labels.color': 'color',
    'title.color': 'color'
  }
};
