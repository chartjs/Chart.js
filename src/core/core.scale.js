import Element from './core.element';
import {_alignPixel, _measureText, renderText, clipArea, unclipArea} from '../helpers/helpers.canvas';
import {callback as call, each, finiteOrDefault, isArray, isFinite, isNullOrUndef, isObject, valueOrDefault} from '../helpers/helpers.core';
import {toDegrees, toRadians, _int16Range, _limitValue, HALF_PI} from '../helpers/helpers.math';
import {_alignStartEnd, _toLeftRightCenter} from '../helpers/helpers.extras';
import {toFont, toPadding, _addGrace} from '../helpers/helpers.options';

import './core.scale.defaults';


import {autoSkip} from './core.scale.autoskip';


const reverseAlign = (align) => align === 'left' ? 'right' : align === 'right' ? 'left' : align;
const offsetFromEdge = (scale, edge, offset) => edge === 'top' || edge === 'left' ? scale[edge] + offset : scale[edge] - offset;

/**
 * @typedef { import("./core.controller").default } Chart
 * @typedef {{value:number | string, label?:string, major?:boolean, $context?:any}} Tick
 */

/**
 * Returns a new array containing numItems from arr
 * @param {any[]} arr
 * @param {number} numItems
 */
function sample(arr, numItems) {
  const result = [];
  const increment = arr.length / numItems;
  const len = arr.length;
  let i = 0;

  for (; i < len; i += increment) {
    result.push(arr[Math.floor(i)]);
  }
  return result;
}

/**
 * @param {Scale} scale
 * @param {number} index
 * @param {boolean} offsetGridLines
 */
function getPixelForGridLine(scale, index, offsetGridLines) {
  const length = scale.ticks.length;
  const validIndex = Math.min(index, length - 1);
  const start = scale._startPixel;
  const end = scale._endPixel;
  const epsilon = 1e-6; // 1e-6 is margin in pixels for accumulated error.
  let lineValue = scale.getPixelForTick(validIndex);
  let offset;

  if (offsetGridLines) {
    if (length === 1) {
      offset = Math.max(lineValue - start, end - lineValue);
    } else if (index === 0) {
      offset = (scale.getPixelForTick(1) - lineValue) / 2;
    } else {
      offset = (lineValue - scale.getPixelForTick(validIndex - 1)) / 2;
    }
    lineValue += validIndex < index ? offset : -offset;

    // Return undefined if the pixel is out of the range
    if (lineValue < start - epsilon || lineValue > end + epsilon) {
      return;
    }
  }
  return lineValue;
}

/**
 * @param {object} caches
 * @param {number} length
 */
function garbageCollect(caches, length) {
  each(caches, (cache) => {
    const gc = cache.gc;
    const gcLen = gc.length / 2;
    let i;
    if (gcLen > length) {
      for (i = 0; i < gcLen; ++i) {
        delete cache.data[gc[i]];
      }
      gc.splice(0, gcLen);
    }
  });
}

/**
 * @param {object} options
 */
function getTickMarkLength(options) {
  return options.drawTicks ? options.tickLength : 0;
}

/**
 * @param {object} options
 */
function getTitleHeight(options, fallback) {
  if (!options.display) {
    return 0;
  }

  const font = toFont(options.font, fallback);
  const padding = toPadding(options.padding);
  const lines = isArray(options.text) ? options.text.length : 1;

  return (lines * font.lineHeight) + padding.height;
}

function createScaleContext(parent, scale) {
  return Object.assign(Object.create(parent), {
    scale,
    type: 'scale'
  });
}

function createTickContext(parent, index, tick) {
  return Object.assign(Object.create(parent), {
    tick,
    index,
    type: 'tick'
  });
}

function titleAlign(align, position, reverse) {
  let ret = _toLeftRightCenter(align);
  if ((reverse && position !== 'right') || (!reverse && position === 'right')) {
    ret = reverseAlign(ret);
  }
  return ret;
}

function titleArgs(scale, offset, position, align) {
  const {top, left, bottom, right} = scale;
  let rotation = 0;
  let maxWidth, titleX, titleY;

  if (scale.isHorizontal()) {
    titleX = _alignStartEnd(align, left, right);
    titleY = offsetFromEdge(scale, position, offset);
    maxWidth = right - left;
  } else {
    titleX = offsetFromEdge(scale, position, offset);
    titleY = _alignStartEnd(align, bottom, top);
    rotation = position === 'left' ? -HALF_PI : HALF_PI;
  }
  return {titleX, titleY, maxWidth, rotation};
}

export default class Scale extends Element {

  // eslint-disable-next-line max-statements
  constructor(cfg) {
    super();

    /** @type {string} */
    this.id = cfg.id;
    /** @type {string} */
    this.type = cfg.type;
    /** @type {object} */
    this.options = undefined;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = cfg.ctx;
    /** @type {Chart} */
    this.chart = cfg.chart;

    // implements box
    /** @type {number} */
    this.top = undefined;
    /** @type {number} */
    this.bottom = undefined;
    /** @type {number} */
    this.left = undefined;
    /** @type {number} */
    this.right = undefined;
    /** @type {number} */
    this.width = undefined;
    /** @type {number} */
    this.height = undefined;
    this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    /** @type {number} */
    this.maxWidth = undefined;
    /** @type {number} */
    this.maxHeight = undefined;
    /** @type {number} */
    this.paddingTop = undefined;
    /** @type {number} */
    this.paddingBottom = undefined;
    /** @type {number} */
    this.paddingLeft = undefined;
    /** @type {number} */
    this.paddingRight = undefined;

    // scale-specific properties
    /** @type {string=} */
    this.axis = undefined;
    /** @type {number=} */
    this.labelRotation = undefined;
    this.min = undefined;
    this.max = undefined;
    this._range = undefined;
    /** @type {Tick[]} */
    this.ticks = [];
    /** @type {object[]|null} */
    this._gridLineItems = null;
    /** @type {object[]|null} */
    this._labelItems = null;
    /** @type {object|null} */
    this._labelSizes = null;
    this._length = 0;
    this._maxLength = 0;
    this._longestTextCache = {};
    /** @type {number} */
    this._startPixel = undefined;
    /** @type {number} */
    this._endPixel = undefined;
    this._reversePixels = false;
    this._userMax = undefined;
    this._userMin = undefined;
    this._suggestedMax = undefined;
    this._suggestedMin = undefined;
    this._ticksLength = 0;
    this._borderValue = 0;
    this._cache = {};
    this._dataLimitsCached = false;
    this.$context = undefined;
  }

  /**
	 * @param {object} options
	 * @since 3.0
	 */
  init(options) {
    const me = this;
    me.options = options.setContext(me.getContext());

    me.axis = options.axis;

    // parse min/max value, so we can properly determine min/max for other scales
    me._userMin = me.parse(options.min);
    me._userMax = me.parse(options.max);
    me._suggestedMin = me.parse(options.suggestedMin);
    me._suggestedMax = me.parse(options.suggestedMax);
  }

  /**
	 * Parse a supported input value to internal representation.
	 * @param {*} raw
	 * @param {number} [index]
	 * @since 3.0
	 */
  parse(raw, index) { // eslint-disable-line no-unused-vars
    return raw;
  }

  /**
	 * @return {{min: number, max: number, minDefined: boolean, maxDefined: boolean}}
	 * @protected
	 * @since 3.0
	 */
  getUserBounds() {
    let {_userMin, _userMax, _suggestedMin, _suggestedMax} = this;
    _userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY);
    _userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY);
    _suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY);
    _suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY);
    return {
      min: finiteOrDefault(_userMin, _suggestedMin),
      max: finiteOrDefault(_userMax, _suggestedMax),
      minDefined: isFinite(_userMin),
      maxDefined: isFinite(_userMax)
    };
  }

  /**
	 * @param {boolean} canStack
	 * @return {{min: number, max: number}}
	 * @protected
	 * @since 3.0
	 */
  getMinMax(canStack) {
    const me = this;
    // eslint-disable-next-line prefer-const
    let {min, max, minDefined, maxDefined} = me.getUserBounds();
    let range;

    if (minDefined && maxDefined) {
      return {min, max};
    }

    const metas = me.getMatchingVisibleMetas();
    for (let i = 0, ilen = metas.length; i < ilen; ++i) {
      range = metas[i].controller.getMinMax(me, canStack);
      if (!minDefined) {
        min = Math.min(min, range.min);
      }
      if (!maxDefined) {
        max = Math.max(max, range.max);
      }
    }

    return {
      min: finiteOrDefault(min, finiteOrDefault(max, min)),
      max: finiteOrDefault(max, finiteOrDefault(min, max))
    };
  }

  /**
	 * Get the padding needed for the scale
	 * @return {{top: number, left: number, bottom: number, right: number}} the necessary padding
	 * @private
	 */
  getPadding() {
    const me = this;
    return {
      left: me.paddingLeft || 0,
      top: me.paddingTop || 0,
      right: me.paddingRight || 0,
      bottom: me.paddingBottom || 0
    };
  }

  /**
	 * Returns the scale tick objects
	 * @return {Tick[]}
	 * @since 2.7
	 */
  getTicks() {
    return this.ticks;
  }

  /**
	 * @return {string[]}
	 */
  getLabels() {
    const data = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
  }

  // When a new layout is created, reset the data limits cache
  beforeLayout() {
    this._cache = {};
    this._dataLimitsCached = false;
  }

  // These methods are ordered by lifecycle. Utilities then follow.
  // Any function defined here is inherited by all scale types.
  // Any function can be extended by the scale type

  beforeUpdate() {
    call(this.options.beforeUpdate, [this]);
  }

  /**
	 * @param {number} maxWidth - the max width in pixels
	 * @param {number} maxHeight - the max height in pixels
	 * @param {{top: number, left: number, bottom: number, right: number}} margins - the space between the edge of the other scales and edge of the chart
	 *   This space comes from two sources:
	 *     - padding - space that's required to show the labels at the edges of the scale
	 *     - thickness of scales or legends in another orientation
	 */
  update(maxWidth, maxHeight, margins) {
    const me = this;
    const tickOpts = me.options.ticks;
    const sampleSize = tickOpts.sampleSize;

    // Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
    me.beforeUpdate();

    // Absorb the master measurements
    me.maxWidth = maxWidth;
    me.maxHeight = maxHeight;
    me._margins = margins = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, margins);

    me.ticks = null;
    me._labelSizes = null;
    me._gridLineItems = null;
    me._labelItems = null;

    // Dimensions
    me.beforeSetDimensions();
    me.setDimensions();
    me.afterSetDimensions();

    me._maxLength = me.isHorizontal()
      ? me.width + margins.left + margins.right
      : me.height + margins.top + margins.bottom;

    // Data min/max
    if (!me._dataLimitsCached) {
      me.beforeDataLimits();
      me.determineDataLimits();
      me.afterDataLimits();
      me._range = _addGrace(me, me.options.grace);
      me._dataLimitsCached = true;
    }

    me.beforeBuildTicks();

    me.ticks = me.buildTicks() || [];

    // Allow modification of ticks in callback.
    me.afterBuildTicks();

    // Compute tick rotation and fit using a sampled subset of labels
    // We generally don't need to compute the size of every single label for determining scale size
    const samplingEnabled = sampleSize < me.ticks.length;
    me._convertTicksToLabels(samplingEnabled ? sample(me.ticks, sampleSize) : me.ticks);

    // configure is called twice, once here, once from core.controller.updateLayout.
    // Here we haven't been positioned yet, but dimensions are correct.
    // Variables set in configure are needed for calculateLabelRotation, and
    // it's ok that coordinates are not correct there, only dimensions matter.
    me.configure();

    // Tick Rotation
    me.beforeCalculateLabelRotation();
    me.calculateLabelRotation(); // Preconditions: number of ticks and sizes of largest labels must be calculated beforehand
    me.afterCalculateLabelRotation();

    // Auto-skip
    if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === 'auto')) {
      me.ticks = autoSkip(me, me.ticks);
      me._labelSizes = null;
    }

    if (samplingEnabled) {
      // Generate labels using all non-skipped ticks
      me._convertTicksToLabels(me.ticks);
    }

    me.beforeFit();
    me.fit(); // Preconditions: label rotation and label sizes must be calculated beforehand
    me.afterFit();

    // IMPORTANT: after this point, we consider that `this.ticks` will NEVER change!

    me.afterUpdate();
  }

  /**
	 * @protected
	 */
  configure() {
    const me = this;
    let reversePixels = me.options.reverse;
    let startPixel, endPixel;

    if (me.isHorizontal()) {
      startPixel = me.left;
      endPixel = me.right;
    } else {
      startPixel = me.top;
      endPixel = me.bottom;
      // by default vertical scales are from bottom to top, so pixels are reversed
      reversePixels = !reversePixels;
    }
    me._startPixel = startPixel;
    me._endPixel = endPixel;
    me._reversePixels = reversePixels;
    me._length = endPixel - startPixel;
    me._alignToPixels = me.options.alignToPixels;
  }

  afterUpdate() {
    call(this.options.afterUpdate, [this]);
  }

  //

  beforeSetDimensions() {
    call(this.options.beforeSetDimensions, [this]);
  }
  setDimensions() {
    const me = this;
    // Set the unconstrained dimension before label rotation
    if (me.isHorizontal()) {
      // Reset position before calculating rotation
      me.width = me.maxWidth;
      me.left = 0;
      me.right = me.width;
    } else {
      me.height = me.maxHeight;

      // Reset position before calculating rotation
      me.top = 0;
      me.bottom = me.height;
    }

    // Reset padding
    me.paddingLeft = 0;
    me.paddingTop = 0;
    me.paddingRight = 0;
    me.paddingBottom = 0;
  }
  afterSetDimensions() {
    call(this.options.afterSetDimensions, [this]);
  }

  _callHooks(name) {
    const me = this;
    me.chart.notifyPlugins(name, me.getContext());
    call(me.options[name], [me]);
  }

  // Data limits
  beforeDataLimits() {
    this._callHooks('beforeDataLimits');
  }
  determineDataLimits() {}
  afterDataLimits() {
    this._callHooks('afterDataLimits');
  }

  //
  beforeBuildTicks() {
    this._callHooks('beforeBuildTicks');
  }
  /**
	 * @return {object[]} the ticks
	 */
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks('afterBuildTicks');
  }

  beforeTickToLabelConversion() {
    call(this.options.beforeTickToLabelConversion, [this]);
  }
  /**
	 * Convert ticks to label strings
	 * @param {Tick[]} ticks
	 */
  generateTickLabels(ticks) {
    const me = this;
    const tickOpts = me.options.ticks;
    let i, ilen, tick;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      tick = ticks[i];
      tick.label = call(tickOpts.callback, [tick.value, i, ticks], me);
    }
  }
  afterTickToLabelConversion() {
    call(this.options.afterTickToLabelConversion, [this]);
  }

  //

  beforeCalculateLabelRotation() {
    call(this.options.beforeCalculateLabelRotation, [this]);
  }
  calculateLabelRotation() {
    const me = this;
    const options = me.options;
    const tickOpts = options.ticks;
    const numTicks = me.ticks.length;
    const minRotation = tickOpts.minRotation || 0;
    const maxRotation = tickOpts.maxRotation;
    let labelRotation = minRotation;
    let tickWidth, maxHeight, maxLabelDiagonal;

    if (!me._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !me.isHorizontal()) {
      me.labelRotation = minRotation;
      return;
    }

    const labelSizes = me._getLabelSizes();
    const maxLabelWidth = labelSizes.widest.width;
    const maxLabelHeight = labelSizes.highest.height;

    // Estimate the width of each grid based on the canvas width, the maximum
    // label width and the number of tick intervals
    const maxWidth = _limitValue(me.chart.width - maxLabelWidth, 0, me.maxWidth);
    tickWidth = options.offset ? me.maxWidth / numTicks : maxWidth / (numTicks - 1);

    // Allow 3 pixels x2 padding either side for label readability
    if (maxLabelWidth + 6 > tickWidth) {
      tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
      maxHeight = me.maxHeight - getTickMarkLength(options.grid)
				- tickOpts.padding - getTitleHeight(options.title, me.chart.options.font);
      maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
      labelRotation = toDegrees(Math.min(
        Math.asin(Math.min((labelSizes.highest.height + 6) / tickWidth, 1)),
        Math.asin(Math.min(maxHeight / maxLabelDiagonal, 1)) - Math.asin(maxLabelHeight / maxLabelDiagonal)
      ));
      labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
    }

    me.labelRotation = labelRotation;
  }
  afterCalculateLabelRotation() {
    call(this.options.afterCalculateLabelRotation, [this]);
  }

  //

  beforeFit() {
    call(this.options.beforeFit, [this]);
  }
  fit() {
    const me = this;
    // Reset
    const minSize = {
      width: 0,
      height: 0
    };

    const {chart, options: {ticks: tickOpts, title: titleOpts, grid: gridOpts}} = me;
    const display = me._isVisible();
    const isHorizontal = me.isHorizontal();

    if (display) {
      const titleHeight = getTitleHeight(titleOpts, chart.options.font);
      if (isHorizontal) {
        minSize.width = me.maxWidth;
        minSize.height = getTickMarkLength(gridOpts) + titleHeight;
      } else {
        minSize.height = me.maxHeight; // fill all the height
        minSize.width = getTickMarkLength(gridOpts) + titleHeight;
      }

      // Don't bother fitting the ticks if we are not showing the labels
      if (tickOpts.display && me.ticks.length) {
        const {first, last, widest, highest} = me._getLabelSizes();
        const tickPadding = tickOpts.padding * 2;
        const angleRadians = toRadians(me.labelRotation);
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);

        if (isHorizontal) {
        // A horizontal axis is more constrained by the height.
          const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
          minSize.height = Math.min(me.maxHeight, minSize.height + labelHeight + tickPadding);
        } else {
        // A vertical axis is more constrained by the width. Labels are the
        // dominant factor here, so get that length first and account for padding
          const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;

          minSize.width = Math.min(me.maxWidth, minSize.width + labelWidth + tickPadding);
        }
        me._calculatePadding(first, last, sin, cos);
      }
    }

    me._handleMargins();

    if (isHorizontal) {
      me.width = me._length = chart.width - me._margins.left - me._margins.right;
      me.height = minSize.height;
    } else {
      me.width = minSize.width;
      me.height = me._length = chart.height - me._margins.top - me._margins.bottom;
    }
  }

  _calculatePadding(first, last, sin, cos) {
    const me = this;
    const {ticks: {align, padding}, position} = me.options;
    const isRotated = me.labelRotation !== 0;
    const labelsBelowTicks = position !== 'top' && me.axis === 'x';

    if (me.isHorizontal()) {
      const offsetLeft = me.getPixelForTick(0) - me.left;
      const offsetRight = me.right - me.getPixelForTick(me.ticks.length - 1);
      let paddingLeft = 0;
      let paddingRight = 0;

      // Ensure that our ticks are always inside the canvas. When rotated, ticks are right aligned
      // which means that the right padding is dominated by the font height
      if (isRotated) {
        if (labelsBelowTicks) {
          paddingLeft = cos * first.width;
          paddingRight = sin * last.height;
        } else {
          paddingLeft = sin * first.height;
          paddingRight = cos * last.width;
        }
      } else if (align === 'start') {
        paddingRight = last.width;
      } else if (align === 'end') {
        paddingLeft = first.width;
      } else {
        paddingLeft = first.width / 2;
        paddingRight = last.width / 2;
      }

      // Adjust padding taking into account changes in offsets
      me.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * me.width / (me.width - offsetLeft), 0);
      me.paddingRight = Math.max((paddingRight - offsetRight + padding) * me.width / (me.width - offsetRight), 0);
    } else {
      let paddingTop = last.height / 2;
      let paddingBottom = first.height / 2;

      if (align === 'start') {
        paddingTop = 0;
        paddingBottom = first.height;
      } else if (align === 'end') {
        paddingTop = last.height;
        paddingBottom = 0;
      }

      me.paddingTop = paddingTop + padding;
      me.paddingBottom = paddingBottom + padding;
    }
  }

  /**
	 * Handle margins and padding interactions
	 * @private
	 */
  _handleMargins() {
    const me = this;
    if (me._margins) {
      me._margins.left = Math.max(me.paddingLeft, me._margins.left);
      me._margins.top = Math.max(me.paddingTop, me._margins.top);
      me._margins.right = Math.max(me.paddingRight, me._margins.right);
      me._margins.bottom = Math.max(me.paddingBottom, me._margins.bottom);
    }
  }

  afterFit() {
    call(this.options.afterFit, [this]);
  }

  // Shared Methods
  /**
	 * @return {boolean}
	 */
  isHorizontal() {
    const {axis, position} = this.options;
    return position === 'top' || position === 'bottom' || axis === 'x';
  }
  /**
	 * @return {boolean}
	 */
  isFullSize() {
    return this.options.fullSize;
  }

  /**
	 * @param {Tick[]} ticks
	 * @private
	 */
  _convertTicksToLabels(ticks) {
    const me = this;

    me.beforeTickToLabelConversion();

    me.generateTickLabels(ticks);

    // Ticks should be skipped when callback returns null or undef, so lets remove those.
    let i, ilen;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      if (isNullOrUndef(ticks[i].label)) {
        ticks.splice(i, 1);
        ilen--;
        i--;
      }
    }

    me.afterTickToLabelConversion();
  }

  /**
	 * @return {{ first: object, last: object, widest: object, highest: object, widths: Array, heights: array }}
	 * @private
	 */
  _getLabelSizes() {
    const me = this;
    let labelSizes = me._labelSizes;

    if (!labelSizes) {
      const sampleSize = me.options.ticks.sampleSize;
      let ticks = me.ticks;
      if (sampleSize < ticks.length) {
        ticks = sample(ticks, sampleSize);
      }

      me._labelSizes = labelSizes = me._computeLabelSizes(ticks, ticks.length);
    }

    return labelSizes;
  }

  /**
	 * Returns {width, height, offset} objects for the first, last, widest, highest tick
	 * labels where offset indicates the anchor point offset from the top in pixels.
	 * @return {{ first: object, last: object, widest: object, highest: object, widths: Array, heights: array }}
	 * @private
	 */
  _computeLabelSizes(ticks, length) {
    const {ctx, _longestTextCache: caches} = this;
    const widths = [];
    const heights = [];
    let widestLabelSize = 0;
    let highestLabelSize = 0;
    let i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;

    for (i = 0; i < length; ++i) {
      label = ticks[i].label;
      tickFont = this._resolveTickFontOptions(i);
      ctx.font = fontString = tickFont.string;
      cache = caches[fontString] = caches[fontString] || {data: {}, gc: []};
      lineHeight = tickFont.lineHeight;
      width = height = 0;
      // Undefined labels and arrays should not be measured
      if (!isNullOrUndef(label) && !isArray(label)) {
        width = _measureText(ctx, cache.data, cache.gc, width, label);
        height = lineHeight;
      } else if (isArray(label)) {
        // if it is an array let's measure each element
        for (j = 0, jlen = label.length; j < jlen; ++j) {
          nestedLabel = label[j];
          // Undefined labels and arrays should not be measured
          if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
            width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel);
            height += lineHeight;
          }
        }
      }
      widths.push(width);
      heights.push(height);
      widestLabelSize = Math.max(width, widestLabelSize);
      highestLabelSize = Math.max(height, highestLabelSize);
    }
    garbageCollect(caches, length);

    const widest = widths.indexOf(widestLabelSize);
    const highest = heights.indexOf(highestLabelSize);

    const valueAt = (idx) => ({width: widths[idx] || 0, height: heights[idx] || 0});

    return {
      first: valueAt(0),
      last: valueAt(length - 1),
      widest: valueAt(widest),
      highest: valueAt(highest),
      widths,
      heights,
    };
  }

  /**
	 * Used to get the label to display in the tooltip for the given value
	 * @param {*} value
	 * @return {string}
	 */
  getLabelForValue(value) {
    return value;
  }

  /**
	 * Returns the location of the given data point. Value can either be an index or a numerical value
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param {*} value
	 * @param {number} [index]
	 * @return {number}
	 */
  getPixelForValue(value, index) { // eslint-disable-line no-unused-vars
    return NaN;
  }

  /**
	 * Used to get the data value from a given pixel. This is the inverse of getPixelForValue
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param {number} pixel
	 * @return {*}
	 */
  getValueForPixel(pixel) {} // eslint-disable-line no-unused-vars

  /**
	 * Returns the location of the tick at the given index
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param {number} index
	 * @return {number}
	 */
  getPixelForTick(index) {
    const ticks = this.ticks;
    if (index < 0 || index > ticks.length - 1) {
      return null;
    }
    return this.getPixelForValue(ticks[index].value);
  }

  /**
	 * Utility for getting the pixel location of a percentage of scale
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param {number} decimal
	 * @return {number}
	 */
  getPixelForDecimal(decimal) {
    const me = this;

    if (me._reversePixels) {
      decimal = 1 - decimal;
    }

    const pixel = me._startPixel + decimal * me._length;
    return _int16Range(me._alignToPixels ? _alignPixel(me.chart, pixel, 0) : pixel);
  }

  /**
	 * @param {number} pixel
	 * @return {number}
	 */
  getDecimalForPixel(pixel) {
    const decimal = (pixel - this._startPixel) / this._length;
    return this._reversePixels ? 1 - decimal : decimal;
  }

  /**
	 * Returns the pixel for the minimum chart value
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @return {number}
	 */
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }

  /**
	 * @return {number}
	 */
  getBaseValue() {
    const {min, max} = this;

    return min < 0 && max < 0 ? max :
      min > 0 && max > 0 ? min :
      0;
  }

  /**
	 * @protected
	 */
  getContext(index) {
    const me = this;
    const ticks = me.ticks || [];

    if (index >= 0 && index < ticks.length) {
      const tick = ticks[index];
      return tick.$context ||
				(tick.$context = createTickContext(me.getContext(), index, tick));
    }
    return me.$context ||
			(me.$context = createScaleContext(me.chart.getContext(), me));
  }

  /**
	 * @return {number}
	 * @private
	 */
  _tickSize() {
    const me = this;
    const optionTicks = me.options.ticks;

    // Calculate space needed by label in axis direction.
    const rot = toRadians(me.labelRotation);
    const cos = Math.abs(Math.cos(rot));
    const sin = Math.abs(Math.sin(rot));

    const labelSizes = me._getLabelSizes();
    const padding = optionTicks.autoSkipPadding || 0;
    const w = labelSizes ? labelSizes.widest.width + padding : 0;
    const h = labelSizes ? labelSizes.highest.height + padding : 0;

    // Calculate space needed for 1 tick in axis direction.
    return me.isHorizontal()
      ? h * cos > w * sin ? w / cos : h / sin
      : h * sin < w * cos ? h / cos : w / sin;
  }

  /**
	 * @return {boolean}
	 * @private
	 */
  _isVisible() {
    const display = this.options.display;

    if (display !== 'auto') {
      return !!display;
    }

    return this.getMatchingVisibleMetas().length > 0;
  }

  /**
	 * @private
	 */
  _computeGridLineItems(chartArea) {
    const me = this;
    const axis = me.axis;
    const chart = me.chart;
    const options = me.options;
    const {grid, position} = options;
    const offset = grid.offset;
    const isHorizontal = me.isHorizontal();
    const ticks = me.ticks;
    const ticksLength = ticks.length + (offset ? 1 : 0);
    const tl = getTickMarkLength(grid);
    const items = [];

    const borderOpts = grid.setContext(me.getContext());
    const axisWidth = borderOpts.drawBorder ? borderOpts.borderWidth : 0;
    const axisHalfWidth = axisWidth / 2;
    const alignBorderValue = function(pixel) {
      return _alignPixel(chart, pixel, axisWidth);
    };
    let borderValue, i, lineValue, alignedLineValue;
    let tx1, ty1, tx2, ty2, x1, y1, x2, y2;

    if (position === 'top') {
      borderValue = alignBorderValue(me.bottom);
      ty1 = me.bottom - tl;
      ty2 = borderValue - axisHalfWidth;
      y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
      y2 = chartArea.bottom;
    } else if (position === 'bottom') {
      borderValue = alignBorderValue(me.top);
      y1 = chartArea.top;
      y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
      ty1 = borderValue + axisHalfWidth;
      ty2 = me.top + tl;
    } else if (position === 'left') {
      borderValue = alignBorderValue(me.right);
      tx1 = me.right - tl;
      tx2 = borderValue - axisHalfWidth;
      x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
      x2 = chartArea.right;
    } else if (position === 'right') {
      borderValue = alignBorderValue(me.left);
      x1 = chartArea.left;
      x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
      tx1 = borderValue + axisHalfWidth;
      tx2 = me.left + tl;
    } else if (axis === 'x') {
      if (position === 'center') {
        borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(me.chart.scales[positionAxisID].getPixelForValue(value));
      }

      y1 = chartArea.top;
      y2 = chartArea.bottom;
      ty1 = borderValue + axisHalfWidth;
      ty2 = ty1 + tl;
    } else if (axis === 'y') {
      if (position === 'center') {
        borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(me.chart.scales[positionAxisID].getPixelForValue(value));
      }

      tx1 = borderValue - axisHalfWidth;
      tx2 = tx1 - tl;
      x1 = chartArea.left;
      x2 = chartArea.right;
    }

    const limit = valueOrDefault(options.ticks.maxTicksLimit, ticksLength);
    const step = Math.max(1, Math.ceil(ticksLength / limit));
    for (i = 0; i < ticksLength; i += step) {
      const optsAtIndex = grid.setContext(me.getContext(i));

      const lineWidth = optsAtIndex.lineWidth;
      const lineColor = optsAtIndex.color;
      const borderDash = grid.borderDash || [];
      const borderDashOffset = optsAtIndex.borderDashOffset;

      const tickWidth = optsAtIndex.tickWidth;
      const tickColor = optsAtIndex.tickColor;
      const tickBorderDash = optsAtIndex.tickBorderDash || [];
      const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;

      lineValue = getPixelForGridLine(me, i, offset);

      // Skip if the pixel is out of the range
      if (lineValue === undefined) {
        continue;
      }

      alignedLineValue = _alignPixel(chart, lineValue, lineWidth);

      if (isHorizontal) {
        tx1 = tx2 = x1 = x2 = alignedLineValue;
      } else {
        ty1 = ty2 = y1 = y2 = alignedLineValue;
      }

      items.push({
        tx1,
        ty1,
        tx2,
        ty2,
        x1,
        y1,
        x2,
        y2,
        width: lineWidth,
        color: lineColor,
        borderDash,
        borderDashOffset,
        tickWidth,
        tickColor,
        tickBorderDash,
        tickBorderDashOffset,
      });
    }

    me._ticksLength = ticksLength;
    me._borderValue = borderValue;

    return items;
  }

  /**
	 * @private
	 */
  _computeLabelItems(chartArea) {
    const me = this;
    const axis = me.axis;
    const options = me.options;
    const {position, ticks: optionTicks} = options;
    const isHorizontal = me.isHorizontal();
    const ticks = me.ticks;
    const {align, crossAlign, padding, mirror} = optionTicks;
    const tl = getTickMarkLength(options.grid);
    const tickAndPadding = tl + padding;
    const hTickAndPadding = mirror ? -padding : tickAndPadding;
    const rotation = -toRadians(me.labelRotation);
    const items = [];
    let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
    let textBaseline = 'middle';

    if (position === 'top') {
      y = me.bottom - hTickAndPadding;
      textAlign = me._getXAxisLabelAlignment();
    } else if (position === 'bottom') {
      y = me.top + hTickAndPadding;
      textAlign = me._getXAxisLabelAlignment();
    } else if (position === 'left') {
      const ret = me._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x = ret.x;
    } else if (position === 'right') {
      const ret = me._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x = ret.x;
    } else if (axis === 'x') {
      if (position === 'center') {
        y = ((chartArea.top + chartArea.bottom) / 2) + tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        y = me.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
      }
      textAlign = me._getXAxisLabelAlignment();
    } else if (axis === 'y') {
      if (position === 'center') {
        x = ((chartArea.left + chartArea.right) / 2) - tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        x = me.chart.scales[positionAxisID].getPixelForValue(value);
      }
      textAlign = me._getYAxisLabelAlignment(tl).textAlign;
    }

    if (axis === 'y') {
      if (align === 'start') {
        textBaseline = 'top';
      } else if (align === 'end') {
        textBaseline = 'bottom';
      }
    }

    const labelSizes = me._getLabelSizes();
    for (i = 0, ilen = ticks.length; i < ilen; ++i) {
      tick = ticks[i];
      label = tick.label;

      const optsAtIndex = optionTicks.setContext(me.getContext(i));
      pixel = me.getPixelForTick(i) + optionTicks.labelOffset;
      font = me._resolveTickFontOptions(i);
      lineHeight = font.lineHeight;
      lineCount = isArray(label) ? label.length : 1;
      const halfCount = lineCount / 2;
      const color = optsAtIndex.color;
      const strokeColor = optsAtIndex.textStrokeColor;
      const strokeWidth = optsAtIndex.textStrokeWidth;

      if (isHorizontal) {
        x = pixel;
        if (position === 'top') {
          if (crossAlign === 'near' || rotation !== 0) {
            textOffset = -lineCount * lineHeight + lineHeight / 2;
          } else if (crossAlign === 'center') {
            textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
          } else {
            textOffset = -labelSizes.highest.height + lineHeight / 2;
          }
        } else {
          // eslint-disable-next-line no-lonely-if
          if (crossAlign === 'near' || rotation !== 0) {
            textOffset = lineHeight / 2;
          } else if (crossAlign === 'center') {
            textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
          } else {
            textOffset = labelSizes.highest.height - lineCount * lineHeight;
          }
        }
        if (mirror) {
          textOffset *= -1;
        }
      } else {
        y = pixel;
        textOffset = (1 - lineCount) * lineHeight / 2;
      }

      let backdrop;

      if (optsAtIndex.showLabelBackdrop) {
        const labelPadding = toPadding(optsAtIndex.backdropPadding);
        const height = labelSizes.heights[i];
        const width = labelSizes.widths[i];

        let top = y + textOffset - labelPadding.top;
        let left = x - labelPadding.left;

        switch (textBaseline) {
        case 'middle':
          top -= height / 2;
          break;
        case 'bottom':
          top -= height;
          break;
        default:
          break;
        }

        switch (textAlign) {
        case 'center':
          left -= width / 2;
          break;
        case 'right':
          left -= width;
          break;
        default:
          break;
        }

        backdrop = {
          left,
          top,
          width: width + labelPadding.width,
          height: height + labelPadding.height,

          color: optsAtIndex.backdropColor,
        };
      }

      items.push({
        rotation,
        label,
        font,
        color,
        strokeColor,
        strokeWidth,
        textOffset,
        textAlign,
        textBaseline,
        translation: [x, y],
        backdrop,
      });
    }

    return items;
  }

  _getXAxisLabelAlignment() {
    const me = this;
    const {position, ticks} = me.options;
    const rotation = -toRadians(me.labelRotation);

    if (rotation) {
      return position === 'top' ? 'left' : 'right';
    }

    let align = 'center';

    if (ticks.align === 'start') {
      align = 'left';
    } else if (ticks.align === 'end') {
      align = 'right';
    }

    return align;
  }

  _getYAxisLabelAlignment(tl) {
    const me = this;
    const {position, ticks: {crossAlign, mirror, padding}} = me.options;
    const labelSizes = me._getLabelSizes();
    const tickAndPadding = tl + padding;
    const widest = labelSizes.widest.width;

    let textAlign;
    let x;

    if (position === 'left') {
      if (mirror) {
        textAlign = 'left';
        x = me.right + padding;
      } else {
        x = me.right - tickAndPadding;

        if (crossAlign === 'near') {
          textAlign = 'right';
        } else if (crossAlign === 'center') {
          textAlign = 'center';
          x -= (widest / 2);
        } else {
          textAlign = 'left';
          x = me.left;
        }
      }
    } else if (position === 'right') {
      if (mirror) {
        textAlign = 'right';
        x = me.left + padding;
      } else {
        x = me.left + tickAndPadding;

        if (crossAlign === 'near') {
          textAlign = 'left';
        } else if (crossAlign === 'center') {
          textAlign = 'center';
          x += widest / 2;
        } else {
          textAlign = 'right';
          x = me.right;
        }
      }
    } else {
      textAlign = 'right';
    }

    return {textAlign, x};
  }

  /**
	 * @private
	 */
  _computeLabelArea() {
    const me = this;

    if (me.options.ticks.mirror) {
      return;
    }

    const chart = me.chart;
    const position = me.options.position;

    if (position === 'left' || position === 'right') {
      return {top: 0, left: me.left, bottom: chart.height, right: me.right};
    } if (position === 'top' || position === 'bottom') {
      return {top: me.top, left: 0, bottom: me.bottom, right: chart.width};
    }
  }

  /**
   * @protected
   */
  drawBackground() {
    const {ctx, options: {backgroundColor}, left, top, width, height} = this;
    if (backgroundColor) {
      ctx.save();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(left, top, width, height);
      ctx.restore();
    }
  }

  getLineWidthForValue(value) {
    const me = this;
    const grid = me.options.grid;
    if (!me._isVisible() || !grid.display) {
      return 0;
    }
    const ticks = me.ticks;
    const index = ticks.findIndex(t => t.value === value);
    if (index >= 0) {
      const opts = grid.setContext(me.getContext(index));
      return opts.lineWidth;
    }
    return 0;
  }

  /**
	 * @protected
	 */
  drawGrid(chartArea) {
    const me = this;
    const grid = me.options.grid;
    const ctx = me.ctx;
    const items = me._gridLineItems || (me._gridLineItems = me._computeGridLineItems(chartArea));
    let i, ilen;

    const drawLine = (p1, p2, style) => {
      if (!style.width || !style.color) {
        return;
      }
      ctx.save();
      ctx.lineWidth = style.width;
      ctx.strokeStyle = style.color;
      ctx.setLineDash(style.borderDash || []);
      ctx.lineDashOffset = style.borderDashOffset;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    };

    if (grid.display) {
      for (i = 0, ilen = items.length; i < ilen; ++i) {
        const item = items[i];

        if (grid.drawOnChartArea) {
          drawLine(
            {x: item.x1, y: item.y1},
            {x: item.x2, y: item.y2},
            item
          );
        }

        if (grid.drawTicks) {
          drawLine(
            {x: item.tx1, y: item.ty1},
            {x: item.tx2, y: item.ty2},
            {
              color: item.tickColor,
              width: item.tickWidth,
              borderDash: item.tickBorderDash,
              borderDashOffset: item.tickBorderDashOffset
            }
          );
        }
      }
    }
  }

  /**
	 * @protected
	 */
  drawBorder() {
    const me = this;
    const {chart, ctx, options: {grid}} = me;
    const borderOpts = grid.setContext(me.getContext());
    const axisWidth = grid.drawBorder ? borderOpts.borderWidth : 0;
    if (!axisWidth) {
      return;
    }
    const lastLineWidth = grid.setContext(me.getContext(0)).lineWidth;
    const borderValue = me._borderValue;
    let x1, x2, y1, y2;

    if (me.isHorizontal()) {
      x1 = _alignPixel(chart, me.left, axisWidth) - axisWidth / 2;
      x2 = _alignPixel(chart, me.right, lastLineWidth) + lastLineWidth / 2;
      y1 = y2 = borderValue;
    } else {
      y1 = _alignPixel(chart, me.top, axisWidth) - axisWidth / 2;
      y2 = _alignPixel(chart, me.bottom, lastLineWidth) + lastLineWidth / 2;
      x1 = x2 = borderValue;
    }
    ctx.save();
    ctx.lineWidth = borderOpts.borderWidth;
    ctx.strokeStyle = borderOpts.borderColor;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.restore();
  }

  /**
	 * @protected
	 */
  drawLabels(chartArea) {
    const me = this;
    const optionTicks = me.options.ticks;

    if (!optionTicks.display) {
      return;
    }

    const ctx = me.ctx;

    const area = me._computeLabelArea();
    if (area) {
      clipArea(ctx, area);
    }

    const items = me._labelItems || (me._labelItems = me._computeLabelItems(chartArea));
    let i, ilen;

    for (i = 0, ilen = items.length; i < ilen; ++i) {
      const item = items[i];
      const tickFont = item.font;
      const label = item.label;

      if (item.backdrop) {
        ctx.fillStyle = item.backdrop.color;
        ctx.fillRect(item.backdrop.left, item.backdrop.top, item.backdrop.width, item.backdrop.height);
      }

      let y = item.textOffset;
      renderText(ctx, label, 0, y, tickFont, item);
    }

    if (area) {
      unclipArea(ctx);
    }
  }

  /**
	 * @protected
	 */
  drawTitle() {
    const {ctx, options: {position, title, reverse}} = this;

    if (!title.display) {
      return;
    }

    const font = toFont(title.font);
    const padding = toPadding(title.padding);
    const align = title.align;
    let offset = font.lineHeight / 2;

    if (position === 'bottom') {
      offset += padding.bottom;
      if (isArray(title.text)) {
        offset += font.lineHeight * (title.text.length - 1);
      }
    } else {
      offset += padding.top;
    }

    const {titleX, titleY, maxWidth, rotation} = titleArgs(this, offset, position, align);

    renderText(ctx, title.text, 0, 0, font, {
      color: title.color,
      maxWidth,
      rotation,
      textAlign: titleAlign(align, position, reverse),
      textBaseline: 'middle',
      translation: [titleX, titleY],
    });
  }

  draw(chartArea) {
    const me = this;

    if (!me._isVisible()) {
      return;
    }

    me.drawBackground();
    me.drawGrid(chartArea);
    me.drawBorder();
    me.drawTitle();
    me.drawLabels(chartArea);
  }

  /**
	 * @return {object[]}
	 * @private
	 */
  _layers() {
    const me = this;
    const opts = me.options;
    const tz = opts.ticks && opts.ticks.z || 0;
    const gz = opts.grid && opts.grid.z || 0;

    if (!me._isVisible() || me.draw !== Scale.prototype.draw) {
      // backward compatibility: draw has been overridden by custom scale
      return [{
        z: tz,
        draw(chartArea) {
          me.draw(chartArea);
        }
      }];
    }

    return [{
      z: gz,
      draw(chartArea) {
        me.drawBackground();
        me.drawGrid(chartArea);
        me.drawTitle();
      }
    }, {
      z: gz + 1, // TODO, v4 move border options to its own object and add z
      draw() {
        me.drawBorder();
      }
    }, {
      z: tz,
      draw(chartArea) {
        me.drawLabels(chartArea);
      }
    }];
  }

  /**
	 * Returns visible dataset metas that are attached to this scale
	 * @param {string} [type] - if specified, also filter by dataset type
	 * @return {object[]}
	 */
  getMatchingVisibleMetas(type) {
    const me = this;
    const metas = me.chart.getSortedVisibleDatasetMetas();
    const axisID = me.axis + 'AxisID';
    const result = [];
    let i, ilen;

    for (i = 0, ilen = metas.length; i < ilen; ++i) {
      const meta = metas[i];
      if (meta[axisID] === me.id && (!type || meta.type === type)) {
        result.push(meta);
      }
    }
    return result;
  }

  /**
	 * @param {number} index
	 * @return {object}
	 * @protected
 	 */
  _resolveTickFontOptions(index) {
    const opts = this.options.ticks.setContext(this.getContext(index));
    return toFont(opts.font);
  }

  /**
   * @protected
   */
  _maxDigits() {
    const me = this;
    const fontSize = me._resolveTickFontOptions(0).lineHeight;
    return (me.isHorizontal() ? me.width : me.height) / fontSize;
  }
}
