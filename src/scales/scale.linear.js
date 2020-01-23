import {isFinite, valueOrDefault} from '../helpers/helpers.core';
import {_parseFont} from '../helpers/helpers.options';
import LinearScaleBase from './scale.linearbase';
import Ticks from '../core/core.ticks';

const defaultConfig = {
	ticks: {
		callback: Ticks.formatters.numeric
	}
};

export default class LinearScale extends LinearScaleBase {

	static id = 'linear';
	// INTERNAL: static default options, registered in src/index.js
	static defaults = defaultConfig;

	determineDataLimits() {
		const me = this;
		const options = me.options;
		const minmax = me.getMinMax(true);
		const min = minmax.min;
		const max = minmax.max;

		me.min = isFinite(min) ? min : valueOrDefault(options.suggestedMin, 0);
		me.max = isFinite(max) ? max : valueOrDefault(options.suggestedMax, 1);

		// Backward compatible inconsistent min for stacked
		if (options.stacked && min > 0) {
			me.min = 0;
		}

		// Common base implementation to handle min, max, beginAtZero
		me.handleTickRangeOptions();
	}

	/**
	 * Returns the maximum number of ticks based on the scale dimension
	 * @protected
 	 */
	computeTickLimit() {
		const me = this;

		if (me.isHorizontal()) {
			return Math.ceil(me.width / 40);
		}
		const tickFont = _parseFont(me.options.ticks);
		return Math.ceil(me.height / tickFont.lineHeight);
	}

	/**
	 * Called after the ticks are built
	 * @protected
	 */
	handleDirectionalChanges(ticks) {
		// If we are in a vertical orientation the top value is the highest so reverse the array
		return this.isHorizontal() ? ticks : ticks.reverse();
	}

	// Utils
	getPixelForValue(value) {
		const me = this;
		return me.getPixelForDecimal((value - me._startValue) / me._valueRange);
	}

	getValueForPixel(pixel) {
		return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
	}

	getPixelForTick(index) {
		const ticks = this.ticks;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return this.getPixelForValue(ticks[index].value);
	}
}
