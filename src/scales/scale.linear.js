import {isFinite} from '../helpers/helpers.core.js';
import LinearScaleBase from './scale.linearbase.js';
import Ticks from '../core/core.ticks.js';
import {toRadians} from '../helpers/index.js';

export default class LinearScale extends LinearScaleBase {

  static id = 'linear';

  /**
   * @type {any}
   */
  static defaults = {
    ticks: {
      callback: Ticks.formatters.numeric
    }
  };


  determineDataLimits() {
    const {min, max} = this.getMinMax(true);

    this.min = isFinite(min) ? min : 0;
    this.max = isFinite(max) ? max : 1;

    // Common base implementation to handle min, max, beginAtZero
    this.handleTickRangeOptions();
  }

  /**
	 * Returns the maximum number of ticks based on the scale dimension
	 * @protected
 	 */
  computeTickLimit() {
    const horizontal = this.isHorizontal();
    const length = horizontal ? this.width : this.height;
    const minRotation = toRadians(this.options.ticks.minRotation);
    const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 0.001;
    const tickFont = this._resolveTickFontOptions(0);
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
