import defaults from '../core/core.defaults';
import {_longestText, renderText} from '../helpers/helpers.canvas';
import {HALF_PI, isNumber, TAU, toDegrees, toRadians, _normalizeAngle, PI} from '../helpers/helpers.math';
import LinearScaleBase from './scale.linearbase';
import Ticks from '../core/core.ticks';
import {valueOrDefault, isArray, isFinite, callback as callCallback, isNullOrUndef} from '../helpers/helpers.core';
import {createContext, toFont, toPadding} from '../helpers/helpers.options';

function getTickBackdropHeight(opts) {
  const tickOpts = opts.ticks;

  if (tickOpts.display && opts.display) {
    const padding = toPadding(tickOpts.backdropPadding);
    return valueOrDefault(tickOpts.font && tickOpts.font.size, defaults.font.size) + padding.height;
  }
  return 0;
}

function measureLabelSize(ctx, font, label) {
  label = isArray(label) ? label : [label];
  return {
    w: _longestText(ctx, font.string, label),
    h: label.length * font.lineHeight
  };
}

function determineLimits(angle, pos, size, min, max) {
  if (angle === min || angle === max) {
    return {
      start: pos - (size / 2),
      end: pos + (size / 2)
    };
  } else if (angle < min || angle > max) {
    return {
      start: pos - size,
      end: pos
    };
  }

  return {
    start: pos,
    end: pos + size
  };
}

/**
 * Helper function to fit a radial linear scale with point labels
 */
function fitWithPointLabels(scale) {

  // Right, this is really confusing and there is a lot of maths going on here
  // The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
  //
  // Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
  //
  // Solution:
  //
  // We assume the radius of the polygon is half the size of the canvas at first
  // at each index we check if the text overlaps.
  //
  // Where it does, we store that angle and that index.
  //
  // After finding the largest index and angle we calculate how much we need to remove
  // from the shape radius to move the point inwards by that x.
  //
  // We average the left and right distances to get the maximum shape radius that can fit in the box
  // along with labels.
  //
  // Once we have that, we can find the centre point for the chart, by taking the x text protrusion
  // on each side, removing that from the size, halving it and adding the left x protrusion width.
  //
  // This will mean we have a shape fitted to the canvas, as large as it can be with the labels
  // and position it in the most space efficient manner
  //
  // https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif

  // Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
  // Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
  const furthestLimits = {
    l: 0,
    r: scale.width,
    t: 0,
    b: scale.height - scale.paddingTop
  };
  const furthestAngles = {};
  const labelSizes = [];
  const padding = [];

  const valueCount = scale._pointLabels.length;
  for (let i = 0; i < valueCount; i++) {
    const opts = scale.options.pointLabels.setContext(scale.getPointLabelContext(i));
    padding[i] = opts.padding;
    const pointPosition = scale.getPointPosition(i, scale.drawingArea + padding[i]);
    const plFont = toFont(opts.font);
    const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i]);
    labelSizes[i] = textSize;

    const angleRadians = scale.getIndexAngle(i);
    const angle = toDegrees(angleRadians);
    const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
    const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);

    if (hLimits.start < furthestLimits.l) {
      furthestLimits.l = hLimits.start;
      furthestAngles.l = angleRadians;
    }

    if (hLimits.end > furthestLimits.r) {
      furthestLimits.r = hLimits.end;
      furthestAngles.r = angleRadians;
    }

    if (vLimits.start < furthestLimits.t) {
      furthestLimits.t = vLimits.start;
      furthestAngles.t = angleRadians;
    }

    if (vLimits.end > furthestLimits.b) {
      furthestLimits.b = vLimits.end;
      furthestAngles.b = angleRadians;
    }
  }

  scale._setReductions(scale.drawingArea, furthestLimits, furthestAngles);

  // Now that text size is determined, compute the full positions
  scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
}

function buildPointLabelItems(scale, labelSizes, padding) {
  const items = [];
  const valueCount = scale._pointLabels.length;
  const opts = scale.options;
  const tickBackdropHeight = getTickBackdropHeight(opts);
  const outerDistance = scale.getDistanceFromCenterForValue(opts.ticks.reverse ? scale.min : scale.max);
  const additionalAngle = opts.pointLabels.centerPointLabels ? PI / valueCount : 0;

  for (let i = 0; i < valueCount; i++) {
    // Extra pixels out for some label spacing
    const extra = (i === 0 ? tickBackdropHeight / 2 : 0);
    const pointLabelPosition = scale.getPointPosition(i, outerDistance + extra + padding[i], additionalAngle);
    const angle = toDegrees(pointLabelPosition.angle + HALF_PI);
    const size = labelSizes[i];
    const y = yForAngle(pointLabelPosition.y, size.h, angle);
    const textAlign = getTextAlignForAngle(angle);
    const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);

    items.push({
      // Text position
      x: pointLabelPosition.x,
      y,

      // Text rendering data
      textAlign,

      // Bounding box
      left,
      top: y,
      right: left + size.w,
      bottom: y + size.h
    });
  }
  return items;
}

function getTextAlignForAngle(angle) {
  if (angle === 0 || angle === 180) {
    return 'center';
  } else if (angle < 180) {
    return 'left';
  }

  return 'right';
}

function leftForTextAlign(x, w, align) {
  if (align === 'right') {
    x -= w;
  } else if (align === 'center') {
    x -= (w / 2);
  }
  return x;
}

function yForAngle(y, h, angle) {
  if (angle === 90 || angle === 270) {
    y -= (h / 2);
  } else if (angle > 270 || angle < 90) {
    y -= h;
  }
  return y;
}

function drawPointLabels(scale, labelCount) {
  const {ctx, options: {pointLabels}} = scale;

  for (let i = labelCount - 1; i >= 0; i--) {
    const optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i));
    const plFont = toFont(optsAtIndex.font);
    const {x, y, textAlign, left, top, right, bottom} = scale._pointLabelItems[i];
    const {backdropColor} = optsAtIndex;

    if (!isNullOrUndef(backdropColor)) {
      const padding = toPadding(optsAtIndex.backdropPadding);
      ctx.fillStyle = backdropColor;
      ctx.fillRect(left - padding.left, top - padding.top, right - left + padding.width, bottom - top + padding.height);
    }

    renderText(
      ctx,
      scale._pointLabels[i],
      x,
      y + (plFont.lineHeight / 2),
      plFont,
      {
        color: optsAtIndex.color,
        textAlign: textAlign,
        textBaseline: 'middle'
      }
    );
  }
}

function pathRadiusLine(scale, radius, circular, labelCount) {
  const {ctx} = scale;
  if (circular) {
    // Draw circular arcs between the points
    ctx.arc(scale.xCenter, scale.yCenter, radius, 0, TAU);
  } else {
    // Draw straight lines connecting each index
    let pointPosition = scale.getPointPosition(0, radius);
    ctx.moveTo(pointPosition.x, pointPosition.y);

    for (let i = 1; i < labelCount; i++) {
      pointPosition = scale.getPointPosition(i, radius);
      ctx.lineTo(pointPosition.x, pointPosition.y);
    }
  }
}

function drawRadiusLine(scale, gridLineOpts, radius, labelCount) {
  const ctx = scale.ctx;
  const circular = gridLineOpts.circular;

  const {color, lineWidth} = gridLineOpts;

  if ((!circular && !labelCount) || !color || !lineWidth || radius < 0) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(gridLineOpts.borderDash);
  ctx.lineDashOffset = gridLineOpts.borderDashOffset;

  ctx.beginPath();
  pathRadiusLine(scale, radius, circular, labelCount);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function numberOrZero(param) {
  return isNumber(param) ? param : 0;
}

function createPointLabelContext(parent, index, label) {
  return createContext(parent, {
    label,
    index,
    type: 'pointLabel'
  });
}

export default class RadialLinearScale extends LinearScaleBase {

  constructor(cfg) {
    super(cfg);

    /** @type {number} */
    this.xCenter = undefined;
    /** @type {number} */
    this.yCenter = undefined;
    /** @type {number} */
    this.drawingArea = undefined;
    /** @type {string[]} */
    this._pointLabels = [];
    this._pointLabelItems = [];
  }

  setDimensions() {
    // Set the unconstrained dimension before label rotation
    this.width = this.maxWidth;
    this.height = this.maxHeight;
    this.paddingTop = getTickBackdropHeight(this.options) / 2;
    this.xCenter = Math.floor(this.width / 2);
    this.yCenter = Math.floor((this.height - this.paddingTop) / 2);
    this.drawingArea = Math.min(this.height - this.paddingTop, this.width) / 2;
  }

  determineDataLimits() {
    const {min, max} = this.getMinMax(false);

    this.min = isFinite(min) && !isNaN(min) ? min : 0;
    this.max = isFinite(max) && !isNaN(max) ? max : 0;

    // Common base implementation to handle min, max, beginAtZero
    this.handleTickRangeOptions();
  }

  /**
	 * Returns the maximum number of ticks based on the scale dimension
	 * @protected
	 */
  computeTickLimit() {
    return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
  }

  generateTickLabels(ticks) {
    LinearScaleBase.prototype.generateTickLabels.call(this, ticks);

    // Point labels
    this._pointLabels = this.getLabels()
      .map((value, index) => {
        const label = callCallback(this.options.pointLabels.callback, [value, index], this);
        return label || label === 0 ? label : '';
      })
      .filter((v, i) => this.chart.getDataVisibility(i));
  }

  fit() {
    const opts = this.options;

    if (opts.display && opts.pointLabels.display) {
      fitWithPointLabels(this);
    } else {
      this.setCenterPoint(0, 0, 0, 0);
    }
  }

  /**
	 * Set radius reductions and determine new radius and center point
	 * @private
	 */
  _setReductions(largestPossibleRadius, furthestLimits, furthestAngles) {
    let radiusReductionLeft = furthestLimits.l / Math.sin(furthestAngles.l);
    let radiusReductionRight = Math.max(furthestLimits.r - this.width, 0) / Math.sin(furthestAngles.r);
    let radiusReductionTop = -furthestLimits.t / Math.cos(furthestAngles.t);
    let radiusReductionBottom = -Math.max(furthestLimits.b - (this.height - this.paddingTop), 0) / Math.cos(furthestAngles.b);

    radiusReductionLeft = numberOrZero(radiusReductionLeft);
    radiusReductionRight = numberOrZero(radiusReductionRight);
    radiusReductionTop = numberOrZero(radiusReductionTop);
    radiusReductionBottom = numberOrZero(radiusReductionBottom);

    this.drawingArea = Math.max(largestPossibleRadius / 2, Math.min(
      Math.floor(largestPossibleRadius - (radiusReductionLeft + radiusReductionRight) / 2),
      Math.floor(largestPossibleRadius - (radiusReductionTop + radiusReductionBottom) / 2)));
    this.setCenterPoint(radiusReductionLeft, radiusReductionRight, radiusReductionTop, radiusReductionBottom);
  }

  setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
    const maxRight = this.width - rightMovement - this.drawingArea;
    const maxLeft = leftMovement + this.drawingArea;
    const maxTop = topMovement + this.drawingArea;
    const maxBottom = (this.height - this.paddingTop) - bottomMovement - this.drawingArea;

    this.xCenter = Math.floor(((maxLeft + maxRight) / 2) + this.left);
    this.yCenter = Math.floor(((maxTop + maxBottom) / 2) + this.top + this.paddingTop);
  }

  getIndexAngle(index) {
    const angleMultiplier = TAU / this._pointLabels.length;
    const startAngle = this.options.startAngle || 0;
    const indexAngle = _normalizeAngle(index * angleMultiplier + toRadians(startAngle));

    return this._pointLabels.length === 0 ? startAngle : indexAngle;
  }

  getDistanceFromCenterForValue(value) {
    if (isNullOrUndef(value)) {
      return NaN;
    }

    // Take into account half font size + the yPadding of the top value
    const scalingFactor = this.drawingArea / (this.max - this.min);
    if (this.options.reverse) {
      return (this.max - value) * scalingFactor;
    }
    return (value - this.min) * scalingFactor;
  }

  getValueForDistanceFromCenter(distance) {
    if (isNullOrUndef(distance)) {
      return NaN;
    }

    const scaledDistance = distance / (this.drawingArea / (this.max - this.min));
    return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
  }

  getPointLabelContext(index) {
    const pointLabels = this._pointLabels || [];

    if (index >= 0 && index < pointLabels.length) {
      const pointLabel = pointLabels[index];
      return createPointLabelContext(this.getContext(), index, pointLabel);
    }
  }

  getPointPosition(index, distanceFromCenter, additionalAngle = 0) {
    const angle = this.getIndexAngle(index) - HALF_PI + additionalAngle;
    return {
      x: Math.cos(angle) * distanceFromCenter + this.xCenter,
      y: Math.sin(angle) * distanceFromCenter + this.yCenter,
      angle
    };
  }

  getPointPositionForValue(index, value) {
    return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
  }

  getBasePosition(index) {
    return this.getPointPositionForValue(index || 0, this.getBaseValue());
  }

  getPointLabelPosition(index) {
    const {left, top, right, bottom} = this._pointLabelItems[index];
    return {
      left,
      top,
      right,
      bottom,
    };
  }

  /**
	 * @protected
	 */
  drawBackground() {
    const {backgroundColor, grid: {circular}} = this.options;
    if (backgroundColor) {
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this._pointLabels.length);
      ctx.closePath();
      ctx.fillStyle = backgroundColor;
      ctx.fill();
      ctx.restore();
    }
  }

  /**
	 * @protected
	 */
  drawGrid() {
    const ctx = this.ctx;
    const opts = this.options;
    const {angleLines, grid} = opts;
    const labelCount = this._pointLabels.length;

    let i, offset, position;

    if (opts.pointLabels.display) {
      drawPointLabels(this, labelCount);
    }

    if (grid.display) {
      this.ticks.forEach((tick, index) => {
        if (index !== 0) {
          offset = this.getDistanceFromCenterForValue(tick.value);
          const optsAtIndex = grid.setContext(this.getContext(index - 1));
          drawRadiusLine(this, optsAtIndex, offset, labelCount);
        }
      });
    }

    if (angleLines.display) {
      ctx.save();

      for (i = labelCount - 1; i >= 0; i--) {
        const optsAtIndex = angleLines.setContext(this.getPointLabelContext(i));
        const {color, lineWidth} = optsAtIndex;

        if (!lineWidth || !color) {
          continue;
        }

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;

        ctx.setLineDash(optsAtIndex.borderDash);
        ctx.lineDashOffset = optsAtIndex.borderDashOffset;

        offset = this.getDistanceFromCenterForValue(opts.ticks.reverse ? this.min : this.max);
        position = this.getPointPosition(i, offset);
        ctx.beginPath();
        ctx.moveTo(this.xCenter, this.yCenter);
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  /**
	 * @protected
	 */
  drawBorder() {}

  /**
	 * @protected
	 */
  drawLabels() {
    const ctx = this.ctx;
    const opts = this.options;
    const tickOpts = opts.ticks;

    if (!tickOpts.display) {
      return;
    }

    const startAngle = this.getIndexAngle(0);
    let offset, width;

    ctx.save();
    ctx.translate(this.xCenter, this.yCenter);
    ctx.rotate(startAngle);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    this.ticks.forEach((tick, index) => {
      if (index === 0 && !opts.reverse) {
        return;
      }

      const optsAtIndex = tickOpts.setContext(this.getContext(index));
      const tickFont = toFont(optsAtIndex.font);
      offset = this.getDistanceFromCenterForValue(this.ticks[index].value);

      if (optsAtIndex.showLabelBackdrop) {
        ctx.font = tickFont.string;
        width = ctx.measureText(tick.label).width;
        ctx.fillStyle = optsAtIndex.backdropColor;

        const padding = toPadding(optsAtIndex.backdropPadding);
        ctx.fillRect(
          -width / 2 - padding.left,
          -offset - tickFont.size / 2 - padding.top,
          width + padding.width,
          tickFont.size + padding.height
        );
      }

      renderText(ctx, tick.label, 0, -offset, tickFont, {
        color: optsAtIndex.color,
      });
    });

    ctx.restore();
  }

  /**
	 * @protected
	 */
  drawTitle() {}
}

RadialLinearScale.id = 'radialLinear';

/**
 * @type {any}
 */
RadialLinearScale.defaults = {
  display: true,

  // Boolean - Whether to animate scaling the chart from the centre
  animate: true,
  position: 'chartArea',

  angleLines: {
    display: true,
    lineWidth: 1,
    borderDash: [],
    borderDashOffset: 0.0
  },

  grid: {
    circular: false
  },

  startAngle: 0,

  // label settings
  ticks: {
    // Boolean - Show a backdrop to the scale label
    showLabelBackdrop: true,

    callback: Ticks.formatters.numeric
  },

  pointLabels: {
    backdropColor: undefined,

    // Number - The backdrop padding above & below the label in pixels
    backdropPadding: 2,

    // Boolean - if true, show point labels
    display: true,

    // Number - Point label font size in pixels
    font: {
      size: 10
    },

    // Function - Used to convert point labels
    callback(label) {
      return label;
    },

    // Number - Additionl padding between scale and pointLabel
    padding: 5,

    // Boolean - if true, center point labels to slices in polar chart
    centerPointLabels: false
  }
};

RadialLinearScale.defaultRoutes = {
  'angleLines.color': 'borderColor',
  'pointLabels.color': 'color',
  'ticks.color': 'color'
};

RadialLinearScale.descriptors = {
  angleLines: {
    _fallback: 'grid'
  }
};
