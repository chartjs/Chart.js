import Element from '../core/core.element.js';
import {_angleBetween, getAngleFromPoint, TAU, HALF_PI, valueOrDefault} from '../helpers/index.js';
import {PI, _angleDiff, _normalizeAngle, _isBetween, _limitValue} from '../helpers/helpers.math.js';
import {_readValueToProps} from '../helpers/helpers.options.js';
import type {ArcOptions, Point} from '../types/index.js';

function clipSelf(ctx: CanvasRenderingContext2D, element: ArcElement, endAngle: number) {
  const {startAngle, x, y, outerRadius, innerRadius, options} = element;
  const {borderWidth, borderJoinStyle} = options;
  const outerAngleClip = Math.min(borderWidth / outerRadius, _normalizeAngle(startAngle - endAngle));
  ctx.beginPath();
  ctx.arc(x, y, outerRadius - borderWidth / 2, startAngle + outerAngleClip / 2, endAngle - outerAngleClip / 2);

  if (innerRadius > 0) {
    const innerAngleClip = Math.min(borderWidth / innerRadius, _normalizeAngle(startAngle - endAngle));
    ctx.arc(x, y, innerRadius + borderWidth / 2, endAngle - innerAngleClip / 2, startAngle + innerAngleClip / 2, true);
  } else {
    const clipWidth = Math.min(borderWidth / 2, outerRadius * _normalizeAngle(startAngle - endAngle));

    if (borderJoinStyle === 'round') {
      ctx.arc(x, y, clipWidth, endAngle - PI / 2, startAngle + PI / 2, true);
    } else if (borderJoinStyle === 'bevel') {
      const r = 2 * clipWidth * clipWidth;
      const endX = -r * Math.cos(endAngle + PI / 2) + x;
      const endY = -r * Math.sin(endAngle + PI / 2) + y;
      const startX = r * Math.cos(startAngle + PI / 2) + x;
      const startY = r * Math.sin(startAngle + PI / 2) + y;
      ctx.lineTo(endX, endY);
      ctx.lineTo(startX, startY);
    }
  }
  ctx.closePath();

  ctx.moveTo(0, 0);
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.clip('evenodd');
}


function clipArc(ctx: CanvasRenderingContext2D, element: ArcElement, endAngle: number) {
  const {startAngle, pixelMargin, x, y, outerRadius, innerRadius} = element;
  let angleMargin = pixelMargin / outerRadius;

  // Draw an inner border by clipping the arc and drawing a double-width border
  // Enlarge the clipping arc by 0.33 pixels to eliminate glitches between borders
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
  if (innerRadius > pixelMargin) {
    angleMargin = pixelMargin / innerRadius;
    ctx.arc(x, y, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
  } else {
    ctx.arc(x, y, pixelMargin, endAngle + HALF_PI, startAngle - HALF_PI);
  }
  ctx.closePath();
  ctx.clip();
}

function toRadiusCorners(value) {
  return _readValueToProps(value, ['outerStart', 'outerEnd', 'innerStart', 'innerEnd']);
}

/**
 * Parse border radius from the provided options
 */
function parseBorderRadius(arc: ArcElement, innerRadius: number, outerRadius: number, angleDelta: number) {
  const o = toRadiusCorners(arc.options.borderRadius);
  const halfThickness = (outerRadius - innerRadius) / 2;
  const innerLimit = Math.min(halfThickness, angleDelta * innerRadius / 2);

  // Outer limits are complicated. We want to compute the available angular distance at
  // a radius of outerRadius - borderRadius because for small angular distances, this term limits.
  // We compute at r = outerRadius - borderRadius because this circle defines the center of the border corners.
  //
  // If the borderRadius is large, that value can become negative.
  // This causes the outer borders to lose their radius entirely, which is rather unexpected. To solve that, if borderRadius > outerRadius
  // we know that the thickness term will dominate and compute the limits at that point
  const computeOuterLimit = (val) => {
    const outerArcLimit = (outerRadius - Math.min(halfThickness, val)) * angleDelta / 2;
    return _limitValue(val, 0, Math.min(halfThickness, outerArcLimit));
  };

  return {
    outerStart: computeOuterLimit(o.outerStart),
    outerEnd: computeOuterLimit(o.outerEnd),
    innerStart: _limitValue(o.innerStart, 0, innerLimit),
    innerEnd: _limitValue(o.innerEnd, 0, innerLimit),
  };
}

/**
 * Convert (r, 𝜃) to (x, y)
 */
function rThetaToXY(r: number, theta: number, x: number, y: number) {
  return {
    x: x + r * Math.cos(theta),
    y: y + r * Math.sin(theta),
  };
}

function pathFullCircle(
  ctx: CanvasRenderingContext2D,
  element: ArcElement,
  offset: number,
  spacing: number,
) {
  const {x, y, startAngle: start, pixelMargin, innerRadius: innerR} = element;
  const outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0);
  const innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;

  ctx.beginPath();
  ctx.arc(x, y, outerRadius, start, start + TAU);

  if (innerRadius > 0) {
    // Start the inner contour as a separate subpath to avoid a seam connector.
    ctx.moveTo(x + Math.cos(start) * innerRadius, y + Math.sin(start) * innerRadius);
    ctx.arc(x, y, innerRadius, start + TAU, start, true);
  }

  ctx.closePath();
}


/**
 * Path the arc, respecting border radius by separating into left and right halves.
 *
 *   Start      End
 *
 *    1--->a--->2    Outer
 *   /           \
 *   8           3
 *   |           |
 *   |           |
 *   7           4
 *   \           /
 *    6<---b<---5    Inner
 */
function pathArc(
  ctx: CanvasRenderingContext2D,
  element: ArcElement,
  offset: number,
  spacing: number,
  end: number,
  circular: boolean,
) {
  const {x, y, startAngle: start, pixelMargin, innerRadius: innerR} = element;
  const {spacingMode = 'angular'} = element.options;
  const alpha = end - start;

  if (circular && element.options.selfJoin && Math.abs(alpha) >= TAU - 1e-4) {
    pathFullCircle(ctx, element, offset, spacing);
    return;
  }

  const outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0);
  let innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;

  let outerSpacingOffset = 0;
  let innerSpacingOffset = 0;
  const beta = outerRadius > 0
    ? Math.max(0.001, alpha * outerRadius - offset / PI) / outerRadius
    : 0.001;
  const angleOffset = (alpha - beta) / 2;

  if (spacing) {
    // When spacing is present, it is the same for all items
    // So we adjust the start and end angle of the arc such that
    // the distance is the same as it would be without the spacing
    const noSpacingInnerRadius = innerR > 0 ? innerR - spacing : 0;
    const noSpacingOuterRadius = outerRadius > 0 ? outerRadius - spacing : 0;
    const avgNoSpacingRadius = (noSpacingInnerRadius + noSpacingOuterRadius) / 2;
    const proportionalOffset = (() => {
      const adjustedAngle = avgNoSpacingRadius !== 0 ? (alpha * avgNoSpacingRadius) / (avgNoSpacingRadius + spacing) : alpha;
      return (alpha - adjustedAngle) / 2;
    })();
    const angularOffset = avgNoSpacingRadius > 0 ? Math.asin(Math.min(1, spacing / avgNoSpacingRadius)) : 0;

    // Keep spacing trims below half the available span after base offset trimming.
    const maxOffset = Math.max(0, beta / 2 - 0.001);
    const maxOffsetSin = Math.sin(maxOffset);

    if (spacingMode === 'parallel') {
      if (innerRadius === 0 && maxOffsetSin > 0) {
        // A root radius of zero cannot realize a non-zero parallel separator width.
        // Raise the root just enough for the available angular span.
        const minInnerRadius = spacing / maxOffsetSin;
        const maxInnerRadius = Math.max(0, outerRadius - 0.001);
        innerRadius = Math.min(minInnerRadius, maxInnerRadius);
      }

      // Use one bounded spacing value for both radii so large spacing keeps stable geometry.
      const maxParallelSpacing = Math.min(
        outerRadius > 0 ? outerRadius * maxOffsetSin : Number.POSITIVE_INFINITY,
        innerRadius > 0 ? innerRadius * maxOffsetSin : Number.POSITIVE_INFINITY
      );
      const parallelSpacing = Math.min(spacing, maxParallelSpacing);

      outerSpacingOffset = outerRadius > 0
        ? Math.asin(Math.min(1, parallelSpacing / outerRadius))
        : Math.min(maxOffset, angularOffset);
      innerSpacingOffset = innerRadius > 0
        ? Math.asin(Math.min(1, parallelSpacing / innerRadius))
        : outerSpacingOffset;
    } else if (spacingMode === 'proportional') {
      outerSpacingOffset = Math.min(maxOffset, proportionalOffset);
      innerSpacingOffset = Math.min(maxOffset, proportionalOffset);
    } else {
      outerSpacingOffset = Math.min(maxOffset, angularOffset);
      innerSpacingOffset = Math.min(maxOffset, angularOffset);
    }
  }

  const outerStartAngle = start + angleOffset + outerSpacingOffset;
  const outerEndAngle = end - angleOffset - outerSpacingOffset;
  const innerStartAngle = start + angleOffset + innerSpacingOffset;
  const innerEndAngle = end - angleOffset - innerSpacingOffset;
  const angleDelta = Math.min(outerEndAngle - outerStartAngle, innerEndAngle - innerStartAngle);
  const {outerStart, outerEnd, innerStart, innerEnd} = parseBorderRadius(element, innerRadius, outerRadius, angleDelta);

  const outerStartAdjustedRadius = outerRadius - outerStart;
  const outerEndAdjustedRadius = outerRadius - outerEnd;
  const outerStartAdjustedAngle = outerStartAngle + outerStart / outerStartAdjustedRadius;
  const outerEndAdjustedAngle = outerEndAngle - outerEnd / outerEndAdjustedRadius;

  const innerStartAdjustedRadius = innerRadius + innerStart;
  const innerEndAdjustedRadius = innerRadius + innerEnd;
  const innerStartAdjustedAngle = innerStartAngle + innerStart / innerStartAdjustedRadius;
  const innerEndAdjustedAngle = innerEndAngle - innerEnd / innerEndAdjustedRadius;

  ctx.beginPath();

  if (circular) {
    // The first arc segments from point 1 to point a to point 2
    const outerMidAdjustedAngle = (outerStartAdjustedAngle + outerEndAdjustedAngle) / 2;
    ctx.arc(x, y, outerRadius, outerStartAdjustedAngle, outerMidAdjustedAngle);
    ctx.arc(x, y, outerRadius, outerMidAdjustedAngle, outerEndAdjustedAngle);

    // The corner segment from point 2 to point 3
    if (outerEnd > 0) {
      const pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, outerEndAngle + HALF_PI);
    }

    // The line from point 3 to point 4
    const p4 = rThetaToXY(innerEndAdjustedRadius, innerEndAngle, x, y);
    ctx.lineTo(p4.x, p4.y);

    // The corner segment from point 4 to point 5
    if (innerEnd > 0) {
      const pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, innerEnd, innerEndAngle + HALF_PI, innerEndAdjustedAngle + Math.PI);
    }

    // The inner arc from point 5 to point b to point 6
    const innerMidAdjustedAngle = ((innerEndAngle - (innerEnd / innerRadius)) + (innerStartAngle + (innerStart / innerRadius))) / 2;
    ctx.arc(x, y, innerRadius, innerEndAngle - (innerEnd / innerRadius), innerMidAdjustedAngle, true);
    ctx.arc(x, y, innerRadius, innerMidAdjustedAngle, innerStartAngle + (innerStart / innerRadius), true);

    // The corner segment from point 6 to point 7
    if (innerStart > 0) {
      const pCenter = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, innerStart, innerStartAdjustedAngle + Math.PI, innerStartAngle - HALF_PI);
    }

    // The line from point 7 to point 8
    const p8 = rThetaToXY(outerStartAdjustedRadius, outerStartAngle, x, y);
    ctx.lineTo(p8.x, p8.y);

    // The corner segment from point 8 to point 1
    if (outerStart > 0) {
      const pCenter = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, outerStart, outerStartAngle - HALF_PI, outerStartAdjustedAngle);
    }
  } else {
    ctx.moveTo(x, y);

    const outerStartX = Math.cos(outerStartAdjustedAngle) * outerRadius + x;
    const outerStartY = Math.sin(outerStartAdjustedAngle) * outerRadius + y;
    ctx.lineTo(outerStartX, outerStartY);

    const outerEndX = Math.cos(outerEndAdjustedAngle) * outerRadius + x;
    const outerEndY = Math.sin(outerEndAdjustedAngle) * outerRadius + y;
    ctx.lineTo(outerEndX, outerEndY);
  }

  ctx.closePath();
}

function drawArc(
  ctx: CanvasRenderingContext2D,
  element: ArcElement,
  offset: number,
  spacing: number,
  circular: boolean,
) {
  const {fullCircles, startAngle, circumference} = element;
  let endAngle = element.endAngle;
  if (fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    for (let i = 0; i < fullCircles; ++i) {
      ctx.fill();
    }
    if (!isNaN(circumference)) {
      endAngle = startAngle + (circumference % TAU || TAU);
    }
  }
  pathArc(ctx, element, offset, spacing, endAngle, circular);
  ctx.fill();
  return endAngle;
}

function drawBorder(
  ctx: CanvasRenderingContext2D,
  element: ArcElement,
  offset: number,
  spacing: number,
  circular: boolean,
) {
  const {fullCircles, startAngle, circumference, options} = element;
  const {borderWidth, borderJoinStyle, borderDash, borderDashOffset, borderRadius} = options;
  const inner = options.borderAlign === 'inner';

  if (!borderWidth) {
    return;
  }

  ctx.setLineDash(borderDash || []);
  ctx.lineDashOffset = borderDashOffset;

  if (inner) {
    ctx.lineWidth = borderWidth * 2;
    ctx.lineJoin = borderJoinStyle || 'round';
  } else {
    ctx.lineWidth = borderWidth;
    ctx.lineJoin = borderJoinStyle || 'bevel';
  }

  let endAngle = element.endAngle;
  const isFullCircle = Math.abs(endAngle - startAngle) >= TAU - 1e-4;
  if (fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    for (let i = 0; i < fullCircles; ++i) {
      ctx.stroke();
    }
    if (!isNaN(circumference)) {
      endAngle = startAngle + (circumference % TAU || TAU);
    }
  }

  if (inner) {
    clipArc(ctx, element, endAngle);
  }

  const skipSelfClip = isFullCircle && element.innerRadius > 0;
  if (!skipSelfClip && options.selfJoin && endAngle - startAngle >= PI && borderRadius === 0 && borderJoinStyle !== 'miter') {
    clipSelf(ctx, element, endAngle);
  }

  if (!fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    ctx.stroke();
  }
}

export interface ArcProps extends Point {
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  circumference: number;
}

export default class ArcElement extends Element<ArcProps, ArcOptions> {

  static id = 'arc';

  static defaults = {
    borderAlign: 'center',
    borderColor: '#fff',
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: undefined,
    borderRadius: 0,
    borderWidth: 2,
    offset: 0,
    spacing: 0,
    spacingMode: 'angular',
    angle: undefined,
    circular: true,
    selfJoin: false,
  };

  static defaultRoutes = {
    backgroundColor: 'backgroundColor'
  };

  static descriptors = {
    _scriptable: true,
    _indexable: (name) => name !== 'borderDash'
  };

  circumference: number;
  endAngle: number;
  fullCircles: number;
  innerRadius: number;
  outerRadius: number;
  pixelMargin: number;
  startAngle: number;
  circular: boolean;

  constructor(cfg) {
    super();

    this.options = undefined;
    this.circumference = undefined;
    this.startAngle = undefined;
    this.endAngle = undefined;
    this.innerRadius = undefined;
    this.outerRadius = undefined;
    this.pixelMargin = 0;
    this.fullCircles = 0;
    this.circular = false;

    if (cfg) {
      Object.assign(this, cfg);
    }
  }

  inRange(chartX: number, chartY: number, useFinalPosition: boolean) {
    const point = this.getProps(['x', 'y'], useFinalPosition);
    const {angle, distance} = getAngleFromPoint(point, {x: chartX, y: chartY});
    const {startAngle, endAngle, innerRadius, outerRadius, circumference} = this.getProps([
      'startAngle',
      'endAngle',
      'innerRadius',
      'outerRadius',
      'circumference'
    ], useFinalPosition);
    const rAdjust = (this.options.spacing + this.options.borderWidth) / 2;
    const _circumference = valueOrDefault(circumference, endAngle - startAngle);
    const nonZeroBetween = _angleBetween(angle, startAngle, endAngle) && startAngle !== endAngle;
    const betweenAngles = _circumference >= TAU || nonZeroBetween;
    const withinRadius = _isBetween(distance, innerRadius + rAdjust, outerRadius + rAdjust);

    return (betweenAngles && withinRadius);
  }

  getCenterPoint(useFinalPosition: boolean) {
    const {x, y, startAngle, endAngle, innerRadius, outerRadius} = this.getProps([
      'x',
      'y',
      'startAngle',
      'endAngle',
      'innerRadius',
      'outerRadius'
    ], useFinalPosition);
    const {offset, spacing} = this.options;
    const halfAngle = (startAngle + endAngle) / 2;
    const halfRadius = (innerRadius + outerRadius + spacing + offset) / 2;
    return {
      x: x + Math.cos(halfAngle) * halfRadius,
      y: y + Math.sin(halfAngle) * halfRadius
    };
  }

  tooltipPosition(useFinalPosition: boolean) {
    return this.getCenterPoint(useFinalPosition);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const {options, circumference} = this;
    const offset = (options.offset || 0) / 4;
    const spacing = (options.spacing || 0) / 2;
    const circular = options.circular;
    this.pixelMargin = (options.borderAlign === 'inner') ? 0.33 : 0;
    this.fullCircles = circumference > TAU ? Math.floor(circumference / TAU) : 0;

    if (circumference === 0 || this.innerRadius < 0 || this.outerRadius < 0) {
      return;
    }

    ctx.save();

    const halfAngle = (this.startAngle + this.endAngle) / 2;
    ctx.translate(Math.cos(halfAngle) * offset, Math.sin(halfAngle) * offset);
    const fix = 1 - Math.sin(Math.min(PI, circumference || 0));
    const radiusOffset = offset * fix;

    ctx.fillStyle = options.backgroundColor;
    ctx.strokeStyle = options.borderColor;

    drawArc(ctx, this, radiusOffset, spacing, circular);
    drawBorder(ctx, this, radiusOffset, spacing, circular);

    ctx.restore();
  }
}
