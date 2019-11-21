'use strict';

import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import helpers from '../helpers';

const defaultColor = defaults.global.defaultColor;

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
			fill: true, // do we fill in the area between the line and its base axis
		}
	}
});

function startAtGap(points, spanGaps) {
	let closePath = true;
	let previous = points.length && points[0]._view;
	let index, view;

	for (index = 1; index < points.length; ++index) {
		// If there is a gap in the (looping) line, start drawing from that gap
		view = points[index]._view;
		if (!view.skip && previous.skip) {
			points = points.slice(index).concat(points.slice(0, index));
			closePath = spanGaps;
			break;
		}
		previous = view;
	}

	points.closePath = closePath;
	return points;
}

function setStyle(ctx, vm) {
	ctx.lineCap = vm.borderCapStyle;
	ctx.setLineDash(vm.borderDash);
	ctx.lineDashOffset = vm.borderDashOffset;
	ctx.lineJoin = vm.borderJoinStyle;
	ctx.lineWidth = vm.borderWidth;
	ctx.strokeStyle = vm.borderColor;
}

function normalPath(ctx, points, spanGaps, vm) {
	const steppedLine = vm.steppedLine;
	const lineMethod = steppedLine ? helpers.canvas._steppedLineTo : helpers.canvas._bezierCurveTo;
	let move = true;
	let index, currentVM, previousVM;

	for (index = 0; index < points.length; ++index) {
		currentVM = points[index]._view;

		if (currentVM.skip) {
			move = move || !spanGaps;
			continue;
		}
		if (move) {
			ctx.moveTo(currentVM.x, currentVM.y);
			move = false;
		} else if (vm.tension || steppedLine) {
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
		vm = points[index]._view;

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

function useFastPath(vm) {
	return vm.tension === 0 && !vm.steppedLine && !vm.fill && !vm.borderDash.length;
}

class Line extends Element {

	constructor(props) {
		super(props);
	}

	draw(ctx) {
		const me = this;
		const vm = me._view;
		const spanGaps = vm.spanGaps;
		let closePath = me._loop;
		let points = me._children;

		if (!points.length) {
			return;
		}

		if (closePath) {
			points = startAtGap(points, spanGaps);
			closePath = points.closePath;
		}

		ctx.save();

		setStyle(ctx, vm);

		ctx.beginPath();

		if (useFastPath(vm)) {
			fastPath(ctx, points, spanGaps);
		} else {
			normalPath(ctx, points, spanGaps, vm);
		}

		if (closePath) {
			ctx.closePath();
		}

		ctx.stroke();
		ctx.restore();
	}
}

Line.prototype._type = 'line';

export default Line;
