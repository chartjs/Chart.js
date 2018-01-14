describe('Chart.controllers.line', function() {

	it('should not draw a line if the options showLines is not set', function() {
		var chart = window.acquireChart({
			type: 'scatter',
			data: {
				datasets: [{
					data: [
						{x: 10, y: 15},
						{x: 0, y: -8},
						{x: -50, y: -6},
						{x: 12, y: -4},
						{x: -9, y: 8}
					],
					label: 'dataset1'
				}],
			},
			options: {}
		});

		var meta = chart.getDatasetMeta(0);
		spyOn(meta.dataset, 'draw');
		spyOn(meta.data[0], 'draw');
		spyOn(meta.data[1], 'draw');
		spyOn(meta.data[2], 'draw');
		spyOn(meta.data[3], 'draw');
		spyOn(meta.data[4], 'draw');

		chart.update();

		expect(meta.dataset.draw.calls.count()).toBe(0);
		expect(meta.data[0].draw.calls.count()).toBe(1);
		expect(meta.data[1].draw.calls.count()).toBe(1);
		expect(meta.data[2].draw.calls.count()).toBe(1);
		expect(meta.data[3].draw.calls.count()).toBe(1);
		expect(meta.data[4].draw.calls.count()).toBe(1);
	});

	it('should not draw a line if the options showLines set to false', function() {
		var chart = window.acquireChart({
			type: 'scatter',
			data: {
				datasets: [{
					data: [
						{x: 10, y: 15},
						{x: 0, y: -8},
						{x: -50, y: -6},
						{x: 12, y: -4},
						{x: -9, y: 8}
					],
					label: 'dataset1'
				}],
			},
			options: {
				showLines: false
			}
		});

		var meta = chart.getDatasetMeta(0);
		spyOn(meta.dataset, 'draw');
		spyOn(meta.data[0], 'draw');
		spyOn(meta.data[1], 'draw');
		spyOn(meta.data[2], 'draw');
		spyOn(meta.data[3], 'draw');
		spyOn(meta.data[4], 'draw');

		chart.update();

		expect(meta.dataset.draw.calls.count()).toBe(0);
		expect(meta.data[0].draw.calls.count()).toBe(1);
		expect(meta.data[1].draw.calls.count()).toBe(1);
		expect(meta.data[2].draw.calls.count()).toBe(1);
		expect(meta.data[3].draw.calls.count()).toBe(1);
		expect(meta.data[4].draw.calls.count()).toBe(1);
	});

	it('should draw a line if the options showLines is set to true', function() {
		var chart = window.acquireChart({
			type: 'scatter',
			data: {
				datasets: [{
					data: [
						{x: 10, y: 15},
						{x: 0, y: -8},
						{x: -50, y: -6},
						{x: 12, y: -4},
						{x: -9, y: 8}
					],
					label: 'dataset1'
				}],
			},
			options: {
				showLines: true
			}
		});

		var meta = chart.getDatasetMeta(0);
		spyOn(meta.dataset, 'draw');
		spyOn(meta.data[0], 'draw');
		spyOn(meta.data[1], 'draw');
		spyOn(meta.data[2], 'draw');
		spyOn(meta.data[3], 'draw');
		spyOn(meta.data[4], 'draw');

		chart.update();

		expect(meta.dataset.draw.calls.count()).toBe(1);
		expect(meta.data[0].draw.calls.count()).toBe(1);
		expect(meta.data[1].draw.calls.count()).toBe(1);
		expect(meta.data[2].draw.calls.count()).toBe(1);
		expect(meta.data[3].draw.calls.count()).toBe(1);
		expect(meta.data[4].draw.calls.count()).toBe(1);
	});

});
