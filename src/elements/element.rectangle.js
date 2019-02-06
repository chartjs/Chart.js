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
		var left, right, top, bottom, signX, signY, borderSkipped, x, y;

		if (!vm.horizontal) {
			// bar
			left = vm.x - vm.width / 2;
			right = vm.x + vm.width / 2;
			top = vm.y;
			bottom = vm.base;
			signX = 1;
			signY = bottom > top ? 1 : -1;
			borderSkipped = valueOrDefault(vm.borderSkipped, {bottom: true}) || {};
		} else {
			// horizontal bar
			left = vm.base;
			right = vm.x;
			top = vm.y - vm.height / 2;
			bottom = vm.y + vm.height / 2;
			signX = right > left ? 1 : -1;
			signY = 1;
			borderSkipped = valueOrDefault(vm.borderSkipped, {left: true}) || {};
		}

		ctx.fillStyle = vm.backgroundColor;
		ctx.strokeStyle = vm.borderColor;

		if (borderWidth) {
			if (typeof borderSkipped === 'string') {
				borderSkipped = {};
				borderSkipped[vm.borderSkipped] = true;
			}

			var maxWidth = Math.abs(left - right);
			var maxHeight = Math.abs(top - bottom);
			if (!helpers.isObject(borderWidth)) {
				borderWidth = {
					bottom: borderSkipped.bottom ? 0 : Math.min(borderWidth, maxHeight),
					left: borderSkipped.left ? 0 : Math.min(borderWidth, maxWidth),
					top: borderSkipped.top ? 0 : Math.min(borderWidth, maxHeight),
					right: borderSkipped.right ? 0 : Math.min(borderWidth, maxWidth)
				};
			}
			ctx.fillRect(
				left + borderWidth.left * signX,
				bottom - borderWidth.bottom * signY,
				right - left - signX * (borderWidth.left + borderWidth.right),
				top - bottom + signY * (borderWidth.top + borderWidth.bottom));

			ctx.beginPath();
			if (borderWidth.bottom) {
				y = bottom - signY * borderWidth.bottom / 2;
				ctx.moveTo(right, y);
				if (borderWidth.left) {
					ctx.lineTo(left + signX * borderWidth.left / 2, y);
				} else {
					ctx.lineTo(left, y);
				}
				if (borderWidth.bottom !== (borderWidth.left || borderWidth.top || borderWidth.right)) {
					ctx.lineWidth = borderWidth.bottom;
					ctx.stroke();
					if (borderWidth.left || borderWidth.top || borderWidth.right) {
						ctx.beginPath();
					}
				}
			}
			if (borderWidth.left) {
				x = left + signX * borderWidth.left / 2;
				if (borderWidth.left !== borderWidth.bottom) {
					ctx.moveTo(x, bottom);
				}
				if (borderWidth.top) {
					ctx.lineTo(x, top + signY * borderWidth.top / 2);
				} else {
					ctx.lineTo(x, top);
				}
				if (borderWidth.left !== (borderWidth.top || borderWidth.right)) {
					ctx.lineWidth = borderWidth.left;
					ctx.stroke();
					if (borderWidth.top || borderWidth.right) {
						ctx.beginPath();
					}
				}
			}
			if (borderWidth.top) {
				y = top + signY * borderWidth.top / 2;
				if (borderWidth.top !== borderWidth.left) {
					ctx.moveTo(left, y);
				}
				if (borderWidth.right) {
					ctx.lineTo(right - signX * borderWidth.right / 2, y);
				} else {
					ctx.lineTo(right, y);
				}
				if (borderWidth.top !== borderWidth.right) {
					ctx.lineWidth = borderWidth.top;
					ctx.stroke();
					if (borderWidth.right) {
						ctx.beginPath();
					}
				}
			}
			if (borderWidth.right) {
				x = right - signX * borderWidth.right / 2;
				if (borderWidth.right !== borderWidth.top) {
					ctx.moveTo(x, top);
				}
				if (borderWidth.bottom) {
					ctx.lineTo(x, bottom - signY * borderWidth.bottom / 2);
				} else {
					ctx.lineTo(x, bottom);
				}
				ctx.lineWidth = borderWidth.right;
				ctx.stroke();
			}
		} else {
			ctx.fillRect(left, bottom, right - left, top - bottom);
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
