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

function buildBorderSections(bounds, inner, border, radius) {
	var top = 'top';
	var left = 'left';
	var right = 'right';
	var bottom = 'bottom';
	var borders = [top, right, bottom, left];
	var corners = [[left, top], [right, top], [right, bottom], [left, bottom]];
	var sections = [];
	var current = [];
	var count = 0;
	var startIdx = 0;
	var i, b, n, p, c1, c2;

	radius = radius || 0;

	for (i = 0; i < 4; ++i) {
		if (!border[borders[i]]) {
			startIdx = i;
			break;
		}
	}

	for (i = 0; i < 4; ++i) {
		b = borders[(i + startIdx) % 4];
		if (border[b]) {
			n = borders[(i + startIdx + 1) % 4];
			p = borders[(i + startIdx + 3) % 4];
			c1 = corners[(i + startIdx) % 4];
			c2 = corners[(i + startIdx + 1) % 4];
			if (i === 0 || !border[p]) {
				if (current.length) {
					sections.push({count: count, corners: current});
					current = [];
					count = 0;
				}
				current.push({x1: bounds[c1[0]], y1: bounds[c1[1]], x2: inner[c1[0]], y2: inner[c1[1]], r: radius});
			}
			if (i < 3 || !border[n]) {
				current.push({x1: bounds[c2[0]], y1: bounds[c2[1]], x2: inner[c2[0]], y2: inner[c2[1]], r: radius});
			}
			count++;
		}
	}
	if (current.length) {
		sections.push({count: count, corners: current});
	}
	return sections;
}

function drawBorderSection(ctx, section) {
	ctx.beginPath();

	var c = section.corners;
	var p1 = c[c.length - 1];
	var p2 = c[0];
	var r = p2.r;
	var ilen = section.count === 4 ? 5 : section.count;
	var i;

	// if all borders are drawn and we have a border radius, move starting point
	if (section.count === 4 && p2.r) {
		p2 = {x1: p2.x1, y1: p2.y1, x2: p2.x2, y2: p2.y2, r: p2.r};
		if (p2.x1 === p1.x1) {
			p2.x1 += p2.x2 > p2.x1 ? p2.r : -p2.r;
		}
		if (p2.y1 === p1.y1) {
			p2.y1 += p2.y2 > p2.y1 ? p2.r : -p2.r;
		}
	}

	ctx.moveTo(p2.x1, p2.y1);
	for (i = 0; i < ilen; i++) {
		p1 = p2;
		p2 = c[(i + 1) % c.length];
		ctx.arcTo(p1.x1, p1.y1, p2.x1, p2.y1, Math.max(p1.r, r));
		r = p1.r;
	}
	if (section.count < 4) {
		ctx.lineTo(p2.x1, p2.y1);
		ctx.lineTo(p2.x2, p2.y2);
	} else {
		p1 = p2;
		p2 = c[0];
		ctx.closePath();
		ctx.moveTo(p2.x2, p2.y2);
	}
	while (i > 0) {
		p1 = p2;
		p2 = c[(i - 1) % 4];
		ctx.arcTo(p1.x2, p1.y2, p2.x2, p2.y2, 0);
		i--;
	}
	ctx.lineTo(p2.x2, p2.y2);
	ctx.closePath();
	ctx.fill('evenodd');
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
		var height = bounds.bottom - top;
		var borderRadius = vm.borderRadius || 0;
		var inner, i, sections;

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

		inner = {
			left: left + borderWidth.left,
			top: top + borderWidth.top,
			right: right - borderWidth.right,
			bottom: bottom - borderWidth.bottom
		};

		ctx.fillRect(inner.left, inner.top, inner.right - inner.left, inner.bottom - inner.top);

		ctx.fillStyle = vm.borderColor;
		sections = buildBorderSections(bounds, inner, borderWidth, borderRadius);
		for (i = 0; i < sections.length; i++) {
			drawBorderSection(ctx, sections[i]);
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
