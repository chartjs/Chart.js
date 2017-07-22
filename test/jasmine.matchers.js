'use strict';

var pixelmatch = require('pixelmatch');
var utils = require('./jasmine.utils');

function toPercent(value) {
	return Math.round(value * 10000) / 100;
}

function createImageData(w, h) {
	var canvas = utils.createCanvas(w, h);
	var context = canvas.getContext('2d');
	return context.getImageData(0, 0, w, h);
}

function canvasFromImageData(data) {
	var canvas = utils.createCanvas(data.width, data.height);
	var context = canvas.getContext('2d');
	context.putImageData(data, 0, 0);
	return canvas;
}

function buildPixelMatchPreview(actual, expected, diff, threshold, tolerance, count) {
	var ratio = count / (actual.width * actual.height);
	var wrapper = document.createElement('div');

	wrapper.style.cssText = 'display: flex; overflow-y: auto';

	[
		{data: actual, label: 'Actual'},
		{data: expected, label: 'Expected'},
		{data: diff, label:
			'diff: ' + count + 'px ' +
			'(' + toPercent(ratio) + '%)<br/>' +
			'thr: ' + toPercent(threshold) + '%, ' +
			'tol: ' + toPercent(tolerance) + '%'
		}
	].forEach(function(values) {
		var item = document.createElement('div');
		item.style.cssText = 'text-align: center; font: 12px monospace; line-height: 1.4; margin: 8px';
		item.innerHTML = '<div style="margin: 8px; height: 32px">' + values.label + '</div>';
		item.appendChild(canvasFromImageData(values.data));
		wrapper.appendChild(item);
	});

	// WORKAROUND: https://github.com/karma-runner/karma-jasmine/issues/139
	wrapper.indexOf = function() {
		return -1;
	};

	return wrapper;
}

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
			} else if (Object.prototype.toString.call(actual.canvas) !== '[object HTMLCanvasElement]') {
				message = 'Expected canvas to be an instance of HTMLCanvasElement';
			} else if (Object.prototype.toString.call(actual.ctx) !== '[object CanvasRenderingContext2D]') {
				message = 'Expected context to be an instance of CanvasRenderingContext2D';
			} else if (typeof actual.height !== 'number' || !isFinite(actual.height)) {
				message = 'Expected height to be a strict finite number';
			} else if (typeof actual.width !== 'number' || !isFinite(actual.width)) {
				message = 'Expected width to be a strict finite number';
			}

			return {
				message: message ? message : 'Expected ' + actual + ' to be valid chart',
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
			var pixelRatio = actual.options.devicePixelRatio || window.devicePixelRatio;
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
				message: message ? message : 'Expected ' + actual + ' to be a chart of size ' + expected,
				pass: !message
			};
		}
	};
}

function toEqualImageData() {
	return {
		compare: function(actual, expected, opts) {
			var message = null;
			var debug = opts.debug || false;
			var tolerance = opts.tolerance === undefined ? 0.001 : opts.tolerance;
			var threshold = opts.threshold === undefined ? 0.1 : opts.threshold;
			var ctx, idata, ddata, w, h, count, ratio;

			if (actual instanceof Chart) {
				ctx = actual.ctx;
			} else if (actual instanceof HTMLCanvasElement) {
				ctx = actual.getContext('2d');
			} else if (actual instanceof CanvasRenderingContext2D) {
				ctx = actual;
			}

			if (ctx) {
				h = expected.height;
				w = expected.width;
				idata = ctx.getImageData(0, 0, w, h);
				ddata = createImageData(w, h);
				count = pixelmatch(idata.data, expected.data, ddata.data, w, h, {threshold: threshold});
				ratio = count / (w * h);

				if ((ratio > tolerance) || debug) {
					message = buildPixelMatchPreview(idata, expected, ddata, threshold, tolerance, count);
				}
			} else {
				message = 'Input value is not a valid image source.';
			}

			return {
				message: message,
				pass: !message
			};
		}
	};
}

module.exports = {
	toBeCloseToPixel: toBeCloseToPixel,
	toEqualOneOf: toEqualOneOf,
	toBeValidChart: toBeValidChart,
	toBeChartOfSize: toBeChartOfSize,
	toEqualImageData: toEqualImageData
};
