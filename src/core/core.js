/*!
 * Chart.js
 * http://chartjs.org/
 * Version: {{ version }}
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


(function() {

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart;

	//Occupy the global variable of Chart, and create a simple base class
	var Chart = function(context, config) {
		var chart = this;
		this.config = config;

		// Support a jQuery'd canvas element
		if (context.length && context[0].getContext) {
			context = context[0];
		}

		// Support a canvas domnode
		if (context.getContext) {
			context = context.getContext("2d");
		}

		this.canvas = context.canvas;

		this.ctx = context;

		//Variables global to the chart
		var computeDimension = function(element, dimension) {
			if (element['offset' + dimension]) {
				return element['offset' + dimension];
			} else {
				return document.defaultView.getComputedStyle(element).getPropertyValue(dimension);
			}
		};

		var width = this.width = computeDimension(context.canvas, 'Width') || context.canvas.width;
		var height = this.height = computeDimension(context.canvas, 'Height') || context.canvas.height;

		// Firefox requires this to work correctly
		context.canvas.width = width;
		context.canvas.height = height;

		width = this.width = context.canvas.width;
		height = this.height = context.canvas.height;
		this.aspectRatio = this.width / this.height;
		//High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
		Chart.helpers.retinaScale(this);

		if (config) {
			this.controller = new Chart.Controller(this);
			return this.controller;
		}

		return this;

	};

	//Globally expose the defaults to allow for user updating/changing
	Chart.defaults = {
		global: {
			responsive: true,
			responsiveAnimationDuration: 0,
			maintainAspectRatio: true,
			events: ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"],
			hover: {
				onHover: null,
				mode: 'single',
				animationDuration: 400,
			},
			onClick: null,
			defaultColor: 'rgba(0,0,0,0.1)',

			// Element defaults defined in element extensions
			elements: {}

		},
	};

	if (typeof amd !== 'undefined') {
		define(function() {
			return Chart;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = Chart;
	}

	root.Chart = Chart;

	Chart.noConflict = function() {
		root.Chart = previous;
		return Chart;
	};

}).call(this);
