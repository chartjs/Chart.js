describe('Chart.controllers.scatter', function() {
	describe('auto', jasmine.fixture.specs('controller.scatter'));

	it('should be registered as dataset controller', function() {
		expect(typeof Chart.controllers.scatter).toBe('function');
	});

	it('should test default tooltip callbacks', function(done) {
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

		afterEvent(chart, 'mousemove', function() {
			// Title should be empty
			expect(chart.tooltip.title.length).toBe(0);
			expect(chart.tooltip.body[0].lines).toEqual(['(10, 15)']);

			done();
		});

		jasmine.triggerMouseEvent(chart, 'mousemove', point);
	});
});
