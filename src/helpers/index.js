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

const colorHelper =
	function(value) {
		if (value instanceof CanvasGradient || value instanceof CanvasPattern) {
			// TODO: figure out what this should be. Previously returned
			// the default color
			return value;
		}

		return color(value);
	};

export default {
	...coreHelpers,
	canvas,
	curve,
	dom,
	easing,
	options,
	math,
	rtl,

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
	// Request animation polyfill
	requestAnimFrame: (function() {
		if (typeof window === 'undefined') {
			return function(callback) {
				callback();
			};
		}
		return window.requestAnimationFrame;
	}()),
	// -- Canvas methods
	fontString: function(pixelSize, fontStyle, fontFamily) {
		return fontStyle + ' ' + pixelSize + 'px ' + fontFamily;
	},
	color: colorHelper,
	getHoverColor: function(colorValue) {
		return (colorValue instanceof CanvasPattern || colorValue instanceof CanvasGradient) ?
			colorValue :
			colorHelper(colorValue).saturate(0.5).darken(0.1).rgbString();
	}
};
