'use strict';

var Animator = require('./core.animator');
var controllers = require('../controllers/index');
var defaults = require('./core.defaults');
var helpers = require('../helpers/index');
var Interaction = require('./core.interaction');
var layouts = require('./core.layouts');
var platform = require('../platforms/platform');
var plugins = require('./core.plugins');
var scaleService = require('../core/core.scaleService');
var Tooltip = require('./core.tooltip');

var valueOrDefault = helpers.valueOrDefault;

defaults._set('global', {
	elements: {},
	events: [
		'mousemove',
		'mouseout',
		'click',
		'touchstart',
		'touchmove'
	],
	hover: {
		onHover: null,
		mode: 'nearest',
		intersect: true
	},
	onClick: null,
	maintainAspectRatio: true,
	responsive: true
});

function mergeScaleConfig(config, options) {
	options = options || {};
	const chartDefaults = defaults[config.type] || {scales: {}};
	const configScales = options.scales || {};
	const firstIDs = {};
	const scales = {};

	// First figure out first scale id's per axis.
	// Note: for now, axis is determined from first letter of scale id!
	Object.keys(configScales).forEach(id => {
		const axis = id[0];
		firstIDs[axis] = firstIDs[axis] || id;
		scales[id] = helpers.mergeIf({}, [configScales[id], chartDefaults.scales[axis]]);
	});

	// Backward compatibility
	if (options.scale) {
		scales[options.scale.id || 'r'] = helpers.mergeIf({}, [options.scale, chartDefaults.scales.r]);
		firstIDs.r = firstIDs.r || options.scale.id || 'r';
	}

	// Then merge dataset defaults to scale configs
	config.data.datasets.forEach(dataset => {
		const datasetDefaults = defaults[dataset.type || config.type] || {scales: {}};
		const defaultScaleOptions = datasetDefaults.scales || {};
		Object.keys(defaultScaleOptions).forEach(defaultID => {
			const id = dataset[defaultID + 'AxisID'] || firstIDs[defaultID] || defaultID;
			scales[id] = scales[id] || {};
			helpers.mergeIf(scales[id], [
				configScales[id],
				defaultScaleOptions[defaultID]
			]);
		});
	});

	// apply scale defaults, if not overridden by dataset defaults
	Object.keys(scales).forEach(key => {
		const scale = scales[key];
		helpers.mergeIf(scale, scaleService.getScaleDefaults(scale.type));
	});

	return scales;
}

/**
 * Recursively merge the given config objects as the root options by handling
 * default scale options for the `scales` and `scale` properties, then returns
 * a deep copy of the result, thus doesn't alter inputs.
 */
function mergeConfig(/* config objects ... */) {
	return helpers.merge({}, [].slice.call(arguments), {
		merger: function(key, target, source, options) {
			if (key !== 'scales' && key !== 'scale') {
				helpers._merger(key, target, source, options);
			}
		}
	});
}

function initConfig(config) {
	config = config || {};

	// Do NOT use mergeConfig for the data object because this method merges arrays
	// and so would change references to labels and datasets, preventing data updates.
	const data = config.data = config.data || {};
	data.datasets = data.datasets || [];
	data.labels = data.labels || [];

	const scaleConfig = mergeScaleConfig(config, config.options);

	config.options = mergeConfig(
		defaults.global,
		defaults[config.type],
		config.options || {});

	config.options.scales = scaleConfig;

	return config;
}

function isAnimationDisabled(config) {
	return !config.animation;
}

function updateConfig(chart) {
	var newOptions = chart.options;

	helpers.each(chart.scales, function(scale) {
		layouts.removeBox(chart, scale);
	});

	const scaleConfig = mergeScaleConfig(chart.config, newOptions);

	newOptions = mergeConfig(
		defaults.global,
		defaults[chart.config.type],
		newOptions);

	chart.options = chart.config.options = newOptions;
	chart.options.scales = scaleConfig;

	chart._animationsDisabled = isAnimationDisabled(newOptions);
	chart.ensureScalesHaveIDs();
	chart.buildOrUpdateScales();

	chart.tooltip.initialize();
}

const KNOWN_POSITIONS = new Set(['top', 'bottom', 'left', 'right', 'chartArea']);
function positionIsHorizontal(position, axis) {
	return position === 'top' || position === 'bottom' || (!KNOWN_POSITIONS.has(position) && axis === 'x');
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
	helpers.callback(animationOptions && animationOptions.onComplete, arguments, chart);
}

function onAnimationProgress(ctx) {
	const chart = ctx.chart;
	const animationOptions = chart.options.animation;
	helpers.callback(animationOptions && animationOptions.onProgress, arguments, chart);
}

var Chart = function(item, config) {
	this.construct(item, config);
	return this;
};

helpers.extend(Chart.prototype, /** @lends Chart */ {
	/**
	 * @private
	 */
	construct: function(item, config) {
		var me = this;

		config = initConfig(config);

		var context = platform.acquireContext(item, config);
		var canvas = context && context.canvas;
		var height = canvas && canvas.height;
		var width = canvas && canvas.width;

		me.id = helpers.uid();
		me.ctx = context;
		me.canvas = canvas;
		me.config = config;
		me.width = width;
		me.height = height;
		me.aspectRatio = height ? width / height : null;
		me.options = config.options;
		me._bufferedRender = false;
		me._layers = [];
		me._metasets = [];

		// Add the chart instance to the global namespace
		Chart.instances[me.id] = me;

		// Define alias to the config data: `chart.data === chart.config.data`
		Object.defineProperty(me, 'data', {
			get: function() {
				return me.config.data;
			},
			set: function(value) {
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

		Animator.listen(me, 'complete', onAnimationsComplete);
		Animator.listen(me, 'progress', onAnimationProgress);

		me.initialize();
		me.update();
	},

	/**
	 * @private
	 */
	initialize: function() {
		var me = this;

		// Before init plugin notification
		plugins.notify(me, 'beforeInit');

		helpers.dom.retinaScale(me, me.options.devicePixelRatio);

		me.bindEvents();

		if (me.options.responsive) {
			// Initial resize before chart draws (must be silent to preserve initial animations).
			me.resize(true);
		}

		me.initToolTip();

		// After init plugin notification
		plugins.notify(me, 'afterInit');

		return me;
	},

	clear: function() {
		helpers.canvas.clear(this);
		return this;
	},

	stop: function() {
		Animator.stop(this);
		return this;
	},

	resize: function(silent) {
		var me = this;
		var options = me.options;
		var canvas = me.canvas;
		var aspectRatio = (options.maintainAspectRatio && me.aspectRatio) || null;

		// the canvas render width and height will be casted to integers so make sure that
		// the canvas display style uses the same integer values to avoid blurring effect.

		// Set to 0 instead of canvas.size because the size defaults to 300x150 if the element is collapsed
		var newWidth = Math.max(0, Math.floor(helpers.dom.getMaximumWidth(canvas)));
		var newHeight = Math.max(0, Math.floor(aspectRatio ? newWidth / aspectRatio : helpers.dom.getMaximumHeight(canvas)));

		if (me.width === newWidth && me.height === newHeight) {
			return;
		}

		canvas.width = me.width = newWidth;
		canvas.height = me.height = newHeight;
		canvas.style.width = newWidth + 'px';
		canvas.style.height = newHeight + 'px';

		helpers.dom.retinaScale(me, options.devicePixelRatio);

		if (!silent) {
			// Notify any plugins about the resize
			var newSize = {width: newWidth, height: newHeight};
			plugins.notify(me, 'resize', [newSize]);

			// Notify of resize
			if (options.onResize) {
				options.onResize(me, newSize);
			}

			me.stop();
			me.update('resize');
		}
	},

	ensureScalesHaveIDs: function() {
		var options = this.options;
		var scalesOptions = options.scales || {};
		var scaleOptions = options.scale;

		helpers.each(scalesOptions, function(axisOptions, axisID) {
			axisOptions.id = axisID;
		});

		if (scaleOptions) {
			scaleOptions.id = scaleOptions.id || 'scale';
		}
	},

	/**
	 * Builds a map of scale ID to scale object for future lookup.
	 */
	buildOrUpdateScales: function() {
		const me = this;
		const options = me.options;
		const scaleOpts = options.scales;
		const scales = me.scales || {};
		const updated = Object.keys(scales).reduce(function(obj, id) {
			obj[id] = false;
			return obj;
		}, {});
		let items = [];

		if (scaleOpts) {
			items = items.concat(
				Object.keys(scaleOpts).map(function(axisID) {
					const axisOptions = scaleOpts[axisID];
					const isRadial = axisID.charAt(0).toLowerCase === 'r';
					const isHorizontal = axisID.charAt(0).toLowerCase() === 'x';
					return {
						options: axisOptions,
						dposition: isRadial ? 'chartArea' : isHorizontal ? 'bottom' : 'left',
						dtype: isRadial ? 'radialLinear' : isHorizontal ? 'category' : 'linear'
					};
				})
			);
		}

		helpers.each(items, function(item) {
			const scaleOptions = item.options;
			const id = scaleOptions.id;
			const scaleType = valueOrDefault(scaleOptions.type, item.dtype);

			if (scaleOptions.position === undefined || positionIsHorizontal(scaleOptions.position, scaleOptions.axis || id[0]) !== positionIsHorizontal(item.dposition)) {
				scaleOptions.position = item.dposition;
			}

			updated[id] = true;
			let scale = null;
			if (id in scales && scales[id].type === scaleType) {
				scale = scales[id];
				scale.options = scaleOptions;
				scale.ctx = me.ctx;
				scale.chart = me;
			} else {
				const scaleClass = scaleService.getScaleConstructor(scaleType);
				if (!scaleClass) {
					return;
				}
				scale = new scaleClass({
					id: id,
					type: scaleType,
					options: scaleOptions,
					ctx: me.ctx,
					chart: me
				});
				scales[scale.id] = scale;
			}

			scale.axis = scale.options.position === 'chartArea' ? 'r' : scale.isHorizontal() ? 'x' : 'y';

			// parse min/max value, so we can properly determine min/max for other scales
			scale._userMin = scale._parse(scale.options.min);
			scale._userMax = scale._parse(scale.options.max);

			// TODO(SB): I think we should be able to remove this custom case (options.scale)
			// and consider it as a regular scale part of the "scales"" map only! This would
			// make the logic easier and remove some useless? custom code.
			if (item.isDefault) {
				me.scale = scale;
			}
		});
		// clear up discarded scales
		helpers.each(updated, function(hasUpdated, id) {
			if (!hasUpdated) {
				delete scales[id];
			}
		});

		me.scales = scales;

		scaleService.addScalesToLayout(this);
	},

	/**
	 * Updates the given metaset with the given dataset index. Ensures it's stored at that index
	 * in the _metasets array by swapping with the metaset at that index if necessary.
	 * @param {Object} meta - the dataset metadata
	 * @param {number} index - the dataset index
	 * @private
	 */
	_updateMetasetIndex: function(meta, index) {
		const metasets = this._metasets;
		const oldIndex = meta.index;
		if (oldIndex !== index) {
			metasets[oldIndex] = metasets[index];
			metasets[index] = meta;
			meta.index = index;
		}
	},

	/**
	 * @private
	 */
	_updateMetasets: function() {
		const me = this;
		const metasets = me._metasets;
		const numData = me.data.datasets.length;
		const numMeta = metasets.length;

		if (numMeta > numData) {
			for (let i = numData; i < numMeta; ++i) {
				me.destroyDatasetMeta(i);
			}
			metasets.splice(numData, numMeta - numData);
		}
		me._sortedMetasets = metasets.slice(0).sort(compare2Level('order', 'index'));
	},

	buildOrUpdateControllers: function() {
		var me = this;
		var newControllers = [];
		var datasets = me.data.datasets;
		var i, ilen;

		for (i = 0, ilen = datasets.length; i < ilen; i++) {
			var dataset = datasets[i];
			var meta = me.getDatasetMeta(i);
			var type = dataset.type || me.config.type;

			if (meta.type && meta.type !== type) {
				me.destroyDatasetMeta(i);
				meta = me.getDatasetMeta(i);
			}
			meta.type = type;
			meta.order = dataset.order || 0;
			me._updateMetasetIndex(meta, i);
			meta.label = '' + dataset.label;
			meta.visible = me.isDatasetVisible(i);

			if (meta.controller) {
				meta.controller.updateIndex(i);
				meta.controller.linkScales();
			} else {
				var ControllerClass = controllers[meta.type];
				if (ControllerClass === undefined) {
					throw new Error('"' + meta.type + '" is not a chart type.');
				}

				meta.controller = new ControllerClass(me, i);
				newControllers.push(meta.controller);
			}
		}

		me._updateMetasets();
		return newControllers;
	},

	/**
	 * Reset the elements of all datasets
	 * @private
	 */
	resetElements: function() {
		var me = this;
		helpers.each(me.data.datasets, function(dataset, datasetIndex) {
			me.getDatasetMeta(datasetIndex).controller.reset();
		}, me);
	},

	/**
	* Resets the chart back to its state before the initial animation
	*/
	reset: function() {
		this.resetElements();
		this.tooltip.initialize();
	},

	update: function(mode) {
		var me = this;
		var i, ilen;

		me._updating = true;

		updateConfig(me);

		// plugins options references might have change, let's invalidate the cache
		// https://github.com/chartjs/Chart.js/issues/5111#issuecomment-355934167
		plugins._invalidate(me);

		if (plugins.notify(me, 'beforeUpdate') === false) {
			return;
		}

		// Make sure dataset controllers are updated and new controllers are reset
		var newControllers = me.buildOrUpdateControllers();

		// Make sure all dataset controllers have correct meta data counts
		for (i = 0, ilen = me.data.datasets.length; i < ilen; i++) {
			me.getDatasetMeta(i).controller.buildOrUpdateElements();
		}

		me.updateLayout();

		// Can only reset the new controllers after the scales have been updated
		if (me.options.animation) {
			helpers.each(newControllers, function(controller) {
				controller.reset();
			});
		}

		me.updateDatasets(mode);

		// Do this before render so that any plugins that need final scale updates can use it
		plugins.notify(me, 'afterUpdate');

		me._layers.sort(compare2Level('z', '_idx'));

		// Replay last event from before update
		if (me._lastEvent) {
			me.eventHandler(me._lastEvent);
		}

		me.render();

		me._updating = false;
	},

	/**
	 * Updates the chart layout unless a plugin returns `false` to the `beforeLayout`
	 * hook, in which case, plugins will not be called on `afterLayout`.
	 * @private
	 */
	updateLayout: function() {
		var me = this;

		if (plugins.notify(me, 'beforeLayout') === false) {
			return;
		}

		layouts.update(this, this.width, this.height);

		me._layers = [];
		helpers.each(me.boxes, function(box) {
			// _configure is called twice, once in core.scale.update and once here.
			// Here the boxes are fully updated and at their final positions.
			if (box._configure) {
				box._configure();
			}
			me._layers.push.apply(me._layers, box._layers());
		}, me);

		me._layers.forEach(function(item, index) {
			item._idx = index;
		});

		plugins.notify(me, 'afterLayout');
	},

	/**
	 * Updates all datasets unless a plugin returns `false` to the `beforeDatasetsUpdate`
	 * hook, in which case, plugins will not be called on `afterDatasetsUpdate`.
	 * @private
	 */
	updateDatasets: function(mode) {
		var me = this;

		if (plugins.notify(me, 'beforeDatasetsUpdate') === false) {
			return;
		}

		for (var i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
			me.updateDataset(i, mode);
		}

		plugins.notify(me, 'afterDatasetsUpdate');
	},

	/**
	 * Updates dataset at index unless a plugin returns `false` to the `beforeDatasetUpdate`
	 * hook, in which case, plugins will not be called on `afterDatasetUpdate`.
	 * @private
	 */
	updateDataset: function(index, mode) {
		const me = this;
		const meta = me.getDatasetMeta(index);
		const args = {meta, index, mode};

		if (plugins.notify(me, 'beforeDatasetUpdate', [args]) === false) {
			return;
		}

		meta.controller._update(mode);

		plugins.notify(me, 'afterDatasetUpdate', [args]);
	},

	render: function() {
		const me = this;
		const animationOptions = me.options.animation;
		if (plugins.notify(me, 'beforeRender') === false) {
			return;
		}
		var onComplete = function() {
			plugins.notify(me, 'afterRender');
			helpers.callback(animationOptions && animationOptions.onComplete, [], me);
		};

		if (Animator.has(me)) {
			if (!Animator.running(me)) {
				Animator.start(me);
			}
		} else {
			me.draw();
			onComplete();
		}
	},

	draw: function() {
		var me = this;
		var i, layers;

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
		layers = me._layers;
		for (i = 0; i < layers.length && layers[i].z <= 0; ++i) {
			layers[i].draw(me.chartArea);
		}

		me.drawDatasets();

		// Rest of layers
		for (; i < layers.length; ++i) {
			layers[i].draw(me.chartArea);
		}

		me._drawTooltip();

		plugins.notify(me, 'afterDraw');
	},

	/**
	 * @private
	 */
	_getSortedDatasetMetas: function(filterVisible) {
		var me = this;
		var metasets = me._sortedMetasets;
		var result = [];
		var i, ilen;

		for (i = 0, ilen = metasets.length; i < ilen; ++i) {
			const meta = metasets[i];
			if (!filterVisible || meta.visible) {
				result.push(meta);
			}
		}

		return result;
	},

	/**
	 * @private
	 */
	_getSortedVisibleDatasetMetas: function() {
		return this._getSortedDatasetMetas(true);
	},

	/**
	 * Draws all datasets unless a plugin returns `false` to the `beforeDatasetsDraw`
	 * hook, in which case, plugins will not be called on `afterDatasetsDraw`.
	 * @private
	 */
	drawDatasets: function() {
		var me = this;
		var metasets, i;

		if (plugins.notify(me, 'beforeDatasetsDraw') === false) {
			return;
		}

		metasets = me._getSortedVisibleDatasetMetas();
		for (i = metasets.length - 1; i >= 0; --i) {
			me.drawDataset(metasets[i]);
		}

		plugins.notify(me, 'afterDatasetsDraw');
	},

	/**
	 * Draws dataset at index unless a plugin returns `false` to the `beforeDatasetDraw`
	 * hook, in which case, plugins will not be called on `afterDatasetDraw`.
	 * @private
	 */
	drawDataset: function(meta) {
		var me = this;
		var ctx = me.ctx;
		var clip = meta._clip;
		var canvas = me.canvas;
		var area = me.chartArea;
		var args = {
			meta: meta,
			index: meta.index,
		};

		if (plugins.notify(me, 'beforeDatasetDraw', [args]) === false) {
			return;
		}

		helpers.canvas.clipArea(ctx, {
			left: clip.left === false ? 0 : area.left - clip.left,
			right: clip.right === false ? canvas.width : area.right + clip.right,
			top: clip.top === false ? 0 : area.top - clip.top,
			bottom: clip.bottom === false ? canvas.height : area.bottom + clip.bottom
		});

		meta.controller.draw();

		helpers.canvas.unclipArea(ctx);

		plugins.notify(me, 'afterDatasetDraw', [args]);
	},

	/**
	 * Draws tooltip unless a plugin returns `false` to the `beforeTooltipDraw`
	 * hook, in which case, plugins will not be called on `afterTooltipDraw`.
	 * @private
	 */
	_drawTooltip: function() {
		var me = this;
		var tooltip = me.tooltip;
		var args = {
			tooltip: tooltip
		};

		if (plugins.notify(me, 'beforeTooltipDraw', [args]) === false) {
			return;
		}

		tooltip.draw(me.ctx);

		plugins.notify(me, 'afterTooltipDraw', [args]);
	},

	/**
	 * Get the single element that was clicked on
	 * @return An object containing the dataset index and element index of the matching element. Also contains the rectangle that was draw
	 */
	getElementAtEvent: function(e) {
		return Interaction.modes.nearest(this, e, {intersect: true});
	},

	getElementsAtEvent: function(e) {
		return Interaction.modes.index(this, e, {intersect: true});
	},

	getElementsAtXAxis: function(e) {
		return Interaction.modes.index(this, e, {intersect: false});
	},

	getElementsAtEventForMode: function(e, mode, options) {
		var method = Interaction.modes[mode];
		if (typeof method === 'function') {
			return method(this, e, options);
		}

		return [];
	},

	getDatasetAtEvent: function(e) {
		return Interaction.modes.dataset(this, e, {intersect: true});
	},

	getDatasetMeta: function(datasetIndex) {
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
				_parsed: []
			};
		}

		return meta;
	},

	getVisibleDatasetCount: function() {
		return this._getSortedVisibleDatasetMetas().length;
	},

	isDatasetVisible: function(datasetIndex) {
		var meta = this.getDatasetMeta(datasetIndex);

		// meta.hidden is a per chart dataset hidden flag override with 3 states: if true or false,
		// the dataset.hidden value is ignored, else if null, the dataset hidden state is returned.
		return typeof meta.hidden === 'boolean' ? !meta.hidden : !this.data.datasets[datasetIndex].hidden;
	},

	generateLegend: function() {
		return this.options.legendCallback(this);
	},

	/**
	 * @private
	 */
	destroyDatasetMeta: function(datasetIndex) {
		const me = this;
		const meta = me._metasets && me._metasets[datasetIndex];

		if (meta) {
			meta.controller.destroy();
			delete me._metasets[datasetIndex];
		}
	},

	destroy: function() {
		var me = this;
		var canvas = me.canvas;
		var i, ilen;

		me.stop();

		// dataset controllers need to cleanup associated data
		for (i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
			me.destroyDatasetMeta(i);
		}

		if (canvas) {
			me.unbindEvents();
			helpers.canvas.clear(me);
			platform.releaseContext(me.ctx);
			me.canvas = null;
			me.ctx = null;
		}

		plugins.notify(me, 'destroy');

		delete Chart.instances[me.id];
	},

	toBase64Image: function() {
		return this.canvas.toDataURL.apply(this.canvas, arguments);
	},

	initToolTip: function() {
		this.tooltip = new Tooltip({_chart: this});
	},

	/**
	 * @private
	 */
	bindEvents: function() {
		var me = this;
		var listeners = me._listeners = {};
		var listener = function() {
			me.eventHandler.apply(me, arguments);
		};

		helpers.each(me.options.events, function(type) {
			platform.addEventListener(me, type, listener);
			listeners[type] = listener;
		});

		// Elements used to detect size change should not be injected for non responsive charts.
		// See https://github.com/chartjs/Chart.js/issues/2210
		if (me.options.responsive) {
			listener = function() {
				me.resize();
			};

			platform.addEventListener(me, 'resize', listener);
			listeners.resize = listener;
		}
	},

	/**
	 * @private
	 */
	unbindEvents: function() {
		var me = this;
		var listeners = me._listeners;
		if (!listeners) {
			return;
		}

		delete me._listeners;
		helpers.each(listeners, function(listener, type) {
			platform.removeEventListener(me, type, listener);
		});
	},

	updateHoverStyle: function(items, mode, enabled) {
		var prefix = enabled ? 'set' : 'remove';
		var meta, item, i, ilen;

		if (mode === 'dataset') {
			meta = this.getDatasetMeta(items[0].datasetIndex);
			meta.controller['_' + prefix + 'DatasetHoverStyle']();
			for (i = 0, ilen = meta.data.length; i < ilen; ++i) {
				meta.controller[prefix + 'HoverStyle'](meta.data[i], items[0].datasetIndex, i);
			}
			return;
		}

		for (i = 0, ilen = items.length; i < ilen; ++i) {
			item = items[i];
			if (item) {
				this.getDatasetMeta(item.datasetIndex).controller[prefix + 'HoverStyle'](item.element, item.datasetIndex, item.index);
			}
		}
	},

	/**
	 * @private
	 */
	_updateHoverStyles: function() {
		var me = this;
		var options = me.options || {};
		var hoverOptions = options.hover;

		// Remove styling for last active (even if it may still be active)
		if (me.lastActive.length) {
			me.updateHoverStyle(me.lastActive, hoverOptions.mode, false);
		}

		// Built-in hover styling
		if (me.active.length && hoverOptions.mode) {
			me.updateHoverStyle(me.active, hoverOptions.mode, true);
		}
	},

	/**
	 * @private
	 */
	eventHandler: function(e) {
		const me = this;
		const tooltip = me.tooltip;

		if (plugins.notify(me, 'beforeEvent', [e]) === false) {
			return;
		}

		me.handleEvent(e);

		if (tooltip) {
			tooltip.handleEvent(e);
		}

		plugins.notify(me, 'afterEvent', [e]);

		me.render();

		return me;
	},

	/**
	 * Handle an event
	 * @private
	 * @param {IEvent} event the event to handle
	 * @return {boolean} true if the chart needs to re-render
	 */
	handleEvent: function(e) {
		var me = this;
		var options = me.options || {};
		var hoverOptions = options.hover;
		var changed = false;

		me.lastActive = me.lastActive || [];

		// Find Active Elements for hover and tooltips
		if (e.type === 'mouseout') {
			me.active = [];
			me._lastEvent = null;
		} else {
			me.active = me.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions);
			me._lastEvent = e.type === 'click' ? me._lastEvent : e;
		}

		// Invoke onHover hook
		// Need to call with native event here to not break backwards compatibility
		helpers.callback(options.onHover || options.hover.onHover, [e.native, me.active], me);

		if (e.type === 'mouseup' || e.type === 'click') {
			if (options.onClick && helpers.canvas._isPointInArea(e, me.chartArea)) {
				// Use e.native here for backwards compatibility
				options.onClick.call(me, e.native, me.active);
			}
		}

		changed = !helpers._elementsEqual(me.active, me.lastActive);
		if (changed) {
			me._updateHoverStyles();
		}

		// Remember Last Actives
		me.lastActive = me.active;

		return changed;
	}
});

/**
 * NOTE(SB) We actually don't use this container anymore but we need to keep it
 * for backward compatibility. Though, it can still be useful for plugins that
 * would need to work on multiple charts?!
 */
Chart.instances = {};

module.exports = Chart;
