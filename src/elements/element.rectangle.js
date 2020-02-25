import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import {isObject} from '../helpers/helpers.core';

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
 * @param {Rectangle} bar the bar
 * @param {boolean} [useFinalPosition]
 * @return {object} bounds of the bar
 * @private
 */
function getBarBounds(bar, useFinalPosition) {
	const {x, y, base, width, height} = bar.getProps(['x', 'y', 'base', 'width', 'height'], useFinalPosition);

	let left, right, top, bottom, half;

	if (bar.horizontal) {
		half = height / 2;
		left = Math.min(x, base);
		right = Math.max(x, base);
		top = y - half;
		bottom = y + half;
	} else {
		half = width / 2;
		left = x - half;
		right = x + half;
		top = Math.min(y, base);
		bottom = Math.max(y, base);
	}

	return {left, top, right, bottom};
}

function swap(orig, v1, v2) {
	return orig === v1 ? v2 : orig === v2 ? v1 : orig;
}

function parseBorderSkipped(bar) {
	let edge = bar.options.borderSkipped;
	const res = {};

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
	const value = bar.options.borderWidth;
	const skip = parseBorderSkipped(bar);
	let t, r, b, l;

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
	const bounds = getBarBounds(bar);
	const width = bounds.right - bounds.left;
	const height = bounds.bottom - bounds.top;
	const border = parseBorderWidth(bar, width / 2, height / 2);

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

function inRange(bar, x, y, useFinalPosition) {
	const skipX = x === null;
	const skipY = y === null;
	const bounds = !bar || (skipX && skipY) ? false : getBarBounds(bar, useFinalPosition);

	return bounds
		&& (skipX || x >= bounds.left && x <= bounds.right)
		&& (skipY || y >= bounds.top && y <= bounds.bottom);
}

export default class Rectangle extends Element {

	static _type = 'rectangle';

	constructor(cfg) {
		super();

		this.options = undefined;
		this.horizontal = undefined;
		this.base = undefined;
		this.width = undefined;
		this.height = undefined;

		if (cfg) {
			Object.assign(this, cfg);
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

	inRange(mouseX, mouseY, useFinalPosition) {
		return inRange(this, mouseX, mouseY, useFinalPosition);
	}

	inXRange(mouseX, useFinalPosition) {
		return inRange(this, mouseX, null, useFinalPosition);
	}

	inYRange(mouseY, useFinalPosition) {
		return inRange(this, null, mouseY, useFinalPosition);
	}

	getCenterPoint(useFinalPosition) {
		const {x, y, base, horizontal} = this.getProps(['x', 'y', 'base', 'horizontal', useFinalPosition]);
		return {
			x: horizontal ? (x + base) / 2 : x,
			y: horizontal ? y : (y + base) / 2
		};
	}

	getRange(axis) {
		return axis === 'x' ? this.width / 2 : this.height / 2;
	}
}
