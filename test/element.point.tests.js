// Test the point element

describe('Point element tests', function() {
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
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1
		});

		// Safely handles if these are called before the viewmodel is instantiated
		expect(point.inRange(5)).toBe(false);
		expect(point.inLabelRange(5)).toBe(false);

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			hitRadius: 3,
			x: 10,
			y: 15
		};

		expect(point.inRange(10, 15)).toBe(true);
		expect(point.inRange(10, 10)).toBe(false);
		expect(point.inRange(10, 5)).toBe(false);
		expect(point.inRange(5, 5)).toBe(false);

		expect(point.inLabelRange(5)).toBe(false);
		expect(point.inLabelRange(7)).toBe(true);
		expect(point.inLabelRange(10)).toBe(true);
		expect(point.inLabelRange(12)).toBe(true);
		expect(point.inLabelRange(15)).toBe(false);
		expect(point.inLabelRange(20)).toBe(false);
	});

	it ('should get the correct tooltip position', function() {
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			borderWidth: 6,
			x: 10,
			y: 15
		};

		expect(point.tooltipPosition()).toEqual({
			x: 10,
			y: 15,
			padding: 8
		});
	});

	it ('should draw correctly', function() {
		var mockContext = window.createMockContext();
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1,
			_chart: {
				ctx: mockContext,
			}
		});

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			hitRadius: 3,
			borderColor: 'rgba(1, 2, 3, 1)',
			borderWidth: 6,
			backgroundColor: 'rgba(0, 255, 0)',
			x: 10,
			y: 15,
			ctx: mockContext
		};

		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'beginPath',
			args: []
		}, {
			name: 'arc',
			args: [10, 15, 2, 0, 2 * Math.PI]
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'setStrokeStyle',
			args: ['rgba(1, 2, 3, 1)']
		}, {
			name: 'setLineWidth',
			args: [6]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0, 255, 0)']
		}, {
			name: 'fill',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}]);
	});

	it ('should draw correctly with default settings if necessary', function() {
		var mockContext = window.createMockContext();
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1,
			_chart: {
				ctx: mockContext,
			}
		});

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			hitRadius: 3,
			x: 10,
			y: 15,
			ctx: mockContext
		};

		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'beginPath',
			args: []
		}, {
			name: 'arc',
			args: [10, 15, 2, 0, 2 * Math.PI]
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'setStrokeStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'setLineWidth',
			args: [1]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'fill',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}]);
	});

	it ('should not draw if skipped', function() {
		var mockContext = window.createMockContext();
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1,
			_chart: {
				ctx: mockContext,
			}
		});

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			hitRadius: 3,
			x: 10,
			y: 15,
			ctx: mockContext,
			skip: true
		};

		point.draw();

		expect(mockContext.getCalls()).toEqual([]);
	});
});