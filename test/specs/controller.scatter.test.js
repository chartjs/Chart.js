describe('Chart.controllers.scatter', function() {
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
	});
});
