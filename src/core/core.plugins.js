import defaults from './core.defaults';
import registry from './core.registry';
import {mergeIf} from '../helpers/helpers.core';

/**
 * @typedef { import("./core.controller").default } Chart
 * @typedef { import("../platform/platform.base").ChartEvent } ChartEvent
 * @typedef { import("../plugins/plugin.tooltip").default } Tooltip
 */

export default class PluginService {
	/**
	 * Calls enabled plugins for `chart` on the specified hook and with the given args.
	 * This method immediately returns as soon as a plugin explicitly returns false. The
	 * returned value can be used, for instance, to interrupt the current action.
	 * @param {Chart} chart - The chart instance for which plugins should be called.
	 * @param {string} hook - The name of the plugin method to call (e.g. 'beforeUpdate').
	 * @param {Array} [args] - Extra arguments to apply to the hook call.
	 * @returns {boolean} false if any of the plugins return false, else returns true.
	 */
	notify(chart, hook, args) {
		const descriptors = this._descriptors(chart);

		for (let i = 0; i < descriptors.length; ++i) {
			const descriptor = descriptors[i];
			const plugin = descriptor.plugin;
			const method = plugin[hook];
			if (typeof method === 'function') {
				const params = [chart].concat(args || []);
				params.push(descriptor.options);
				if (method.apply(plugin, params) === false) {
					return false;
				}
			}
		}

		return true;
	}

	invalidate() {
		this._cache = undefined;
	}

	/**
	 * @param {Chart} chart
	 * @private
	 */
	_descriptors(chart) {
		if (this._cache) {
			return this._cache;
		}

		const config = chart && chart.config;
		const options = (config.options && config.options.plugins) || {};
		const plugins = allPlugins(config);
		const descriptors = createDescriptors(plugins, options);

		this._cache = descriptors;

		return descriptors;
	}
}

/**
 * @param {import("./core.config").default} config
 */
function allPlugins(config) {
	const plugins = [];
	const keys = Object.keys(registry.plugins.items);
	for (let i = 0; i < keys.length; i++) {
		plugins.push(registry.getPlugin(keys[i]));
	}

	const local = config.plugins || [];
	for (let i = 0; i < local.length; i++) {
		const plugin = local[i];

		if (plugins.indexOf(plugin) === -1) {
			plugins.push(plugin);
		}
	}

	return plugins;
}

function createDescriptors(plugins, options) {
	const result = [];

	for (let i = 0; i < plugins.length; i++) {
		const plugin = plugins[i];
		const id = plugin.id;

		let opts = options[id];
		if (opts === false) {
			continue;
		}
		if (opts === true) {
			opts = {};
		}
		result.push({
			plugin,
			options: mergeIf({}, [opts, defaults.plugins[id]])
		});
	}

	return result;
}

/**
 * Plugin extension hooks.
 * @interface Plugin
 * @typedef {object} IPlugin
 * @since 2.1.0
 */
/**
 * @method IPlugin#beforeInit
 * @desc Called before initializing `chart`.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#afterInit
 * @desc Called after `chart` has been initialized and before the first update.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeUpdate
 * @desc Called before updating `chart`. If any plugin returns `false`, the update
 * is cancelled (and thus subsequent render(s)) until another `update` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {object} args - The call arguments.
 * @param {string} args.mode - The update mode
 * @param {object} options - The plugin options.
 * @returns {boolean} `false` to cancel the chart update.
 */
/**
 * @method IPlugin#afterUpdate
 * @desc Called after `chart` has been updated and before rendering. Note that this
 * hook will not be called if the chart update has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {object} args - The call arguments.
 * @param {string} args.mode - The update mode
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#reset
 * @desc Called during chart reset
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 * @since version 3.0.0
 */
/**
 * @method IPlugin#beforeDatasetsUpdate
 * @desc Called before updating the `chart` datasets. If any plugin returns `false`,
 * the datasets update is cancelled until another `update` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {object} args - The call arguments.
 * @param {string} args.mode - The update mode
 * @param {object} options - The plugin options.
 * @returns {boolean} false to cancel the datasets update.
 * @since version 2.1.5
*/
/**
 * @method IPlugin#afterDatasetsUpdate
 * @desc Called after the `chart` datasets have been updated. Note that this hook
 * will not be called if the datasets update has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {object} args - The call arguments.
 * @param {string} args.mode - The update mode
 * @param {object} options - The plugin options.
 * @since version 2.1.5
 */
/**
 * @method IPlugin#beforeDatasetUpdate
 * @desc Called before updating the `chart` dataset at the given `args.index`. If any plugin
 * returns `false`, the datasets update is cancelled until another `update` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {object} args - The call arguments.
 * @param {number} args.index - The dataset index.
 * @param {object} args.meta - The dataset metadata.
 * @param {string} args.mode - The update mode
 * @param {object} options - The plugin options.
 * @returns {boolean} `false` to cancel the chart datasets drawing.
 */
/**
 * @method IPlugin#afterDatasetUpdate
 * @desc Called after the `chart` datasets at the given `args.index` has been updated. Note
 * that this hook will not be called if the datasets update has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {object} args - The call arguments.
 * @param {number} args.index - The dataset index.
 * @param {object} args.meta - The dataset metadata.
 * @param {string} args.mode - The update mode
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeLayout
 * @desc Called before laying out `chart`. If any plugin returns `false`,
 * the layout update is cancelled until another `update` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 * @returns {boolean} `false` to cancel the chart layout.
 */
/**
 * @method IPlugin#afterLayout
 * @desc Called after the `chart` has been laid out. Note that this hook will not
 * be called if the layout update has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeRender
 * @desc Called before rendering `chart`. If any plugin returns `false`,
 * the rendering is cancelled until another `render` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 * @returns {boolean} `false` to cancel the chart rendering.
 */
/**
 * @method IPlugin#afterRender
 * @desc Called after the `chart` has been fully rendered (and animation completed). Note
 * that this hook will not be called if the rendering has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeDraw
 * @desc Called before drawing `chart` at every animation frame. If any plugin returns `false`,
 * the frame drawing is cancelled until another `render` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 * @returns {boolean} `false` to cancel the chart drawing.
 */
/**
 * @method IPlugin#afterDraw
 * @desc Called after the `chart` has been drawn. Note that this hook will not be called
 * if the drawing has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeDatasetsDraw
 * @desc Called before drawing the `chart` datasets. If any plugin returns `false`,
 * the datasets drawing is cancelled until another `render` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 * @returns {boolean} `false` to cancel the chart datasets drawing.
 */
/**
 * @method IPlugin#afterDatasetsDraw
 * @desc Called after the `chart` datasets have been drawn. Note that this hook
 * will not be called if the datasets drawing has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeDatasetDraw
 * @desc Called before drawing the `chart` dataset at the given `args.index` (datasets
 * are drawn in the reverse order). If any plugin returns `false`, the datasets drawing
 * is cancelled until another `render` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {object} args - The call arguments.
 * @param {number} args.index - The dataset index.
 * @param {object} args.meta - The dataset metadata.
 * @param {object} options - The plugin options.
 * @returns {boolean} `false` to cancel the chart datasets drawing.
 */
/**
 * @method IPlugin#afterDatasetDraw
 * @desc Called after the `chart` datasets at the given `args.index` have been drawn
 * (datasets are drawn in the reverse order). Note that this hook will not be called
 * if the datasets drawing has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {object} args - The call arguments.
 * @param {number} args.index - The dataset index.
 * @param {object} args.meta - The dataset metadata.
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeTooltipDraw
 * @desc Called before drawing the `tooltip`. If any plugin returns `false`,
 * the tooltip drawing is cancelled until another `render` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {object} args - The call arguments.
 * @param {Tooltip} args.tooltip - The tooltip.
 * @param {object} options - The plugin options.
 * @returns {boolean} `false` to cancel the chart tooltip drawing.
 */
/**
 * @method IPlugin#afterTooltipDraw
 * @desc Called after drawing the `tooltip`. Note that this hook will not
 * be called if the tooltip drawing has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {object} args - The call arguments.
 * @param {Tooltip} args.tooltip - The tooltip.
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeEvent
 * @desc Called before processing the specified `event`. If any plugin returns `false`,
 * the event will be discarded.
 * @param {Chart} chart - The chart instance.
 * @param {ChartEvent} event - The event object.
 * @param {boolean} replay - True if this event is replayed from `Chart.update`
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#afterEvent
 * @desc Called after the `event` has been consumed. Note that this hook
 * will not be called if the `event` has been previously discarded.
 * @param {Chart} chart - The chart instance.
 * @param {ChartEvent} event - The event object.
 * @param {boolean} replay - True if this event is replayed from `Chart.update`
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#resize
 * @desc Called after the chart as been resized.
 * @param {Chart} chart - The chart instance.
 * @param {number} size - The new canvas display size (eq. canvas.style width & height).
 * @param {object} options - The plugin options.
 */
/**
 * @method IPlugin#destroy
 * @desc Called after the chart as been destroyed.
 * @param {Chart} chart - The chart instance.
 * @param {object} options - The plugin options.
 */
