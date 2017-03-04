'use strict';

function toBeCloseToPixel() {
	return {
		compare: function(actual, expected) {
			var result = false;

			if (!isNaN(actual) && !isNaN(expected)) {
				var diff = Math.abs(actual - expected);
				var A = Math.abs(actual);
				var B = Math.abs(expected);
				var percentDiff = 0.005; // 0.5% diff
				result = (diff <= (A > B ? A : B) * percentDiff) || diff < 2; // 2 pixels is fine
			}

			return {pass: result};
		}
	};
}

function toEqualOneOf() {
	return {
		compare: function(actual, expecteds) {
			var result = false;
			for (var i = 0, l = expecteds.length; i < l; i++) {
				if (actual === expecteds[i]) {
					result = true;
					break;
				}
			}
			return {
				pass: result
			};
		}
	};
}

function toBeValidChart() {
	return {
		compare: function(actual) {
			var message = null;

			if (!(actual instanceof Chart)) {
				message = 'Expected ' + actual + ' to be an instance of Chart';
			} else if (!(actual.canvas instanceof HTMLCanvasElement)) {
				message = 'Expected canvas to be an instance of HTMLCanvasElement';
			} else if (!(actual.ctx instanceof CanvasRenderingContext2D)) {
				message = 'Expected context to be an instance of CanvasRenderingContext2D';
			} else if (typeof actual.height !== 'number' || !isFinite(actual.height)) {
				message = 'Expected height to be a strict finite number';
			} else if (typeof actual.width !== 'number' || !isFinite(actual.width)) {
				message = 'Expected width to be a strict finite number';
			}

			return {
				message: message? message : 'Expected ' + actual + ' to be valid chart',
				pass: !message
			};
		}
	};
}

function toBeChartOfSize() {
	return {
		compare: function(actual, expected) {
			var res = toBeValidChart().compare(actual);
			if (!res.pass) {
				return res;
			}

			var message = null;
			var canvas = actual.ctx.canvas;
			var style = getComputedStyle(canvas);
			var pixelRatio = window.devicePixelRatio;
			var dh = parseInt(style.height, 10);
			var dw = parseInt(style.width, 10);
			var rh = canvas.height;
			var rw = canvas.width;
			var orh = rh / pixelRatio;
			var orw = rw / pixelRatio;

			// sanity checks
			if (actual.height !== orh) {
				message = 'Expected chart height ' + actual.height + ' to be equal to original render height ' + orh;
			} else if (actual.width !== orw) {
				message = 'Expected chart width ' + actual.width + ' to be equal to original render width ' + orw;
			}

			// validity checks
			if (dh !== expected.dh) {
				message = 'Expected display height ' + dh + ' to be equal to ' + expected.dh;
			} else if (dw !== expected.dw) {
				message = 'Expected display width ' + dw + ' to be equal to ' + expected.dw;
			} else if (rh !== expected.rh) {
				message = 'Expected render height ' + rh + ' to be equal to ' + expected.rh;
			} else if (rw !== expected.rw) {
				message = 'Expected render width ' + rw + ' to be equal to ' + expected.rw;
			}

			return {
				message: message? message : 'Expected ' + actual + ' to be a chart of size ' + expected,
				pass: !message
			};
		}
	};
}

module.exports = {
	toBeCloseToPixel: toBeCloseToPixel,
	toEqualOneOf: toEqualOneOf,
	toBeValidChart: toBeValidChart,
	toBeChartOfSize: toBeChartOfSize
};
