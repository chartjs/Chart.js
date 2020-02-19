/* eslint-disable import/no-namespace */

import * as coreHelpers from './helpers.core';
import * as canvas from './helpers.canvas';
import * as curve from './helpers.curve';
import * as dom from './helpers.dom';
import effects from './helpers.easing';
import * as options from './helpers.options';
import * as math from './helpers.math';
import * as rtl from './helpers.rtl';

import {color, getHoverColor} from './helpers.color';

export default {
	...coreHelpers,
	canvas,
	curve,
	dom,
	easing: {effects},
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
	fontString(pixelSize, fontStyle, fontFamily) {
		return fontStyle + ' ' + pixelSize + 'px ' + fontFamily;
	},
	color,
	getHoverColor
};
