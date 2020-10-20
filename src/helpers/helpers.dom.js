import {INFINITY} from './helpers.math';

/**
 * @private
 */
export function _getParentNode(domNode) {
	let parent = domNode.parentNode;
	if (parent && parent.toString() === '[object ShadowRoot]') {
		parent = parent.host;
	}
	return parent;
}

/**
 * convert max-width/max-height values that may be percentages into a number
 * @private
 */
function parseMaxStyle(styleValue, node, parentProperty) {
	let valueInPixels;
	if (typeof styleValue === 'string') {
		valueInPixels = parseInt(styleValue, 10);

		if (styleValue.indexOf('%') !== -1) {
			// percentage * size in dimension
			valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
		}
	} else {
		valueInPixels = styleValue;
	}

	return valueInPixels;
}

const getComputedStyle = (element) => window.getComputedStyle(element, null);

export function getStyle(el, property) {
	return el.currentStyle ?
		el.currentStyle[property] :
		getComputedStyle(el).getPropertyValue(property);
}

const positions = ['top', 'right', 'bottom', 'left'];
function getPositionedStyle(styles, style, suffix) {
	const result = {};
	suffix = suffix ? '-' + suffix : '';
	for (let i = 0; i < 4; i++) {
		const pos = positions[i];
		result[pos] = parseFloat(styles[style + '-' + pos + suffix]) || 0;
	}
	result.width = result.left + result.right;
	result.height = result.top + result.bottom;
	return result;
}

function getCanvasPosition(evt, canvas) {
	const e = evt.originalEvent || evt;
	const touches = e.touches;
	const source = touches && touches.length ? touches[0] : e;
	const {offsetX, offsetY} = source;
	let box = false;
	let x, y;
	if (offsetX > 0 || offsetY > 0) {
		x = offsetX;
		y = offsetY;
	} else {
		const rect = canvas.getBoundingClientRect();
		x = source.clientX - rect.left;
		y = source.clientY - rect.top;
		box = true;
	}
	return {x, y, box};
}

export function getRelativePosition(evt, chart) {
	const {canvas, currentDevicePixelRatio} = chart;
	const style = getComputedStyle(canvas);
	const borderBox = style.boxSizing === 'border-box';
	const paddings = getPositionedStyle(style, 'padding');
	const borders = getPositionedStyle(style, 'border', 'width');
	const {x, y, box} = getCanvasPosition(evt, canvas);
	const xOffset = paddings.left + (box && borders.left);
	const yOffset = paddings.top + (box && borders.top);

	let {width, height} = chart;
	if (borderBox) {
		width -= paddings.width + borders.width;
		height -= paddings.height + borders.height;
	}
	return {
		x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio),
		y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio)
	};
}

function getContainerSize(canvas, width, height) {
	let maxWidth, maxHeight;

	if (width === undefined || height === undefined) {
		const container = _getParentNode(canvas);
		if (!container) {
			width = canvas.clientWidth;
			height = canvas.clientHeight;
		} else {
			const rect = container.getBoundingClientRect(); // this is the border box of the container
			const containerStyle = getComputedStyle(container);
			const containerBorder = getPositionedStyle(containerStyle, 'border', 'width');
			const containerPadding = getPositionedStyle(containerStyle, 'padding');
			width = rect.width - containerPadding.width - containerBorder.width;
			height = rect.height - containerPadding.height - containerBorder.height;
			maxWidth = parseMaxStyle(containerStyle.maxWidth, container, 'clientWidth');
			maxHeight = parseMaxStyle(containerStyle.maxHeight, container, 'clientHeight');
		}
	}
	return {
		width,
		height,
		maxWidth: maxWidth || INFINITY,
		maxHeight: maxHeight || INFINITY
	};
}

export function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
	const style = getComputedStyle(canvas);
	const margins = getPositionedStyle(style, 'margin');
	const maxWidth = parseMaxStyle(style.maxWidth, canvas, 'clientWidth') || INFINITY;
	const maxHeight = parseMaxStyle(style.maxHeight, canvas, 'clientHeight') || INFINITY;
	const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
	let {width, height} = containerSize;

	if (style.boxSizing === 'content-box') {
		const borders = getPositionedStyle(style, 'border', 'width');
		const paddings = getPositionedStyle(style, 'padding');
		width -= paddings.width + borders.width;
		height -= paddings.height + borders.height;
	}
	width = Math.max(0, width - margins.width);
	height = Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height - margins.height);
	return {
		width: Math.min(width, maxWidth, containerSize.maxWidth),
		height: Math.min(height, maxHeight, containerSize.maxHeight)
	};
}

export function retinaScale(chart, forceRatio) {
	const pixelRatio = chart.currentDevicePixelRatio = forceRatio || (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
	const {canvas, width, height} = chart;

	canvas.height = height * pixelRatio;
	canvas.width = width * pixelRatio;
	chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

	// If no style has been set on the canvas, the render size is used as display size,
	// making the chart visually bigger, so let's enforce it to the "correct" values.
	// See https://github.com/chartjs/Chart.js/issues/3575
	if (canvas.style && !canvas.style.height && !canvas.style.width) {
		canvas.style.height = height + 'px';
		canvas.style.width = width + 'px';
	}
}

/**
 * Detects support for options object argument in addEventListener.
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
 * @private
 */
export const supportsEventListenerOptions = (function() {
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

/**
 * The "used" size is the final value of a dimension property after all calculations have
 * been performed. This method uses the computed style of `element` but returns undefined
 * if the computed style is not expressed in pixels. That can happen in some cases where
 * `element` has a size relative to its parent and this last one is not yet displayed,
 * for example because of `display: none` on a parent node.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 * @returns {number=} Size in pixels or undefined if unknown.
 */
export function readUsedSize(element, property) {
	const value = getStyle(element, property);
	const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
	return matches ? +matches[1] : undefined;
}
