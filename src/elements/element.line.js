'use strict';

const defaults = require('../core/core.defaults');
const Element = require('../core/core.element');
const helpers = require('../helpers/index');

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
	let index, view, cloned;
	for (index = 1; index < points.length; ++index) {
		// If the line has an open path, shift the point array
		view = points[index]._view;
		if (!view.skip && previous.skip) {
			points = points.slice(index).concat(points.slice(0, index));
			closePath = spanGaps;
			cloned = true;
			break;
		}
		previous = view;
	}
	// If the line has a close path, add the first point again
	if (closePath) {
		if (!cloned) {
			points = points.slice();
		}
		points.push(points[0]);
	}
	points.closePath = closePath;
	return points;
}

function setStyle(ctx, vm) {
	ctx.lineCap = vm.borderCapStyle;
	// IE 9 and 10 do not support line dash
	if (ctx.setLineDash) {
		ctx.setLineDash(vm.borderDash);
	}
	ctx.lineDashOffset = vm.borderDashOffset;
	ctx.lineJoin = vm.borderJoinStyle;
	ctx.lineWidth = vm.borderWidth;
	ctx.strokeStyle = vm.borderColor;
}

function normalPath(ctx, points, spanGaps) {
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
		} else {
			helpers.canvas.lineTo(ctx, previousVM, currentVM);
		}
		previousVM = currentVM;
	}
}

function fastPath(ctx, points, spanGaps) {
	let move = true;
	let count = 0;
	let avgX = 0;
	let index, vm, truncX, x, y, prevX, minY, maxY, lastY;

	for (index = 0; index < points.length; ++index) {
		vm = points[index]._view;

		if (vm.skip) {
			move = move || !spanGaps;
			continue;
		}
		x = vm.x;
		truncX = x | 0;
		y = vm.y;

		if (move) {
			ctx.moveTo(x, y);
			move = false;
		} else if (truncX === prevX) {
			minY = Math.min(y, minY);
			maxY = Math.max(y, maxY);
			avgX = (count * avgX + x) / ++count;
		} else {
			if (minY !== maxY) {
				ctx.lineTo(avgX, maxY);
				ctx.lineTo(avgX, minY);
				ctx.moveTo(avgX, lastY);
			}
			ctx.lineTo(x, y);
			prevX = truncX;
			count = 0;
			minY = maxY = y;
		}
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

	draw() {
		const me = this;
		const vm = me._view;
		const ctx = me._ctx;
		const spanGaps = vm.spanGaps;
		let closePath = me._loop;
		let points = me._children;

		if (!points.length) {
			return;
		}

		if (me._loop) {
			points = startAtGap(points, spanGaps);
			closePath = points.closePath;
		}

		ctx.save();

		setStyle(ctx, vm);

		ctx.beginPath();

		if (useFastPath(vm)) {
			fastPath(ctx, points, spanGaps);
		} else {
			normalPath(ctx, points, spanGaps);
		}

		if (closePath) {
			ctx.closePath();
		}

		ctx.stroke();
		ctx.restore();
	}
}

Line.prototype._type = 'line';

module.exports = Line;
