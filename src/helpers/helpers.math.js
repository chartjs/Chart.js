'use strict';

import {isFinite as isFiniteNumber} from './helpers.core';

const PI = Math.PI;
const TAU = 2 * PI;
const PITAU = TAU + PI;

/**
 * @alias Chart.helpers.math
 * @namespace
 */
/**
 * Returns an array of factors sorted from 1 to sqrt(value)
 * @private
 */
export function _factorize(value) {
	var result = [];
	var sqrt = Math.sqrt(value);
	var i;

	for (i = 1; i < sqrt; i++) {
		if (value % i === 0) {
			result.push(i);
			result.push(value / i);
		}
	}
	if (sqrt === (sqrt | 0)) { // if value is a square number
		result.push(sqrt);
	}

	result.sort(function(a, b) {
		return a - b;
	}).pop();
	return result;
}

export const log10 = Math.log10 || function(x) {
	var exponent = Math.log(x) * Math.LOG10E; // Math.LOG10E = 1 / Math.LN10.
	// Check for whole powers of 10,
	// which due to floating point rounding error should be corrected.
	var powerOf10 = Math.round(exponent);
	var isPowerOf10 = x === Math.pow(10, powerOf10);

	return isPowerOf10 ? powerOf10 : exponent;
};

export function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export function almostEquals(x, y, epsilon) {
	return Math.abs(x - y) < epsilon;
}

export function almostWhole(x, epsilon) {
	var rounded = Math.round(x);
	return ((rounded - epsilon) <= x) && ((rounded + epsilon) >= x);
}

export function _setMinAndMaxByKey(array, target, property) {
	var i, ilen, value;

	for (i = 0, ilen = array.length; i < ilen; i++) {
		value = array[i][property];
		if (!isNaN(value)) {
			target.min = Math.min(target.min, value);
			target.max = Math.max(target.max, value);
		}
	}
}

export const sign = Math.sign ?
	function(x) {
		return Math.sign(x);
	} :
	function(x) {
		x = +x; // convert to a number
		if (x === 0 || isNaN(x)) {
			return x;
		}
		return x > 0 ? 1 : -1;
	};

export function toRadians(degrees) {
	return degrees * (Math.PI / 180);
}

export function toDegrees(radians) {
	return radians * (180 / Math.PI);
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
	var e = 1;
	var p = 0;
	while (Math.round(x * e) / e !== x) {
		e *= 10;
		p++;
	}
	return p;
}

// Gets the angle from vertical upright to the point about a centre.
export function getAngleFromPoint(centrePoint, anglePoint) {
	var distanceFromXCenter = anglePoint.x - centrePoint.x;
	var distanceFromYCenter = anglePoint.y - centrePoint.y;
	var radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);

	var angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);

	if (angle < (-0.5 * Math.PI)) {
		angle += 2.0 * Math.PI; // make sure the returned angle is in the range of (-PI/2, 3PI/2]
	}

	return {
		angle: angle,
		distance: radialDistanceFromCenter
	};
}

export function distanceBetweenPoints(pt1, pt2) {
	return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}

/**
 * @private
 */
export function _pointInLine(p1, p2, t) {
	return {
		x: p1.x + t * (p2.x - p1.x),
		y: p1.y + t * (p2.y - p1.y)
	};
}

/**
 * @private
 */
export function _steppedInterpolation(p1, p2, t, mode) {
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
export function _bezierInterpolation(p1, p2, t) {
	const cp1 = {x: p1.controlPointNextX, y: p1.controlPointNextY};
	const cp2 = {x: p2.controlPointPreviousX, y: p2.controlPointPreviousY};
	const a = _pointInLine(p1, cp1, t);
	const b = _pointInLine(cp1, cp2, t);
	const c = _pointInLine(cp2, p2, t);
	const d = _pointInLine(a, b, t);
	const e = _pointInLine(b, c, t);
	return _pointInLine(d, e, t);
}

/**
 * Shortest distance between agnles, in either direction.
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
 * Angle difference in positive direction.
 * @private
 */
export function _angleDiffPD(a, b) {
	return _normalizeAngle(_normalizeAngle(b) - _normalizeAngle(a));
}
