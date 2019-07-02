'use strict';

describe('Chart.helpers.math', function() {
	var factorize = Chart.helpers.math._factorize;

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
});
