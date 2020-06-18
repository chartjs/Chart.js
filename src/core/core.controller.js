/* eslint-disable import/no-namespace, import/namespace */
import animator from './core.animator';
import * as controllers from '../controllers';
import defaults from './core.defaults';
import Interaction from './core.interaction';
import layouts from './core.layouts';
import {BasicPlatform, DomPlatform} from '../platform';
import plugins from './core.plugins';
import scaleService from './core.scaleService';
import {getMaximumWidth, getMaximumHeight, retinaScale} from '../helpers/helpers.dom';
import {mergeIf, merge, _merger, each, callback as callCallback, uid, valueOrDefault, _elementsEqual} from '../helpers/helpers.core';
import {clear as canvasClear, clipArea, unclipArea, _isPointInArea} from '../helpers/helpers.canvas';
// @ts-ignore
import {version} from '../../package.json';

/**
 * @typedef { import("../platform/platform.base").IEvent } IEvent
 */


function getIndexAxis(type, options) {
	const typeDefaults = defaults[type] || {};
	const datasetDefaults = typeDefaults.datasets || {};
	const typeOptions = options[type] || {};
	const datasetOptions = typeOptions.datasets || {};
	return datasetOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || 'x';
}

function getAxisFromDefaultScaleID(id, indexAxis) {
	let axis = id;
	if (id === '_index_') {
		axis = indexAxis;
	} else if (id === '_value_') {
		axis = indexAxis === 'x' ? 'y' : 'x';
	}
	return axis;
}

function getDefaultScaleIDFromAxis(axis, indexAxis) {
	return axis === indexAxis ? '_index_' : '_value_';
}

function mergeScaleConfig(config, options) {
	options = options || {};
	const chartDefaults = defaults[config.type] || {scales: {}};
	const configScales = options.scales || {};
	const chartIndexAxis = getIndexAxis(config.type, options);
	const firstIDs = {};
	const scales = {};

	// First figure out first scale id's per axis.
	Object.keys(configScales).forEach(id => {
		const scaleConf = configScales[id];
		const axis = determineAxis(id, scaleConf);
		const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
		firstIDs[axis] = firstIDs[axis] || id;
		scales[id] = mergeIf({axis}, [scaleConf, chartDefaults.scales[axis], chartDefaults.scales[defaultId]]);
	});

	// Backward compatibility
	if (options.scale) {
		scales[options.scale.id || 'r'] = mergeIf({axis: 'r'}, [options.scale, chartDefaults.scales.r]);
		firstIDs.r = firstIDs.r || options.scale.id || 'r';
	}

	// Then merge dataset defaults to scale configs
	config.data.datasets.forEach(dataset => {
		const type = dataset.type || config.type;
		const indexAxis = dataset.indexAxis || getIndexAxis(type, options);
		const datasetDefaults = defaults[type] || {};
		const defaultScaleOptions = datasetDefaults.scales || {};
		Object.keys(defaultScaleOptions).forEach(defaultID => {
			const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
			const id = dataset[axis + 'AxisID'] || firstIDs[axis] || axis;
			scales[id] = scales[id] || {};
			mergeIf(scales[id], [{axis}, configScales[id], defaultScaleOptions[defaultID]]);
		});
	});

	// apply scale defaults, if not overridden by dataset defaults
	Object.keys(scales).forEach(key => {
		const scale = scales[key];
		mergeIf(scale, scaleService.getScaleDefaults(scale.type));
	});

	return scales;
}

/**
 * Recursively merge the given config objects as the root options by handling
 * default scale options for the `scales` and `scale` properties, then returns
 * a deep copy of the result, thus doesn't alter inputs.
 */
function mergeConfig(...args/* config objects ... */) {
	return merge({}, args, {
		merger(key, target, source, options) {
			if (key !== 'scales' && key !== 'scale') {
				_merger(key, target, source, options);
			}
		}
	});
}

function initConfig(config) {
	config = config || {};

	// Do NOT use mergeConfig for the data object because this method merges arrays
	// and so would change references to labels and datasets, preventing data updates.
	const data = config.data = config.data || {datasets: [], labels: []};
	data.datasets = data.datasets || [];
	data.labels = data.labels || [];

	const scaleConfig = mergeScaleConfig(config, config.options);

	config.options = mergeConfig(
		defaults,
		defaults[config.type],
		config.options || {});

	config.options.scales = scaleConfig;

	return config;
}

function isAnimationDisabled(config) {
	return !config.animation;
}

function updateConfig(chart) {
	let newOptions = chart.options;

	each(chart.scales, (scale) => {
		layouts.removeBox(chart, scale);
	});

	const scaleConfig = mergeScaleConfig(chart.config, newOptions);

	newOptions = mergeConfig(
		defaults,
		defaults[chart.config.type],
		newOptions);

	chart.options = chart.config.options = newOptions;
	chart.options.scales = scaleConfig;

	chart._animationsDisabled = isAnimationDisabled(newOptions);
}

const KNOWN_POSITIONS = ['top', 'bottom', 'left', 'right', 'chartArea'];
function positionIsHorizontal(position, axis) {
	return position === 'top' || position === 'bottom' || (KNOWN_POSITIONS.indexOf(position) === -1 && axis === 'x');
}

function axisFromPosition(position) {
	if (position === 'top' || position === 'bottom') {
		return 'x';
	}
	if (position === 'left' || position === 'right') {
		return 'y';
	}
}

function determineAxis(id, scaleOptions) {
	if (id === 'x' || id === 'y' || id === 'r') {
		return id;
	}
	return scaleOptions.axis || axisFromPosition(scaleOptions.position) || id.charAt(0).toLowerCase();
}

function compare2Level(l1, l2) {
	return function(a, b) {
		return a[l1] === b[l1]
			? a[l2] - b[l2]
			: a[l1] - b[l1];
	};
}

function onAnimationsComplete(ctx) {
	const chart = ctx.chart;
	const animationOptions = chart.options.animation;

	plugins.notify(chart, 'afterRender');
	callCallback(animationOptions && animationOptions.onComplete, [ctx], chart);
}

function onAnimationProgress(ctx) {
	const chart = ctx.chart;
	const animationOptions = chart.options.animation;
	callCallback(animationOptions && animationOptions.onProgress, [ctx], chart);
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
	} else if (item.length) {
		// Support for array based queries (such as jQuery)
		item = item[0];
	}

	if (item && item.canvas) {
		// Support for any object associated to a canvas (including a context2d)
		item = item.canvas;
	}
	return item;
}

function computeNewSize(canvas, width, height, aspectRatio) {
	if (width === undefined || height === undefined) {
		width = getMaximumWidth(canvas);
		height = getMaximumHeight(canvas);
	}
	// the canvas render width and height will be casted to integers so make sure that
	// the canvas display style uses the same integer values to avoid blurring effect.

	// Minimum values set to 0 instead of canvas.size because the size defaults to 300x150 if the element is collapsed
	width = Math.max(0, Math.floor(width));
	return {
		width,
		height: Math.max(0, Math.floor(aspectRatio ? width / aspectRatio : height))
	};
}

class Chart {

	// eslint-disable-next-line max-statements
	constructor(item, config) {
		const me = this;

		config = initConfig(config);
		const initialCanvas = getCanvas(item);
		this.platform = me._initializePlatform(initialCanvas, config);

		const context = me.platform.acquireContext(initialCanvas, config);
		const canvas = context && context.canvas;
		const height = canvas && canvas.height;
		const width = canvas && canvas.width;

		this.id = uid();
		this.ctx = context;
		this.canvas = canvas;
		this.config = config;
		this.width = width;
		this.height = height;
		this.aspectRatio = height ? width / height : null;
		this.options = config.options;
		this._bufferedRender = false;
		this._layers = [];
		this._metasets = [];
		this.boxes = [];
		this.currentDevicePixelRatio = undefined;
		this.chartArea = undefined;
		this.data = undefined;
		this._active = [];
		this._lastEvent = undefined;
		/** @type {{attach?: function, detach?: function, resize?: function}} */
		this._listeners = {};
		this._sortedMetasets = [];
		this._updating = false;
		this.scales = {};
		this.scale = undefined;
		this.$plugins = undefined;
		this.$proxies = {};
		this._hiddenIndices = {};
		this.attached = false;

		// Add the chart instance to the global namespace
		Chart.instances[me.id] = me;

		// Define alias to the config data: `chart.data === chart.config.data`
		Object.defineProperty(me, 'data', {
			get() {
				return me.config.data;
			},
			set(value) {
				me.config.data = value;
			}
		});

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

	/**
	 * @private
	 */
	_initialize() {
		const me = this;

		// Before init plugin notification
		plugins.notify(me, 'beforeInit');

		if (me.options.responsive) {
			// Initial resize before chart draws (must be silent to preserve initial animations).
			me.resize(true);
		} else {
			retinaScale(me, me.options.devicePixelRatio);
		}

		me.bindEvents();

		// After init plugin notification
		plugins.notify(me, 'afterInit');

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

	resize(silent, width, height) {
		const me = this;
		const options = me.options;
		const canvas = me.canvas;
		const aspectRatio = options.maintainAspectRatio && me.aspectRatio;
		const newSize = computeNewSize(canvas, width, height, aspectRatio);

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

		if (!silent) {
			plugins.notify(me, 'resize', [newSize]);

			callCallback(options.onResize, [newSize], me);

			if (me.attached) {
				me.update('resize');
			}
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
				const scaleClass = scaleService.getScaleConstructor(scaleType);
				if (!scaleClass) {
					return;
				}
				scale = new scaleClass({
					id,
					type: scaleType,
					ctx: me.ctx,
					chart: me
				});
				scales[scale.id] = scale;
			}

			scale.init(scaleOptions);

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

		scaleService.addScalesToLayout(this);
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

	buildOrUpdateControllers() {
		const me = this;
		const newControllers = [];
		const datasets = me.data.datasets;
		let i, ilen;

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
				const ControllerClass = controllers[meta.type];
				if (ControllerClass === undefined) {
					throw new Error('"' + meta.type + '" is not a chart type.');
				}

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
		plugins.notify(this, 'reset');
	}

	update(mode) {
		const me = this;
		let i, ilen;

		me._updating = true;

		updateConfig(me);

		me.ensureScalesHaveIDs();
		me.buildOrUpdateScales();

		// plugins options references might have change, let's invalidate the cache
		// https://github.com/chartjs/Chart.js/issues/5111#issuecomment-355934167
		plugins.invalidate(me);

		if (plugins.notify(me, 'beforeUpdate') === false) {
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
		if (me.options.animation) {
			each(newControllers, (controller) => {
				controller.reset();
			});
		}

		me._updateDatasets(mode);

		// Do this before render so that any plugins that need final scale updates can use it
		plugins.notify(me, 'afterUpdate');

		me._layers.sort(compare2Level('z', '_idx'));

		// Replay last event from before update
		if (me._lastEvent) {
			me._eventHandler(me._lastEvent, true);
		}

		me.render();

		me._updating = false;
	}

	/**
	 * Updates the chart layout unless a plugin returns `false` to the `beforeLayout`
	 * hook, in which case, plugins will not be called on `afterLayout`.
	 * @private
	 */
	_updateLayout() {
		const me = this;

		if (plugins.notify(me, 'beforeLayout') === false) {
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

		plugins.notify(me, 'afterLayout');
	}

	/**
	 * Updates all datasets unless a plugin returns `false` to the `beforeDatasetsUpdate`
	 * hook, in which case, plugins will not be called on `afterDatasetsUpdate`.
	 * @private
	 */
	_updateDatasets(mode) {
		const me = this;
		const isFunction = typeof mode === 'function';

		if (plugins.notify(me, 'beforeDatasetsUpdate') === false) {
			return;
		}

		for (let i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
			me._updateDataset(i, isFunction ? mode({datasetIndex: i}) : mode);
		}

		plugins.notify(me, 'afterDatasetsUpdate');
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

		if (plugins.notify(me, 'beforeDatasetUpdate', [args]) === false) {
			return;
		}

		meta.controller._update(mode);

		plugins.notify(me, 'afterDatasetUpdate', [args]);
	}

	render() {
		const me = this;
		const animationOptions = me.options.animation;
		if (plugins.notify(me, 'beforeRender') === false) {
			return;
		}
		const onComplete = function() {
			plugins.notify(me, 'afterRender');
			callCallback(animationOptions && animationOptions.onComplete, [], me);
		};

		if (animator.has(me)) {
			if (me.attached && !animator.running(me)) {
				animator.start(me);
			}
		} else {
			me.draw();
			onComplete();
		}
	}

	draw() {
		const me = this;
		let i;

		me.clear();

		if (me.width <= 0 || me.height <= 0) {
			return;
		}

		if (plugins.notify(me, 'beforeDraw') === false) {
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

		plugins.notify(me, 'afterDraw');
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

		if (plugins.notify(me, 'beforeDatasetsDraw') === false) {
			return;
		}

		const metasets = me.getSortedVisibleDatasetMetas();
		for (let i = metasets.length - 1; i >= 0; --i) {
			me._drawDataset(metasets[i]);
		}

		plugins.notify(me, 'afterDatasetsDraw');
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

		if (plugins.notify(me, 'beforeDatasetDraw', [args]) === false) {
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

		plugins.notify(me, 'afterDatasetDraw', [args]);
	}

	/**
	 * Get the single element that was clicked on
	 * @return An object containing the dataset index and element index of the matching element. Also contains the rectangle that was draw
	 */
	getElementAtEvent(e) {
		return Interaction.modes.nearest(this, e, {intersect: true});
	}

	getElementsAtEvent(e) {
		return Interaction.modes.index(this, e, {intersect: true});
	}

	getElementsAtXAxis(e) {
		return Interaction.modes.index(this, e, {intersect: false});
	}

	getElementsAtEventForMode(e, mode, options, useFinalPosition) {
		const method = Interaction.modes[mode];
		if (typeof method === 'function') {
			return method(this, e, options, useFinalPosition);
		}

		return [];
	}

	getDatasetAtEvent(e) {
		return Interaction.modes.dataset(this, e, {intersect: true});
	}

	getDatasetMeta(datasetIndex) {
		const me = this;
		const dataset = me.data.datasets[datasetIndex];
		const metasets = me._metasets;
		let meta = metasets.filter(x => x._dataset === dataset).pop();

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

	getVisibleDatasetCount() {
		return this.getSortedVisibleDatasetMetas().length;
	}

	isDatasetVisible(datasetIndex) {
		const meta = this.getDatasetMeta(datasetIndex);

		// meta.hidden is a per chart dataset hidden flag override with 3 states: if true or false,
		// the dataset.hidden value is ignored, else if null, the dataset hidden state is returned.
		return typeof meta.hidden === 'boolean' ? !meta.hidden : !this.data.datasets[datasetIndex].hidden;
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

		plugins.notify(me, 'destroy');

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

		let listener = function(e) {
			me._eventHandler(e);
		};

		each(me.options.events, (type) => _add(type, listener));

		if (me.options.responsive) {
			listener = (width, height) => {
				if (me.canvas) {
					me.resize(false, width, height);
				}
			};

			let detached; // eslint-disable-line prefer-const
			const attached = () => {
				_remove('attach', attached);

				me.resize();
				me.attached = true;

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

		if (plugins.notify(me, 'beforeEvent', [e, replay]) === false) {
			return;
		}

		me._handleEvent(e, replay);

		plugins.notify(me, 'afterEvent', [e, replay]);

		me.render();

		return me;
	}

	/**
	 * Handle an event
	 * @param {IEvent} e the event to handle
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
		// It's the last event (excluding click) that has occured before `update`.
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

		if (e.type === 'mouseup' || e.type === 'click') {
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

Chart.version = version;

/**
 * NOTE(SB) We actually don't use this container anymore but we need to keep it
 * for backward compatibility. Though, it can still be useful for plugins that
 * would need to work on multiple charts?!
 */
Chart.instances = {};

export default Chart;
