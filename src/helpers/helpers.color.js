'use strict';

var helpers = require('../helpers/index');
var color = require('chartjs-color');
var defaults = require('../core/core.defaults');

helpers.color = helpers.color || (!color ?
	function(value) {
		console.error('Color.js not found!');
		return value;
	} :
	function(value) {
		/* global CanvasGradient */
		if (value instanceof CanvasGradient) {
			value = defaults.global.defaultColor;
		}

		return color(value);
	});

helpers.getHoverColor = helpers.getHoverColor || function(colorValue) {
	/* global CanvasPattern */
	return (colorValue instanceof CanvasPattern || colorValue instanceof CanvasGradient) ?
		colorValue :
		helpers.color(colorValue).saturate(0.5).darken(0.1).rgbString();
};

module.exports = helpers;
