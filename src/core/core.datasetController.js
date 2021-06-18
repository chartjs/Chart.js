import Animations from './core.animations';
import defaults from './core.defaults';
import {isArray, isFinite, isObject, valueOrDefault, resolveObjectKey, defined} from '../helpers/helpers.core';
import {listenArrayEvents, unlistenArrayEvents} from '../helpers/helpers.collection';
import {sign} from '../helpers/helpers.math';

/**
 * @typedef { import("./core.controller").default } Chart
 * @typedef { import("./core.scale").default } Scale
 */

function scaleClip(scale, allowedOverflow) {
  const opts = scale && scale.options || {};
  const reverse = opts.reverse;
  const min = opts.min === undefined ? allowedOverflow : 0;
  const max = opts.max === undefined ? allowedOverflow : 0;
  return {
    start: reverse ? max : min,
    end: reverse ? min : max
  };
}

function defaultClip(xScale, yScale, allowedOverflow) {
  if (allowedOverflow === false) {
    return false;
  }
  const x = scaleClip(xScale, allowedOverflow);
  const y = scaleClip(yScale, allowedOverflow);

  return {
    top: y.end,
    right: x.end,
    bottom: y.start,
    left: x.start
  };
}

function toClip(value) {
  let t, r, b, l;

  if (isObject(value)) {
    t = value.top;
    r = value.right;
    b = value.bottom;
    l = value.left;
  } else {
    t = r = b = l = value;
  }

  return {
    top: t,
    right: r,
    bottom: b,
    left: l,
    disabled: value === false
  };
}

function getSortedDatasetIndices(chart, filterVisible) {
  const keys = [];
  const metasets = chart._getSortedDatasetMetas(filterVisible);
  let i, ilen;

  for (i = 0, ilen = metasets.length; i < ilen; ++i) {
    keys.push(metasets[i].index);
  }
  return keys;
}

function applyStack(stack, value, dsIndex, options) {
  const keys = stack.keys;
  const singleMode = options.mode === 'single';
  let i, ilen, datasetIndex, otherValue;

  if (value === null) {
    return;
  }

  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    datasetIndex = +keys[i];
    if (datasetIndex === dsIndex) {
      if (options.all) {
        continue;
      }
      break;
    }
    otherValue = stack.values[datasetIndex];
    if (isFinite(otherValue) && (singleMode || (value === 0 || sign(value) === sign(otherValue)))) {
      value += otherValue;
    }
  }
  return value;
}

function convertObjectDataToArray(data) {
  const keys = Object.keys(data);
  const adata = new Array(keys.length);
  let i, ilen, key;
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    key = keys[i];
    adata[i] = {
      x: key,
      y: data[key]
    };
  }
  return adata;
}

function isStacked(scale, meta) {
  const stacked = scale && scale.options.stacked;
  return stacked || (stacked === undefined && meta.stack !== undefined);
}

function getStackKey(indexScale, valueScale, meta) {
  return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`;
}

function getUserBounds(scale) {
  const {min, max, minDefined, maxDefined} = scale.getUserBounds();
  return {
    min: minDefined ? min : Number.NEGATIVE_INFINITY,
    max: maxDefined ? max : Number.POSITIVE_INFINITY
  };
}

function getOrCreateStack(stacks, stackKey, indexValue) {
  const subStack = stacks[stackKey] || (stacks[stackKey] = {});
  return subStack[indexValue] || (subStack[indexValue] = {});
}

function getLastIndexInStack(stack, vScale, positive) {
  for (const meta of vScale.getMatchingVisibleMetas('bar').reverse()) {
    const value = stack[meta.index];
    if ((positive && value > 0) || (!positive && value < 0)) {
      return meta.index;
    }
  }

  return null;
}

function updateStacks(controller, parsed) {
  const {chart, _cachedMeta: meta} = controller;
  const stacks = chart._stacks || (chart._stacks = {}); // map structure is {stackKey: {datasetIndex: value}}
  const {iScale, vScale, index: datasetIndex} = meta;
  const iAxis = iScale.axis;
  const vAxis = vScale.axis;
  const key = getStackKey(iScale, vScale, meta);
  const ilen = parsed.length;
  let stack;

  for (let i = 0; i < ilen; ++i) {
    const item = parsed[i];
    const {[iAxis]: index, [vAxis]: value} = item;
    const itemStacks = item._stacks || (item._stacks = {});
    stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index);
    stack[datasetIndex] = value;

    stack._top = getLastIndexInStack(stack, vScale, true);
    stack._bottom = getLastIndexInStack(stack, vScale, false);
  }
}

function getFirstScaleId(chart, axis) {
  const scales = chart.scales;
  return Object.keys(scales).filter(key => scales[key].axis === axis).shift();
}

function createDatasetContext(parent, index) {
  return Object.assign(Object.create(parent),
    {
      active: false,
      dataset: undefined,
      datasetIndex: index,
      index,
      mode: 'default',
      type: 'dataset'
    }
  );
}

function createDataContext(parent, index, element) {
  return Object.assign(Object.create(parent), {
    active: false,
    dataIndex: index,
    parsed: undefined,
    raw: undefined,
    element,
    index,
    mode: 'default',
    type: 'data'
  });
}

function clearStacks(meta, items) {
  const axis = meta.vScale && meta.vScale.axis;
  if (!axis) {
    return;
  }

  items = items || meta._parsed;
  for (const parsed of items) {
    const stacks = parsed._stacks;
    if (!stacks || stacks[axis] === undefined || stacks[axis][meta.index] === undefined) {
      return;
    }
    delete stacks[axis][meta.index];
  }
}

const isDirectUpdateMode = (mode) => mode === 'reset' || mode === 'none';
const cloneIfNotShared = (cached, shared) => shared ? cached : Object.assign({}, cached);

export default class DatasetController {

  /**
	 * @param {Chart} chart
	 * @param {number} datasetIndex
	 */
  constructor(chart, datasetIndex) {
    this.chart = chart;
    this._ctx = chart.ctx;
    this.index = datasetIndex;
    this._cachedDataOpts = {};
    this._cachedMeta = this.getMeta();
    this._type = this._cachedMeta.type;
    this.options = undefined;
    /** @type {boolean | object} */
    this._parsing = false;
    this._data = undefined;
    this._objectData = undefined;
    this._sharedOptions = undefined;
    this._drawStart = undefined;
    this._drawCount = undefined;
    this.enableOptionSharing = false;
    this.$context = undefined;
    this._syncList = [];

    this.initialize();
  }

  initialize() {
    const me = this;
    const meta = me._cachedMeta;
    me.configure();
    me.linkScales();
    meta._stacked = isStacked(meta.vScale, meta);
    me.addElements();
  }

  updateIndex(datasetIndex) {
    if (this.index !== datasetIndex) {
      clearStacks(this._cachedMeta);
    }
    this.index = datasetIndex;
  }

  linkScales() {
    const me = this;
    const chart = me.chart;
    const meta = me._cachedMeta;
    const dataset = me.getDataset();

    const chooseId = (axis, x, y, r) => axis === 'x' ? x : axis === 'r' ? r : y;

    const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart, 'x'));
    const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart, 'y'));
    const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart, 'r'));
    const indexAxis = meta.indexAxis;
    const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
    const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
    meta.xScale = me.getScaleForId(xid);
    meta.yScale = me.getScaleForId(yid);
    meta.rScale = me.getScaleForId(rid);
    meta.iScale = me.getScaleForId(iid);
    meta.vScale = me.getScaleForId(vid);
  }

  getDataset() {
    return this.chart.data.datasets[this.index];
  }

  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }

  /**
	 * @param {string} scaleID
	 * @return {Scale}
	 */
  getScaleForId(scaleID) {
    return this.chart.scales[scaleID];
  }

  /**
	 * @private
	 */
  _getOtherScale(scale) {
    const meta = this._cachedMeta;
    return scale === meta.iScale
      ? meta.vScale
      : meta.iScale;
  }

  reset() {
    this._update('reset');
  }

  /**
	 * @private
	 */
  _destroy() {
    const meta = this._cachedMeta;
    if (this._data) {
      unlistenArrayEvents(this._data, this);
    }
    if (meta._stacked) {
      clearStacks(meta);
    }
  }

  /**
	 * @private
	 */
  _dataCheck() {
    const me = this;
    const dataset = me.getDataset();
    const data = dataset.data || (dataset.data = []);
    const _data = me._data;

    // In order to correctly handle data addition/deletion animation (an thus simulate
    // real-time charts), we need to monitor these data modifications and synchronize
    // the internal meta data accordingly.

    if (isObject(data)) {
      me._data = convertObjectDataToArray(data);
    } else if (_data !== data) {
      if (_data) {
        // This case happens when the user replaced the data array instance.
        unlistenArrayEvents(_data, me);
        // Discard old parsed data and stacks
        const meta = me._cachedMeta;
        clearStacks(meta);
        meta._parsed = [];
      }
      if (data && Object.isExtensible(data)) {
        listenArrayEvents(data, me);
      }
      me._syncList = [];
      me._data = data;
    }
  }

  addElements() {
    const me = this;
    const meta = me._cachedMeta;

    me._dataCheck();

    if (me.datasetElementType) {
      meta.dataset = new me.datasetElementType();
    }
  }

  buildOrUpdateElements(resetNewElements) {
    const me = this;
    const meta = me._cachedMeta;
    const dataset = me.getDataset();
    let stackChanged = false;

    me._dataCheck();

    // make sure cached _stacked status is current
    const oldStacked = meta._stacked;
    meta._stacked = isStacked(meta.vScale, meta);

    // detect change in stack option
    if (meta.stack !== dataset.stack) {
      stackChanged = true;
      // remove values from old stack
      clearStacks(meta);
      meta.stack = dataset.stack;
    }

    // Re-sync meta data in case the user replaced the data array or if we missed
    // any updates and so make sure that we handle number of datapoints changing.
    me._resyncElements(resetNewElements);

    // if stack changed, update stack values for the whole dataset
    if (stackChanged || oldStacked !== meta._stacked) {
      updateStacks(me, meta._parsed);
    }
  }

  /**
	 * Merges user-supplied and default dataset-level options
	 * @private
	 */
  configure() {
    const me = this;
    const config = me.chart.config;
    const scopeKeys = config.datasetScopeKeys(me._type);
    const scopes = config.getOptionScopes(me.getDataset(), scopeKeys, true);
    me.options = config.createResolver(scopes, me.getContext());
    me._parsing = me.options.parsing;
  }

  /**
	 * @param {number} start
	 * @param {number} count
	 */
  parse(start, count) {
    const me = this;
    const {_cachedMeta: meta, _data: data} = me;
    const {iScale, _stacked} = meta;
    const iAxis = iScale.axis;

    let sorted = start === 0 && count === data.length ? true : meta._sorted;
    let prev = start > 0 && meta._parsed[start - 1];
    let i, cur, parsed;

    if (me._parsing === false) {
      meta._parsed = data;
      meta._sorted = true;
      parsed = data;
    } else {
      if (isArray(data[start])) {
        parsed = me.parseArrayData(meta, data, start, count);
      } else if (isObject(data[start])) {
        parsed = me.parseObjectData(meta, data, start, count);
      } else {
        parsed = me.parsePrimitiveData(meta, data, start, count);
      }

      const isNotInOrderComparedToPrev = () => cur[iAxis] === null || (prev && cur[iAxis] < prev[iAxis]);
      for (i = 0; i < count; ++i) {
        meta._parsed[i + start] = cur = parsed[i];
        if (sorted) {
          if (isNotInOrderComparedToPrev()) {
            sorted = false;
          }
          prev = cur;
        }
      }
      meta._sorted = sorted;
    }

    if (_stacked) {
      updateStacks(me, parsed);
    }
  }

  /**
	 * Parse array of primitive values
	 * @param {object} meta - dataset meta
	 * @param {array} data - data array. Example [1,3,4]
	 * @param {number} start - start index
	 * @param {number} count - number of items to parse
	 * @returns {object} parsed item - item containing index and a parsed value
	 * for each scale id.
	 * Example: {xScale0: 0, yScale0: 1}
	 * @protected
	 */
  parsePrimitiveData(meta, data, start, count) {
    const {iScale, vScale} = meta;
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const labels = iScale.getLabels();
    const singleScale = iScale === vScale;
    const parsed = new Array(count);
    let i, ilen, index;

    for (i = 0, ilen = count; i < ilen; ++i) {
      index = i + start;
      parsed[i] = {
        [iAxis]: singleScale || iScale.parse(labels[index], index),
        [vAxis]: vScale.parse(data[index], index)
      };
    }
    return parsed;
  }

  /**
	 * Parse array of arrays
	 * @param {object} meta - dataset meta
	 * @param {array} data - data array. Example [[1,2],[3,4]]
	 * @param {number} start - start index
	 * @param {number} count - number of items to parse
	 * @returns {object} parsed item - item containing index and a parsed value
	 * for each scale id.
	 * Example: {x: 0, y: 1}
	 * @protected
	 */
  parseArrayData(meta, data, start, count) {
    const {xScale, yScale} = meta;
    const parsed = new Array(count);
    let i, ilen, index, item;

    for (i = 0, ilen = count; i < ilen; ++i) {
      index = i + start;
      item = data[index];
      parsed[i] = {
        x: xScale.parse(item[0], index),
        y: yScale.parse(item[1], index)
      };
    }
    return parsed;
  }

  /**
	 * Parse array of objects
	 * @param {object} meta - dataset meta
	 * @param {array} data - data array. Example [{x:1, y:5}, {x:2, y:10}]
	 * @param {number} start - start index
	 * @param {number} count - number of items to parse
	 * @returns {object} parsed item - item containing index and a parsed value
	 * for each scale id. _custom is optional
	 * Example: {xScale0: 0, yScale0: 1, _custom: {r: 10, foo: 'bar'}}
	 * @protected
	 */
  parseObjectData(meta, data, start, count) {
    const {xScale, yScale} = meta;
    const {xAxisKey = 'x', yAxisKey = 'y'} = this._parsing;
    const parsed = new Array(count);
    let i, ilen, index, item;

    for (i = 0, ilen = count; i < ilen; ++i) {
      index = i + start;
      item = data[index];
      parsed[i] = {
        x: xScale.parse(resolveObjectKey(item, xAxisKey), index),
        y: yScale.parse(resolveObjectKey(item, yAxisKey), index)
      };
    }
    return parsed;
  }

  /**
	 * @protected
	 */
  getParsed(index) {
    return this._cachedMeta._parsed[index];
  }

  /**
	 * @protected
	 */
  getDataElement(index) {
    return this._cachedMeta.data[index];
  }

  /**
	 * @protected
	 */
  applyStack(scale, parsed, mode) {
    const chart = this.chart;
    const meta = this._cachedMeta;
    const value = parsed[scale.axis];
    const stack = {
      keys: getSortedDatasetIndices(chart, true),
      values: parsed._stacks[scale.axis]
    };
    return applyStack(stack, value, meta.index, {mode});
  }

  /**
	 * @protected
	 */
  updateRangeFromParsed(range, scale, parsed, stack) {
    const parsedValue = parsed[scale.axis];
    let value = parsedValue === null ? NaN : parsedValue;
    const values = stack && parsed._stacks[scale.axis];
    if (stack && values) {
      stack.values = values;
      // Need to consider individual stack values for data range,
      // in addition to the stacked value
      range.min = Math.min(range.min, value);
      range.max = Math.max(range.max, value);
      value = applyStack(stack, parsedValue, this._cachedMeta.index, {all: true});
    }
    range.min = Math.min(range.min, value);
    range.max = Math.max(range.max, value);
  }

  /**
	 * @protected
	 */
  getMinMax(scale, canStack) {
    const me = this;
    const meta = me._cachedMeta;
    const _parsed = meta._parsed;
    const sorted = meta._sorted && scale === meta.iScale;
    const ilen = _parsed.length;
    const otherScale = me._getOtherScale(scale);
    const stack = canStack && meta._stacked && {keys: getSortedDatasetIndices(me.chart, true), values: null};
    const range = {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY};
    const {min: otherMin, max: otherMax} = getUserBounds(otherScale);
    let i, value, parsed, otherValue;

    function _skip() {
      parsed = _parsed[i];
      value = parsed[scale.axis];
      otherValue = parsed[otherScale.axis];
      return !isFinite(value) || otherMin > otherValue || otherMax < otherValue;
    }

    for (i = 0; i < ilen; ++i) {
      if (_skip()) {
        continue;
      }
      me.updateRangeFromParsed(range, scale, parsed, stack);
      if (sorted) {
        // if the data is sorted, we don't need to check further from this end of array
        break;
      }
    }
    if (sorted) {
      // in the sorted case, find first non-skipped value from other end of array
      for (i = ilen - 1; i >= 0; --i) {
        if (_skip()) {
          continue;
        }
        me.updateRangeFromParsed(range, scale, parsed, stack);
        break;
      }
    }
    return range;
  }

  getAllParsedValues(scale) {
    const parsed = this._cachedMeta._parsed;
    const values = [];
    let i, ilen, value;

    for (i = 0, ilen = parsed.length; i < ilen; ++i) {
      value = parsed[i][scale.axis];
      if (isFinite(value)) {
        values.push(value);
      }
    }
    return values;
  }

  /**
	 * @return {number|boolean}
	 * @protected
	 */
  getMaxOverflow() {
    return false;
  }

  /**
	 * @protected
	 */
  getLabelAndValue(index) {
    const me = this;
    const meta = me._cachedMeta;
    const iScale = meta.iScale;
    const vScale = meta.vScale;
    const parsed = me.getParsed(index);
    return {
      label: iScale ? '' + iScale.getLabelForValue(parsed[iScale.axis]) : '',
      value: vScale ? '' + vScale.getLabelForValue(parsed[vScale.axis]) : ''
    };
  }

  /**
	 * @private
	 */
  _update(mode) {
    const me = this;
    const meta = me._cachedMeta;
    me.configure();
    me._cachedDataOpts = {};
    me.update(mode || 'default');
    meta._clip = toClip(valueOrDefault(me.options.clip, defaultClip(meta.xScale, meta.yScale, me.getMaxOverflow())));
  }

  /**
	 * @param {string} mode
	 */
  update(mode) {} // eslint-disable-line no-unused-vars

  draw() {
    const me = this;
    const ctx = me._ctx;
    const chart = me.chart;
    const meta = me._cachedMeta;
    const elements = meta.data || [];
    const area = chart.chartArea;
    const active = [];
    const start = me._drawStart || 0;
    const count = me._drawCount || (elements.length - start);
    let i;

    if (meta.dataset) {
      meta.dataset.draw(ctx, area, start, count);
    }

    for (i = start; i < start + count; ++i) {
      const element = elements[i];
      if (element.active) {
        active.push(element);
      } else {
        element.draw(ctx, area);
      }
    }

    for (i = 0; i < active.length; ++i) {
      active[i].draw(ctx, area);
    }
  }

  /**
	 * Returns a set of predefined style properties that should be used to represent the dataset
	 * or the data if the index is specified
	 * @param {number} index - data index
	 * @param {boolean} [active] - true if hover
	 * @return {object} style object
	 */
  getStyle(index, active) {
    const mode = active ? 'active' : 'default';
    return index === undefined && this._cachedMeta.dataset
      ? this.resolveDatasetElementOptions(mode)
      : this.resolveDataElementOptions(index || 0, mode);
  }

  /**
	 * @protected
	 */
  getContext(index, active, mode) {
    const me = this;
    const dataset = me.getDataset();
    let context;
    if (index >= 0 && index < me._cachedMeta.data.length) {
      const element = me._cachedMeta.data[index];
      context = element.$context ||
        (element.$context = createDataContext(me.getContext(), index, element));
      context.parsed = me.getParsed(index);
      context.raw = dataset.data[index];
      context.index = context.dataIndex = index;
    } else {
      context = me.$context ||
        (me.$context = createDatasetContext(me.chart.getContext(), me.index));
      context.dataset = dataset;
      context.index = context.datasetIndex = me.index;
    }

    context.active = !!active;
    context.mode = mode;
    return context;
  }

  /**
	 * @param {string} [mode]
	 * @protected
	 */
  resolveDatasetElementOptions(mode) {
    return this._resolveElementOptions(this.datasetElementType.id, mode);
  }

  /**
	 * @param {number} index
	 * @param {string} [mode]
	 * @protected
	 */
  resolveDataElementOptions(index, mode) {
    return this._resolveElementOptions(this.dataElementType.id, mode, index);
  }

  /**
	 * @private
	 */
  _resolveElementOptions(elementType, mode = 'default', index) {
    const me = this;
    const active = mode === 'active';
    const cache = me._cachedDataOpts;
    const cacheKey = elementType + '-' + mode;
    const cached = cache[cacheKey];
    const sharing = me.enableOptionSharing && defined(index);
    if (cached) {
      return cloneIfNotShared(cached, sharing);
    }
    const config = me.chart.config;
    const scopeKeys = config.datasetElementScopeKeys(me._type, elementType);
    const prefixes = active ? [`${elementType}Hover`, 'hover', elementType, ''] : [elementType, ''];
    const scopes = config.getOptionScopes(me.getDataset(), scopeKeys);
    const names = Object.keys(defaults.elements[elementType]);
    // context is provided as a function, and is called only if needed,
    // so we don't create a context for each element if not needed.
    const context = () => me.getContext(index, active);
    const values = config.resolveNamedOptions(scopes, names, context, prefixes);

    if (values.$shared) {
      // `$shared` indicates this set of options can be shared between multiple elements.
      // Sharing is used to reduce number of properties to change during animation.
      values.$shared = sharing;

      // We cache options by `mode`, which can be 'active' for example. This enables us
      // to have the 'active' element options and 'default' options to switch between
      // when interacting.
      cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
    }

    return values;
  }


  /**
	 * @private
	 */
  _resolveAnimations(index, transition, active) {
    const me = this;
    const chart = me.chart;
    const cache = me._cachedDataOpts;
    const cacheKey = `animation-${transition}`;
    const cached = cache[cacheKey];
    if (cached) {
      return cached;
    }
    let options;
    if (chart.options.animation !== false) {
      const config = me.chart.config;
      const scopeKeys = config.datasetAnimationScopeKeys(me._type, transition);
      const scopes = config.getOptionScopes(me.getDataset(), scopeKeys);
      options = config.createResolver(scopes, me.getContext(index, active, transition));
    }
    const animations = new Animations(chart, options && options.animations);
    if (options && options._cacheable) {
      cache[cacheKey] = Object.freeze(animations);
    }
    return animations;
  }

  /**
	 * Utility for getting the options object shared between elements
	 * @protected
	 */
  getSharedOptions(options) {
    if (!options.$shared) {
      return;
    }
    return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
  }

  /**
	 * Utility for determining if `options` should be included in the updated properties
	 * @protected
	 */
  includeOptions(mode, sharedOptions) {
    return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
  }

  /**
	 * Utility for updating an element with new properties, using animations when appropriate.
	 * @protected
	 */
  updateElement(element, index, properties, mode) {
    if (isDirectUpdateMode(mode)) {
      Object.assign(element, properties);
    } else {
      this._resolveAnimations(index, mode).update(element, properties);
    }
  }

  /**
	 * Utility to animate the shared options, that are potentially affecting multiple elements.
	 * @protected
	 */
  updateSharedOptions(sharedOptions, mode, newOptions) {
    if (sharedOptions && !isDirectUpdateMode(mode)) {
      this._resolveAnimations(undefined, mode).update(sharedOptions, newOptions);
    }
  }

  /**
	 * @private
	 */
  _setStyle(element, index, mode, active) {
    element.active = active;
    const options = this.getStyle(index, active);
    this._resolveAnimations(index, mode, active).update(element, {
      // When going from active to inactive, we need to update to the shared options.
      // This way the once hovered element will end up with the same original shared options instance, after animation.
      options: (!active && this.getSharedOptions(options)) || options
    });
  }

  removeHoverStyle(element, datasetIndex, index) {
    this._setStyle(element, index, 'active', false);
  }

  setHoverStyle(element, datasetIndex, index) {
    this._setStyle(element, index, 'active', true);
  }

  /**
	 * @private
	 */
  _removeDatasetHoverStyle() {
    const element = this._cachedMeta.dataset;

    if (element) {
      this._setStyle(element, undefined, 'active', false);
    }
  }

  /**
	 * @private
	 */
  _setDatasetHoverStyle() {
    const element = this._cachedMeta.dataset;

    if (element) {
      this._setStyle(element, undefined, 'active', true);
    }
  }

  /**
	 * @private
	 */
  _resyncElements(resetNewElements) {
    const me = this;
    const data = me._data;
    const elements = me._cachedMeta.data;

    // Apply changes detected through array listeners
    for (const [method, arg1, arg2] of me._syncList) {
      me[method](arg1, arg2);
    }
    me._syncList = [];

    const numMeta = elements.length;
    const numData = data.length;
    const count = Math.min(numData, numMeta);

    if (count) {
      // TODO: It is not optimal to always parse the old data
      // This is done because we are not detecting direct assignments:
      // chart.data.datasets[0].data[5] = 10;
      // chart.data.datasets[0].data[5].y = 10;
      me.parse(0, count);
    }

    if (numData > numMeta) {
      me._insertElements(numMeta, numData - numMeta, resetNewElements);
    } else if (numData < numMeta) {
      me._removeElements(numData, numMeta - numData);
    }
  }

  /**
	 * @private
	 */
  _insertElements(start, count, resetNewElements = true) {
    const me = this;
    const meta = me._cachedMeta;
    const data = meta.data;
    const end = start + count;
    let i;

    const move = (arr) => {
      arr.length += count;
      for (i = arr.length - 1; i >= end; i--) {
        arr[i] = arr[i - count];
      }
    };
    move(data);

    for (i = start; i < end; ++i) {
      data[i] = new me.dataElementType();
    }

    if (me._parsing) {
      move(meta._parsed);
    }
    me.parse(start, count);

    if (resetNewElements) {
      me.updateElements(data, start, count, 'reset');
    }
  }

  updateElements(element, start, count, mode) {} // eslint-disable-line no-unused-vars

  /**
	 * @private
	 */
  _removeElements(start, count) {
    const me = this;
    const meta = me._cachedMeta;
    if (me._parsing) {
      const removed = meta._parsed.splice(start, count);
      if (meta._stacked) {
        clearStacks(meta, removed);
      }
    }
    meta.data.splice(start, count);
  }


  /**
	 * @private
	 */
  _onDataPush() {
    const count = arguments.length;
    this._syncList.push(['_insertElements', this.getDataset().data.length - count, count]);
  }

  /**
	 * @private
	 */
  _onDataPop() {
    this._syncList.push(['_removeElements', this._cachedMeta.data.length - 1, 1]);
  }

  /**
	 * @private
	 */
  _onDataShift() {
    this._syncList.push(['_removeElements', 0, 1]);
  }

  /**
	 * @private
	 */
  _onDataSplice(start, count) {
    this._syncList.push(['_removeElements', start, count]);
    this._syncList.push(['_insertElements', start, arguments.length - 2]);
  }

  /**
	 * @private
	 */
  _onDataUnshift() {
    this._syncList.push(['_insertElements', 0, arguments.length]);
  }
}

/**
 * @type {any}
 */
DatasetController.defaults = {};

/**
 * Element type used to generate a meta dataset (e.g. Chart.element.LineElement).
 */
DatasetController.prototype.datasetElementType = null;

/**
 * Element type used to generate a meta data (e.g. Chart.element.PointElement).
 */
DatasetController.prototype.dataElementType = null;
