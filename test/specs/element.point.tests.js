describe('Chart.elements.Point', function() {
	describe('auto', jasmine.fixture.specs('element.point'));

	it ('Should be constructed', function() {
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1
		});

		expect(point).not.toBe(undefined);
		expect(point._datasetIndex).toBe(2);
		expect(point._index).toBe(1);
	});

	it ('Should correctly identify as in range', function() {
		// Mock out the point as if we were made by the controller
		var point = new Chart.elements.Point({
			options: {
				radius: 2,
				hitRadius: 3,
			},
			x: 10,
			y: 15
		});

		expect(point.inRange(10, 15)).toBe(true);
		expect(point.inRange(10, 10)).toBe(false);
		expect(point.inRange(10, 5)).toBe(false);
		expect(point.inRange(5, 5)).toBe(false);
	});

	it ('should get the correct tooltip position', function() {
		// Mock out the point as if we were made by the controller
		var point = new Chart.elements.Point({
			options: {
				radius: 2,
				borderWidth: 6,
			},
			x: 10,
			y: 15
		});

		expect(point.tooltipPosition()).toEqual({
			x: 10,
			y: 15,
			padding: 8
		});
	});

	it('should get the correct center point', function() {
		// Mock out the point as if we were made by the controller
		var point = new Chart.elements.Point({
			options: {
				radius: 2,
			},
			x: 10,
			y: 10
		});

		expect(point.getCenterPoint()).toEqual({x: 10, y: 10});
	});

	it ('should not draw if skipped', function() {
		var mockContext = window.createMockContext();

		// Mock out the point as if we were made by the controller
		var point = new Chart.elements.Point({
			options: {
				radius: 2,
				hitRadius: 3,
			},
			x: 10,
			y: 15,
			skip: true
		});

		point.draw(mockContext);

		expect(mockContext.getCalls()).toEqual([]);
	});
});
