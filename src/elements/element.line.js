'use strict';

import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import helpers from '../helpers';

const defaultColor = defaults.global.defaultColor;
const isPointInArea = helpers.canvas._isPointInArea;

defaults._set('global', {
	elements: {
		line: {
			tension: 0.4,
			backgroundColor: defaultColor,
			borderWidth: 3,
			borderColor: defaultColor,
			borderCapStyle: 'butt',
			borderDash: [],
			borderDashOffset: 0.0,
			borderJoinStyle: 'miter',
			capBezierPoints: true,
			fill: true
		}
	}
});

function startAtGap(points, spanGaps) {
	let closePath = true;
	let previous = points.length && points[0];
	let index, point;

	for (index = 1; index < points.length; ++index) {
		// If there is a gap in the (looping) line, start drawing from that gap
		point = points[index];
		if (!point.skip && previous.skip) {
			points = points.slice(index).concat(points.slice(0, index));
			closePath = spanGaps;
			break;
		}
		previous = point;
	}

	points.closePath = closePath;
	return points;
}

function setStyle(ctx, options) {
	ctx.lineCap = options.borderCapStyle;
	ctx.setLineDash(options.borderDash);
	ctx.lineDashOffset = options.borderDashOffset;
	ctx.lineJoin = options.borderJoinStyle;
	ctx.lineWidth = options.borderWidth;
	ctx.strokeStyle = options.borderColor;
}

function bezierCurveTo(ctx, previous, target, flip) {
	ctx.bezierCurveTo(
		flip ? previous.controlPointPreviousX : previous.controlPointNextX,
		flip ? previous.controlPointPreviousY : previous.controlPointNextY,
		flip ? target.controlPointNextX : target.controlPointPreviousX,
		flip ? target.controlPointNextY : target.controlPointPreviousY,
		target.x,
		target.y);
}

function steppedLineTo(ctx, previous, target, flip, mode) {
	if (mode === 'middle') {
		const midpoint = (previous.x + target.x) / 2.0;
		ctx.lineTo(midpoint, flip ? target.y : previous.y);
		ctx.lineTo(midpoint, flip ? previous.y : target.y);
	} else if ((mode === 'after' && !flip) || (mode !== 'after' && flip)) {
		ctx.lineTo(previous.x, target.y);
	} else {
		ctx.lineTo(target.x, previous.y);
	}
	ctx.lineTo(target.x, target.y);
}

function normalPath(ctx, points, spanGaps, options) {
	const steppedLine = options.steppedLine;
	const lineMethod = steppedLine ? steppedLineTo : bezierCurveTo;
	let move = true;
	let index, currentVM, previousVM;

	for (index = 0; index < points.length; ++index) {
		currentVM = points[index];

		if (currentVM.skip) {
			move = move || !spanGaps;
			continue;
		}
		if (move) {
			ctx.moveTo(currentVM.x, currentVM.y);
			move = false;
		} else if (options.tension || steppedLine) {
			lineMethod(ctx, previousVM, currentVM, false, steppedLine);
		} else {
			ctx.lineTo(currentVM.x, currentVM.y);
		}
		previousVM = currentVM;
	}
}

/**
 * Create path from points, grouping by truncated x-coordinate
 * Points need to be in order by x-coordinate for this to work efficiently
 * @param {CanvasRenderingContext2D} ctx - Context
 * @param {Point[]} points - Points defining the line
 * @param {boolean} spanGaps - Are gaps spanned over
 */
function fastPath(ctx, points, spanGaps) {
	let move = true;
	let count = 0;
	let avgX = 0;
	let index, vm, truncX, x, y, prevX, minY, maxY, lastY;

	for (index = 0; index < points.length; ++index) {
		vm = points[index];

		// If point is skipped, we either move to next (not skipped) point
		// or line to it if spanGaps is true. `move` can already be true.
		if (vm.skip) {
			move = move || !spanGaps;
			continue;
		}

		x = vm.x;
		y = vm.y;
		truncX = x | 0; // truncated x-coordinate

		if (move) {
			ctx.moveTo(x, y);
			move = false;
		} else if (truncX === prevX) {
			// Determine `minY` / `maxY` and `avgX` while we stay within same x-position
			minY = Math.min(y, minY);
			maxY = Math.max(y, maxY);
			// For first point in group, count is `0`, so average will be `x` / 1.
			avgX = (count * avgX + x) / ++count;
		} else {
			if (minY !== maxY) {
				// Draw line to maxY and minY, using the average x-coordinate
				ctx.lineTo(avgX, maxY);
				ctx.lineTo(avgX, minY);
				// Move to y-value of last point in group. So the line continues
				// from correct position.
				ctx.moveTo(avgX, lastY);
			}
			// Draw line to next x-position, using the first (or only)
			// y-value in that group
			ctx.lineTo(x, y);

			prevX = truncX;
			count = 0;
			minY = maxY = y;
		}
		// Keep track of the last y-value in group
		lastY = y;
	}
}

function useFastPath(options) {
	return options.tension === 0 && !options.steppedLine && !options.fill && !options.borderDash.length;
}

function capControlPoint(pt, min, max) {
	return Math.max(Math.min(pt, max), min);
}

function capBezierPoints(points, area) {
	var i, ilen, model;
	for (i = 0, ilen = points.length; i < ilen; ++i) {
		model = points[i];
		if (isPointInArea(model, area)) {
			if (i > 0 && isPointInArea(points[i - 1], area)) {
				model.controlPointPreviousX = capControlPoint(model.controlPointPreviousX, area.left, area.right);
				model.controlPointPreviousY = capControlPoint(model.controlPointPreviousY, area.top, area.bottom);
			}
			if (i < points.length - 1 && isPointInArea(points[i + 1], area)) {
				model.controlPointNextX = capControlPoint(model.controlPointNextX, area.left, area.right);
				model.controlPointNextY = capControlPoint(model.controlPointNextY, area.top, area.bottom);
			}
		}
	}
}

function updateBezierControlPoints(points, options, area, loop) {
	var i, ilen, point, controlPoints;

	// Only consider points that are drawn in case the spanGaps option is used
	if (options.spanGaps) {
		points = points.filter(function(pt) {
			return !pt.skip;
		});
	}

	if (options.cubicInterpolationMode === 'monotone') {
		helpers.curve.splineCurveMonotone(points);
	} else {
		let prev = loop ? points[points.length - 1] : points[0];
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			point = points[i];
			controlPoints = helpers.curve.splineCurve(
				prev,
				point,
				points[Math.min(i + 1, ilen - (loop ? 0 : 1)) % ilen],
				options.tension
			);
			point.controlPointPreviousX = controlPoints.previous.x;
			point.controlPointPreviousY = controlPoints.previous.y;
			point.controlPointNextX = controlPoints.next.x;
			point.controlPointNextY = controlPoints.next.y;
			prev = point;
		}
	}

	if (options.capBezierPoints) {
		capBezierPoints(points, area);
	}
}

class Line extends Element {

	constructor(props) {
		super(props);
	}

	updateControlPoints(chartArea) {
		const me = this;
		if (me._controlPointsUpdated) {
			return;
		}
		const options = me.options;
		if (options.tension && !options.steppedLine) {
			updateBezierControlPoints(me._children, options, chartArea, me._loop);
		}
	}

	drawPath(ctx, area) {
		const me = this;
		const options = me.options;
		const spanGaps = options.spanGaps;
		let closePath = me._loop;
		let points = me._children;

		if (!points.length) {
			return;
		}

		if (closePath) {
			points = startAtGap(points, spanGaps);
			closePath = points.closePath;
		}

		if (useFastPath(options)) {
			fastPath(ctx, points, spanGaps);
		} else {
			me.updateControlPoints(area);
			normalPath(ctx, points, spanGaps, options);
		}

		return closePath;
	}

	draw(ctx, area) {
		const me = this;

		if (!me._children.length) {
			return;
		}

		ctx.save();

		setStyle(ctx, me.options);

		ctx.beginPath();

		if (me.drawPath(ctx, area)) {
			ctx.closePath();
		}

		ctx.stroke();
		ctx.restore();
	}
}

Line.prototype._type = 'line';

export default Line;
