'use strict';

import color from '@kurkle/color';

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
			colorHelper(colorValue).saturate(0.5).darken(0.1).hexString();
	}
};
