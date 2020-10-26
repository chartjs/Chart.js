// Test the rectangle element

describe('Arc element tests', function() {
	it ('should determine if in range', function() {
		// Mock out the arc as if the controller put it there
		var arc = new Chart.elements.ArcElement({
			startAngle: 0,
			endAngle: Math.PI / 2,
			x: 0,
			y: 0,
			innerRadius: 5,
			outerRadius: 10,
		});

		expect(arc.inRange(2, 2)).toBe(false);
		expect(arc.inRange(7, 0)).toBe(true);
		expect(arc.inRange(0, 11)).toBe(false);
		expect(arc.inRange(Math.sqrt(32), Math.sqrt(32))).toBe(true);
		expect(arc.inRange(-1.0 * Math.sqrt(7), Math.sqrt(7))).toBe(false);
	});

	it ('should determine if in range, when full circle', function() {
		// Mock out the arc as if the controller put it there
		var arc = new Chart.elements.ArcElement({
			startAngle: -Math.PI,
			endAngle: Math.PI * 1.5,
			x: 0,
			y: 0,
			innerRadius: 0,
			outerRadius: 10,
			circumference: Math.PI * 2
		});

		expect(arc.inRange(7, 7)).toBe(true);
	});

	it ('should get the tooltip position', function() {
		// Mock out the arc as if the controller put it there
		var arc = new Chart.elements.ArcElement({
			startAngle: 0,
			endAngle: Math.PI / 2,
			x: 0,
			y: 0,
			innerRadius: 0,
			outerRadius: Math.sqrt(2),
		});

		var pos = arc.tooltipPosition();
		expect(pos.x).toBeCloseTo(0.5);
		expect(pos.y).toBeCloseTo(0.5);
	});

	it ('should get the center', function() {
		// Mock out the arc as if the controller put it there
		var arc = new Chart.elements.ArcElement({
			startAngle: 0,
			endAngle: Math.PI / 2,
			x: 0,
			y: 0,
			innerRadius: 0,
			outerRadius: Math.sqrt(2),
		});

		var center = arc.getCenterPoint();
		expect(center.x).toBeCloseTo(0.5, 6);
		expect(center.y).toBeCloseTo(0.5, 6);
	});
});
