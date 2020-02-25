import defaults from './core.defaults';
import {clone} from '../helpers/helpers.core';

/**
 * @typedef { import("./core.controller").default } Chart
 * @typedef { import("../platform/platform.base").IEvent } IEvent
 * @typedef { import("../plugins/plugin.tooltip").default } Tooltip
 */

defaults.set('plugins', {});

/**
 * The plugin service singleton
 * @namespace Chart.plugins
 * @since 2.1.0
 */
export class PluginService {
	constructor() {
		/**
		 * Globally registered plugins.
		 * @private
		 */
		this._plugins = [];

		/**
		 * This identifier is used to invalidate the descriptors cache attached to each chart
		 * when a global plugin is registered or unregistered. In this case, the cache ID is
		 * incremented and descriptors are regenerated during following API calls.
		 * @private
		 */
		this._cacheId = 0;
	}

	/**
	 * Registers the given plugin(s) if not already registered.
	 * @param {IPlugin[]|IPlugin} plugins plugin instance(s).
	 */
	register(plugins) {
		const p = this._plugins;
		([]).concat(plugins).forEach((plugin) => {
			if (p.indexOf(plugin) === -1) {
				p.push(plugin);
			}
		});

		this._cacheId++;
	}

	/**
	 * Unregisters the given plugin(s) only if registered.
	 * @param {IPlugin[]|IPlugin} plugins plugin instance(s).
	 */
	unregister(plugins) {
		const p = this._plugins;
		([]).concat(plugins).forEach((plugin) => {
			const idx = p.indexOf(plugin);
			if (idx !== -1) {
				p.splice(idx, 1);
			}
		});

		this._cacheId++;
	}

	/**
	 * Remove all registered plugins.
	 * @since 2.1.5
	 */
	clear() {
		this._plugins = [];
		this._cacheId++;
	}

	/**
	 * Returns the number of registered plugins?
	 * @returns {number}
	 * @since 2.1.5
	 */
	count() {
		return this._plugins.length;
	}

	/**
	 * Returns all registered plugin instances.
	 * @returns {IPlugin[]} array of plugin objects.
	 * @since 2.1.5
	 */
	getAll() {
		return this._plugins;
	}

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
		const ilen = descriptors.length;
		let i, descriptor, plugin, params, method;

		for (i = 0; i < ilen; ++i) {
			descriptor = descriptors[i];
			plugin = descriptor.plugin;
			method = plugin[hook];
			if (typeof method === 'function') {
				params = [chart].concat(args || []);
				params.push(descriptor.options);
				if (method.apply(plugin, params) === false) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Returns descriptors of enabled plugins for the given chart.
	 * @param {Chart} chart
	 * @returns {object[]} [{ plugin, options }]
	 * @private
	 */
	_descriptors(chart) {
		const cache = chart.$plugins || (chart.$plugins = {});
		if (cache.id === this._cacheId) {
			return cache.descriptors;
		}

		const plugins = [];
		const descriptors = [];
		const config = (chart && chart.config) || {};
		const options = (config.options && config.options.plugins) || {};

		this._plugins.concat(config.plugins || []).forEach((plugin) => {
			const idx = plugins.indexOf(plugin);
			if (idx !== -1) {
				return;
			}

			const id = plugin.id;
			let opts = options[id];
			if (opts === false) {
				return;
			}

			if (opts === true) {
				opts = clone(defaults.plugins[id]);
			}

			plugins.push(plugin);
			descriptors.push({
				plugin,
				options: opts || {}
			});
		});

		cache.descriptors = descriptors;
		cache.id = this._cacheId;
		return descriptors;
	}

	/**
	 * Invalidates cache for the given chart: descriptors hold a reference on plugin option,
	 * but in some cases, this reference can be changed by the user when updating options.
	 * https://github.com/chartjs/Chart.js/issues/5111#issuecomment-355934167
	 * @param {Chart} chart
	 */
	invalidate(chart) {
		delete chart.$plugins;
	}
}

// singleton instance
export default new PluginService();

/**
 * Plugin extension hooks.
 * @interface IPlugin
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
 * @param {object} options - The plugin options.
 * @returns {boolean} `false` to cancel the chart update.
 */
/**
 * @method IPlugin#afterUpdate
 * @desc Called after `chart` has been updated and before rendering. Note that this
 * hook will not be called if the chart update has been previously cancelled.
 * @param {Chart} chart - The chart instance.
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
 * @param {object} options - The plugin options.
 * @returns {boolean} false to cancel the datasets update.
 * @since version 2.1.5
*/
/**
 * @method IPlugin#afterDatasetsUpdate
 * @desc Called after the `chart` datasets have been updated. Note that this hook
 * will not be called if the datasets update has been previously cancelled.
 * @param {Chart} chart - The chart instance.
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
 * @desc Called after the `chart` has been layed out. Note that this hook will not
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
 * the frame drawing is cancelled untilanother `render` is triggered.
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
 * @param {IEvent} event - The event object.
 * @param {object} options - The plugin options.
 * @param {boolean} replay - True if this event is replayed from `Chart.update`
 */
/**
 * @method IPlugin#afterEvent
 * @desc Called after the `event` has been consumed. Note that this hook
 * will not be called if the `event` has been previously discarded.
 * @param {Chart} chart - The chart instance.
 * @param {IEvent} event - The event object.
 * @param {object} options - The plugin options.
 * @param {boolean} replay - True if this event is replayed from `Chart.update`
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
