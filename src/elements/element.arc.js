'use strict';

import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import {extend} from '../helpers/helpers.core';
import {getAngleFromPoint} from '../helpers/helpers.math';
const TAU = Math.PI * 2;

defaults.set('elements', {
	arc: {
		backgroundColor: defaults.color,
		borderColor: '#fff',
		borderWidth: 2,
		borderAlign: 'center'
	}
});

function clipArc(ctx, arc) {
	var startAngle = arc.startAngle;
	var endAngle = arc.endAngle;
	var pixelMargin = arc.pixelMargin;
	var angleMargin = pixelMargin / arc.outerRadius;
	var x = arc.x;
	var y = arc.y;

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
	var endAngle = arc.endAngle;
	var i;

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
	var inner = options.borderAlign === 'inner';

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
			extend(this, cfg);
		}
	}

	inRange(chartX, chartY) {
		var me = this;

		var pointRelativePosition = getAngleFromPoint(me, {x: chartX, y: chartY});
		var angle = pointRelativePosition.angle;
		var distance = pointRelativePosition.distance;

		// Sanitise angle range
		var startAngle = me.startAngle;
		var endAngle = me.endAngle;
		while (endAngle < startAngle) {
			endAngle += TAU;
		}
		while (angle > endAngle) {
			angle -= TAU;
		}
		while (angle < startAngle) {
			angle += TAU;
		}

		// Check if within the range of the open/close angle
		var betweenAngles = (angle >= startAngle && angle <= endAngle);
		var withinRadius = (distance >= me.innerRadius && distance <= me.outerRadius);

		return (betweenAngles && withinRadius);
	}

	getCenterPoint() {
		var me = this;
		var halfAngle = (me.startAngle + me.endAngle) / 2;
		var halfRadius = (me.innerRadius + me.outerRadius) / 2;
		return {
			x: me.x + Math.cos(halfAngle) * halfRadius,
			y: me.y + Math.sin(halfAngle) * halfRadius
		};
	}

	tooltipPosition() {
		var me = this;
		var centreAngle = me.startAngle + ((me.endAngle - me.startAngle) / 2);
		var rangeFromCentre = (me.outerRadius - me.innerRadius) / 2 + me.innerRadius;

		return {
			x: me.x + (Math.cos(centreAngle) * rangeFromCentre),
			y: me.y + (Math.sin(centreAngle) * rangeFromCentre)
		};
	}

	draw(ctx) {
		var me = this;
		var options = me.options;
		var pixelMargin = (options.borderAlign === 'inner') ? 0.33 : 0;
		var arc = {
			x: me.x,
			y: me.y,
			innerRadius: me.innerRadius,
			outerRadius: Math.max(me.outerRadius - pixelMargin, 0),
			pixelMargin: pixelMargin,
			startAngle: me.startAngle,
			endAngle: me.endAngle,
			fullCircles: Math.floor(me.circumference / TAU)
		};
		var i;

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

Arc.prototype._type = 'arc';

export default Arc;
