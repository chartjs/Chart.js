import defaults from './core.defaults';
import {mergeIf, merge, _merger} from '../helpers/helpers.core';

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
		firstIDs[axis] = firstIDs[axis] || id;
		scales[id] = mergeIf(Object.create(null), [{axis}, scaleConf, chartDefaults.scales[axis], chartDefaults.scales[defaultId]]);
	});

	// Backward compatibility
	if (options.scale) {
		scales[options.scale.id || 'r'] = mergeIf(Object.create(null), [{axis: 'r'}, options.scale, chartDefaults.scales.r]);
		firstIDs.r = firstIDs.r || options.scale.id || 'r';
	}

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

/**
 * Recursively merge the given config objects as the root options by handling
 * default scale options for the `scales` and `scale` properties, then returns
 * a deep copy of the result, thus doesn't alter inputs.
 */
function mergeConfig(...args/* config objects ... */) {
	return merge(Object.create(null), args, {
		merger(key, target, source, options) {
			if (key !== 'scales' && key !== 'scale' && key !== 'controllers') {
				_merger(key, target, source, options);
			}
		}
	});
}

function includePluginDefaults(options) {
	options.plugins = options.plugins || {};
	options.plugins.title = (options.plugins.title !== false) && merge(Object.create(null), [
		defaults.plugins.title,
		options.plugins.title
	]);

	options.plugins.tooltip = (options.plugins.tooltip !== false) && merge(Object.create(null), [
		defaults.interaction,
		defaults.plugins.tooltip,
		options.interaction,
		options.plugins.tooltip
	]);
}

function includeDefaults(config, options) {
	options = options || {};

	const scaleConfig = mergeScaleConfig(config, options);
	const hoverEanbled = options.interaction !== false && options.hover !== false;

	options = mergeConfig(
		defaults,
		defaults.controllers[config.type],
		options);

	options.hover = hoverEanbled && merge(Object.create(null), [
		defaults.interaction,
		defaults.hover,
		options.interaction,
		options.hover
	]);

	options.scales = scaleConfig;

	if (options.plugins !== false) {
		includePluginDefaults(options);
	}
	return options;
}

function initConfig(config) {
	config = config || {};

	// Do NOT use mergeConfig for the data object because this method merges arrays
	// and so would change references to labels and datasets, preventing data updates.
	const data = config.data = config.data || {datasets: [], labels: []};
	data.datasets = data.datasets || [];
	data.labels = data.labels || [];

	config.options = includeDefaults(config, config.options);

	return config;
}

export default class Config {
	constructor(config) {
		this._config = initConfig(config);
	}

	get type() {
		return this._config.type;
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
		config.options = includeDefaults(config, options);
	}
}
