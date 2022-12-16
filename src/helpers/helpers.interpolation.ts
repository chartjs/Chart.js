import type {Point} from '../types/geometric.js';
import type {SplinePoint} from './helpers.curve.js';

/**
 * @private
 */
export function _pointInLine(p1: Point, p2: Point, t: number, mode?) { // eslint-disable-line @typescript-eslint/no-unused-vars
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  };
}

/**
 * @private
 */
export function _steppedInterpolation(
  p1: Point,
  p2: Point,
  t: number, mode: 'middle' | 'after' | unknown
) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: mode === 'middle' ? t < 0.5 ? p1.y : p2.y
      : mode === 'after' ? t < 1 ? p1.y : p2.y
        : t > 0 ? p2.y : p1.y
  };
}

/**
 * @private
 */
export function _bezierInterpolation(p1: SplinePoint, p2: SplinePoint, t: number, mode?) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const cp1 = {x: p1.cp2x, y: p1.cp2y};
  const cp2 = {x: p2.cp1x, y: p2.cp1y};
  const a = _pointInLine(p1, cp1, t);
  const b = _pointInLine(cp1, cp2, t);
  const c = _pointInLine(cp2, p2, t);
  const d = _pointInLine(a, b, t);
  const e = _pointInLine(b, c, t);
  return _pointInLine(d, e, t);
}
