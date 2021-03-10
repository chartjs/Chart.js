export interface SplinePoint {
	x: number;
	y: number;
}

/**
 * Props to Rob Spencer at scaled innovation for his post on splining between points
 * http://scaledinnovation.com/analytics/splines/aboutSplines.html
 */
export function splineCurve(
	firstPoint: SplinePoint & { skip?: boolean },
	middlePoint: SplinePoint,
	afterPoint: SplinePoint,
	t: number
): {
	previous: SplinePoint;
	next: SplinePoint;
};

export interface MonotoneSplinePoint extends SplinePoint {
	skip: boolean;
	cp1x?: number;
	cp1y?: number;
	cp2x?: number;
	cp2y?: number;
}

/**
 * This function calculates Bézier control points in a similar way than |splineCurve|,
 * but preserves monotonicity of the provided data and ensures no local extremums are added
 * between the dataset discrete points due to the interpolation.
 * @see https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
 */
export function splineCurveMonotone(points: readonly MonotoneSplinePoint[]): void;
