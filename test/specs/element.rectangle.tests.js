// Test the rectangle element

describe('Rectangle element tests', function() {
	it('Should be constructed', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		expect(rectangle).not.toBe(undefined);
		expect(rectangle._datasetIndex).toBe(2);
		expect(rectangle._index).toBe(1);
	});

	it('Should correctly identify as in range', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Safely handles if these are called before the viewmodel is instantiated
		expect(rectangle.inRange(5)).toBe(false);

		// Attach a view object as if we were the controller
		rectangle._view = {
			base: 0,
			width: 4,
			x: 10,
			y: 15
		};

		expect(rectangle.inRange(10, 15)).toBe(true);
		expect(rectangle.inRange(10, 10)).toBe(true);
		expect(rectangle.inRange(10, 16)).toBe(false);
		expect(rectangle.inRange(5, 5)).toBe(false);

		// Test when the y is below the base (negative bar)
		var negativeRectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		negativeRectangle._view = {
			base: 0,
			width: 4,
			x: 10,
			y: -15
		};

		expect(negativeRectangle.inRange(10, -16)).toBe(false);
		expect(negativeRectangle.inRange(10, 1)).toBe(false);
		expect(negativeRectangle.inRange(10, -5)).toBe(true);
	});

	it('should get the correct tooltip position', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			base: 0,
			width: 4,
			x: 10,
			y: 15
		};

		expect(rectangle.tooltipPosition()).toEqual({
			x: 10,
			y: 15,
		});

		// Test when the y is below the base (negative bar)
		var negativeRectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		negativeRectangle._view = {
			base: -10,
			width: 4,
			x: 10,
			y: -15
		};

		expect(negativeRectangle.tooltipPosition()).toEqual({
			x: 10,
			y: -15,
		});
	});

	it('should get the center', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			base: 0,
			width: 4,
			x: 10,
			y: 15
		};

		expect(rectangle.getCenterPoint()).toEqual({x: 10, y: 7.5});
	});
});
