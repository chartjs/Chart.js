import Element from '../core/core.element';
import {_angleBetween, getAngleFromPoint, TAU, HALF_PI} from '../helpers/index';

function clipArc(ctx, element) {
	const {startAngle, endAngle, pixelMargin, x, y, outerRadius, innerRadius} = element;
	let angleMargin = pixelMargin / outerRadius;

	// Draw an inner border by clipping the arc and drawing a double-width border
	// Enlarge the clipping arc by 0.33 pixels to eliminate glitches between borders
	ctx.beginPath();
	ctx.arc(x, y, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
	if (innerRadius > pixelMargin) {
		angleMargin = pixelMargin / innerRadius;
		ctx.arc(x, y, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
	} else {
		ctx.arc(x, y, pixelMargin, endAngle + HALF_PI, startAngle - HALF_PI);
	}
	ctx.closePath();
	ctx.clip();
}


function pathArc(ctx, element) {
	const {x, y, startAngle, endAngle, pixelMargin} = element;
	const outerRadius = Math.max(element.outerRadius - pixelMargin, 0);
	const innerRadius = element.innerRadius + pixelMargin;

	ctx.beginPath();
	ctx.arc(x, y, outerRadius, startAngle, endAngle);
	ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
	ctx.closePath();
}

function drawArc(ctx, element) {
	if (element.fullCircles) {
		element.endAngle = element.startAngle + TAU;

		pathArc(ctx, element);

		for (let i = 0; i < element.fullCircles; ++i) {
			ctx.fill();
		}
		element.endAngle = element.startAngle + element.circumference % TAU;
	}

	pathArc(ctx, element);
	ctx.fill();
}

function drawFullCircleBorders(ctx, element, inner) {
	const {x, y, startAngle, endAngle, pixelMargin} = element;
	const outerRadius = Math.max(element.outerRadius - pixelMargin, 0);
	const innerRadius = element.innerRadius + pixelMargin;

	let i;

	if (inner) {
		element.endAngle = element.startAngle + TAU;
		clipArc(ctx, element);
		element.endAngle = endAngle;
		if (element.endAngle === element.startAngle) {
			element.endAngle += TAU;
			element.fullCircles--;
		}
	}

	ctx.beginPath();
	ctx.arc(x, y, innerRadius, startAngle + TAU, startAngle, true);
	for (i = 0; i < element.fullCircles; ++i) {
		ctx.stroke();
	}

	ctx.beginPath();
	ctx.arc(x, y, outerRadius, startAngle, startAngle + TAU);
	for (i = 0; i < element.fullCircles; ++i) {
		ctx.stroke();
	}
}

function drawBorder(ctx, element) {
	const {x, y, startAngle, endAngle, pixelMargin, options} = element;
	const outerRadius = element.outerRadius;
	const innerRadius = element.innerRadius + pixelMargin;
	const inner = options.borderAlign === 'inner';

	if (!options.borderWidth) {
		return;
	}

	if (inner) {
		ctx.lineWidth = options.borderWidth * 2;
		ctx.lineJoin = 'round';
	} else {
		ctx.lineWidth = options.borderWidth;
		ctx.lineJoin = 'bevel';
	}

	if (element.fullCircles) {
		drawFullCircleBorders(ctx, element, inner);
	}

	if (inner) {
		clipArc(ctx, element);
	}

	ctx.beginPath();
	ctx.arc(x, y, outerRadius, startAngle, endAngle);
	ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
	ctx.closePath();
	ctx.stroke();
}

export default class ArcElement extends Element {

	constructor(cfg) {
		super();

		this.options = undefined;
		this.circumference = undefined;
		this.startAngle = undefined;
		this.endAngle = undefined;
		this.innerRadius = undefined;
		this.outerRadius = undefined;
		this.pixelMargin = 0;
		this.fullCircles = 0;

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
		const offset = options.offset || 0;
		me.pixelMargin = (options.borderAlign === 'inner') ? 0.33 : 0;
		me.fullCircles = Math.floor(me.circumference / TAU);

		if (me.circumference === 0 || me.innerRadius < 0 || me.outerRadius < 0) {
			return;
		}

		ctx.save();

		if (offset && me.circumference < TAU) {
			const halfAngle = (me.startAngle + me.endAngle) / 2;
			ctx.translate(Math.cos(halfAngle) * offset, Math.sin(halfAngle) * offset);
		}

		ctx.fillStyle = options.backgroundColor;
		ctx.strokeStyle = options.borderColor;

		drawArc(ctx, me);
		drawBorder(ctx, me);

		ctx.restore();
	}
}

ArcElement.id = 'arc';

/**
 * @type {any}
 */
ArcElement.defaults = {
	borderAlign: 'center',
	borderColor: '#fff',
	borderWidth: 2,
	offset: 0
};

/**
 * @type {any}
 */
ArcElement.defaultRoutes = {
	backgroundColor: 'backgroundColor'
};
