import Element from '../core/core.element.js';
import {isObject, _isBetween, _limitValue} from '../helpers/index.js';
import {addRoundedRectPath} from '../helpers/helpers.canvas.js';
import {toTRBL, toTRBLCorners} from '../helpers/helpers.options.js';
import type {BarOptions, Point} from '../types/index.js';
import type {ChartArea, RoundedRect, TRBL, TRBLCorners} from '../types/geometric.js';

export interface BarProps extends Point {
  base: number;
  horizontal: boolean;
  width: number;
  height: number;
}

type BarRect = RoundedRect & {radius: TRBLCorners};

/**
 * Helper function to get the bounds of the bar regardless of the orientation
 * @param bar the bar
 * @param [useFinalPosition]
 * @return bounds of the bar
 * @private
 */
function getBarBounds(bar: BarElement, useFinalPosition?: boolean) {
  const {x, y, base, width, height} = bar.getProps(['x', 'y', 'base', 'width', 'height'], useFinalPosition);

  let left: number, right: number, top: number, bottom: number, half: number;

  if (bar.horizontal) {
    half = height / 2;
    left = Math.min(x, base);
    right = Math.max(x, base);
    top = y - half;
    bottom = y + half;
  } else {
    half = width / 2;
    left = x - half;
    right = x + half;
    top = Math.min(y, base);
    bottom = Math.max(y, base);
  }

  return {left, top, right, bottom};
}

function skipOrLimit(skip: boolean, value: number, min: number, max: number) {
  return skip ? 0 : _limitValue(value, min, max);
}

function parseBorderWidth(bar: BarElement, maxW: number, maxH: number) {
  const value = bar.options.borderWidth;
  const skip = bar.borderSkipped;
  // toTRBL reads a side that is left out as 0, which a partial object relies on.
  const o = toTRBL(value as number | TRBL);

  return {
    t: skipOrLimit(skip.top, o.top, 0, maxH),
    r: skipOrLimit(skip.right, o.right, 0, maxW),
    b: skipOrLimit(skip.bottom, o.bottom, 0, maxH),
    l: skipOrLimit(skip.left, o.left, 0, maxW)
  };
}

function parseBorderRadius(bar: BarElement, maxW: number, maxH: number) {
  const {enableBorderRadius} = bar.getProps(['enableBorderRadius']);
  const value = bar.options.borderRadius;
  const o = toTRBLCorners(value);
  const maxR = Math.min(maxW, maxH);
  const skip = bar.borderSkipped;

  // If the value is an object, assume the user knows what they are doing
  // and apply as directed.
  const enableBorder = enableBorderRadius || isObject(value);

  return {
    topLeft: skipOrLimit(!enableBorder || skip.top || skip.left, o.topLeft, 0, maxR),
    topRight: skipOrLimit(!enableBorder || skip.top || skip.right, o.topRight, 0, maxR),
    bottomLeft: skipOrLimit(!enableBorder || skip.bottom || skip.left, o.bottomLeft, 0, maxR),
    bottomRight: skipOrLimit(!enableBorder || skip.bottom || skip.right, o.bottomRight, 0, maxR)
  };
}

function boundingRects(bar: BarElement): {outer: BarRect, inner: BarRect} {
  const bounds = getBarBounds(bar);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const border = parseBorderWidth(bar, width / 2, height / 2);
  const radius = parseBorderRadius(bar, width / 2, height / 2);

  return {
    outer: {
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height,
      radius
    },
    inner: {
      x: bounds.left + border.l,
      y: bounds.top + border.t,
      w: width - border.l - border.r,
      h: height - border.t - border.b,
      radius: {
        topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
        topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
        bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
        bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r)),
      }
    }
  };
}

function inRange(bar: BarElement, x: number | null, y: number | null, useFinalPosition?: boolean) {
  const skipX = x === null;
  const skipY = y === null;
  const skipBoth = skipX && skipY;
  const bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition);

  return bounds
		&& (skipX || _isBetween(x, bounds.left, bounds.right))
		&& (skipY || _isBetween(y, bounds.top, bounds.bottom));
}

function hasRadius(radius: TRBLCorners) {
  return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight;
}

/**
 * Add a path of a rectangle to the current sub-path
 * @param ctx Context
 * @param rect Bounding rect
 */
function addNormalRectPath(ctx: CanvasRenderingContext2D, rect: RoundedRect) {
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
}

function inflateRect(rect: BarRect, amount: number, refRect: Partial<RoundedRect> = {}): BarRect {
  const x = rect.x !== refRect.x ? -amount : 0;
  const y = rect.y !== refRect.y ? -amount : 0;
  const w = (rect.x + rect.w !== refRect.x + refRect.w ? amount : 0) - x;
  const h = (rect.y + rect.h !== refRect.y + refRect.h ? amount : 0) - y;
  return {
    x: rect.x + x,
    y: rect.y + y,
    w: rect.w + w,
    h: rect.h + h,
    radius: rect.radius
  };
}

export default class BarElement extends Element<BarProps, BarOptions> {

  static id = 'bar';

  static override defaults: any = {
    borderSkipped: 'start',
    borderWidth: 0,
    borderRadius: 0,
    inflateAmount: 'auto',
    pointStyle: undefined
  };

  static override defaultRoutes: any = {
    backgroundColor: 'backgroundColor',
    borderColor: 'borderColor'
  };

  declare horizontal: boolean;
  declare base: number;
  declare width: number;
  declare height: number;
  declare inflateAmount: number;
  declare borderSkipped: {top: boolean, right: boolean, bottom: boolean, left: boolean};

  constructor(cfg) {
    super();

    this.options = undefined;
    this.horizontal = undefined;
    this.base = undefined;
    this.width = undefined;
    this.height = undefined;
    this.inflateAmount = undefined;

    if (cfg) {
      Object.assign(this, cfg);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const {inflateAmount, options: {borderColor, backgroundColor}} = this;
    const {inner, outer} = boundingRects(this);
    const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath;

    ctx.save();

    if (outer.w !== inner.w || outer.h !== inner.h) {
      ctx.beginPath();
      addRectPath(ctx, inflateRect(outer, inflateAmount, inner));
      ctx.clip();
      addRectPath(ctx, inflateRect(inner, -inflateAmount, outer));
      ctx.fillStyle = borderColor;
      ctx.fill('evenodd');
    }

    ctx.beginPath();
    addRectPath(ctx, inflateRect(inner, inflateAmount));
    ctx.fillStyle = backgroundColor;
    ctx.fill();

    ctx.restore();
  }

  inRange(mouseX: number, mouseY: number, useFinalPosition?: boolean) {
    return inRange(this, mouseX, mouseY, useFinalPosition);
  }

  inXRange(mouseX: number, useFinalPosition?: boolean) {
    return inRange(this, mouseX, null, useFinalPosition);
  }

  inYRange(mouseY: number, useFinalPosition?: boolean) {
    return inRange(this, null, mouseY, useFinalPosition);
  }

  getCenterPoint(useFinalPosition?: boolean) {
    const {x, y, base, horizontal} = this.getProps(['x', 'y', 'base', 'horizontal'], useFinalPosition);
    return {
      x: horizontal ? (x + base) / 2 : x,
      y: horizontal ? y : (y + base) / 2
    };
  }

  /**
   * The centre of the part of the bar inside the chart area, which the interaction modes
   * measure to and the tooltip points at when the bar is cut off.
   * Returns `null` when no part of the bar is inside, and `undefined` for a subclass that
   * defines its own geometry (it overrides `getCenterPoint`), which keeps the generic rule.
   * @internal
   */
  _getAreaCenter(area: ChartArea, useFinalPosition?: boolean): {x: number, y: number} | null | undefined {
    if (this.getCenterPoint !== BarElement.prototype.getCenterPoint) {
      return undefined;
    }
    const bounds = getBarBounds(this, useFinalPosition);
    const left = Math.max(bounds.left, area.left);
    const right = Math.min(bounds.right, area.right);
    const top = Math.max(bounds.top, area.top);
    const bottom = Math.min(bounds.bottom, area.bottom);
    // Inclusive, so that a bar of zero length on the edge of the area is still found.
    // Written so that NaN bounds count as outside.
    if (!(left <= right && top <= bottom)) {
      return null;
    }
    return {x: (left + right) / 2, y: (top + bottom) / 2};
  }

  getRange(axis: 'x' | 'y') {
    return axis === 'x' ? this.width / 2 : this.height / 2;
  }
}
