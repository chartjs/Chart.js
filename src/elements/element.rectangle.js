'use strict';

var defaults = require('../core/core.defaults');
var Element = require('../core/core.element');
var helpers = require('../helpers/index');

var defaultColor = defaults.global.defaultColor;

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
		half = vm.width / 2;
		x1 = vm.x - half;
		x2 = vm.x + half;
		y1 = Math.min(vm.y, vm.base);
		y2 = Math.max(vm.y, vm.base);
	} else {
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

function swap(orig, v1, v2) {
	return orig === v1 ? v2 : orig === v2 ? v1 : orig;
}

function parseBorderSkipped(bar) {
	var vm = bar._view;
	var edge = vm.borderSkipped;
	var res = {};

	if (!edge) {
		return res;
	}

	if (isVertical(bar)) {
		if (vm.base < vm.y) {
			edge = swap(edge, 'bottom', 'top');
		}
	} else if (vm.base > vm.x) {
		edge = swap(edge, 'left', 'right');
	}

	res[edge] = true;
	return res;
}

function parseBorderWidth(value, bar, maxWidth, maxHeight) {
	var _skip = parseBorderSkipped(bar);
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
		top: _skip.top || (t < 0) ? 0 : t > maxHeight ? maxHeight : t,
		right: _skip.right || (r < 0) ? 0 : r > maxWidth ? maxWidth : r,
		bottom: _skip.bottom || (b < 0) ? 0 : b > maxWidth ? maxWidth : b,
		left: _skip.left || (l < 0) ? 0 : l > maxWidth ? maxWidth : l
	};
}

module.exports = Element.extend({
	draw: function() {
		var me = this;
		var ctx = me._chart.ctx;
		var vm = me._view;
		var bounds = getBarBounds(me);
		var left = bounds.left;
		var top = bounds.top;
		var width = bounds.right - left;
		var height = bounds.bottom - top;
		var border = parseBorderWidth(vm.borderWidth, me, width / 2, height / 2);
		var bLeft = border.left;
		var bTop = border.top;
		var bRight = border.right;
		var bBottom = border.bottom;
		var maxBorder = Math.max(bLeft, bTop, bRight, bBottom);
		var halfBorder = maxBorder / 2;
		var inner = {
			left: left + bLeft,
			top: top + bTop,
			width: width - bLeft - bRight,
			height: height - bBottom - bTop
		};

		ctx.fillStyle = vm.backgroundColor;

		if (!maxBorder) {
			ctx.fillRect(left, top, width, height);
			return;
		}

		ctx.fillRect(inner.left, inner.top, inner.width, inner.height);

		// offset inner rectangle by half of widest border
		// move edges additional 1px out, where there is no border, to prevent artifacts
		inner.left -= halfBorder + (bLeft ? 0 : 1);
		inner.top -= halfBorder + (bTop ? 0 : 1);
		inner.width += maxBorder + (bLeft ? 0 : 1) + (bRight ? 0 : 1);
		inner.height += maxBorder + (bTop ? 0 : 1) + (bBottom ? 0 : 1);

		ctx.save();
		ctx.beginPath();
		ctx.rect(left, top, width, height);
		ctx.clip();
		ctx.beginPath();
		ctx.rect(inner.left, inner.top, inner.width, inner.height);
		ctx.lineWidth = maxBorder + 1; // + 1 to prevent artifacts
		ctx.strokeStyle = vm.borderColor;
		ctx.stroke();
		ctx.restore();
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
