'use strict';

// Core.Platform abstracts away browser specific APIs from the chart
module.exports = function(Chart) {
	var platform = Chart.corePlatform = {};

	/**
	 * @name Core.platform.events
	 * @type Map<String, String>
	 */
	platform.events = {
		mouseenter: 'mouseenter',
		mousemove: 'mousemove',
		mouseout: 'mouseout',
		mousedown: 'mousedown',
		mouseup: 'mouseup',
		click: 'click',
		dblclick: 'dblclick',
		contextmenu: 'contextmenu',
		keydown: 'keydown',
		keypress: 'keypress',
		keyup: 'keyup'
	};

	/**
	 * @interface IPlatform
	 * Allows abstracting platform dependencies away from the chart
	 */
	/**
	 * Creates a chart.js event from a platform specific event
	 * @method IPlatform#createEvent
	 * @param e {Event} : the platform event to translate
	 * @returns {Core.Event} chart.js event
	 */
	/**
	 * @method IPlatform#acquireContext
	 * @param item {CanvasRenderingContext2D|HTMLCanvasElement} the context or canvas to use
	 * @param config {ChartOptions} the chart options
	 */
	/**
	 * @method IPlatform#releaseCanvas
	 * @param canvas {HTMLCanvasElement} the canvas to release
	 */
};
