'use strict';


describe('Chart.helpers.math', function() {
	var math = Chart.helpers.math;
	var factorize = math._factorize;
	var decimalPlaces = math._decimalPlaces;

	it('should factorize', function() {
		expect(factorize(1000)).toEqual([1, 2, 4, 5, 8, 10, 20, 25, 40, 50, 100, 125, 200, 250, 500]);
		expect(factorize(60)).toEqual([1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30]);
		expect(factorize(30)).toEqual([1, 2, 3, 5, 6, 10, 15]);
		expect(factorize(24)).toEqual([1, 2, 3, 4, 6, 8, 12]);
		expect(factorize(12)).toEqual([1, 2, 3, 4, 6]);
		expect(factorize(4)).toEqual([1, 2]);
		expect(factorize(-1)).toEqual([]);
		expect(factorize(2.76)).toEqual([]);
	});

	it('should do a log10 operation', function() {
		expect(math.log10(0)).toBe(-Infinity);

		// Check all allowed powers of 10, which should return integer values
		var maxPowerOf10 = Math.floor(math.log10(Number.MAX_VALUE));
		for (var i = 0; i < maxPowerOf10; i += 1) {
			expect(math.log10(Math.pow(10, i))).toBe(i);
		}
	});

	it('should get the correct number of decimal places', function() {
		expect(decimalPlaces(100)).toBe(0);
		expect(decimalPlaces(1)).toBe(0);
		expect(decimalPlaces(0)).toBe(0);
		expect(decimalPlaces(0.01)).toBe(2);
		expect(decimalPlaces(-0.01)).toBe(2);
		expect(decimalPlaces('1')).toBe(undefined);
		expect(decimalPlaces('')).toBe(undefined);
		expect(decimalPlaces(undefined)).toBe(undefined);
		expect(decimalPlaces(12345678.1234)).toBe(4);
		expect(decimalPlaces(1234567890.1234567)).toBe(7);
	});

	it('should get an angle from a point', function() {
		var center = {
			x: 0,
			y: 0
		};

		expect(math.getAngleFromPoint(center, {
			x: 0,
			y: 10
		})).toEqual({
			angle: Math.PI / 2,
			distance: 10,
		});

		expect(math.getAngleFromPoint(center, {
			x: Math.sqrt(2),
			y: Math.sqrt(2)
		})).toEqual({
			angle: Math.PI / 4,
			distance: 2
		});

		expect(math.getAngleFromPoint(center, {
			x: -1.0 * Math.sqrt(2),
			y: -1.0 * Math.sqrt(2)
		})).toEqual({
			angle: Math.PI * 1.25,
			distance: 2
		});
	});

	it('should convert between radians and degrees', function() {
		expect(math.toRadians(180)).toBe(Math.PI);
		expect(math.toRadians(90)).toBe(0.5 * Math.PI);
		expect(math.toDegrees(Math.PI)).toBe(180);
		expect(math.toDegrees(Math.PI * 3 / 2)).toBe(270);
	});

	it('should correctly determine if two numbers are essentially equal', function() {
		expect(math.almostEquals(0, Number.EPSILON, 2 * Number.EPSILON)).toBe(true);
		expect(math.almostEquals(1, 1.1, 0.0001)).toBe(false);
		expect(math.almostEquals(1e30, 1e30 + Number.EPSILON, 0)).toBe(false);
		expect(math.almostEquals(1e30, 1e30 + Number.EPSILON, 2 * Number.EPSILON)).toBe(true);
	});

	it('should get the correct sign', function() {
		expect(math.sign(0)).toBe(0);
		expect(math.sign(10)).toBe(1);
		expect(math.sign(-5)).toBe(-1);
	});

	it('should correctly determine if a numbers are essentially whole', function() {
		expect(math.almostWhole(0.99999, 0.0001)).toBe(true);
		expect(math.almostWhole(0.9, 0.0001)).toBe(false);
		expect(math.almostWhole(1234567890123, 0.0001)).toBe(true);
		expect(math.almostWhole(1234567890123.001, 0.0001)).toBe(false);
	});

	it('should detect a number', function() {
		expect(math.isNumber(123)).toBe(true);
		expect(math.isNumber('123')).toBe(true);
		expect(math.isNumber(null)).toBe(false);
		expect(math.isNumber(NaN)).toBe(false);
		expect(math.isNumber(undefined)).toBe(false);
		expect(math.isNumber('cbc')).toBe(false);
	});
});
