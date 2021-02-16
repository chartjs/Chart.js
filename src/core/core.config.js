import defaults from './core.defaults';
import {mergeIf, resolveObjectKey, isArray, isFunction, valueOrDefault} from '../helpers/helpers.core';
import {_attachContext, _createResolver, _descriptors} from '../helpers/helpers.config';

export function getIndexAxis(type, options) {
  const typeDefaults = defaults.controllers[type] || {};
  const datasetDefaults = typeDefaults.datasets || {};
  const datasetOptions = options.datasets || {};
  const typeOptions = datasetOptions[type] || {};
  return typeOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || 'x';
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

function axisFromPosition(position) {
  if (position === 'top' || position === 'bottom') {
    return 'x';
  }
  if (position === 'left' || position === 'right') {
    return 'y';
  }
}

export function determineAxis(id, scaleOptions) {
  if (id === 'x' || id === 'y' || id === 'r') {
    return id;
  }
  return scaleOptions.axis || axisFromPosition(scaleOptions.position) || id.charAt(0).toLowerCase();
}

function mergeScaleConfig(config, options) {
  const chartDefaults = defaults.controllers[config.type] || {scales: {}};
  const configScales = options.scales || {};
  const chartIndexAxis = getIndexAxis(config.type, options);
  const firstIDs = Object.create(null);
  const scales = Object.create(null);

  // First figure out first scale id's per axis.
  Object.keys(configScales).forEach(id => {
    const scaleConf = configScales[id];
    const axis = determineAxis(id, scaleConf);
    const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
    const defaultScaleOptions = chartDefaults.scales || {};
    firstIDs[axis] = firstIDs[axis] || id;
    scales[id] = mergeIf(Object.create(null), [{axis}, scaleConf, defaultScaleOptions[axis], defaultScaleOptions[defaultId]]);
  });

  // Then merge dataset defaults to scale configs
  config.data.datasets.forEach(dataset => {
    const type = dataset.type || config.type;
    const indexAxis = dataset.indexAxis || getIndexAxis(type, options);
    const datasetDefaults = defaults.controllers[type] || {};
    const defaultScaleOptions = datasetDefaults.scales || {};
    Object.keys(defaultScaleOptions).forEach(defaultID => {
      const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
      const id = dataset[axis + 'AxisID'] || firstIDs[axis] || axis;
      scales[id] = scales[id] || Object.create(null);
      mergeIf(scales[id], [{axis}, configScales[id], defaultScaleOptions[defaultID]]);
    });
  });

  // apply scale defaults, if not overridden by dataset defaults
  Object.keys(scales).forEach(key => {
    const scale = scales[key];
    mergeIf(scale, [defaults.scales[scale.type], defaults.scale]);
  });

  return scales;
}

function initOptions(config, options) {
  options = options || {};

  options.plugins = valueOrDefault(options.plugins, {});
  options.scales = mergeScaleConfig(config, options);

  return options;
}

function initConfig(config) {
  config = config || {};

  // Do NOT use mergeConfig for the data object because this method merges arrays
  // and so would change references to labels and datasets, preventing data updates.
  const data = config.data = config.data || {datasets: [], labels: []};
  data.datasets = data.datasets || [];
  data.labels = data.labels || [];

  config.options = initOptions(config, config.options);

  return config;
}

const keyCache = new Map();
const keysCached = new Set();

function cachedKeys(cacheKey, generate) {
  let keys = keyCache.get(cacheKey);
  if (!keys) {
    keys = generate();
    keyCache.set(cacheKey, keys);
    keysCached.add(keys);
  }
  return keys;
}

const addIfFound = (set, obj, key) => {
  const opts = resolveObjectKey(obj, key);
  if (opts !== undefined) {
    set.add(opts);
  }
};

export default class Config {
  constructor(config) {
    this._config = initConfig(config);
    this._scopeCache = new Map();
    this._resolverCache = new Map();
  }

  get type() {
    return this._config.type;
  }

  set type(type) {
    this._config.type = type;
  }

  get data() {
    return this._config.data;
  }

  set data(data) {
    this._config.data = data;
  }

  get options() {
    return this._config.options;
  }

  get plugins() {
    return this._config.plugins;
  }

  update(options) {
    const config = this._config;
    this._scopeCache.clear();
    this._resolverCache.clear();
    config.options = initOptions(config, options);
  }

  /**
	 * Returns the option scope keys for resolving dataset options.
	 * These keys do not include the dataset itself, because it is not under options.
	 * @param {string} datasetType
	 * @return {string[]}
	 */
  datasetScopeKeys(datasetType) {
    return cachedKeys(datasetType,
      () => [`datasets.${datasetType}`, `controllers.${datasetType}.datasets`, '']);
  }

  /**
	 * Returns the option scope keys for resolving dataset animation options.
	 * These keys do not include the dataset itself, because it is not under options.
	 * @param {string} datasetType
	 * @return {string[]}
	 */
  datasetAnimationScopeKeys(datasetType) {
    return cachedKeys(`${datasetType}.animation`,
      () => [
        `datasets.${datasetType}.animation`,
        `controllers.${datasetType}.datasets.animation`,
        'animation'
      ]);
  }

  /**
	 * Returns the options scope keys for resolving element options that belong
	 * to an dataset. These keys do not include the dataset itself, because it
	 * is not under options.
	 * @param {string} datasetType
	 * @param {string} elementType
	 * @return {string[]}
	 */
  datasetElementScopeKeys(datasetType, elementType) {
    return cachedKeys(`${datasetType}-${elementType}`,
      () => [
        `datasets.${datasetType}`,
        `controllers.${datasetType}.datasets`,
        `controllers.${datasetType}.elements.${elementType}`,
        `elements.${elementType}`,
        ''
      ]);
  }

  /**
   * Returns the options scope keys for resolving plugin options.
   * @param {{id: string, additionalOptionScopes?: string[]}} plugin
	 * @return {string[]}
   */
  pluginScopeKeys(plugin) {
    const id = plugin.id;
    const type = this.type;
    return cachedKeys(`${type}-plugin-${id}`,
      () => [
        `controllers.${type}.plugins.${id}`,
        `plugins.${id}`,
        ...plugin.additionalOptionScopes || [],
      ]);
  }

  /**
	 * Resolves the objects from options and defaults for option value resolution.
	 * @param {object} mainScope - The main scope object for options
	 * @param {string[]} scopeKeys - The keys in resolution order
   * @param {boolean} [resetCache] - reset the cache for this mainScope
	 */
  getOptionScopes(mainScope, scopeKeys, resetCache) {
    let cache = this._scopeCache.get(mainScope);
    if (!cache || resetCache) {
      cache = new Map();
      this._scopeCache.set(mainScope, cache);
    }
    const cached = cache.get(scopeKeys);
    if (cached) {
      return cached;
    }

    const scopes = new Set();

    if (mainScope) {
      scopes.add(mainScope);
      scopeKeys.forEach(key => addIfFound(scopes, mainScope, key));
    }
    scopeKeys.forEach(key => addIfFound(scopes, this.options, key));
    scopeKeys.forEach(key => addIfFound(scopes, defaults, key));
    scopeKeys.forEach(key => addIfFound(scopes, defaults.descriptors, key));

    const array = [...scopes];
    if (keysCached.has(scopeKeys)) {
      cache.set(scopeKeys, array);
    }
    return array;
  }

  /**
	 * Returns the option scopes for resolving chart options
	 * @return {object[]}
	 */
  chartOptionScopes() {
    return [
      this.options,
      defaults.controllers[this.type] || {},
      {type: this.type},
      defaults,
      defaults.descriptors
    ];
  }

  /**
	 * @param {object[]} scopes
	 * @param {string[]} names
	 * @param {function|object} context
	 * @param {string[]} [prefixes]
	 * @return {object}
	 */
  resolveNamedOptions(scopes, names, context, prefixes = ['']) {
    const result = {$shared: true};
    const {resolver, subPrefixes} = getResolver(this._resolverCache, scopes, prefixes);
    let options = resolver;
    if (needContext(resolver, names)) {
      result.$shared = false;
      context = isFunction(context) ? context() : context;
      // subResolver is passed to scriptable options. It should not resolve to hover options.
      const subResolver = this.createResolver(scopes, context, subPrefixes);
      options = _attachContext(resolver, context, subResolver);
    }

    for (const prop of names) {
      result[prop] = options[prop];
    }
    return result;
  }

  /**
	 * @param {object[]} scopes
	 * @param {function|object} context
	 */
  createResolver(scopes, context, prefixes = ['']) {
    const cached = getResolver(this._resolverCache, scopes, prefixes);
    return context && cached.needContext
      ? _attachContext(cached.resolver, isFunction(context) ? context() : context)
      : cached.resolver;
  }
}

function getResolver(resolverCache, scopes, prefixes) {
  let cache = resolverCache.get(scopes);
  if (!cache) {
    cache = new Map();
    resolverCache.set(scopes, cache);
  }
  const cacheKey = prefixes.join();
  let cached = cache.get(cacheKey);
  if (!cached) {
    const resolver = _createResolver(scopes, prefixes);
    cached = {
      resolver,
      subPrefixes: prefixes.filter(p => !p.toLowerCase().includes('hover')),
      needContext: needContext(resolver, Object.getOwnPropertyNames(resolver))
    };
    cache.set(cacheKey, cached);
  }
  return cached;
}

function needContext(proxy, names) {
  const {isScriptable, isIndexable} = _descriptors(proxy);

  for (const prop of names) {
    if ((isScriptable(prop) && isFunction(proxy[prop]))
			|| (isIndexable(prop) && isArray(proxy[prop]))) {
      return true;
    }
  }
  return false;
}
