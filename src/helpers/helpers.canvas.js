'use strict';

const PI = Math.PI;
const RAD_PER_DEG = PI / 180;
const DOUBLE_PI = PI * 2;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_THIRDS_PI = PI * 2 / 3;

/**
 * @namespace Chart.helpers.canvas
 */
/**
 * Returns the aligned pixel value to avoid anti-aliasing blur
 * @param {Chart} chart - The chart instance.
 * @param {number} pixel - A pixel value.
 * @param {number} width - The width of the element.
 * @returns {number} The aligned pixel value.
 * @private
 */
export function _alignPixel(chart, pixel, width) {
	const devicePixelRatio = chart.currentDevicePixelRatio;
	const halfWidth = width / 2;
	return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
}

/**
 * Clears the entire canvas associated to the given `chart`.
 * @param {Chart} chart - The chart for which to clear the canvas.
 */
export function clear(chart) {
	chart.ctx.clearRect(0, 0, chart.width, chart.height);
}

export function drawPoint(ctx, style, radius, x, y, rotation) {
	var type, xOffset, yOffset, size, cornerRadius;
	var rad = (rotation || 0) * RAD_PER_DEG;

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
		ctx.arc(x, y, radius, 0, DOUBLE_PI);
		ctx.closePath();
		break;
	case 'triangle':
		ctx.moveTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
		rad += TWO_THIRDS_PI;
		ctx.lineTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
		rad += TWO_THIRDS_PI;
		ctx.lineTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
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
		yOffset = Math.sin(rad + QUARTER_PI) * size;
		ctx.arc(x - xOffset, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
		ctx.arc(x + yOffset, y - xOffset, cornerRadius, rad - HALF_PI, rad);
		ctx.arc(x + xOffset, y + yOffset, cornerRadius, rad, rad + HALF_PI);
		ctx.arc(x - yOffset, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
		ctx.closePath();
		break;
	case 'rect':
		if (!rotation) {
			size = Math.SQRT1_2 * radius;
			ctx.rect(x - size, y - size, 2 * size, 2 * size);
			break;
		}
		rad += QUARTER_PI;
		/* falls through */
	case 'rectRot':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + yOffset, y - xOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		ctx.closePath();
		break;
	case 'crossRot':
		rad += QUARTER_PI;
		/* falls through */
	case 'cross':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.moveTo(x + yOffset, y - xOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		break;
	case 'star':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.moveTo(x + yOffset, y - xOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		rad += QUARTER_PI;
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.moveTo(x + yOffset, y - xOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		break;
	case 'line':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		break;
	case 'dash':
		ctx.moveTo(x, y);
		ctx.lineTo(x + Math.cos(rad) * radius, y + Math.sin(rad) * radius);
		break;
	}

	ctx.fill();
	ctx.stroke();
}

/**
 * Returns true if the point is inside the rectangle
 * @param {object} point - The point to test
 * @param {object} area - The rectangle
 * @returns {boolean}
 * @private
 */
export function _isPointInArea(point, area) {
	var epsilon = 1e-6; // 1e-6 is margin in pixels for accumulated error.

	return point.x > area.left - epsilon && point.x < area.right + epsilon &&
		point.y > area.top - epsilon && point.y < area.bottom + epsilon;
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
	if (mode === 'middle') {
		const midpoint = (previous.x + target.x) / 2.0;
		ctx.lineTo(midpoint, flip ? target.y : previous.y);
		ctx.lineTo(midpoint, flip ? previous.y : target.y);
	} else if ((mode === 'after' && !flip) || (mode !== 'after' && flip)) {
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
	ctx.bezierCurveTo(
		flip ? previous.controlPointPreviousX : previous.controlPointNextX,
		flip ? previous.controlPointPreviousY : previous.controlPointNextY,
		flip ? target.controlPointNextX : target.controlPointPreviousX,
		flip ? target.controlPointNextY : target.controlPointPreviousY,
		target.x,
		target.y);
}
