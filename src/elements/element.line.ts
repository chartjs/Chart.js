import Element from '../core/core.element.js';
import {_bezierInterpolation, _pointInLine, _steppedInterpolation} from '../helpers/helpers.interpolation.js';
import {_computeSegments, _boundSegments} from '../helpers/helpers.segment.js';
import {_steppedLineTo, _bezierCurveTo} from '../helpers/helpers.canvas.js';
import {_updateBezierControlPoints} from '../helpers/helpers.curve.js';
import {valueOrDefault} from '../helpers/index.js';
import type Chart from '../core/core.controller.js';
import type PointElementClass from './element.point.js';
import type {Segment} from '../helpers/helpers.segment.js';
import type {AnyObject} from '../types/basic.js';
import type {ChartArea, LineOptions, LineProps} from '../types/index.js';

export type PointElement = PointElementClass;

export type PathParams = {
  /** move to starting point (vs line to it) */
  move?: boolean,
  /** path the segment from end to start */
  reverse?: boolean,
  /** limit segment to points starting from `start` index */
  start?: number,
  /** limit segment to points ending at `start` + `count` index */
  end?: number
};

type PathSegment = {
  /** start index of the segment, referring the points array */
  start: number,
  /** end index of the segment, referring the points array */
  end: number,
  /** indicates that the segment is a loop */
  loop: boolean
};

function setStyle(ctx: CanvasRenderingContext2D, options: AnyObject, style: AnyObject = options) {
  ctx.lineCap = valueOrDefault(style.borderCapStyle, options.borderCapStyle);
  ctx.setLineDash(valueOrDefault(style.borderDash, options.borderDash));
  ctx.lineDashOffset = valueOrDefault(style.borderDashOffset, options.borderDashOffset);
  ctx.lineJoin = valueOrDefault(style.borderJoinStyle, options.borderJoinStyle);
  ctx.lineWidth = valueOrDefault(style.borderWidth, options.borderWidth);
  ctx.strokeStyle = valueOrDefault(style.borderColor, options.borderColor);
}

function lineTo(ctx: CanvasRenderingContext2D | Path2D, _previous: PointElement, target: PointElement) {
  ctx.lineTo(target.x, target.y);
}

// The canvas helpers take a CanvasRenderingContext2D, but the line also draws into a Path2D
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLineMethod(options: AnyObject): any {
  if (options.stepped) {
    return _steppedLineTo;
  }

  if (options.tension || options.cubicInterpolationMode === 'monotone') {
    return _bezierCurveTo;
  }

  return lineTo;
}

function pathVars(points: PointElement[], segment: PathSegment, params: PathParams = {}) {
  const count = points.length;
  const {start: paramsStart = 0, end: paramsEnd = count - 1} = params;
  const {start: segmentStart, end: segmentEnd} = segment;
  const start = Math.max(paramsStart, segmentStart);
  const end = Math.min(paramsEnd, segmentEnd);
  const outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd;

  return {
    count,
    start,
    loop: segment.loop,
    ilen: end < start && !outside ? count + end - start : end - start
  };
}

/**
 * Create path from points, grouping by truncated x-coordinate
 * Points need to be in order by x-coordinate for this to work efficiently
 * @param ctx - Context
 * @param line
 * @param segment
 * @param params
 */
function pathSegment(ctx: CanvasRenderingContext2D | Path2D, line: LineElement, segment: PathSegment, params?: PathParams): boolean {
  const {points, options} = line;
  const {count, start, loop, ilen} = pathVars(points, segment, params);
  const lineMethod = getLineMethod(options);
  // eslint-disable-next-line prefer-const
  let {move = true, reverse} = params || {};
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
 * @param ctx - Context
 * @param line
 * @param segment
 * @param params
 */
function fastPathSegment(ctx: CanvasRenderingContext2D | Path2D, line: LineElement, segment: PathSegment, params?: PathParams): undefined {
  const points = line.points;
  const {count, start, ilen} = pathVars(points, segment, params);
  const {move = true, reverse} = params || {};
  // The x/y accumulators are plain locals, not captured by closures: a double
  // in a closure's context is boxed, which would allocate on every point.
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
      drawGroup(ctx, avgX, minY, maxY, lastY);
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
  drawGroup(ctx, avgX, minY, maxY, lastY);
  return undefined;
}

/**
 * Draws the vertical extent of a group of points that share a truncated x-coordinate
 */
function drawGroup(ctx: CanvasRenderingContext2D | Path2D, avgX: number, minY: number, maxY: number, lastY: number) {
  if (minY !== maxY) {
    // Draw line to maxY and minY, using the average x-coordinate
    ctx.lineTo(avgX, maxY);
    ctx.lineTo(avgX, minY);
    // Line to y-value of last point in group. So the line continues
    // from correct position. Not using move, to have solid path.
    ctx.lineTo(avgX, lastY);
  }
}

/**
 * @param line - the line
 * @private
 */
function _getSegmentMethod(line: LineElement) {
  const opts = line.options;
  const borderDash = opts.borderDash && opts.borderDash.length;
  const useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== 'monotone' && !opts.stepped && !borderDash;
  return useFastPath ? fastPathSegment : pathSegment;
}

/**
 * @private
 */
function _getInterpolationMethod(options: AnyObject) {
  if (options.stepped) {
    return _steppedInterpolation;
  }

  if (options.tension || options.cubicInterpolationMode === 'monotone') {
    return _bezierInterpolation;
  }

  return _pointInLine;
}

function strokePathWithCache(ctx: CanvasRenderingContext2D, line: LineElement, start?: number, count?: number) {
  let path = line._path;
  if (!path) {
    path = line._path = new Path2D();
    if (line.path(path, start, count)) {
      path.closePath();
    }
  }
  setStyle(ctx, line.options);
  ctx.stroke(path);
}

function strokePathDirect(ctx: CanvasRenderingContext2D, line: LineElement, start?: number, count?: number) {
  const {segments, options} = line;
  const segmentMethod = _getSegmentMethod(line);

  for (const segment of segments) {
    setStyle(ctx, options, segment.style);
    ctx.beginPath();
    if (segmentMethod(ctx, line, segment, {start, end: start + count - 1})) {
      ctx.closePath();
    }
    ctx.stroke();
  }
}

const usePath2D = typeof Path2D === 'function';

function draw(ctx: CanvasRenderingContext2D, line: LineElement, start?: number, count?: number) {
  if (usePath2D && !line.options.segment) {
    strokePathWithCache(ctx, line, start, count);
  } else {
    strokePathDirect(ctx, line, start, count);
  }
}

export default class LineElement<
  T extends LineProps = LineProps,
  O extends LineOptions = LineOptions
> extends Element<T, O> {

  static id = 'line';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static override defaults: any = {
    borderCapStyle: 'butt',
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: 'miter',
    borderWidth: 3,
    capBezierPoints: true,
    cubicInterpolationMode: 'default',
    fill: false,
    spanGaps: false,
    stepped: false,
    tension: 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static override defaultRoutes: any = {
    backgroundColor: 'backgroundColor',
    borderColor: 'borderColor'
  };


  static descriptors = {
    _scriptable: true,
    _indexable: (name: string) => name !== 'borderDash' && name !== 'fill',
  };

  /** @internal */
  declare animated: boolean;
  declare options: O;
  /** @internal */
  declare _chart: Chart;
  /** @internal */
  declare _loop: boolean;
  /** @internal */
  declare _fullLoop: boolean;
  /** @internal */
  declare _path: Path2D;
  /** @internal */
  declare _points: PointElement[];
  /** @internal */
  declare _segments: Segment[];
  /** @internal */
  declare _decimated: boolean;
  /** @internal */
  declare _pointsUpdated: boolean;
  /** @internal */
  declare _datasetIndex: number;

  constructor(cfg?: AnyObject) {
    super();

    this.animated = true;
    this.options = undefined;
    this._chart = undefined;
    this._loop = undefined;
    this._fullLoop = undefined;
    this._path = undefined;
    this._points = undefined;
    this._segments = undefined;
    this._decimated = false;
    this._pointsUpdated = false;
    this._datasetIndex = undefined;

    if (cfg) {
      Object.assign(this, cfg);
    }
  }

  updateControlPoints(chartArea: ChartArea, indexAxis?: 'x' | 'y'): void {
    const options = this.options;
    if ((options.tension || options.cubicInterpolationMode === 'monotone') && !options.stepped && !this._pointsUpdated) {
      const loop = options.spanGaps ? this._loop : this._fullLoop;
      _updateBezierControlPoints(this._points, options, chartArea, loop, indexAxis);
      this._pointsUpdated = true;
    }
  }

  set points(points: PointElement[]) {
    this._points = points;
    delete this._segments;
    delete this._path;
    this._pointsUpdated = false;
  }

  get points(): PointElement[] {
    return this._points;
  }

  get segments(): Segment[] {
    return this._segments || (this._segments = _computeSegments(this, this.options.segment));
  }

  /**
	 * First non-skipped point on this line
	 */
  first(): PointElement | undefined {
    const segments = this.segments;
    const points = this.points;
    return segments.length && points[segments[0].start];
  }

  /**
	 * Last non-skipped point on this line
	 */
  last(): PointElement | undefined {
    const segments = this.segments;
    const points = this.points;
    const count = segments.length;
    return count && points[segments[count - 1].end];
  }

  /**
	 * Interpolate a point in this line at the same value on `property` as
	 * the reference `point` provided
	 * @param point - the reference point
	 * @param property - the property to match on
	 */
  interpolate(point: PointElement, property: string): PointElement | undefined {
    const options = this.options;
    const value = point[property];
    const points = this.points;
    const segments = _boundSegments(this, {property, start: value, end: value});

    if (!segments.length) {
      return undefined;
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
	 * @param ctx
	 * @param segment
	 * @param segment.start - start index of the segment, referring the points array
	 * @param segment.end - end index of the segment, referring the points array
	 * @param segment.loop - indicates that the segment is a loop
	 * @param [params]
	 * @returns true if the segment is a full loop (path should be closed)
	 */
  pathSegment(
    ctx: CanvasRenderingContext2D,
    segment: {start: number, end: number, loop: boolean},
    params?: PathParams
  ): undefined | boolean {
    const segmentMethod = _getSegmentMethod(this);
    return segmentMethod(ctx, this, segment, params);
  }

  /**
	 * Append all segments of this line to current path.
	 * @param ctx
	 * @param [start]
	 * @param [count]
	 * @returns true if line is a full loop (path should be closed)
	 */
  path(ctx: CanvasRenderingContext2D | Path2D, start?: number, count?: number): undefined | boolean {
    const segments = this.segments;
    const segmentMethod = _getSegmentMethod(this);
    let loop = this._loop;

    start = start || 0;
    count = count || (this.points.length - start);

    for (const segment of segments) {
      // @ts-expect-error `&=` on booleans is intended: it yields 0 or 1, and `!!loop` turns that back into a boolean
      loop &= segmentMethod(ctx, this, segment, {start, end: start + count - 1});
    }
    return !!loop;
  }

  /**
	 * Draw
	 * @param ctx
	 * @param chartArea
	 * @param [start]
	 * @param [count]
	 */
  draw(ctx: CanvasRenderingContext2D, _chartArea: object, start?: number, count?: number): void {
    const options: Partial<O> = this.options || {};
    const points = this.points || [];

    if (points.length && options.borderWidth) {
      ctx.save();

      draw(ctx, this, start, count);

      ctx.restore();
    }

    if (this.animated) {
      // When line is animated, the control points and path are not cached.
      this._pointsUpdated = false;
      this._path = undefined;
    }
  }
}
