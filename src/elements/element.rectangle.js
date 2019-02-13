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
	var x1, x2, y1, y2, half;

	if (isVertical(bar)) {
		// vertical
		half = vm.width / 2;
		x1 = vm.x - half;
		x2 = vm.x + half;
		y1 = Math.min(vm.y, vm.base);
		y2 = Math.max(vm.y, vm.base);
	} else {
		// horizontal bar
		half = vm.height / 2;
		x1 = Math.min(vm.x, vm.base);
		x2 = Math.max(vm.x, vm.base);
		y1 = vm.y - half;
		y2 = vm.y + half;
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

	if (!ilen) {
		return;
	}

	prevLine = lines[0];
	ctx.beginPath();
	ctx.lineWidth = prevLine.w;

	for (; i < ilen; ++i) {
		line = lines[i];
		if (prevLine.w !== line.w) {
			ctx.stroke();
			ctx.beginPath();
			ctx.lineWidth = line.w;
		}
		if (prevLine.x2 !== line.x1 || prevLine.y2 !== line.y1) {
			ctx.moveTo(line.x1, line.y1);
		}
		ctx.lineTo(line.x2, line.y2);
		prevLine = line;
	}
	ctx.stroke();
}

// eslint-disable-next-line complexity
function buildBorderLines(rect, width) {
	var lines = [];
	var halfLeft = width.left / 2;
	var halfRight = width.right / 2;
	var halfTop = width.top / 2;
	var halfBottom = width.bottom / 2;

	if (width.bottom) {
		lines.push({
			w: width.bottom,
			x1: rect.right,
			y1: rect.bottom - halfBottom,
			x2: rect.left + (width.bottom === width.left ? halfLeft : width.left),
			y2: rect.bottom - halfBottom
		});
	}
	if (width.left) {
		lines.push({
			w: width.left,
			x1: rect.left + halfLeft,
			y1: rect.bottom - (width.bottom === width.left ? halfBottom : 0),
			x2: rect.left + halfLeft,
			y2: rect.top + (width.left === width.top ? halfTop : width.top)
		});
	}
	if (width.top) {
		lines.push({
			w: width.top,
			x1: rect.left + (width.left === width.top ? halfLeft : 0),
			y1: rect.top + halfTop,
			x2: rect.right - (width.top === width.right ? halfRight : width.right),
			y2: rect.top + halfTop
		});
	}
	if (width.right) {
		lines.push({
			w: width.right,
			x1: rect.right - halfRight,
			y1: rect.top + (width.top === width.right ? halfTop : 0),
			x2: rect.right - halfRight,
			y2: rect.bottom - width.bottom
		});
	}
	return lines;
}

function parseBorderWidth(value, skipped, maxWidth, maxHeight) {
	var t, r, b, l;

	if (helpers.isObject(value)) {
		t = +value.top || 0;
		r = +value.right || 0;
		b = +value.bottom || 0;
		l = +value.left || 0;
	} else {
		t = r = b = l = +value || 0;
	}

	return {
		top: Math.min(maxHeight, skipped === 'top' ? 0 : t),
		right: Math.min(maxWidth, skipped === 'right' ? 0 : r),
		bottom: Math.min(maxHeight, skipped === 'bottom' ? 0 : b),
		left: Math.min(maxWidth, skipped === 'left' ? 0 : l)
	};
}

function flip(orig, v1, v2) {
	return orig === v1 ? v2 : orig === v2 ? v1 : orig;
}

function parseBorderSkipped(bar) {
	var vm = bar._view;
	var vertical = isVertical(bar);
	var borderSkipped = valueOrDefault(vm.borderSkipped, vertical ? 'bottom' : 'left');

	if (vertical && vm.base < vm.y) {
		borderSkipped = flip(borderSkipped, 'bottom', 'top');
	}
	if (!vertical && vm.base > vm.x) {
		borderSkipped = flip(borderSkipped, 'left', 'right');
	}
	return borderSkipped;
}

module.exports = Element.extend({
	draw: function() {
		var me = this;
		var ctx = me._chart.ctx;
		var vm = me._view;
		var borderWidth = vm.borderWidth;
		var bounds = getBarBounds(me);
		var left = bounds.left;
		var top = bounds.top;
		var width = bounds.right - left;
		var height = bounds.bottom - top;

		ctx.fillStyle = vm.backgroundColor;
		ctx.strokeStyle = vm.borderColor;

		if (!borderWidth) {
			ctx.fillRect(left, top, width, height);
			return;
		}

		borderWidth = parseBorderWidth(
			borderWidth,
			parseBorderSkipped(me),
			width / 2,
			height / 2);

		ctx.fillRect(
			left + borderWidth.left,
			top + borderWidth.top,
			width - borderWidth.left - borderWidth.right,
			height - borderWidth.top - borderWidth.bottom);

		drawLines(ctx, buildBorderLines(bounds, borderWidth));
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
