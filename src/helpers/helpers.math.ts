import type {Point} from '../types/geometric.js';
import {isFinite as isFiniteNumber} from './helpers.core.js';

/**
 * @alias Chart.helpers.math
 * @namespace
 */

export const PI = Math.PI;
export const TAU = 2 * PI;
export const PITAU = TAU + PI;
export const INFINITY = Number.POSITIVE_INFINITY;
export const RAD_PER_DEG = PI / 180;
export const HALF_PI = PI / 2;
export const QUARTER_PI = PI / 4;
export const TWO_THIRDS_PI = PI * 2 / 3;

export const log10 = Math.log10;
export const sign = Math.sign;

export function almostEquals(x: number, y: number, epsilon: number) {
  return Math.abs(x - y) < epsilon;
}

/**
 * Implementation of the nice number algorithm used in determining where axis labels will go
 */
export function niceNum(range: number) {
  const roundedRange = Math.round(range);
  range = almostEquals(range, roundedRange, range / 1000) ? roundedRange : range;
  const niceRange = Math.pow(10, Math.floor(log10(range)));
  const fraction = range / niceRange;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * niceRange;
}

/**
 * Returns an array of factors sorted from 1 to sqrt(value)
 * @private
 */
export function _factorize(value: number) {
  const result: number[] = [];
  const sqrt = Math.sqrt(value);
  let i: number;

  for (i = 1; i < sqrt; i++) {
    if (value % i === 0) {
      result.push(i);
      result.push(value / i);
    }
  }
  if (sqrt === (sqrt | 0)) { // if value is a square number
    result.push(sqrt);
  }

  result.sort((a, b) => a - b).pop();
  return result;
}

export function isNumber(n: unknown): n is number {
  return !isNaN(parseFloat(n as string)) && isFinite(n as number);
}

export function almostWhole(x: number, epsilon: number) {
  const rounded = Math.round(x);
  return ((rounded - epsilon) <= x) && ((rounded + epsilon) >= x);
}

/**
 * @private
 */
export function _setMinAndMaxByKey(
  array: Record<string, number>[],
  target: { min: number, max: number },
  property: string
) {
  let i: number, ilen: number, value: number;

  for (i = 0, ilen = array.length; i < ilen; i++) {
    value = array[i][property];
    if (!isNaN(value)) {
      target.min = Math.min(target.min, value);
      target.max = Math.max(target.max, value);
    }
  }
}

export function toRadians(degrees: number) {
  return degrees * (PI / 180);
}

export function toDegrees(radians: number) {
  return radians * (180 / PI);
}

/**
 * Returns the number of decimal places
 * i.e. the number of digits after the decimal point, of the value of this Number.
 * @param x - A number.
 * @returns The number of decimal places.
 * @private
 */
export function _decimalPlaces(x: number) {
  if (!isFiniteNumber(x)) {
    return;
  }
  let e = 1;
  let p = 0;
  while (Math.round(x * e) / e !== x) {
    e *= 10;
    p++;
  }
  return p;
}

// Gets the angle from vertical upright to the point about a centre.
export function getAngleFromPoint(
  centrePoint: Point,
  anglePoint: Point
) {
  const distanceFromXCenter = anglePoint.x - centrePoint.x;
  const distanceFromYCenter = anglePoint.y - centrePoint.y;
  const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);

  let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);

  if (angle < (-0.5 * PI)) {
    angle += TAU; // make sure the returned angle is in the range of (-PI/2, 3PI/2]
  }

  return {
    angle,
    distance: radialDistanceFromCenter
  };
}

export function distanceBetweenPoints(pt1: Point, pt2: Point) {
  return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}

/**
 * Shortest distance between angles, in either direction.
 * @private
 */
export function _angleDiff(a: number, b: number) {
  return (a - b + PITAU) % TAU - PI;
}

/**
 * Normalize angle to be between 0 and 2*PI
 * @private
 */
export function _normalizeAngle(a: number) {
  return (a % TAU + TAU) % TAU;
}

/**
 * @private
 */
export function _angleBetween(angle: number, start: number, end: number, sameAngleIsFullCircle?: boolean) {
  const a = _normalizeAngle(angle);
  const s = _normalizeAngle(start);
  const e = _normalizeAngle(end);
  const angleToStart = _normalizeAngle(s - a);
  const angleToEnd = _normalizeAngle(e - a);
  const startToAngle = _normalizeAngle(a - s);
  const endToAngle = _normalizeAngle(a - e);
  return a === s || a === e || (sameAngleIsFullCircle && s === e)
    || (angleToStart > angleToEnd && startToAngle < endToAngle);
}

/**
 * Limit `value` between `min` and `max`
 * @param value
 * @param min
 * @param max
 * @private
 */
export function _limitValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * @param {number} value
 * @private
 */
export function _int16Range(value: number) {
  return _limitValue(value, -32768, 32767);
}

/**
 * @param value
 * @param start
 * @param end
 * @param [epsilon]
 * @private
 */
export function _isBetween(value: number, start: number, end: number, epsilon = 1e-6) {
  return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon;
}
