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
});
