'use strict';

describe('Chart.helpers.easing', function() {
	var helpers = Chart.helpers;

	describe('effects', function() {
		var expected = {
			easeInOutBack: [-0, -0.03751855, -0.09255566, -0.07883348, 0.08992579, 0.5, 0.91007421, 1.07883348, 1.09255566, 1.03751855, 1],
			easeInOutBounce: [0, 0.03, 0.11375, 0.045, 0.34875, 0.5, 0.65125, 0.955, 0.88625, 0.97, 1],
			easeInOutCirc: [-0, 0.01010205, 0.04174243, 0.1, 0.2, 0.5, 0.8, 0.9, 0.95825757, 0.98989795, 1],
			easeInOutCubic: [0, 0.004, 0.032, 0.108, 0.256, 0.5, 0.744, 0.892, 0.968, 0.996, 1],
			easeInOutElastic: [0, 0.00033916, -0.00390625, 0.02393889, -0.11746158, 0.5, 1.11746158, 0.97606111, 1.00390625, 0.99966084, 1],
			easeInOutExpo: [0, 0.00195313, 0.0078125, 0.03125, 0.125, 0.5, 0.875, 0.96875, 0.9921875, 0.99804688, 1],
			easeInOutQuad: [0, 0.02, 0.08, 0.18, 0.32, 0.5, 0.68, 0.82, 0.92, 0.98, 1],
			easeInOutQuart: [0, 0.0008, 0.0128, 0.0648, 0.2048, 0.5, 0.7952, 0.9352, 0.9872, 0.9992, 1],
			easeInOutQuint: [0, 0.00016, 0.00512, 0.03888, 0.16384, 0.5, 0.83616, 0.96112, 0.99488, 0.99984, 1],
			easeInOutSine: [-0, 0.02447174, 0.0954915, 0.20610737, 0.3454915, 0.5, 0.6545085, 0.79389263, 0.9045085, 0.97552826, 1],
			easeInBack: [-0, -0.01431422, -0.04645056, -0.08019954, -0.09935168, -0.0876975, -0.02902752, 0.09286774, 0.29419776, 0.59117202, 1],
			easeInBounce: [0, 0.011875, 0.06, 0.069375, 0.2275, 0.234375, 0.09, 0.319375, 0.6975, 0.924375, 1],
			easeInCirc: [-0, 0.00501256, 0.0202041, 0.0460608, 0.08348486, 0.1339746, 0.2, 0.28585716, 0.4, 0.56411011, 1],
			easeInCubic: [0, 0.001, 0.008, 0.027, 0.064, 0.125, 0.216, 0.343, 0.512, 0.729, 1],
			easeInExpo: [0, 0.00195313, 0.00390625, 0.0078125, 0.015625, 0.03125, 0.0625, 0.125, 0.25, 0.5, 1],
			easeInElastic: [0, 0.00195313, -0.00195313, -0.00390625, 0.015625, -0.015625, -0.03125, 0.125, -0.125, -0.25, 1],
			easeInQuad: [0, 0.01, 0.04, 0.09, 0.16, 0.25, 0.36, 0.49, 0.64, 0.81, 1],
			easeInQuart: [0, 0.0001, 0.0016, 0.0081, 0.0256, 0.0625, 0.1296, 0.2401, 0.4096, 0.6561, 1],
			easeInQuint: [0, 0.00001, 0.00032, 0.00243, 0.01024, 0.03125, 0.07776, 0.16807, 0.32768, 0.59049, 1],
			easeInSine: [0, 0.01231166, 0.04894348, 0.10899348, 0.19098301, 0.29289322, 0.41221475, 0.5460095, 0.69098301, 0.84356553, 1],
			easeOutBack: [0, 0.40882798, 0.70580224, 0.90713226, 1.02902752, 1.0876975, 1.09935168, 1.08019954, 1.04645056, 1.01431422, 1],
			easeOutBounce: [0, 0.075625, 0.3025, 0.680625, 0.91, 0.765625, 0.7725, 0.930625, 0.94, 0.988125, 1],
			easeOutCirc: [0, 0.43588989, 0.6, 0.71414284, 0.8, 0.8660254, 0.91651514, 0.9539392, 0.9797959, 0.99498744, 1],
			easeOutElastic: [0, 1.25, 1.125, 0.875, 1.03125, 1.015625, 0.984375, 1.00390625, 1.00195313, 0.99804688, 1],
			easeOutExpo: [0, 0.5, 0.75, 0.875, 0.9375, 0.96875, 0.984375, 0.9921875, 0.99609375, 0.99804688, 1],
			easeOutCubic: [0, 0.271, 0.488, 0.657, 0.784, 0.875, 0.936, 0.973, 0.992, 0.999, 1],
			easeOutQuad: [0, 0.19, 0.36, 0.51, 0.64, 0.75, 0.84, 0.91, 0.96, 0.99, 1],
			easeOutQuart: [-0, 0.3439, 0.5904, 0.7599, 0.8704, 0.9375, 0.9744, 0.9919, 0.9984, 0.9999, 1],
			easeOutQuint: [0, 0.40951, 0.67232, 0.83193, 0.92224, 0.96875, 0.98976, 0.99757, 0.99968, 0.99999, 1],
			easeOutSine: [0, 0.15643447, 0.30901699, 0.4539905, 0.58778525, 0.70710678, 0.80901699, 0.89100652, 0.95105652, 0.98768834, 1],
			linear: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
		};

		function generate(method) {
			var fn = helpers.easing[method];
			var accuracy = Math.pow(10, 8);
			var count = 10;
			var values = [];
			var i;

			for (i = 0; i <= count; ++i) {
				values.push(Math.round(accuracy * fn(i / count)) / accuracy);
			}

			return values;
		}

		Object.keys(helpers.easing).forEach(function(method) {
			it ('"' + method + '" should return expected values', function() {
				expect(generate(method)).toEqual(expected[method]);
			});
		});
	});
});
