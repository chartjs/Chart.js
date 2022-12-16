import Animations from '../core/core.animations.js';
import Element from '../core/core.element.js';
import {addRoundedRectPath} from '../helpers/helpers.canvas.js';
import {each, noop, isNullOrUndef, isArray, _elementsEqual, isObject} from '../helpers/helpers.core.js';
import {toFont, toPadding, toTRBLCorners} from '../helpers/helpers.options.js';
import {getRtlAdapter, overrideTextDirection, restoreTextDirection} from '../helpers/helpers.rtl.js';
import {distanceBetweenPoints, _limitValue} from '../helpers/helpers.math.js';
import {createContext, drawPoint} from '../helpers/index.js';

/**
 * @typedef { import('../platform/platform.base.js').Chart } Chart
 * @typedef { import('../types/index.js').ChartEvent } ChartEvent
 * @typedef { import('../types/index.js').ActiveElement } ActiveElement
 * @typedef { import('../core/core.interaction.js').InteractionItem } InteractionItem
 */

const positioners = {
  /**
	 * Average mode places the tooltip at the average position of the elements shown
	 */
  average(items) {
    if (!items.length) {
      return false;
    }

    let i, len;
    let x = 0;
    let y = 0;
    let count = 0;

    for (i = 0, len = items.length; i < len; ++i) {
      const el = items[i].element;
      if (el && el.hasValue()) {
        const pos = el.tooltipPosition();
        x += pos.x;
        y += pos.y;
        ++count;
      }
    }

    return {
      x: x / count,
      y: y / count
    };
  },

  /**
	 * Gets the tooltip position nearest of the item nearest to the event position
	 */
  nearest(items, eventPosition) {
    if (!items.length) {
      return false;
    }

    let x = eventPosition.x;
    let y = eventPosition.y;
    let minDistance = Number.POSITIVE_INFINITY;
    let i, len, nearestElement;

    for (i = 0, len = items.length; i < len; ++i) {
      const el = items[i].element;
      if (el && el.hasValue()) {
        const center = el.getCenterPoint();
        const d = distanceBetweenPoints(eventPosition, center);

        if (d < minDistance) {
          minDistance = d;
          nearestElement = el;
        }
      }
    }

    if (nearestElement) {
      const tp = nearestElement.tooltipPosition();
      x = tp.x;
      y = tp.y;
    }

    return {
      x,
      y
    };
  }
};

// Helper to push or concat based on if the 2nd parameter is an array or not
function pushOrConcat(base, toPush) {
  if (toPush) {
    if (isArray(toPush)) {
      // base = base.concat(toPush);
      Array.prototype.push.apply(base, toPush);
    } else {
      base.push(toPush);
    }
  }

  return base;
}

/**
 * Returns array of strings split by newline
 * @param {*} str - The value to split by newline.
 * @returns {string|string[]} value if newline present - Returned from String split() method
 * @function
 */
function splitNewlines(str) {
  if ((typeof str === 'string' || str instanceof String) && str.indexOf('\n') > -1) {
    return str.split('\n');
  }
  return str;
}


/**
 * Private helper to create a tooltip item model
 * @param {Chart} chart
 * @param {ActiveElement} item - {element, index, datasetIndex} to create the tooltip item for
 * @return new tooltip item
 */
function createTooltipItem(chart, item) {
  const {element, datasetIndex, index} = item;
  const controller = chart.getDatasetMeta(datasetIndex).controller;
  const {label, value} = controller.getLabelAndValue(index);

  return {
    chart,
    label,
    parsed: controller.getParsed(index),
    raw: chart.data.datasets[datasetIndex].data[index],
    formattedValue: value,
    dataset: controller.getDataset(),
    dataIndex: index,
    datasetIndex,
    element
  };
}

/**
 * Get the size of the tooltip
 */
function getTooltipSize(tooltip, options) {
  const ctx = tooltip.chart.ctx;
  const {body, footer, title} = tooltip;
  const {boxWidth, boxHeight} = options;
  const bodyFont = toFont(options.bodyFont);
  const titleFont = toFont(options.titleFont);
  const footerFont = toFont(options.footerFont);
  const titleLineCount = title.length;
  const footerLineCount = footer.length;
  const bodyLineItemCount = body.length;

  const padding = toPadding(options.padding);
  let height = padding.height;
  let width = 0;

  // Count of all lines in the body
  let combinedBodyLength = body.reduce((count, bodyItem) => count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
  combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;

  if (titleLineCount) {
    height += titleLineCount * titleFont.lineHeight
			+ (titleLineCount - 1) * options.titleSpacing
			+ options.titleMarginBottom;
  }
  if (combinedBodyLength) {
    // Body lines may include some extra height depending on boxHeight
    const bodyLineHeight = options.displayColors ? Math.max(boxHeight, bodyFont.lineHeight) : bodyFont.lineHeight;
    height += bodyLineItemCount * bodyLineHeight
			+ (combinedBodyLength - bodyLineItemCount) * bodyFont.lineHeight
			+ (combinedBodyLength - 1) * options.bodySpacing;
  }
  if (footerLineCount) {
    height += options.footerMarginTop
			+ footerLineCount * footerFont.lineHeight
			+ (footerLineCount - 1) * options.footerSpacing;
  }

  // Title width
  let widthPadding = 0;
  const maxLineWidth = function(line) {
    width = Math.max(width, ctx.measureText(line).width + widthPadding);
  };

  ctx.save();

  ctx.font = titleFont.string;
  each(tooltip.title, maxLineWidth);

  // Body width
  ctx.font = bodyFont.string;
  each(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);

  // Body lines may include some extra width due to the color box
  widthPadding = options.displayColors ? (boxWidth + 2 + options.boxPadding) : 0;
  each(body, (bodyItem) => {
    each(bodyItem.before, maxLineWidth);
    each(bodyItem.lines, maxLineWidth);
    each(bodyItem.after, maxLineWidth);
  });

  // Reset back to 0
  widthPadding = 0;

  // Footer width
  ctx.font = footerFont.string;
  each(tooltip.footer, maxLineWidth);

  ctx.restore();

  // Add padding
  width += padding.width;

  return {width, height};
}

function determineYAlign(chart, size) {
  const {y, height} = size;

  if (y < height / 2) {
    return 'top';
  } else if (y > (chart.height - height / 2)) {
    return 'bottom';
  }
  return 'center';
}

function doesNotFitWithAlign(xAlign, chart, options, size) {
  const {x, width} = size;
  const caret = options.caretSize + options.caretPadding;
  if (xAlign === 'left' && x + width + caret > chart.width) {
    return true;
  }

  if (xAlign === 'right' && x - width - caret < 0) {
    return true;
  }
}

function determineXAlign(chart, options, size, yAlign) {
  const {x, width} = size;
  const {width: chartWidth, chartArea: {left, right}} = chart;
  let xAlign = 'center';

  if (yAlign === 'center') {
    xAlign = x <= (left + right) / 2 ? 'left' : 'right';
  } else if (x <= width / 2) {
    xAlign = 'left';
  } else if (x >= chartWidth - width / 2) {
    xAlign = 'right';
  }

  if (doesNotFitWithAlign(xAlign, chart, options, size)) {
    xAlign = 'center';
  }

  return xAlign;
}

/**
 * Helper to get the alignment of a tooltip given the size
 */
function determineAlignment(chart, options, size) {
  const yAlign = size.yAlign || options.yAlign || determineYAlign(chart, size);

  return {
    xAlign: size.xAlign || options.xAlign || determineXAlign(chart, options, size, yAlign),
    yAlign
  };
}

function alignX(size, xAlign) {
  let {x, width} = size;
  if (xAlign === 'right') {
    x -= width;
  } else if (xAlign === 'center') {
    x -= (width / 2);
  }
  return x;
}

function alignY(size, yAlign, paddingAndSize) {
  // eslint-disable-next-line prefer-const
  let {y, height} = size;
  if (yAlign === 'top') {
    y += paddingAndSize;
  } else if (yAlign === 'bottom') {
    y -= height + paddingAndSize;
  } else {
    y -= (height / 2);
  }
  return y;
}

/**
 * Helper to get the location a tooltip needs to be placed at given the initial position (via the vm) and the size and alignment
 */
function getBackgroundPoint(options, size, alignment, chart) {
  const {caretSize, caretPadding, cornerRadius} = options;
  const {xAlign, yAlign} = alignment;
  const paddingAndSize = caretSize + caretPadding;
  const {topLeft, topRight, bottomLeft, bottomRight} = toTRBLCorners(cornerRadius);

  let x = alignX(size, xAlign);
  const y = alignY(size, yAlign, paddingAndSize);

  if (yAlign === 'center') {
    if (xAlign === 'left') {
      x += paddingAndSize;
    } else if (xAlign === 'right') {
      x -= paddingAndSize;
    }
  } else if (xAlign === 'left') {
    x -= Math.max(topLeft, bottomLeft) + caretSize;
  } else if (xAlign === 'right') {
    x += Math.max(topRight, bottomRight) + caretSize;
  }

  return {
    x: _limitValue(x, 0, chart.width - size.width),
    y: _limitValue(y, 0, chart.height - size.height)
  };
}

function getAlignedX(tooltip, align, options) {
  const padding = toPadding(options.padding);

  return align === 'center'
    ? tooltip.x + tooltip.width / 2
    : align === 'right'
      ? tooltip.x + tooltip.width - padding.right
      : tooltip.x + padding.left;
}

/**
 * Helper to build before and after body lines
 */
function getBeforeAfterBodyLines(callback) {
  return pushOrConcat([], splitNewlines(callback));
}

function createTooltipContext(parent, tooltip, tooltipItems) {
  return createContext(parent, {
    tooltip,
    tooltipItems,
    type: 'tooltip'
  });
}

function overrideCallbacks(callbacks, context) {
  const override = context && context.dataset && context.dataset.tooltip && context.dataset.tooltip.callbacks;
  return override ? callbacks.override(override) : callbacks;
}

const defaultCallbacks = {
  // Args are: (tooltipItems, data)
  beforeTitle: noop,
  title(tooltipItems) {
    if (tooltipItems.length > 0) {
      const item = tooltipItems[0];
      const labels = item.chart.data.labels;
      const labelCount = labels ? labels.length : 0;

      if (this && this.options && this.options.mode === 'dataset') {
        return item.dataset.label || '';
      } else if (item.label) {
        return item.label;
      } else if (labelCount > 0 && item.dataIndex < labelCount) {
        return labels[item.dataIndex];
      }
    }

    return '';
  },
  afterTitle: noop,

  // Args are: (tooltipItems, data)
  beforeBody: noop,

  // Args are: (tooltipItem, data)
  beforeLabel: noop,
  label(tooltipItem) {
    if (this && this.options && this.options.mode === 'dataset') {
      return tooltipItem.label + ': ' + tooltipItem.formattedValue || tooltipItem.formattedValue;
    }

    let label = tooltipItem.dataset.label || '';

    if (label) {
      label += ': ';
    }
    const value = tooltipItem.formattedValue;
    if (!isNullOrUndef(value)) {
      label += value;
    }
    return label;
  },
  labelColor(tooltipItem) {
    const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
    const options = meta.controller.getStyle(tooltipItem.dataIndex);
    return {
      borderColor: options.borderColor,
      backgroundColor: options.backgroundColor,
      borderWidth: options.borderWidth,
      borderDash: options.borderDash,
      borderDashOffset: options.borderDashOffset,
      borderRadius: 0,
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(tooltipItem) {
    const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
    const options = meta.controller.getStyle(tooltipItem.dataIndex);
    return {
      pointStyle: options.pointStyle,
      rotation: options.rotation,
    };
  },
  afterLabel: noop,

  // Args are: (tooltipItems, data)
  afterBody: noop,

  // Args are: (tooltipItems, data)
  beforeFooter: noop,
  footer: noop,
  afterFooter: noop
};

/**
 * Invoke callback from object with context and arguments.
 * If callback returns `undefined`, then will be invoked default callback.
 * @param {Record<keyof typeof defaultCallbacks, Function>} callbacks
 * @param {keyof typeof defaultCallbacks} name
 * @param {*} ctx
 * @param {*} arg
 * @returns {any}
 */
function invokeCallbackWithFallback(callbacks, name, ctx, arg) {
  const result = callbacks[name].call(ctx, arg);

  if (typeof result === 'undefined') {
    return defaultCallbacks[name].call(ctx, arg);
  }

  return result;
}

export class Tooltip extends Element {

  /**
   * @namespace Chart.Tooltip.positioners
   */
  static positioners = positioners;

  constructor(config) {
    super();

    this.opacity = 0;
    this._active = [];
    this._eventPosition = undefined;
    this._size = undefined;
    this._cachedAnimations = undefined;
    this._tooltipItems = [];
    this.$animations = undefined;
    this.$context = undefined;
    this.chart = config.chart;
    this.options = config.options;
    this.dataPoints = undefined;
    this.title = undefined;
    this.beforeBody = undefined;
    this.body = undefined;
    this.afterBody = undefined;
    this.footer = undefined;
    this.xAlign = undefined;
    this.yAlign = undefined;
    this.x = undefined;
    this.y = undefined;
    this.height = undefined;
    this.width = undefined;
    this.caretX = undefined;
    this.caretY = undefined;
    // TODO: V4, make this private, rename to `_labelStyles`, and combine with `labelPointStyles`
    // and `labelTextColors` to create a single variable
    this.labelColors = undefined;
    this.labelPointStyles = undefined;
    this.labelTextColors = undefined;
  }

  initialize(options) {
    this.options = options;
    this._cachedAnimations = undefined;
    this.$context = undefined;
  }

  /**
	 * @private
	 */
  _resolveAnimations() {
    const cached = this._cachedAnimations;

    if (cached) {
      return cached;
    }

    const chart = this.chart;
    const options = this.options.setContext(this.getContext());
    const opts = options.enabled && chart.options.animation && options.animations;
    const animations = new Animations(this.chart, opts);
    if (opts._cacheable) {
      this._cachedAnimations = Object.freeze(animations);
    }

    return animations;
  }

  /**
	 * @protected
	 */
  getContext() {
    return this.$context ||
			(this.$context = createTooltipContext(this.chart.getContext(), this, this._tooltipItems));
  }

  getTitle(context, options) {
    const {callbacks} = options;

    const beforeTitle = invokeCallbackWithFallback(callbacks, 'beforeTitle', this, context);
    const title = invokeCallbackWithFallback(callbacks, 'title', this, context);
    const afterTitle = invokeCallbackWithFallback(callbacks, 'afterTitle', this, context);

    let lines = [];
    lines = pushOrConcat(lines, splitNewlines(beforeTitle));
    lines = pushOrConcat(lines, splitNewlines(title));
    lines = pushOrConcat(lines, splitNewlines(afterTitle));

    return lines;
  }

  getBeforeBody(tooltipItems, options) {
    return getBeforeAfterBodyLines(
      invokeCallbackWithFallback(options.callbacks, 'beforeBody', this, tooltipItems)
    );
  }

  getBody(tooltipItems, options) {
    const {callbacks} = options;
    const bodyItems = [];

    each(tooltipItems, (context) => {
      const bodyItem = {
        before: [],
        lines: [],
        after: []
      };
      const scoped = overrideCallbacks(callbacks, context);
      pushOrConcat(bodyItem.before, splitNewlines(invokeCallbackWithFallback(scoped, 'beforeLabel', this, context)));
      pushOrConcat(bodyItem.lines, invokeCallbackWithFallback(scoped, 'label', this, context));
      pushOrConcat(bodyItem.after, splitNewlines(invokeCallbackWithFallback(scoped, 'afterLabel', this, context)));

      bodyItems.push(bodyItem);
    });

    return bodyItems;
  }

  getAfterBody(tooltipItems, options) {
    return getBeforeAfterBodyLines(
      invokeCallbackWithFallback(options.callbacks, 'afterBody', this, tooltipItems)
    );
  }

  // Get the footer and beforeFooter and afterFooter lines
  getFooter(tooltipItems, options) {
    const {callbacks} = options;

    const beforeFooter = invokeCallbackWithFallback(callbacks, 'beforeFooter', this, tooltipItems);
    const footer = invokeCallbackWithFallback(callbacks, 'footer', this, tooltipItems);
    const afterFooter = invokeCallbackWithFallback(callbacks, 'afterFooter', this, tooltipItems);

    let lines = [];
    lines = pushOrConcat(lines, splitNewlines(beforeFooter));
    lines = pushOrConcat(lines, splitNewlines(footer));
    lines = pushOrConcat(lines, splitNewlines(afterFooter));

    return lines;
  }

  /**
	 * @private
	 */
  _createItems(options) {
    const active = this._active;
    const data = this.chart.data;
    const labelColors = [];
    const labelPointStyles = [];
    const labelTextColors = [];
    let tooltipItems = [];
    let i, len;

    for (i = 0, len = active.length; i < len; ++i) {
      tooltipItems.push(createTooltipItem(this.chart, active[i]));
    }

    // If the user provided a filter function, use it to modify the tooltip items
    if (options.filter) {
      tooltipItems = tooltipItems.filter((element, index, array) => options.filter(element, index, array, data));
    }

    // If the user provided a sorting function, use it to modify the tooltip items
    if (options.itemSort) {
      tooltipItems = tooltipItems.sort((a, b) => options.itemSort(a, b, data));
    }

    // Determine colors for boxes
    each(tooltipItems, (context) => {
      const scoped = overrideCallbacks(options.callbacks, context);
      labelColors.push(invokeCallbackWithFallback(scoped, 'labelColor', this, context));
      labelPointStyles.push(invokeCallbackWithFallback(scoped, 'labelPointStyle', this, context));
      labelTextColors.push(invokeCallbackWithFallback(scoped, 'labelTextColor', this, context));
    });

    this.labelColors = labelColors;
    this.labelPointStyles = labelPointStyles;
    this.labelTextColors = labelTextColors;
    this.dataPoints = tooltipItems;
    return tooltipItems;
  }

  update(changed, replay) {
    const options = this.options.setContext(this.getContext());
    const active = this._active;
    let properties;
    let tooltipItems = [];

    if (!active.length) {
      if (this.opacity !== 0) {
        properties = {
          opacity: 0
        };
      }
    } else {
      const position = positioners[options.position].call(this, active, this._eventPosition);
      tooltipItems = this._createItems(options);

      this.title = this.getTitle(tooltipItems, options);
      this.beforeBody = this.getBeforeBody(tooltipItems, options);
      this.body = this.getBody(tooltipItems, options);
      this.afterBody = this.getAfterBody(tooltipItems, options);
      this.footer = this.getFooter(tooltipItems, options);

      const size = this._size = getTooltipSize(this, options);
      const positionAndSize = Object.assign({}, position, size);
      const alignment = determineAlignment(this.chart, options, positionAndSize);
      const backgroundPoint = getBackgroundPoint(options, positionAndSize, alignment, this.chart);

      this.xAlign = alignment.xAlign;
      this.yAlign = alignment.yAlign;

      properties = {
        opacity: 1,
        x: backgroundPoint.x,
        y: backgroundPoint.y,
        width: size.width,
        height: size.height,
        caretX: position.x,
        caretY: position.y
      };
    }

    this._tooltipItems = tooltipItems;
    this.$context = undefined;

    if (properties) {
      this._resolveAnimations().update(this, properties);
    }

    if (changed && options.external) {
      options.external.call(this, {chart: this.chart, tooltip: this, replay});
    }
  }

  drawCaret(tooltipPoint, ctx, size, options) {
    const caretPosition = this.getCaretPosition(tooltipPoint, size, options);

    ctx.lineTo(caretPosition.x1, caretPosition.y1);
    ctx.lineTo(caretPosition.x2, caretPosition.y2);
    ctx.lineTo(caretPosition.x3, caretPosition.y3);
  }

  getCaretPosition(tooltipPoint, size, options) {
    const {xAlign, yAlign} = this;
    const {caretSize, cornerRadius} = options;
    const {topLeft, topRight, bottomLeft, bottomRight} = toTRBLCorners(cornerRadius);
    const {x: ptX, y: ptY} = tooltipPoint;
    const {width, height} = size;
    let x1, x2, x3, y1, y2, y3;

    if (yAlign === 'center') {
      y2 = ptY + (height / 2);

      if (xAlign === 'left') {
        x1 = ptX;
        x2 = x1 - caretSize;

        // Left draws bottom -> top, this y1 is on the bottom
        y1 = y2 + caretSize;
        y3 = y2 - caretSize;
      } else {
        x1 = ptX + width;
        x2 = x1 + caretSize;

        // Right draws top -> bottom, thus y1 is on the top
        y1 = y2 - caretSize;
        y3 = y2 + caretSize;
      }

      x3 = x1;
    } else {
      if (xAlign === 'left') {
        x2 = ptX + Math.max(topLeft, bottomLeft) + (caretSize);
      } else if (xAlign === 'right') {
        x2 = ptX + width - Math.max(topRight, bottomRight) - caretSize;
      } else {
        x2 = this.caretX;
      }

      if (yAlign === 'top') {
        y1 = ptY;
        y2 = y1 - caretSize;

        // Top draws left -> right, thus x1 is on the left
        x1 = x2 - caretSize;
        x3 = x2 + caretSize;
      } else {
        y1 = ptY + height;
        y2 = y1 + caretSize;

        // Bottom draws right -> left, thus x1 is on the right
        x1 = x2 + caretSize;
        x3 = x2 - caretSize;
      }
      y3 = y1;
    }
    return {x1, x2, x3, y1, y2, y3};
  }

  drawTitle(pt, ctx, options) {
    const title = this.title;
    const length = title.length;
    let titleFont, titleSpacing, i;

    if (length) {
      const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);

      pt.x = getAlignedX(this, options.titleAlign, options);

      ctx.textAlign = rtlHelper.textAlign(options.titleAlign);
      ctx.textBaseline = 'middle';

      titleFont = toFont(options.titleFont);
      titleSpacing = options.titleSpacing;

      ctx.fillStyle = options.titleColor;
      ctx.font = titleFont.string;

      for (i = 0; i < length; ++i) {
        ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFont.lineHeight / 2);
        pt.y += titleFont.lineHeight + titleSpacing; // Line Height and spacing

        if (i + 1 === length) {
          pt.y += options.titleMarginBottom - titleSpacing; // If Last, add margin, remove spacing
        }
      }
    }
  }

  /**
	 * @private
	 */
  _drawColorBox(ctx, pt, i, rtlHelper, options) {
    const labelColors = this.labelColors[i];
    const labelPointStyle = this.labelPointStyles[i];
    const {boxHeight, boxWidth, boxPadding} = options;
    const bodyFont = toFont(options.bodyFont);
    const colorX = getAlignedX(this, 'left', options);
    const rtlColorX = rtlHelper.x(colorX);
    const yOffSet = boxHeight < bodyFont.lineHeight ? (bodyFont.lineHeight - boxHeight) / 2 : 0;
    const colorY = pt.y + yOffSet;

    if (options.usePointStyle) {
      const drawOptions = {
        radius: Math.min(boxWidth, boxHeight) / 2, // fit the circle in the box
        pointStyle: labelPointStyle.pointStyle,
        rotation: labelPointStyle.rotation,
        borderWidth: 1
      };
      // Recalculate x and y for drawPoint() because its expecting
      // x and y to be center of figure (instead of top left)
      const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
      const centerY = colorY + boxHeight / 2;

      // Fill the point with white so that colours merge nicely if the opacity is < 1
      ctx.strokeStyle = options.multiKeyBackground;
      ctx.fillStyle = options.multiKeyBackground;
      drawPoint(ctx, drawOptions, centerX, centerY);

      // Draw the point
      ctx.strokeStyle = labelColors.borderColor;
      ctx.fillStyle = labelColors.backgroundColor;
      drawPoint(ctx, drawOptions, centerX, centerY);
    } else {
      // Border
      ctx.lineWidth = isObject(labelColors.borderWidth) ? Math.max(...Object.values(labelColors.borderWidth)) : (labelColors.borderWidth || 1); // TODO, v4 remove fallback
      ctx.strokeStyle = labelColors.borderColor;
      ctx.setLineDash(labelColors.borderDash || []);
      ctx.lineDashOffset = labelColors.borderDashOffset || 0;

      // Fill a white rect so that colours merge nicely if the opacity is < 1
      const outerX = rtlHelper.leftForLtr(rtlColorX, boxWidth - boxPadding);
      const innerX = rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - boxPadding - 2);
      const borderRadius = toTRBLCorners(labelColors.borderRadius);

      if (Object.values(borderRadius).some(v => v !== 0)) {
        ctx.beginPath();
        ctx.fillStyle = options.multiKeyBackground;
        addRoundedRectPath(ctx, {
          x: outerX,
          y: colorY,
          w: boxWidth,
          h: boxHeight,
          radius: borderRadius,
        });
        ctx.fill();
        ctx.stroke();

        // Inner square
        ctx.fillStyle = labelColors.backgroundColor;
        ctx.beginPath();
        addRoundedRectPath(ctx, {
          x: innerX,
          y: colorY + 1,
          w: boxWidth - 2,
          h: boxHeight - 2,
          radius: borderRadius,
        });
        ctx.fill();
      } else {
        // Normal rect
        ctx.fillStyle = options.multiKeyBackground;
        ctx.fillRect(outerX, colorY, boxWidth, boxHeight);
        ctx.strokeRect(outerX, colorY, boxWidth, boxHeight);
        // Inner square
        ctx.fillStyle = labelColors.backgroundColor;
        ctx.fillRect(innerX, colorY + 1, boxWidth - 2, boxHeight - 2);
      }
    }

    // restore fillStyle
    ctx.fillStyle = this.labelTextColors[i];
  }

  drawBody(pt, ctx, options) {
    const {body} = this;
    const {bodySpacing, bodyAlign, displayColors, boxHeight, boxWidth, boxPadding} = options;
    const bodyFont = toFont(options.bodyFont);
    let bodyLineHeight = bodyFont.lineHeight;
    let xLinePadding = 0;

    const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);

    const fillLineOfText = function(line) {
      ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
      pt.y += bodyLineHeight + bodySpacing;
    };

    const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
    let bodyItem, textColor, lines, i, j, ilen, jlen;

    ctx.textAlign = bodyAlign;
    ctx.textBaseline = 'middle';
    ctx.font = bodyFont.string;

    pt.x = getAlignedX(this, bodyAlignForCalculation, options);

    // Before body lines
    ctx.fillStyle = options.bodyColor;
    each(this.beforeBody, fillLineOfText);

    xLinePadding = displayColors && bodyAlignForCalculation !== 'right'
      ? bodyAlign === 'center' ? (boxWidth / 2 + boxPadding) : (boxWidth + 2 + boxPadding)
      : 0;

    // Draw body lines now
    for (i = 0, ilen = body.length; i < ilen; ++i) {
      bodyItem = body[i];
      textColor = this.labelTextColors[i];

      ctx.fillStyle = textColor;
      each(bodyItem.before, fillLineOfText);

      lines = bodyItem.lines;
      // Draw Legend-like boxes if needed
      if (displayColors && lines.length) {
        this._drawColorBox(ctx, pt, i, rtlHelper, options);
        bodyLineHeight = Math.max(bodyFont.lineHeight, boxHeight);
      }

      for (j = 0, jlen = lines.length; j < jlen; ++j) {
        fillLineOfText(lines[j]);
        // Reset for any lines that don't include colorbox
        bodyLineHeight = bodyFont.lineHeight;
      }

      each(bodyItem.after, fillLineOfText);
    }

    // Reset back to 0 for after body
    xLinePadding = 0;
    bodyLineHeight = bodyFont.lineHeight;

    // After body lines
    each(this.afterBody, fillLineOfText);
    pt.y -= bodySpacing; // Remove last body spacing
  }

  drawFooter(pt, ctx, options) {
    const footer = this.footer;
    const length = footer.length;
    let footerFont, i;

    if (length) {
      const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);

      pt.x = getAlignedX(this, options.footerAlign, options);
      pt.y += options.footerMarginTop;

      ctx.textAlign = rtlHelper.textAlign(options.footerAlign);
      ctx.textBaseline = 'middle';

      footerFont = toFont(options.footerFont);

      ctx.fillStyle = options.footerColor;
      ctx.font = footerFont.string;

      for (i = 0; i < length; ++i) {
        ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFont.lineHeight / 2);
        pt.y += footerFont.lineHeight + options.footerSpacing;
      }
    }
  }

  drawBackground(pt, ctx, tooltipSize, options) {
    const {xAlign, yAlign} = this;
    const {x, y} = pt;
    const {width, height} = tooltipSize;
    const {topLeft, topRight, bottomLeft, bottomRight} = toTRBLCorners(options.cornerRadius);

    ctx.fillStyle = options.backgroundColor;
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;

    ctx.beginPath();
    ctx.moveTo(x + topLeft, y);
    if (yAlign === 'top') {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x + width - topRight, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
    if (yAlign === 'center' && xAlign === 'right') {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x + width, y + height - bottomRight);
    ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
    if (yAlign === 'bottom') {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x + bottomLeft, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
    if (yAlign === 'center' && xAlign === 'left') {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x, y + topLeft);
    ctx.quadraticCurveTo(x, y, x + topLeft, y);
    ctx.closePath();

    ctx.fill();

    if (options.borderWidth > 0) {
      ctx.stroke();
    }
  }

  /**
	 * Update x/y animation targets when _active elements are animating too
	 * @private
	 */
  _updateAnimationTarget(options) {
    const chart = this.chart;
    const anims = this.$animations;
    const animX = anims && anims.x;
    const animY = anims && anims.y;
    if (animX || animY) {
      const position = positioners[options.position].call(this, this._active, this._eventPosition);
      if (!position) {
        return;
      }
      const size = this._size = getTooltipSize(this, options);
      const positionAndSize = Object.assign({}, position, this._size);
      const alignment = determineAlignment(chart, options, positionAndSize);
      const point = getBackgroundPoint(options, positionAndSize, alignment, chart);
      if (animX._to !== point.x || animY._to !== point.y) {
        this.xAlign = alignment.xAlign;
        this.yAlign = alignment.yAlign;
        this.width = size.width;
        this.height = size.height;
        this.caretX = position.x;
        this.caretY = position.y;
        this._resolveAnimations().update(this, point);
      }
    }
  }

  /**
   * Determine if the tooltip will draw anything
   * @returns {boolean} True if the tooltip will render
   */
  _willRender() {
    return !!this.opacity;
  }

  draw(ctx) {
    const options = this.options.setContext(this.getContext());
    let opacity = this.opacity;

    if (!opacity) {
      return;
    }

    this._updateAnimationTarget(options);

    const tooltipSize = {
      width: this.width,
      height: this.height
    };
    const pt = {
      x: this.x,
      y: this.y
    };

    // IE11/Edge does not like very small opacities, so snap to 0
    opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;

    const padding = toPadding(options.padding);

    // Truthy/falsey value for empty tooltip
    const hasTooltipContent = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;

    if (options.enabled && hasTooltipContent) {
      ctx.save();
      ctx.globalAlpha = opacity;

      // Draw Background
      this.drawBackground(pt, ctx, tooltipSize, options);

      overrideTextDirection(ctx, options.textDirection);

      pt.y += padding.top;

      // Titles
      this.drawTitle(pt, ctx, options);

      // Body
      this.drawBody(pt, ctx, options);

      // Footer
      this.drawFooter(pt, ctx, options);

      restoreTextDirection(ctx, options.textDirection);

      ctx.restore();
    }
  }

  /**
	 * Get active elements in the tooltip
	 * @returns {Array} Array of elements that are active in the tooltip
	 */
  getActiveElements() {
    return this._active || [];
  }

  /**
	 * Set active elements in the tooltip
	 * @param {array} activeElements Array of active datasetIndex/index pairs.
	 * @param {object} eventPosition Synthetic event position used in positioning
	 */
  setActiveElements(activeElements, eventPosition) {
    const lastActive = this._active;
    const active = activeElements.map(({datasetIndex, index}) => {
      const meta = this.chart.getDatasetMeta(datasetIndex);

      if (!meta) {
        throw new Error('Cannot find a dataset at index ' + datasetIndex);
      }

      return {
        datasetIndex,
        element: meta.data[index],
        index,
      };
    });
    const changed = !_elementsEqual(lastActive, active);
    const positionChanged = this._positionChanged(active, eventPosition);

    if (changed || positionChanged) {
      this._active = active;
      this._eventPosition = eventPosition;
      this._ignoreReplayEvents = true;
      this.update(true);
    }
  }

  /**
	 * Handle an event
	 * @param {ChartEvent} e - The event to handle
	 * @param {boolean} [replay] - This is a replayed event (from update)
	 * @param {boolean} [inChartArea] - The event is inside chartArea
	 * @returns {boolean} true if the tooltip changed
	 */
  handleEvent(e, replay, inChartArea = true) {
    if (replay && this._ignoreReplayEvents) {
      return false;
    }
    this._ignoreReplayEvents = false;

    const options = this.options;
    const lastActive = this._active || [];
    const active = this._getActiveElements(e, lastActive, replay, inChartArea);

    // When there are multiple items shown, but the tooltip position is nearest mode
    // an update may need to be made because our position may have changed even though
    // the items are the same as before.
    const positionChanged = this._positionChanged(active, e);

    // Remember Last Actives
    const changed = replay || !_elementsEqual(active, lastActive) || positionChanged;

    // Only handle target event on tooltip change
    if (changed) {
      this._active = active;

      if (options.enabled || options.external) {
        this._eventPosition = {
          x: e.x,
          y: e.y
        };

        this.update(true, replay);
      }
    }

    return changed;
  }

  /**
	 * Helper for determining the active elements for event
	 * @param {ChartEvent} e - The event to handle
	 * @param {InteractionItem[]} lastActive - Previously active elements
	 * @param {boolean} [replay] - This is a replayed event (from update)
	 * @param {boolean} [inChartArea] - The event is inside chartArea
	 * @returns {InteractionItem[]} - Active elements
	 * @private
	 */
  _getActiveElements(e, lastActive, replay, inChartArea) {
    const options = this.options;

    if (e.type === 'mouseout') {
      return [];
    }

    if (!inChartArea) {
      // Let user control the active elements outside chartArea. Eg. using Legend.
      return lastActive;
    }

    // Find Active Elements for tooltips
    const active = this.chart.getElementsAtEventForMode(e, options.mode, options, replay);

    if (options.reverse) {
      active.reverse();
    }

    return active;
  }

  /**
	 * Determine if the active elements + event combination changes the
	 * tooltip position
	 * @param {array} active - Active elements
	 * @param {ChartEvent} e - Event that triggered the position change
	 * @returns {boolean} True if the position has changed
	 */
  _positionChanged(active, e) {
    const {caretX, caretY, options} = this;
    const position = positioners[options.position].call(this, active, e);
    return position !== false && (caretX !== position.x || caretY !== position.y);
  }
}

export default {
  id: 'tooltip',
  _element: Tooltip,
  positioners,

  afterInit(chart, _args, options) {
    if (options) {
      chart.tooltip = new Tooltip({chart, options});
    }
  },

  beforeUpdate(chart, _args, options) {
    if (chart.tooltip) {
      chart.tooltip.initialize(options);
    }
  },

  reset(chart, _args, options) {
    if (chart.tooltip) {
      chart.tooltip.initialize(options);
    }
  },

  afterDraw(chart) {
    const tooltip = chart.tooltip;

    if (tooltip && tooltip._willRender()) {
      const args = {
        tooltip
      };

      if (chart.notifyPlugins('beforeTooltipDraw', {...args, cancelable: true}) === false) {
        return;
      }

      tooltip.draw(chart.ctx);

      chart.notifyPlugins('afterTooltipDraw', args);
    }
  },

  afterEvent(chart, args) {
    if (chart.tooltip) {
      // If the event is replayed from `update`, we should evaluate with the final positions.
      const useFinalPosition = args.replay;
      if (chart.tooltip.handleEvent(args.event, useFinalPosition, args.inChartArea)) {
        // notify chart about the change, so it will render
        args.changed = true;
      }
    }
  },

  defaults: {
    enabled: true,
    external: null,
    position: 'average',
    backgroundColor: 'rgba(0,0,0,0.8)',
    titleColor: '#fff',
    titleFont: {
      weight: 'bold',
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: 'left',
    bodyColor: '#fff',
    bodySpacing: 2,
    bodyFont: {
    },
    bodyAlign: 'left',
    footerColor: '#fff',
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: 'bold',
    },
    footerAlign: 'left',
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: (ctx, opts) => opts.bodyFont.size,
    boxWidth: (ctx, opts) => opts.bodyFont.size,
    multiKeyBackground: '#fff',
    displayColors: true,
    boxPadding: 0,
    borderColor: 'rgba(0,0,0,0)',
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: 'easeOutQuart',
    },
    animations: {
      numbers: {
        type: 'number',
        properties: ['x', 'y', 'width', 'height', 'caretX', 'caretY'],
      },
      opacity: {
        easing: 'linear',
        duration: 200
      }
    },
    callbacks: defaultCallbacks
  },

  defaultRoutes: {
    bodyFont: 'font',
    footerFont: 'font',
    titleFont: 'font'
  },

  descriptors: {
    _scriptable: (name) => name !== 'filter' && name !== 'itemSort' && name !== 'external',
    _indexable: false,
    callbacks: {
      _scriptable: false,
      _indexable: false,
    },
    animation: {
      _fallback: false
    },
    animations: {
      _fallback: 'animation'
    }
  },

  // Resolve additionally from `interaction` options and defaults.
  additionalOptionScopes: ['interaction']
};
