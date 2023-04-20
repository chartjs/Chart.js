/* eslint-disable @typescript-eslint/no-use-before-define */
import {_angleBetween, _angleDiff, _isBetween, _normalizeAngle} from './helpers.math.js';
import {createContext} from './helpers.options.js';
import type {LineElement, LineOptions, PointElement, Segment, SegmentStyle, SegmentBounds} from '../types/index.js';
import type {Point} from '../types/geometric.js';
import type {AnyObject} from 'src/types/basic.js';

function propertyFn(property: string) {
  if (property === 'angle') {
    return {
      between: _angleBetween,
      compare: _angleDiff,
      normalize: _normalizeAngle,
    };
  }
  return {
    between: _isBetween,
    compare: (a: number, b: number) => a - b,
    normalize: (x) => x
  };
}

function normalizeSegment({start, end, count, loop, style}) {
  return {
    start: start % count,
    end: end % count,
    loop: loop && (end - start + 1) % count === 0,
    style
  };
}

function getSegment(segment: Segment, points: Point[], bounds: SegmentBounds) {
  const {property, start: startBound, end: endBound} = bounds;
  const {between, normalize} = propertyFn(property);
  const count = points.length;
  // eslint-disable-next-line prefer-const
  let {start, end, loop} = segment;
  let i: number, ilen: number;

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
  return {start, end, loop, style: segment.style};
}

/**
 * Returns the sub-segment(s) of a line segment that fall in the given bounds
 * @param segment
 * @param segment.start - start index of the segment, referring the points array
 * @param segment.end - end index of the segment, referring the points array
 * @param segment.loop - indicates that the segment is a loop
 * @param segment.style - segment style
 * @param points - the points that this segment refers to
 * @param bounds
 * @param bounds.property - the property of a `PointElement` we are bounding. `x`, `y` or `angle`.
 * @param bounds.start - start value of the property
 * @param bounds.end - end value of the property
 * @private
 **/
// eslint-disable-next-line max-statements, complexity
export function _boundSegment(segment: Segment, points: PointElement[], bounds: SegmentBounds) {
  if (!bounds) {
    return [segment];
  }

  const {property, start: startBound, end: endBound} = bounds;
  const count = points.length;
  const {compare, between, normalize} = propertyFn(property);
  const {start, end, loop, style} = getSegment(segment, points, bounds);

  const result = [];
  let inside = false;
  let subStart = null;
  let value: number, point: PointElement, prevValue: number;

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

    if (value === prevValue) {
      continue;
    }

    inside = between(value, startBound, endBound);

    if (subStart === null && shouldStart()) {
      subStart = compare(value, startBound) === 0 ? i : prev;
    }

    if (subStart !== null && shouldStop()) {
      result.push(normalizeSegment({start: subStart, end: i, loop, count, style}));
      subStart = null;
    }
    prev = i;
    prevValue = value;
  }

  if (subStart !== null) {
    result.push(normalizeSegment({start: subStart, end, loop, count, style}));
  }

  return result;
}


/**
 * Returns the segments of the line that are inside given bounds
 * @param line
 * @param bounds
 * @param bounds.property - the property we are bounding with. `x`, `y` or `angle`.
 * @param bounds.start - start value of the `property`
 * @param bounds.end - end value of the `property`
 * @private
 */
export function _boundSegments(line: LineElement, bounds: SegmentBounds) {
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
function findStartAndEnd(points: PointElement[], count: number, loop: boolean, spanGaps: number | boolean) {
  let start = 0;
  let end = count - 1;

  if (loop && !spanGaps) {
    // loop and not spanning gaps, first find a gap to start from
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
 * @param points - the points
 * @param start - start index
 * @param max - max index (can go past count on a loop)
 * @param loop - boolean indicating that this would be a loop if no gaps are found
 */
function solidSegments(points: PointElement[], start: number, max: number, loop: boolean) {
  const count = points.length;
  const result = [];
  let last = start;
  let prev = points[start];
  let end: number;

  for (end = start + 1; end <= max; ++end) {
    const cur = points[end % count];
    if (cur.skip || cur.stop) {
      if (!prev.skip) {
        loop = false;
        result.push({start: start % count, end: (end - 1) % count, loop});
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
 * @param line
 * @param segmentOptions
 * @private
 */
export function _computeSegments(line: LineElement, segmentOptions: AnyObject) {
  const points = line.points;
  const spanGaps = line.options.spanGaps;
  const count = points.length;

  if (!count) {
    return [];
  }

  const loop = !!line._loop;
  const {start, end} = findStartAndEnd(points, count, loop, spanGaps);

  if (spanGaps === true) {
    return splitByStyles(line, [{start, end, loop}], points, segmentOptions);
  }

  const max = end < start ? end + count : end;
  const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
  return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
}

/**
 * @param segments
 * @param points
 * @param segmentOptions
 */
function splitByStyles(line: LineElement, segments: Segment[], points: PointElement[], segmentOptions: AnyObject) {
  if (!segmentOptions || !segmentOptions.setContext || !points) {
    return segments;
  }
  return doSplitByStyles(line, segments, points, segmentOptions);
}

/**
 * @param line
 * @param segments
 * @param points
 * @param segmentOptions
 */
function doSplitByStyles(line: LineElement, segments: Segment[], points: PointElement[], segmentOptions: AnyObject) {
  const chartContext = line._chart.getContext();
  const baseStyle = readStyle(line.options);
  const {_datasetIndex: datasetIndex, options: {spanGaps}} = line;
  const count = points.length;
  const result = [];
  let prevStyle = baseStyle;
  let start = segments[0].start;
  let i = start;

  function addStyle(s: number, e: number, l: boolean, st: SegmentStyle) {
    const dir = spanGaps ? -1 : 1;
    if (s === e) {
      return;
    }
    // Style can not start/end on a skipped point, adjust indices accordingly
    s += count;
    while (points[s % count].skip) {
      s -= dir;
    }
    while (points[e % count].skip) {
      e += dir;
    }
    if (s % count !== e % count) {
      result.push({start: s % count, end: e % count, loop: l, style: st});
      prevStyle = st;
      start = e % count;
    }
  }

  for (const segment of segments) {
    start = spanGaps ? start : segment.start;
    let prev = points[start % count];
    let style: SegmentStyle;
    for (i = start + 1; i <= segment.end; i++) {
      const pt = points[i % count];
      style = readStyle(segmentOptions.setContext(createContext(chartContext, {
        type: 'segment',
        p0: prev,
        p1: pt,
        p0DataIndex: (i - 1) % count,
        p1DataIndex: i % count,
        datasetIndex
      })));
      if (styleChanged(style, prevStyle)) {
        addStyle(start, i - 1, segment.loop, prevStyle);
      }
      prev = pt;
      prevStyle = style;
    }
    if (start < i - 1) {
      addStyle(start, i - 1, segment.loop, prevStyle);
    }
  }

  return result;
}

function readStyle(options: LineOptions): SegmentStyle {
  return {
    backgroundColor: options.backgroundColor,
    borderCapStyle: options.borderCapStyle,
    borderDash: options.borderDash,
    borderDashOffset: options.borderDashOffset,
    borderJoinStyle: options.borderJoinStyle,
    borderWidth: options.borderWidth,
    borderColor: options.borderColor
  };
}

function styleChanged(style: SegmentStyle, prevStyle: SegmentStyle) {
  return prevStyle && JSON.stringify(style) !== JSON.stringify(prevStyle);
}
