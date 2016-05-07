"use strict";

module.exports = function(Chart) {

	var helpers = Chart.helpers,
		globalOpts = Chart.defaults.global;

	globalOpts.elements.point = {
		radius: 3,
		pointStyle: 'circle',
		backgroundColor: globalOpts.defaultColor,
		borderWidth: 1,
		borderColor: globalOpts.defaultColor,
		// Hover
		hitRadius: 1,
		hoverRadius: 4,
		hoverBorderWidth: 1
	};


	Chart.elements.Point = Chart.Element.extend({
		inRange: function(mouseX, mouseY) {
			var vm = this._view;
			return vm ? ((Math.pow(mouseX - vm.x, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(vm.hitRadius + vm.radius, 2)) : false;
		},
		inLabelRange: function(mouseX) {
			var vm = this._view;
			return vm ? (Math.pow(mouseX - vm.x, 2) < Math.pow(vm.radius + vm.hitRadius, 2)) : false; 
		},
		tooltipPosition: function() {
			var vm = this._view;
			return {
				x: vm.x,
				y: vm.y,
				padding: vm.radius + vm.borderWidth
			};
		},
		draw: function() {
			var vm = this._view,
				x = vm.x,
				y = vm.y;
			var ctx = this._chart.ctx;

			if (vm.skip) {
				return;
			}

			var pointStyle = vm.pointStyle;
			if (typeof pointStyle === 'object' && ((pointStyle.toString() === '[object HTMLImageElement]') || (pointStyle.toString() === '[object HTMLCanvasElement]'))) {
				ctx.drawImage(pointStyle, x - pointStyle.width / 2, y - pointStyle.height / 2);
				return;
			}

			if (!isNaN(vm.radius) && vm.radius > 0) {

				ctx.strokeStyle = vm.borderColor || Chart.defaults.global.defaultColor;
				ctx.lineWidth = helpers.getValueOrDefault(vm.borderWidth, Chart.defaults.global.elements.point.borderWidth);

				ctx.fillStyle = vm.backgroundColor || Chart.defaults.global.defaultColor;

				var radius = vm.radius;

				var xOffset,
					yOffset;

				switch (pointStyle) {
					// Default includes circle
					default: 
						ctx.beginPath();
						ctx.arc(x, y, radius, 0, Math.PI * 2);
						ctx.closePath();
						ctx.fill();
						break;
					case 'triangle':
						ctx.beginPath();
						var edgeLength = 3 * radius / Math.sqrt(3);
						var height = edgeLength * Math.sqrt(3) / 2;
						ctx.moveTo(x - edgeLength / 2, y + height / 3);
						ctx.lineTo(x + edgeLength / 2, y + height / 3);
						ctx.lineTo(x, y - 2 * height / 3);
						ctx.closePath();
						ctx.fill();
						break;
					case 'rect':
						ctx.fillRect(x - 1 / Math.SQRT2 * radius, y - 1 / Math.SQRT2 * radius, 2 / Math.SQRT2 * radius, 2 / Math.SQRT2 * radius);
						ctx.strokeRect(x - 1 / Math.SQRT2 * radius, y - 1 / Math.SQRT2 * radius, 2 / Math.SQRT2 * radius, 2 / Math.SQRT2 * radius);
						break;
					case 'rectRot':
						ctx.translate(x, y);
						ctx.rotate(Math.PI / 4);
						ctx.fillRect(-1 / Math.SQRT2 * radius, -1 / Math.SQRT2 * radius, 2 / Math.SQRT2 * radius, 2 / Math.SQRT2 * radius);
						ctx.strokeRect(-1 / Math.SQRT2 * radius, -1 / Math.SQRT2 * radius, 2 / Math.SQRT2 * radius, 2 / Math.SQRT2 * radius);
						ctx.setTransform(1, 0, 0, 1, 0, 0);
						break;
					case 'cross':
						ctx.beginPath();
						ctx.moveTo(x, y + radius);
						ctx.lineTo(x, y - radius);
						ctx.moveTo(x - radius, y);
						ctx.lineTo(x + radius, y);
						ctx.closePath();
						break;
					case 'crossRot':
						ctx.beginPath();
						xOffset = Math.cos(Math.PI / 4) * radius;
						yOffset = Math.sin(Math.PI / 4) * radius;
						ctx.moveTo(x - xOffset, y - yOffset);
						ctx.lineTo(x + xOffset, y + yOffset);
						ctx.moveTo(x - xOffset, y + yOffset);
						ctx.lineTo(x + xOffset, y - yOffset);
						ctx.closePath();
						break;
					case 'star':
						ctx.beginPath();
						ctx.moveTo(x, y + radius);
						ctx.lineTo(x, y - radius);
						ctx.moveTo(x - radius, y);
						ctx.lineTo(x + radius, y);
						xOffset = Math.cos(Math.PI / 4) * radius;
						yOffset = Math.sin(Math.PI / 4) * radius;
						ctx.moveTo(x - xOffset, y - yOffset);
						ctx.lineTo(x + xOffset, y + yOffset);
						ctx.moveTo(x - xOffset, y + yOffset);
						ctx.lineTo(x + xOffset, y - yOffset);
						ctx.closePath();
						break;
					case 'line':
						ctx.beginPath();
						ctx.moveTo(x - radius, y);
						ctx.lineTo(x + radius, y);
						ctx.closePath();
						break;
					case 'dash':
						ctx.beginPath();
						ctx.moveTo(x, y);
						ctx.lineTo(x + radius, y);
						ctx.closePath();
						break;
				}

				ctx.stroke();
			}
		}
	});
};