/*!
 * Chart.js
 * http://chartjs.org/
 * Version: {{ version }}
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


(function(Chart) {

	"use strict";

	var helpers = Chart.helpers;

	Chart.defaults.global.elements.point = {
		radius: 3,
		pointStyle: 'circle',
		backgroundColor: Chart.defaults.global.defaultColor,
		borderWidth: 1,
		borderColor: Chart.defaults.global.defaultColor,
		// Hover
		hitRadius: 1,
		hoverRadius: 4,
		hoverBorderWidth: 1,
	};


	Chart.elements.Point = Chart.Element.extend({
		inRange: function(mouseX, mouseY) {
			var vm = this._view;

			if (vm) {
				var hoverRange = vm.hitRadius + vm.radius;
				return ((Math.pow(mouseX - vm.x, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(hoverRange, 2));
			} else {
				return false;
			}
		},
		inLabelRange: function(mouseX) {
			var vm = this._view;

			if (vm) {
				return (Math.pow(mouseX - vm.x, 2) < Math.pow(vm.radius + vm.hitRadius, 2));
			} else {
				return false;
			}
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

			var vm = this._view;
			var ctx = this._chart.ctx;


			if (vm.skip) {
				return;
			}

			if (vm.radius > 0 || vm.borderWidth > 0) {

				ctx.strokeStyle = vm.borderColor || Chart.defaults.global.defaultColor;
				ctx.lineWidth = vm.borderWidth || Chart.defaults.global.elements.point.borderWidth;

				ctx.fillStyle = vm.backgroundColor || Chart.defaults.global.defaultColor;

				var radius = vm.radius || Chart.defaults.global.elements.point.radius;

				switch (vm.pointStyle) {
					case 'circle':
					default:
						ctx.beginPath();
						ctx.arc(vm.x, vm.y, radius, 0, Math.PI * 2);
						ctx.closePath();
						ctx.fill();
					break;
					case 'triangle':
						ctx.beginPath();
						var edgeLength = 3 * radius / Math.sqrt(3);
						var height = edgeLength * Math.sqrt(3) / 2;
						ctx.moveTo(vm.x - edgeLength / 2, vm.y + height / 3);
						ctx.lineTo(vm.x + edgeLength / 2, vm.y + height / 3);
						ctx.lineTo(vm.x, vm.y - 2 * height / 3);
						ctx.closePath();
						ctx.fill();
					break;
					case 'rect':
						ctx.fillRect(vm.x - radius, vm.y - radius, 2 * radius, 2 * radius);
						ctx.strokeRect(vm.x - radius, vm.y - radius, 2 * radius, 2 * radius);
					break;
					case 'rectRot':
						ctx.translate(vm.x, vm.y);
						ctx.rotate(Math.PI / 4);
						ctx.fillRect(-radius, -radius, 2 * radius, 2 * radius);
						ctx.strokeRect(-radius, -radius, 2 * radius, 2 * radius);
						ctx.setTransform(1, 0, 0, 1, 0, 0);
					break;
					case 'cross':
						ctx.beginPath();
						ctx.moveTo(vm.x, vm.y + radius);
						ctx.lineTo(vm.x, vm.y - radius);
						ctx.moveTo(vm.x - radius, vm.y);
						ctx.lineTo(vm.x + radius, vm.y);
						ctx.closePath();
					break;
					case 'crossRot':
						ctx.beginPath();
						var xOffset = Math.cos(Math.PI / 4) * radius;
						var yOffset = Math.sin(Math.PI / 4) * radius;
						ctx.moveTo(vm.x - xOffset, vm.y - yOffset);
						ctx.lineTo(vm.x + xOffset, vm.y + yOffset);
						ctx.moveTo(vm.x - xOffset, vm.y + yOffset);
						ctx.lineTo(vm.x + xOffset, vm.y - yOffset);
						ctx.closePath();
					break;
					case 'star':
						ctx.beginPath();
						ctx.moveTo(vm.x, vm.y + radius);
						ctx.lineTo(vm.x, vm.y - radius);
						ctx.moveTo(vm.x - radius, vm.y);
						ctx.lineTo(vm.x + radius, vm.y);
						var xOffset = Math.cos(Math.PI / 4) * radius;
						var yOffset = Math.sin(Math.PI / 4) * radius;
						ctx.moveTo(vm.x - xOffset, vm.y - yOffset);
						ctx.lineTo(vm.x + xOffset, vm.y + yOffset);
						ctx.moveTo(vm.x - xOffset, vm.y + yOffset);
						ctx.lineTo(vm.x + xOffset, vm.y - yOffset);
						ctx.closePath();
					break;
					case 'line':
						ctx.beginPath();
						ctx.moveTo(vm.x - radius, vm.y);
						ctx.lineTo(vm.x + radius, vm.y);
						ctx.closePath();
					break;
					case 'dash':
						ctx.beginPath();
						ctx.moveTo(vm.x, vm.y);
						ctx.lineTo(vm.x + radius, vm.y);
						ctx.closePath();
					break;
				}

				ctx.stroke();
			}
		}
	});


}).call(this, Chart);
