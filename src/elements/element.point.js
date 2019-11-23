'use strict';

import defaults from '../core/core.defaults';
import Element from '../core/core.element';
import helpers from '../helpers';

const defaultColor = defaults.global.defaultColor;

defaults._set('global', {
	elements: {
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
	}
});

class Point extends Element {

	constructor(props) {
		super(props);
	}

	inRange(mouseX, mouseY) {
		const vm = this._view;
		return vm ? ((Math.pow(mouseX - vm.x, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(vm.hitRadius + vm.radius, 2)) : false;
	}

	inXRange(mouseX) {
		const vm = this._view;
		return vm ? (Math.abs(mouseX - vm.x) < vm.radius + vm.hitRadius) : false;
	}

	inYRange(mouseY) {
		const vm = this._view;
		return vm ? (Math.abs(mouseY - vm.y) < vm.radius + vm.hitRadius) : false;
	}

	getCenterPoint() {
		const vm = this._view;
		return {
			x: vm.x,
			y: vm.y
		};
	}

	size() {
		const vm = this._view;
		const radius = vm.radius || 0;
		const borderWidth = vm.borderWidth || 0;
		return (radius + borderWidth) * 2;
	}

	tooltipPosition() {
		const vm = this._view;
		return {
			x: vm.x,
			y: vm.y,
			padding: vm.radius + vm.borderWidth
		};
	}

	draw(ctx, chartArea) {
		const vm = this._view;
		const pointStyle = vm.pointStyle;
		const rotation = vm.rotation;
		const radius = vm.radius;
		const x = vm.x;
		const y = vm.y;

		if (vm.skip || radius <= 0) {
			return;
		}

		// Clipping for Points.
		if (chartArea === undefined || helpers.canvas._isPointInArea(vm, chartArea)) {
			ctx.strokeStyle = vm.borderColor;
			ctx.lineWidth = vm.borderWidth;
			ctx.fillStyle = vm.backgroundColor;
			helpers.canvas.drawPoint(ctx, pointStyle, radius, x, y, rotation);
		}
	}
}

Point.prototype._type = 'point';

export default Point;
