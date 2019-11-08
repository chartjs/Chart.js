'use strict';

const defaults = require('../core/core.defaults');
const Element = require('../core/core.element');
const helpers = require('../helpers/index');

const valueOrDefault = helpers.valueOrDefault;

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
		var vm = this._view;
		return vm ? ((Math.pow(mouseX - vm.x, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(vm.hitRadius + vm.radius, 2)) : false;
	}

	inXRange(mouseX) {
		var vm = this._view;
		return vm ? (Math.abs(mouseX - vm.x) < vm.radius + vm.hitRadius) : false;
	}

	inYRange(mouseY) {
		var vm = this._view;
		return vm ? (Math.abs(mouseY - vm.y) < vm.radius + vm.hitRadius) : false;
	}

	getCenterPoint() {
		var vm = this._view;
		return {
			x: vm.x,
			y: vm.y
		};
	}

	tooltipPosition() {
		var vm = this._view;
		return {
			x: vm.x,
			y: vm.y,
			padding: vm.radius + vm.borderWidth
		};
	}

	draw(chartArea) {
		var vm = this._view;
		var ctx = this._ctx;
		var pointStyle = vm.pointStyle;
		var rotation = vm.rotation;
		var radius = vm.radius;
		var x = vm.x;
		var y = vm.y;
		var globalDefaults = defaults.global;
		var defaultColor = globalDefaults.defaultColor; // eslint-disable-line no-shadow

		if (vm.skip) {
			return;
		}

		// Clipping for Points.
		if (chartArea === undefined || helpers.canvas._isPointInArea(vm, chartArea)) {
			ctx.strokeStyle = vm.borderColor || defaultColor;
			ctx.lineWidth = valueOrDefault(vm.borderWidth, globalDefaults.elements.point.borderWidth);
			ctx.fillStyle = vm.backgroundColor || defaultColor;
			helpers.canvas.drawPoint(ctx, pointStyle, radius, x, y, rotation);
		}
	}
}

Point.prototype._type = 'point';

module.exports = Point;
