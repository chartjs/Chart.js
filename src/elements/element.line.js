import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import {_bezierInterpolation, _pointInLine, _steppedInterpolation} from '../helpers/helpers.interpolation';
import {_computeSegments, _boundSegments} from '../helpers/helpers.segment';
import {_steppedLineTo, _bezierCurveTo} from '../helpers/helpers.canvas';
import {_updateBezierControlPoints} from '../helpers/helpers.curve';

/**
 * @typedef { import("./element.point").default } Point
 */

const defaultColor = defaults.color;

defaults.set('elements', {
	line: {
		backgroundColor: defaultColor,
		borderCapStyle: 'butt',
		borderColor: defaultColor,
		borderDash: [],
		borderDashOffset: 0,
		borderJoinStyle: 'miter',
		borderWidth: 3,
		capBezierPoints: true,
		fill: true,
		tension: 0.4
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
	if (options.stepped) {
		return _steppedLineTo;
	}

	if (options.tension) {
		return _bezierCurveTo;
	}

	return lineTo;
}

/**
 * Create path from points, grouping by truncated x-coordinate
 * Points need to be in order by x-coordinate for this to work efficiently
 * @param {CanvasRenderingContext2D} ctx - Context
 * @param {Line} line
 * @param {object} segment
 * @param {number} segment.start - start index of the segment, referring the points array
 * @param {number} segment.end - end index of the segment, referring the points array
 * @param {boolean} segment.loop - indicates that the segment is a loop
 * @param {object} params
 * @param {object} params.move - move to starting point (vs line to it)
 * @param {object} params.reverse - path the segment from end to start
 */
function pathSegment(ctx, line, segment, params) {
	const {start, end, loop} = segment;
	const {points, options} = line;
	const lineMethod = getLineMethod(options);
	const count = points.length;
	// eslint-disable-next-line prefer-const
	let {move = true, reverse} = params || {};
	const ilen = end < start ? count + end - start : end - start;
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
			lineMethod(ctx, prev, point, reverse, options.stepped);
		}

		prev = point;
	}

	if (loop) {
		point = points[(start + (reverse ? ilen : 0)) % count];
		lineMethod(ctx, prev, point, reverse, options.stepped);
	}

	return !!loop;
}

/**
 * Create path from points, grouping by truncated x-coordinate
 * Points need to be in order by x-coordinate for this to work efficiently
 * @param {CanvasRenderingContext2D} ctx - Context
 * @param {Line} line
 * @param {object} segment
 * @param {number} segment.start - start index of the segment, referring the points array
 * @param {number} segment.end - end index of the segment, referring the points array
 * @param {boolean} segment.loop - indicates that the segment is a loop
 * @param {object} params
 * @param {object} params.move - move to starting point (vs line to it)
 * @param {object} params.reverse - path the segment from end to start
 */
function fastPathSegment(ctx, line, segment, params) {
	const points = line.points;
	const count = points.length;
	const {start, end} = segment;
	const {move = true, reverse} = params || {};
	const ilen = end < start ? count + end - start : end - start;
	let avgX = 0;
	let countX = 0;
	let i, point, prevX, minY, maxY, lastY;

	if (move) {
		point = points[(start + (reverse ? ilen : 0)) % count];
		ctx.moveTo(point.x, point.y);
	}

	for (i = 0; i <= ilen; ++i) {
		point = points[(start + (reverse ? ilen - i : i)) % count];

		if (point.skip) {
			// If there is a skipped point inside a segment, spanGaps must be true
			continue;
		}

		const x = point.x;
		const y = point.y;
		const truncX = x | 0; // truncated x-coordinate

		if (truncX === prevX) {
			// Determine `minY` / `maxY` and `avgX` while we stay within same x-position
			if (y < minY) {
				minY = y;
			} else if (y > maxY) {
				maxY = y;
			}
			// For first point in group, countX is `0`, so average will be `x` / 1.
			avgX = (countX * avgX + x) / ++countX;
		} else {
			if (minY !== maxY) {
				// Draw line to maxY and minY, using the average x-coordinate
				ctx.lineTo(avgX, maxY);
				ctx.lineTo(avgX, minY);
				// Line to y-value of last point in group. So the line continues
				// from correct position. Not using move, to have solid path.
				ctx.lineTo(avgX, lastY);
			}
			// Draw line to next x-position, using the first (or only)
			// y-value in that group
			ctx.lineTo(x, y);

			prevX = truncX;
			countX = 0;
			minY = maxY = y;
		}
		// Keep track of the last y-value in group
		lastY = y;
	}
}

/**
 * @param {Line} line - the line
 * @returns {function}
 * @private
 */
function _getSegmentMethod(line) {
	const opts = line.options;
	const borderDash = opts.borderDash && opts.borderDash.length;
	const useFastPath = !line._loop && !opts.tension && !opts.stepped && !borderDash;
	return useFastPath ? fastPathSegment : pathSegment;
}

/**
 * @private
 */
function _getInterpolationMethod(options) {
	if (options.stepped) {
		return _steppedInterpolation;
	}

	if (options.tension) {
		return _bezierInterpolation;
	}

	return _pointInLine;
}

export default class Line extends Element {

	static _type = 'line';

	constructor(cfg) {
		super();

		this.options = undefined;
		this._loop = undefined;
		this._fullLoop = undefined;
		this._controlPointsUpdated = undefined;
		this._points = undefined;
		this._segments = undefined;

		if (cfg) {
			Object.assign(this, cfg);
		}
	}

	updateControlPoints(chartArea) {
		const me = this;
		if (me._controlPointsUpdated) {
			return;
		}
		const options = me.options;
		if (options.tension && !options.stepped) {
			const loop = options.spanGaps ? me._loop : me._fullLoop;
			_updateBezierControlPoints(me._points, options, chartArea, loop);
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
		return this._segments || (this._segments = _computeSegments(this));
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
		const _interpolate = _getInterpolationMethod(options);
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
			const interpolated = _interpolate(p1, p2, t, options.stepped);
			interpolated[property] = point[property];
			result.push(interpolated);
		}
		return result.length === 1 ? result[0] : result;
	}

	/**
	 * Append a segment of this line to current path.
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {object} segment
	 * @param {number} segment.start - start index of the segment, referring the points array
 	 * @param {number} segment.end - end index of the segment, referring the points array
 	 * @param {boolean} segment.loop - indicates that the segment is a loop
	 * @param {object} params
	 * @param {object} params.move - move to starting point (vs line to it)
	 * @param {object} params.reverse - path the segment from end to start
	 * @returns {undefined|boolean} - true if the segment is a full loop (path should be closed)
	 */
	pathSegment(ctx, segment, params) {
		const segmentMethod = _getSegmentMethod(this);
		return segmentMethod(ctx, this, segment, params);
	}

	/**
	 * Append all segments of this line to current path.
	 * @param {CanvasRenderingContext2D} ctx
	 * @returns {undefined|boolean} - true if line is a full loop (path should be closed)
	 */
	path(ctx) {
		const me = this;
		const segments = me.segments;
		const ilen = segments.length;
		const segmentMethod = _getSegmentMethod(me);
		let loop = me._loop;
		for (let i = 0; i < ilen; ++i) {
			loop &= segmentMethod(ctx, me, segments[i]);
		}
		return !!loop;
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
