"use strict";

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	var globalDefaults = Chart.defaults.global;

	Chart.defaults.global.elements.line = {
		tension: 0.4,
		backgroundColor: globalDefaults.defaultColor,
		borderWidth: 3,
		borderColor: globalDefaults.defaultColor,
		borderCapStyle: 'butt',
		borderDash: [],
		borderDashOffset: 0.0,
		borderJoinStyle: 'miter',
		fill: true // do we fill in the area between the line and its base axis
	};

	Chart.elements.Line = Chart.Element.extend({
		lineToNextPoint: function(previousPoint, point, nextPoint, skipHandler, previousSkipHandler) {
			var me = this;
			var ctx = me._chart.ctx;
			var spanGaps = me._view ? me._view.spanGaps : false;

			if (point._view.skip && !spanGaps) {
				skipHandler.call(me, previousPoint, point, nextPoint);
			} else if (previousPoint._view.skip && !spanGaps) {
				previousSkipHandler.call(me, previousPoint, point, nextPoint);
			} else if (point._view.tension === 0) {
				ctx.lineTo(point._view.x, point._view.y);
			} else {
				// Line between points
				ctx.bezierCurveTo(
					previousPoint._view.controlPointNextX,
					previousPoint._view.controlPointNextY,
					point._view.controlPointPreviousX,
					point._view.controlPointPreviousY,
					point._view.x,
					point._view.y
				);
			}
		},

		draw: function() {
			var me = this;

			var vm = me._view;
			var ctx = me._chart.ctx;
			var first = me._children[0];
			var last = me._children[me._children.length - 1];

			function loopBackToStart(drawLineToCenter) {
				if (!first._view.skip && !last._view.skip) {
					// Draw a bezier line from last to first
					ctx.bezierCurveTo(
						last._view.controlPointNextX,
						last._view.controlPointNextY,
						first._view.controlPointPreviousX,
						first._view.controlPointPreviousY,
						first._view.x,
						first._view.y
					);
				} else if (drawLineToCenter) {
					// Go to center
					ctx.lineTo(me._view.scaleZero.x, me._view.scaleZero.y);
				}
			}

			ctx.save();

			// If we had points and want to fill this line, do so.
			if (me._children.length > 0 && vm.fill) {
				// Draw the background first (so the border is always on top)
				ctx.beginPath();

				helpers.each(me._children, function(point, index) {
					var previous = helpers.previousItem(me._children, index);
					var next = helpers.nextItem(me._children, index);

					// First point moves to it's starting position no matter what
					if (index === 0) {
						if (me._loop) {
							ctx.moveTo(vm.scaleZero.x, vm.scaleZero.y);
						} else {
							ctx.moveTo(point._view.x, vm.scaleZero);
						}

						if (point._view.skip) {
							if (!me._loop) {
								ctx.moveTo(next._view.x, me._view.scaleZero);
							}
						} else {
							ctx.lineTo(point._view.x, point._view.y);
						}
					} else {
						me.lineToNextPoint(previous, point, next, function(previousPoint, point, nextPoint) {
							if (me._loop) {
								// Go to center
								ctx.lineTo(me._view.scaleZero.x, me._view.scaleZero.y);
							} else {
								ctx.lineTo(previousPoint._view.x, me._view.scaleZero);
								ctx.moveTo(nextPoint._view.x, me._view.scaleZero);
							}
						}, function(previousPoint, point) {
							// If we skipped the last point, draw a line to ourselves so that the fill is nice
							ctx.lineTo(point._view.x, point._view.y);
						});
					}
				}, me);

				// For radial scales, loop back around to the first point
				if (me._loop) {
					loopBackToStart(true);
				} else {
					//Round off the line by going to the base of the chart, back to the start, then fill.
					ctx.lineTo(me._children[me._children.length - 1]._view.x, vm.scaleZero);
					ctx.lineTo(me._children[0]._view.x, vm.scaleZero);
				}

				ctx.fillStyle = vm.backgroundColor || globalDefaults.defaultColor;
				ctx.closePath();
				ctx.fill();
			}

			var globalOptionLineElements = globalDefaults.elements.line;
			// Now draw the line between all the points with any borders
			ctx.lineCap = vm.borderCapStyle || globalOptionLineElements.borderCapStyle;

			// IE 9 and 10 do not support line dash
			if (ctx.setLineDash) {
				ctx.setLineDash(vm.borderDash || globalOptionLineElements.borderDash);
			}

			ctx.lineDashOffset = vm.borderDashOffset || globalOptionLineElements.borderDashOffset;
			ctx.lineJoin = vm.borderJoinStyle || globalOptionLineElements.borderJoinStyle;
			ctx.lineWidth = vm.borderWidth || globalOptionLineElements.borderWidth;
			ctx.strokeStyle = vm.borderColor || globalDefaults.defaultColor;
			ctx.beginPath();

			helpers.each(me._children, function(point, index) {
				var previous = helpers.previousItem(me._children, index);
				var next = helpers.nextItem(me._children, index);

				if (index === 0) {
					ctx.moveTo(point._view.x, point._view.y);
				} else {
					me.lineToNextPoint(previous, point, next, function(previousPoint, point, nextPoint) {
						ctx.moveTo(nextPoint._view.x, nextPoint._view.y);
					}, function(previousPoint, point) {
						// If we skipped the last point, move up to our point preventing a line from being drawn
						ctx.moveTo(point._view.x, point._view.y);
					});
				}
			}, me);

			if (me._loop && me._children.length > 0) {
				loopBackToStart();
			}

			ctx.stroke();
			ctx.restore();
		}
	});
};