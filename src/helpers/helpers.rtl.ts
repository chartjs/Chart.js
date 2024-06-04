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
  let style: CSSStyleDeclaration, original: [string, string];
  if (direction === 'ltr' || direction === 'rtl') {
    style = ctx.canvas.style;
    original = [
      style.getPropertyValue('direction'),
      style.getPropertyPriority('direction'),
    ];

    style.setProperty('direction', direction, 'important');
    (ctx as { prevTextDirection?: [string, string] }).prevTextDirection = original;
  }
}

export function restoreTextDirection(ctx: CanvasRenderingContext2D, original?: [string, string]) {
  if (original !== undefined) {
    delete (ctx as { prevTextDirection?: [string, string] }).prevTextDirection;
    ctx.canvas.style.setProperty('direction', original[0], original[1]);
  }
}
