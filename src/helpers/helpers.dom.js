'use strict';

/**
 * @namespace Chart.helpers.dom
 */
var helpersDom = {
	getRelativePosition: function(evt, chart) {
		var mouseX, mouseY;
		var e = evt.originalEvent || evt;
		var canvas = evt.target || evt.srcElement;
		var boundingRect = canvas.getBoundingClientRect();

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
		// http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
		var paddingLeft = parseFloat(helpersDom.getStyle(canvas, 'padding-left'));
		var paddingTop = parseFloat(helpersDom.getStyle(canvas, 'padding-top'));
		var paddingRight = parseFloat(helpersDom.getStyle(canvas, 'padding-right'));
		var paddingBottom = parseFloat(helpersDom.getStyle(canvas, 'padding-bottom'));
		var width = boundingRect.right - boundingRect.left - paddingLeft - paddingRight;
		var height = boundingRect.bottom - boundingRect.top - paddingTop - paddingBottom;

		// We divide by the current device pixel ratio, because the canvas is scaled up by that amount in each direction. However
		// the backend model is in unscaled coordinates. Since we are going to deal with our model coordinates, we go back here
		mouseX = Math.round((mouseX - boundingRect.left - paddingLeft) / (width) * canvas.width / chart.currentDevicePixelRatio);
		mouseY = Math.round((mouseY - boundingRect.top - paddingTop) / (height) * canvas.height / chart.currentDevicePixelRatio);

		return {
			x: mouseX,
			y: mouseY
		};

	},

	// Private helper function to convert max-width/max-height values that may be percentages into a number
	_parseMaxStyle: function(styleValue, node, parentProperty) {
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
	},

	/**
	 * Returns if the given value contains an effective constraint.
	 * @private
	 */
	_isConstrainedValue: function(value) {
		return value !== undefined && value !== null && value !== 'none';
	},

	// Private helper to get a constraint dimension
	// @param domNode : the node to check the constraint on
	// @param maxStyle : the style that defines the maximum for the direction we are using (maxWidth / maxHeight)
	// @param percentageProperty : property of parent to use when calculating width as a percentage
	// @see http://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser
	_getConstraintDimension: function(domNode, maxStyle, percentageProperty) {
		var view = document.defaultView;
		var parentNode = helpersDom._getParentNode(domNode);
		var constrainedNode = view.getComputedStyle(domNode)[maxStyle];
		var constrainedContainer = view.getComputedStyle(parentNode)[maxStyle];
		var hasCNode = helpersDom._isConstrainedValue(constrainedNode);
		var hasCContainer = helpersDom._isConstrainedValue(constrainedContainer);
		var infinity = Number.POSITIVE_INFINITY;

		if (hasCNode || hasCContainer) {
			return Math.min(
				hasCNode ? helpersDom._parseMaxStyle(constrainedNode, domNode, percentageProperty) : infinity,
				hasCContainer ? helpersDom._parseMaxStyle(constrainedContainer, parentNode, percentageProperty) : infinity);
		}

		return 'none';
	},
	// returns Number or undefined if no constraint
	getConstraintWidth: function(domNode) {
		return helpersDom._getConstraintDimension(domNode, 'max-width', 'clientWidth');
	},
	// returns Number or undefined if no constraint
	getConstraintHeight: function(domNode) {
		return helpersDom._getConstraintDimension(domNode, 'max-height', 'clientHeight');
	},
	/**
	 * @private
	 */
	_calculatePadding: function(container, padding, parentDimension) {
		padding = helpersDom.getStyle(container, padding);

		return padding.indexOf('%') > -1 ? parentDimension * parseInt(padding, 10) / 100 : parseInt(padding, 10);
	},
	/**
	 * @private
	 */
	_getParentNode: function(domNode) {
		var parent = domNode.parentNode;
		if (parent && parent.toString() === '[object ShadowRoot]') {
			parent = parent.host;
		}
		return parent;
	},
	getMaximumWidth: function(domNode) {
		var container = helpersDom._getParentNode(domNode);
		if (!container) {
			return domNode.clientWidth;
		}

		var clientWidth = container.clientWidth;
		var paddingLeft = helpersDom._calculatePadding(container, 'padding-left', clientWidth);
		var paddingRight = helpersDom._calculatePadding(container, 'padding-right', clientWidth);

		var w = clientWidth - paddingLeft - paddingRight;
		var cw = helpersDom.getConstraintWidth(domNode);
		return isNaN(cw) ? w : Math.min(w, cw);
	},
	getMaximumHeight: function(domNode) {
		var container = helpersDom._getParentNode(domNode);
		if (!container) {
			return domNode.clientHeight;
		}

		var clientHeight = container.clientHeight;
		var paddingTop = helpersDom._calculatePadding(container, 'padding-top', clientHeight);
		var paddingBottom = helpersDom._calculatePadding(container, 'padding-bottom', clientHeight);

		var h = clientHeight - paddingTop - paddingBottom;
		var ch = helpersDom.getConstraintHeight(domNode);
		return isNaN(ch) ? h : Math.min(h, ch);
	},
	getStyle: function(el, property) {
		return el.currentStyle ?
			el.currentStyle[property] :
			document.defaultView.getComputedStyle(el, null).getPropertyValue(property);
	},
	retinaScale: function(chart, forceRatio) {
		var pixelRatio = chart.currentDevicePixelRatio = forceRatio || (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
		if (pixelRatio === 1) {
			return;
		}

		var canvas = chart.canvas;
		var height = chart.height;
		var width = chart.width;

		canvas.height = height * pixelRatio;
		canvas.width = width * pixelRatio;
		chart.ctx.scale(pixelRatio, pixelRatio);

		// If no style has been set on the canvas, the render size is used as display size,
		// making the chart visually bigger, so let's enforce it to the "correct" values.
		// See https://github.com/chartjs/Chart.js/issues/3575
		if (!canvas.style.height && !canvas.style.width) {
			canvas.style.height = height + 'px';
			canvas.style.width = width + 'px';
		}
	}
};


module.exports = helpersDom;
