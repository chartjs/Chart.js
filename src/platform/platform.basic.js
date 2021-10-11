/**
 * Platform fallback implementation (minimal).
 * @see https://github.com/chartjs/Chart.js/pull/4591#issuecomment-319575939
 */

import BasePlatform from './platform.base';

/**
 * Platform class for charts without access to the DOM or to many element properties
 * This platform is used by default for any chart passed an OffscreenCanvas.
 * @extends BasePlatform
 */
export default class BasicPlatform extends BasePlatform {
  acquireContext(item) {
    // To prevent canvas fingerprinting, some add-ons undefine the getContext
    // method, for example: https://github.com/kkapsner/CanvasBlocker
    // https://github.com/chartjs/Chart.js/issues/2807
    return item && item.getContext && item.getContext('2d') || null;
  }
  updateConfig(config) {
    config.options.animation = false;
  }
}
