
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
	 * @param {object} options - The chart options
	 */
	acquireContext(canvas, options) {} // eslint-disable-line no-unused-vars

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
	 * @param {string} type - The ({@link IEvent}) type to listen for
	 * @param {function} listener - Receives a notification (an object that implements
	 * the {@link IEvent} interface) when an event of the specified type occurs.
	 */
	addEventListener(chart, type, listener) {} // eslint-disable-line no-unused-vars

	/**
	 * Removes the specified listener previously registered with addEventListener.
	 * @param {Chart} chart - Chart from which to remove the listener
	 * @param {string} type - The ({@link IEvent}) type to remove
	 * @param {function} listener - The listener function to remove from the event target.
	 */
	removeEventListener(chart, type, listener) {} // eslint-disable-line no-unused-vars

	/**
	 * @returns {number} the current devicePixelRatio of the device this platform is connected to.
	 */
	getDevicePixelRatio() {
		return 1;
	}
}

/**
 * @interface IEvent
 * @typedef {object} IEvent
 * @prop {string} type - The event type name, possible values are:
 * 'contextmenu', 'mouseenter', 'mousedown', 'mousemove', 'mouseup', 'mouseout',
 * 'click', 'dblclick', 'keydown', 'keypress', 'keyup' and 'resize'
 * @prop {*} native - The original native event (null for emulated events, e.g. 'resize')
 * @prop {number} x - The mouse x position, relative to the canvas (null for incompatible events)
 * @prop {number} y - The mouse y position, relative to the canvas (null for incompatible events)
 */
