(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.global.elements.rectangle = {
		backgroundColor: Chart.defaults.global.defaultColor,
		borderWidth: 0,
		borderColor: Chart.defaults.global.defaultColor,
	};

	Chart.elements.Rectangle = Chart.Element.extend({
		draw: function() {

			var ctx = this._chart.ctx;
			var vm = this._view;

			var halfWidth = vm.width / 2,
				leftX = vm.x - halfWidth,
				rightX = vm.x + halfWidth,
				top = vm.base - (vm.base - vm.y),
				halfStroke = vm.borderWidth / 2;

			// Canvas doesn't allow us to stroke inside the width so we can
			// adjust the sizes to fit if we're setting a stroke on the line
			if (vm.borderWidth) {
				leftX += halfStroke;
				rightX -= halfStroke;
				top += halfStroke;
			}

			ctx.beginPath();

			ctx.fillStyle = vm.backgroundColor;
			ctx.strokeStyle = vm.borderColor;
			ctx.lineWidth = vm.borderWidth;

			// It'd be nice to keep this class totally generic to any rectangle
			// and simply specify which border to miss out.
			ctx.moveTo(leftX, vm.base);
			ctx.lineTo(leftX, top);
			ctx.lineTo(rightX, top);
			ctx.lineTo(rightX, vm.base);
			ctx.fill();
			if (vm.borderWidth) {
				ctx.stroke();
			}
		},
		height: function() {
			var vm = this._view;
			return vm.base - vm.y;
		},
		inRange: function(mouseX, mouseY) {
			var vm = this._view;
			if (vm.y < vm.base) {
				return (mouseX >= vm.x - vm.width / 2 && mouseX <= vm.x + vm.width / 2) && (mouseY >= vm.y && mouseY <= vm.base);
			} else {
				return (mouseX >= vm.x - vm.width / 2 && mouseX <= vm.x + vm.width / 2) && (mouseY >= vm.base && mouseY <= vm.y);
			}
		},
		inLabelRange: function(mouseX) {
			var vm = this._view;
			return (mouseX >= vm.x - vm.width / 2 && mouseX <= vm.x + vm.width / 2);
		},
		tooltipPosition: function() {
			var vm = this._view;
			if (vm.y < vm.base) {
				return {
					x: vm.x,
					y: vm.y
				};
			} else {
				return {
					x: vm.x,
					y: vm.base
				};
			}
		},
	});



}).call(this);
