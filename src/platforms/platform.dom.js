'use strict';

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
 * @param item {Object} the context or canvas to use
 * @param config {ChartOptions} the chart options
 * @returns {CanvasRenderingContext2D} a context2d instance implementing the w3c Canvas 2D context API standard.
 */
/**
 * @method IPlatform#releaseContext
 * @param context {CanvasRenderingContext2D} the context to release. This is the item returned by @see {@link IPlatform#acquireContext}
 */

// Chart.Platform implementation for targeting a web browser
module.exports = function(Chart) {
	var helpers = Chart.helpers;

	/*
	 * Key is the browser event type
	 * Chart.js internal events are:
	 * 		mouseenter
	 *		mousedown
	 *		mousemove
	 *		mouseup
	 *		mouseout
	 *		click
	 *		dblclick
	 *		contextmenu
	 *		keydown
	 *		keypress
	 *		keyup
	 */
	var typeMap = {
		// Mouse events
		mouseenter: 'mouseenter',
		mousedown: 'mousedown',
		mousemove: 'mousemove',
		mouseup: 'mouseup',
		mouseout: 'mouseout',
		mouseleave: 'mouseout',
		click: 'click',
		dblclick: 'dblclick',
		contextmenu: 'contextmenu',

		// Touch events
		touchstart: 'mousedown',
		touchmove: 'mousemove',
		touchend: 'mouseup',

		// Pointer events
		pointerenter: 'mouseenter',
		pointerdown: 'mousedown',
		pointermove: 'mousemove',
		pointerup: 'mouseup',
		pointerleave: 'mouseout',
		pointerout: 'mouseout',

		// Key events
		keydown: 'keydown',
		keypress: 'keypress',
		keyup: 'keyup',
	};

	/**
	 * The "used" size is the final value of a dimension property after all calculations have
	 * been performed. This method uses the computed style of `element` but returns undefined
	 * if the computed style is not expressed in pixels. That can happen in some cases where
	 * `element` has a size relative to its parent and this last one is not yet displayed,
	 * for example because of `display: none` on a parent node.
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
	 * @returns {Number} Size in pixels or undefined if unknown.
	 */
	function readUsedSize(element, property) {
		var value = helpers.getStyle(element, property);
		var matches = value && value.match(/(\d+)px/);
		return matches? Number(matches[1]) : undefined;
	}

	/**
	 * Initializes the canvas style and render size without modifying the canvas display size,
	 * since responsiveness is handled by the controller.resize() method. The config is used
	 * to determine the aspect ratio to apply in case no explicit height has been specified.
	 */
	function initCanvas(canvas, config) {
		var style = canvas.style;

		// NOTE(SB) canvas.getAttribute('width') !== canvas.width: in the first case it
		// returns null or '' if no explicit value has been set to the canvas attribute.
		var renderHeight = canvas.getAttribute('height');
		var renderWidth = canvas.getAttribute('width');

		// Chart.js modifies some canvas values that we want to restore on destroy
		canvas._chartjs = {
			initial: {
				height: renderHeight,
				width: renderWidth,
				style: {
					display: style.display,
					height: style.height,
					width: style.width
				}
			}
		};

		// Force canvas to display as block to avoid extra space caused by inline
		// elements, which would interfere with the responsive resize process.
		// https://github.com/chartjs/Chart.js/issues/2538
		style.display = style.display || 'block';

		if (renderWidth === null || renderWidth === '') {
			var displayWidth = readUsedSize(canvas, 'width');
			if (displayWidth !== undefined) {
				canvas.width = displayWidth;
			}
		}

		if (renderHeight === null || renderHeight === '') {
			if (canvas.style.height === '') {
				// If no explicit render height and style height, let's apply the aspect ratio,
				// which one can be specified by the user but also by charts as default option
				// (i.e. options.aspectRatio). If not specified, use canvas aspect ratio of 2.
				canvas.height = canvas.width / (config.options.aspectRatio || 2);
			} else {
				var displayHeight = readUsedSize(canvas, 'height');
				if (displayWidth !== undefined) {
					canvas.height = displayHeight;
				}
			}
		}

		return canvas;
	}

	return {
		/**
		 * Creates a Chart.js event from a raw event
		 * @method BrowserPlatform#createEvent
		 * @implements IPlatform.createEvent
		 * @param e {Event} the raw event (such as a mouse event)
		 * @param chart {Chart} the chart to use
		 * @returns {Core.Event} the chart.js event for this event
		 */
		createEvent: function(e, chart) {
			var relativePosition = helpers.getRelativePosition(e, chart);
			return {
				// allow access to the native event
				native: e,

				// our interal event type
				type: typeMap[e.type],

				// width and height of chart
				width: chart.width,
				height: chart.height,

				// Position relative to the canvas
				x: relativePosition.x,
				y: relativePosition.y
			};
		},

		/**
		 * @method BrowserPlatform#acquireContext
		 * @implements IPlatform#acquireContext
		 */
		acquireContext: function(item, config) {
			if (typeof item === 'string') {
				item = document.getElementById(item);
			} else if (item.length) {
				// Support for array based queries (such as jQuery)
				item = item[0];
			}

			if (item && item.canvas) {
				// Support for any object associated to a canvas (including a context2d)
				item = item.canvas;
			}

			if (item instanceof HTMLCanvasElement) {
				// To prevent canvas fingerprinting, some add-ons undefine the getContext
				// method, for example: https://github.com/kkapsner/CanvasBlocker
				// https://github.com/chartjs/Chart.js/issues/2807
				var context = item.getContext && item.getContext('2d');
				if (context instanceof CanvasRenderingContext2D) {
					initCanvas(item, config);
					return context;
				}
			}

			return null;
		},

		/**
		 * Restores the canvas initial state, such as render/display sizes and style.
		 * @method BrowserPlatform#releaseContext
		 * @implements IPlatform#releaseContext
		 */
		releaseContext: function(context) {
			var canvas = context.canvas;
			if (!canvas._chartjs) {
				return;
			}

			var initial = canvas._chartjs.initial;
			['height', 'width'].forEach(function(prop) {
				var value = initial[prop];
				if (value === undefined || value === null) {
					canvas.removeAttribute(prop);
				} else {
					canvas.setAttribute(prop, value);
				}
			});

			helpers.each(initial.style || {}, function(value, key) {
				canvas.style[key] = value;
			});

			// The canvas render size might have been changed (and thus the state stack discarded),
			// we can't use save() and restore() to restore the initial state. So make sure that at
			// least the canvas context is reset to the default state by setting the canvas width.
			// https://www.w3.org/TR/2011/WD-html5-20110525/the-canvas-element.html
			canvas.width = canvas.width;

			delete canvas._chartjs;
		}
	};
};
