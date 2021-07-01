import {isFinite as isFiniteNumber} from './helpers.core';

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

/**
 * Implementation of the nice number algorithm used in determining where axis labels will go
 * @return {number}
 */
export function niceNum(range) {
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
export function _factorize(value) {
  const result = [];
  const sqrt = Math.sqrt(value);
  let i;

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

export function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function almostEquals(x, y, epsilon) {
  return Math.abs(x - y) < epsilon;
}

export function almostWhole(x, epsilon) {
  const rounded = Math.round(x);
  return ((rounded - epsilon) <= x) && ((rounded + epsilon) >= x);
}

/**
 * @private
 */
export function _setMinAndMaxByKey(array, target, property) {
  let i, ilen, value;

  for (i = 0, ilen = array.length; i < ilen; i++) {
    value = array[i][property];
    if (!isNaN(value)) {
      target.min = Math.min(target.min, value);
      target.max = Math.max(target.max, value);
    }
  }
}

export function toRadians(degrees) {
  return degrees * (PI / 180);
}

export function toDegrees(radians) {
  return radians * (180 / PI);
}

/**
 * Returns the number of decimal places
 * i.e. the number of digits after the decimal point, of the value of this Number.
 * @param {number} x - A number.
 * @returns {number} The number of decimal places.
 * @private
 */
export function _decimalPlaces(x) {
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
export function getAngleFromPoint(centrePoint, anglePoint) {
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

export function distanceBetweenPoints(pt1, pt2) {
  return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}

/**
 * Shortest distance between angles, in either direction.
 * @private
 */
export function _angleDiff(a, b) {
  return (a - b + PITAU) % TAU - PI;
}

/**
 * Normalize angle to be between 0 and 2*PI
 * @private
 */
export function _normalizeAngle(a) {
  return (a % TAU + TAU) % TAU;
}

/**
 * @private
 */
export function _angleBetween(angle, start, end, sameAngleIsFullCircle) {
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
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @private
 */
export function _limitValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function _int16Range(value) {
  return _limitValue(value, -32768, 32767);
}
