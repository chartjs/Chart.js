import Element from '../core/core.element';
import {_angleBetween, getAngleFromPoint, TAU, HALF_PI} from '../helpers/index';
import {_limitValue} from '../helpers/helpers.math';
import {_readValueToProps} from '../helpers/helpers.options';

function clipArc(ctx, element) {
  const {startAngle, endAngle, pixelMargin, x, y, outerRadius, innerRadius} = element;
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
 * @param {ArcElement} arc
 * @param {number} innerRadius
 * @param {number} outerRadius
 * @param {number} angleDelta Arc circumference in radians
 * @returns
 */
function parseBorderRadius(arc, innerRadius, outerRadius, angleDelta) {
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
 * @param {number} r Radius from center point
 * @param {number} theta Angle in radians
 * @param {number} x Center X coordinate
 * @param {number} y Center Y coordinate
 * @returns {{ x: number; y: number }} Rectangular coordinate point
 */
function rThetaToXY(r, theta, x, y) {
  return {
    x: x + r * Math.cos(theta),
    y: y + r * Math.sin(theta),
  };
}


/**
 * Path the arc, respecting the border radius
 *
 * 8 points of interest exist around the arc segment.
 * These points define the intersection of the arc edges and the corners.
 *
 *   Start      End
 *
 *    1---------2    Outer
 *   /           \
 *   8           3
 *   |           |
 *   |           |
 *   7           4
 *   \           /
 *    6---------5    Inner
 * @param {CanvasRenderingContext2D} ctx
 * @param {ArcElement} element
 */
function pathArc(ctx, element) {
  const {x, y, startAngle, endAngle, pixelMargin} = element;
  const outerRadius = Math.max(element.outerRadius - pixelMargin, 0);
  const innerRadius = element.innerRadius + pixelMargin;
  const {outerStart, outerEnd, innerStart, innerEnd} = parseBorderRadius(element, innerRadius, outerRadius, endAngle - startAngle);

  const outerStartAdjustedRadius = outerRadius - outerStart;
  const outerEndAdjustedRadius = outerRadius - outerEnd;
  const outerStartAdjustedAngle = startAngle + outerStart / outerStartAdjustedRadius;
  const outerEndAdjustedAngle = endAngle - outerEnd / outerEndAdjustedRadius;

  const innerStartAdjustedRadius = innerRadius + innerStart;
  const innerEndAdjustedRadius = innerRadius + innerEnd;
  const innerStartAdjustedAngle = startAngle + innerStart / innerStartAdjustedRadius;
  const innerEndAdjustedAngle = endAngle - innerEnd / innerEndAdjustedRadius;

  ctx.beginPath();

  // The first arc segment from point 1 to point 2
  ctx.arc(x, y, outerRadius, outerStartAdjustedAngle, outerEndAdjustedAngle);

  // The corner segment from point 2 to point 3
  if (outerEnd > 0) {
    const pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x, y);
    ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, endAngle + HALF_PI);
  }

  // The line from point 3 to point 4
  const p4 = rThetaToXY(innerEndAdjustedRadius, endAngle, x, y);
  ctx.lineTo(p4.x, p4.y);

  // The corner segment from point 4 to point 5
  if (innerEnd > 0) {
    const pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x, y);
    ctx.arc(pCenter.x, pCenter.y, innerEnd, endAngle + HALF_PI, innerEndAdjustedAngle + Math.PI);
  }

  // The inner arc from point 5 to point 6
  ctx.arc(x, y, innerRadius, endAngle - (innerEnd / innerRadius), startAngle + (innerStart / innerRadius), true);

  // The corner segment from point 6 to point 7
  if (innerStart > 0) {
    const pCenter = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x, y);
    ctx.arc(pCenter.x, pCenter.y, innerStart, innerStartAdjustedAngle + Math.PI, startAngle - HALF_PI);
  }

  // The line from point 7 to point 8
  const p8 = rThetaToXY(outerStartAdjustedRadius, startAngle, x, y);
  ctx.lineTo(p8.x, p8.y);

  // The corner segment from point 8 to point 1
  if (outerStart > 0) {
    const pCenter = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x, y);
    ctx.arc(pCenter.x, pCenter.y, outerStart, startAngle - HALF_PI, outerStartAdjustedAngle);
  }

  ctx.closePath();
}

function drawArc(ctx, element) {
  if (element.fullCircles) {
    element.endAngle = element.startAngle + TAU;

    pathArc(ctx, element);

    for (let i = 0; i < element.fullCircles; ++i) {
      ctx.fill();
    }
  }
  if (!isNaN(element.circumference)) {
    element.endAngle = element.startAngle + element.circumference % TAU;
  }

  pathArc(ctx, element);
  ctx.fill();
}

function drawFullCircleBorders(ctx, element, inner) {
  const {x, y, startAngle, endAngle, pixelMargin} = element;
  const outerRadius = Math.max(element.outerRadius - pixelMargin, 0);
  const innerRadius = element.innerRadius + pixelMargin;

  let i;

  if (inner) {
    element.endAngle = element.startAngle + TAU;
    clipArc(ctx, element);
    element.endAngle = endAngle;
    if (element.endAngle === element.startAngle) {
      element.endAngle += TAU;
      element.fullCircles--;
    }
  }

  ctx.beginPath();
  ctx.arc(x, y, innerRadius, startAngle + TAU, startAngle, true);
  for (i = 0; i < element.fullCircles; ++i) {
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(x, y, outerRadius, startAngle, startAngle + TAU);
  for (i = 0; i < element.fullCircles; ++i) {
    ctx.stroke();
  }
}

function drawBorder(ctx, element) {
  const {options} = element;
  const inner = options.borderAlign === 'inner';

  if (!options.borderWidth) {
    return;
  }

  if (inner) {
    ctx.lineWidth = options.borderWidth * 2;
    ctx.lineJoin = 'round';
  } else {
    ctx.lineWidth = options.borderWidth;
    ctx.lineJoin = 'bevel';
  }

  if (element.fullCircles) {
    drawFullCircleBorders(ctx, element, inner);
  }

  if (inner) {
    clipArc(ctx, element);
  }

  pathArc(ctx, element);
  ctx.stroke();
}

export default class ArcElement extends Element {

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

    if (cfg) {
      Object.assign(this, cfg);
    }
  }

  /**
	 * @param {number} chartX
	 * @param {number} chartY
	 * @param {boolean} [useFinalPosition]
	 */
  inRange(chartX, chartY, useFinalPosition) {
    const point = this.getProps(['x', 'y'], useFinalPosition);
    const {angle, distance} = getAngleFromPoint(point, {x: chartX, y: chartY});
    const {startAngle, endAngle, innerRadius, outerRadius, circumference} = this.getProps([
      'startAngle',
      'endAngle',
      'innerRadius',
      'outerRadius',
      'circumference'
    ], useFinalPosition);
    const betweenAngles = circumference >= TAU || _angleBetween(angle, startAngle, endAngle);
    const withinRadius = (distance >= innerRadius && distance <= outerRadius);

    return (betweenAngles && withinRadius);
  }

  /**
	 * @param {boolean} [useFinalPosition]
	 */
  getCenterPoint(useFinalPosition) {
    const {x, y, startAngle, endAngle, innerRadius, outerRadius} = this.getProps([
      'x',
      'y',
      'startAngle',
      'endAngle',
      'innerRadius',
      'outerRadius'
    ], useFinalPosition);
    const halfAngle = (startAngle + endAngle) / 2;
    const halfRadius = (innerRadius + outerRadius) / 2;
    return {
      x: x + Math.cos(halfAngle) * halfRadius,
      y: y + Math.sin(halfAngle) * halfRadius
    };
  }

  /**
	 * @param {boolean} [useFinalPosition]
	 */
  tooltipPosition(useFinalPosition) {
    return this.getCenterPoint(useFinalPosition);
  }

  draw(ctx) {
    const me = this;
    const options = me.options;
    const offset = options.offset || 0;
    me.pixelMargin = (options.borderAlign === 'inner') ? 0.33 : 0;
    me.fullCircles = Math.floor(me.circumference / TAU);

    if (me.circumference === 0 || me.innerRadius < 0 || me.outerRadius < 0) {
      return;
    }

    ctx.save();

    if (offset && me.circumference < TAU) {
      const halfAngle = (me.startAngle + me.endAngle) / 2;
      ctx.translate(Math.cos(halfAngle) * offset, Math.sin(halfAngle) * offset);
    }

    ctx.fillStyle = options.backgroundColor;
    ctx.strokeStyle = options.borderColor;

    drawArc(ctx, me);
    drawBorder(ctx, me);

    ctx.restore();
  }
}

ArcElement.id = 'arc';

/**
 * @type {any}
 */
ArcElement.defaults = {
  borderAlign: 'center',
  borderColor: '#fff',
  borderRadius: 0,
  borderWidth: 2,
  offset: 0,
  angle: undefined,
};

/**
 * @type {any}
 */
ArcElement.defaultRoutes = {
  backgroundColor: 'backgroundColor'
};
