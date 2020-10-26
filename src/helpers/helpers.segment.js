import {_angleBetween, _angleDiff, _normalizeAngle} from './helpers.math';

/**
 * @typedef { import("../elements/element.line").default } LineElement
 * @typedef { import("../elements/element.point").default } PointElement
 */

function propertyFn(property) {
	if (property === 'angle') {
		return {
			between: _angleBetween,
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
	// eslint-disable-next-line prefer-const
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
 * @param {PointElement[]} points - the points that this segment refers to
 * @param {object} [bounds]
 * @param {string} bounds.property - the property of a `PointElement` we are bounding. `x`, `y` or `angle`.
 * @param {number} bounds.start - start value of the property
 * @param {number} bounds.end - end value of the property
 * @private
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
	let value, point, prevValue;

	const startIsBefore = () => between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0;
	const endIsBefore = () => compare(endBound, value) === 0 || between(endBound, prevValue, value);
	const shouldStart = () => inside || startIsBefore();
	const shouldStop = () => !inside || endIsBefore();

	for (let i = start, prev = start; i <= end; ++i) {
		point = points[i % count];

		if (point.skip) {
			continue;
		}

		value = normalize(point[property]);
		inside = between(value, startBound, endBound);

		if (subStart === null && shouldStart()) {
			subStart = compare(value, startBound) === 0 ? i : prev;
		}

		if (subStart !== null && shouldStop()) {
			result.push(makeSubSegment(subStart, i, loop, count));
			subStart = null;
		}
		prev = i;
		prevValue = value;
	}

	if (subStart !== null) {
		result.push(makeSubSegment(subStart, end, loop, count));
	}

	return result;
}


/**
 * Returns the segments of the line that are inside given bounds
 * @param {LineElement} line
 * @param {object} [bounds]
 * @param {string} bounds.property - the property we are bounding with. `x`, `y` or `angle`.
 * @param {number} bounds.start - start value of the `property`
 * @param {number} bounds.end - end value of the `property`
 * @private
 */
export function _boundSegments(line, bounds) {
	const result = [];
	const segments = line.segments;

	for (let i = 0; i < segments.length; i++) {
		const sub = _boundSegment(segments[i], line.points, bounds);
		if (sub.length) {
			result.push(...sub);
		}
	}
	return result;
}

/**
 * Find start and end index of a line.
 */
function findStartAndEnd(points, count, loop, spanGaps) {
	let start = 0;
	let end = count - 1;

	if (loop && !spanGaps) {
		// loop and not spaning gaps, first find a gap to start from
		while (start < count && !points[start].skip) {
			start++;
		}
	}

	// find first non skipped point (after the first gap possibly)
	while (start < count && points[start].skip) {
		start++;
	}

	// if we looped to count, start needs to be 0
	start %= count;

	if (loop) {
		// loop will go past count, if start > 0
		end += start;
	}

	while (end > start && points[end % count].skip) {
		end--;
	}

	// end could be more than count, normalize
	end %= count;

	return {start, end};
}

/**
 * Compute solid segments from Points, when spanGaps === false
 * @param {PointElement[]} points - the points
 * @param {number} start - start index
 * @param {number} max - max index (can go past count on a loop)
 * @param {boolean} loop - boolean indicating that this would be a loop if no gaps are found
 */
function solidSegments(points, start, max, loop) {
	const count = points.length;
	const result = [];
	let last = start;
	let prev = points[start];
	let end;

	for (end = start + 1; end <= max; ++end) {
		const cur = points[end % count];
		if (cur.skip || cur.stop) {
			if (!prev.skip) {
				loop = false;
				result.push({start: start % count, end: (end - 1) % count, loop});
				// @ts-ignore
				start = last = cur.stop ? end : null;
			}
		} else {
			last = end;
			if (prev.skip) {
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

/**
 * Compute the continuous segments that define the whole line
 * There can be skipped points within a segment, if spanGaps is true.
 * @param {LineElement} line
 * @private
 */
export function _computeSegments(line) {
	const points = line.points;
	const spanGaps = line.options.spanGaps;
	const count = points.length;

	if (!count) {
		return [];
	}

	const loop = !!line._loop;
	const {start, end} = findStartAndEnd(points, count, loop, spanGaps);

	if (spanGaps === true) {
		return [{start, end, loop}];
	}

	const max = end < start ? end + count : end;
	const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
	return solidSegments(points, start, max, completeLoop);
}
