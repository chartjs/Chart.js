import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import {_isPointInArea, drawPoint} from '../helpers/helpers.canvas';

const defaultColor = defaults.color;

defaults.set('elements', {
	point: {
		backgroundColor: defaultColor,
		borderColor: defaultColor,
		borderWidth: 1,
		hitRadius: 1,
		hoverBorderWidth: 1,
		hoverRadius: 4,
		pointStyle: 'circle',
		radius: 3
	}
});

export default class Point extends Element {

	static _type = 'point';

	constructor(cfg) {
		super();

		this.options = undefined;
		this.skip = undefined;
		this.stop = undefined;

		if (cfg) {
			Object.assign(this, cfg);
		}
	}

	inRange(mouseX, mouseY, useFinalPosition) {
		const options = this.options;
		const {x, y} = this.getProps(['x', 'y'], useFinalPosition);
		return ((Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)) < Math.pow(options.hitRadius + options.radius, 2));
	}

	inXRange(mouseX, useFinalPosition) {
		const options = this.options;
		const {x} = this.getProps(['x'], useFinalPosition);

		return (Math.abs(mouseX - x) < options.radius + options.hitRadius);
	}

	inYRange(mouseY, useFinalPosition) {
		const options = this.options;
		const {y} = this.getProps(['x'], useFinalPosition);
		return (Math.abs(mouseY - y) < options.radius + options.hitRadius);
	}

	getCenterPoint(useFinalPosition) {
		const {x, y} = this.getProps(['x', 'y'], useFinalPosition);
		return {x, y};
	}

	size() {
		const options = this.options || {};
		const radius = Math.max(options.radius, options.hoverRadius) || 0;
		const borderWidth = radius && options.borderWidth || 0;
		return (radius + borderWidth) * 2;
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
