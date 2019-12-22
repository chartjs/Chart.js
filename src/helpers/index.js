'use strict';

import * as coreHelpers from './helpers.core';
import * as canvas from './helpers.canvas';
import * as collection from './helpers.collection';
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
	...collection,
	...color,
	curve,
	dom,
	easing,
	options,
	math,
	rtl,

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
};
