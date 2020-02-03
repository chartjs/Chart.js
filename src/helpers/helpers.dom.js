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
function _getParentNode(domNode) {
	var parent = domNode.parentNode;
	if (parent && parent.toString() === '[object ShadowRoot]') {
		parent = parent.host;
	}
	return parent;
}

// Private helper function to convert max-width/max-height values that may be percentages into a number
function parseMaxStyle(styleValue, node, parentProperty) {
	var valueInPixels;
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
 * @return {number|undefined} number or undefined if no constraint
 * @see {@link https://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser}
 */
function getConstraintDimension(domNode, maxStyle, percentageProperty) {
	var view = document.defaultView;
	var parentNode = _getParentNode(domNode);
	var constrainedNode = view.getComputedStyle(domNode)[maxStyle];
	var constrainedContainer = view.getComputedStyle(parentNode)[maxStyle];
	var hasCNode = isConstrainedValue(constrainedNode);
	var hasCContainer = isConstrainedValue(constrainedContainer);
	var infinity = Number.POSITIVE_INFINITY;

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

/** @return {number|undefined} number or undefined if no constraint */
function getConstraintWidth(domNode) {
	return getConstraintDimension(domNode, 'max-width', 'clientWidth');
}

/** @return {number|undefined} number or undefined if no constraint */
function getConstraintHeight(domNode) {
	return getConstraintDimension(domNode, 'max-height', 'clientHeight');
}

/**
 * @private
 */
function _calculatePadding(container, padding, parentDimension) {
	padding = getStyle(container, padding);

	return padding.indexOf('%') > -1 ? parentDimension * parseInt(padding, 10) / 100 : parseInt(padding, 10);
}

export function getRelativePosition(evt, chart) {
	var mouseX, mouseY;
	var e = evt.originalEvent || evt;
	var canvasElement = evt.target || evt.srcElement;
	var boundingRect = canvasElement.getBoundingClientRect();

	var touches = e.touches;
	if (touches && touches.length > 0) {
		mouseX = touches[0].clientX;
		mouseY = touches[0].clientY;

	} else {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	// Scale mouse coordinates into canvas coordinates
	// by following the pattern laid out by 'jerryj' in the comments of
	// https://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
	var paddingLeft = parseFloat(getStyle(canvasElement, 'padding-left'));
	var paddingTop = parseFloat(getStyle(canvasElement, 'padding-top'));
	var paddingRight = parseFloat(getStyle(canvasElement, 'padding-right'));
	var paddingBottom = parseFloat(getStyle(canvasElement, 'padding-bottom'));
	var width = boundingRect.right - boundingRect.left - paddingLeft - paddingRight;
	var height = boundingRect.bottom - boundingRect.top - paddingTop - paddingBottom;

	// We divide by the current device pixel ratio, because the canvas is scaled up by that amount in each direction. However
	// the backend model is in unscaled coordinates. Since we are going to deal with our model coordinates, we go back here
	mouseX = Math.round((mouseX - boundingRect.left - paddingLeft) / (width) * canvasElement.width / chart.currentDevicePixelRatio);
	mouseY = Math.round((mouseY - boundingRect.top - paddingTop) / (height) * canvasElement.height / chart.currentDevicePixelRatio);

	return {
		x: mouseX,
		y: mouseY
	};
}

export function getMaximumWidth(domNode) {
	var container = _getParentNode(domNode);
	if (!container) {
		return domNode.clientWidth;
	}

	var clientWidth = container.clientWidth;
	var paddingLeft = _calculatePadding(container, 'padding-left', clientWidth);
	var paddingRight = _calculatePadding(container, 'padding-right', clientWidth);

	var w = clientWidth - paddingLeft - paddingRight;
	var cw = getConstraintWidth(domNode);
	return isNaN(cw) ? w : Math.min(w, cw);
}

export function getMaximumHeight(domNode) {
	var container = _getParentNode(domNode);
	if (!container) {
		return domNode.clientHeight;
	}

	var clientHeight = container.clientHeight;
	var paddingTop = _calculatePadding(container, 'padding-top', clientHeight);
	var paddingBottom = _calculatePadding(container, 'padding-bottom', clientHeight);

	var h = clientHeight - paddingTop - paddingBottom;
	var ch = getConstraintHeight(domNode);
	return isNaN(ch) ? h : Math.min(h, ch);
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
	if (!canvas.style.height && !canvas.style.width) {
		canvas.style.height = height + 'px';
		canvas.style.width = width + 'px';
	}
}
