// Test the rectangle element

describe('Arc element tests', function() {
	it ('Should be constructed', function() {
		var arc = new Chart.elements.Arc({
			_datasetIndex: 2,
			_index: 1
		});

		expect(arc).not.toBe(undefined);
		expect(arc._datasetIndex).toBe(2);
		expect(arc._index).toBe(1);
	});

	it ('should determine if in range', function() {
		var arc = new Chart.elements.Arc({
			_datasetIndex: 2,
			_index: 1
		});

		// Make sure we can run these before the view is added
		expect(arc.inRange(2, 2)).toBe(false);
		expect(arc.inLabelRange(2)).toBe(false);

		// Mock out the view as if the controller put it there
		arc._view = {
			startAngle: 0,
			endAngle: Math.PI / 2,
			x: 0,
			y: 0,
			innerRadius: 5,
			outerRadius: 10,
		};

		expect(arc.inRange(2, 2)).toBe(false);
		expect(arc.inRange(7, 0)).toBe(true);
		expect(arc.inRange(0, 11)).toBe(false);
		expect(arc.inRange(Math.sqrt(32), Math.sqrt(32))).toBe(true);
		expect(arc.inRange(-1.0 * Math.sqrt(7), Math.sqrt(7))).toBe(false);
	});

	it ('should get the tooltip position', function() {
		var arc = new Chart.elements.Arc({
			_datasetIndex: 2,
			_index: 1
		});

		// Mock out the view as if the controller put it there
		arc._view = {
			startAngle: 0,
			endAngle: Math.PI / 2,
			x: 0,
			y: 0,
			innerRadius: 0,
			outerRadius: Math.sqrt(2),
		};

		var pos = arc.tooltipPosition();
		expect(pos.x).toBeCloseTo(0.5);
		expect(pos.y).toBeCloseTo(0.5);
	});

	it ('should get the area', function() {
		var arc = new Chart.elements.Arc({
			_datasetIndex: 2,
			_index: 1
		});

		// Mock out the view as if the controller put it there
		arc._view = {
			startAngle: 0,
			endAngle: Math.PI / 2,
			x: 0,
			y: 0,
			innerRadius: 0,
			outerRadius: Math.sqrt(2),
		};

		expect(arc.getArea()).toBeCloseTo(0.5 * Math.PI, 6);
	});

	it ('should get the center', function() {
		var arc = new Chart.elements.Arc({
			_datasetIndex: 2,
			_index: 1
		});

		// Mock out the view as if the controller put it there
		arc._view = {
			startAngle: 0,
			endAngle: Math.PI / 2,
			x: 0,
			y: 0,
			innerRadius: 0,
			outerRadius: Math.sqrt(2),
		};

		var center = arc.getCenterPoint();
		expect(center.x).toBeCloseTo(0.5, 6);
		expect(center.y).toBeCloseTo(0.5, 6);
	});

	it ('should draw correctly with no border', function() {
		var mockContext = window.createMockContext();
		var arc = new Chart.elements.Arc({
			_datasetIndex: 2,
			_index: 1,
			_chart: {
				ctx: mockContext,
			}
		});

		// Mock out the view as if the controller put it there
		arc._view = {
			startAngle: 0,
			endAngle: Math.PI / 2,
			x: 10,
			y: 5,
			innerRadius: 1,
			outerRadius: 3,

			backgroundColor: 'rgb(0, 0, 255)',
			borderColor: 'rgb(255, 0, 0)',
		};

		arc.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'beginPath',
			args: []
		}, {
			name: 'arc',
			args: [10, 5, 3, 0, Math.PI / 2]
		}, {
			name: 'arc',
			args: [10, 5, 1, Math.PI / 2, 0, true]
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'setStrokeStyle',
			args: ['rgb(255, 0, 0)']
		}, {
			name: 'setLineWidth',
			args: [undefined]
		}, {
			name: 'setFillStyle',
			args: ['rgb(0, 0, 255)']
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineJoin',
			args: ['bevel']
		}]);
	});

	it ('should draw correctly with a border', function() {
		var mockContext = window.createMockContext();
		var arc = new Chart.elements.Arc({
			_datasetIndex: 2,
			_index: 1,
			_chart: {
				ctx: mockContext,
			}
		});

		// Mock out the view as if the controller put it there
		arc._view = {
			startAngle: 0,
			endAngle: Math.PI / 2,
			x: 10,
			y: 5,
			innerRadius: 1,
			outerRadius: 3,

			backgroundColor: 'rgb(0, 0, 255)',
			borderColor: 'rgb(255, 0, 0)',
			borderWidth: 5
		};

		arc.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'beginPath',
			args: []
		}, {
			name: 'arc',
			args: [10, 5, 3, 0, Math.PI / 2]
		}, {
			name: 'arc',
			args: [10, 5, 1, Math.PI / 2, 0, true]
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'setStrokeStyle',
			args: ['rgb(255, 0, 0)']
		}, {
			name: 'setLineWidth',
			args: [5]
		}, {
			name: 'setFillStyle',
			args: ['rgb(0, 0, 255)']
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineJoin',
			args: ['bevel']
		}, {
			name: 'stroke',
			args: []
		}]);
	});
});
