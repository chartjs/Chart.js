const {_boundSegment} = Chart.helpers;

describe('helpers.segments', function() {
	describe('_boundSegment', function() {
		const points = [{x: 10, y: 1}, {x: 20, y: 2}, {x: 30, y: 3}];
		const segment = {start: 0, end: 2, loop: false};

		it('should not find segment from before the line', function() {
			expect(_boundSegment(segment, points, {property: 'x', start: 5, end: 9.99999})).toEqual([]);
		});

		it('should not find segment from after the line', function() {
			expect(_boundSegment(segment, points, {property: 'x', start: 30.00001, end: 800})).toEqual([]);
		});

		it('should find segment when starting before line', function() {
			expect(_boundSegment(segment, points, {property: 'x', start: 5, end: 15})).toEqual([{start: 0, end: 1, loop: false}]);
		});

		it('should find segment directly on point', function() {
			expect(_boundSegment(segment, points, {property: 'x', start: 10, end: 10})).toEqual([{start: 0, end: 0, loop: false}]);
		});

		it('should find segment from range between points', function() {
			expect(_boundSegment(segment, points, {property: 'x', start: 11, end: 14})).toEqual([{start: 0, end: 1, loop: false}]);
		});

		it('should find segment from point between points', function() {
			expect(_boundSegment(segment, points, {property: 'x', start: 22, end: 22})).toEqual([{start: 1, end: 2, loop: false}]);
		});

		it('should find whole segment', function() {
			expect(_boundSegment(segment, points, {property: 'x', start: 0, end: 50})).toEqual([{start: 0, end: 2, loop: false}]);
		});

		it('should find correct segment from near points', function() {
			expect(_boundSegment(segment, points, {property: 'x', start: 10.001, end: 29.999})).toEqual([{start: 0, end: 2, loop: false}]);
		});

		it('should find segment from after the line', function() {
			expect(_boundSegment(segment, points, {property: 'x', start: 25, end: 35})).toEqual([{start: 1, end: 2, loop: false}]);
		});
	});
});
