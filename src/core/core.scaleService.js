import defaults from './core.defaults';
import {clone, each, merge} from '../helpers/helpers.core';
import layouts from './core.layouts';

export default {
	// Scale registration object. Extensions can register new scale types (such as log or DB scales) and then
	// use the new chart options to grab the correct scale
	constructors: {},
	// Use a registration function so that we can move to an ES6 map when we no longer need to support
	// old browsers

	// Scale config defaults
	defaults: {},
	registerScale(scaleConstructor) {
		const me = this;
		const type = scaleConstructor.id;
		me.constructors[type] = scaleConstructor;
		me.defaults[type] = clone(scaleConstructor.defaults);
	},
	getScaleConstructor(type) {
		return Object.prototype.hasOwnProperty.call(this.constructors, type) ? this.constructors[type] : undefined;
	},
	getScaleDefaults(type) {
		// Return the scale defaults merged with the global settings so that we always use the latest ones
		return Object.prototype.hasOwnProperty.call(this.defaults, type) ? merge({}, [defaults.scale, this.defaults[type]]) : {};
	},
	updateScaleDefaults(type, additions) {
		const me = this;
		if (Object.prototype.hasOwnProperty.call(me.defaults, type)) {
			me.defaults[type] = Object.assign(me.defaults[type], additions);
		}
	},
	addScalesToLayout(chart) {
		// Adds each scale to the chart.boxes array to be sized accordingly
		each(chart.scales, (scale) => {
			// Set ILayoutItem parameters for backwards compatibility
			scale.fullWidth = scale.options.fullWidth;
			scale.position = scale.options.position;
			scale.weight = scale.options.weight;
			layouts.addBox(chart, scale);
		});
	}
};
