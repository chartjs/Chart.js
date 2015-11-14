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
		borderCapStyle: 'butt',
		borderDash: [],
		borderDashOffset: 0.0,
		borderJoinStyle: 'miter',
		fill: true, // do we fill in the area between the line and its base axis
	};


	Chart.elements.Line = Chart.Element.extend({
		lineToNextPoint: function(previousPoint, point, nextPoint) {
			var ctx = this._chart.ctx;

			if (point._view.skip) {
				if (this.loop) {
					// Go to center
					ctx.lineTo(this._view.scaleZero.x, this._view.scaleZero.y);
				} else {
					ctx.lineTo(previousPoint._view.x, this._view.scaleZero);
					ctx.moveTo(next._view.x, this._view.scaleZero);
				}
			} else if (previousPoint._view.skip) {
				ctx.lineTo(point._view.x, point._view.y);
			} else {
				// Line between points
				//if (point !== nextPoint) {
					ctx.bezierCurveTo(
						previousPoint._view.controlPointNextX, 
						previousPoint._view.controlPointNextY,
						point._view.controlPointPreviousX,
						point._view.controlPointPreviousY,
						point._view.x,
						point._view.y
					);
				//} else {
					// Drawing to the last point in the line

				//}
			}
		},

		draw: function() {

			var vm = this._view;
			var ctx = this._chart.ctx;
			var first = this._children[0];
			var last = this._children[this._children.length - 1];

			ctx.save();

			// If we had points and want to fill this line, do so.
			if (this._children.length > 0 && vm.fill) {
				// Draw the background first (so the border is always on top)
				ctx.beginPath();

				helpers.each(this._children, function(point, index) {
					var previous = helpers.previousItem(this._children, index/*, this._loop*/);
					var next = helpers.nextItem(this._children, index/*, this._loop*/);

					// First point moves to it's starting position no matter what
					if (index === 0) {
						ctx.moveTo(point._view.x, vm.scaleZero);
						ctx.lineTo(point._view.x, point._view.y);
					} else {
						this.lineToNextPoint(previous, point, next);
					}
				}, this);

				// For radial scales, loop back around to the first point
				if (this._loop) {
					if (!first._view.skip) {
						// Draw a bezier line
						ctx.bezierCurveTo(
							last._view.controlPointNextX,
							last._view.controlPointNextY,
							first._view.controlPointPreviousX,
							first._view.controlPointPreviousY,
							first._view.x,
							first._view.y
						);
					} else {
						// Go to center
						ctx.lineTo(this._view.scaleZero.x, this._view.scaleZero.y);
					}
				} else {
					//Round off the line by going to the base of the chart, back to the start, then fill.
					ctx.lineTo(this._children[this._children.length - 1]._view.x, vm.scaleZero);
					ctx.lineTo(this._children[0]._view.x, vm.scaleZero);
				}

				ctx.fillStyle = vm.backgroundColor || Chart.defaults.global.defaultColor;
				ctx.closePath();
				ctx.fill();
			}

			// Now draw the line between all the points with any borders
			ctx.lineCap = vm.borderCapStyle || Chart.defaults.global.elements.line.borderCapStyle;

			// IE 9 and 10 do not support line dash
			if (ctx.setLineDash) {
				ctx.setLineDash(vm.borderDash || Chart.defaults.global.elements.line.borderDash);
			}

			ctx.lineDashOffset = vm.borderDashOffset || Chart.defaults.global.elements.line.borderDashOffset;
			ctx.lineJoin = vm.borderJoinStyle || Chart.defaults.global.elements.line.borderJoinStyle;
			ctx.lineWidth = vm.borderWidth || Chart.defaults.global.elements.line.borderWidth;
			ctx.strokeStyle = vm.borderColor || Chart.defaults.global.defaultColor;
			ctx.beginPath();

			helpers.each(this._children, function(point, index) {
				var previous = helpers.previousItem(this._children, index);
				var next = helpers.nextItem(this._children, index);

				if (index === 0) {
					ctx.moveTo(point._view.x, point._view.y);
				} else {
					this.lineToNextPoint(previous, point, next);
				}
			}, this);

			if (this._loop) {
				if (!first._view.skip) {
					// Draw a bezier line
					ctx.bezierCurveTo(
						last._view.controlPointNextX,
						last._view.controlPointNextY,
						first._view.controlPointPreviousX,
						first._view.controlPointPreviousY,
						first._view.x,
						first._view.y
					);
				} else {
					// Go to center
					ctx.lineTo(this._view.scaleZero.x, this._view.scaleZero.y);
				}
			}

			ctx.stroke();
			ctx.restore();
		},
	});

}).call(this);
