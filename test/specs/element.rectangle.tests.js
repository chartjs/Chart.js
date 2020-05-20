// Test the rectangle element

describe('Rectangle element tests', function() {
	it('Should correctly identify as in range', function() {
		var rectangle = new Chart.elements.Rectangle({
			base: 0,
			width: 4,
			x: 10,
			y: 15
		});

		expect(rectangle.inRange(10, 15)).toBe(true);
		expect(rectangle.inRange(10, 10)).toBe(true);
		expect(rectangle.inRange(10, 16)).toBe(false);
		expect(rectangle.inRange(5, 5)).toBe(false);

		// Test when the y is below the base (negative bar)
		var negativeRectangle = new Chart.elements.Rectangle({
			base: 0,
			width: 4,
			x: 10,
			y: -15
		});

		expect(negativeRectangle.inRange(10, -16)).toBe(false);
		expect(negativeRectangle.inRange(10, 1)).toBe(false);
		expect(negativeRectangle.inRange(10, -5)).toBe(true);
	});

	it('should get the correct tooltip position', function() {
		var rectangle = new Chart.elements.Rectangle({
			base: 0,
			width: 4,
			x: 10,
			y: 15
		});

		expect(rectangle.tooltipPosition()).toEqual({
			x: 10,
			y: 15,
		});

		// Test when the y is below the base (negative bar)
		var negativeRectangle = new Chart.elements.Rectangle({
			base: -10,
			width: 4,
			x: 10,
			y: -15
		});

		expect(negativeRectangle.tooltipPosition()).toEqual({
			x: 10,
			y: -15,
		});
	});

	it('should get the center', function() {
		var rectangle = new Chart.elements.Rectangle({
			base: 0,
			width: 4,
			x: 10,
			y: 15
		});

		expect(rectangle.getCenterPoint()).toEqual({x: 10, y: 7.5});
	});
});
