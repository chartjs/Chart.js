// Tests for the line element
describe('Chart.elements.Line', function() {
	describe('auto', jasmine.fixture.specs('element.line'));

	it('should be constructed', function() {
		var line = new Chart.elements.Line({
			points: [1, 2, 3, 4]
		});

		expect(line).not.toBe(undefined);
		expect(line.points).toEqual([1, 2, 3, 4]);
	});
});
