
/**
 * @typedef { import("../core/core.controller").default } Chart
 */

/**
 * Abstract class that allows abstracting platform dependencies away from the chart.
 */
export default class BasePlatform {
  /**
	 * Called at chart construction time, returns a context2d instance implementing
	 * the [W3C Canvas 2D Context API standard]{@link https://www.w3.org/TR/2dcontext/}.
	 * @param {HTMLCanvasElement} canvas - The canvas from which to acquire context (platform specific)
	 * @param {number} [aspectRatio] - The chart options
	 */
  acquireContext(canvas, aspectRatio) {} // eslint-disable-line no-unused-vars

  /**
	 * Called at chart destruction time, releases any resources associated to the context
	 * previously returned by the acquireContext() method.
	 * @param {CanvasRenderingContext2D} context - The context2d instance
	 * @returns {boolean} true if the method succeeded, else false
	 */
  releaseContext(context) { // eslint-disable-line no-unused-vars
    return false;
  }

  /**
	 * Registers the specified listener on the given chart.
	 * @param {Chart} chart - Chart from which to listen for event
	 * @param {string} type - The ({@link ChartEvent}) type to listen for
	 * @param {function} listener - Receives a notification (an object that implements
	 * the {@link ChartEvent} interface) when an event of the specified type occurs.
	 */
  addEventListener(chart, type, listener) {} // eslint-disable-line no-unused-vars

  /**
	 * Removes the specified listener previously registered with addEventListener.
	 * @param {Chart} chart - Chart from which to remove the listener
	 * @param {string} type - The ({@link ChartEvent}) type to remove
	 * @param {function} listener - The listener function to remove from the event target.
	 */
  removeEventListener(chart, type, listener) {} // eslint-disable-line no-unused-vars

  /**
	 * @returns {number} the current devicePixelRatio of the device this platform is connected to.
	 */
  getDevicePixelRatio() {
    return 1;
  }

  /**
	 * Returns the maximum size in pixels of given canvas element.
	 * @param {HTMLCanvasElement} element
	 * @param {number} [width] - content width of parent element
	 * @param {number} [height] - content height of parent element
	 * @param {number} [aspectRatio] - aspect ratio to maintain
	 */
  getMaximumSize(element, width, height, aspectRatio) {
    width = Math.max(0, width || element.width);
    height = height || element.height;
    return {
      width,
      height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
    };
  }

  /**
	 * @param {HTMLCanvasElement} canvas
	 * @returns {boolean} true if the canvas is attached to the platform, false if not.
	 */
  isAttached(canvas) { // eslint-disable-line no-unused-vars
    return true;
  }

  /**
   * Updates config with platform specific requirements
   * @param {import("../core/core.config").default} config
   */
  updateConfig(config) { // eslint-disable-line no-unused-vars
    // no-op
  }
}
