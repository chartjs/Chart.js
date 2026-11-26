import registry from './core.registry.js';
import {callback as callCallback, isNullOrUndef, valueOrDefault} from '../helpers/helpers.core.js';
import type Chart from './core.controller.js';
import type Config from './core.config.js';

export type filterCallback = (
  value: {plugin: object, options: object},
  index?: number,
  array?: any[],
  thisArg?: object
) => boolean;

export default class PluginService {
  declare _init: {plugin: any; options: any}[];
  declare _cache: {plugin: any; options: any}[];
  declare _oldCache: {plugin: any; options: any}[];

  constructor() {
    this._init = undefined;
  }

  /**
	 * Calls enabled plugins for `chart` on the specified hook and with the given args.
	 * This method immediately returns as soon as a plugin explicitly returns false. The
	 * returned value can be used, for instance, to interrupt the current action.
	 * @param chart - The chart instance for which plugins should be called.
	 * @param hook - The name of the plugin method to call (e.g. 'beforeUpdate').
	 * @param [args] - Extra arguments to apply to the hook call.
   * @param [filter] - Filtering function for limiting which plugins are notified
	 * @returns false if any of the plugins return false, else returns true.
	 */
  notify(chart: Chart, hook: string, args?: object, filter?: filterCallback): boolean {
    if (hook === 'beforeInit') {
      this._init = this._createDescriptors(chart, true);
      this._notify(this._init, chart, 'install');
    }

    if (this._init === undefined) { // Do not trigger events before install
      return undefined;
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
	 * @internal
	 */
  _notify(descriptors: {plugin: any; options: any}[], chart: Chart, hook: string, args?: any): boolean {
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
	 * @internal
	 */
  _descriptors(chart: Chart) {
    if (this._cache) {
      return this._cache;
    }

    const descriptors = this._cache = this._createDescriptors(chart);

    this._notifyStateChanges(chart);

    return descriptors;
  }

  _createDescriptors(chart: Chart, all?: boolean): {plugin: any; options: any}[] {
    const config = chart && chart.config;
    const options = valueOrDefault(config.options && config.options.plugins, {});
    const plugins = allPlugins(config);
    // options === false => all plugins are disabled
    return options === false && !all ? [] : createDescriptors(chart, plugins, options, all);
  }

  /**
	 * @internal
	 */
  _notifyStateChanges(chart: Chart) {
    const previousDescriptors = this._oldCache || [];
    const descriptors = this._cache;
    const diff = (a, b) => a.filter(x => !b.some(y => x.plugin.id === y.plugin.id));
    this._notify(diff(previousDescriptors, descriptors), chart, 'stop');
    this._notify(diff(descriptors, previousDescriptors), chart, 'start');
  }
}

function allPlugins(config: Config) {
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

function getOpts(options, all: boolean) {
  if (!all && options === false) {
    return null;
  }
  if (options === true) {
    return {};
  }
  return options;
}

function createDescriptors(chart: Chart, {plugins, localIds}, options, all: boolean) {
  const result: {plugin: any; options: any}[] = [];
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

function pluginOpts(config: Config, {plugin, local}, opts, context) {
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
