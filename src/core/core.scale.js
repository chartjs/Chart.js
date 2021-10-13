import Element from './core.element';
import {_alignPixel, _measureText, renderText, clipArea, unclipArea} from '../helpers/helpers.canvas';
import {callback as call, each, finiteOrDefault, isArray, isFinite, isNullOrUndef, isObject, valueOrDefault} from '../helpers/helpers.core';
import {toDegrees, toRadians, _int16Range, _limitValue, HALF_PI} from '../helpers/helpers.math';
import {_alignStartEnd, _toLeftRightCenter} from '../helpers/helpers.extras';
import {createContext, toFont, toPadding, _addGrace} from '../helpers/helpers.options';

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
  return createContext(parent, {
    scale,
    type: 'scale'
  });
}

function createTickContext(parent, index, tick) {
  return createContext(parent, {
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
  const {top, left, bottom, right, chart} = scale;
  const {chartArea, scales} = chart;
  let rotation = 0;
  let maxWidth, titleX, titleY;
  const height = bottom - top;
  const width = right - left;

  if (scale.isHorizontal()) {
    titleX = _alignStartEnd(align, left, right);

    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleY = scales[positionAxisID].getPixelForValue(value) + height - offset;
    } else if (position === 'center') {
      titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset;
    } else {
      titleY = offsetFromEdge(scale, position, offset);
    }
    maxWidth = right - left;
  } else {
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleX = scales[positionAxisID].getPixelForValue(value) - width + offset;
    } else if (position === 'center') {
      titleX = (chartArea.left + chartArea.right) / 2 - width + offset;
    } else {
      titleX = offsetFromEdge(scale, position, offset);
    }
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
    this.options = options.setContext(this.getContext());

    this.axis = options.axis;

    // parse min/max value, so we can properly determine min/max for other scales
    this._userMin = this.parse(options.min);
    this._userMax = this.parse(options.max);
    this._suggestedMin = this.parse(options.suggestedMin);
    this._suggestedMax = this.parse(options.suggestedMax);
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
    // eslint-disable-next-line prefer-const
    let {min, max, minDefined, maxDefined} = this.getUserBounds();
    let range;

    if (minDefined && maxDefined) {
      return {min, max};
    }

    const metas = this.getMatchingVisibleMetas();
    for (let i = 0, ilen = metas.length; i < ilen; ++i) {
      range = metas[i].controller.getMinMax(this, canStack);
      if (!minDefined) {
        min = Math.min(min, range.min);
      }
      if (!maxDefined) {
        max = Math.max(max, range.max);
      }
    }

    // Make sure min <= max when only min or max is defined by user and the data is outside that range
    min = maxDefined && min > max ? max : min;
    max = minDefined && min > max ? min : max;

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
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
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
    const {beginAtZero, grace, ticks: tickOpts} = this.options;
    const sampleSize = tickOpts.sampleSize;

    // Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
    this.beforeUpdate();

    // Absorb the master measurements
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this._margins = margins = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, margins);

    this.ticks = null;
    this._labelSizes = null;
    this._gridLineItems = null;
    this._labelItems = null;

    // Dimensions
    this.beforeSetDimensions();
    this.setDimensions();
    this.afterSetDimensions();

    this._maxLength = this.isHorizontal()
      ? this.width + margins.left + margins.right
      : this.height + margins.top + margins.bottom;

    // Data min/max
    if (!this._dataLimitsCached) {
      this.beforeDataLimits();
      this.determineDataLimits();
      this.afterDataLimits();
      this._range = _addGrace(this, grace, beginAtZero);
      this._dataLimitsCached = true;
    }

    this.beforeBuildTicks();

    this.ticks = this.buildTicks() || [];

    // Allow modification of ticks in callback.
    this.afterBuildTicks();

    // Compute tick rotation and fit using a sampled subset of labels
    // We generally don't need to compute the size of every single label for determining scale size
    const samplingEnabled = sampleSize < this.ticks.length;
    this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks);

    // configure is called twice, once here, once from core.controller.updateLayout.
    // Here we haven't been positioned yet, but dimensions are correct.
    // Variables set in configure are needed for calculateLabelRotation, and
    // it's ok that coordinates are not correct there, only dimensions matter.
    this.configure();

    // Tick Rotation
    this.beforeCalculateLabelRotation();
    this.calculateLabelRotation(); // Preconditions: number of ticks and sizes of largest labels must be calculated beforehand
    this.afterCalculateLabelRotation();

    // Auto-skip
    if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === 'auto')) {
      this.ticks = autoSkip(this, this.ticks);
      this._labelSizes = null;
    }

    if (samplingEnabled) {
      // Generate labels using all non-skipped ticks
      this._convertTicksToLabels(this.ticks);
    }

    this.beforeFit();
    this.fit(); // Preconditions: label rotation and label sizes must be calculated beforehand
    this.afterFit();

    // IMPORTANT: after this point, we consider that `this.ticks` will NEVER change!

    this.afterUpdate();
  }

  /**
	 * @protected
	 */
  configure() {
    let reversePixels = this.options.reverse;
    let startPixel, endPixel;

    if (this.isHorizontal()) {
      startPixel = this.left;
      endPixel = this.right;
    } else {
      startPixel = this.top;
      endPixel = this.bottom;
      // by default vertical scales are from bottom to top, so pixels are reversed
      reversePixels = !reversePixels;
    }
    this._startPixel = startPixel;
    this._endPixel = endPixel;
    this._reversePixels = reversePixels;
    this._length = endPixel - startPixel;
    this._alignToPixels = this.options.alignToPixels;
  }

  afterUpdate() {
    call(this.options.afterUpdate, [this]);
  }

  //

  beforeSetDimensions() {
    call(this.options.beforeSetDimensions, [this]);
  }
  setDimensions() {
    // Set the unconstrained dimension before label rotation
    if (this.isHorizontal()) {
      // Reset position before calculating rotation
      this.width = this.maxWidth;
      this.left = 0;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;

      // Reset position before calculating rotation
      this.top = 0;
      this.bottom = this.height;
    }

    // Reset padding
    this.paddingLeft = 0;
    this.paddingTop = 0;
    this.paddingRight = 0;
    this.paddingBottom = 0;
  }
  afterSetDimensions() {
    call(this.options.afterSetDimensions, [this]);
  }

  _callHooks(name) {
    this.chart.notifyPlugins(name, this.getContext());
    call(this.options[name], [this]);
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
    const tickOpts = this.options.ticks;
    let i, ilen, tick;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      tick = ticks[i];
      tick.label = call(tickOpts.callback, [tick.value, i, ticks], this);
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
    const options = this.options;
    const tickOpts = options.ticks;
    const numTicks = this.ticks.length;
    const minRotation = tickOpts.minRotation || 0;
    const maxRotation = tickOpts.maxRotation;
    let labelRotation = minRotation;
    let tickWidth, maxHeight, maxLabelDiagonal;

    if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) {
      this.labelRotation = minRotation;
      return;
    }

    const labelSizes = this._getLabelSizes();
    const maxLabelWidth = labelSizes.widest.width;
    const maxLabelHeight = labelSizes.highest.height;

    // Estimate the width of each grid based on the canvas width, the maximum
    // label width and the number of tick intervals
    const maxWidth = _limitValue(this.chart.width - maxLabelWidth, 0, this.maxWidth);
    tickWidth = options.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1);

    // Allow 3 pixels x2 padding either side for label readability
    if (maxLabelWidth + 6 > tickWidth) {
      tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
      maxHeight = this.maxHeight - getTickMarkLength(options.grid)
				- tickOpts.padding - getTitleHeight(options.title, this.chart.options.font);
      maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
      labelRotation = toDegrees(Math.min(
        Math.asin(_limitValue((labelSizes.highest.height + 6) / tickWidth, -1, 1)),
        Math.asin(_limitValue(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin(_limitValue(maxLabelHeight / maxLabelDiagonal, -1, 1))
      ));
      labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
    }

    this.labelRotation = labelRotation;
  }
  afterCalculateLabelRotation() {
    call(this.options.afterCalculateLabelRotation, [this]);
  }

  //

  beforeFit() {
    call(this.options.beforeFit, [this]);
  }
  fit() {
    // Reset
    const minSize = {
      width: 0,
      height: 0
    };

    const {chart, options: {ticks: tickOpts, title: titleOpts, grid: gridOpts}} = this;
    const display = this._isVisible();
    const isHorizontal = this.isHorizontal();

    if (display) {
      const titleHeight = getTitleHeight(titleOpts, chart.options.font);
      if (isHorizontal) {
        minSize.width = this.maxWidth;
        minSize.height = getTickMarkLength(gridOpts) + titleHeight;
      } else {
        minSize.height = this.maxHeight; // fill all the height
        minSize.width = getTickMarkLength(gridOpts) + titleHeight;
      }

      // Don't bother fitting the ticks if we are not showing the labels
      if (tickOpts.display && this.ticks.length) {
        const {first, last, widest, highest} = this._getLabelSizes();
        const tickPadding = tickOpts.padding * 2;
        const angleRadians = toRadians(this.labelRotation);
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);

        if (isHorizontal) {
        // A horizontal axis is more constrained by the height.
          const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
          minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding);
        } else {
        // A vertical axis is more constrained by the width. Labels are the
        // dominant factor here, so get that length first and account for padding
          const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;

          minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding);
        }
        this._calculatePadding(first, last, sin, cos);
      }
    }

    this._handleMargins();

    if (isHorizontal) {
      this.width = this._length = chart.width - this._margins.left - this._margins.right;
      this.height = minSize.height;
    } else {
      this.width = minSize.width;
      this.height = this._length = chart.height - this._margins.top - this._margins.bottom;
    }
  }

  _calculatePadding(first, last, sin, cos) {
    const {ticks: {align, padding}, position} = this.options;
    const isRotated = this.labelRotation !== 0;
    const labelsBelowTicks = position !== 'top' && this.axis === 'x';

    if (this.isHorizontal()) {
      const offsetLeft = this.getPixelForTick(0) - this.left;
      const offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1);
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
      this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0);
      this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
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

      this.paddingTop = paddingTop + padding;
      this.paddingBottom = paddingBottom + padding;
    }
  }

  /**
	 * Handle margins and padding interactions
	 * @private
	 */
  _handleMargins() {
    if (this._margins) {
      this._margins.left = Math.max(this.paddingLeft, this._margins.left);
      this._margins.top = Math.max(this.paddingTop, this._margins.top);
      this._margins.right = Math.max(this.paddingRight, this._margins.right);
      this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
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
    this.beforeTickToLabelConversion();

    this.generateTickLabels(ticks);

    // Ticks should be skipped when callback returns null or undef, so lets remove those.
    let i, ilen;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      if (isNullOrUndef(ticks[i].label)) {
        ticks.splice(i, 1);
        ilen--;
        i--;
      }
    }

    this.afterTickToLabelConversion();
  }

  /**
	 * @return {{ first: object, last: object, widest: object, highest: object, widths: Array, heights: array }}
	 * @private
	 */
  _getLabelSizes() {
    let labelSizes = this._labelSizes;

    if (!labelSizes) {
      const sampleSize = this.options.ticks.sampleSize;
      let ticks = this.ticks;
      if (sampleSize < ticks.length) {
        ticks = sample(ticks, sampleSize);
      }

      this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length);
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
    if (this._reversePixels) {
      decimal = 1 - decimal;
    }

    const pixel = this._startPixel + decimal * this._length;
    return _int16Range(this._alignToPixels ? _alignPixel(this.chart, pixel, 0) : pixel);
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
    const ticks = this.ticks || [];

    if (index >= 0 && index < ticks.length) {
      const tick = ticks[index];
      return tick.$context ||
				(tick.$context = createTickContext(this.getContext(), index, tick));
    }
    return this.$context ||
			(this.$context = createScaleContext(this.chart.getContext(), this));
  }

  /**
	 * @return {number}
	 * @private
	 */
  _tickSize() {
    const optionTicks = this.options.ticks;

    // Calculate space needed by label in axis direction.
    const rot = toRadians(this.labelRotation);
    const cos = Math.abs(Math.cos(rot));
    const sin = Math.abs(Math.sin(rot));

    const labelSizes = this._getLabelSizes();
    const padding = optionTicks.autoSkipPadding || 0;
    const w = labelSizes ? labelSizes.widest.width + padding : 0;
    const h = labelSizes ? labelSizes.highest.height + padding : 0;

    // Calculate space needed for 1 tick in axis direction.
    return this.isHorizontal()
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
    const axis = this.axis;
    const chart = this.chart;
    const options = this.options;
    const {grid, position} = options;
    const offset = grid.offset;
    const isHorizontal = this.isHorizontal();
    const ticks = this.ticks;
    const ticksLength = ticks.length + (offset ? 1 : 0);
    const tl = getTickMarkLength(grid);
    const items = [];

    const borderOpts = grid.setContext(this.getContext());
    const axisWidth = borderOpts.drawBorder ? borderOpts.borderWidth : 0;
    const axisHalfWidth = axisWidth / 2;
    const alignBorderValue = function(pixel) {
      return _alignPixel(chart, pixel, axisWidth);
    };
    let borderValue, i, lineValue, alignedLineValue;
    let tx1, ty1, tx2, ty2, x1, y1, x2, y2;

    if (position === 'top') {
      borderValue = alignBorderValue(this.bottom);
      ty1 = this.bottom - tl;
      ty2 = borderValue - axisHalfWidth;
      y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
      y2 = chartArea.bottom;
    } else if (position === 'bottom') {
      borderValue = alignBorderValue(this.top);
      y1 = chartArea.top;
      y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
      ty1 = borderValue + axisHalfWidth;
      ty2 = this.top + tl;
    } else if (position === 'left') {
      borderValue = alignBorderValue(this.right);
      tx1 = this.right - tl;
      tx2 = borderValue - axisHalfWidth;
      x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
      x2 = chartArea.right;
    } else if (position === 'right') {
      borderValue = alignBorderValue(this.left);
      x1 = chartArea.left;
      x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
      tx1 = borderValue + axisHalfWidth;
      tx2 = this.left + tl;
    } else if (axis === 'x') {
      if (position === 'center') {
        borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
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
        borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
      }

      tx1 = borderValue - axisHalfWidth;
      tx2 = tx1 - tl;
      x1 = chartArea.left;
      x2 = chartArea.right;
    }

    const limit = valueOrDefault(options.ticks.maxTicksLimit, ticksLength);
    const step = Math.max(1, Math.ceil(ticksLength / limit));
    for (i = 0; i < ticksLength; i += step) {
      const optsAtIndex = grid.setContext(this.getContext(i));

      const lineWidth = optsAtIndex.lineWidth;
      const lineColor = optsAtIndex.color;
      const borderDash = grid.borderDash || [];
      const borderDashOffset = optsAtIndex.borderDashOffset;

      const tickWidth = optsAtIndex.tickWidth;
      const tickColor = optsAtIndex.tickColor;
      const tickBorderDash = optsAtIndex.tickBorderDash || [];
      const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;

      lineValue = getPixelForGridLine(this, i, offset);

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

    this._ticksLength = ticksLength;
    this._borderValue = borderValue;

    return items;
  }

  /**
	 * @private
	 */
  _computeLabelItems(chartArea) {
    const axis = this.axis;
    const options = this.options;
    const {position, ticks: optionTicks} = options;
    const isHorizontal = this.isHorizontal();
    const ticks = this.ticks;
    const {align, crossAlign, padding, mirror} = optionTicks;
    const tl = getTickMarkLength(options.grid);
    const tickAndPadding = tl + padding;
    const hTickAndPadding = mirror ? -padding : tickAndPadding;
    const rotation = -toRadians(this.labelRotation);
    const items = [];
    let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
    let textBaseline = 'middle';

    if (position === 'top') {
      y = this.bottom - hTickAndPadding;
      textAlign = this._getXAxisLabelAlignment();
    } else if (position === 'bottom') {
      y = this.top + hTickAndPadding;
      textAlign = this._getXAxisLabelAlignment();
    } else if (position === 'left') {
      const ret = this._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x = ret.x;
    } else if (position === 'right') {
      const ret = this._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x = ret.x;
    } else if (axis === 'x') {
      if (position === 'center') {
        y = ((chartArea.top + chartArea.bottom) / 2) + tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        y = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
      }
      textAlign = this._getXAxisLabelAlignment();
    } else if (axis === 'y') {
      if (position === 'center') {
        x = ((chartArea.left + chartArea.right) / 2) - tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        x = this.chart.scales[positionAxisID].getPixelForValue(value);
      }
      textAlign = this._getYAxisLabelAlignment(tl).textAlign;
    }

    if (axis === 'y') {
      if (align === 'start') {
        textBaseline = 'top';
      } else if (align === 'end') {
        textBaseline = 'bottom';
      }
    }

    const labelSizes = this._getLabelSizes();
    for (i = 0, ilen = ticks.length; i < ilen; ++i) {
      tick = ticks[i];
      label = tick.label;

      const optsAtIndex = optionTicks.setContext(this.getContext(i));
      pixel = this.getPixelForTick(i) + optionTicks.labelOffset;
      font = this._resolveTickFontOptions(i);
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
    const {position, ticks} = this.options;
    const rotation = -toRadians(this.labelRotation);

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
    const {position, ticks: {crossAlign, mirror, padding}} = this.options;
    const labelSizes = this._getLabelSizes();
    const tickAndPadding = tl + padding;
    const widest = labelSizes.widest.width;

    let textAlign;
    let x;

    if (position === 'left') {
      if (mirror) {
        x = this.right + padding;

        if (crossAlign === 'near') {
          textAlign = 'left';
        } else if (crossAlign === 'center') {
          textAlign = 'center';
          x += (widest / 2);
        } else {
          textAlign = 'right';
          x += widest;
        }
      } else {
        x = this.right - tickAndPadding;

        if (crossAlign === 'near') {
          textAlign = 'right';
        } else if (crossAlign === 'center') {
          textAlign = 'center';
          x -= (widest / 2);
        } else {
          textAlign = 'left';
          x = this.left;
        }
      }
    } else if (position === 'right') {
      if (mirror) {
        x = this.left + padding;

        if (crossAlign === 'near') {
          textAlign = 'right';
        } else if (crossAlign === 'center') {
          textAlign = 'center';
          x -= (widest / 2);
        } else {
          textAlign = 'left';
          x -= widest;
        }
      } else {
        x = this.left + tickAndPadding;

        if (crossAlign === 'near') {
          textAlign = 'left';
        } else if (crossAlign === 'center') {
          textAlign = 'center';
          x += widest / 2;
        } else {
          textAlign = 'right';
          x = this.right;
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
    if (this.options.ticks.mirror) {
      return;
    }

    const chart = this.chart;
    const position = this.options.position;

    if (position === 'left' || position === 'right') {
      return {top: 0, left: this.left, bottom: chart.height, right: this.right};
    } if (position === 'top' || position === 'bottom') {
      return {top: this.top, left: 0, bottom: this.bottom, right: chart.width};
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
    const grid = this.options.grid;
    if (!this._isVisible() || !grid.display) {
      return 0;
    }
    const ticks = this.ticks;
    const index = ticks.findIndex(t => t.value === value);
    if (index >= 0) {
      const opts = grid.setContext(this.getContext(index));
      return opts.lineWidth;
    }
    return 0;
  }

  /**
	 * @protected
	 */
  drawGrid(chartArea) {
    const grid = this.options.grid;
    const ctx = this.ctx;
    const items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea));
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
    const {chart, ctx, options: {grid}} = this;
    const borderOpts = grid.setContext(this.getContext());
    const axisWidth = grid.drawBorder ? borderOpts.borderWidth : 0;
    if (!axisWidth) {
      return;
    }
    const lastLineWidth = grid.setContext(this.getContext(0)).lineWidth;
    const borderValue = this._borderValue;
    let x1, x2, y1, y2;

    if (this.isHorizontal()) {
      x1 = _alignPixel(chart, this.left, axisWidth) - axisWidth / 2;
      x2 = _alignPixel(chart, this.right, lastLineWidth) + lastLineWidth / 2;
      y1 = y2 = borderValue;
    } else {
      y1 = _alignPixel(chart, this.top, axisWidth) - axisWidth / 2;
      y2 = _alignPixel(chart, this.bottom, lastLineWidth) + lastLineWidth / 2;
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
    const optionTicks = this.options.ticks;

    if (!optionTicks.display) {
      return;
    }

    const ctx = this.ctx;

    const area = this._computeLabelArea();
    if (area) {
      clipArea(ctx, area);
    }

    const items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea));
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

    if (position === 'bottom' || position === 'center' || isObject(position)) {
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
    if (!this._isVisible()) {
      return;
    }

    this.drawBackground();
    this.drawGrid(chartArea);
    this.drawBorder();
    this.drawTitle();
    this.drawLabels(chartArea);
  }

  /**
	 * @return {object[]}
	 * @private
	 */
  _layers() {
    const opts = this.options;
    const tz = opts.ticks && opts.ticks.z || 0;
    const gz = valueOrDefault(opts.grid && opts.grid.z, -1);

    if (!this._isVisible() || this.draw !== Scale.prototype.draw) {
      // backward compatibility: draw has been overridden by custom scale
      return [{
        z: tz,
        draw: (chartArea) => {
          this.draw(chartArea);
        }
      }];
    }

    return [{
      z: gz,
      draw: (chartArea) => {
        this.drawBackground();
        this.drawGrid(chartArea);
        this.drawTitle();
      }
    }, {
      z: gz + 1, // TODO, v4 move border options to its own object and add z
      draw: () => {
        this.drawBorder();
      }
    }, {
      z: tz,
      draw: (chartArea) => {
        this.drawLabels(chartArea);
      }
    }];
  }

  /**
	 * Returns visible dataset metas that are attached to this scale
	 * @param {string} [type] - if specified, also filter by dataset type
	 * @return {object[]}
	 */
  getMatchingVisibleMetas(type) {
    const metas = this.chart.getSortedVisibleDatasetMetas();
    const axisID = this.axis + 'AxisID';
    const result = [];
    let i, ilen;

    for (i = 0, ilen = metas.length; i < ilen; ++i) {
      const meta = metas[i];
      if (meta[axisID] === this.id && (!type || meta.type === type)) {
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
    const fontSize = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / fontSize;
  }
}
