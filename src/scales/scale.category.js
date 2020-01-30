'use strict';

import Scale from '../core/core.scale';

const defaultConfig = {
};

class CategoryScale extends Scale {

	constructor(cfg) {
		super(cfg);

		/** @type {number} */
		this._numLabels = undefined;
		/** @type {number} */
		this._startValue = undefined;
		/** @type {number} */
		this._valueRange = undefined;
	}

	_parse(raw, index) {
		const labels = this._getLabels();
		if (labels[index] === raw) {
			return index;
		}
		const first = labels.indexOf(raw);
		const last = labels.lastIndexOf(raw);
		return first === -1 || first !== last ? index : first;
	}

	determineDataLimits() {
		const me = this;
		const max = me._getLabels().length - 1;

		me.min = Math.max(me._userMin || 0, 0);
		me.max = Math.min(me._userMax || max, max);
	}

	buildTicks() {
		const me = this;
		const min = me.min;
		const max = me.max;
		const offset = me.options.offset;
		let labels = me._getLabels();

		// If we are viewing some subset of labels, slice the original array
		labels = (min === 0 && max === labels.length - 1) ? labels : labels.slice(min, max + 1);

		me._numLabels = labels.length;
		me._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
		me._startValue = me.min - (offset ? 0.5 : 0);

		return labels.map(function(l) {
			return {value: l};
		});
	}

	getLabelForValue(value) {
		const me = this;
		const labels = me._getLabels();

		if (value >= 0 && value < labels.length) {
			return labels[value];
		}
		return value;
	}

	_configure() {
		const me = this;

		Scale.prototype._configure.call(me);

		if (!me.isHorizontal()) {
			// For backward compatibility, vertical category scale reverse is inverted.
			me._reversePixels = !me._reversePixels;
		}
	}

	// Used to get data value locations. Value can either be an index or a numerical value
	getPixelForValue(value) {
		var me = this;

		if (typeof value !== 'number') {
			value = me._parse(value);
		}

		return me.getPixelForDecimal((value - me._startValue) / me._valueRange);
	}

	getPixelForTick(index) {
		const me = this;
		const ticks = me.ticks;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return me.getPixelForValue(index * me._numLabels / ticks.length + me.min);
	}

	getValueForPixel(pixel) {
		const me = this;
		const value = Math.round(me._startValue + me.getDecimalForPixel(pixel) * me._valueRange);
		return Math.min(Math.max(value, 0), me.ticks.length - 1);
	}

	getBasePixel() {
		return this.bottom;
	}
}

// INTERNAL: static default options, registered in src/index.js
CategoryScale._defaults = defaultConfig;
export default CategoryScale;
