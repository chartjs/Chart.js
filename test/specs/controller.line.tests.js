describe('Chart.controllers.line', function() {
	describe('auto', jasmine.fixture.specs('controller.line'));

	it('should be registered as dataset controller', function() {
		expect(typeof Chart.controllers.line).toBe('function');
	});

	it('should be constructed', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: []
				}],
				labels: []
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.type).toBe('line');
		expect(meta.controller).not.toBe(undefined);
		expect(meta.controller.index).toBe(0);
		expect(meta.data).toEqual([]);

		meta.controller.updateIndex(1);
		expect(meta.controller.index).toBe(1);
	});

	it('Should use the first scale IDs if the dataset does not specify them', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: []
				}],
				labels: []
			},
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.xAxisID).toBe('x');
		expect(meta.yAxisID).toBe('y');
	});

	it('Should create line elements and point elements for each data item during initialization', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset1'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.data.length).toBe(4); // 4 points created
		expect(meta.data[0] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Point).toBe(true);
		expect(meta.dataset instanceof Chart.elements.Line).toBe(true); // 1 line element
	});

	it('should draw all elements', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset1'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
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

		chart.update();

		expect(meta.data[0].draw.calls.count()).toBe(1);
		expect(meta.data[1].draw.calls.count()).toBe(1);
		expect(meta.data[2].draw.calls.count()).toBe(1);
		expect(meta.data[3].draw.calls.count()).toBe(1);
	});

	it('should draw all elements except lines', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset1'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
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

		chart.update();

		expect(meta.dataset.draw.calls.count()).toBe(0);
		expect(meta.data[0].draw.calls.count()).toBe(1);
		expect(meta.data[1].draw.calls.count()).toBe(1);
		expect(meta.data[2].draw.calls.count()).toBe(1);
		expect(meta.data[3].draw.calls.count()).toBe(1);
	});

	it('should draw all elements except lines turned off per dataset', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset1',
					showLine: false
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
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

		chart.update();

		expect(meta.dataset.draw.calls.count()).toBe(0);
		expect(meta.data[0].draw.calls.count()).toBe(1);
		expect(meta.data[1].draw.calls.count()).toBe(1);
		expect(meta.data[2].draw.calls.count()).toBe(1);
		expect(meta.data[3].draw.calls.count()).toBe(1);
	});

	it('should update elements when modifying data', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset',
					xAxisID: 'x',
					yAxisID: 'y'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				showLines: true,
				legend: false,
				title: false,
				elements: {
					point: {
						backgroundColor: 'red',
						borderColor: 'blue',
					}
				},
				scales: {
					x: {
						display: false
					},
					y: {
						display: false
					}
				}
			},
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.data.length).toBe(4);

		chart.data.datasets[0].data = [1, 2]; // remove 2 items
		chart.data.datasets[0].borderWidth = 1;
		chart.update();

		expect(meta.data.length).toBe(2);


		[
			{x: 0, y: 512},
			{x: 171, y: 0}
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(expected.x);
			expect(meta.data[i]._model.y).toBeCloseToPixel(expected.y);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				backgroundColor: 'red',
				borderColor: 'blue',
			}));
		});

		chart.data.datasets[0].data = [1, 2, 3]; // add 1 items
		chart.update();

		expect(meta.data.length).toBe(3); // should add a new meta data item
	});

	it('should correctly calculate x scale for label and point', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				labels: ['One'],
				datasets: [{
					data: [1],
				}]
			},
			options: {
				legend: false,
				title: false,
				hover: {
					mode: 'nearest',
					intersect: true
				},
				scales: {
					x: {
						display: false,
					},
					y: {
						display: false,
						beginAtZero: true
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(0);
		// 1 point
		var point = meta.data[0];
		expect(point._model.x).toBeCloseToPixel(0);

		// 2 points
		chart.data.labels = ['One', 'Two'];
		chart.data.datasets[0].data = [1, 2];
		chart.update();

		var points = meta.data;

		expect(points[0]._model.x).toBeCloseToPixel(0);
		expect(points[1]._model.x).toBeCloseToPixel(512);

		// 3 points
		chart.data.labels = ['One', 'Two', 'Three'];
		chart.data.datasets[0].data = [1, 2, 3];
		chart.update();

		points = meta.data;

		expect(points[0]._model.x).toBeCloseToPixel(0);
		expect(points[1]._model.x).toBeCloseToPixel(256);
		expect(points[2]._model.x).toBeCloseToPixel(512);

		// 4 points
		chart.data.labels = ['One', 'Two', 'Three', 'Four'];
		chart.data.datasets[0].data = [1, 2, 3, 4];
		chart.update();

		points = meta.data;

		expect(points[0]._model.x).toBeCloseToPixel(0);
		expect(points[1]._model.x).toBeCloseToPixel(171);
		expect(points[2]._model.x).toBeCloseToPixel(340);
		expect(points[3]._model.x).toBeCloseToPixel(512);
	});

	it('should update elements when the y scale is stacked', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, -10, 10, -10],
					label: 'dataset1'
				}, {
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					x: {
						display: false,
					},
					y: {
						display: false,
						stacked: true
					}
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{x: 0, y: 146},
			{x: 171, y: 439},
			{x: 341, y: 146},
			{x: 512, y: 439}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{x: 0, y: 0},
			{x: 171, y: 73},
			{x: 341, y: 146},
			{x: 512, y: 497}
		].forEach(function(values, i) {
			expect(meta1.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta1.data[i]._model.y).toBeCloseToPixel(values.y);
		});

	});

	it('should update elements when the y scale is stacked with multiple axes', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, -10, 10, -10],
					label: 'dataset1'
				}, {
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}, {
					data: [10, 10, -10, -10],
					label: 'dataset3',
					yAxisID: 'y2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					x: {
						display: false,
					},
					y: {
						display: false,
						stacked: true
					},
					y2: {
						type: 'linear',
						position: 'right',
						display: false
					}
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{x: 0, y: 146},
			{x: 171, y: 439},
			{x: 341, y: 146},
			{x: 512, y: 439}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{x: 0, y: 0},
			{x: 171, y: 73},
			{x: 341, y: 146},
			{x: 512, y: 497}
		].forEach(function(values, i) {
			expect(meta1.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta1.data[i]._model.y).toBeCloseToPixel(values.y);
		});

	});

	it('should update elements when the y scale is stacked and datasets is scatter data', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [{
						x: 0,
						y: 10
					}, {
						x: 1,
						y: -10
					}, {
						x: 2,
						y: 10
					}, {
						x: 3,
						y: -10
					}],
					label: 'dataset1'
				}, {
					data: [{
						x: 0,
						y: 10
					}, {
						x: 1,
						y: 15
					}, {
						x: 2,
						y: 0
					}, {
						x: 3,
						y: -4
					}],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					x: {
						display: false,
					},
					y: {
						display: false,
						stacked: true
					}
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{x: 0, y: 146},
			{x: 171, y: 439},
			{x: 341, y: 146},
			{x: 512, y: 439}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{x: 0, y: 0},
			{x: 171, y: 73},
			{x: 341, y: 146},
			{x: 512, y: 497}
		].forEach(function(values, i) {
			expect(meta1.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta1.data[i]._model.y).toBeCloseToPixel(values.y);
		});

	});

	it('should update elements when the y scale is stacked and data is strings', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: ['10', '-10', '10', '-10'],
					label: 'dataset1'
				}, {
					data: ['10', '15', '0', '-4'],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				legend: false,
				title: false,
				scales: {
					x: {
						display: false,
					},
					y: {
						display: false,
						stacked: true
					}
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{x: 0, y: 146},
			{x: 171, y: 439},
			{x: 341, y: 146},
			{x: 512, y: 439}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{x: 0, y: 0},
			{x: 171, y: 73},
			{x: 341, y: 146},
			{x: 512, y: 497}
		].forEach(function(values, i) {
			expect(meta1.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta1.data[i]._model.y).toBeCloseToPixel(values.y);
		});

	});

	it('should fall back to the line styles for points', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [0, 0],
					label: 'dataset1',

					// line styles
					backgroundColor: 'rgb(98, 98, 98)',
					borderColor: 'rgb(8, 8, 8)',
					borderWidth: 0.55,
				}],
				labels: ['label1', 'label2']
			}
		});

		var meta = chart.getDatasetMeta(0);

		expect(meta.dataset._model.backgroundColor).toBe('rgb(98, 98, 98)');
		expect(meta.dataset._model.borderColor).toBe('rgb(8, 8, 8)');
		expect(meta.dataset._model.borderWidth).toBe(0.55);
	});

	describe('dataset global defaults', function() {
		beforeEach(function() {
			this._defaults = Chart.helpers.clone(Chart.defaults.global.datasets.line);
		});

		afterEach(function() {
			Chart.defaults.global.datasets.line = this._defaults;
			delete this._defaults;
		});

		it('should utilize the dataset global default options', function() {
			Chart.defaults.global.datasets.line = Chart.defaults.global.datasets.line || {};

			Chart.helpers.merge(Chart.defaults.global.datasets.line, {
				spanGaps: true,
				lineTension: 0.231,
				backgroundColor: '#add',
				borderWidth: '#daa',
				borderColor: '#dad',
				borderCapStyle: 'round',
				borderDash: [0],
				borderDashOffset: 0.871,
				borderJoinStyle: 'miter',
				fill: 'start',
				cubicInterpolationMode: 'monotone'
			});

			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						data: [0, 0],
						label: 'dataset1'
					}],
					labels: ['label1', 'label2']
				}
			});

			var model = chart.getDatasetMeta(0).dataset._model;

			expect(model.spanGaps).toBe(true);
			expect(model.tension).toBe(0.231);
			expect(model.backgroundColor).toBe('#add');
			expect(model.borderWidth).toBe('#daa');
			expect(model.borderColor).toBe('#dad');
			expect(model.borderCapStyle).toBe('round');
			expect(model.borderDash).toEqual([0]);
			expect(model.borderDashOffset).toBe(0.871);
			expect(model.borderJoinStyle).toBe('miter');
			expect(model.fill).toBe('start');
			expect(model.cubicInterpolationMode).toBe('monotone');
		});

		it('should be overriden by user-supplied values', function() {
			Chart.defaults.global.datasets.line = Chart.defaults.global.datasets.line || {};

			Chart.helpers.merge(Chart.defaults.global.datasets.line, {
				spanGaps: true,
				lineTension: 0.231
			});

			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						data: [0, 0],
						label: 'dataset1',
						spanGaps: true,
						backgroundColor: '#dad'
					}],
					labels: ['label1', 'label2']
				},
				options: {
					datasets: {
						line: {
							lineTension: 0.345,
							backgroundColor: '#add'
						}
					}
				}
			});

			var model = chart.getDatasetMeta(0).dataset._model;

			// dataset-level option overrides global default
			expect(model.spanGaps).toBe(true);
			// chart-level default overrides global default
			expect(model.tension).toBe(0.345);
			// dataset-level option overrides chart-level default
			expect(model.backgroundColor).toBe('#dad');
		});
	});

	it('should obey the chart-level dataset options', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [0, 0],
					label: 'dataset1'
				}],
				labels: ['label1', 'label2']
			},
			options: {
				datasets: {
					line: {
						spanGaps: true,
						lineTension: 0.231,
						backgroundColor: '#add',
						borderWidth: '#daa',
						borderColor: '#dad',
						borderCapStyle: 'round',
						borderDash: [0],
						borderDashOffset: 0.871,
						borderJoinStyle: 'miter',
						fill: 'start',
						cubicInterpolationMode: 'monotone'
					}
				}
			}
		});

		var model = chart.getDatasetMeta(0).dataset._model;

		expect(model.spanGaps).toBe(true);
		expect(model.tension).toBe(0.231);
		expect(model.backgroundColor).toBe('#add');
		expect(model.borderWidth).toBe('#daa');
		expect(model.borderColor).toBe('#dad');
		expect(model.borderCapStyle).toBe('round');
		expect(model.borderDash).toEqual([0]);
		expect(model.borderDashOffset).toBe(0.871);
		expect(model.borderJoinStyle).toBe('miter');
		expect(model.fill).toBe('start');
		expect(model.cubicInterpolationMode).toBe('monotone');
	});

	it('should obey the dataset options', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [0, 0],
					label: 'dataset1',
					spanGaps: true,
					lineTension: 0.231,
					backgroundColor: '#add',
					borderWidth: '#daa',
					borderColor: '#dad',
					borderCapStyle: 'round',
					borderDash: [0],
					borderDashOffset: 0.871,
					borderJoinStyle: 'miter',
					fill: 'start',
					cubicInterpolationMode: 'monotone'
				}],
				labels: ['label1', 'label2']
			}
		});

		var model = chart.getDatasetMeta(0).dataset._model;

		expect(model.spanGaps).toBe(true);
		expect(model.tension).toBe(0.231);
		expect(model.backgroundColor).toBe('#add');
		expect(model.borderWidth).toBe('#daa');
		expect(model.borderColor).toBe('#dad');
		expect(model.borderCapStyle).toBe('round');
		expect(model.borderDash).toEqual([0]);
		expect(model.borderDashOffset).toBe(0.871);
		expect(model.borderJoinStyle).toBe('miter');
		expect(model.fill).toBe('start');
		expect(model.cubicInterpolationMode).toBe('monotone');
	});

	it('should handle number of data point changes in update', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset1',
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			}
		});

		var meta = chart.getDatasetMeta(0);

		chart.data.datasets[0].data = [1, 2]; // remove 2 items
		chart.update();
		expect(meta.data.length).toBe(2);
		expect(meta.data[0] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Point).toBe(true);

		chart.data.datasets[0].data = [1, 2, 3, 4, 5]; // add 3 items
		chart.update();
		expect(meta.data.length).toBe(5);
		expect(meta.data[0] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[4] instanceof Chart.elements.Point).toBe(true);
	});

	describe('Interactions', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
				type: 'line',
				data: {
					labels: ['label1', 'label2', 'label3', 'label4'],
					datasets: [{
						data: [10, 15, 0, -4]
					}]
				},
				options: {
					elements: {
						point: {
							backgroundColor: 'rgb(100, 150, 200)',
							borderColor: 'rgb(50, 100, 150)',
							borderWidth: 2,
							radius: 3
						}
					}
				}
			});
		});

		it ('should handle default hover styles', function() {
			var chart = this.chart;
			var point = chart.getDatasetMeta(0).data[0];

			jasmine.triggerMouseEvent(chart, 'mousemove', point);
			expect(point._model.backgroundColor).toBe('rgb(49, 135, 221)');
			expect(point._model.borderColor).toBe('rgb(22, 89, 156)');
			expect(point._model.borderWidth).toBe(1);
			expect(point._model.radius).toBe(4);

			jasmine.triggerMouseEvent(chart, 'mouseout', point);
			expect(point._model.backgroundColor).toBe('rgb(100, 150, 200)');
			expect(point._model.borderColor).toBe('rgb(50, 100, 150)');
			expect(point._model.borderWidth).toBe(2);
			expect(point._model.radius).toBe(3);
		});

		it ('should handle hover styles defined via dataset properties', function() {
			var chart = this.chart;
			var point = chart.getDatasetMeta(0).data[0];

			Chart.helpers.merge(chart.data.datasets[0], {
				hoverBackgroundColor: 'rgb(200, 100, 150)',
				hoverBorderColor: 'rgb(150, 50, 100)',
				hoverBorderWidth: 8.4,
				hoverRadius: 4.2
			});

			chart.update();

			jasmine.triggerMouseEvent(chart, 'mousemove', point);
			expect(point._model.backgroundColor).toBe('rgb(200, 100, 150)');
			expect(point._model.borderColor).toBe('rgb(150, 50, 100)');
			expect(point._model.borderWidth).toBe(8.4);
			expect(point._model.radius).toBe(4.2);

			jasmine.triggerMouseEvent(chart, 'mouseout', point);
			expect(point._model.backgroundColor).toBe('rgb(100, 150, 200)');
			expect(point._model.borderColor).toBe('rgb(50, 100, 150)');
			expect(point._model.borderWidth).toBe(2);
			expect(point._model.radius).toBe(3);
		});

		it ('should handle hover styles defined via element options', function() {
			var chart = this.chart;
			var point = chart.getDatasetMeta(0).data[0];

			Chart.helpers.merge(chart.options.elements.point, {
				hoverBackgroundColor: 'rgb(200, 100, 150)',
				hoverBorderColor: 'rgb(150, 50, 100)',
				hoverBorderWidth: 8.4,
				hoverRadius: 4.2
			});

			chart.update();

			jasmine.triggerMouseEvent(chart, 'mousemove', point);
			expect(point._model.backgroundColor).toBe('rgb(200, 100, 150)');
			expect(point._model.borderColor).toBe('rgb(150, 50, 100)');
			expect(point._model.borderWidth).toBe(8.4);
			expect(point._model.radius).toBe(4.2);

			jasmine.triggerMouseEvent(chart, 'mouseout', point);
			expect(point._model.backgroundColor).toBe('rgb(100, 150, 200)');
			expect(point._model.borderColor).toBe('rgb(50, 100, 150)');
			expect(point._model.borderWidth).toBe(2);
			expect(point._model.radius).toBe(3);
		});

		it ('should handle dataset hover styles defined via dataset properties', function() {
			var chart = this.chart;
			var point = chart.getDatasetMeta(0).data[0];
			var dataset = chart.getDatasetMeta(0).dataset;

			Chart.helpers.merge(chart.data.datasets[0], {
				backgroundColor: '#AAA',
				borderColor: '#BBB',
				borderWidth: 6,
				hoverBackgroundColor: '#000',
				hoverBorderColor: '#111',
				hoverBorderWidth: 12
			});

			chart.options.hover = {mode: 'dataset'};
			chart.update();

			jasmine.triggerMouseEvent(chart, 'mousemove', point);
			expect(dataset._model.backgroundColor).toBe('#000');
			expect(dataset._model.borderColor).toBe('#111');
			expect(dataset._model.borderWidth).toBe(12);

			jasmine.triggerMouseEvent(chart, 'mouseout', point);
			expect(dataset._model.backgroundColor).toBe('#AAA');
			expect(dataset._model.borderColor).toBe('#BBB');
			expect(dataset._model.borderWidth).toBe(6);
		});
	});

	it('should allow 0 as a point border width', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset1',
					pointBorderWidth: 0
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			}
		});

		var meta = chart.getDatasetMeta(0);
		var point = meta.data[0];

		expect(point._model.borderWidth).toBe(0);
	});

	it('should allow an array as the point border width setting', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset1',
					pointBorderWidth: [1, 2, 3, 4]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.data[0]._model.borderWidth).toBe(1);
		expect(meta.data[1]._model.borderWidth).toBe(2);
		expect(meta.data[2]._model.borderWidth).toBe(3);
		expect(meta.data[3]._model.borderWidth).toBe(4);
	});
});
