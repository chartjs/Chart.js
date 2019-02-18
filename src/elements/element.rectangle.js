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
		var right = bounds.right;
		var bottom = bounds.bottom;
		var width = right - left;
		var height = bottom - top;
		var inner, maxLine, halfLine;

		ctx.fillStyle = vm.backgroundColor;

		if (!borderWidth) {
			ctx.fillRect(left, top, width, height);
			return;
		}

		borderWidth = parseBorderWidth(
			borderWidth,
			parseBorderSkipped(me),
			width / 2,
			height / 2);

		maxLine = Math.max(borderWidth.left, borderWidth.top, borderWidth.right, borderWidth.bottom);

		if (!maxLine) {
			ctx.fillRect(left, top, width, height);
			return;
		}

		inner = {
			left: left + borderWidth.left,
			top: top + borderWidth.top,
			width: width - borderWidth.left - borderWidth.right,
			height: height - borderWidth.bottom - borderWidth.top
		};

		ctx.fillRect(inner.left, inner.top, inner.width, inner.height);

		ctx.strokeStyle = vm.borderColor;

		// add 1 to max border width, so border is actually 0.5px wider
		// to hide artifacts
		ctx.lineWidth = maxLine + 1;

		// move edges 1px where there is no border, to prevent artifacts
		if (!borderWidth.left) {
			inner.left -= 1;
			inner.width += 1;
		}
		if (!borderWidth.right) {
			inner.width += 1;
		}
		if (!borderWidth.top) {
			inner.top -= 1;
			inner.height += 1;
		}
		if (!borderWidth.bottom) {
			inner.height += 1;
		}

		halfLine = maxLine / 2;
		inner = {
			left: inner.left - halfLine,
			top: inner.top - halfLine,
			width: inner.width + maxLine,
			height: inner.height + maxLine
		};

		ctx.save();
		ctx.beginPath();
		ctx.rect(left, top, width, height);
		ctx.clip();
		ctx.beginPath();
		ctx.rect(inner.left, inner.top, inner.width, inner.height);
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
