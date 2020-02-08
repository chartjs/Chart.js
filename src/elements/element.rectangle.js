'use strict';

import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import {extend, isObject} from '../helpers/helpers.core';

const defaultColor = defaults.color;

defaults.set('elements', {
	rectangle: {
		backgroundColor: defaultColor,
		borderColor: defaultColor,
		borderSkipped: 'bottom',
		borderWidth: 0
	}
});

/**
 * Helper function to get the bounds of the bar regardless of the orientation
 * @param bar {Rectangle} the bar
 * @return {object} bounds of the bar
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

function skipOrLimit(skip, value, min, max) {
	return skip ? 0 : Math.max(Math.min(value, max), min);
}

function parseBorderWidth(bar, maxW, maxH) {
	var value = bar.options.borderWidth;
	var skip = parseBorderSkipped(bar);
	var t, r, b, l;

	if (isObject(value)) {
		t = +value.top || 0;
		r = +value.right || 0;
		b = +value.bottom || 0;
		l = +value.left || 0;
	} else {
		t = r = b = l = +value || 0;
	}

	return {
		t: skipOrLimit(skip.top, t, 0, maxH),
		r: skipOrLimit(skip.right, r, 0, maxW),
		b: skipOrLimit(skip.bottom, b, 0, maxH),
		l: skipOrLimit(skip.left, l, 0, maxW)
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

	constructor(cfg) {
		super();

		this.options = undefined;
		this.horizontal = undefined;
		this.base = undefined;
		this.width = undefined;
		this.height = undefined;

		if (cfg) {
			extend(this, cfg);
		}
	}

	draw(ctx) {
		const options = this.options;
		const {inner, outer} = boundingRects(this);

		ctx.save();

		if (outer.w !== inner.w || outer.h !== inner.h) {
			ctx.beginPath();
			ctx.rect(outer.x, outer.y, outer.w, outer.h);
			ctx.clip();
			ctx.rect(inner.x, inner.y, inner.w, inner.h);
			ctx.fillStyle = options.borderColor;
			ctx.fill('evenodd');
		}

		ctx.fillStyle = options.backgroundColor;
		ctx.fillRect(inner.x, inner.y, inner.w, inner.h);

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

	getRange(axis) {
		return axis === 'x' ? this.width / 2 : this.height / 2;
	}
}

Rectangle.prototype._type = 'rectangle';

export default Rectangle;
