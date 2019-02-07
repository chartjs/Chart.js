'use strict';

var defaults = require('../core/core.defaults');
var Element = require('../core/core.element');
var helpers = require('../helpers/index');

var defaultColor = defaults.global.defaultColor;
var valueOrDefault = helpers.valueOrDefault;

defaults._set('global', {
	elements: {
		rectangle: {
			backgroundColor: defaultColor,
			borderColor: defaultColor,
			borderSkipped: 'bottom',
			borderWidth: 0
		}
	}
});

function isVertical(bar) {
	return bar._view.width !== undefined;
}

/**
 * Helper function to get the bounds of the bar regardless of the orientation
 * @param bar {Chart.Element.Rectangle} the bar
 * @return {Bounds} bounds of the bar
 * @private
 */
function getBarBounds(bar) {
	var vm = bar._view;
	var x1, x2, y1, y2;

	if (isVertical(bar)) {
		// vertical
		var halfWidth = vm.width / 2;
		x1 = vm.x - halfWidth;
		x2 = vm.x + halfWidth;
		y1 = Math.min(vm.y, vm.base);
		y2 = Math.max(vm.y, vm.base);
	} else {
		// horizontal bar
		var halfHeight = vm.height / 2;
		x1 = Math.min(vm.x, vm.base);
		x2 = Math.max(vm.x, vm.base);
		y1 = vm.y - halfHeight;
		y2 = vm.y + halfHeight;
	}

	return {
		left: x1,
		top: y1,
		right: x2,
		bottom: y2
	};
}

module.exports = Element.extend({
	draw: function() {
		var ctx = this._chart.ctx;
		var vm = this._view;
		var borderWidth = vm.borderWidth;
		var lineCount = 0;
		var width = 0;
		var left, right, top, bottom, signX, signY, borderSkipped;
		var maxWidth, maxHeight, prevWidth, nextWidth;

		if (!vm.horizontal) {
			// bar
			left = vm.x - vm.width / 2;
			right = vm.x + vm.width / 2;
			top = vm.y;
			bottom = vm.base;
			signX = 1;
			signY = bottom > top ? 1 : -1;
			borderSkipped = valueOrDefault(vm.borderSkipped, 'bottom') || '';
		} else {
			// horizontal bar
			left = vm.base;
			right = vm.x;
			top = vm.y - vm.height / 2;
			bottom = vm.y + vm.height / 2;
			signX = right > left ? 1 : -1;
			signY = 1;
			borderSkipped = valueOrDefault(vm.borderSkipped, 'left') || '';
		}

		ctx.fillStyle = vm.backgroundColor;
		ctx.strokeStyle = vm.borderColor;

		if (!borderWidth) {
			ctx.fillRect(left, bottom, right - left, top - bottom);
			return;
		}

		maxWidth = Math.abs(left - right) / 2;
		maxHeight = Math.abs(top - bottom) / 2;
		if (helpers.isObject(borderWidth)) {
			borderWidth = {
				bottom: Math.min(borderWidth.bottom || 0, maxHeight),
				left: Math.min(borderWidth.left || 0, maxWidth),
				top: Math.min(borderWidth.top || 0, maxHeight),
				right: Math.min(borderWidth.right || 0, maxWidth)
			};
		} else {
			maxWidth = Math.min(borderWidth, maxWidth);
			maxHeight = Math.min(borderWidth, maxHeight);
			borderWidth = {
				bottom: borderSkipped === 'bottom' ? 0 : maxHeight,
				left: borderSkipped === 'left' ? 0 : maxWidth,
				top: borderSkipped === 'top' ? 0 : maxHeight,
				right: borderSkipped === 'right' ? 0 : maxWidth
			};
		}

		ctx.fillRect(
			left + borderWidth.left * signX,
			bottom - borderWidth.bottom * signY,
			right - left - signX * (borderWidth.left + borderWidth.right),
			top - bottom + signY * (borderWidth.top + borderWidth.bottom));

		function drawBorder(w, x1, y1, x2, y2) {
			prevWidth = width;
			width = nextWidth;
			nextWidth = w;

			if (!width) {
				return;
			}

			if (lineCount === 0) {
				ctx.beginPath();
			}

			var vertical = x1 === x2;
			var sign1 = vertical ? y1 === top ? -1 : 1 : x1 === left ? 1 : -1;
			var sign2 = vertical ? y1 > y2 ? 1 : -1 : x1 > x2 ? 1 : -1;
			if (width === nextWidth) {
				sign2 /= 2;
			}

			if (ctx.lineWidth !== width) {
				if (lineCount) {
					ctx.stroke();
					ctx.beginPath();
					lineCount = 0;
				}
				ctx.lineWidth = width;
			}

			if (vertical) {
				x2 = x1 = x1 + sign1 * signX * width / 2;
				y2 += sign2 * nextWidth;
			} else {
				y1 = y2 = y1 + sign1 * signY * width / 2;
				x2 += sign2 * nextWidth;
			}

			if (prevWidth !== width) {
				ctx.moveTo(x1, y1);
			}

			ctx.lineTo(x2, y2);
			lineCount++;
		}

		nextWidth = borderWidth.bottom;
		drawBorder(borderWidth.left, right, bottom, left, bottom);
		drawBorder(borderWidth.top, left, bottom, left, top);
		drawBorder(borderWidth.right, left, top, right, top);
		drawBorder(borderWidth.bottom, right, top, right, bottom);
		if (lineCount) {
			ctx.stroke();
		}
	},

	height: function() {
		var vm = this._view;
		return vm.base - vm.y;
	},

	inRange: function(mouseX, mouseY) {
		var inRange = false;

		if (this._view) {
			var bounds = getBarBounds(this);
			inRange = mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom;
		}

		return inRange;
	},

	inLabelRange: function(mouseX, mouseY) {
		var me = this;
		if (!me._view) {
			return false;
		}

		var inRange = false;
		var bounds = getBarBounds(me);

		if (isVertical(me)) {
			inRange = mouseX >= bounds.left && mouseX <= bounds.right;
		} else {
			inRange = mouseY >= bounds.top && mouseY <= bounds.bottom;
		}

		return inRange;
	},

	inXRange: function(mouseX) {
		var bounds = getBarBounds(this);
		return mouseX >= bounds.left && mouseX <= bounds.right;
	},

	inYRange: function(mouseY) {
		var bounds = getBarBounds(this);
		return mouseY >= bounds.top && mouseY <= bounds.bottom;
	},

	getCenterPoint: function() {
		var vm = this._view;
		var x, y;
		if (isVertical(this)) {
			x = vm.x;
			y = (vm.y + vm.base) / 2;
		} else {
			x = (vm.x + vm.base) / 2;
			y = vm.y;
		}

		return {x: x, y: y};
	},

	getArea: function() {
		var vm = this._view;

		return isVertical(this)
			? vm.width * Math.abs(vm.y - vm.base)
			: vm.height * Math.abs(vm.x - vm.base);
	},

	tooltipPosition: function() {
		var vm = this._view;
		return {
			x: vm.x,
			y: vm.y
		};
	}
});
