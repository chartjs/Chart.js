describe('Math helper tests', function() {

	var helpers;

	beforeAll(function() {
		helpers = window.Chart.helpers;
	});

	it('should get the correct sign', function() {
		expect(helpers.math.sign(0)).toBe(0);
		expect(helpers.math.sign(10)).toBe(1);
		expect(helpers.math.sign(-5)).toBe(-1);
	});

	it('should do a log10 operation', function() {
		expect(helpers.math.log10(0)).toBe(-Infinity);

		// Check all allowed powers of 10, which should return integer values
		var maxPowerOf10 = Math.floor(helpers.math.log10(Number.MAX_VALUE));
		for (var i = 0; i < maxPowerOf10; i += 1) {
			expect(helpers.math.log10(Math.pow(10, i))).toBe(i);
		}
	});

	it('should correctly determine if two numbers are essentially equal', function() {
		expect(helpers.math.almostEquals(0, Number.EPSILON, 2 * Number.EPSILON)).toBe(true);
		expect(helpers.math.almostEquals(1, 1.1, 0.0001)).toBe(false);
		expect(helpers.math.almostEquals(1e30, 1e30 + Number.EPSILON, 0)).toBe(false);
		expect(helpers.math.almostEquals(1e30, 1e30 + Number.EPSILON, 2 * Number.EPSILON)).toBe(true);
	});

	it('should correctly determine if a numbers are essentially whole', function() {
		expect(helpers.math.almostWhole(0.99999, 0.0001)).toBe(true);
		expect(helpers.math.almostWhole(0.9, 0.0001)).toBe(false);
	});

	it('should detect a number', function() {
		expect(helpers.math.isNumber(123)).toBe(true);
		expect(helpers.math.isNumber('123')).toBe(true);
		expect(helpers.math.isNumber(null)).toBe(false);
		expect(helpers.math.isNumber(NaN)).toBe(false);
		expect(helpers.math.isNumber(undefined)).toBe(false);
		expect(helpers.math.isNumber('cbc')).toBe(false);
	});

	it('should convert between radians and degrees', function() {
		expect(helpers.math.toRadians(180)).toBe(Math.PI);
		expect(helpers.math.toRadians(90)).toBe(0.5 * Math.PI);
		expect(helpers.math.toDegrees(Math.PI)).toBe(180);
		expect(helpers.math.toDegrees(Math.PI * 3 / 2)).toBe(270);
	});

	it('should get the correct number of decimal places', function() {
		expect(helpers.math.decimalPlaces(100)).toBe(0);
		expect(helpers.math.decimalPlaces(1)).toBe(0);
		expect(helpers.math.decimalPlaces(0)).toBe(0);
		expect(helpers.math.decimalPlaces(0.01)).toBe(2);
		expect(helpers.math.decimalPlaces(-0.01)).toBe(2);
		expect(helpers.math.decimalPlaces('1')).toBe(undefined);
		expect(helpers.math.decimalPlaces('')).toBe(undefined);
		expect(helpers.math.decimalPlaces(undefined)).toBe(undefined);
	});

	it('should get an angle from a point', function() {
		var center = {
			x: 0,
			y: 0
		};

		expect(helpers.math.getAngleFromPoint(center, {
			x: 0,
			y: 10
		})).toEqual({
			angle: Math.PI / 2,
			distance: 10,
		});

		expect(helpers.math.getAngleFromPoint(center, {
			x: Math.sqrt(2),
			y: Math.sqrt(2)
		})).toEqual({
			angle: Math.PI / 4,
			distance: 2
		});

		expect(helpers.math.getAngleFromPoint(center, {
			x: -1.0 * Math.sqrt(2),
			y: -1.0 * Math.sqrt(2)
		})).toEqual({
			angle: Math.PI * 1.25,
			distance: 2
		});
	});

	it('should spline curves', function() {
		expect(helpers.math.splineCurve({
			x: 0,
			y: 0
		}, {
			x: 1,
			y: 1
		}, {
			x: 2,
			y: 0
		}, 0)).toEqual({
			previous: {
				x: 1,
				y: 1,
			},
			next: {
				x: 1,
				y: 1,
			}
		});

		expect(helpers.math.splineCurve({
			x: 0,
			y: 0
		}, {
			x: 1,
			y: 1
		}, {
			x: 2,
			y: 0
		}, 1)).toEqual({
			previous: {
				x: 0,
				y: 1,
			},
			next: {
				x: 2,
				y: 1,
			}
		});
	});

	it('should spline curves with monotone cubic interpolation', function() {
		var dataPoints = [
			{_model: {x: 0, y: 0, skip: false}},
			{_model: {x: 3, y: 6, skip: false}},
			{_model: {x: 9, y: 6, skip: false}},
			{_model: {x: 12, y: 60, skip: false}},
			{_model: {x: 15, y: 60, skip: false}},
			{_model: {x: 18, y: 120, skip: false}},
			{_model: {x: null, y: null, skip: true}},
			{_model: {x: 21, y: 180, skip: false}},
			{_model: {x: 24, y: 120, skip: false}},
			{_model: {x: 27, y: 125, skip: false}},
			{_model: {x: 30, y: 105, skip: false}},
			{_model: {x: 33, y: 110, skip: false}},
			{_model: {x: 33, y: 110, skip: false}},
			{_model: {x: 36, y: 170, skip: false}}
		];
		helpers.math.splineCurveMonotone(dataPoints);
		expect(dataPoints).toEqual([{
			_model: {
				x: 0,
				y: 0,
				skip: false,
				controlPointNextX: 1,
				controlPointNextY: 2
			}
		},
		{
			_model: {
				x: 3,
				y: 6,
				skip: false,
				controlPointPreviousX: 2,
				controlPointPreviousY: 6,
				controlPointNextX: 5,
				controlPointNextY: 6
			}
		},
		{
			_model: {
				x: 9,
				y: 6,
				skip: false,
				controlPointPreviousX: 7,
				controlPointPreviousY: 6,
				controlPointNextX: 10,
				controlPointNextY: 6
			}
		},
		{
			_model: {
				x: 12,
				y: 60,
				skip: false,
				controlPointPreviousX: 11,
				controlPointPreviousY: 60,
				controlPointNextX: 13,
				controlPointNextY: 60
			}
		},
		{
			_model: {
				x: 15,
				y: 60,
				skip: false,
				controlPointPreviousX: 14,
				controlPointPreviousY: 60,
				controlPointNextX: 16,
				controlPointNextY: 60
			}
		},
		{
			_model: {
				x: 18,
				y: 120,
				skip: false,
				controlPointPreviousX: 17,
				controlPointPreviousY: 100
			}
		},
		{
			_model: {
				x: null,
				y: null,
				skip: true
			}
		},
		{
			_model: {
				x: 21,
				y: 180,
				skip: false,
				controlPointNextX: 22,
				controlPointNextY: 160
			}
		},
		{
			_model: {
				x: 24,
				y: 120,
				skip: false,
				controlPointPreviousX: 23,
				controlPointPreviousY: 120,
				controlPointNextX: 25,
				controlPointNextY: 120
			}
		},
		{
			_model: {
				x: 27,
				y: 125,
				skip: false,
				controlPointPreviousX: 26,
				controlPointPreviousY: 125,
				controlPointNextX: 28,
				controlPointNextY: 125
			}
		},
		{
			_model: {
				x: 30,
				y: 105,
				skip: false,
				controlPointPreviousX: 29,
				controlPointPreviousY: 105,
				controlPointNextX: 31,
				controlPointNextY: 105
			}
		},
		{
			_model: {
				x: 33,
				y: 110,
				skip: false,
				controlPointPreviousX: 32,
				controlPointPreviousY: 110,
				controlPointNextX: 33,
				controlPointNextY: 110
			}
		},
		{
			_model: {
				x: 33,
				y: 110,
				skip: false,
				controlPointPreviousX: 33,
				controlPointPreviousY: 110,
				controlPointNextX: 34,
				controlPointNextY: 110
			}
		},
		{
			_model: {
				x: 36,
				y: 170,
				skip: false,
				controlPointPreviousX: 35,
				controlPointPreviousY: 150
			}
		}]);
	});

	it('should get the next or previous item in an array', function() {
		var testData = [0, 1, 2];

		expect(helpers.math.nextItem(testData, 0, false)).toEqual(1);
		expect(helpers.math.nextItem(testData, 2, false)).toEqual(2);
		expect(helpers.math.nextItem(testData, 2, true)).toEqual(0);
		expect(helpers.math.nextItem(testData, 1, true)).toEqual(2);
		expect(helpers.math.nextItem(testData, -1, false)).toEqual(0);

		expect(helpers.math.previousItem(testData, 0, false)).toEqual(0);
		expect(helpers.math.previousItem(testData, 0, true)).toEqual(2);
		expect(helpers.math.previousItem(testData, 2, false)).toEqual(1);
		expect(helpers.math.previousItem(testData, 1, true)).toEqual(0);
	});
});
