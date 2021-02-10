const getRightToLeftAdapter = function(rectX, width) {
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

const getLeftToRightAdapter = function() {
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
    leftForLtr(x, _itemWidth) { // eslint-disable-line no-unused-vars
      return x;
    },
  };
};

export function getRtlAdapter(rtl, rectX, width) {
  return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
}

export function overrideTextDirection(ctx, direction) {
  let style, original;
  if (direction === 'ltr' || direction === 'rtl') {
    style = ctx.canvas.style;
    original = [
      style.getPropertyValue('direction'),
      style.getPropertyPriority('direction'),
    ];

    style.setProperty('direction', direction, 'important');
    ctx.prevTextDirection = original;
  }
}

export function restoreTextDirection(ctx, original) {
  if (original !== undefined) {
    delete ctx.prevTextDirection;
    ctx.canvas.style.setProperty('direction', original[0], original[1]);
  }
}
