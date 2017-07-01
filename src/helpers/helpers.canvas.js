'use strict';

module.exports = function(Chart) {
	var helpers = Chart.helpers;

	/**
	 * @namespace Chart.helpers.canvas
	 */
	helpers.canvas = {
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
				var rx = Math.min(radius, width/2);
				var ry = Math.min(radius, height/2);

				ctx.moveTo(x + rx, y);
				ctx.lineTo(x + width - rx, y);
				ctx.quadraticCurveTo(x + width, y, x + width, y + ry);
				ctx.lineTo(x + width, y + height - ry);
				ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height);
				ctx.lineTo(x + rx, y + height);
				ctx.quadraticCurveTo(x, y + height, x, y + height - ry);
				ctx.lineTo(x, y + ry);
				ctx.quadraticCurveTo(x, y, x + rx, y);
			} else {
				ctx.rect(x, y, width, height);
			}
		}
	};

	helpers.canvas.drawPoint = function(ctx, pointStyle, radius, x, y) {
		var type, edgeLength, xOffset, yOffset, height, size;

		if (typeof pointStyle === 'object') {
			type = pointStyle.toString();
			if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
				ctx.drawImage(pointStyle, x - pointStyle.width / 2, y - pointStyle.height / 2, pointStyle.width, pointStyle.height);
				return;
			}
		}

		if (isNaN(radius) || radius <= 0) {
			return;
		}

		switch (pointStyle) {
		// Default includes circle
		default:
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fill();
			break;
		case 'triangle':
			ctx.beginPath();
			edgeLength = 3 * radius / Math.sqrt(3);
			height = edgeLength * Math.sqrt(3) / 2;
			ctx.moveTo(x - edgeLength / 2, y + height / 3);
			ctx.lineTo(x + edgeLength / 2, y + height / 3);
			ctx.lineTo(x, y - 2 * height / 3);
			ctx.closePath();
			ctx.fill();
			break;
		case 'rect':
			size = 1 / Math.SQRT2 * radius;
			ctx.beginPath();
			ctx.fillRect(x - size, y - size, 2 * size, 2 * size);
			ctx.strokeRect(x - size, y - size, 2 * size, 2 * size);
			break;
		case 'rectRounded':
			var offset = radius / Math.SQRT2;
			var leftX = x - offset;
			var topY = y - offset;
			var sideSize = Math.SQRT2 * radius;
			ctx.beginPath();
			this.roundedRect(ctx, leftX, topY, sideSize, sideSize, radius / 2);
			ctx.closePath();
			ctx.fill();
			break;
		case 'rectRot':
			size = 1 / Math.SQRT2 * radius;
			ctx.beginPath();
			ctx.moveTo(x - size, y);
			ctx.lineTo(x, y + size);
			ctx.lineTo(x + size, y);
			ctx.lineTo(x, y - size);
			ctx.closePath();
			ctx.fill();
			break;
		case 'cross':
			ctx.beginPath();
			ctx.moveTo(x, y + radius);
			ctx.lineTo(x, y - radius);
			ctx.moveTo(x - radius, y);
			ctx.lineTo(x + radius, y);
			ctx.closePath();
			break;
		case 'crossRot':
			ctx.beginPath();
			xOffset = Math.cos(Math.PI / 4) * radius;
			yOffset = Math.sin(Math.PI / 4) * radius;
			ctx.moveTo(x - xOffset, y - yOffset);
			ctx.lineTo(x + xOffset, y + yOffset);
			ctx.moveTo(x - xOffset, y + yOffset);
			ctx.lineTo(x + xOffset, y - yOffset);
			ctx.closePath();
			break;
		case 'star':
			ctx.beginPath();
			ctx.moveTo(x, y + radius);
			ctx.lineTo(x, y - radius);
			ctx.moveTo(x - radius, y);
			ctx.lineTo(x + radius, y);
			xOffset = Math.cos(Math.PI / 4) * radius;
			yOffset = Math.sin(Math.PI / 4) * radius;
			ctx.moveTo(x - xOffset, y - yOffset);
			ctx.lineTo(x + xOffset, y + yOffset);
			ctx.moveTo(x - xOffset, y + yOffset);
			ctx.lineTo(x + xOffset, y - yOffset);
			ctx.closePath();
			break;
		case 'line':
			ctx.beginPath();
			ctx.moveTo(x - radius, y);
			ctx.lineTo(x + radius, y);
			ctx.closePath();
			break;
		case 'dash':
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x + radius, y);
			ctx.closePath();
			break;
		}

		ctx.stroke();
	};

	helpers.canvas.clipArea = function(ctx, clipArea) {
		ctx.save();
		ctx.beginPath();
		ctx.rect(clipArea.left, clipArea.top, clipArea.right - clipArea.left, clipArea.bottom - clipArea.top);
		ctx.clip();
	};

	helpers.canvas.unclipArea = function(ctx) {
		ctx.restore();
	};

	helpers.canvas.lineTo = function(ctx, previous, target, flip) {
		if (target.steppedLine) {
			if (target.steppedLine === 'after') {
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
			flip? previous.controlPointPreviousX : previous.controlPointNextX,
			flip? previous.controlPointPreviousY : previous.controlPointNextY,
			flip? target.controlPointNextX : target.controlPointPreviousX,
			flip? target.controlPointNextY : target.controlPointPreviousY,
			target.x,
			target.y);
	};

	/**
	 * Provided for backward compatibility, use Chart.helpers.canvas instead.
	 * @namespace Chart.canvasHelpers
	 * @deprecated since version 2.6.0
	 * @todo remove at version 3
	 * @private
	 */
	Chart.canvasHelpers = helpers.canvas;

	/**
	 * Provided for backward compatibility, use Chart.helpers.canvas.clear instead.
	 * @namespace Chart.helpers.clear
	 * @deprecated since version 2.7.0
	 * @todo remove at version 3
	 * @private
	 */
	helpers.clear = helpers.canvas.clear;

	/**
	 * Provided for backward compatibility, use Chart.helpers.canvas.roundedRect instead.
	 * @namespace Chart.helpers.drawRoundedRectangle
	 * @deprecated since version 2.7.0
	 * @todo remove at version 3
	 * @private
	 */
	helpers.drawRoundedRectangle = function(ctx) {
		ctx.beginPath();
		helpers.canvas.roundedRect.apply(this, arguments);
		ctx.closePath();
	};
};
