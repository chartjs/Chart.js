/**
 * Platform fallback implementation (minimal).
 * @see https://github.com/chartjs/Chart.js/pull/4591#issuecomment-319575939
 */

'use strict';

import Platform from './platform';

/**
 * Platform class for charts without access to the DOM or to many element properties
 * This platform is used by default for any chart passed an OffscreenCanvas.
 * @extends Platform
 */
export default class BasicPlatform extends Platform {
	acquireContext(item) {
		// To prevent canvas fingerprinting, some add-ons undefine the getContext
		// method, for example: https://github.com/kkapsner/CanvasBlocker
		// https://github.com/chartjs/Chart.js/issues/2807
		return item && item.getContext && item.getContext('2d') || null;
	}
}
