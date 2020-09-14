/**
 * Returns if the given value contains an effective constraint.
 * @private
 */
function isConstrainedValue(value) {
	return value !== undefined && value !== null && value !== 'none';
}

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

// Private helper function to convert max-width/max-height values that may be percentages into a number
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

/**
 * Returns the max width or height of the given DOM node in a cross-browser compatible fashion
 * @param {HTMLElement} domNode - the node to check the constraint on
 * @param {string} maxStyle - the style that defines the maximum for the direction we are using ('max-width' / 'max-height')
 * @param {string} percentageProperty - property of parent to use when calculating width as a percentage
 * @return {number=} number or undefined if no constraint
 * @see {@link https://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser}
 */
function getConstraintDimension(domNode, maxStyle, percentageProperty) {
	const view = document.defaultView;
	const parentNode = _getParentNode(domNode);
	const constrainedNode = view.getComputedStyle(domNode)[maxStyle];
	const constrainedContainer = view.getComputedStyle(parentNode)[maxStyle];
	const hasCNode = isConstrainedValue(constrainedNode);
	const hasCContainer = isConstrainedValue(constrainedContainer);
	const infinity = Number.POSITIVE_INFINITY;

	if (hasCNode || hasCContainer) {
		return Math.min(
			hasCNode ? parseMaxStyle(constrainedNode, domNode, percentageProperty) : infinity,
			hasCContainer ? parseMaxStyle(constrainedContainer, parentNode, percentageProperty) : infinity);
	}
}

export function getStyle(el, property) {
	return el.currentStyle ?
		el.currentStyle[property] :
		document.defaultView.getComputedStyle(el, null).getPropertyValue(property);
}

/**
 * @private
 */
function _calculatePadding(container, padding, parentDimension) {
	padding = getStyle(container, padding);

	// If the padding is not set at all and the node is not in the DOM, this can be an empty string
	// In that case, we need to handle it as no padding
	if (padding === '') {
		return 0;
	}

	return padding.indexOf('%') > -1 ? parentDimension * parseInt(padding, 10) / 100 : parseInt(padding, 10);
}

export function getRelativePosition(evt, chart) {
	const e = evt.originalEvent || evt;
	const touches = e.touches;
	const source = touches && touches.length ? touches[0] : e;
	const {offsetX, offsetY} = source;

	if (offsetX > 0 || offsetY > 0) {
		return {
			x: offsetX,
			y: offsetY
		};
	}

	return calculateRelativePositionFromClientXY(source, chart);
}

function calculateRelativePositionFromClientXY(source, chart) {
	const {clientX: x, clientY: y} = source;

	const canvasElement = chart.canvas;
	const devicePixelRatio = chart.currentDevicePixelRatio;
	const boundingRect = canvasElement.getBoundingClientRect();
	// Scale mouse coordinates into canvas coordinates
	// by following the pattern laid out by 'jerryj' in the comments of
	// https://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
	const paddingLeft = parseFloat(getStyle(canvasElement, 'padding-left'));
	const paddingTop = parseFloat(getStyle(canvasElement, 'padding-top'));
	const paddingRight = parseFloat(getStyle(canvasElement, 'padding-right'));
	const paddingBottom = parseFloat(getStyle(canvasElement, 'padding-bottom'));
	const width = boundingRect.right - boundingRect.left - paddingLeft - paddingRight;
	const height = boundingRect.bottom - boundingRect.top - paddingTop - paddingBottom;

	// We divide by the current device pixel ratio, because the canvas is scaled up by that amount in each direction. However
	// the backend model is in unscaled coordinates. Since we are going to deal with our model coordinates, we go back here
	return {
		x: Math.round((x - boundingRect.left - paddingLeft) / (width) * canvasElement.width / devicePixelRatio),
		y: Math.round((y - boundingRect.top - paddingTop) / (height) * canvasElement.height / devicePixelRatio)
	};
}

function fallbackIfNotValid(measure, fallback) {
	return typeof measure === 'number' ? measure : fallback;
}

function getMax(domNode, prop, fallback, paddings) {
	const container = _getParentNode(domNode);
	if (!container) {
		return fallbackIfNotValid(domNode[prop], domNode[fallback]);
	}

	const value = container[prop];
	const padding = paddings.reduce((acc, cur) => acc + _calculatePadding(container, 'padding-' + cur, value), 0);

	const v = value - padding;
	const cv = getConstraintDimension(domNode, 'max-' + fallback, prop);
	return isNaN(cv) ? v : Math.min(v, cv);
}

export const getMaximumWidth = (domNode) => getMax(domNode, 'clientWidth', 'width', ['left', 'right']);
export const getMaximumHeight = (domNode) => getMax(domNode, 'clientHeight', 'height', ['top', 'bottom']);

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
