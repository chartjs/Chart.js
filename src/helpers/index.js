'use strict';

import color from 'chartjs-color';

import * as coreHelpers from './helpers.core';
import * as canvas from './helpers.canvas';
import * as curve from './helpers.curve';
import * as dom from './helpers.dom';
import * as easing from './helpers.easing';
import * as options from './helpers.options';
import * as math from './helpers.math';
import * as rtl from './helpers.rtl';

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
	dom,
	easing,
	options,
	math,
	rtl,

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
