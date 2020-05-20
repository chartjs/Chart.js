import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import {_angleBetween, getAngleFromPoint} from '../helpers/helpers.math';
const TAU = Math.PI * 2;

defaults.set('elements', {
	arc: {
		backgroundColor: defaults.color,
		borderAlign: 'center',
		borderColor: '#fff',
		borderWidth: 2
	}
});

function clipArc(ctx, arc) {
	const {startAngle, endAngle, pixelMargin, x, y} = arc;
	let angleMargin = pixelMargin / arc.outerRadius;

	// Draw an inner border by cliping the arc and drawing a double-width border
	// Enlarge the clipping arc by 0.33 pixels to eliminate glitches between borders
	ctx.beginPath();
	ctx.arc(x, y, arc.outerRadius, startAngle - angleMargin, endAngle + angleMargin);
	if (arc.innerRadius > pixelMargin) {
		angleMargin = pixelMargin / arc.innerRadius;
		ctx.arc(x, y, arc.innerRadius - pixelMargin, endAngle + angleMargin, startAngle - angleMargin, true);
	} else {
		ctx.arc(x, y, pixelMargin, endAngle + Math.PI / 2, startAngle - Math.PI / 2);
	}
	ctx.closePath();
	ctx.clip();
}

function drawFullCircleBorders(ctx, vm, arc, inner) {
	const endAngle = arc.endAngle;
	let i;

	if (inner) {
		arc.endAngle = arc.startAngle + TAU;
		clipArc(ctx, arc);
		arc.endAngle = endAngle;
		if (arc.endAngle === arc.startAngle && arc.fullCircles) {
			arc.endAngle += TAU;
			arc.fullCircles--;
		}
	}

	ctx.beginPath();
	ctx.arc(arc.x, arc.y, arc.innerRadius, arc.startAngle + TAU, arc.startAngle, true);
	for (i = 0; i < arc.fullCircles; ++i) {
		ctx.stroke();
	}

	ctx.beginPath();
	ctx.arc(arc.x, arc.y, vm.outerRadius, arc.startAngle, arc.startAngle + TAU);
	for (i = 0; i < arc.fullCircles; ++i) {
		ctx.stroke();
	}
}

function drawBorder(ctx, vm, arc) {
	const options = vm.options;
	const inner = options.borderAlign === 'inner';

	if (inner) {
		ctx.lineWidth = options.borderWidth * 2;
		ctx.lineJoin = 'round';
	} else {
		ctx.lineWidth = options.borderWidth;
		ctx.lineJoin = 'bevel';
	}

	if (arc.fullCircles) {
		drawFullCircleBorders(ctx, vm, arc, inner);
	}

	if (inner) {
		clipArc(ctx, arc);
	}

	ctx.beginPath();
	ctx.arc(arc.x, arc.y, vm.outerRadius, arc.startAngle, arc.endAngle);
	ctx.arc(arc.x, arc.y, arc.innerRadius, arc.endAngle, arc.startAngle, true);
	ctx.closePath();
	ctx.stroke();
}

export default class Arc extends Element {

	static _type = 'arc';

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
		const arc = {
			x: me.x,
			y: me.y,
			innerRadius: me.innerRadius,
			outerRadius: Math.max(me.outerRadius - pixelMargin, 0),
			pixelMargin,
			startAngle: me.startAngle,
			endAngle: me.endAngle,
			fullCircles: Math.floor(me.circumference / TAU)
		};
		let i;

		ctx.save();

		ctx.fillStyle = options.backgroundColor;
		ctx.strokeStyle = options.borderColor;

		if (arc.fullCircles) {
			arc.endAngle = arc.startAngle + TAU;
			ctx.beginPath();
			ctx.arc(arc.x, arc.y, arc.outerRadius, arc.startAngle, arc.endAngle);
			ctx.arc(arc.x, arc.y, arc.innerRadius, arc.endAngle, arc.startAngle, true);
			ctx.closePath();
			for (i = 0; i < arc.fullCircles; ++i) {
				ctx.fill();
			}
			arc.endAngle = arc.startAngle + me.circumference % TAU;
		}

		ctx.beginPath();
		ctx.arc(arc.x, arc.y, arc.outerRadius, arc.startAngle, arc.endAngle);
		ctx.arc(arc.x, arc.y, arc.innerRadius, arc.endAngle, arc.startAngle, true);
		ctx.closePath();
		ctx.fill();

		if (options.borderWidth) {
			drawBorder(ctx, me, arc);
		}

		ctx.restore();
	}
}
