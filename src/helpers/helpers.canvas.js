import {isArray, isNullOrUndef} from './helpers.core.js';
import {PI, TAU, HALF_PI, QUARTER_PI, TWO_THIRDS_PI, RAD_PER_DEG} from './helpers.math.js';

/**
 * Note: typedefs are auto-exported, so use a made-up `canvas` namespace where
 * necessary to avoid duplicates with `export * from './helpers`; see
 * https://github.com/microsoft/TypeScript/issues/46011
 * @typedef { import('../core/core.controller.js').default } canvas.Chart
 * @typedef { import('../types/index.js').Point } Point
 */

/**
 * @namespace Chart.helpers.canvas
 */

/**
 * Converts the given font object into a CSS font string.
 * @param {object} font - A font object.
 * @return {string|null} The CSS font string. See https://developer.mozilla.org/en-US/docs/Web/CSS/font
 * @private
 */
export function toFontString(font) {
  if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
    return null;
  }

  return (font.style ? font.style + ' ' : '')
		+ (font.weight ? font.weight + ' ' : '')
		+ font.size + 'px '
		+ font.family;
}

/**
 * @private
 */
export function _measureText(ctx, data, gc, longest, string) {
  let textWidth = data[string];
  if (!textWidth) {
    textWidth = data[string] = ctx.measureText(string).width;
    gc.push(string);
  }
  if (textWidth > longest) {
    longest = textWidth;
  }
  return longest;
}

/**
 * @private
 */
export function _longestText(ctx, font, arrayOfThings, cache) {
  cache = cache || {};
  let data = cache.data = cache.data || {};
  let gc = cache.garbageCollect = cache.garbageCollect || [];

  if (cache.font !== font) {
    data = cache.data = {};
    gc = cache.garbageCollect = [];
    cache.font = font;
  }

  ctx.save();

  ctx.font = font;
  let longest = 0;
  const ilen = arrayOfThings.length;
  let i, j, jlen, thing, nestedThing;
  for (i = 0; i < ilen; i++) {
    thing = arrayOfThings[i];

    // Undefined strings and arrays should not be measured
    if (thing !== undefined && thing !== null && isArray(thing) !== true) {
      longest = _measureText(ctx, data, gc, longest, thing);
    } else if (isArray(thing)) {
      // if it is an array lets measure each element
      // to do maybe simplify this function a bit so we can do this more recursively?
      for (j = 0, jlen = thing.length; j < jlen; j++) {
        nestedThing = thing[j];
        // Undefined strings and arrays should not be measured
        if (nestedThing !== undefined && nestedThing !== null && !isArray(nestedThing)) {
          longest = _measureText(ctx, data, gc, longest, nestedThing);
        }
      }
    }
  }

  ctx.restore();

  const gcLen = gc.length / 2;
  if (gcLen > arrayOfThings.length) {
    for (i = 0; i < gcLen; i++) {
      delete data[gc[i]];
    }
    gc.splice(0, gcLen);
  }
  return longest;
}

/**
 * Returns the aligned pixel value to avoid anti-aliasing blur
 * @param {canvas.Chart} chart - The chart instance.
 * @param {number} pixel - A pixel value.
 * @param {number} width - The width of the element.
 * @returns {number} The aligned pixel value.
 * @private
 */
export function _alignPixel(chart, pixel, width) {
  const devicePixelRatio = chart.currentDevicePixelRatio;
  const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
  return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
}

/**
 * Clears the entire canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} [ctx]
 */
export function clearCanvas(canvas, ctx) {
  ctx = ctx || canvas.getContext('2d');

  ctx.save();
  // canvas.width and canvas.height do not consider the canvas transform,
  // while clearRect does
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

export function drawPoint(ctx, options, x, y) {
  drawPointLegend(ctx, options, x, y, null);
}

export function drawPointLegend(ctx, options, x, y, w) {
  let type, xOffset, yOffset, size, cornerRadius, width, xOffsetW, yOffsetW;
  const style = options.pointStyle;
  const rotation = options.rotation;
  const radius = options.radius;
  let rad = (rotation || 0) * RAD_PER_DEG;

  if (style && typeof style === 'object') {
    type = style.toString();
    if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rad);
      ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
      ctx.restore();
      return;
    }
  }

  if (isNaN(radius) || radius <= 0) {
    return;
  }

  ctx.beginPath();

  switch (style) {
  // Default includes circle
  default:
    if (w) {
      ctx.ellipse(x, y, w / 2, radius, 0, 0, TAU);
    } else {
      ctx.arc(x, y, radius, 0, TAU);
    }
    ctx.closePath();
    break;
  case 'triangle':
    width = w ? w / 2 : radius;
    ctx.moveTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
    rad += TWO_THIRDS_PI;
    ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
    rad += TWO_THIRDS_PI;
    ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
    ctx.closePath();
    break;
  case 'rectRounded':
    // NOTE: the rounded rect implementation changed to use `arc` instead of
    // `quadraticCurveTo` since it generates better results when rect is
    // almost a circle. 0.516 (instead of 0.5) produces results with visually
    // closer proportion to the previous impl and it is inscribed in the
    // circle with `radius`. For more details, see the following PRs:
    // https://github.com/chartjs/Chart.js/issues/5597
    // https://github.com/chartjs/Chart.js/issues/5858
    cornerRadius = radius * 0.516;
    size = radius - cornerRadius;
    xOffset = Math.cos(rad + QUARTER_PI) * size;
    xOffsetW = Math.cos(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
    yOffset = Math.sin(rad + QUARTER_PI) * size;
    yOffsetW = Math.sin(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
    ctx.arc(x - xOffsetW, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
    ctx.arc(x + yOffsetW, y - xOffset, cornerRadius, rad - HALF_PI, rad);
    ctx.arc(x + xOffsetW, y + yOffset, cornerRadius, rad, rad + HALF_PI);
    ctx.arc(x - yOffsetW, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
    ctx.closePath();
    break;
  case 'rect':
    if (!rotation) {
      size = Math.SQRT1_2 * radius;
      width = w ? w / 2 : size;
      ctx.rect(x - width, y - size, 2 * width, 2 * size);
      break;
    }
    rad += QUARTER_PI;
    /* falls through */
  case 'rectRot':
    xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
    xOffset = Math.cos(rad) * radius;
    yOffset = Math.sin(rad) * radius;
    yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
    ctx.moveTo(x - xOffsetW, y - yOffset);
    ctx.lineTo(x + yOffsetW, y - xOffset);
    ctx.lineTo(x + xOffsetW, y + yOffset);
    ctx.lineTo(x - yOffsetW, y + xOffset);
    ctx.closePath();
    break;
  case 'crossRot':
    rad += QUARTER_PI;
    /* falls through */
  case 'cross':
    xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
    xOffset = Math.cos(rad) * radius;
    yOffset = Math.sin(rad) * radius;
    yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
    ctx.moveTo(x - xOffsetW, y - yOffset);
    ctx.lineTo(x + xOffsetW, y + yOffset);
    ctx.moveTo(x + yOffsetW, y - xOffset);
    ctx.lineTo(x - yOffsetW, y + xOffset);
    break;
  case 'star':
    xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
    xOffset = Math.cos(rad) * radius;
    yOffset = Math.sin(rad) * radius;
    yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
    ctx.moveTo(x - xOffsetW, y - yOffset);
    ctx.lineTo(x + xOffsetW, y + yOffset);
    ctx.moveTo(x + yOffsetW, y - xOffset);
    ctx.lineTo(x - yOffsetW, y + xOffset);
    rad += QUARTER_PI;
    xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
    xOffset = Math.cos(rad) * radius;
    yOffset = Math.sin(rad) * radius;
    yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
    ctx.moveTo(x - xOffsetW, y - yOffset);
    ctx.lineTo(x + xOffsetW, y + yOffset);
    ctx.moveTo(x + yOffsetW, y - xOffset);
    ctx.lineTo(x - yOffsetW, y + xOffset);
    break;
  case 'line':
    xOffset = w ? w / 2 : Math.cos(rad) * radius;
    yOffset = Math.sin(rad) * radius;
    ctx.moveTo(x - xOffset, y - yOffset);
    ctx.lineTo(x + xOffset, y + yOffset);
    break;
  case 'dash':
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(rad) * (w ? w / 2 : radius), y + Math.sin(rad) * radius);
    break;
  case false:
    ctx.closePath();
    break;
  }

  ctx.fill();
  if (options.borderWidth > 0) {
    ctx.stroke();
  }
}

/**
 * Returns true if the point is inside the rectangle
 * @param {Point} point - The point to test
 * @param {object} area - The rectangle
 * @param {number} [margin] - allowed margin
 * @returns {boolean}
 * @private
 */
export function _isPointInArea(point, area, margin) {
  margin = margin || 0.5; // margin - default is to match rounded decimals

  return !area || (point && point.x > area.left - margin && point.x < area.right + margin &&
		point.y > area.top - margin && point.y < area.bottom + margin);
}

export function clipArea(ctx, area) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
  ctx.clip();
}

export function unclipArea(ctx) {
  ctx.restore();
}

/**
 * @private
 */
export function _steppedLineTo(ctx, previous, target, flip, mode) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  if (mode === 'middle') {
    const midpoint = (previous.x + target.x) / 2.0;
    ctx.lineTo(midpoint, previous.y);
    ctx.lineTo(midpoint, target.y);
  } else if (mode === 'after' !== !!flip) {
    ctx.lineTo(previous.x, target.y);
  } else {
    ctx.lineTo(target.x, previous.y);
  }
  ctx.lineTo(target.x, target.y);
}

/**
 * @private
 */
export function _bezierCurveTo(ctx, previous, target, flip) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  ctx.bezierCurveTo(
    flip ? previous.cp1x : previous.cp2x,
    flip ? previous.cp1y : previous.cp2y,
    flip ? target.cp2x : target.cp1x,
    flip ? target.cp2y : target.cp1y,
    target.x,
    target.y);
}

/**
 * Render text onto the canvas
 */
export function renderText(ctx, text, x, y, font, opts = {}) {
  const lines = isArray(text) ? text : [text];
  const stroke = opts.strokeWidth > 0 && opts.strokeColor !== '';
  let i, line;

  ctx.save();
  ctx.font = font.string;
  setRenderOpts(ctx, opts);

  for (i = 0; i < lines.length; ++i) {
    line = lines[i];

    if (opts.backdrop) {
      drawBackdrop(ctx, opts.backdrop);
    }

    if (stroke) {
      if (opts.strokeColor) {
        ctx.strokeStyle = opts.strokeColor;
      }

      if (!isNullOrUndef(opts.strokeWidth)) {
        ctx.lineWidth = opts.strokeWidth;
      }

      ctx.strokeText(line, x, y, opts.maxWidth);
    }

    ctx.fillText(line, x, y, opts.maxWidth);
    decorateText(ctx, x, y, line, opts);

    y += font.lineHeight;
  }

  ctx.restore();
}

function setRenderOpts(ctx, opts) {
  if (opts.translation) {
    ctx.translate(opts.translation[0], opts.translation[1]);
  }

  if (!isNullOrUndef(opts.rotation)) {
    ctx.rotate(opts.rotation);
  }

  if (opts.color) {
    ctx.fillStyle = opts.color;
  }

  if (opts.textAlign) {
    ctx.textAlign = opts.textAlign;
  }

  if (opts.textBaseline) {
    ctx.textBaseline = opts.textBaseline;
  }
}

function decorateText(ctx, x, y, line, opts) {
  if (opts.strikethrough || opts.underline) {
    /**
     * Now that IE11 support has been dropped, we can use more
     * of the TextMetrics object. The actual bounding boxes
     * are unflagged in Chrome, Firefox, Edge, and Safari so they
     * can be safely used.
     * See https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics#Browser_compatibility
     */
    const metrics = ctx.measureText(line);
    const left = x - metrics.actualBoundingBoxLeft;
    const right = x + metrics.actualBoundingBoxRight;
    const top = y - metrics.actualBoundingBoxAscent;
    const bottom = y + metrics.actualBoundingBoxDescent;
    const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;

    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.lineWidth = opts.decorationWidth || 2;
    ctx.moveTo(left, yDecoration);
    ctx.lineTo(right, yDecoration);
    ctx.stroke();
  }
}

function drawBackdrop(ctx, opts) {
  const oldColor = ctx.fillStyle;

  ctx.fillStyle = opts.color;
  ctx.fillRect(opts.left, opts.top, opts.width, opts.height);
  ctx.fillStyle = oldColor;
}

/**
 * Add a path of a rectangle with rounded corners to the current sub-path
 * @param {CanvasRenderingContext2D} ctx Context
 * @param {*} rect Bounding rect
 */
export function addRoundedRectPath(ctx, rect) {
  const {x, y, w, h, radius} = rect;

  // top left arc
  ctx.arc(x + radius.topLeft, y + radius.topLeft, radius.topLeft, -HALF_PI, PI, true);

  // line from top left to bottom left
  ctx.lineTo(x, y + h - radius.bottomLeft);

  // bottom left arc
  ctx.arc(x + radius.bottomLeft, y + h - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true);

  // line from bottom left to bottom right
  ctx.lineTo(x + w - radius.bottomRight, y + h);

  // bottom right arc
  ctx.arc(x + w - radius.bottomRight, y + h - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true);

  // line from bottom right to top right
  ctx.lineTo(x + w, y + radius.topRight);

  // top right arc
  ctx.arc(x + w - radius.topRight, y + radius.topRight, radius.topRight, 0, -HALF_PI, true);

  // line from top right to top left
  ctx.lineTo(x + radius.topLeft, y);
}
