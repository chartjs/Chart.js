import {spritingOn, spritingOff} from './spriting';

function createCanvas(w, h) {
	var canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	return canvas;
}

function readImageData(url, callback) {
	var image = new Image();

	image.onload = function() {
		var h = image.height;
		var w = image.width;
		var canvas = createCanvas(w, h);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0, w, h);
		callback(ctx.getImageData(0, 0, w, h));
	};

	image.src = url;
}

/**
 * Injects a new canvas (and div wrapper) and creates the associated Chart instance
 * using the given config. Additional options allow tweaking elements generation.
 * @param {object} config - Chart config.
 * @param {object} options - Chart acquisition options.
 * @param {object} options.canvas - Canvas attributes.
 * @param {object} options.wrapper - Canvas wrapper attributes.
 * @param {boolean} options.useOffscreenCanvas - use an OffscreenCanvas instead of the normal HTMLCanvasElement.
 * @param {boolean} options.persistent - If true, the chart will not be released after the spec.
 */
function acquireChart(config, options) {
	var wrapper = document.createElement('div');
	var canvas = document.createElement('canvas');
	var chart, key;

	config = config || {};
	options = options || {};
	options.canvas = options.canvas || {height: 512, width: 512};
	options.wrapper = options.wrapper || {class: 'chartjs-wrapper'};

	for (key in options.canvas) {
		if (Object.prototype.hasOwnProperty.call(options.canvas, key)) {
			canvas.setAttribute(key, options.canvas[key]);
		}
	}

	for (key in options.wrapper) {
		if (Object.prototype.hasOwnProperty.call(options.wrapper, key)) {
			wrapper.setAttribute(key, options.wrapper[key]);
		}
	}

	// by default, remove chart animation and auto resize
	config.options = config.options || {};
	config.options.animation = config.options.animation === undefined ? false : config.options.animation;
	config.options.responsive = config.options.responsive === undefined ? false : config.options.responsive;
	config.options.fontFamily = config.options.fontFamily || 'Arial';
	config.options.locale = config.options.locale || 'en-US';

	wrapper.appendChild(canvas);
	window.document.body.appendChild(wrapper);

	try {
		var ctx;
		if (options.useOffscreenCanvas) {
			if (!canvas.transferControlToOffscreen) {
				// If this browser does not support offscreen canvas, mark the test as 'pending', which will skip the
				// test.
				// TODO: switch to skip() once it's implemented (https://github.com/jasmine/jasmine/issues/1709), or
				// remove if all browsers implement `transferControlToOffscreen`
				pending();
				return;
			}
			var offscreenCanvas = canvas.transferControlToOffscreen();
			ctx = offscreenCanvas.getContext('2d');
		} else {
			ctx = canvas.getContext('2d');
		}
		if (options.spriteText) {
			spritingOn(ctx);
		}
		chart = new Chart(ctx, config);
	} catch (e) {
		window.document.body.removeChild(wrapper);
		throw e;
	}

	chart.$test = {
		persistent: options.persistent,
		wrapper: wrapper
	};

	return chart;
}

function releaseChart(chart) {
	spritingOff(chart.ctx);
	chart.destroy();

	var wrapper = (chart.$test || {}).wrapper;
	if (wrapper && wrapper.parentNode) {
		wrapper.parentNode.removeChild(wrapper);
	}
}

function injectCSS(css) {
	// https://stackoverflow.com/q/3922139
	var head = document.getElementsByTagName('head')[0];
	var style = document.createElement('style');
	style.setAttribute('type', 'text/css');
	if (style.styleSheet) { // IE
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}
	head.appendChild(style);
}

function waitForResize(chart, callback) {
	var override = chart.resize;
	chart.resize = function() {
		chart.resize = override;
		override.apply(this, arguments);
		callback();
	};
}

function afterEvent(chart, type, callback) {
	var override = chart._eventHandler;
	chart._eventHandler = function(event) {
		override.call(this, event);
		if (event.type === type) {
			chart._eventHandler = override;
			// eslint-disable-next-line callback-return
			callback();
		}
	};
}

function _resolveElementPoint(el) {
	var point = {x: 0, y: 0};
	if (el) {
		if (typeof el.getCenterPoint === 'function') {
			point = el.getCenterPoint();
		} else if (el.x !== undefined && el.y !== undefined) {
			point = el;
		}
	}
	return point;
}

function triggerMouseEvent(chart, type, el) {
	var node = chart.canvas;
	var rect = node.getBoundingClientRect();
	var point = _resolveElementPoint(el);
	var event = new MouseEvent(type, {
		clientX: rect.left + point.x,
		clientY: rect.top + point.y,
		cancelable: true,
		bubbles: true,
		view: window
	});

	node.dispatchEvent(event);
}

export default {
	injectCSS: injectCSS,
	createCanvas: createCanvas,
	acquireChart: acquireChart,
	releaseChart: releaseChart,
	readImageData: readImageData,
	triggerMouseEvent: triggerMouseEvent,
	waitForResize: waitForResize,
	afterEvent: afterEvent
};
