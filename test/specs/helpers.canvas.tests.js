'use strict';

describe('Chart.helpers.canvas', function() {
	describe('auto', jasmine.fixture.specs('helpers.canvas'));

	var helpers = Chart.helpers;

	describe('clear', function() {
		it('should clear the chart canvas', function() {
			var chart = acquireChart({}, {
				canvas: {
					style: 'width: 150px; height: 245px'
				}
			});

			spyOn(chart.ctx, 'clearRect');

			helpers.canvas.clear(chart);

			expect(chart.ctx.clearRect.calls.count()).toBe(1);
			expect(chart.ctx.clearRect.calls.first().object).toBe(chart.ctx);
			expect(chart.ctx.clearRect.calls.first().args).toEqual([0, 0, 150, 245]);
		});
	});

	describe('isPointInArea', function() {
		it('should determine if a point is in the area', function() {
			var isPointInArea = helpers.canvas._isPointInArea;
			var area = {left: 0, top: 0, right: 512, bottom: 256};

			expect(isPointInArea({x: 0, y: 0}, area)).toBe(true);
			expect(isPointInArea({x: -1e-12, y: -1e-12}, area)).toBe(true);
			expect(isPointInArea({x: 512, y: 256}, area)).toBe(true);
			expect(isPointInArea({x: 512 + 1e-12, y: 256 + 1e-12}, area)).toBe(true);
			expect(isPointInArea({x: -1e-3, y: 0}, area)).toBe(false);
			expect(isPointInArea({x: 0, y: 256 + 1e-3}, area)).toBe(false);
		});
	});
});
