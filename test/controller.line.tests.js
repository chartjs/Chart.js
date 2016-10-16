// Test the line controller
describe('Line controller tests', function() {
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
			options: {
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.xAxisID).toBe('firstXScaleID');
		expect(meta.yAxisID).toBe('firstYScaleID');
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
					xAxisID: 'firstXScaleID',
					yAxisID: 'firstYScaleID'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				showLines: true,
				elements: {
					point: {
						backgroundColor: 'red',
						borderColor: 'blue',
					}
				},
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
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
			{x: 44, y: 484},
			{x: 193, y: 32}
		].forEach(function(expected, i) {
			expect(meta.data[i]._datasetIndex).toBe(0);
			expect(meta.data[i]._index).toBe(i);
			expect(meta.data[i]._xScale).toBe(chart.scales.firstXScaleID);
			expect(meta.data[i]._yScale).toBe(chart.scales.firstYScaleID);
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
				hover: {
					mode: 'single'
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						}
					}]
				}
			}
		});

		var meta = chart.getDatasetMeta(0);
		// 1 point
		var point = meta.data[0];
		expect(point._model.x).toBeCloseToPixel(267);

		// 2 points
		chart.data.labels = ['One', 'Two'];
		chart.data.datasets[0].data = [1, 2];
		chart.update();

		var points = meta.data;

		expect(points[0]._model.x).toBeCloseToPixel(37);
		expect(points[1]._model.x).toBeCloseToPixel(498);

		// 3 points
		chart.data.labels = ['One', 'Two', 'Three'];
		chart.data.datasets[0].data = [1, 2, 3];
		chart.update();

		points = meta.data;

		expect(points[0]._model.x).toBeCloseToPixel(37);
		expect(points[1]._model.x).toBeCloseToPixel(265);
		expect(points[2]._model.x).toBeCloseToPixel(493);

		// 4 points
		chart.data.labels = ['One', 'Two', 'Three', 'Four'];
		chart.data.datasets[0].data = [1, 2, 3, 4];
		chart.update();

		points = meta.data;

		expect(points[0]._model.x).toBeCloseToPixel(37);
		expect(points[1]._model.x).toBeCloseToPixel(190);
		expect(points[2]._model.x).toBeCloseToPixel(343);
		expect(points[3]._model.x).toBeCloseToPixel(497);
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
				scales: {
					yAxes: [{
						stacked: true
					}]
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{x: 38, y: 161},
			{x: 189, y: 419},
			{x: 341, y: 161},
			{x: 492, y: 419}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{x: 38, y: 32},
			{x: 189, y: 97},
			{x: 341, y: 161},
			{x: 492, y: 471}
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
					yAxisID: 'secondAxis'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				scales: {
					yAxes: [{
						stacked: true
					}, {
						type: 'linear',
						id: 'secondAxis'
					}]
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{x: 76, y: 161},
			{x: 215, y: 419},
			{x: 353, y: 161},
			{x: 492, y: 419}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{x: 76, y: 32},
			{x: 215, y: 97},
			{x: 353, y: 161},
			{x: 492, y: 471}
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
				scales: {
					yAxes: [{
						stacked: true
					}]
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{x: 38, y: 161},
			{x: 189, y: 419},
			{x: 341, y: 161},
			{x: 492, y: 419}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{x: 38, y: 32},
			{x: 189, y: 97},
			{x: 341, y: 161},
			{x: 492, y: 471}
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
				scales: {
					yAxes: [{
						stacked: true
					}]
				}
			}
		});

		var meta0 = chart.getDatasetMeta(0);

		[
			{x: 38, y: 161},
			{x: 189, y: 419},
			{x: 341, y: 161},
			{x: 492, y: 419}
		].forEach(function(values, i) {
			expect(meta0.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta0.data[i]._model.y).toBeCloseToPixel(values.y);
		});

		var meta1 = chart.getDatasetMeta(1);

		[
			{x: 38, y: 32},
			{x: 189, y: 97},
			{x: 341, y: 161},
			{x: 492, y: 471}
		].forEach(function(values, i) {
			expect(meta1.data[i]._model.x).toBeCloseToPixel(values.x);
			expect(meta1.data[i]._model.y).toBeCloseToPixel(values.y);
		});

	});

	it('should find the correct scale zero when the data is all positive', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 20, 20],
					label: 'dataset1',
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
		});

		var meta = chart.getDatasetMeta(0);

		expect(meta.dataset._model).toEqual(jasmine.objectContaining({
			scaleTop: 32,
			scaleBottom: 484,
			scaleZero: 484,
		}));
	});

	it('should find the correct scale zero when the data is all negative', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [-10, -15, -20, -20],
					label: 'dataset1',
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
		});

		var meta = chart.getDatasetMeta(0);

		expect(meta.dataset._model).toEqual(jasmine.objectContaining({
			scaleTop: 32,
			scaleBottom: 484,
			scaleZero: 32,
		}));
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

	it('should set point hover styles', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset1',
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				elements: {
					point: {
						backgroundColor: 'rgb(255, 255, 0)',
						borderWidth: 1,
						borderColor: 'rgb(255, 255, 255)',
						hitRadius: 1,
						hoverRadius: 4,
						hoverBorderWidth: 1,
						radius: 3,
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(0);
		var point = meta.data[0];

		meta.controller.setHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(229, 230, 0)');
		expect(point._model.borderColor).toBe('rgb(230, 230, 230)');
		expect(point._model.borderWidth).toBe(1);
		expect(point._model.radius).toBe(4);

		// Can set hover style per dataset
		chart.data.datasets[0].pointHoverRadius = 3.3;
		chart.data.datasets[0].pointHoverBackgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].pointHoverBorderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].pointHoverBorderWidth = 2.1;

		meta.controller.setHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(77, 79, 81)');
		expect(point._model.borderColor).toBe('rgb(123, 125, 127)');
		expect(point._model.borderWidth).toBe(2.1);
		expect(point._model.radius).toBe(3.3);

		// Use the consistent name "pointRadius", setting but overwriting
		// another value in "radius"
		chart.data.datasets[0].pointRadius = 250;
		chart.data.datasets[0].radius = 20;

		meta.controller.setHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(77, 79, 81)');
		expect(point._model.borderColor).toBe('rgb(123, 125, 127)');
		expect(point._model.borderWidth).toBe(2.1);
		expect(point._model.radius).toBe(3.3);

		// Custom style
		point.custom = {
			hoverRadius: 4.4,
			hoverBorderWidth: 5.5,
			hoverBackgroundColor: 'rgb(0, 0, 0)',
			hoverBorderColor: 'rgb(10, 10, 10)'
		};

		meta.controller.setHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(0, 0, 0)');
		expect(point._model.borderColor).toBe('rgb(10, 10, 10)');
		expect(point._model.borderWidth).toBe(5.5);
		expect(point._model.radius).toBe(4.4);
	});

	it('should remove hover styles', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 15, 0, -4],
					label: 'dataset1',
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				elements: {
					point: {
						backgroundColor: 'rgb(255, 255, 0)',
						borderWidth: 1,
						borderColor: 'rgb(255, 255, 255)',
						hitRadius: 1,
						hoverRadius: 4,
						hoverBorderWidth: 1,
						radius: 3,
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(0);
		var point = meta.data[0];

		chart.options.elements.point.backgroundColor = 'rgb(45, 46, 47)';
		chart.options.elements.point.borderColor = 'rgb(50, 51, 52)';
		chart.options.elements.point.borderWidth = 10.1;
		chart.options.elements.point.radius = 1.01;

		meta.controller.removeHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(45, 46, 47)');
		expect(point._model.borderColor).toBe('rgb(50, 51, 52)');
		expect(point._model.borderWidth).toBe(10.1);
		expect(point._model.radius).toBe(1.01);

		// Can set hover style per dataset
		chart.data.datasets[0].radius = 3.3;
		chart.data.datasets[0].pointBackgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].pointBorderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].pointBorderWidth = 2.1;

		meta.controller.removeHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(77, 79, 81)');
		expect(point._model.borderColor).toBe('rgb(123, 125, 127)');
		expect(point._model.borderWidth).toBe(2.1);
		expect(point._model.radius).toBe(3.3);

		// Use the consistent name "pointRadius", setting but overwriting
		// another value in "radius"
		chart.data.datasets[0].pointRadius = 250;
		chart.data.datasets[0].radius = 20;

		meta.controller.removeHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(77, 79, 81)');
		expect(point._model.borderColor).toBe('rgb(123, 125, 127)');
		expect(point._model.borderWidth).toBe(2.1);
		expect(point._model.radius).toBe(250);

		// Custom style
		point.custom = {
			radius: 4.4,
			borderWidth: 5.5,
			backgroundColor: 'rgb(0, 0, 0)',
			borderColor: 'rgb(10, 10, 10)'
		};

		meta.controller.removeHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(0, 0, 0)');
		expect(point._model.borderColor).toBe('rgb(10, 10, 10)');
		expect(point._model.borderWidth).toBe(5.5);
		expect(point._model.radius).toBe(4.4);
	});
});
