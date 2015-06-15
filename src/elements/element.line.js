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

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.global.elements.line = {
		tension: 0.4,
		backgroundColor: Chart.defaults.global.defaultColor,
		borderWidth: 3,
		borderColor: Chart.defaults.global.defaultColor,
		fill: true, // do we fill in the area between the line and its base axis
		skipNull: true,
		drawNull: false,
	};


	Chart.elements.Line = Chart.Element.extend({
		draw: function() {

			var vm = this._view;
			var ctx = this._chart.ctx;
			var first = this._children[0];
			var last = this._children[this._children.length - 1];

			// Draw the background first (so the border is always on top)
			helpers.each(this._children, function(point, index) {
				var previous = helpers.previousItem(this._children, index);
				var next = helpers.nextItem(this._children, index);

				// First point only
				if (index === 0) {
					ctx.moveTo(point._view.x, point._view.y);
					return;
				}

				// Start Skip and drag along scale baseline
				if (point._view.skip && vm.skipNull && !this._loop) {
					ctx.lineTo(previous._view.x, point._view.y);
					ctx.moveTo(next._view.x, point._view.y);
				}
				// End Skip Stright line from the base line
				else if (previous._view.skip && vm.skipNull && !this._loop) {
					ctx.moveTo(point._view.x, previous._view.y);
					ctx.lineTo(point._view.x, point._view.y);
				}

				if (previous._view.skip && vm.skipNull) {
					ctx.moveTo(point._view.x, point._view.y);
				}
				// Normal Bezier Curve
				else {
					if (vm.tension > 0) {
						ctx.bezierCurveTo(
							previous._view.controlPointNextX,
							previous._view.controlPointNextY,
							point._view.controlPointPreviousX,
							point._view.controlPointPreviousY,
							point._view.x,
							point._view.y
						);
					} else {
						ctx.lineTo(point._view.x, point._view.y);
					}
				}
			}, this);

			// For radial scales, loop back around to the first point
			if (this._loop) {
				if (vm.tension > 0 && !first._view.skip) {

					ctx.bezierCurveTo(
						last._view.controlPointNextX,
						last._view.controlPointNextY,
						first._view.controlPointPreviousX,
						first._view.controlPointPreviousY,
						first._view.x,
						first._view.y
					);
				} else {
					ctx.lineTo(first._view.x, first._view.y);
				}
			}

			// If we had points and want to fill this line, do so.
			if (this._children.length > 0 && vm.fill) {
				//Round off the line by going to the base of the chart, back to the start, then fill.
				ctx.lineTo(this._children[this._children.length - 1]._view.x, vm.scaleZero);
				ctx.lineTo(this._children[0]._view.x, vm.scaleZero);
				ctx.fillStyle = vm.backgroundColor || Chart.defaults.global.defaultColor;
				ctx.closePath();
				ctx.fill();
			}


			// Now draw the line between all the points with any borders
			ctx.lineWidth = vm.borderWidth || Chart.defaults.global.defaultColor;
			ctx.strokeStyle = vm.borderColor || Chart.defaults.global.defaultColor;
			ctx.beginPath();

			helpers.each(this._children, function(point, index) {
				var previous = helpers.previousItem(this._children, index);
				var next = helpers.nextItem(this._children, index);

				// First point only
				if (index === 0) {
					ctx.moveTo(point._view.x, point._view.y);
					return;
				}

				// Start Skip and drag along scale baseline
				if (point._view.skip && vm.skipNull && !this._loop) {
					ctx.moveTo(previous._view.x, point._view.y);
					ctx.moveTo(next._view.x, point._view.y);
					return;
				}
				// End Skip Stright line from the base line
				if (previous._view.skip && vm.skipNull && !this._loop) {
					ctx.moveTo(point._view.x, previous._view.y);
					ctx.moveTo(point._view.x, point._view.y);
					return;
				}

				if (previous._view.skip && vm.skipNull) {
					ctx.moveTo(point._view.x, point._view.y);
					return;
				}
				// Normal Bezier Curve
				if (vm.tension > 0) {
					ctx.bezierCurveTo(
						previous._view.controlPointNextX,
						previous._view.controlPointNextY,
						point._view.controlPointPreviousX,
						point._view.controlPointPreviousY,
						point._view.x,
						point._view.y
					);
				} else {
					ctx.lineTo(point._view.x, point._view.y);
				}
			}, this);

			if (this._loop && !first._view.skip) {
				if (vm.tension > 0) {

					ctx.bezierCurveTo(
						last._view.controlPointNextX,
						last._view.controlPointNextY,
						first._view.controlPointPreviousX,
						first._view.controlPointPreviousY,
						first._view.x,
						first._view.y
					);
				} else {
					ctx.lineTo(first._view.x, first._view.y);
				}
			}


			ctx.stroke();

		},
	});

}).call(this);
