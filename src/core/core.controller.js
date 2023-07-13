import animator from './core.animator.js';
import defaults, {overrides} from './core.defaults.js';
import Interaction from './core.interaction.js';
import layouts from './core.layouts.js';
import {_detectPlatform} from '../platform/index.js';
import PluginService from './core.plugins.js';
import registry from './core.registry.js';
import Config, {determineAxis, getIndexAxis} from './core.config.js';
import {retinaScale, _isDomSupported} from '../helpers/helpers.dom.js';
import {each, callback as callCallback, uid, valueOrDefault, _elementsEqual, isNullOrUndef, setsEqual, defined, isFunction, _isClickEvent} from '../helpers/helpers.core.js';
import {clearCanvas, clipArea, createContext, unclipArea, _isPointInArea} from '../helpers/index.js';
// @ts-ignore
import {version} from '../../package.json';
import {debounce} from '../helpers/helpers.extras.js';

/**
 * @typedef { import('../types/index.js').ChartEvent } ChartEvent
 * @typedef { import('../types/index.js').Point } Point
 */

const KNOWN_POSITIONS = ['top', 'bottom', 'left', 'right', 'chartArea'];
function positionIsHorizontal(position, axis) {
  return position === 'top' || position === 'bottom' || (KNOWN_POSITIONS.indexOf(position) === -1 && axis === 'x');
}

function compare2Level(l1, l2) {
  return function(a, b) {
    return a[l1] === b[l1]
      ? a[l2] - b[l2]
      : a[l1] - b[l1];
  };
}

function onAnimationsComplete(context) {
  const chart = context.chart;
  const animationOptions = chart.options.animation;

  chart.notifyPlugins('afterRender');
  callCallback(animationOptions && animationOptions.onComplete, [context], chart);
}

function onAnimationProgress(context) {
  const chart = context.chart;
  const animationOptions = chart.options.animation;
  callCallback(animationOptions && animationOptions.onProgress, [context], chart);
}

/**
 * Chart.js can take a string id of a canvas element, a 2d context, or a canvas element itself.
 * Attempt to unwrap the item passed into the chart constructor so that it is a canvas element (if possible).
 */
function getCanvas(item) {
  if (_isDomSupported() && typeof item === 'string') {
    item = document.getElementById(item);
  } else if (item && item.length) {
    // Support for array based queries (such as jQuery)
    item = item[0];
  }

  if (item && item.canvas) {
    // Support for any object associated to a canvas (including a context2d)
    item = item.canvas;
  }
  return item;
}

const instances = {};
const getChart = (key) => {
  const canvas = getCanvas(key);
  return Object.values(instances).filter((c) => c.canvas === canvas).pop();
};

function moveNumericKeys(obj, start, move) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const intKey = +key;
    if (intKey >= start) {
      const value = obj[key];
      delete obj[key];
      if (move > 0 || intKey > start) {
        obj[intKey + move] = value;
      }
    }
  }
}

/**
 * @param {ChartEvent} e
 * @param {ChartEvent|null} lastEvent
 * @param {boolean} inChartArea
 * @param {boolean} isClick
 * @returns {ChartEvent|null}
 */
function determineLastEvent(e, lastEvent, inChartArea, isClick) {
  if (!inChartArea || e.type === 'mouseout') {
    return null;
  }
  if (isClick) {
    return lastEvent;
  }
  return e;
}

function getSizeForArea(scale, chartArea, field) {
  return scale.options.clip ? scale[field] : chartArea[field];
}

function getDatasetArea(meta, chartArea) {
  const {xScale, yScale} = meta;
  if (xScale && yScale) {
    return {
      left: getSizeForArea(xScale, chartArea, 'left'),
      right: getSizeForArea(xScale, chartArea, 'right'),
      top: getSizeForArea(yScale, chartArea, 'top'),
      bottom: getSizeForArea(yScale, chartArea, 'bottom')
    };
  }
  return chartArea;
}

class Chart {

  static defaults = defaults;
  static instances = instances;
  static overrides = overrides;
  static registry = registry;
  static version = version;
  static getChart = getChart;

  static register(...items) {
    registry.add(...items);
    invalidatePlugins();
  }

  static unregister(...items) {
    registry.remove(...items);
    invalidatePlugins();
  }

  // eslint-disable-next-line max-statements
  constructor(item, userConfig) {
    const config = this.config = new Config(userConfig);
    const initialCanvas = getCanvas(item);
    const existingChart = getChart(initialCanvas);
    if (existingChart) {
      throw new Error(
        'Canvas is already in use. Chart with ID \'' + existingChart.id + '\'' +
				' must be destroyed before the canvas with ID \'' + existingChart.canvas.id + '\' can be reused.'
      );
    }

    const options = config.createResolver(config.chartOptionScopes(), this.getContext());

    this.platform = new (config.platform || _detectPlatform(initialCanvas))();
    this.platform.updateConfig(config);

    const context = this.platform.acquireContext(initialCanvas, options.aspectRatio);
    const canvas = context && context.canvas;
    const height = canvas && canvas.height;
    const width = canvas && canvas.width;

    this.id = uid();
    this.ctx = context;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this._options = options;
    // Store the previously used aspect ratio to determine if a resize
    // is needed during updates. Do this after _options is set since
    // aspectRatio uses a getter
    this._aspectRatio = this.aspectRatio;
    this._layers = [];
    this._metasets = [];
    this._stacks = undefined;
    this.boxes = [];
    this.currentDevicePixelRatio = undefined;
    this.chartArea = undefined;
    this._active = [];
    this._lastEvent = undefined;
    this._listeners = {};
    /** @type {?{attach?: function, detach?: function, resize?: function}} */
    this._responsiveListeners = undefined;
    this._sortedMetasets = [];
    this.scales = {};
    this._plugins = new PluginService();
    this.$proxies = {};
    this._hiddenIndices = {};
    this.attached = false;
    this._animationsDisabled = undefined;
    this.$context = undefined;
    this._doResize = debounce(mode => this.update(mode), options.resizeDelay || 0);
    this._dataChanges = [];

    // Add the chart instance to the global namespace
    instances[this.id] = this;

    if (!context || !canvas) {
      // The given item is not a compatible context2d element, let's return before finalizing
      // the chart initialization but after setting basic chart / controller properties that
      // can help to figure out that the chart is not valid (e.g chart.canvas !== null);
      // https://github.com/chartjs/Chart.js/issues/2807
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }

    animator.listen(this, 'complete', onAnimationsComplete);
    animator.listen(this, 'progress', onAnimationProgress);

    this._initialize();
    if (this.attached) {
      this.update();
    }
  }

  get aspectRatio() {
    const {options: {aspectRatio, maintainAspectRatio}, width, height, _aspectRatio} = this;
    if (!isNullOrUndef(aspectRatio)) {
      // If aspectRatio is defined in options, use that.
      return aspectRatio;
    }

    if (maintainAspectRatio && _aspectRatio) {
      // If maintainAspectRatio is truthly and we had previously determined _aspectRatio, use that
      return _aspectRatio;
    }

    // Calculate
    return height ? width / height : null;
  }

  get data() {
    return this.config.data;
  }

  set data(data) {
    this.config.data = data;
  }

  get options() {
    return this._options;
  }

  set options(options) {
    this.config.options = options;
  }

  get registry() {
    return registry;
  }

  /**
	 * @private
	 */
  _initialize() {
    // Before init plugin notification
    this.notifyPlugins('beforeInit');

    if (this.options.responsive) {
      this.resize();
    } else {
      retinaScale(this, this.options.devicePixelRatio);
    }

    this.bindEvents();

    // After init plugin notification
    this.notifyPlugins('afterInit');

    return this;
  }

  clear() {
    clearCanvas(this.canvas, this.ctx);
    return this;
  }

  stop() {
    animator.stop(this);
    return this;
  }

  /**
	 * Resize the chart to its container or to explicit dimensions.
	 * @param {number} [width]
	 * @param {number} [height]
	 */
  resize(width, height) {
    if (!animator.running(this)) {
      this._resize(width, height);
    } else {
      this._resizeBeforeDraw = {width, height};
    }
  }

  _resize(width, height) {
    const options = this.options;
    const canvas = this.canvas;
    const aspectRatio = options.maintainAspectRatio && this.aspectRatio;
    const newSize = this.platform.getMaximumSize(canvas, width, height, aspectRatio);
    const newRatio = options.devicePixelRatio || this.platform.getDevicePixelRatio();
    const mode = this.width ? 'resize' : 'attach';

    this.width = newSize.width;
    this.height = newSize.height;
    this._aspectRatio = this.aspectRatio;
    if (!retinaScale(this, newRatio, true)) {
      return;
    }

    this.notifyPlugins('resize', {size: newSize});

    callCallback(options.onResize, [this, newSize], this);

    if (this.attached) {
      if (this._doResize(mode)) {
        // The resize update is delayed, only draw without updating.
        this.render();
      }
    }
  }

  ensureScalesHaveIDs() {
    const options = this.options;
    const scalesOptions = options.scales || {};

    each(scalesOptions, (axisOptions, axisID) => {
      axisOptions.id = axisID;
    });
  }

  /**
	 * Builds a map of scale ID to scale object for future lookup.
	 */
  buildOrUpdateScales() {
    const options = this.options;
    const scaleOpts = options.scales;
    const scales = this.scales;
    const updated = Object.keys(scales).reduce((obj, id) => {
      obj[id] = false;
      return obj;
    }, {});
    let items = [];

    if (scaleOpts) {
      items = items.concat(
        Object.keys(scaleOpts).map((id) => {
          const scaleOptions = scaleOpts[id];
          const axis = determineAxis(id, scaleOptions);
          const isRadial = axis === 'r';
          const isHorizontal = axis === 'x';
          return {
            options: scaleOptions,
            dposition: isRadial ? 'chartArea' : isHorizontal ? 'bottom' : 'left',
            dtype: isRadial ? 'radialLinear' : isHorizontal ? 'category' : 'linear'
          };
        })
      );
    }

    each(items, (item) => {
      const scaleOptions = item.options;
      const id = scaleOptions.id;
      const axis = determineAxis(id, scaleOptions);
      const scaleType = valueOrDefault(scaleOptions.type, item.dtype);

      if (scaleOptions.position === undefined || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
        scaleOptions.position = item.dposition;
      }

      updated[id] = true;
      let scale = null;
      if (id in scales && scales[id].type === scaleType) {
        scale = scales[id];
      } else {
        const scaleClass = registry.getScale(scaleType);
        scale = new scaleClass({
          id,
          type: scaleType,
          ctx: this.ctx,
          chart: this
        });
        scales[scale.id] = scale;
      }

      scale.init(scaleOptions, options);
    });
    // clear up discarded scales
    each(updated, (hasUpdated, id) => {
      if (!hasUpdated) {
        delete scales[id];
      }
    });

    each(scales, (scale) => {
      layouts.configure(this, scale, scale.options);
      layouts.addBox(this, scale);
    });
  }

  /**
	 * @private
	 */
  _updateMetasets() {
    const metasets = this._metasets;
    const numData = this.data.datasets.length;
    const numMeta = metasets.length;

    metasets.sort((a, b) => a.index - b.index);
    if (numMeta > numData) {
      for (let i = numData; i < numMeta; ++i) {
        this._destroyDatasetMeta(i);
      }
      metasets.splice(numData, numMeta - numData);
    }
    this._sortedMetasets = metasets.slice(0).sort(compare2Level('order', 'index'));
  }

  /**
	 * @private
	 */
  _removeUnreferencedMetasets() {
    const {_metasets: metasets, data: {datasets}} = this;
    if (metasets.length > datasets.length) {
      delete this._stacks;
    }
    metasets.forEach((meta, index) => {
      if (datasets.filter(x => x === meta._dataset).length === 0) {
        this._destroyDatasetMeta(index);
      }
    });
  }

  buildOrUpdateControllers() {
    const newControllers = [];
    const datasets = this.data.datasets;
    let i, ilen;

    this._removeUnreferencedMetasets();

    for (i = 0, ilen = datasets.length; i < ilen; i++) {
      const dataset = datasets[i];
      let meta = this.getDatasetMeta(i);
      const type = dataset.type || this.config.type;

      if (meta.type && meta.type !== type) {
        this._destroyDatasetMeta(i);
        meta = this.getDatasetMeta(i);
      }
      meta.type = type;
      meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options);
      meta.order = dataset.order || 0;
      meta.index = i;
      meta.label = '' + dataset.label;
      meta.visible = this.isDatasetVisible(i);

      if (meta.controller) {
        meta.controller.updateIndex(i);
        meta.controller.linkScales();
      } else {
        const ControllerClass = registry.getController(type);
        const {datasetElementType, dataElementType} = defaults.datasets[type];
        Object.assign(ControllerClass, {
          dataElementType: registry.getElement(dataElementType),
          datasetElementType: datasetElementType && registry.getElement(datasetElementType)
        });
        meta.controller = new ControllerClass(this, i);
        newControllers.push(meta.controller);
      }
    }

    this._updateMetasets();
    return newControllers;
  }

  /**
	 * Reset the elements of all datasets
	 * @private
	 */
  _resetElements() {
    each(this.data.datasets, (dataset, datasetIndex) => {
      this.getDatasetMeta(datasetIndex).controller.reset();
    }, this);
  }

  /**
	* Resets the chart back to its state before the initial animation
	*/
  reset() {
    this._resetElements();
    this.notifyPlugins('reset');
  }

  update(mode) {
    const config = this.config;

    config.update();
    const options = this._options = config.createResolver(config.chartOptionScopes(), this.getContext());
    const animsDisabled = this._animationsDisabled = !options.animation;

    this._updateScales();
    this._checkEventBindings();
    this._updateHiddenIndices();

    // plugins options references might have change, let's invalidate the cache
    // https://github.com/chartjs/Chart.js/issues/5111#issuecomment-355934167
    this._plugins.invalidate();

    if (this.notifyPlugins('beforeUpdate', {mode, cancelable: true}) === false) {
      return;
    }

    // Make sure dataset controllers are updated and new controllers are reset
    const newControllers = this.buildOrUpdateControllers();

    this.notifyPlugins('beforeElementsUpdate');

    // Make sure all dataset controllers have correct meta data counts
    let minPadding = 0;
    for (let i = 0, ilen = this.data.datasets.length; i < ilen; i++) {
      const {controller} = this.getDatasetMeta(i);
      const reset = !animsDisabled && newControllers.indexOf(controller) === -1;
      // New controllers will be reset after the layout pass, so we only want to modify
      // elements added to new datasets
      controller.buildOrUpdateElements(reset);
      minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
    }
    minPadding = this._minPadding = options.layout.autoPadding ? minPadding : 0;
    this._updateLayout(minPadding);

    // Only reset the controllers if we have animations
    if (!animsDisabled) {
      // Can only reset the new controllers after the scales have been updated
      // Reset is done to get the starting point for the initial animation
      each(newControllers, (controller) => {
        controller.reset();
      });
    }

    this._updateDatasets(mode);

    // Do this before render so that any plugins that need final scale updates can use it
    this.notifyPlugins('afterUpdate', {mode});

    this._layers.sort(compare2Level('z', '_idx'));

    // Replay last event from before update, or set hover styles on active elements
    const {_active, _lastEvent} = this;
    if (_lastEvent) {
      this._eventHandler(_lastEvent, true);
    } else if (_active.length) {
      this._updateHoverStyles(_active, _active, true);
    }

    this.render();
  }

  /**
   * @private
   */
  _updateScales() {
    each(this.scales, (scale) => {
      layouts.removeBox(this, scale);
    });

    this.ensureScalesHaveIDs();
    this.buildOrUpdateScales();
  }

  /**
   * @private
   */
  _checkEventBindings() {
    const options = this.options;
    const existingEvents = new Set(Object.keys(this._listeners));
    const newEvents = new Set(options.events);

    if (!setsEqual(existingEvents, newEvents) || !!this._responsiveListeners !== options.responsive) {
      // The configured events have changed. Rebind.
      this.unbindEvents();
      this.bindEvents();
    }
  }

  /**
   * @private
   */
  _updateHiddenIndices() {
    const {_hiddenIndices} = this;
    const changes = this._getUniformDataChanges() || [];
    for (const {method, start, count} of changes) {
      const move = method === '_removeElements' ? -count : count;
      moveNumericKeys(_hiddenIndices, start, move);
    }
  }

  /**
   * @private
   */
  _getUniformDataChanges() {
    const _dataChanges = this._dataChanges;
    if (!_dataChanges || !_dataChanges.length) {
      return;
    }

    this._dataChanges = [];
    const datasetCount = this.data.datasets.length;
    const makeSet = (idx) => new Set(
      _dataChanges
        .filter(c => c[0] === idx)
        .map((c, i) => i + ',' + c.splice(1).join(','))
    );

    const changeSet = makeSet(0);
    for (let i = 1; i < datasetCount; i++) {
      if (!setsEqual(changeSet, makeSet(i))) {
        return;
      }
    }
    return Array.from(changeSet)
      .map(c => c.split(','))
      .map(a => ({method: a[1], start: +a[2], count: +a[3]}));
  }

  /**
	 * Updates the chart layout unless a plugin returns `false` to the `beforeLayout`
	 * hook, in which case, plugins will not be called on `afterLayout`.
	 * @private
	 */
  _updateLayout(minPadding) {
    if (this.notifyPlugins('beforeLayout', {cancelable: true}) === false) {
      return;
    }

    layouts.update(this, this.width, this.height, minPadding);

    const area = this.chartArea;
    const noArea = area.width <= 0 || area.height <= 0;

    this._layers = [];
    each(this.boxes, (box) => {
      if (noArea && box.position === 'chartArea') {
        // Skip drawing and configuring chartArea boxes when chartArea is zero or negative
        return;
      }

      // configure is called twice, once in core.scale.update and once here.
      // Here the boxes are fully updated and at their final positions.
      if (box.configure) {
        box.configure();
      }
      this._layers.push(...box._layers());
    }, this);

    this._layers.forEach((item, index) => {
      item._idx = index;
    });

    this.notifyPlugins('afterLayout');
  }

  /**
	 * Updates all datasets unless a plugin returns `false` to the `beforeDatasetsUpdate`
	 * hook, in which case, plugins will not be called on `afterDatasetsUpdate`.
	 * @private
	 */
  _updateDatasets(mode) {
    if (this.notifyPlugins('beforeDatasetsUpdate', {mode, cancelable: true}) === false) {
      return;
    }

    for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this.getDatasetMeta(i).controller.configure();
    }

    for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this._updateDataset(i, isFunction(mode) ? mode({datasetIndex: i}) : mode);
    }

    this.notifyPlugins('afterDatasetsUpdate', {mode});
  }

  /**
	 * Updates dataset at index unless a plugin returns `false` to the `beforeDatasetUpdate`
	 * hook, in which case, plugins will not be called on `afterDatasetUpdate`.
	 * @private
	 */
  _updateDataset(index, mode) {
    const meta = this.getDatasetMeta(index);
    const args = {meta, index, mode, cancelable: true};

    if (this.notifyPlugins('beforeDatasetUpdate', args) === false) {
      return;
    }

    meta.controller._update(mode);

    args.cancelable = false;
    this.notifyPlugins('afterDatasetUpdate', args);
  }

  render() {
    if (this.notifyPlugins('beforeRender', {cancelable: true}) === false) {
      return;
    }

    if (animator.has(this)) {
      if (this.attached && !animator.running(this)) {
        animator.start(this);
      }
    } else {
      this.draw();
      onAnimationsComplete({chart: this});
    }
  }

  draw() {
    let i;
    if (this._resizeBeforeDraw) {
      const {width, height} = this._resizeBeforeDraw;
      this._resize(width, height);
      this._resizeBeforeDraw = null;
    }
    this.clear();

    if (this.width <= 0 || this.height <= 0) {
      return;
    }

    if (this.notifyPlugins('beforeDraw', {cancelable: true}) === false) {
      return;
    }

    // Because of plugin hooks (before/afterDatasetsDraw), datasets can't
    // currently be part of layers. Instead, we draw
    // layers <= 0 before(default, backward compat), and the rest after
    const layers = this._layers;
    for (i = 0; i < layers.length && layers[i].z <= 0; ++i) {
      layers[i].draw(this.chartArea);
    }

    this._drawDatasets();

    // Rest of layers
    for (; i < layers.length; ++i) {
      layers[i].draw(this.chartArea);
    }

    this.notifyPlugins('afterDraw');
  }

  /**
	 * @private
	 */
  _getSortedDatasetMetas(filterVisible) {
    const metasets = this._sortedMetasets;
    const result = [];
    let i, ilen;

    for (i = 0, ilen = metasets.length; i < ilen; ++i) {
      const meta = metasets[i];
      if (!filterVisible || meta.visible) {
        result.push(meta);
      }
    }

    return result;
  }

  /**
	 * Gets the visible dataset metas in drawing order
	 * @return {object[]}
	 */
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(true);
  }

  /**
	 * Draws all datasets unless a plugin returns `false` to the `beforeDatasetsDraw`
	 * hook, in which case, plugins will not be called on `afterDatasetsDraw`.
	 * @private
	 */
  _drawDatasets() {
    if (this.notifyPlugins('beforeDatasetsDraw', {cancelable: true}) === false) {
      return;
    }

    const metasets = this.getSortedVisibleDatasetMetas();
    for (let i = metasets.length - 1; i >= 0; --i) {
      this._drawDataset(metasets[i]);
    }

    this.notifyPlugins('afterDatasetsDraw');
  }

  /**
	 * Draws dataset at index unless a plugin returns `false` to the `beforeDatasetDraw`
	 * hook, in which case, plugins will not be called on `afterDatasetDraw`.
	 * @private
	 */
  _drawDataset(meta) {
    const ctx = this.ctx;
    const clip = meta._clip;
    const useClip = !clip.disabled;
    const area = getDatasetArea(meta, this.chartArea);
    const args = {
      meta,
      index: meta.index,
      cancelable: true
    };

    if (this.notifyPlugins('beforeDatasetDraw', args) === false) {
      return;
    }

    if (useClip) {
      clipArea(ctx, {
        left: clip.left === false ? 0 : area.left - clip.left,
        right: clip.right === false ? this.width : area.right + clip.right,
        top: clip.top === false ? 0 : area.top - clip.top,
        bottom: clip.bottom === false ? this.height : area.bottom + clip.bottom
      });
    }

    meta.controller.draw();

    if (useClip) {
      unclipArea(ctx);
    }

    args.cancelable = false;
    this.notifyPlugins('afterDatasetDraw', args);
  }

  /**
   * Checks whether the given point is in the chart area.
   * @param {Point} point - in relative coordinates (see, e.g., getRelativePosition)
   * @returns {boolean}
   */
  isPointInArea(point) {
    return _isPointInArea(point, this.chartArea, this._minPadding);
  }

  getElementsAtEventForMode(e, mode, options, useFinalPosition) {
    const method = Interaction.modes[mode];
    if (typeof method === 'function') {
      return method(this, e, options, useFinalPosition);
    }

    return [];
  }

  getDatasetMeta(datasetIndex) {
    const dataset = this.data.datasets[datasetIndex];
    const metasets = this._metasets;
    let meta = metasets.filter(x => x && x._dataset === dataset).pop();

    if (!meta) {
      meta = {
        type: null,
        data: [],
        dataset: null,
        controller: null,
        hidden: null,			// See isDatasetVisible() comment
        xAxisID: null,
        yAxisID: null,
        order: dataset && dataset.order || 0,
        index: datasetIndex,
        _dataset: dataset,
        _parsed: [],
        _sorted: false
      };
      metasets.push(meta);
    }

    return meta;
  }

  getContext() {
    return this.$context || (this.$context = createContext(null, {chart: this, type: 'chart'}));
  }

  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }

  isDatasetVisible(datasetIndex) {
    const dataset = this.data.datasets[datasetIndex];
    if (!dataset) {
      return false;
    }

    const meta = this.getDatasetMeta(datasetIndex);

    // meta.hidden is a per chart dataset hidden flag override with 3 states: if true or false,
    // the dataset.hidden value is ignored, else if null, the dataset hidden state is returned.
    return typeof meta.hidden === 'boolean' ? !meta.hidden : !dataset.hidden;
  }

  setDatasetVisibility(datasetIndex, visible) {
    const meta = this.getDatasetMeta(datasetIndex);
    meta.hidden = !visible;
  }

  toggleDataVisibility(index) {
    this._hiddenIndices[index] = !this._hiddenIndices[index];
  }

  getDataVisibility(index) {
    return !this._hiddenIndices[index];
  }

  /**
	 * @private
	 */
  _updateVisibility(datasetIndex, dataIndex, visible) {
    const mode = visible ? 'show' : 'hide';
    const meta = this.getDatasetMeta(datasetIndex);
    const anims = meta.controller._resolveAnimations(undefined, mode);

    if (defined(dataIndex)) {
      meta.data[dataIndex].hidden = !visible;
      this.update();
    } else {
      this.setDatasetVisibility(datasetIndex, visible);
      // Animate visible state, so hide animation can be seen. This could be handled better if update / updateDataset returned a Promise.
      anims.update(meta, {visible});
      this.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : undefined);
    }
  }

  hide(datasetIndex, dataIndex) {
    this._updateVisibility(datasetIndex, dataIndex, false);
  }

  show(datasetIndex, dataIndex) {
    this._updateVisibility(datasetIndex, dataIndex, true);
  }

  /**
	 * @private
	 */
  _destroyDatasetMeta(datasetIndex) {
    const meta = this._metasets[datasetIndex];
    if (meta && meta.controller) {
      meta.controller._destroy();
    }
    delete this._metasets[datasetIndex];
  }

  _stop() {
    let i, ilen;
    this.stop();
    animator.remove(this);

    for (i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this._destroyDatasetMeta(i);
    }
  }

  destroy() {
    this.notifyPlugins('beforeDestroy');
    const {canvas, ctx} = this;

    this._stop();
    this.config.clearCache();

    if (canvas) {
      this.unbindEvents();
      clearCanvas(canvas, ctx);
      this.platform.releaseContext(ctx);
      this.canvas = null;
      this.ctx = null;
    }

    delete instances[this.id];

    this.notifyPlugins('afterDestroy');
  }

  toBase64Image(...args) {
    return this.canvas.toDataURL(...args);
  }

  /**
	 * @private
	 */
  bindEvents() {
    this.bindUserEvents();
    if (this.options.responsive) {
      this.bindResponsiveEvents();
    } else {
      this.attached = true;
    }
  }

  /**
   * @private
   */
  bindUserEvents() {
    const listeners = this._listeners;
    const platform = this.platform;

    const _add = (type, listener) => {
      platform.addEventListener(this, type, listener);
      listeners[type] = listener;
    };

    const listener = (e, x, y) => {
      e.offsetX = x;
      e.offsetY = y;
      this._eventHandler(e);
    };

    each(this.options.events, (type) => _add(type, listener));
  }

  /**
   * @private
   */
  bindResponsiveEvents() {
    if (!this._responsiveListeners) {
      this._responsiveListeners = {};
    }
    const listeners = this._responsiveListeners;
    const platform = this.platform;

    const _add = (type, listener) => {
      platform.addEventListener(this, type, listener);
      listeners[type] = listener;
    };
    const _remove = (type, listener) => {
      if (listeners[type]) {
        platform.removeEventListener(this, type, listener);
        delete listeners[type];
      }
    };

    const listener = (width, height) => {
      if (this.canvas) {
        this.resize(width, height);
      }
    };

    let detached; // eslint-disable-line prefer-const
    const attached = () => {
      _remove('attach', attached);

      this.attached = true;
      this.resize();

      _add('resize', listener);
      _add('detach', detached);
    };

    detached = () => {
      this.attached = false;

      _remove('resize', listener);

      // Stop animating and remove metasets, so when re-attached, the animations start from beginning.
      this._stop();
      this._resize(0, 0);

      _add('attach', attached);
    };

    if (platform.isAttached(this.canvas)) {
      attached();
    } else {
      detached();
    }
  }

  /**
	 * @private
	 */
  unbindEvents() {
    each(this._listeners, (listener, type) => {
      this.platform.removeEventListener(this, type, listener);
    });
    this._listeners = {};

    each(this._responsiveListeners, (listener, type) => {
      this.platform.removeEventListener(this, type, listener);
    });
    this._responsiveListeners = undefined;
  }

  updateHoverStyle(items, mode, enabled) {
    const prefix = enabled ? 'set' : 'remove';
    let meta, item, i, ilen;

    if (mode === 'dataset') {
      meta = this.getDatasetMeta(items[0].datasetIndex);
      meta.controller['_' + prefix + 'DatasetHoverStyle']();
    }

    for (i = 0, ilen = items.length; i < ilen; ++i) {
      item = items[i];
      const controller = item && this.getDatasetMeta(item.datasetIndex).controller;
      if (controller) {
        controller[prefix + 'HoverStyle'](item.element, item.datasetIndex, item.index);
      }
    }
  }

  /**
	 * Get active (hovered) elements
	 * @returns array
	 */
  getActiveElements() {
    return this._active || [];
  }

  /**
	 * Set active (hovered) elements
	 * @param {array} activeElements New active data points
	 */
  setActiveElements(activeElements) {
    const lastActive = this._active || [];
    const active = activeElements.map(({datasetIndex, index}) => {
      const meta = this.getDatasetMeta(datasetIndex);
      if (!meta) {
        throw new Error('No dataset found at index ' + datasetIndex);
      }

      return {
        datasetIndex,
        element: meta.data[index],
        index,
      };
    });
    const changed = !_elementsEqual(active, lastActive);

    if (changed) {
      this._active = active;
      // Make sure we don't use the previous mouse event to override the active elements in update.
      this._lastEvent = null;
      this._updateHoverStyles(active, lastActive);
    }
  }

  /**
	 * Calls enabled plugins on the specified hook and with the given args.
	 * This method immediately returns as soon as a plugin explicitly returns false. The
	 * returned value can be used, for instance, to interrupt the current action.
	 * @param {string} hook - The name of the plugin method to call (e.g. 'beforeUpdate').
	 * @param {Object} [args] - Extra arguments to apply to the hook call.
   * @param {import('./core.plugins.js').filterCallback} [filter] - Filtering function for limiting which plugins are notified
	 * @returns {boolean} false if any of the plugins return false, else returns true.
	 */
  notifyPlugins(hook, args, filter) {
    return this._plugins.notify(this, hook, args, filter);
  }

  /**
   * Check if a plugin with the specific ID is registered and enabled
   * @param {string} pluginId - The ID of the plugin of which to check if it is enabled
   * @returns {boolean}
   */
  isPluginEnabled(pluginId) {
    return this._plugins._cache.filter(p => p.plugin.id === pluginId).length === 1;
  }

  /**
	 * @private
	 */
  _updateHoverStyles(active, lastActive, replay) {
    const hoverOptions = this.options.hover;
    const diff = (a, b) => a.filter(x => !b.some(y => x.datasetIndex === y.datasetIndex && x.index === y.index));
    const deactivated = diff(lastActive, active);
    const activated = replay ? active : diff(active, lastActive);

    if (deactivated.length) {
      this.updateHoverStyle(deactivated, hoverOptions.mode, false);
    }

    if (activated.length && hoverOptions.mode) {
      this.updateHoverStyle(activated, hoverOptions.mode, true);
    }
  }

  /**
	 * @private
	 */
  _eventHandler(e, replay) {
    const args = {
      event: e,
      replay,
      cancelable: true,
      inChartArea: this.isPointInArea(e)
    };
    const eventFilter = (plugin) => (plugin.options.events || this.options.events).includes(e.native.type);

    if (this.notifyPlugins('beforeEvent', args, eventFilter) === false) {
      return;
    }

    const changed = this._handleEvent(e, replay, args.inChartArea);

    args.cancelable = false;
    this.notifyPlugins('afterEvent', args, eventFilter);

    if (changed || args.changed) {
      this.render();
    }

    return this;
  }

  /**
	 * Handle an event
	 * @param {ChartEvent} e the event to handle
	 * @param {boolean} [replay] - true if the event was replayed by `update`
   * @param {boolean} [inChartArea] - true if the event is inside chartArea
	 * @return {boolean} true if the chart needs to re-render
	 * @private
	 */
  _handleEvent(e, replay, inChartArea) {
    const {_active: lastActive = [], options} = this;

    // If the event is replayed from `update`, we should evaluate with the final positions.
    //
    // The `replay`:
    // It's the last event (excluding click) that has occurred before `update`.
    // So mouse has not moved. It's also over the chart, because there is a `replay`.
    //
    // The why:
    // If animations are active, the elements haven't moved yet compared to state before update.
    // But if they will, we are activating the elements that would be active, if this check
    // was done after the animations have completed. => "final positions".
    // If there is no animations, the "final" and "current" positions are equal.
    // This is done so we do not have to evaluate the active elements each animation frame
    // - it would be expensive.
    const useFinalPosition = replay;
    const active = this._getActiveElements(e, lastActive, inChartArea, useFinalPosition);
    const isClick = _isClickEvent(e);
    const lastEvent = determineLastEvent(e, this._lastEvent, inChartArea, isClick);

    if (inChartArea) {
      // Set _lastEvent to null while we are processing the event handlers.
      // This prevents recursion if the handler calls chart.update()
      this._lastEvent = null;

      // Invoke onHover hook
      callCallback(options.onHover, [e, active, this], this);

      if (isClick) {
        callCallback(options.onClick, [e, active, this], this);
      }
    }

    const changed = !_elementsEqual(active, lastActive);
    if (changed || replay) {
      this._active = active;
      this._updateHoverStyles(active, lastActive, replay);
    }

    this._lastEvent = lastEvent;

    return changed;
  }

  /**
   * @param {ChartEvent} e - The event
   * @param {import('../types/index.js').ActiveElement[]} lastActive - Previously active elements
   * @param {boolean} inChartArea - Is the envent inside chartArea
   * @param {boolean} useFinalPosition - Should the evaluation be done with current or final (after animation) element positions
   * @returns {import('../types/index.js').ActiveElement[]} - The active elements
   * @pravate
   */
  _getActiveElements(e, lastActive, inChartArea, useFinalPosition) {
    if (e.type === 'mouseout') {
      return [];
    }

    if (!inChartArea) {
      // Let user control the active elements outside chartArea. Eg. using Legend.
      return lastActive;
    }

    const hoverOptions = this.options.hover;
    return this.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
  }
}

// @ts-ignore
function invalidatePlugins() {
  return each(Chart.instances, (chart) => chart._plugins.invalidate());
}

export default Chart;
