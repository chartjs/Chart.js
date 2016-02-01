(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

    Chart.elements.ErrorBar = Chart.Element.extend({
      draw: function() {

				var ctx = this._chart.ctx,
					vm = this._view,

					halfWidth = vm.capWidth/2,
					leftX = vm.x - halfWidth,
					rightX = vm.x + halfWidth,
					top = vm.yTop,
					bottom = vm.yBottom,
					middle = (top + bottom) / 2;

				ctx.strokeStyle = vm.strokeColor;
				ctx.lineWidth = vm.strokeWidth;

				//draw upper error bar
				if (vm.direction !== "down") {
					ctx.beginPath();
					ctx.moveTo(vm.x, middle);
					ctx.lineTo(vm.x, top);
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(leftX, top);
					ctx.lineTo(rightX, top);
					ctx.stroke();
				}

				//draw lower error bar
				if (this.errorDir != "up") {
					ctx.beginPath();
					ctx.moveTo(vm.x, middle);
					ctx.lineTo(vm.x, bottom);
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(leftX, bottom);
					ctx.lineTo(rightX, bottom);
					ctx.stroke();
				}

      }
    });


}).call(this);
