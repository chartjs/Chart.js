'use strict';

import * as coreHelpers from './helpers.core';
import * as canvas from './helpers.canvas';
import * as color from './helpers.color';
import * as curve from './helpers.curve';
import * as dom from './helpers.dom';
import * as easing from './helpers.easing';
import * as options from './helpers.options';
import * as math from './helpers.math';
import * as rtl from './helpers.rtl';

export default {
	...coreHelpers,
	canvas,
	color,
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
	}
};
