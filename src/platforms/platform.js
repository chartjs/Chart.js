'use strict';

import helpers from '../helpers/index';
import basic from './platform.basic';
import dom from './platform.dom';

function extendPlatform(implementation) {
	return helpers.extend({
		/**
		 * @since 3.0.0
		 * @memberof Chart.platform.current
		 */
		type: undefined,

		/**
		 * @since 2.7.0
		 * @memberof Chart.platform.current
		 */
		initialize: function() {},

		/**
		 * Called at chart construction time, returns a context2d instance implementing
		 * the [W3C Canvas 2D Context API standard]{@link https://www.w3.org/TR/2dcontext/}.
		 * @param {*} item - The native item from which to acquire context (platform specific)
		 * @param {object} options - The chart options
		 * @returns {CanvasRenderingContext2D} context2d instance
		 * @memberof Chart.platform.current
		 */
		acquireContext: function() {},

		/**
		 * Called at chart destruction time, releases any resources associated to the context
		 * previously returned by the acquireContext() method.
		 * @param {CanvasRenderingContext2D} context - The context2d instance
		 * @returns {boolean} true if the method succeeded, else false
		 * @memberof Chart.platform.current
		 */
		releaseContext: function() {},

		/**
		 * Registers the specified listener on the given chart.
		 * @param {Chart} chart - Chart from which to listen for event
		 * @param {string} type - The ({@link IEvent}) type to listen for
		 * @param {function} listener - Receives a notification (an object that implements
		 * the {@link IEvent} interface) when an event of the specified type occurs.
		 * @memberof Chart.platform.current
		 */
		addEventListener: function() {},

		/**
		 * Removes the specified listener previously registered with addEventListener.
		 * @param {Chart} chart - Chart from which to remove the listener
		 * @param {string} type - The ({@link IEvent}) type to remove
		 * @param {function} listener - The listener function to remove from the event target.
		 * @memberof Chart.platform.current
		 */
		removeEventListener: function() {}

	}, implementation);
}


var defaultImplementation = dom._enabled ? dom : basic;

/**
* @namespace Chart.platform
* Allows getting and setting the current platform
* @since 3.0.0
*/
var platform = {
	/**
	 * @type Array.{IPlatform}
	 * A list of platforms that can be set
	 */
	availablePlatforms: [dom, basic],
	/**
	* @namespace Chart.platform.current
	* Changed from Chart.platform to Chart.platform.current in 3.0.0
	* @see https://chartjs.gitbooks.io/proposals/content/Platform.html
	* @since 2.4.0
	*/
	current: extendPlatform(defaultImplementation),
	/**
	 * @param {IPlatform} implementation - the platform implementation to set as the current platform
	 * Sets the current platform.
	 */
	setPlatform: function(implementation) {
		platform.current = extendPlatform(implementation);
	},
};

export default platform;

/**
 * @interface IPlatform
 * Allows abstracting platform dependencies away from the chart
 * @borrows Chart.platform.current.type as type
 * @borrows Chart.platform.current.acquireContext as acquireContext
 * @borrows Chart.platform.current.releaseContext as releaseContext
 * @borrows Chart.platform.current.addEventListener as addEventListener
 * @borrows Chart.platform.current.removeEventListener as removeEventListener
 */

/**
 * @interface IEvent
 * @prop {string} type - The event type name, possible values are:
 * 'contextmenu', 'mouseenter', 'mousedown', 'mousemove', 'mouseup', 'mouseout',
 * 'click', 'dblclick', 'keydown', 'keypress', 'keyup' and 'resize'
 * @prop {*} native - The original native event (null for emulated events, e.g. 'resize')
 * @prop {number} x - The mouse x position, relative to the canvas (null for incompatible events)
 * @prop {number} y - The mouse y position, relative to the canvas (null for incompatible events)
 */
