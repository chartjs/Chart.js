'use strict';

import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import {_isPointInArea, _steppedLineTo, _bezierCurveTo} from '../helpers/helpers.canvas';
import {splineCurve, splineCurveMonotone} from '../helpers/helpers.curve';
import {_angleDiff, _angleDiffPD, _normalizeAngle, _pointInLine, _steppedInterpolation, _bezierInterpolation} from '../helpers/helpers.math';

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
			fill: true
		}
	}
});

function setStyle(ctx, vm) {
	ctx.lineCap = vm.borderCapStyle;
	ctx.setLineDash(vm.borderDash);
	ctx.lineDashOffset = vm.borderDashOffset;
	ctx.lineJoin = vm.borderJoinStyle;
	ctx.lineWidth = vm.borderWidth;
	ctx.strokeStyle = vm.borderColor;
}

function lineTo(ctx, previous, target) {
	ctx.lineTo(target.x, target.y);
}

function getLineMethod(options) {
	if (options.steppedLine) {
		return _steppedLineTo;
	}

	if (options.tension) {
		return _bezierCurveTo;
	}

	return lineTo;
}

function getInterpolationMethod(options) {
	if (options.steppedLine) {
		return _steppedInterpolation;
	}

	if (options.tension) {
		return _bezierInterpolation;
	}

	return _pointInLine;
}

function pathSegment(ctx, line, segment, params) {
	const {start, end, loop} = segment;
	const {points, options} = line;
	const lineMethod = getLineMethod(options);
	const count = points.length;
	let {move = true, reverse} = params || {};
	let ilen = end < start ? count + end - start : end - start;
	let i, point, prev;

	for (i = 0; i <= ilen; ++i) {
		point = points[(start + (reverse ? ilen - i : i)) % count];

		if (point.skip) {
			// If there is a skipped point inside a segment, spanGaps must be true
			continue;
		} else if (move) {
			ctx.moveTo(point.x, point.y);
			move = false;
		} else {
			lineMethod(ctx, prev, point, reverse, options.steppedLine);
		}

		prev = point;
	}

	if (loop) {
		point = points[(start + (reverse ? ilen : 0)) % count];
		lineMethod(ctx, prev, point, reverse, options.steppedLine);
	}

	return !!loop;
}

function path(ctx, line, params) {
	const segments = line.segments;
	const ilen = segments.length;
	let loop = line._loop;
	for (let i = 0; i < ilen; ++i) {
		loop &= pathSegment(ctx, line, segments[i], params);
	}
	return !!loop;
}

/**
 * Create path from points, grouping by truncated x-coordinate
 * Points need to be in order by x-coordinate for this to work efficiently
 * @param {CanvasRenderingContext2D} ctx - Context
 * @param {Point[]} points - Points defining the line
 * @param {Line} line
 * @param {Object} params
 */
function fastPath(ctx, points, line, params) {
	const ilen = points.length;
	let {move = true, startIndex = 0, reverse = false} = params;
	let count = 0;
	let avgX = 0;
	let i, prevX, minY, maxY, lastY;

	for (i = 0; i < ilen; ++i) {
		const index = (startIndex + i) % ilen;
		const point = points[reverse ? ilen - index - 1 : index];

		// If point is skipped, we either move to next (not skipped) point
		// or line to it if spanGaps is true. `move` can already be true.
		if (point.skip) {
			move = move || !line.spanGaps;
			continue;
		}

		const {x, y} = point;
		const truncX = x | 0; // truncated x-coordinate

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

function capControlPoint(pt, min, max) {
	return Math.max(Math.min(pt, max), min);
}

function capBezierPoints(points, area) {
	var i, ilen, model;
	for (i = 0, ilen = points.length; i < ilen; ++i) {
		model = points[i];
		if (_isPointInArea(model, area)) {
			if (i > 0 && _isPointInArea(points[i - 1], area)) {
				model.controlPointPreviousX = capControlPoint(model.controlPointPreviousX, area.left, area.right);
				model.controlPointPreviousY = capControlPoint(model.controlPointPreviousY, area.top, area.bottom);
			}
			if (i < points.length - 1 && _isPointInArea(points[i + 1], area)) {
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
		splineCurveMonotone(points);
	} else {
		let prev = loop ? points[points.length - 1] : points[0];
		for (i = 0, ilen = points.length; i < ilen; ++i) {
			point = points[i];
			controlPoints = splineCurve(
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

function useFastPath(options, params) {
	return !options.tension && !options.steppedLine && !options.fill && (!options.borderDash || !options.borderDash.length) && !params.bounds;
}

function angleBetween(a, s, e) {
	return a === s || a === e ||
		(_angleDiffPD(a, s) > _angleDiffPD(a, e) && _angleDiffPD(s, a) < _angleDiffPD(e, a));
}

function propertyFn(property) {
	if (property === 'angle') {
		return {
			between: angleBetween,
			compare: _angleDiff,
			normalize: _normalizeAngle,
		};
	}
	return {
		between: (n, s, e) => n >= s && n <= e,
		compare: (a, b) => a - b,
		normalize: x => x
	};
}

function makeSubSegment(start, end, loop, count) {
	return {
		start: start % count,
		end: end % count,
		loop: loop && (end - start + 1) % count === 0
	};
}

function getSegment(segment, points, bounds) {
	const {property, start: startBound, end: endBound} = bounds;
	const {between, normalize} = propertyFn(property);
	const count = points.length;
	let {start, end, loop} = segment;
	let i, ilen;

	if (loop) {
		start += count;
		end += count;
		for (i = 0, ilen = count; i < ilen; ++i) {
			if (!between(normalize(points[start % count][property]), startBound, endBound)) {
				break;
			}
			start--;
			end--;
		}
		start %= count;
		end %= count;
	}

	if (end < start) {
		end += count;
	}
	return {start, end, loop};
}

/**
 * Returns the sub-segment(s) of a line segment that fall in the given bounds
 * @param {object} segment
 * @param {number} segment.start - start index of the segment, referring the points array
 * @param {number} segment.end - end index of the segment, referring the points array
 * @param {boolean} segment.loop - indicates that the segment is a loop
 * @param {Point[]} points - the points that this segment refers to
 * @param {object} bounds
 * @param {string} bounds.property - the property of a `Point` we are bounding. `x`, `y` or `angle`.
 * @param {number} bounds.start - start value of the property
 * @param {number} bounds.end - end value of the property
 **/
export function _boundSegment(segment, points, bounds) {
	if (!bounds) {
		return [segment];
	}

	const {property, start: startBound, end: endBound} = bounds;
	const count = points.length;
	const {compare, between, normalize} = propertyFn(property);
	const {start, end, loop} = getSegment(segment, points, bounds);
	const result = [];
	let inside = false;
	let subStart = null;
	let i, value, point, prev;

	for (i = start; i <= end; ++i) {
		point = points[i % count];

		if (point.skip) {
			continue;
		}

		value = normalize(point[property]);
		inside = between(value, startBound, endBound);

		if (subStart === null && inside) {
			subStart = i > start && compare(value, startBound) > 0 ? prev : i;
		}

		if (subStart !== null && (!inside || compare(value, endBound) === 0)) {
			result.push(makeSubSegment(subStart, i, loop, count));
			subStart = null;
		}
		prev = i;
	}

	if (subStart !== null) {
		result.push(makeSubSegment(subStart, end, loop, count));
	}

	return result;
}

/**
 * Returns the segments of then line that are inside given bounds
 * @param {Line} line
 * @param {object} bounds
 * @param {string} bounds.property - the property we are bounding with. `x`, `y` or `angle`.
 * @param {number} bounds.start - start value of the `property`
 * @param {number} bounds.end - end value of the `property`
 */
export function _boundSegments(line, bounds) {
	const result = [];

	for (let segment of line.segments) {
		let sub = _boundSegment(segment, line.points, bounds);
		if (sub.length) {
			result.push(...sub);
		}
	}
	return result;
}

function findStart(points, count, loop) {
	let start = 0;

	while (loop && start < count && !points[start].skip) {
		start++;
	}

	while (start < count && points[start].skip) {
		start++;
	}

	return start % count;
}

/**
 * Compute the continuous segments that define the whole line
 * There can be skipped points within a segment, if spanGaps is true.
 * @param {Line} line
 */
function computeSegments(line) {
	const points = line.points;
	const spanGaps = line.options.spanGaps;
	const count = points.length;
	const result = [];
	let loop = spanGaps ? !!line._loop : !!line._fullLoop;

	if (!count) {
		return result;
	}

	let last = null;
	let start = findStart(points, count, loop);
	let max = loop ? count + start : count;
	let cur, prev, end;

	prev = points[start];
	if (!prev.skip) {
		last = start;
	}
	for (end = start + 1; end < max; ++end) {
		cur = points[end % count];
		if (cur.skip) {
			if (!prev.skip && !spanGaps) {
				loop = false;
				result.push({start: start % count, end: (end - 1) % count, loop});
				start = last = null;
			}
		} else {
			last = end;
			if (prev.skip && !spanGaps) {
				start = end;
			}
		}
		prev = cur;
	}
	if (last !== null) {
		result.push({start: start % count, end: last % count, loop});
	}
	return result;
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

	set points(points) {
		this._points = points;
		delete this._segments;
	}

	get points() {
		return this._points;
	}

	get segments() {
		return this._segments || (this._segments = computeSegments(this));
	}

	/**
	 * First non-skipped point on this line
	 * @returns {Point|undefined}
	 */
	first() {
		const segments = this.segments;
		const points = this.points;
		return segments.length && points[segments[0].start];
	}

	/**
	 * Last non-skipped point on this line
	 * @returns {Point|undefined}
	 */
	last() {
		const segments = this.segments;
		const points = this.points;
		const count = segments.length;
		return count && points[segments[count - 1].end];
	}

	/**
	 * Interpolate a point in this line at the same value on `property` as
	 * the reference `point` provided
	 * @param {Point} point - the reference point
	 * @param {string} property - the property to match on
	 * @returns {Point|undefined}
	 */
	interpolate(point, property) {
		const me = this;
		const options = me.options;
		const value = point[property];
		const points = me.points;
		const segments = _boundSegments(me, {property, start: value, end: value});

		if (!segments.length) {
			return;
		}

		const result = [];
		const _interpolate = getInterpolationMethod(options);
		let i, ilen;
		for (i = 0, ilen = segments.length; i < ilen; ++i) {
			const {start, end} = segments[i];
			const p1 = points[start];
			const p2 = points[end];
			if (p1 === p2) {
				result.push(p1);
				continue;
			}
			const t = Math.abs((value - p1[property]) / (p2[property] - p1[property]));
			let interpolated = _interpolate(p1, p2, t, options.steppedLine);
			interpolated[property] = point[property];
			result.push(interpolated);
		}
		return result.lenght === 1 ? result[0] : result;
	}

	/**
	 * Append a segment of this line to current path.
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {object} segment
	 * @param {object} options
	 */
	pathSegment(ctx, segment, options) {
		return pathSegment(ctx, this, segment, options);
	}

	/**
	 * Append line to current path.
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {object} params
	 * @returns {undefined|boolean} - true if line is a full loop (path should be closed)
	 */
	path(ctx, params) {
		const {options, _loop: loop, points} = this;
		params = params || {};

		if (!points || !points.length) {
			return;
		}

		if (!loop && useFastPath(options, params)) {
			fastPath(ctx, points, options, params);
		} else {
			return path(ctx, this, params);
		}
	}

	/**
	 * Draw
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw(ctx) {
		const me = this;

		if (!me.points.length) {
			return;
		}

		ctx.save();

		setStyle(ctx, me.options);

		ctx.beginPath();

		if (me.path(ctx)) {
			ctx.closePath();
		}

		ctx.stroke();
		ctx.restore();
	}
}

Line.prototype._type = 'line';

export default Line;
