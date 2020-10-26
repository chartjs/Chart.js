describe('Chart.controllers.polarArea', function() {
	describe('auto', jasmine.fixture.specs('controller.polarArea'));

	it('should be registered as dataset controller', function() {
		expect(typeof Chart.controllers.polarArea).toBe('function');
	});

	it('should be constructed', function() {
		var chart = window.acquireChart({
			type: 'polarArea',
			data: {
				datasets: [
					{data: []},
					{data: []}
				],
				labels: []
			}
		});

		var meta = chart.getDatasetMeta(1);
		expect(meta.type).toEqual('polarArea');
		expect(meta.data).toEqual([]);
		expect(meta.hidden).toBe(null);
		expect(meta.controller).not.toBe(undefined);
		expect(meta.controller.index).toBe(1);

		meta.controller.updateIndex(0);
		expect(meta.controller.index).toBe(0);
	});

	it('should create arc elements for each data item during initialization', function() {
		var chart = window.acquireChart({
			type: 'polarArea',
			data: {
				datasets: [
					{data: []},
					{data: [10, 15, 0, -4]}
				],
				labels: []
			}
		});

		var meta = chart.getDatasetMeta(1);
		expect(meta.data.length).toBe(4); // 4 arcs created
		expect(meta.data[0] instanceof Chart.elements.ArcElement).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.ArcElement).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.ArcElement).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.ArcElement).toBe(true);
	});

	it('should draw all elements', function() {
		var chart = window.acquireChart({
			type: 'polarArea',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
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

	it('should update elements when modifying data', function() {
		var chart = window.acquireChart({
			type: 'polarArea',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				showLine: true,
				legend: false,
				title: false,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 255, 0)',
						borderWidth: 1.2
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.data.length).toBe(4);

		[
			{o: 177, s: -0.5 * Math.PI, e: 0},
			{o: 240, s: 0, e: 0.5 * Math.PI},
			{o: 51, s: 0.5 * Math.PI, e: Math.PI},
			{o: 0, s: Math.PI, e: 1.5 * Math.PI}
		].forEach(function(expected, i) {
			expect(meta.data[i].x).toBeCloseToPixel(256);
			expect(meta.data[i].y).toBeCloseToPixel(259);
			expect(meta.data[i].innerRadius).toBeCloseToPixel(0);
			expect(meta.data[i].outerRadius).toBeCloseToPixel(expected.o);
			expect(meta.data[i].startAngle).toBe(expected.s);
			expect(meta.data[i].endAngle).toBe(expected.e);
			expect(meta.data[i].options).toEqual(jasmine.objectContaining({
				backgroundColor: 'rgb(255, 0, 0)',
				borderColor: 'rgb(0, 255, 0)',
				borderWidth: 1.2
			}));
		});

		// arc styles
		chart.data.datasets[0].backgroundColor = 'rgb(128, 129, 130)';
		chart.data.datasets[0].borderColor = 'rgb(56, 57, 58)';
		chart.data.datasets[0].borderWidth = 1.123;

		chart.update();

		for (var i = 0; i < 4; ++i) {
			expect(meta.data[i].options.backgroundColor).toBe('rgb(128, 129, 130)');
			expect(meta.data[i].options.borderColor).toBe('rgb(56, 57, 58)');
			expect(meta.data[i].options.borderWidth).toBe(1.123);
		}

		chart.update();

		expect(meta.data[0].x).toBeCloseToPixel(256);
		expect(meta.data[0].y).toBeCloseToPixel(259);
		expect(meta.data[0].innerRadius).toBeCloseToPixel(0);
		expect(meta.data[0].outerRadius).toBeCloseToPixel(177);
	});

	it('should update elements with start angle from options', function() {
		var chart = window.acquireChart({
			type: 'polarArea',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				showLine: true,
				legend: false,
				title: false,
				startAngle: 90, // default is 0
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 255, 0)',
						borderWidth: 1.2
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.data.length).toBe(4);

		[
			{o: 177, s: 0, e: 0.5 * Math.PI},
			{o: 240, s: 0.5 * Math.PI, e: Math.PI},
			{o: 51, s: Math.PI, e: 1.5 * Math.PI},
			{o: 0, s: 1.5 * Math.PI, e: 2.0 * Math.PI}
		].forEach(function(expected, i) {
			expect(meta.data[i].x).toBeCloseToPixel(256);
			expect(meta.data[i].y).toBeCloseToPixel(259);
			expect(meta.data[i].innerRadius).toBeCloseToPixel(0);
			expect(meta.data[i].outerRadius).toBeCloseToPixel(expected.o);
			expect(meta.data[i].startAngle).toBe(expected.s);
			expect(meta.data[i].endAngle).toBe(expected.e);
			expect(meta.data[i].options).toEqual(jasmine.objectContaining({
				backgroundColor: 'rgb(255, 0, 0)',
				borderColor: 'rgb(0, 255, 0)',
				borderWidth: 1.2
			}));
		});
	});

	it('should handle number of data point changes in update', function() {
		var chart = window.acquireChart({
			type: 'polarArea',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				showLine: true,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 255, 0)',
						borderWidth: 1.2
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.data.length).toBe(4);

		// remove 2 items
		chart.data.labels = ['label1', 'label2'];
		chart.data.datasets[0].data = [1, 2];
		chart.update();

		expect(meta.data.length).toBe(2);
		expect(meta.data[0] instanceof Chart.elements.ArcElement).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.ArcElement).toBe(true);

		// add 3 items
		chart.data.labels = ['label1', 'label2', 'label3', 'label4', 'label5'];
		chart.data.datasets[0].data = [1, 2, 3, 4, 5];
		chart.update();

		expect(meta.data.length).toBe(5);
		expect(meta.data[0] instanceof Chart.elements.ArcElement).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.ArcElement).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.ArcElement).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.ArcElement).toBe(true);
		expect(meta.data[4] instanceof Chart.elements.ArcElement).toBe(true);
	});

	describe('Interactions', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
				type: 'polarArea',
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

		it ('should handle default hover styles', function(done) {
			var chart = this.chart;
			var arc = chart.getDatasetMeta(0).data[0];

			afterEvent(chart, 'mousemove', function() {
				expect(arc.options.backgroundColor).toBe('#3187DD');
				expect(arc.options.borderColor).toBe('#175A9D');
				expect(arc.options.borderWidth).toBe(2);

				afterEvent(chart, 'mouseout', function() {
					expect(arc.options.backgroundColor).toBe('rgb(100, 150, 200)');
					expect(arc.options.borderColor).toBe('rgb(50, 100, 150)');
					expect(arc.options.borderWidth).toBe(2);

					done();
				});
				jasmine.triggerMouseEvent(chart, 'mouseout', arc);
			});
			jasmine.triggerMouseEvent(chart, 'mousemove', arc);
		});

		it ('should handle hover styles defined via dataset properties', function(done) {
			var chart = this.chart;
			var arc = chart.getDatasetMeta(0).data[0];

			Chart.helpers.merge(chart.data.datasets[0], {
				hoverBackgroundColor: 'rgb(200, 100, 150)',
				hoverBorderColor: 'rgb(150, 50, 100)',
				hoverBorderWidth: 8.4,
			});

			chart.update();

			afterEvent(chart, 'mousemove', function() {
				expect(arc.options.backgroundColor).toBe('rgb(200, 100, 150)');
				expect(arc.options.borderColor).toBe('rgb(150, 50, 100)');
				expect(arc.options.borderWidth).toBe(8.4);

				afterEvent(chart, 'mouseout', function() {
					expect(arc.options.backgroundColor).toBe('rgb(100, 150, 200)');
					expect(arc.options.borderColor).toBe('rgb(50, 100, 150)');
					expect(arc.options.borderWidth).toBe(2);

					done();
				});
				jasmine.triggerMouseEvent(chart, 'mouseout', arc);
			});
			jasmine.triggerMouseEvent(chart, 'mousemove', arc);
		});

		it ('should handle hover styles defined via element options', function(done) {
			var chart = this.chart;
			var arc = chart.getDatasetMeta(0).data[0];

			Chart.helpers.merge(chart.options.elements.arc, {
				hoverBackgroundColor: 'rgb(200, 100, 150)',
				hoverBorderColor: 'rgb(150, 50, 100)',
				hoverBorderWidth: 8.4,
			});

			chart.update();

			afterEvent(chart, 'mousemove', function() {
				expect(arc.options.backgroundColor).toBe('rgb(200, 100, 150)');
				expect(arc.options.borderColor).toBe('rgb(150, 50, 100)');
				expect(arc.options.borderWidth).toBe(8.4);

				afterEvent(chart, 'mouseout', function() {
					expect(arc.options.backgroundColor).toBe('rgb(100, 150, 200)');
					expect(arc.options.borderColor).toBe('rgb(50, 100, 150)');
					expect(arc.options.borderWidth).toBe(2);

					done();
				});
				jasmine.triggerMouseEvent(chart, 'mouseout', arc);
			});
			jasmine.triggerMouseEvent(chart, 'mousemove', arc);
		});
	});
});
