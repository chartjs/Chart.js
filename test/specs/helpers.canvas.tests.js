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

	describe('roundedRect', function() {
		it('should create a rounded rectangle path', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 30, 40, 5);

			expect(context.getCalls()).toEqual([
				{name: 'moveTo', args: [10, 25]},
				{name: 'arc', args: [15, 25, 5, -Math.PI, -Math.PI / 2]},
				{name: 'arc', args: [35, 25, 5, -Math.PI / 2, 0]},
				{name: 'arc', args: [35, 55, 5, 0, Math.PI / 2]},
				{name: 'arc', args: [15, 55, 5, Math.PI / 2, Math.PI]},
				{name: 'closePath', args: []},
				{name: 'moveTo', args: [10, 20]}
			]);
		});
		it('should optimize path if radius is exactly half of height', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 40, 30, 15);

			expect(context.getCalls()).toEqual([
				{name: 'moveTo', args: [10, 35]},
				{name: 'moveTo', args: [25, 20]},
				{name: 'arc', args: [35, 35, 15, -Math.PI / 2, Math.PI / 2]},
				{name: 'arc', args: [25, 35, 15, Math.PI / 2, Math.PI * 3 / 2]},
				{name: 'closePath', args: []},
				{name: 'moveTo', args: [10, 20]}
			]);
		});
		it('should optimize path if radius is exactly half of width', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 30, 40, 15);

			expect(context.getCalls()).toEqual([
				{name: 'moveTo', args: [10, 35]},
				{name: 'arc', args: [25, 35, 15, -Math.PI, 0]},
				{name: 'arc', args: [25, 45, 15, 0, Math.PI]},
				{name: 'closePath', args: []},
				{name: 'moveTo', args: [10, 20]}
			]);
		});
		it('should optimize path if radius is exactly half of width and height', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 30, 30, 15);

			expect(context.getCalls()).toEqual([
				{name: 'moveTo', args: [10, 35]},
				{name: 'arc', args: [25, 35, 15, -Math.PI, Math.PI]},
				{name: 'closePath', args: []},
				{name: 'moveTo', args: [10, 20]}
			]);
		});
		it('should optimize path if radius is 0', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 30, 40, 0);

			expect(context.getCalls()).toEqual([{name: 'rect', args: [10, 20, 30, 40]}]);
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
