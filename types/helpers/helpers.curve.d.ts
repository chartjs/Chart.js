export interface ISplinePoint {
  x: number;
  y: number;
}

/**
 * Props to Rob Spencer at scaled innovation for his post on splining between points
 * http://scaledinnovation.com/analytics/splines/aboutSplines.html
 */
export function splineCurve(
  firstPoint: ISplinePoint & { skip?: boolean },
  middlePoint: ISplinePoint,
  afterPoint: ISplinePoint,
  t: number
): {
  previous: ISplinePoint;
  next: ISplinePoint;
};

export interface IMonotoneSplinePoint extends ISplinePoint {
  skip: boolean;
  controlPointPreviousX?: number;
  controlPointPreviousY?: number;
  controlPointNextX?: number;
  controlPointNextY?: number;
}

/**
 * This function calculates Bézier control points in a similar way than |splineCurve|,
 * but preserves monotonicity of the provided data and ensures no local extremums are added
 * between the dataset discrete points due to the interpolation.
 * @see https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
 */
export function splineCurveMonotone(points: readonly IMonotoneSplinePoint[]): void;
