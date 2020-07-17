/**
 * Chart.Platform implementation for targeting a web browser
 */

import BasePlatform from './platform.base';
import {_getParentNode, getStyle, getRelativePosition} from '../helpers/helpers.dom';
import {requestAnimFrame} from '../helpers/helpers.extras';
import {isNullOrUndef} from '../helpers/helpers.core';

/**
 * @typedef { import("../core/core.controller").default } Chart
 */

const EXPANDO_KEY = '$chartjs';

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
 * @returns {number=} Size in pixels or undefined if unknown.
 */
function readUsedSize(element, property) {
	const value = getStyle(element, property);
	const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
	return matches ? +matches[1] : undefined;
}

/**
 * Initializes the canvas style and render size without modifying the canvas display size,
 * since responsiveness is handled by the controller.resize() method. The config is used
 * to determine the aspect ratio to apply in case no explicit height has been specified.
 * @param {HTMLCanvasElement} canvas
 * @param {{ options: any; }} config
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
	// Include possible borders in the size
	style.boxSizing = style.boxSizing || 'border-box';

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
const supportsEventListenerOptions = (function() {
	let passiveSupported = false;
	try {
		const options = {
			get passive() { // This function will be called when the browser attempts to access the passive property.
				passiveSupported = true;
				return false;
			}
		};
		// @ts-ignore
		window.addEventListener('test', null, options);
		// @ts-ignore
		window.removeEventListener('test', null, options);
	} catch (e) {
		// continue regardless of error
	}
	return passiveSupported;
}());

// Default passive to true as expected by Chrome for 'touchstart' and 'touchend' events.
// https://github.com/chartjs/Chart.js/issues/4287
const eventListenerOptions = supportsEventListenerOptions ? {passive: true} : false;

function addListener(node, type, listener) {
	node.addEventListener(type, listener, eventListenerOptions);
}

function removeListener(node, type, listener) {
	node.removeEventListener(type, listener, eventListenerOptions);
}

function createEvent(type, chart, x, y, nativeEvent) {
	return {
		type,
		chart,
		native: nativeEvent || null,
		x: x !== undefined ? x : null,
		y: y !== undefined ? y : null,
	};
}

function fromNativeEvent(event, chart) {
	const type = EVENT_TYPES[event.type] || event.type;
	const pos = getRelativePosition(event, chart);
	return createEvent(type, chart, pos.x, pos.y, event);
}

function throttled(fn, thisArg) {
	let ticking = false;
	let args = [];

	return function(...rest) {
		args = Array.prototype.slice.call(rest);

		if (!ticking) {
			ticking = true;
			requestAnimFrame.call(window, () => {
				ticking = false;
				fn.apply(thisArg, args);
			});
		}
	};
}

function createAttachObserver(chart, type, listener) {
	const canvas = chart.canvas;
	const container = canvas && _getParentNode(canvas);
	const element = container || canvas;
	const observer = new MutationObserver(entries => {
		const parent = _getParentNode(element);
		entries.forEach(entry => {
			for (let i = 0; i < entry.addedNodes.length; i++) {
				const added = entry.addedNodes[i];
				if (added === element || added === parent) {
					listener(entry.target);
				}
			}
		});
	});
	observer.observe(document, {childList: true, subtree: true});
	return observer;
}

function createDetachObserver(chart, type, listener) {
	const canvas = chart.canvas;
	const container = canvas && _getParentNode(canvas);
	if (!container) {
		return;
	}
	const observer = new MutationObserver(entries => {
		entries.forEach(entry => {
			for (let i = 0; i < entry.removedNodes.length; i++) {
				if (entry.removedNodes[i] === canvas) {
					listener();
					break;
				}
			}
		});
	});
	observer.observe(container, {childList: true});
	return observer;
}

function createResizeObserver(chart, type, listener) {
	const canvas = chart.canvas;
	const container = canvas && _getParentNode(canvas);
	if (!container) {
		return;
	}
	const resize = throttled((width, height) => {
		const w = container.clientWidth;
		listener(width, height);
		if (w < container.clientWidth) {
			// If the container size shrank during chart resize, let's assume
			// scrollbar appeared. So we resize again with the scrollbar visible -
			// effectively making chart smaller and the scrollbar hidden again.
			// Because we are inside `throttled`, and currently `ticking`, scroll
			// events are ignored during this whole 2 resize process.
			// If we assumed wrong and something else happened, we are resizing
			// twice in a frame (potential performance issue)
			listener();
		}
	}, window);

	// @ts-ignore until https://github.com/microsoft/TypeScript/issues/37861 implemented
	const observer = new ResizeObserver(entries => {
		const entry = entries[0];
		const width = entry.contentRect.width;
		const height = entry.contentRect.height;
		// When its container's display is set to 'none' the callback will be called with a
		// size of (0, 0), which will cause the chart to lost its original height, so skip
		// resizing in such case.
		if (width === 0 && height === 0) {
			return;
		}
		resize(width, height);
	});
	observer.observe(container);
	return observer;
}

function releaseObserver(canvas, type, observer) {
	if (observer) {
		observer.disconnect();
	}
}

function createProxyAndListen(chart, type, listener) {
	const canvas = chart.canvas;
	const proxy = throttled((event) => {
		// This case can occur if the chart is destroyed while waiting
		// for the throttled function to occur. We prevent crashes by checking
		// for a destroyed chart
		if (chart.ctx !== null) {
			listener(fromNativeEvent(event, chart));
		}
	}, chart);

	addListener(canvas, type, proxy);

	return proxy;
}

/**
 * Platform class for charts that can access the DOM and global window/document properties
 * @extends BasePlatform
 */
export default class DomPlatform extends BasePlatform {

	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {{ options: { aspectRatio?: number; }; }} config
	 * @return {CanvasRenderingContext2D|null}
	 */
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
			initCanvas(canvas, config);
			return context;
		}

		return null;
	}

	/**
	 * @param {CanvasRenderingContext2D} context
	 */
	releaseContext(context) {
		const canvas = context.canvas;
		if (!canvas[EXPANDO_KEY]) {
			return false;
		}

		const initial = canvas[EXPANDO_KEY].initial;
		['height', 'width'].forEach((prop) => {
			const value = initial[prop];
			if (isNullOrUndef(value)) {
				canvas.removeAttribute(prop);
			} else {
				canvas.setAttribute(prop, value);
			}
		});

		const style = initial.style || {};
		Object.keys(style).forEach((key) => {
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

	/**
	 *
	 * @param {Chart} chart
	 * @param {string} type
	 * @param {function} listener
	 */
	addEventListener(chart, type, listener) {
		// Can have only one listener per type, so make sure previous is removed
		this.removeEventListener(chart, type);

		const proxies = chart.$proxies || (chart.$proxies = {});
		const handlers = {
			attach: createAttachObserver,
			detach: createDetachObserver,
			resize: createResizeObserver
		};
		const handler = handlers[type] || createProxyAndListen;
		proxies[type] = handler(chart, type, listener);
	}


	/**
	 * @param {Chart} chart
	 * @param {string} type
	 */
	removeEventListener(chart, type) {
		const canvas = chart.canvas;
		const proxies = chart.$proxies || (chart.$proxies = {});
		const proxy = proxies[type];

		if (!proxy) {
			return;
		}

		const handlers = {
			attach: releaseObserver,
			detach: releaseObserver,
			resize: releaseObserver
		};
		const handler = handlers[type] || removeListener;
		handler(canvas, type, proxy);
		proxies[type] = undefined;
	}

	getDevicePixelRatio() {
		return window.devicePixelRatio;
	}


	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	isAttached(canvas) {
		const container = _getParentNode(canvas);
		return !!(container && _getParentNode(container));
	}
}
