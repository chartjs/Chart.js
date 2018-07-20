'use strict';

var helpers = require('./helpers.core');

/**
 * @namespace Chart.helpers.canvas
 */
var exports = module.exports = {
	/**
	 * Clears the entire canvas associated to the given `chart`.
	 * @param {Chart} chart - The chart for which to clear the canvas.
	 */
	clear: function(chart) {
		chart.ctx.clearRect(0, 0, chart.width, chart.height);
	},

	/**
	 * Creates a "path" for a rectangle with rounded corners at position (x, y) with a
	 * given size (width, height) and the same `radius` for all corners.
	 * @param {CanvasRenderingContext2D} ctx - The canvas 2D Context.
	 * @param {Number} x - The x axis of the coordinate for the rectangle starting point.
	 * @param {Number} y - The y axis of the coordinate for the rectangle starting point.
	 * @param {Number} width - The rectangle's width.
	 * @param {Number} height - The rectangle's height.
	 * @param {Number} radius - The rounded amount (in pixels) for the four corners.
	 * @todo handle `radius` as top-left, top-right, bottom-right, bottom-left array/object?
	 */
	roundedRect: function(ctx, x, y, width, height, radius) {
		if (radius) {
			// NOTE(SB) `epsilon` helps to prevent minor artifacts appearing
			// on Chrome when `r` is exactly half the height or the width.
			var epsilon = 0.0000001;
			var r = Math.min(radius, (height / 2) - epsilon, (width / 2) - epsilon);

			ctx.moveTo(x + r, y);
			ctx.lineTo(x + width - r, y);
			ctx.arcTo(x + width, y, x + width, y + r, r);
			ctx.lineTo(x + width, y + height - r);
			ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
			ctx.lineTo(x + r, y + height);
			ctx.arcTo(x, y + height, x, y + height - r, r);
			ctx.lineTo(x, y + r);
			ctx.arcTo(x, y, x + r, y, r);
		} else {
			ctx.rect(x, y, width, height);
		}
	},

	drawPoint: function(ctx, style, radius, x, y, rotation) {
		// call draw Symbol with converted radius to width and height
		// and move x, y to the top left corner

		if (this.drawSymbol(ctx, style, radius * 2, radius * 2, x - radius, y - radius, rotation)) {
			// Only Stroke when return true
			ctx.stroke();
			if (rotation) {
				ctx.restore();
			}
		}
	},

	drawSymbol: function(ctx, style, width, height, x, y, rotation) {

		if (style && typeof style === 'object') {
			var type = style.toString();
			if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
				ctx.drawImage(style, x, y, style.width, style.height);
				return false;
			}
		}
		if (isNaN(width) || width <= 0) {
			return false;
		}
		var vx, vy;
		if (rotation) {
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(rotation * Math.PI / 180);
			vx = 0;
			vy = 0;
		} else {
			vx = x;
			vy = y;
		}

		ctx.beginPath();

		switch (style) {
		// Default circle
		default:
			//	display standard circle if height and width are the same otherwise display a RectRounded
			if (width === height) {
				ctx.arc(vx + width / 2, vy + height / 2, width / 2, 0, Math.PI * 2);
			} else {
				this.roundedRect(ctx, vx, vy, width, height, width / 2);
			}
			ctx.closePath();
			ctx.fill();
			break;
		case 'rect':
			ctx.rect(vx, vy, width, height);
			ctx.closePath();
			ctx.fill();
			break;
		case 'triangle':
			ctx.moveTo(vx, vy + height);
			ctx.lineTo(vx + width / 2, vy);
			ctx.lineTo(vx + width, vy + height);
			ctx.closePath();
			ctx.fill();
			break;
		case 'rectRounded':
			this.roundedRect(ctx, vx, vy, width, height, height * Math.SQRT2 / 4);
			ctx.closePath();
			ctx.fill();
			break;
		case 'rectRot':
			ctx.moveTo(vx, vy + height / 2);
			ctx.lineTo(vx + width / 2, vy);
			ctx.lineTo(vx + width, vy + height / 2);
			ctx.lineTo(vx + width / 2, vy + height);
			ctx.closePath();
			ctx.fill();
			break;
		case 'cross':
			ctx.moveTo(vx + width / 2, vy);
			ctx.lineTo(vx + width / 2, vy + height);
			ctx.moveTo(vx, vy + height / 2);
			ctx.lineTo(vx + width, vy + height / 2);
			ctx.closePath();
			break;
		case 'crossRot':
			ctx.moveTo(vx, vy);
			ctx.lineTo(vx + width, vy + height);
			ctx.moveTo(vx, vy + height);
			ctx.lineTo(vx + width, vy);
			ctx.closePath();
			break;
		case 'star':
			ctx.moveTo(vx + width / 2, vy);
			ctx.lineTo(vx + width / 2, vy + height);
			ctx.moveTo(vx, vy + height / 2);
			ctx.lineTo(vx + width, vy + height / 2);
			ctx.moveTo(vx, vy);
			ctx.lineTo(vx + width, vy + height);
			ctx.moveTo(vx, vy + height);
			ctx.lineTo(vx + width, vy);
			ctx.closePath();
			break;
		case 'line':
			ctx.moveTo(vx, vy + height / 2);
			ctx.lineTo(vx + width, vy + height / 2);
			ctx.closePath();
			break;
		case 'dash':
			ctx.moveTo(vx + width / 2, vy + height / 2);
			ctx.lineTo(vx + width, vy + height / 2);
			ctx.closePath();
			break;
		}
		return true;

	},

	clipArea: function(ctx, area) {
		ctx.save();
		ctx.beginPath();
		ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
		ctx.clip();
	},

	unclipArea: function(ctx) {
		ctx.restore();
	},

	lineTo: function(ctx, previous, target, flip) {
		if (target.steppedLine) {
			if ((target.steppedLine === 'after' && !flip) || (target.steppedLine !== 'after' && flip)) {
				ctx.lineTo(previous.x, target.y);
			} else {
				ctx.lineTo(target.x, previous.y);
			}
			ctx.lineTo(target.x, target.y);
			return;
		}

		if (!target.tension) {
			ctx.lineTo(target.x, target.y);
			return;
		}

		ctx.bezierCurveTo(
			flip ? previous.controlPointPreviousX : previous.controlPointNextX,
			flip ? previous.controlPointPreviousY : previous.controlPointNextY,
			flip ? target.controlPointNextX : target.controlPointPreviousX,
			flip ? target.controlPointNextY : target.controlPointPreviousY,
			target.x,
			target.y);
	}
};

// DEPRECATIONS

/**
 * Provided for backward compatibility, use Chart.helpers.canvas.clear instead.
 * @namespace Chart.helpers.clear
 * @deprecated since version 2.7.0
 * @todo remove at version 3
 * @private
 */
helpers.clear = exports.clear;

/**
 * Provided for backward compatibility, use Chart.helpers.canvas.roundedRect instead.
 * @namespace Chart.helpers.drawRoundedRectangle
 * @deprecated since version 2.7.0
 * @todo remove at version 3
 * @private
 */
helpers.drawRoundedRectangle = function(ctx) {
	ctx.beginPath();
	exports.roundedRect.apply(exports, arguments);
	ctx.closePath();
};
