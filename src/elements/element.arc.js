'use strict';

var defaults = require('../core/core.defaults');
var Element = require('../core/core.element');
var helpers = require('../helpers/index');

defaults._set('global', {
	elements: {
		arc: {
			backgroundColor: defaults.global.defaultColor,
			borderColor: '#fff',
			borderWidth: 2,
			borderAlign: 'center'
		}
	}
});

function pathArc(ctx, x, y, args) {
	var innerRadius = args.innerRadius;
	var outerRadius = args.outerRadius;
	var startAngle = args.startAngle;
	var endAngle = args.endAngle;

	ctx.beginPath();
	ctx.arc(x, y, outerRadius, startAngle, endAngle);
	ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
	ctx.closePath();
}

function clipArc(ctx, vm, args) {
	var startAngle = args.startAngle;
	var endAngle = args.endAngle;
	var pixelMargin = args.pixelMargin;
	var angleMargin = pixelMargin / vm.outerRadius;

	// Draw an inner border by cliping the arc and drawing a double-width border
	// Enlarge the clipping arc by 0.33 pixels to eliminate glitches between borders
	ctx.beginPath();
	ctx.arc(vm.x, vm.y, vm.outerRadius, startAngle - angleMargin, endAngle + angleMargin);
	if (vm.innerRadius > pixelMargin) {
		angleMargin = pixelMargin / vm.innerRadius;
		ctx.arc(vm.x, vm.y, vm.innerRadius - pixelMargin, endAngle + angleMargin, startAngle - angleMargin, true);
	} else {
		ctx.arc(vm.x, vm.y, pixelMargin, endAngle + Math.PI / 2, startAngle - Math.PI / 2);
	}
	ctx.closePath();
	ctx.clip();
}

module.exports = Element.extend({
	inLabelRange: function(mouseX) {
		var vm = this._view;

		if (vm) {
			return (Math.pow(mouseX - vm.x, 2) < Math.pow(vm.radius + vm.hoverRadius, 2));
		}
		return false;
	},

	inRange: function(chartX, chartY) {
		var vm = this._view;

		if (vm) {
			var pointRelativePosition = helpers.getAngleFromPoint(vm, {x: chartX, y: chartY});
			var angle = pointRelativePosition.angle;
			var distance = pointRelativePosition.distance;

			// Sanitise angle range
			var startAngle = vm.startAngle;
			var endAngle = vm.endAngle;
			while (endAngle < startAngle) {
				endAngle += 2.0 * Math.PI;
			}
			while (angle > endAngle) {
				angle -= 2.0 * Math.PI;
			}
			while (angle < startAngle) {
				angle += 2.0 * Math.PI;
			}

			// Check if within the range of the open/close angle
			var betweenAngles = (angle >= startAngle && angle <= endAngle);
			var withinRadius = (distance >= vm.innerRadius && distance <= vm.outerRadius);

			return (betweenAngles && withinRadius);
		}
		return false;
	},

	getCenterPoint: function() {
		var vm = this._view;
		var halfAngle = (vm.startAngle + vm.endAngle) / 2;
		var halfRadius = (vm.innerRadius + vm.outerRadius) / 2;
		return {
			x: vm.x + Math.cos(halfAngle) * halfRadius,
			y: vm.y + Math.sin(halfAngle) * halfRadius
		};
	},

	getArea: function() {
		var vm = this._view;
		return Math.PI * ((vm.endAngle - vm.startAngle) / (2 * Math.PI)) * (Math.pow(vm.outerRadius, 2) - Math.pow(vm.innerRadius, 2));
	},

	tooltipPosition: function() {
		var vm = this._view;
		var centreAngle = vm.startAngle + ((vm.endAngle - vm.startAngle) / 2);
		var rangeFromCentre = (vm.outerRadius - vm.innerRadius) / 2 + vm.innerRadius;

		return {
			x: vm.x + (Math.cos(centreAngle) * rangeFromCentre),
			y: vm.y + (Math.sin(centreAngle) * rangeFromCentre)
		};
	},

	draw: function() {
		var ctx = this._chart.ctx;
		var vm = this._view;
		var startAngle = vm.startAngle;
		var endAngle = vm.endAngle;
		var pixelMargin = (vm.borderAlign === 'inner') ? 0.33 : 0;
		var outerRadius = Math.max(vm.outerRadius - pixelMargin, 0);
		var innerRadius = vm.innerRadius;
		var x = vm.x;
		var y = vm.y;
		var tA;

		ctx.save();

		ctx.fillStyle = vm.backgroundColor;

		if (vm.circumference > Math.PI * 2) {
			tA = startAngle;
			startAngle += (endAngle - startAngle) % (Math.PI * 2);
			pathArc(ctx, x, y, {
				innerRadius: innerRadius, outerRadius: outerRadius,
				startAngle: tA, endAngle: startAngle
			});
			ctx.fill();
		}

		pathArc(ctx, x, y, {
			innerRadius: innerRadius, outerRadius: outerRadius,
			startAngle: startAngle, endAngle: endAngle
		});
		ctx.fill();

		if (vm.borderWidth) {
			if (vm.borderAlign === 'inner') {
				clipArc(ctx, vm, {
					startAngle: startAngle, endAngle: endAngle,
					pixelMargin: pixelMargin
				});
				pathArc(ctx, x, y, {
					innerRadius: innerRadius, outerRadius: vm.outerRadius,
					startAngle: startAngle, endAngle: endAngle
				});

				ctx.lineWidth = vm.borderWidth * 2;
				ctx.lineJoin = 'round';
			} else {
				ctx.lineWidth = vm.borderWidth;
				ctx.lineJoin = 'bevel';
			}

			ctx.strokeStyle = vm.borderColor;
			ctx.stroke();
		}

		ctx.restore();
	}
});
