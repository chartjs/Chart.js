import defaults from './core.defaults';
import {clone} from '../helpers/helpers.core';

/**
 * @typedef { import("./core.controller").default } Chart
 * @typedef { import("../platform/platform.base").IEvent } IEvent
 * @typedef { import("../plugins/plugin.tooltip").default } Tooltip
 * IPlugin interface defined for documentation in /types/IPlugin.d.ts
 * @typedef {object} IPlugin
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
