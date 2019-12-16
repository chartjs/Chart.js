'use strict';

import color from 'chartjs-color';

import * as coreHelpers from './helpers.core';
import * as canvas from './helpers.canvas';
import * as curve from './helpers.curve';
import * as easing from './helpers.easing';
import * as options from './helpers.options';
import * as math from './helpers.math';
import * as rtl from './helpers.rtl';

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

	return 'none';
}

function getStyle(el, property) {
	return el.currentStyle ?
		el.currentStyle[property] :
		document.defaultView.getComputedStyle(el, null).getPropertyValue(property);
}

// returns Number or undefined if no constraint
function getConstraintWidth(domNode) {
	return getConstraintDimension(domNode, 'max-width', 'clientWidth');
}

// returns Number or undefined if no constraint
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

const colorHelper = !color ?
	function(value) {
		console.error('Color.js not found!');
		return value;
	} :
	function(value) {
		if (value instanceof CanvasGradient || value instanceof CanvasPattern) {
			// TODO: figure out what this should be. Previously returned
			// the default color
			return value;
		}

		return color(value);
	};

function measureText(ctx, data, gc, longest, string) {
	var textWidth = data[string];
	if (!textWidth) {
		textWidth = data[string] = ctx.measureText(string).width;
		gc.push(string);
	}
	if (textWidth > longest) {
		longest = textWidth;
	}
	return longest;
}

export default {
	...coreHelpers,
	canvas,
	curve,
	easing,
	options,
	math,
	rtl,

	where: function(collection, filterCallback) {
		if (coreHelpers.isArray(collection) && Array.prototype.filter) {
			return collection.filter(filterCallback);
		}
		var filtered = [];

		coreHelpers.each(collection, function(item) {
			if (filterCallback(item)) {
				filtered.push(item);
			}
		});

		return filtered;
	},
	findIndex: Array.prototype.findIndex ?
		function(array, callback, scope) {
			return array.findIndex(callback, scope);
		} :
		function(array, callback, scope) {
			scope = scope === undefined ? array : scope;
			for (var i = 0, ilen = array.length; i < ilen; ++i) {
				if (callback.call(scope, array[i], i, array)) {
					return i;
				}
			}
			return -1;
		},
	findNextWhere: function(arrayToSearch, filterCallback, startIndex) {
		// Default to start of the array
		if (coreHelpers.isNullOrUndef(startIndex)) {
			startIndex = -1;
		}
		for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
			var currentItem = arrayToSearch[i];
			if (filterCallback(currentItem)) {
				return currentItem;
			}
		}
	},
	findPreviousWhere: function(arrayToSearch, filterCallback, startIndex) {
		// Default to end of the array
		if (coreHelpers.isNullOrUndef(startIndex)) {
			startIndex = arrayToSearch.length;
		}
		for (var i = startIndex - 1; i >= 0; i--) {
			var currentItem = arrayToSearch[i];
			if (filterCallback(currentItem)) {
				return currentItem;
			}
		}
	},
	// Implementation of the nice number algorithm used in determining where axis labels will go
	niceNum: function(range, round) {
		var exponent = Math.floor(math.log10(range));
		var fraction = range / Math.pow(10, exponent);
		var niceFraction;

		if (round) {
			if (fraction < 1.5) {
				niceFraction = 1;
			} else if (fraction < 3) {
				niceFraction = 2;
			} else if (fraction < 7) {
				niceFraction = 5;
			} else {
				niceFraction = 10;
			}
		} else if (fraction <= 1.0) {
			niceFraction = 1;
		} else if (fraction <= 2) {
			niceFraction = 2;
		} else if (fraction <= 5) {
			niceFraction = 5;
		} else {
			niceFraction = 10;
		}

		return niceFraction * Math.pow(10, exponent);
	},
	// Request animation polyfill - https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
	requestAnimFrame: (function() {
		if (typeof window === 'undefined') {
			return function(callback) {
				callback();
			};
		}
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) {
				return window.setTimeout(callback, 1000 / 60);
			};
	}()),
	// -- DOM methods
	getRelativePosition: function(evt, chart) {
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

	},
	getMaximumWidth: function(domNode) {
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
	},
	getMaximumHeight: function(domNode) {
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
	},
	getStyle,
	retinaScale: function(chart, forceRatio) {
		var pixelRatio = chart.currentDevicePixelRatio = forceRatio || (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
		if (pixelRatio === 1) {
			return;
		}

		var canvasElement = chart.canvas;
		var height = chart.height;
		var width = chart.width;

		canvasElement.height = height * pixelRatio;
		canvasElement.width = width * pixelRatio;
		chart.ctx.scale(pixelRatio, pixelRatio);

		// If no style has been set on the canvas, the render size is used as display size,
		// making the chart visually bigger, so let's enforce it to the "correct" values.
		// See https://github.com/chartjs/Chart.js/issues/3575
		if (!canvasElement.style.height && !canvasElement.style.width) {
			canvasElement.style.height = height + 'px';
			canvasElement.style.width = width + 'px';
		}
	},
	// -- Canvas methods
	fontString: function(pixelSize, fontStyle, fontFamily) {
		return fontStyle + ' ' + pixelSize + 'px ' + fontFamily;
	},
	longestText: function(ctx, font, arrayOfThings, cache) {
		cache = cache || {};
		var data = cache.data = cache.data || {};
		var gc = cache.garbageCollect = cache.garbageCollect || [];

		if (cache.font !== font) {
			data = cache.data = {};
			gc = cache.garbageCollect = [];
			cache.font = font;
		}

		ctx.font = font;
		var longest = 0;
		var ilen = arrayOfThings.length;
		var i, j, jlen, thing, nestedThing;
		for (i = 0; i < ilen; i++) {
			thing = arrayOfThings[i];

			// Undefined strings and arrays should not be measured
			if (thing !== undefined && thing !== null && coreHelpers.isArray(thing) !== true) {
				longest = measureText(ctx, data, gc, longest, thing);
			} else if (coreHelpers.isArray(thing)) {
				// if it is an array lets measure each element
				// to do maybe simplify this function a bit so we can do this more recursively?
				for (j = 0, jlen = thing.length; j < jlen; j++) {
					nestedThing = thing[j];
					// Undefined strings and arrays should not be measured
					if (nestedThing !== undefined && nestedThing !== null && !coreHelpers.isArray(nestedThing)) {
						longest = measureText(ctx, data, gc, longest, nestedThing);
					}
				}
			}
		}

		var gcLen = gc.length / 2;
		if (gcLen > arrayOfThings.length) {
			for (i = 0; i < gcLen; i++) {
				delete data[gc[i]];
			}
			gc.splice(0, gcLen);
		}
		return longest;
	},
	measureText,
	color: colorHelper,
	getHoverColor: function(colorValue) {
		return (colorValue instanceof CanvasPattern || colorValue instanceof CanvasGradient) ?
			colorValue :
			colorHelper(colorValue).saturate(0.5).darken(0.1).rgbString();
	}
};
