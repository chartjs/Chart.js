import {isFinite, valueOrDefault} from '../helpers/helpers.core';
import LinearScaleBase from './scale.linearbase';
import Ticks from '../core/core.ticks';

export default class LinearScale extends LinearScaleBase {

	determineDataLimits() {
		const me = this;
		const options = me.options;
		const {min, max} = me.getMinMax(true);

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
		const tickFont = me._resolveTickFontOptions(0);
		return Math.ceil(me.height / tickFont.lineHeight);
	}

	// Utils
	getPixelForValue(value) {
		const me = this;
		return me.getPixelForDecimal((value - me._startValue) / me._valueRange);
	}

	getValueForPixel(pixel) {
		return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
	}
}

LinearScale.id = 'linear';

/**
 * @type {any}
 */
LinearScale.defaults = {
	ticks: {
		callback: Ticks.formatters.numeric
	}
};
