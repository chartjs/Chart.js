'use strict';

describe('Chart.helpers.canvas', function() {
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

	describe('roundedRect', function() {
		it('should create a rounded rectangle path', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 30, 40, 5);

			expect(context.getCalls()).toEqual([
				{name: 'moveTo', args: [15, 20]},
				{name: 'lineTo', args: [35, 20]},
				{name: 'quadraticCurveTo', args: [40, 20, 40, 25]},
				{name: 'lineTo', args: [40, 55]},
				{name: 'quadraticCurveTo', args: [40, 60, 35, 60]},
				{name: 'lineTo', args: [15, 60]},
				{name: 'quadraticCurveTo', args: [10, 60, 10, 55]},
				{name: 'lineTo', args: [10, 25]},
				{name: 'quadraticCurveTo', args: [10, 20, 15, 20]}
			]);
		});
		it('should optimize path if radius is 0', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 30, 40, 0);

			expect(context.getCalls()).toEqual([{name: 'rect', args: [10, 20, 30, 40]}]);
		});
	});
});
