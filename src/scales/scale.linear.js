import {isFinite} from '../helpers/helpers.core';
import LinearScaleBase from './scale.linearbase';
import Ticks from '../core/core.ticks';
import {toRadians} from '../helpers';

export default class LinearScale extends LinearScaleBase {

  determineDataLimits() {
    const me = this;
    const {min, max} = me.getMinMax(true);

    me.min = isFinite(min) ? min : 0;
    me.max = isFinite(max) ? max : 1;

    // Common base implementation to handle min, max, beginAtZero
    me.handleTickRangeOptions();
  }

  /**
	 * Returns the maximum number of ticks based on the scale dimension
	 * @protected
 	 */
  computeTickLimit() {
    const me = this;
    const horizontal = me.isHorizontal();
    const length = horizontal ? me.width : me.height;
    const minRotation = toRadians(me.options.ticks.minRotation);
    const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 0.001;
    const tickFont = me._resolveTickFontOptions(0);
    return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio));
  }

  // Utils
  getPixelForValue(value) {
    return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
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
