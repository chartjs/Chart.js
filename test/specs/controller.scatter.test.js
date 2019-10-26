describe('Chart.controllers.scatter', function() {
	it('should be registered as dataset controller', function() {
		expect(typeof Chart.controllers.scatter).toBe('function');
	});

	it('should test default tooltip callbacks', function() {
		var chart = window.acquireChart({
			type: 'scatter',
			data: {
				datasets: [{
					data: [{
						x: 10,
						y: 15
					}],
					label: 'dataset1'
				}],
			},
			options: {}
		});
		var point = chart.getDatasetMeta(0).data[0];
		jasmine.triggerMouseEvent(chart, 'mousemove', point);

		// Title should be empty
		expect(chart.tooltip._view.title.length).toBe(0);
		expect(chart.tooltip._view.body[0].lines).toEqual(['(10, 15)']);
	});

	describe('showLines option', function() {
		it('should not draw a line if undefined', function() {
			var chart = window.acquireChart({
				type: 'scatter',
				data: {
					datasets: [{
						data: [{x: 10, y: 15}],
						label: 'dataset1'
					}],
				},
				options: {}
			});

			var meta = chart.getDatasetMeta(0);
			spyOn(meta.dataset, 'draw');
			spyOn(meta.data[0], 'draw');

			chart.update();

			expect(meta.dataset.draw.calls.count()).toBe(0);
			expect(meta.data[0].draw.calls.count()).toBe(1);
		});

		it('should draw a line if true', function() {
			var chart = window.acquireChart({
				type: 'scatter',
				data: {
					datasets: [{
						data: [{x: 10, y: 15}],
						showLine: true,
						label: 'dataset1'
					}],
				},
				options: {}
			});

			var meta = chart.getDatasetMeta(0);
			spyOn(meta.dataset, 'draw');
			spyOn(meta.data[0], 'draw');

			chart.update();

			expect(meta.dataset.draw.calls.count()).toBe(1);
			expect(meta.data[0].draw.calls.count()).toBe(1);
		});
	});
});
