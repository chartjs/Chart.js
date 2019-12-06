'use strict';

import Scale from '../core/core.scale';

const defaultConfig = {
	position: 'bottom'
};

class CategoryScale extends Scale {
	_parse(raw, index) {
		var labels = this._getLabels();
		var first = labels.indexOf(raw);
		var last = labels.lastIndexOf(raw);
		return first === -1 || first !== last ? index : first;
	}

	determineDataLimits() {
		var me = this;
		var max = me._getLabels().length - 1;

		me.min = Math.max(me._userMin || 0, 0);
		me.max = Math.min(me._userMax || max, max);
	}

	buildTicks() {
		var me = this;
		var labels = me._getLabels();
		var min = me.min;
		var max = me.max;

		// If we are viewing some subset of labels, slice the original array
		labels = (min === 0 && max === labels.length - 1) ? labels : labels.slice(min, max + 1);
		return labels.map(function(l) {
			return {value: l};
		});
	}

	getLabelForValue(value) {
		var me = this;
		var labels = me._getLabels();

		if (value >= 0 && value < labels.length) {
			return labels[value];
		}
		return value;
	}

	_configure() {
		var me = this;
		var offset = me.options.offset;
		var ticks = me.ticks;

		Scale.prototype._configure.call(me);

		if (!me.isHorizontal()) {
			// For backward compatibility, vertical category scale reverse is inverted.
			me._reversePixels = !me._reversePixels;
		}

		if (!ticks) {
			return;
		}

		me._startValue = me.min - (offset ? 0.5 : 0);
		me._valueRange = Math.max(ticks.length - (offset ? 0 : 1), 1);
	}

	// Used to get data value locations.  Value can either be an index or a numerical value
	getPixelForValue(value) {
		var me = this;

		if (typeof value !== 'number') {
			value = me._parse(value);
		}

		return me.getPixelForDecimal((value - me._startValue) / me._valueRange);
	}

	getPixelForTick(index) {
		var ticks = this.ticks;
		return index < 0 || index > ticks.length - 1
			? null
			: this.getPixelForValue(index + this.min);
	}

	getValueForPixel(pixel) {
		var me = this;
		var value = Math.round(me._startValue + me.getDecimalForPixel(pixel) * me._valueRange);
		return Math.min(Math.max(value, 0), me.ticks.length - 1);
	}

	getBasePixel() {
		return this.bottom;
	}
}

// INTERNAL: static default options, registered in src/index.js
CategoryScale._defaults = defaultConfig;
export default CategoryScale;
