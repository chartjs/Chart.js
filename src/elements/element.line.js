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
		draw: function() {

			var vm = this._view;
			var ctx = this._chart.ctx;
			var first = this._children[0];
			var last = this._children[this._children.length - 1];

			ctx.save();

			// Draw the background first (so the border is always on top)
			helpers.each(this._children, function(point, index) {

				var previous = helpers.previousItem(this._children, index);
				var next = helpers.nextItem(this._children, index);

				// First point moves to it's starting position no matter what
				if (!index) {
					ctx.moveTo(point._view.x, vm.scaleZero);
				}

				// Skip this point, draw to scaleZero, move to next point, and draw to next point
				if (point._view.skip && !this.loop) {
					ctx.lineTo(previous._view.x, vm.scaleZero);
					ctx.moveTo(next._view.x, vm.scaleZero);
					return;
				}

				// The previous line was skipped, so just draw a normal straight line to the point
				if (previous._view.skip) {
					ctx.lineTo(point._view.x, point._view.y);
					return;
				}

				// Draw a bezier to point
				if (vm.tension > 0 && index) {
					//ctx.lineTo(point._view.x, point._view.y);
					ctx.bezierCurveTo(
						previous._view.controlPointNextX,
						previous._view.controlPointNextY,
						point._view.controlPointPreviousX,
						point._view.controlPointPreviousY,
						point._view.x,
						point._view.y
					);
					return;
				}

				// Draw a straight line to the point
				ctx.lineTo(point._view.x, point._view.y);

			}, this);

			// For radial scales, loop back around to the first point
			if (this._loop) {
				// Draw a bezier line
				if (vm.tension > 0 && !first._view.skip) {
					ctx.bezierCurveTo(
						last._view.controlPointNextX,
						last._view.controlPointNextY,
						first._view.controlPointPreviousX,
						first._view.controlPointPreviousY,
						first._view.x,
						first._view.y
					);
					return;
				}
				// Draw a straight line
				ctx.lineTo(first._view.x, first._view.y);
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

				if (!index) {
					ctx.moveTo(point._view.x, vm.scaleZero);
				}

				// Skip this point and move to the next points zeroPoint
				if (point._view.skip && !this.loop) {
					ctx.moveTo(next._view.x, vm.scaleZero);
					return;
				}

				// Previous point was skipped, just move to the point
				if (previous._view.skip) {
					ctx.moveTo(point._view.x, point._view.y);
					return;
				}

				// If First point, move to the point ahead of time (so a line doesn't get drawn up the left axis)
				if (!index) {
					ctx.moveTo(point._view.x, point._view.y);
				}

				// Draw a bezier line to the point
				if (vm.tension > 0 && index) {
					ctx.bezierCurveTo(
						previous._view.controlPointNextX,
						previous._view.controlPointNextY,
						point._view.controlPointPreviousX,
						point._view.controlPointPreviousY,
						point._view.x,
						point._view.y
					);
					return;
				}

				// Draw a straight line to the point
				ctx.lineTo(point._view.x, point._view.y);

			}, this);

			if (this._loop && !first._view.skip) {

				// Draw a bezier line to the first point
				if (vm.tension > 0) {
					ctx.bezierCurveTo(
						last._view.controlPointNextX,
						last._view.controlPointNextY,
						first._view.controlPointPreviousX,
						first._view.controlPointPreviousY,
						first._view.x,
						first._view.y
					);
					return;
				}

				// Draw a straight line to the first point
				ctx.lineTo(first._view.x, first._view.y);
			}

			ctx.stroke();
			ctx.restore();
		},
	});

}).call(this);
