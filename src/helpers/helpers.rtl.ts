type DirectionContext = CanvasRenderingContext2D & { prevTextDirection?: CanvasDirection };

export interface RTLAdapter {
  x(x: number): number;
  setWidth(w: number): void;
  textAlign(align: 'center' | 'left' | 'right'): 'center' | 'left' | 'right';
  xPlus(x: number, value: number): number;
  leftForLtr(x: number, itemWidth: number): number;
}

const getRightToLeftAdapter = function(rectX: number, width: number): RTLAdapter {
  return {
    x(x) {
      return rectX + rectX + width - x;
    },
    setWidth(w) {
      width = w;
    },
    textAlign(align) {
      if (align === 'center') {
        return align;
      }
      return align === 'right' ? 'left' : 'right';
    },
    xPlus(x, value) {
      return x - value;
    },
    leftForLtr(x, itemWidth) {
      return x - itemWidth;
    },
  };
};

const getLeftToRightAdapter = function(): RTLAdapter {
  return {
    x(x) {
      return x;
    },
    setWidth(w) { // eslint-disable-line no-unused-vars
    },
    textAlign(align) {
      return align;
    },
    xPlus(x, value) {
      return x + value;
    },
    leftForLtr(x, _itemWidth) { // eslint-disable-line @typescript-eslint/no-unused-vars
      return x;
    },
  };
};

export function getRtlAdapter(rtl: boolean, rectX: number, width: number) {
  return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
}

export function overrideTextDirection(ctx: CanvasRenderingContext2D, direction: 'ltr' | 'rtl') {
  if (direction === 'ltr' || direction === 'rtl') {
    (ctx as DirectionContext).prevTextDirection = ctx.direction;
    ctx.direction = direction;
  }
}

export function restoreTextDirection(ctx: CanvasRenderingContext2D, _original?: [string, string]) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const original = (ctx as DirectionContext).prevTextDirection;
  if (original !== undefined) {
    delete (ctx as DirectionContext).prevTextDirection;
    ctx.direction = original;
  }
}
