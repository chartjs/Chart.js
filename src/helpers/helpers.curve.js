import {almostEquals, sign} from './helpers.math';
import {_isPointInArea} from './helpers.canvas';

const EPSILON = Number.EPSILON || 1e-14;

export function splineCurve(firstPoint, middlePoint, afterPoint, t) {
	// Props to Rob Spencer at scaled innovation for his post on splining between points
	// http://scaledinnovation.com/analytics/splines/aboutSplines.html

	// This function must also respect "skipped" points

	const previous = firstPoint.skip ? middlePoint : firstPoint;
	const current = middlePoint;
	const next = afterPoint.skip ? middlePoint : afterPoint;

	const d01 = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
	const d12 = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));

	let s01 = d01 / (d01 + d12);
	let s12 = d12 / (d01 + d12);

	// If all points are the same, s01 & s02 will be inf
	s01 = isNaN(s01) ? 0 : s01;
	s12 = isNaN(s12) ? 0 : s12;

	const fa = t * s01; // scaling factor for triangle Ta
	const fb = t * s12;

	return {
		previous: {
			x: current.x - fa * (next.x - previous.x),
			y: current.y - fa * (next.y - previous.y)
		},
		next: {
			x: current.x + fb * (next.x - previous.x),
			y: current.y + fb * (next.y - previous.y)
		}
	};
}

export function splineCurveMonotone(points) {
	// This function calculates Bézier control points in a similar way than |splineCurve|,
	// but preserves monotonicity of the provided data and ensures no local extremums are added
	// between the dataset discrete points due to the interpolation.
	// See : https://en.wikipedia.org/wiki/Monotone_cubic_interpolation

	const pointsWithTangents = (points || []).map((point) => ({
		model: point,
		deltaK: 0,
		mK: 0
	}));

	// Calculate slopes (deltaK) and initialize tangents (mK)
	const pointsLen = pointsWithTangents.length;
	let i, pointBefore, pointCurrent, pointAfter;
	for (i = 0; i < pointsLen; ++i) {
		pointCurrent = pointsWithTangents[i];
		if (pointCurrent.model.skip) {
			continue;
		}

		pointBefore = i > 0 ? pointsWithTangents[i - 1] : null;
		pointAfter = i < pointsLen - 1 ? pointsWithTangents[i + 1] : null;
		if (pointAfter && !pointAfter.model.skip) {
			const slopeDeltaX = (pointAfter.model.x - pointCurrent.model.x);

			// In the case of two points that appear at the same x pixel, slopeDeltaX is 0
			pointCurrent.deltaK = slopeDeltaX !== 0 ? (pointAfter.model.y - pointCurrent.model.y) / slopeDeltaX : 0;
		}

		if (!pointBefore || pointBefore.model.skip) {
			pointCurrent.mK = pointCurrent.deltaK;
		} else if (!pointAfter || pointAfter.model.skip) {
			pointCurrent.mK = pointBefore.deltaK;
		} else if (sign(pointBefore.deltaK) !== sign(pointCurrent.deltaK)) {
			pointCurrent.mK = 0;
		} else {
			pointCurrent.mK = (pointBefore.deltaK + pointCurrent.deltaK) / 2;
		}
	}

	// Adjust tangents to ensure monotonic properties
	let alphaK, betaK, tauK, squaredMagnitude;
	for (i = 0; i < pointsLen - 1; ++i) {
		pointCurrent = pointsWithTangents[i];
		pointAfter = pointsWithTangents[i + 1];
		if (pointCurrent.model.skip || pointAfter.model.skip) {
			continue;
		}

		if (almostEquals(pointCurrent.deltaK, 0, EPSILON)) {
			pointCurrent.mK = pointAfter.mK = 0;
			continue;
		}

		alphaK = pointCurrent.mK / pointCurrent.deltaK;
		betaK = pointAfter.mK / pointCurrent.deltaK;
		squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
		if (squaredMagnitude <= 9) {
			continue;
		}

		tauK = 3 / Math.sqrt(squaredMagnitude);
		pointCurrent.mK = alphaK * tauK * pointCurrent.deltaK;
		pointAfter.mK = betaK * tauK * pointCurrent.deltaK;
	}

	// Compute control points
	let deltaX;
	for (i = 0; i < pointsLen; ++i) {
		pointCurrent = pointsWithTangents[i];
		if (pointCurrent.model.skip) {
			continue;
		}

		pointBefore = i > 0 ? pointsWithTangents[i - 1] : null;
		pointAfter = i < pointsLen - 1 ? pointsWithTangents[i + 1] : null;
		if (pointBefore && !pointBefore.model.skip) {
			deltaX = (pointCurrent.model.x - pointBefore.model.x) / 3;
			pointCurrent.model.controlPointPreviousX = pointCurrent.model.x - deltaX;
			pointCurrent.model.controlPointPreviousY = pointCurrent.model.y - deltaX * pointCurrent.mK;
		}
		if (pointAfter && !pointAfter.model.skip) {
			deltaX = (pointAfter.model.x - pointCurrent.model.x) / 3;
			pointCurrent.model.controlPointNextX = pointCurrent.model.x + deltaX;
			pointCurrent.model.controlPointNextY = pointCurrent.model.y + deltaX * pointCurrent.mK;
		}
	}
}

function capControlPoint(pt, min, max) {
	return Math.max(Math.min(pt, max), min);
}

function capBezierPoints(points, area) {
	let i, ilen, point;
	for (i = 0, ilen = points.length; i < ilen; ++i) {
		point = points[i];
		if (!_isPointInArea(point, area)) {
			continue;
		}
		if (i > 0 && _isPointInArea(points[i - 1], area)) {
			point.controlPointPreviousX = capControlPoint(point.controlPointPreviousX, area.left, area.right);
			point.controlPointPreviousY = capControlPoint(point.controlPointPreviousY, area.top, area.bottom);
		}
		if (i < points.length - 1 && _isPointInArea(points[i + 1], area)) {
			point.controlPointNextX = capControlPoint(point.controlPointNextX, area.left, area.right);
			point.controlPointNextY = capControlPoint(point.controlPointNextY, area.top, area.bottom);
		}
	}
}

/**
 * @private
 */
export function _updateBezierControlPoints(points, options, area, loop) {
	let i, ilen, point, controlPoints;

	// Only consider points that are drawn in case the spanGaps option is used
	if (options.spanGaps) {
		points = points.filter((pt) => !pt.skip);
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
