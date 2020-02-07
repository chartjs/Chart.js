/**
 * Chart.Platform implementation for targeting a web browser
 */

'use strict';

import helpers from '../helpers/index';
import BasePlatform from './platform.base';
import platform from './platform';

// @ts-ignore
import stylesheet from './platform.dom.css';

const EXPANDO_KEY = '$chartjs';
const CSS_PREFIX = 'chartjs-';
const CSS_SIZE_MONITOR = CSS_PREFIX + 'size-monitor';
const CSS_RENDER_MONITOR = CSS_PREFIX + 'render-monitor';
const CSS_RENDER_ANIMATION = CSS_PREFIX + 'render-animation';
const ANIMATION_START_EVENTS = ['animationstart', 'webkitAnimationStart'];

/**
 * DOM event types -> Chart.js event types.
 * Note: only events with different types are mapped.
 * @see https://developer.mozilla.org/en-US/docs/Web/Events
 */
const EVENT_TYPES = {
	touchstart: 'mousedown',
	touchmove: 'mousemove',
	touchend: 'mouseup',
	pointerenter: 'mouseenter',
	pointerdown: 'mousedown',
	pointermove: 'mousemove',
	pointerup: 'mouseup',
	pointerleave: 'mouseout',
	pointerout: 'mouseout'
};

/**
 * The "used" size is the final value of a dimension property after all calculations have
 * been performed. This method uses the computed style of `element` but returns undefined
 * if the computed style is not expressed in pixels. That can happen in some cases where
 * `element` has a size relative to its parent and this last one is not yet displayed,
 * for example because of `display: none` on a parent node.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 * @returns {number} Size in pixels or undefined if unknown.
 */
function readUsedSize(element, property) {
	var value = helpers.dom.getStyle(element, property);
	var matches = value && value.match(/^(\d+)(\.\d+)?px$/);
	return matches ? Number(matches[1]) : undefined;
}

/**
 * Initializes the canvas style and render size without modifying the canvas display size,
 * since responsiveness is handled by the controller.resize() method. The config is used
 * to determine the aspect ratio to apply in case no explicit height has been specified.
 */
function initCanvas(canvas, config) {
	const style = canvas.style;

	// NOTE(SB) canvas.getAttribute('width') !== canvas.width: in the first case it
	// returns null or '' if no explicit value has been set to the canvas attribute.
	const renderHeight = canvas.getAttribute('height');
	const renderWidth = canvas.getAttribute('width');

	// Chart.js modifies some canvas values that we want to restore on destroy
	canvas[EXPANDO_KEY] = {
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
		const displayWidth = readUsedSize(canvas, 'width');
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
			const displayHeight = readUsedSize(canvas, 'height');
			if (displayHeight !== undefined) {
				canvas.height = displayHeight;
			}
		}
	}

	return canvas;
}

/**
 * Detects support for options object argument in addEventListener.
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
 * @private
 */
var supportsEventListenerOptions = (function() {
	let supports = false;
	try {
		const options = Object.defineProperty({}, 'passive', {
			// eslint-disable-next-line getter-return
			get: function() {
				supports = true;
			}
		});
		window.addEventListener('e', null, options);
	} catch (e) {
		// continue regardless of error
	}
	return supports;
}());

// Default passive to true as expected by Chrome for 'touchstart' and 'touchend' events.
// https://github.com/chartjs/Chart.js/issues/4287
var eventListenerOptions = supportsEventListenerOptions ? {passive: true} : false;

function addListener(node, type, listener) {
	node.addEventListener(type, listener, eventListenerOptions);
}

function removeListener(node, type, listener) {
	node.removeEventListener(type, listener, eventListenerOptions);
}

function createEvent(type, chart, x, y, nativeEvent) {
	return {
		type: type,
		chart: chart,
		native: nativeEvent || null,
		x: x !== undefined ? x : null,
		y: y !== undefined ? y : null,
	};
}

function fromNativeEvent(event, chart) {
	const type = EVENT_TYPES[event.type] || event.type;
	const pos = helpers.dom.getRelativePosition(event, chart);
	return createEvent(type, chart, pos.x, pos.y, event);
}

function throttled(fn, thisArg) {
	let ticking = false;
	let args = [];

	return function() {
		args = Array.prototype.slice.call(arguments);
		thisArg = thisArg || this;

		if (!ticking) {
			ticking = true;
			helpers.requestAnimFrame.call(window, function() {
				ticking = false;
				fn.apply(thisArg, args);
			});
		}
	};
}

function createDiv(cls) {
	const el = document.createElement('div');
	el.className = cls || '';
	return el;
}

// Implementation based on https://github.com/marcj/css-element-queries
function createResizer(domPlatform, handler) {
	const maxSize = 1000000;

	// NOTE(SB) Don't use innerHTML because it could be considered unsafe.
	// https://github.com/chartjs/Chart.js/issues/5902
	const resizer = createDiv(CSS_SIZE_MONITOR);
	const expand = createDiv(CSS_SIZE_MONITOR + '-expand');
	const shrink = createDiv(CSS_SIZE_MONITOR + '-shrink');

	expand.appendChild(createDiv());
	shrink.appendChild(createDiv());

	resizer.appendChild(expand);
	resizer.appendChild(shrink);
	domPlatform._reset = function() {
		expand.scrollLeft = maxSize;
		expand.scrollTop = maxSize;
		shrink.scrollLeft = maxSize;
		shrink.scrollTop = maxSize;
	};

	const onScroll = function() {
		domPlatform._reset();
		handler();
	};

	addListener(expand, 'scroll', onScroll.bind(expand, 'expand'));
	addListener(shrink, 'scroll', onScroll.bind(shrink, 'shrink'));

	return resizer;
}

// https://davidwalsh.name/detect-node-insertion
function watchForRender(node, handler) {
	const expando = node[EXPANDO_KEY] || (node[EXPANDO_KEY] = {});
	const proxy = expando.renderProxy = function(e) {
		if (e.animationName === CSS_RENDER_ANIMATION) {
			handler();
		}
	};

	ANIMATION_START_EVENTS.forEach(function(type) {
		addListener(node, type, proxy);
	});

	// #4737: Chrome might skip the CSS animation when the CSS_RENDER_MONITOR class
	// is removed then added back immediately (same animation frame?). Accessing the
	// `offsetParent` property will force a reflow and re-evaluate the CSS animation.
	// https://gist.github.com/paulirish/5d52fb081b3570c81e3a#box-metrics
	// https://github.com/chartjs/Chart.js/issues/4737
	expando.reflow = !!node.offsetParent;

	node.classList.add(CSS_RENDER_MONITOR);
}

function unwatchForRender(node) {
	const expando = node[EXPANDO_KEY] || {};
	const proxy = expando.renderProxy;

	if (proxy) {
		ANIMATION_START_EVENTS.forEach(function(type) {
			removeListener(node, type, proxy);
		});

		delete expando.renderProxy;
	}

	node.classList.remove(CSS_RENDER_MONITOR);
}

function addResizeListener(node, listener, chart, domPlatform) {
	const expando = node[EXPANDO_KEY] || (node[EXPANDO_KEY] = {});

	// Let's keep track of this added resizer and thus avoid DOM query when removing it.
	const resizer = expando.resizer = createResizer(domPlatform, throttled(function() {
		if (expando.resizer) {
			const container = chart.options.maintainAspectRatio && node.parentNode;
			const w = container ? container.clientWidth : 0;
			listener(createEvent('resize', chart));
			if (container && container.clientWidth < w && chart.canvas) {
				// If the container size shrank during chart resize, let's assume
				// scrollbar appeared. So we resize again with the scrollbar visible -
				// effectively making chart smaller and the scrollbar hidden again.
				// Because we are inside `throttled`, and currently `ticking`, scroll
				// events are ignored during this whole 2 resize process.
				// If we assumed wrong and something else happened, we are resizing
				// twice in a frame (potential performance issue)
				listener(createEvent('resize', chart));
			}
		}
	}));

	// The resizer needs to be attached to the node parent, so we first need to be
	// sure that `node` is attached to the DOM before injecting the resizer element.
	watchForRender(node, function() {
		if (expando.resizer) {
			const container = node.parentNode;
			if (container && container !== resizer.parentNode) {
				container.insertBefore(resizer, container.firstChild);
			}

			// The container size might have changed, let's reset the resizer state.
			domPlatform._reset();
		}
	});
}

function removeResizeListener(node) {
	const expando = node[EXPANDO_KEY] || {};
	const resizer = expando.resizer;

	delete expando.resizer;
	unwatchForRender(node);

	if (resizer && resizer.parentNode) {
		resizer.parentNode.removeChild(resizer);
	}
}

/**
 * Injects CSS styles inline if the styles are not already present.
 * @param {Node} rootNode - the HTMLDocument|ShadowRoot node to contain the <style>.
 * @param {string} css - the CSS to be injected.
 */
function injectCSS(rootNode, css) {
	// https://stackoverflow.com/q/3922139
	const expando = rootNode[EXPANDO_KEY] || (rootNode[EXPANDO_KEY] = {});
	if (!expando.containsStyles) {
		expando.containsStyles = true;
		css = '/* Chart.js */\n' + css;
		var style = document.createElement('style');
		style.setAttribute('type', 'text/css');
		style.appendChild(document.createTextNode(css));
		rootNode.appendChild(style);
	}
}

/**
 * Platform class for charts that can access the DOM and global window/document properties
 * @extends BasePlatform
 */
export default class DomPlatform extends BasePlatform {
	/**
	 * @constructor
	 */
	constructor() {
		super();

		/**
		 * When `true`, prevents the automatic injection of the stylesheet required to
		 * correctly detect when the chart is added to the DOM and then resized. This
		 * switch has been added to allow external stylesheet (`dist/Chart(.min)?.js`)
		 * to be manually imported to make this library compatible with any CSP.
		 * See https://github.com/chartjs/Chart.js/issues/5208
		 */
		this.disableCSSInjection = platform.disableCSSInjection;
	}

	/**
	 * Initializes resources that depend on platform options.
	 * @param {HTMLCanvasElement} canvas - The Canvas element.
	 * @private
	 */
	_ensureLoaded(canvas) {
		if (!this.disableCSSInjection) {
			// If the canvas is in a shadow DOM, then the styles must also be inserted
			// into the same shadow DOM.
			// https://github.com/chartjs/Chart.js/issues/5763
			const root = canvas.getRootNode ? canvas.getRootNode() : document;
			// @ts-ignore
			const targetNode = root.host ? root : document.head;
			injectCSS(targetNode, stylesheet);
		}
	}

	acquireContext(canvas, config) {
		// To prevent canvas fingerprinting, some add-ons undefine the getContext
		// method, for example: https://github.com/kkapsner/CanvasBlocker
		// https://github.com/chartjs/Chart.js/issues/2807
		const context = canvas && canvas.getContext && canvas.getContext('2d');

		// `instanceof HTMLCanvasElement/CanvasRenderingContext2D` fails when the canvas is
		// inside an iframe or when running in a protected environment. We could guess the
		// types from their toString() value but let's keep things flexible and assume it's
		// a sufficient condition if the canvas has a context2D which has canvas as `canvas`.
		// https://github.com/chartjs/Chart.js/issues/3887
		// https://github.com/chartjs/Chart.js/issues/4102
		// https://github.com/chartjs/Chart.js/issues/4152
		if (context && context.canvas === canvas) {
			// Load platform resources on first chart creation, to make it possible to
			// import the library before setting platform options.
			this._ensureLoaded(canvas);
			initCanvas(canvas, config);
			return context;
		}

		return null;
	}

	releaseContext(context) {
		const canvas = context.canvas;
		if (!canvas[EXPANDO_KEY]) {
			return false;
		}

		const initial = canvas[EXPANDO_KEY].initial;
		['height', 'width'].forEach(function(prop) {
			const value = initial[prop];
			if (helpers.isNullOrUndef(value)) {
				canvas.removeAttribute(prop);
			} else {
				canvas.setAttribute(prop, value);
			}
		});

		const style = initial.style || {};
		Object.keys(style).forEach(function(key) {
			canvas.style[key] = style[key];
		});

		// The canvas render size might have been changed (and thus the state stack discarded),
		// we can't use save() and restore() to restore the initial state. So make sure that at
		// least the canvas context is reset to the default state by setting the canvas width.
		// https://www.w3.org/TR/2011/WD-html5-20110525/the-canvas-element.html
		// eslint-disable-next-line no-self-assign
		canvas.width = canvas.width;

		delete canvas[EXPANDO_KEY];
		return true;
	}

	addEventListener(chart, type, listener) {
		const canvas = chart.canvas;
		if (type === 'resize') {
			// Note: the resize event is not supported on all browsers.
			addResizeListener(canvas, listener, chart, this);
			return;
		}

		const expando = listener[EXPANDO_KEY] || (listener[EXPANDO_KEY] = {});
		const proxies = expando.proxies || (expando.proxies = {});
		const proxy = proxies[chart.id + '_' + type] = throttled(function(event) {
			listener(fromNativeEvent(event, chart));
		}, chart);

		addListener(canvas, type, proxy);
	}

	removeEventListener(chart, type, listener) {
		const canvas = chart.canvas;
		if (type === 'resize') {
			// Note: the resize event is not supported on all browsers.
			removeResizeListener(canvas);
			return;
		}

		const expando = listener[EXPANDO_KEY] || {};
		const proxies = expando.proxies || {};
		const proxy = proxies[chart.id + '_' + type];
		if (!proxy) {
			return;
		}

		removeListener(canvas, type, proxy);
	}

	getDevicePixelRatio() {
		return window.devicePixelRatio;
	}
}
