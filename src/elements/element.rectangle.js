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

function drawLines(ctx, lines) {
	var i = 0;
	var ilen = lines.length;
	var line, prevLine;

	for (; i < ilen; ++i) {
		line = lines[i];
		if (i === 0 || prevLine.w !== line.w) {
			if (i > 0) {
				ctx.stroke();
			}
			ctx.beginPath();
			ctx.lineWidth = line.w;
		}
		if (i === 0 || prevLine.x2 !== line.x1 || prevLine.y2 !== line.y1) {
			ctx.moveTo(line.x1, line.y1);
		}
		ctx.lineTo(line.x2, line.y2);
		prevLine = line;
	}
	if (ilen) {
		ctx.stroke();
	}
}

// eslint-disable-next-line complexity
function buildBorderLines(rect, width, offset) {
	var lines = [];
	var halfOffsetLeft = offset.left / 2;
	var halfOffsetRight = offset.right / 2;
	var halfOffsetTop = offset.top / 2;
	var halfOffsetBottom = offset.bottom / 2;

	if (width.bottom) {
		lines.push({
			w: width.bottom,
			x1: rect.right,
			y1: rect.bottom + halfOffsetBottom,
			x2: rect.left + (width.bottom === width.left ? halfOffsetLeft : offset.left),
			y2: rect.bottom + halfOffsetBottom
		});
	}
	if (width.left) {
		lines.push({
			w: width.left,
			x1: rect.left + halfOffsetLeft,
			y1: rect.bottom + (width.bottom === width.left ? halfOffsetBottom : 0),
			x2: rect.left + halfOffsetLeft,
			y2: rect.top + (width.left === width.top ? halfOffsetTop : offset.top)
		});
	}
	if (width.top) {
		lines.push({
			w: width.top,
			x1: rect.left + (width.left === width.top ? halfOffsetLeft : 0),
			y1: rect.top + halfOffsetTop,
			x2: rect.right + (width.top === width.right ? halfOffsetRight : offset.right),
			y2: rect.top + halfOffsetTop
		});
	}
	if (width.right) {
		lines.push({
			w: width.right,
			x1: rect.right + halfOffsetRight,
			y1: rect.top + (width.top === width.right ? halfOffsetTop : 0),
			x2: rect.right + halfOffsetRight,
			y2: rect.bottom + offset.bottom
		});
	}
	return lines;
}

function parseBorderWidth(borderWidth, borderSkipped, maxWidth, maxHeight) {
	if (helpers.isObject(borderWidth)) {
		return {
			bottom: Math.min(borderWidth.bottom || 0, maxHeight),
			left: Math.min(borderWidth.left || 0, maxWidth),
			top: Math.min(borderWidth.top || 0, maxHeight),
			right: Math.min(borderWidth.right || 0, maxWidth)
		};
	}

	maxWidth = Math.min(borderWidth, maxWidth);
	maxHeight = Math.min(borderWidth, maxHeight);
	return {
		bottom: borderSkipped === 'bottom' ? 0 : maxHeight,
		left: borderSkipped === 'left' ? 0 : maxWidth,
		top: borderSkipped === 'top' ? 0 : maxHeight,
		right: borderSkipped === 'right' ? 0 : maxWidth
	};
}

module.exports = Element.extend({
	draw: function() {
		var ctx = this._chart.ctx;
		var vm = this._view;
		var borderWidth = vm.borderWidth;
		var left, right, top, bottom, signX, signY, borderSkipped, offset;

		if (!vm.horizontal) {
			// bar
			left = vm.x - vm.width / 2;
			right = vm.x + vm.width / 2;
			top = vm.y;
			bottom = vm.base;
			signX = 1;
			signY = bottom > top ? 1 : -1;
			borderSkipped = valueOrDefault(vm.borderSkipped, 'bottom');
		} else {
			// horizontal bar
			left = vm.base;
			right = vm.x;
			top = vm.y - vm.height / 2;
			bottom = vm.y + vm.height / 2;
			signX = right > left ? 1 : -1;
			signY = 1;
			borderSkipped = valueOrDefault(vm.borderSkipped, 'left');
		}

		ctx.fillStyle = vm.backgroundColor;
		ctx.strokeStyle = vm.borderColor;

		if (!borderWidth) {
			ctx.fillRect(left, bottom, right - left, top - bottom);
			return;
		}

		borderWidth = parseBorderWidth(
			borderWidth,
			borderSkipped,
			Math.abs(left - right) / 2,
			Math.abs(top - bottom) / 2);

		offset = {
			left: borderWidth.left * signX,
			right: borderWidth.right * -signX,
			top: borderWidth.top * signY,
			bottom: borderWidth.bottom * -signY,
		};

		ctx.fillRect(
			left + offset.left,
			bottom + offset.bottom,
			right + offset.right - left - offset.left,
			top + offset.top - bottom - offset.bottom);

		drawLines(ctx,
			buildBorderLines({
				left: left,
				top: top,
				right: right,
				bottom: bottom
			}, borderWidth, offset)
		);
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
