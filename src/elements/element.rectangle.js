'use strict';

import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import helpers from '../helpers';

const defaultColor = defaults.color;

defaults._set('elements', {
	rectangle: {
		backgroundColor: defaultColor,
		borderColor: defaultColor,
		borderSkipped: 'bottom',
		borderWidth: 0
	}
});

/**
 * Helper function to get the bounds of the bar regardless of the orientation
 * @param bar {Chart.Element.Rectangle} the bar
 * @return {Bounds} bounds of the bar
 * @private
 */
function getBarBounds(bar) {
	var x1, x2, y1, y2, half;

	if (bar.horizontal) {
		half = bar.height / 2;
		x1 = Math.min(bar.x, bar.base);
		x2 = Math.max(bar.x, bar.base);
		y1 = bar.y - half;
		y2 = bar.y + half;
	} else {
		half = bar.width / 2;
		x1 = bar.x - half;
		x2 = bar.x + half;
		y1 = Math.min(bar.y, bar.base);
		y2 = Math.max(bar.y, bar.base);
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
	var edge = bar.options.borderSkipped;
	var res = {};

	if (!edge) {
		return res;
	}

	if (bar.horizontal) {
		if (bar.base > bar.x) {
			edge = swap(edge, 'left', 'right');
		}
	} else if (bar.base < bar.y) {
		edge = swap(edge, 'bottom', 'top');
	}

	res[edge] = true;
	return res;
}

function parseBorderWidth(bar, maxW, maxH) {
	var value = bar.options.borderWidth;
	var skip = parseBorderSkipped(bar);
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
		t: skip.top || (t < 0) ? 0 : t > maxH ? maxH : t,
		r: skip.right || (r < 0) ? 0 : r > maxW ? maxW : r,
		b: skip.bottom || (b < 0) ? 0 : b > maxH ? maxH : b,
		l: skip.left || (l < 0) ? 0 : l > maxW ? maxW : l
	};
}

function boundingRects(bar) {
	var bounds = getBarBounds(bar);
	var width = bounds.right - bounds.left;
	var height = bounds.bottom - bounds.top;
	var border = parseBorderWidth(bar, width / 2, height / 2);

	return {
		outer: {
			x: bounds.left,
			y: bounds.top,
			w: width,
			h: height
		},
		inner: {
			x: bounds.left + border.l,
			y: bounds.top + border.t,
			w: width - border.l - border.r,
			h: height - border.t - border.b
		}
	};
}

function inRange(bar, x, y) {
	var skipX = x === null;
	var skipY = y === null;
	var bounds = !bar || (skipX && skipY) ? false : getBarBounds(bar);

	return bounds
		&& (skipX || x >= bounds.left && x <= bounds.right)
		&& (skipY || y >= bounds.top && y <= bounds.bottom);
}

class Rectangle extends Element {

	constructor(props) {
		super(props);
	}

	draw(ctx) {
		var options = this.options;
		var rects = boundingRects(this);
		var outer = rects.outer;
		var inner = rects.inner;

		ctx.fillStyle = options.backgroundColor;
		ctx.fillRect(outer.x, outer.y, outer.w, outer.h);

		if (outer.w === inner.w && outer.h === inner.h) {
			return;
		}

		ctx.save();
		ctx.beginPath();
		ctx.rect(outer.x, outer.y, outer.w, outer.h);
		ctx.clip();
		ctx.fillStyle = options.borderColor;
		ctx.rect(inner.x, inner.y, inner.w, inner.h);
		ctx.fill('evenodd');
		ctx.restore();
	}

	inRange(mouseX, mouseY) {
		return inRange(this, mouseX, mouseY);
	}

	inXRange(mouseX) {
		return inRange(this, mouseX, null);
	}

	inYRange(mouseY) {
		return inRange(this, null, mouseY);
	}

	getCenterPoint() {
		const {x, y, base, horizontal} = this;
		return {
			x: horizontal ? (x + base) / 2 : x,
			y: horizontal ? y : (y + base) / 2
		};
	}

	tooltipPosition() {
		return {
			x: this.x,
			y: this.y
		};
	}
}

Rectangle.prototype._type = 'rectangle';

export default Rectangle;
