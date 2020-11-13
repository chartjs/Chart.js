/* eslint-disable import/no-namespace, import/namespace */
import animator from './core.animator';
import defaults from './core.defaults';
import Interaction from './core.interaction';
import layouts from './core.layouts';
import {BasicPlatform, DomPlatform} from '../platform';
import PluginService from './core.plugins';
import registry from './core.registry';
import Config, {determineAxis, getIndexAxis} from './core.config';
import {retinaScale} from '../helpers/helpers.dom';
import {each, callback as callCallback, uid, valueOrDefault, _elementsEqual} from '../helpers/helpers.core';
import {clear as canvasClear, clipArea, unclipArea, _isPointInArea} from '../helpers/helpers.canvas';
// @ts-ignore
import {version} from '../../package.json';

/**
 * @typedef { import("../platform/platform.base").ChartEvent } ChartEvent
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

	chart._plugins.notify(chart, 'afterRender');
	callCallback(animationOptions && animationOptions.onComplete, [context], chart);
}

function onAnimationProgress(context) {
	const chart = context.chart;
	const animationOptions = chart.options.animation;
	callCallback(animationOptions && animationOptions.onProgress, [context], chart);
}

function isDomSupported() {
	return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Chart.js can take a string id of a canvas element, a 2d context, or a canvas element itself.
 * Attempt to unwrap the item passed into the chart constructor so that it is a canvas element (if possible).
 */
function getCanvas(item) {
	if (isDomSupported() && typeof item === 'string') {
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

class Chart {

	// eslint-disable-next-line max-statements
	constructor(item, config) {
		const me = this;

		this.config = config = new Config(config);
		const initialCanvas = getCanvas(item);
		const existingChart = Chart.getChart(initialCanvas);
		if (existingChart) {
			throw new Error(
				'Canvas is already in use. Chart with ID \'' + existingChart.id + '\'' +
				' must be destroyed before the canvas can be reused.'
			);
		}

		this.platform = me._initializePlatform(initialCanvas, config);

		const context = me.platform.acquireContext(initialCanvas, config);
		const canvas = context && context.canvas;
		const height = canvas && canvas.height;
		const width = canvas && canvas.width;

		this.id = uid();
		this.ctx = context;
		this.canvas = canvas;
		this.width = width;
		this.height = height;
		this.aspectRatio = height ? width / height : null;
		this.options = config.options;
		this._layers = [];
		this._metasets = [];
		this.boxes = [];
		this.currentDevicePixelRatio = undefined;
		this.chartArea = undefined;
		this._active = [];
		this._lastEvent = undefined;
		/** @type {{attach?: function, detach?: function, resize?: function}} */
		this._listeners = {};
		this._sortedMetasets = [];
		this.scales = {};
		this.scale = undefined;
		this._plugins = new PluginService();
		this.$proxies = {};
		this._hiddenIndices = {};
		this.attached = false;
		this._animationsDisabled = undefined;
		this.$context = undefined;

		// Add the chart instance to the global namespace
		Chart.instances[me.id] = me;

		if (!context || !canvas) {
			// The given item is not a compatible context2d element, let's return before finalizing
			// the chart initialization but after setting basic chart / controller properties that
			// can help to figure out that the chart is not valid (e.g chart.canvas !== null);
			// https://github.com/chartjs/Chart.js/issues/2807
			console.error("Failed to create chart: can't acquire context from the given item");
			return;
		}

		animator.listen(me, 'complete', onAnimationsComplete);
		animator.listen(me, 'progress', onAnimationProgress);

		me._initialize();
		if (me.attached) {
			me.update();
		}
	}

	get data() {
		return this.config.data;
	}

	set data(data) {
		this.config.data = data;
	}

	/**
	 * @private
	 */
	_initialize() {
		const me = this;

		// Before init plugin notification
		me._plugins.notify(me, 'beforeInit');

		if (me.options.responsive) {
			me.resize();
		} else {
			retinaScale(me, me.options.devicePixelRatio);
		}

		me.bindEvents();

		// After init plugin notification
		me._plugins.notify(me, 'afterInit');

		return me;
	}

	/**
	 * @private
	 */
	_initializePlatform(canvas, config) {
		if (config.platform) {
			return new config.platform();
		} else if (!isDomSupported() || (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas)) {
			return new BasicPlatform();
		}
		return new DomPlatform();
	}

	clear() {
		canvasClear(this);
		return this;
	}

	stop() {
		animator.stop(this);
		return this;
	}

	resize(width, height) {
		if (!animator.running(this)) {
			this._resize(width, height);
		} else {
			this._resizeBeforeDraw = {width, height};
		}
	}

	_resize(width, height) {
		const me = this;
		const options = me.options;
		const canvas = me.canvas;
		const aspectRatio = options.maintainAspectRatio && me.aspectRatio;
		const newSize = me.platform.getMaximumSize(canvas, width, height, aspectRatio);

		// detect devicePixelRation changes
		const oldRatio = me.currentDevicePixelRatio;
		const newRatio = options.devicePixelRatio || me.platform.getDevicePixelRatio();

		if (me.width === newSize.width && me.height === newSize.height && oldRatio === newRatio) {
			return;
		}

		canvas.width = me.width = newSize.width;
		canvas.height = me.height = newSize.height;
		if (canvas.style) {
			canvas.style.width = newSize.width + 'px';
			canvas.style.height = newSize.height + 'px';
		}

		retinaScale(me, newRatio);

		me._plugins.notify(me, 'resize', [newSize]);

		callCallback(options.onResize, [newSize], me);

		if (me.attached) {
			me.update('resize');
		}
	}

	ensureScalesHaveIDs() {
		const options = this.options;
		const scalesOptions = options.scales || {};
		const scaleOptions = options.scale;

		each(scalesOptions, (axisOptions, axisID) => {
			axisOptions.id = axisID;
		});

		if (scaleOptions) {
			scaleOptions.id = scaleOptions.id || 'scale';
		}
	}

	/**
	 * Builds a map of scale ID to scale object for future lookup.
	 */
	buildOrUpdateScales() {
		const me = this;
		const options = me.options;
		const scaleOpts = options.scales;
		const scales = me.scales || {};
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
					ctx: me.ctx,
					chart: me
				});
				scales[scale.id] = scale;
			}

			scale.init(scaleOptions, options);

			// TODO(SB): I think we should be able to remove this custom case (options.scale)
			// and consider it as a regular scale part of the "scales"" map only! This would
			// make the logic easier and remove some useless? custom code.
			if (item.isDefault) {
				me.scale = scale;
			}
		});
		// clear up discarded scales
		each(updated, (hasUpdated, id) => {
			if (!hasUpdated) {
				delete scales[id];
			}
		});

		me.scales = scales;

		each(scales, (scale) => {
			// Set LayoutItem parameters for backwards compatibility
			scale.fullWidth = scale.options.fullWidth;
			scale.position = scale.options.position;
			scale.weight = scale.options.weight;
			layouts.addBox(me, scale);
		});
	}

	/**
	 * Updates the given metaset with the given dataset index. Ensures it's stored at that index
	 * in the _metasets array by swapping with the metaset at that index if necessary.
	 * @param {Object} meta - the dataset metadata
	 * @param {number} index - the dataset index
	 * @private
	 */
	_updateMetasetIndex(meta, index) {
		const metasets = this._metasets;
		const oldIndex = meta.index;
		if (oldIndex !== index) {
			metasets[oldIndex] = metasets[index];
			metasets[index] = meta;
			meta.index = index;
		}
	}

	/**
	 * @private
	 */
	_updateMetasets() {
		const me = this;
		const metasets = me._metasets;
		const numData = me.data.datasets.length;
		const numMeta = metasets.length;

		if (numMeta > numData) {
			for (let i = numData; i < numMeta; ++i) {
				me._destroyDatasetMeta(i);
			}
			metasets.splice(numData, numMeta - numData);
		}
		me._sortedMetasets = metasets.slice(0).sort(compare2Level('order', 'index'));
	}

	/**
	 * @private
	 */
	_removeUnreferencedMetasets() {
		const me = this;
		const datasets = me.data.datasets;
		me._metasets.forEach((meta, index) => {
			if (datasets.filter(x => x === meta._dataset).length === 0) {
				me._destroyDatasetMeta(index);
			}
		});
	}

	buildOrUpdateControllers() {
		const me = this;
		const newControllers = [];
		const datasets = me.data.datasets;
		let i, ilen;

		me._removeUnreferencedMetasets();

		for (i = 0, ilen = datasets.length; i < ilen; i++) {
			const dataset = datasets[i];
			let meta = me.getDatasetMeta(i);
			const type = dataset.type || me.config.type;

			if (meta.type && meta.type !== type) {
				me._destroyDatasetMeta(i);
				meta = me.getDatasetMeta(i);
			}
			meta.type = type;
			meta.indexAxis = dataset.indexAxis || getIndexAxis(type, me.options);
			meta.order = dataset.order || 0;
			me._updateMetasetIndex(meta, i);
			meta.label = '' + dataset.label;
			meta.visible = me.isDatasetVisible(i);

			if (meta.controller) {
				meta.controller.updateIndex(i);
				meta.controller.linkScales();
			} else {
				const controllerDefaults = defaults.controllers[type];
				const ControllerClass = registry.getController(type);
				Object.assign(ControllerClass.prototype, {
					dataElementType: registry.getElement(controllerDefaults.dataElementType),
					datasetElementType: controllerDefaults.datasetElementType && registry.getElement(controllerDefaults.datasetElementType),
					dataElementOptions: controllerDefaults.dataElementOptions,
					datasetElementOptions: controllerDefaults.datasetElementOptions
				});
				meta.controller = new ControllerClass(me, i);
				newControllers.push(meta.controller);
			}
		}

		me._updateMetasets();
		return newControllers;
	}

	/**
	 * Reset the elements of all datasets
	 * @private
	 */
	_resetElements() {
		const me = this;
		each(me.data.datasets, (dataset, datasetIndex) => {
			me.getDatasetMeta(datasetIndex).controller.reset();
		}, me);
	}

	/**
	* Resets the chart back to its state before the initial animation
	*/
	reset() {
		this._resetElements();
		this._plugins.notify(this, 'reset');
	}

	update(mode) {
		const me = this;
		const args = {mode};
		let i, ilen;

		each(me.scales, (scale) => {
			layouts.removeBox(me, scale);
		});

		me.config.update(me.options);
		me.options = me.config.options;
		me._animationsDisabled = !me.options.animation;

		me.ensureScalesHaveIDs();
		me.buildOrUpdateScales();

		// plugins options references might have change, let's invalidate the cache
		// https://github.com/chartjs/Chart.js/issues/5111#issuecomment-355934167
		me._plugins.invalidate();

		if (me._plugins.notify(me, 'beforeUpdate', [args]) === false) {
			return;
		}

		// Make sure dataset controllers are updated and new controllers are reset
		const newControllers = me.buildOrUpdateControllers();

		// Make sure all dataset controllers have correct meta data counts
		for (i = 0, ilen = me.data.datasets.length; i < ilen; i++) {
			me.getDatasetMeta(i).controller.buildOrUpdateElements();
		}

		me._updateLayout();

		// Can only reset the new controllers after the scales have been updated
		each(newControllers, (controller) => {
			controller.reset();
		});

		me._updateDatasets(mode);

		// Do this before render so that any plugins that need final scale updates can use it
		me._plugins.notify(me, 'afterUpdate', [args]);

		me._layers.sort(compare2Level('z', '_idx'));

		// Replay last event from before update
		if (me._lastEvent) {
			me._eventHandler(me._lastEvent, true);
		}

		me.render();
	}

	/**
	 * Updates the chart layout unless a plugin returns `false` to the `beforeLayout`
	 * hook, in which case, plugins will not be called on `afterLayout`.
	 * @private
	 */
	_updateLayout() {
		const me = this;

		if (me._plugins.notify(me, 'beforeLayout') === false) {
			return;
		}

		layouts.update(me, me.width, me.height);

		me._layers = [];
		each(me.boxes, (box) => {
			// configure is called twice, once in core.scale.update and once here.
			// Here the boxes are fully updated and at their final positions.
			if (box.configure) {
				box.configure();
			}
			me._layers.push(...box._layers());
		}, me);

		me._layers.forEach((item, index) => {
			item._idx = index;
		});

		me._plugins.notify(me, 'afterLayout');
	}

	/**
	 * Updates all datasets unless a plugin returns `false` to the `beforeDatasetsUpdate`
	 * hook, in which case, plugins will not be called on `afterDatasetsUpdate`.
	 * @private
	 */
	_updateDatasets(mode) {
		const me = this;
		const isFunction = typeof mode === 'function';
		const args = {mode};

		if (me._plugins.notify(me, 'beforeDatasetsUpdate', [args]) === false) {
			return;
		}

		for (let i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
			me._updateDataset(i, isFunction ? mode({datasetIndex: i}) : mode);
		}

		me._plugins.notify(me, 'afterDatasetsUpdate', [args]);
	}

	/**
	 * Updates dataset at index unless a plugin returns `false` to the `beforeDatasetUpdate`
	 * hook, in which case, plugins will not be called on `afterDatasetUpdate`.
	 * @private
	 */
	_updateDataset(index, mode) {
		const me = this;
		const meta = me.getDatasetMeta(index);
		const args = {meta, index, mode};

		if (me._plugins.notify(me, 'beforeDatasetUpdate', [args]) === false) {
			return;
		}

		meta.controller._update(mode);

		me._plugins.notify(me, 'afterDatasetUpdate', [args]);
	}

	render() {
		const me = this;
		if (me._plugins.notify(me, 'beforeRender') === false) {
			return;
		}

		if (animator.has(me)) {
			if (me.attached && !animator.running(me)) {
				animator.start(me);
			}
		} else {
			me.draw();
			onAnimationsComplete({chart: me});
		}
	}

	draw() {
		const me = this;
		let i;
		if (me._resizeBeforeDraw) {
			const {width, height} = me._resizeBeforeDraw;
			me._resize(width, height);
			me._resizeBeforeDraw = null;
		}
		me.clear();

		if (me.width <= 0 || me.height <= 0) {
			return;
		}

		if (me._plugins.notify(me, 'beforeDraw') === false) {
			return;
		}

		// Because of plugin hooks (before/afterDatasetsDraw), datasets can't
		// currently be part of layers. Instead, we draw
		// layers <= 0 before(default, backward compat), and the rest after
		const layers = me._layers;
		for (i = 0; i < layers.length && layers[i].z <= 0; ++i) {
			layers[i].draw(me.chartArea);
		}

		me._drawDatasets();

		// Rest of layers
		for (; i < layers.length; ++i) {
			layers[i].draw(me.chartArea);
		}

		me._plugins.notify(me, 'afterDraw');
	}

	/**
	 * @private
	 */
	_getSortedDatasetMetas(filterVisible) {
		const me = this;
		const metasets = me._sortedMetasets;
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
		const me = this;

		if (me._plugins.notify(me, 'beforeDatasetsDraw') === false) {
			return;
		}

		const metasets = me.getSortedVisibleDatasetMetas();
		for (let i = metasets.length - 1; i >= 0; --i) {
			me._drawDataset(metasets[i]);
		}

		me._plugins.notify(me, 'afterDatasetsDraw');
	}

	/**
	 * Draws dataset at index unless a plugin returns `false` to the `beforeDatasetDraw`
	 * hook, in which case, plugins will not be called on `afterDatasetDraw`.
	 * @private
	 */
	_drawDataset(meta) {
		const me = this;
		const ctx = me.ctx;
		const clip = meta._clip;
		const area = me.chartArea;
		const args = {
			meta,
			index: meta.index,
		};

		if (me._plugins.notify(me, 'beforeDatasetDraw', [args]) === false) {
			return;
		}

		clipArea(ctx, {
			left: clip.left === false ? 0 : area.left - clip.left,
			right: clip.right === false ? me.width : area.right + clip.right,
			top: clip.top === false ? 0 : area.top - clip.top,
			bottom: clip.bottom === false ? me.height : area.bottom + clip.bottom
		});

		meta.controller.draw();

		unclipArea(ctx);

		me._plugins.notify(me, 'afterDatasetDraw', [args]);
	}

	getElementsAtEventForMode(e, mode, options, useFinalPosition) {
		const method = Interaction.modes[mode];
		if (typeof method === 'function') {
			return method(this, e, options, useFinalPosition);
		}

		return [];
	}

	getDatasetMeta(datasetIndex) {
		const me = this;
		const dataset = me.data.datasets[datasetIndex];
		const metasets = me._metasets;
		let meta = metasets.filter(x => x && x._dataset === dataset).pop();

		if (!meta) {
			meta = metasets[datasetIndex] = {
				type: null,
				data: [],
				dataset: null,
				controller: null,
				hidden: null,			// See isDatasetVisible() comment
				xAxisID: null,
				yAxisID: null,
				order: dataset.order || 0,
				index: datasetIndex,
				_dataset: dataset,
				_parsed: [],
				_sorted: false
			};
		}

		return meta;
	}

	getContext() {
		return this.$context || (this.$context = Object.create(null, {
			chart: {
				value: this
			},
			type: {
				value: 'chart'
			}
		}));
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
	_updateDatasetVisibility(datasetIndex, visible) {
		const me = this;
		const mode = visible ? 'show' : 'hide';
		const meta = me.getDatasetMeta(datasetIndex);
		const anims = meta.controller._resolveAnimations(undefined, mode);
		me.setDatasetVisibility(datasetIndex, visible);

		// Animate visible state, so hide animation can be seen. This could be handled better if update / updateDataset returned a Promise.
		anims.update(meta, {visible});

		me.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : undefined);
	}

	hide(datasetIndex) {
		this._updateDatasetVisibility(datasetIndex, false);
	}

	show(datasetIndex) {
		this._updateDatasetVisibility(datasetIndex, true);
	}

	/**
	 * @private
	 */
	_destroyDatasetMeta(datasetIndex) {
		const me = this;
		const meta = me._metasets && me._metasets[datasetIndex];

		if (meta) {
			meta.controller._destroy();
			delete me._metasets[datasetIndex];
		}
	}

	destroy() {
		const me = this;
		const canvas = me.canvas;
		let i, ilen;

		me.stop();
		animator.remove(me);

		// dataset controllers need to cleanup associated data
		for (i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
			me._destroyDatasetMeta(i);
		}

		if (canvas) {
			me.unbindEvents();
			canvasClear(me);
			me.platform.releaseContext(me.ctx);
			me.canvas = null;
			me.ctx = null;
		}

		me._plugins.notify(me, 'destroy');

		delete Chart.instances[me.id];
	}

	toBase64Image(...args) {
		return this.canvas.toDataURL(...args);
	}

	/**
	 * @private
	 */
	bindEvents() {
		const me = this;
		const listeners = me._listeners;
		const platform = me.platform;

		const _add = (type, listener) => {
			platform.addEventListener(me, type, listener);
			listeners[type] = listener;
		};
		const _remove = (type, listener) => {
			if (listeners[type]) {
				platform.removeEventListener(me, type, listener);
				delete listeners[type];
			}
		};

		let listener = function(e, x, y) {
			e.offsetX = x;
			e.offsetY = y;
			me._eventHandler(e);
		};

		each(me.options.events, (type) => _add(type, listener));

		if (me.options.responsive) {
			listener = (width, height) => {
				if (me.canvas) {
					me.resize(width, height);
				}
			};

			let detached; // eslint-disable-line prefer-const
			const attached = () => {
				_remove('attach', attached);

				me.attached = true;
				me.resize();

				_add('resize', listener);
				_add('detach', detached);
			};

			detached = () => {
				me.attached = false;

				_remove('resize', listener);
				_add('attach', attached);
			};

			if (platform.isAttached(me.canvas)) {
				attached();
			} else {
				detached();
			}
		} else {
			me.attached = true;
		}
	}

	/**
	 * @private
	 */
	unbindEvents() {
		const me = this;
		const listeners = me._listeners;
		if (!listeners) {
			return;
		}

		delete me._listeners;
		each(listeners, (listener, type) => {
			me.platform.removeEventListener(me, type, listener);
		});
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
			if (item) {
				this.getDatasetMeta(item.datasetIndex).controller[prefix + 'HoverStyle'](item.element, item.datasetIndex, item.index);
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
		const me = this;
		const lastActive = me._active || [];
		const active = activeElements.map(({datasetIndex, index}) => {
			const meta = me.getDatasetMeta(datasetIndex);
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
			me._active = active;
			me._updateHoverStyles(active, lastActive);
		}
	}

	/**
	 * @private
	 */
	_updateHoverStyles(active, lastActive) {
		const me = this;
		const options = me.options || {};
		const hoverOptions = options.hover;

		// Remove styling for last active (even if it may still be active)
		if (lastActive.length) {
			me.updateHoverStyle(lastActive, hoverOptions.mode, false);
		}

		// Built-in hover styling
		if (active.length && hoverOptions.mode) {
			me.updateHoverStyle(active, hoverOptions.mode, true);
		}
	}

	/**
	 * @private
	 */
	_eventHandler(e, replay) {
		const me = this;

		if (me._plugins.notify(me, 'beforeEvent', [e, replay]) === false) {
			return;
		}

		const changed = me._handleEvent(e, replay);

		me._plugins.notify(me, 'afterEvent', [e, replay]);

		if (changed) {
			me.render();
		}

		return me;
	}

	/**
	 * Handle an event
	 * @param {ChartEvent} e the event to handle
	 * @param {boolean} [replay] - true if the event was replayed by `update`
	 * @return {boolean} true if the chart needs to re-render
	 * @private
	 */
	_handleEvent(e, replay) {
		const me = this;
		const lastActive = me._active || [];
		const options = me.options;
		const hoverOptions = options.hover;

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

		let active = [];
		let changed = false;

		// Find Active Elements for hover and tooltips
		if (e.type === 'mouseout') {
			me._lastEvent = null;
		} else {
			active = me.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
			me._lastEvent = e.type === 'click' ? me._lastEvent : e;
		}

		// Invoke onHover hook
		callCallback(options.onHover || options.hover.onHover, [e, active, me], me);

		if (e.type === 'mouseup' || e.type === 'click' || e.type === 'contextmenu') {
			if (_isPointInArea(e, me.chartArea)) {
				callCallback(options.onClick, [e, active, me], me);
			}
		}

		changed = !_elementsEqual(active, lastActive);
		if (changed || replay) {
			me._active = active;
			me._updateHoverStyles(active, lastActive);
		}

		return changed;
	}
}

// These are available to both, UMD and ESM packages
Chart.defaults = defaults;
Chart.instances = {};
Chart.registry = registry;
Chart.version = version;

Chart.getChart = (key) => {
	const canvas = getCanvas(key);
	return Object.values(Chart.instances).filter((c) => c.canvas === canvas).pop();
};

// @ts-ignore
const invalidatePlugins = () => each(Chart.instances, (chart) => chart._plugins.invalidate());

Chart.register = (...items) => {
	registry.add(...items);
	invalidatePlugins();
};
Chart.unregister = (...items) => {
	registry.remove(...items);
	invalidatePlugins();
};

export default Chart;
