'use strict';

import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import {_isPointInArea, drawPoint} from '../helpers/helpers.canvas';
import {extend} from '../helpers/helpers.core';

const defaultColor = defaults.color;

defaults.set('elements', {
	point: {
		radius: 3,
		pointStyle: 'circle',
		backgroundColor: defaultColor,
		borderColor: defaultColor,
		borderWidth: 1,
		// Hover
		hitRadius: 1,
		hoverRadius: 4,
		hoverBorderWidth: 1
	}
});

class Point extends Element {

	constructor(cfg) {
		super();

		this.options = undefined;
		this.skip = undefined;
		this.stop = undefined;

		if (cfg) {
			extend(this, cfg);
		}
	}

	inRange(mouseX, mouseY) {
		const options = this.options;
		return ((Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)) < Math.pow(options.hitRadius + options.radius, 2));
	}

	inXRange(mouseX) {
		const options = this.options;
		return (Math.abs(mouseX - this.x) < options.radius + options.hitRadius);
	}

	inYRange(mouseY) {
		const options = this.options;
		return (Math.abs(mouseY - this.y) < options.radius + options.hitRadius);
	}

	getCenterPoint() {
		return {x: this.x, y: this.y};
	}

	size() {
		const options = this.options || {};
		const radius = Math.max(options.radius, options.hoverRadius) || 0;
		const borderWidth = radius && options.borderWidth || 0;
		return (radius + borderWidth) * 2;
	}

	tooltipPosition() {
		const options = this.options;
		return {
			x: this.x,
			y: this.y,
			padding: options.radius + options.borderWidth
		};
	}

	draw(ctx, chartArea) {
		const me = this;
		const options = me.options;

		if (me.skip || options.radius <= 0) {
			return;
		}

		// Clipping for Points.
		if (chartArea === undefined || _isPointInArea(me, chartArea)) {
			ctx.strokeStyle = options.borderColor;
			ctx.lineWidth = options.borderWidth;
			ctx.fillStyle = options.backgroundColor;
			drawPoint(ctx, options, me.x, me.y);
		}
	}

	getRange() {
		const options = this.options || {};
		return options.radius + options.hitRadius;
	}
}

Point.prototype._type = 'point';

export default Point;
