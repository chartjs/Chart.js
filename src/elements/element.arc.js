import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import {_angleBetween, getAngleFromPoint} from '../helpers/helpers.math';
const TAU = Math.PI * 2;

const scope = 'elements.arc';
defaults.set(scope, {
	borderAlign: 'center',
	borderColor: '#fff',
	borderWidth: 2
});

defaults.route(scope, ['backgroundColor'], '', ['color']);

function clipArc(ctx, model) {
	const {startAngle, endAngle, pixelMargin, x, y} = model;
	let angleMargin = pixelMargin / model.outerRadius;

	// Draw an inner border by cliping the arc and drawing a double-width border
	// Enlarge the clipping arc by 0.33 pixels to eliminate glitches between borders
	ctx.beginPath();
	ctx.arc(x, y, model.outerRadius, startAngle - angleMargin, endAngle + angleMargin);
	if (model.innerRadius > pixelMargin) {
		angleMargin = pixelMargin / model.innerRadius;
		ctx.arc(x, y, model.innerRadius - pixelMargin, endAngle + angleMargin, startAngle - angleMargin, true);
	} else {
		ctx.arc(x, y, pixelMargin, endAngle + Math.PI / 2, startAngle - Math.PI / 2);
	}
	ctx.closePath();
	ctx.clip();
}


function pathArc(ctx, model) {
	ctx.beginPath();
	ctx.arc(model.x, model.y, model.outerRadius, model.startAngle, model.endAngle);
	ctx.arc(model.x, model.y, model.innerRadius, model.endAngle, model.startAngle, true);
	ctx.closePath();
}

function drawArc(ctx, model, circumference) {
	if (model.fullCircles) {
		model.endAngle = model.startAngle + TAU;

		pathArc(ctx, model);

		for (let i = 0; i < model.fullCircles; ++i) {
			ctx.fill();
		}
		model.endAngle = model.startAngle + circumference % TAU;
	}

	pathArc(ctx, model);
	ctx.fill();
}

function drawFullCircleBorders(ctx, element, model, inner) {
	const endAngle = model.endAngle;
	let i;

	if (inner) {
		model.endAngle = model.startAngle + TAU;
		clipArc(ctx, model);
		model.endAngle = endAngle;
		if (model.endAngle === model.startAngle && model.fullCircles) {
			model.endAngle += TAU;
			model.fullCircles--;
		}
	}

	ctx.beginPath();
	ctx.arc(model.x, model.y, model.innerRadius, model.startAngle + TAU, model.startAngle, true);
	for (i = 0; i < model.fullCircles; ++i) {
		ctx.stroke();
	}

	ctx.beginPath();
	ctx.arc(model.x, model.y, element.outerRadius, model.startAngle, model.startAngle + TAU);
	for (i = 0; i < model.fullCircles; ++i) {
		ctx.stroke();
	}
}

function drawBorder(ctx, element, model) {
	const options = element.options;
	const inner = options.borderAlign === 'inner';

	if (inner) {
		ctx.lineWidth = options.borderWidth * 2;
		ctx.lineJoin = 'round';
	} else {
		ctx.lineWidth = options.borderWidth;
		ctx.lineJoin = 'bevel';
	}

	if (model.fullCircles) {
		drawFullCircleBorders(ctx, element, model, inner);
	}

	if (inner) {
		clipArc(ctx, model);
	}

	ctx.beginPath();
	ctx.arc(model.x, model.y, element.outerRadius, model.startAngle, model.endAngle);
	ctx.arc(model.x, model.y, model.innerRadius, model.endAngle, model.startAngle, true);
	ctx.closePath();
	ctx.stroke();
}

class Arc extends Element {

	constructor(cfg) {
		super();

		this.options = undefined;
		this.circumference = undefined;
		this.startAngle = undefined;
		this.endAngle = undefined;
		this.innerRadius = undefined;
		this.outerRadius = undefined;

		if (cfg) {
			Object.assign(this, cfg);
		}
	}

	/**
	 * @param {number} chartX
	 * @param {number} chartY
	 * @param {boolean} [useFinalPosition]
	 */
	inRange(chartX, chartY, useFinalPosition) {
		const point = this.getProps(['x', 'y'], useFinalPosition);
		const {angle, distance} = getAngleFromPoint(point, {x: chartX, y: chartY});
		const {startAngle, endAngle, innerRadius, outerRadius, circumference} = this.getProps([
			'startAngle',
			'endAngle',
			'innerRadius',
			'outerRadius',
			'circumference'
		], useFinalPosition);
		const betweenAngles = circumference >= TAU || _angleBetween(angle, startAngle, endAngle);
		const withinRadius = (distance >= innerRadius && distance <= outerRadius);

		return (betweenAngles && withinRadius);
	}

	/**
	 * @param {boolean} [useFinalPosition]
	 */
	getCenterPoint(useFinalPosition) {
		const {x, y, startAngle, endAngle, innerRadius, outerRadius} = this.getProps([
			'x',
			'y',
			'startAngle',
			'endAngle',
			'innerRadius',
			'outerRadius'
		], useFinalPosition);
		const halfAngle = (startAngle + endAngle) / 2;
		const halfRadius = (innerRadius + outerRadius) / 2;
		return {
			x: x + Math.cos(halfAngle) * halfRadius,
			y: y + Math.sin(halfAngle) * halfRadius
		};
	}

	/**
	 * @param {boolean} [useFinalPosition]
	 */
	tooltipPosition(useFinalPosition) {
		return this.getCenterPoint(useFinalPosition);
	}

	draw(ctx) {
		const me = this;
		const options = me.options;
		const pixelMargin = (options.borderAlign === 'inner') ? 0.33 : 0;
		const model = {
			x: me.x,
			y: me.y,
			innerRadius: me.innerRadius,
			outerRadius: Math.max(me.outerRadius - pixelMargin, 0),
			pixelMargin,
			startAngle: me.startAngle,
			endAngle: me.endAngle,
			fullCircles: Math.floor(me.circumference / TAU)
		};

		if (me.circumference === 0) {
			return;
		}

		ctx.save();

		ctx.fillStyle = options.backgroundColor;
		ctx.strokeStyle = options.borderColor;

		drawArc(ctx, model, me.circumference);

		if (options.borderWidth) {
			drawBorder(ctx, me, model);
		}

		ctx.restore();
	}
}

Arc._type = 'arc';

export default Arc;
