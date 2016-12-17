'use strict';

// Chart.Platform implementation for targeting a web browser
module.exports = function(Chart) {
	var helpers = Chart.helpers;
	var corePlatform = Chart.corePlatform;
	var platformEvents = corePlatform.events;

	// Key is the browser event type
	var typeMap = {
		// Mouse events
		mouseenter: platformEvents.mouseenter,
		mousedown: platformEvents.mousedown,
		mousemove: platformEvents.mousemove,
		mouseup: platformEvents.mouseup,
		mouseout: platformEvents.mouseout,
		mouseleave: platformEvents.mouseout,
		click: platformEvents.click,
		dblclick: platformEvents.dblclick,
		contextmenu: platformEvents.contextmenu,

		// Touch events
		touchstart: platformEvents.mousedown,
		touchmove: platformEvents.mousemove,
		touchend: platformEvents.mouseup,

		// Pointer events
		pointerenter: platformEvents.mouseenter,
		pointerdown: platformEvents.mousedown,
		pointermove: platformEvents.mousemove,
		pointerup: platformEvents.mouseup,
		pointerleave: platformEvents.mouseout,
		pointerout: platformEvents.mouseout,

		// Key events
		keydown: platformEvents.keydown,
		keypress: platformEvents.keypress,
		keyup: platformEvents.keyup,
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

	/**
	 * Creates an instance of the browser platform class
	 * @class BrowserPlatform
	 * @implements IPlatform
	 * @param chartController {Core.Controller} the main chart controller
	 */
	function BrowserPlatform(chartController) {
		this.chartController = chartController;
	}

	/**
	 * Creates a Chart.js event from a raw event
	 * @method BrowserPlatform#createEvent
	 * @implements IPlatform.createEvent
	 * @param e {Event} the raw event (such as a mouse event)
	 * @returns {Core.Event} the chart.js event for this event
	 */
	BrowserPlatform.prototype.createEvent = function(e) {
		var chart = this.chartController.chart;
		var relativePosition = helpers.getRelativePosition(e, chart);
		var chartEvent = {
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
		return chartEvent;
	};

	/**
	 * @method BrowserPlatform#acquireContext
	 * @implements IPlatform#acquireContext
	 */
	BrowserPlatform.prototype.acquireContext = function(item, config) {
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
	};

	/**
	 * Restores the canvas initial state, such as render/display sizes and style.
	 * @method BrowserPlatform#releaseCanvas
	 * @implements IPlatform#releaseCanvas
	 */
	BrowserPlatform.prototype.releaseCanvas = function(canvas) {
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
	};

	return BrowserPlatform;
};
