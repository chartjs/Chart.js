describe('Chart.controllers.doughnut', function() {
	describe('auto', jasmine.fixture.specs('controller.doughnut'));

	it('should be registered as dataset controller', function() {
		expect(typeof Chart.controllers.doughnut).toBe('function');
		expect(Chart.controllers.doughnut).toBe(Chart.controllers.pie);
	});

	it('should be constructed', function() {
		var chart = window.acquireChart({
			type: 'doughnut',
			data: {
				datasets: [{
					data: []
				}],
				labels: []
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.type).toBe('doughnut');
		expect(meta.controller).not.toBe(undefined);
		expect(meta.controller.index).toBe(0);
		expect(meta.data).toEqual([]);

		meta.controller.updateIndex(1);
		expect(meta.controller.index).toBe(1);
	});

	it('should create arc elements for each data item during initialization', function() {
		var chart = window.acquireChart({
			type: 'doughnut',
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: []
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.data.length).toBe(4); // 4 rectangles created
		expect(meta.data[0] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Arc).toBe(true);
	});

	it('should set the innerRadius to 0 if the config option is 0', function() {
		var chart = window.acquireChart({
			type: 'pie',
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: []
			}
		});

		expect(chart.innerRadius).toBe(0);
	});

	it ('should reset and update elements', function() {
		var chart = window.acquireChart({
			type: 'doughnut',
			data: {
				datasets: [{
					data: [1, 2, 3, 4],
					hidden: true
				}, {
					data: [5, 6, 0, 7]
				}, {
					data: [8, 9, 10, 11]
				}],
				labels: ['label0', 'label1', 'label2', 'label3']
			},
			options: {
				legend: false,
				title: false,
				animation: {
					animateRotate: true,
					animateScale: false
				},
				cutoutPercentage: 50,
				rotation: Math.PI * -0.5,
				circumference: Math.PI * 2.0,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(1);

		meta.controller.reset(); // reset first

		expect(meta.data.length).toBe(4);

		[
			{c: 0},
			{c: 0},
			{c: 0},
			{c: 0}
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(256);
			expect(meta.data[i]._model.y).toBeCloseToPixel(256);
			expect(meta.data[i]._model.outerRadius).toBeCloseToPixel(256);
			expect(meta.data[i]._model.innerRadius).toBeCloseToPixel(192);
			expect(meta.data[i]._model.circumference).toBeCloseTo(expected.c, 8);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				startAngle: Math.PI * -0.5,
				endAngle: Math.PI * -0.5,
				backgroundColor: 'rgb(255, 0, 0)',
				borderColor: 'rgb(0, 0, 255)',
				borderWidth: 2
			}));
		});

		chart.update();

		[
			{c: 1.7453292519, s: -1.5707963267, e: 0.1745329251},
			{c: 2.0943951023, s: 0.1745329251, e: 2.2689280275},
			{c: 0, s: 2.2689280275, e: 2.2689280275},
			{c: 2.4434609527, s: 2.2689280275, e: 4.7123889803}
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(256);
			expect(meta.data[i]._model.y).toBeCloseToPixel(256);
			expect(meta.data[i]._model.outerRadius).toBeCloseToPixel(256);
			expect(meta.data[i]._model.innerRadius).toBeCloseToPixel(192);
			expect(meta.data[i]._model.circumference).toBeCloseTo(expected.c, 8);
			expect(meta.data[i]._model.startAngle).toBeCloseTo(expected.s, 8);
			expect(meta.data[i]._model.endAngle).toBeCloseTo(expected.e, 8);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				backgroundColor: 'rgb(255, 0, 0)',
				borderColor: 'rgb(0, 0, 255)',
				borderWidth: 2
			}));
		});

		// Change the amount of data and ensure that arcs are updated accordingly
		chart.data.datasets[1].data = [1, 2]; // remove 2 elements from dataset 0
		chart.update();

		expect(meta.data.length).toBe(2);
		expect(meta.data[0] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Arc).toBe(true);

		// Add data
		chart.data.datasets[1].data = [1, 2, 3, 4];
		chart.update();

		expect(meta.data.length).toBe(4);
		expect(meta.data[0] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Arc).toBe(true);
	});

	it ('should rotate and limit circumference', function() {
		var chart = window.acquireChart({
			type: 'doughnut',
			data: {
				datasets: [{
					data: [2, 4],
					hidden: true
				}, {
					data: [1, 3]
				}, {
					data: [1, 0]
				}],
				labels: ['label0', 'label1']
			},
			options: {
				legend: false,
				title: false,
				cutoutPercentage: 50,
				rotation: Math.PI,
				circumference: Math.PI * 0.5,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(1);

		expect(meta.data.length).toBe(2);

		// Only startAngle, endAngle and circumference should be different.
		[
			{c: Math.PI / 8, s: Math.PI, e: Math.PI + Math.PI / 8},
			{c: 3 * Math.PI / 8, s: Math.PI + Math.PI / 8, e: Math.PI + Math.PI / 2}
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(512);
			expect(meta.data[i]._model.y).toBeCloseToPixel(512);
			expect(meta.data[i]._model.outerRadius).toBeCloseToPixel(512);
			expect(meta.data[i]._model.innerRadius).toBeCloseToPixel(384);
			expect(meta.data[i]._model.circumference).toBeCloseTo(expected.c, 8);
			expect(meta.data[i]._model.startAngle).toBeCloseTo(expected.s, 8);
			expect(meta.data[i]._model.endAngle).toBeCloseTo(expected.e, 8);
		});
	});

	it('should treat negative values as positive', function() {
		var chart = window.acquireChart({
			type: 'doughnut',
			data: {
				datasets: [{
					data: [-1, -3]
				}],
				labels: ['label0', 'label1']
			},
			options: {
				legend: false,
				title: false,
				cutoutPercentage: 50,
				rotation: Math.PI,
				circumference: Math.PI * 0.5,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(0);

		expect(meta.data.length).toBe(2);

		// Only startAngle, endAngle and circumference should be different.
		[
			{c: Math.PI / 8, s: Math.PI, e: Math.PI + Math.PI / 8},
			{c: 3 * Math.PI / 8, s: Math.PI + Math.PI / 8, e: Math.PI + Math.PI / 2}
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.circumference).toBeCloseTo(expected.c, 8);
			expect(meta.data[i]._model.startAngle).toBeCloseTo(expected.s, 8);
			expect(meta.data[i]._model.endAngle).toBeCloseTo(expected.e, 8);
		});
	});

	it ('should draw all arcs', function() {
		var chart = window.acquireChart({
			type: 'doughnut',
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: ['label0', 'label1', 'label2', 'label3']
			}
		});

		var meta = chart.getDatasetMeta(0);

		spyOn(meta.data[0], 'draw');
		spyOn(meta.data[1], 'draw');
		spyOn(meta.data[2], 'draw');
		spyOn(meta.data[3], 'draw');

		chart.update();

		expect(meta.data[0].draw.calls.count()).toBe(1);
		expect(meta.data[1].draw.calls.count()).toBe(1);
		expect(meta.data[2].draw.calls.count()).toBe(1);
		expect(meta.data[3].draw.calls.count()).toBe(1);
	});

	it ('should calculate radiuses based on the border widths of the visible outermost dataset', function() {
		var chart = window.acquireChart({
			type: 'doughnut',
			data: {
				datasets: [{
					data: [2, 4],
					borderWidth: 4,
					hidden: true
				}, {
					data: [1, 3],
					borderWidth: 8
				}, {
					data: [1, 0],
					borderWidth: 12
				}],
				labels: ['label0', 'label1']
			},
			options: {
				legend: false,
				title: false
			}
		});

		chart.update();

		expect(chart.chartArea.bottom - chart.chartArea.top).toBe(512);
		expect(chart.borderWidth).toBe(8);
		expect(chart.outerRadius).toBe(252);
		expect(chart.innerRadius).toBe(126);
		expect(chart.radiusLength).toBe(63);

		var controller = chart.getDatasetMeta(0).controller;
		expect(controller.getMaxBorderWidth()).toBe(8);
		expect(controller.outerRadius).toBe(252);
		expect(controller.innerRadius).toBe(189);

		controller = chart.getDatasetMeta(1).controller;
		expect(controller.getMaxBorderWidth()).toBe(8);
		expect(controller.outerRadius).toBe(252);
		expect(controller.innerRadius).toBe(189);

		controller = chart.getDatasetMeta(2).controller;
		expect(controller.getMaxBorderWidth()).toBe(8);
		expect(controller.outerRadius).toBe(189);
		expect(controller.innerRadius).toBe(126);
	});

	describe('Interactions', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
				type: 'doughnut',
				data: {
					labels: ['label1', 'label2', 'label3', 'label4'],
					datasets: [{
						data: [10, 15, 0, 4]
					}]
				},
				options: {
					cutoutPercentage: 0,
					elements: {
						arc: {
							backgroundColor: 'rgb(100, 150, 200)',
							borderColor: 'rgb(50, 100, 150)',
							borderWidth: 2,
						}
					}
				}
			});
		});

		it ('should handle default hover styles', function() {
			var chart = this.chart;
			var arc = chart.getDatasetMeta(0).data[0];

			jasmine.triggerMouseEvent(chart, 'mousemove', arc);
			expect(arc._model.backgroundColor).toBe('rgb(49, 135, 221)');
			expect(arc._model.borderColor).toBe('rgb(22, 89, 156)');
			expect(arc._model.borderWidth).toBe(2);

			jasmine.triggerMouseEvent(chart, 'mouseout', arc);
			expect(arc._model.backgroundColor).toBe('rgb(100, 150, 200)');
			expect(arc._model.borderColor).toBe('rgb(50, 100, 150)');
			expect(arc._model.borderWidth).toBe(2);
		});

		it ('should handle hover styles defined via dataset properties', function() {
			var chart = this.chart;
			var arc = chart.getDatasetMeta(0).data[0];

			Chart.helpers.merge(chart.data.datasets[0], {
				hoverBackgroundColor: 'rgb(200, 100, 150)',
				hoverBorderColor: 'rgb(150, 50, 100)',
				hoverBorderWidth: 8.4,
			});

			chart.update();

			jasmine.triggerMouseEvent(chart, 'mousemove', arc);
			expect(arc._model.backgroundColor).toBe('rgb(200, 100, 150)');
			expect(arc._model.borderColor).toBe('rgb(150, 50, 100)');
			expect(arc._model.borderWidth).toBe(8.4);

			jasmine.triggerMouseEvent(chart, 'mouseout', arc);
			expect(arc._model.backgroundColor).toBe('rgb(100, 150, 200)');
			expect(arc._model.borderColor).toBe('rgb(50, 100, 150)');
			expect(arc._model.borderWidth).toBe(2);
		});

		it ('should handle hover styles defined via element options', function() {
			var chart = this.chart;
			var arc = chart.getDatasetMeta(0).data[0];

			Chart.helpers.merge(chart.options.elements.arc, {
				hoverBackgroundColor: 'rgb(200, 100, 150)',
				hoverBorderColor: 'rgb(150, 50, 100)',
				hoverBorderWidth: 8.4,
			});

			chart.update();

			jasmine.triggerMouseEvent(chart, 'mousemove', arc);
			expect(arc._model.backgroundColor).toBe('rgb(200, 100, 150)');
			expect(arc._model.borderColor).toBe('rgb(150, 50, 100)');
			expect(arc._model.borderWidth).toBe(8.4);

			jasmine.triggerMouseEvent(chart, 'mouseout', arc);
			expect(arc._model.backgroundColor).toBe('rgb(100, 150, 200)');
			expect(arc._model.borderColor).toBe('rgb(50, 100, 150)');
			expect(arc._model.borderWidth).toBe(2);
		});
	});
});
