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

export default class Config {
  constructor(config) {
    this._config = initConfig(config);
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
    config.options = initOptions(config, options);
  }

  /**
	 * Returns the option scope keys for resolving dataset options.
	 * These keys do not include the dataset itself, because it is not under options.
	 * @param {string} datasetType
	 * @return {string[]}
	 */
  datasetScopeKeys(datasetType) {
    return [`datasets.${datasetType}`, `controllers.${datasetType}.datasets`, ''];
  }

  /**
	 * Returns the option scope keys for resolving dataset animation options.
	 * These keys do not include the dataset itself, because it is not under options.
	 * @param {string} datasetType
	 * @return {string[]}
	 */
  datasetAnimationScopeKeys(datasetType) {
    return [`datasets.${datasetType}.animation`, `controllers.${datasetType}.datasets.animation`, 'animation'];
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
    return [
      `datasets.${datasetType}`,
      `controllers.${datasetType}.datasets`,
      `controllers.${datasetType}.elements.${elementType}`,
      `elements.${elementType}`,
      ''
    ];
  }

  /**
	 * Resolves the objects from options and defaults for option value resolution.
	 * @param {object} mainScope - The main scope object for options
	 * @param {string[]} scopeKeys - The keys in resolution order
	 */
  getOptionScopes(mainScope = {}, scopeKeys) {
    const options = this.options;
    const scopes = new Set([mainScope]);

    const addIfFound = (obj, key) => {
      const opts = resolveObjectKey(obj, key);
      if (opts !== undefined) {
        scopes.add(opts);
      }
    };

    scopeKeys.forEach(key => addIfFound(mainScope, key));
    scopeKeys.forEach(key => addIfFound(options, key));
    scopeKeys.forEach(key => addIfFound(defaults, key));

    const descriptors = defaults.descriptors;
    scopeKeys.forEach(key => addIfFound(descriptors, key));

    return [...scopes];
  }

  /**
	 * Returns the option scopes for resolving chart options
	 * @return {object[]}
	 */
  chartOptionsScopes() {
    return [
      this.options,
      defaults.controllers[this.type] || {},
      {type: this.type},
      defaults, defaults.descriptors
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
    const result = {};
    const resolver = _createResolver(scopes, prefixes);
    let options;
    if (needContext(resolver, names)) {
      result.$shared = false;
      context = isFunction(context) ? context() : context;
      // subResolver os passed to scriptable options. It should not resolve to hover options.
      const subPrefixes = prefixes.filter(p => !p.toLowerCase().includes('hover'));
      const subResolver = this.createResolver(scopes, context, subPrefixes);
      options = _attachContext(resolver, context, subResolver);
    } else {
      result.$shared = true;
      options = resolver;
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
    const resolver = _createResolver(scopes, prefixes);
    return context && needContext(resolver, Object.getOwnPropertyNames(resolver))
      ? _attachContext(resolver, isFunction(context) ? context() : context)
      : resolver;
  }
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
