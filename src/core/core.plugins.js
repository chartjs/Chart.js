import registry from './core.registry.js';
import {callback as callCallback, isNullOrUndef, valueOrDefault} from '../helpers/helpers.core.js';

/**
 * @typedef { import('./core.controller.js').default } Chart
 * @typedef { import('../types/index.js').ChartEvent } ChartEvent
 * @typedef { import('../plugins/plugin.tooltip.js').default } Tooltip
 */

/**
 * @callback filterCallback
 * @param {{plugin: object, options: object}} value
 * @param {number} [index]
 * @param {array} [array]
 * @param {object} [thisArg]
 * @return {boolean}
 */


export default class PluginService {
  constructor() {
    this._init = undefined;
  }

  /**
	 * Calls enabled plugins for `chart` on the specified hook and with the given args.
	 * This method immediately returns as soon as a plugin explicitly returns false. The
	 * returned value can be used, for instance, to interrupt the current action.
	 * @param {Chart} chart - The chart instance for which plugins should be called.
	 * @param {string} hook - The name of the plugin method to call (e.g. 'beforeUpdate').
	 * @param {object} [args] - Extra arguments to apply to the hook call.
   * @param {filterCallback} [filter] - Filtering function for limiting which plugins are notified
	 * @returns {boolean} false if any of the plugins return false, else returns true.
	 */
  notify(chart, hook, args, filter) {
    if (hook === 'beforeInit') {
      this._init = this._createDescriptors(chart, true);
      this._notify(this._init, chart, 'install');
    }

    if (this._init === undefined) { // Do not trigger events before install
      return;
    }

    const descriptors = filter ? this._descriptors(chart).filter(filter) : this._descriptors(chart);
    const result = this._notify(descriptors, chart, hook, args);

    if (hook === 'afterDestroy') {
      this._notify(descriptors, chart, 'stop');
      this._notify(this._init, chart, 'uninstall');
      this._init = undefined; // Do not trigger events after uninstall
    }
    return result;
  }

  /**
	 * @private
	 */
  _notify(descriptors, chart, hook, args) {
    args = args || {};
    for (const descriptor of descriptors) {
      const plugin = descriptor.plugin;
      const method = plugin[hook];
      const params = [chart, args, descriptor.options];
      if (callCallback(method, params, plugin) === false && args.cancelable) {
        return false;
      }
    }

    return true;
  }

  invalidate() {
    // When plugins are registered, there is the possibility of a double
    // invalidate situation. In this case, we only want to invalidate once.
    // If we invalidate multiple times, the `_oldCache` is lost and all of the
    // plugins are restarted without being correctly stopped.
    // See https://github.com/chartjs/Chart.js/issues/8147
    if (!isNullOrUndef(this._cache)) {
      this._oldCache = this._cache;
      this._cache = undefined;
    }
  }

  /**
	 * @param {Chart} chart
	 * @private
	 */
  _descriptors(chart) {
    if (this._cache) {
      return this._cache;
    }

    const descriptors = this._cache = this._createDescriptors(chart);

    this._notifyStateChanges(chart);

    return descriptors;
  }

  _createDescriptors(chart, all) {
    const config = chart && chart.config;
    const options = valueOrDefault(config.options && config.options.plugins, {});
    const plugins = allPlugins(config);
    // options === false => all plugins are disabled
    return options === false && !all ? [] : createDescriptors(chart, plugins, options, all);
  }

  /**
	 * @param {Chart} chart
	 * @private
	 */
  _notifyStateChanges(chart) {
    const previousDescriptors = this._oldCache || [];
    const descriptors = this._cache;
    const diff = (a, b) => a.filter(x => !b.some(y => x.plugin.id === y.plugin.id));
    this._notify(diff(previousDescriptors, descriptors), chart, 'stop');
    this._notify(diff(descriptors, previousDescriptors), chart, 'start');
  }
}

/**
 * @param {import('./core.config.js').default} config
 */
function allPlugins(config) {
  const localIds = {};
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
      localIds[plugin.id] = true;
    }
  }

  return {plugins, localIds};
}

function getOpts(options, all) {
  if (!all && options === false) {
    return null;
  }
  if (options === true) {
    return {};
  }
  return options;
}

function createDescriptors(chart, {plugins, localIds}, options, all) {
  const result = [];
  const context = chart.getContext();

  for (const plugin of plugins) {
    const id = plugin.id;
    const opts = getOpts(options[id], all);
    if (opts === null) {
      continue;
    }
    result.push({
      plugin,
      options: pluginOpts(chart.config, {plugin, local: localIds[id]}, opts, context)
    });
  }

  return result;
}

function pluginOpts(config, {plugin, local}, opts, context) {
  const keys = config.pluginScopeKeys(plugin);
  const scopes = config.getOptionScopes(opts, keys);
  if (local && plugin.defaults) {
    // make sure plugin defaults are in scopes for local (not registered) plugins
    scopes.push(plugin.defaults);
  }
  return config.createResolver(scopes, context, [''], {
    // These are just defaults that plugins can override
    scriptable: false,
    indexable: false,
    allKeys: true
  });
}
