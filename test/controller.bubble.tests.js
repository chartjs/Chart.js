// Test the bubble controller
describe('Bubble controller tests', function() {
	it('should be constructed', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: []
				}]
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.type).toBe('bubble');
		expect(meta.controller).not.toBe(undefined);
		expect(meta.controller.index).toBe(0);
		expect(meta.data).toEqual([]);

		meta.controller.updateIndex(1);
		expect(meta.controller.index).toBe(1);
	});

	it('should use the first scale IDs if the dataset does not specify them', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: []
				}]
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

	it('should create point elements for each data item during initialization', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			}
		});

		var meta = chart.getDatasetMeta(0);

		expect(meta.data.length).toBe(4); // 4 points created
		expect(meta.data[0] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Point).toBe(true);
	});

	it('should draw all elements', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
			options: {
				animation: false,
				showLines: true
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

	it('should update elements when modifying style', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: [{
						x: 10,
						y: 10,
						r: 5
					}, {
						x: -15,
						y: -10,
						r: 1
					}, {
						x: 0,
						y: -9,
						r: 2
					}, {
						x: -4,
						y: 10,
						r: 1
					}]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				scales: {
					xAxes: [{
						type: 'category'
					}],
					yAxes: [{
						type: 'linear'
					}]
				}
			}
		});

		var meta = chart.getDatasetMeta(0);

		[
			{r: 5, x: 38, y: 32},
			{r: 1, x: 189, y: 484},
			{r: 2, x: 341, y: 461},
			{r: 1, x: 492, y: 32}
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.radius).toBe(expected.r);
			expect(meta.data[i]._model.x).toBeCloseToPixel(expected.x);
			expect(meta.data[i]._model.y).toBeCloseToPixel(expected.y);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				backgroundColor: Chart.defaults.global.defaultColor,
				borderColor: Chart.defaults.global.defaultColor,
				borderWidth: 1,
				hitRadius: 1,
				skip: false
			}));
		});

		// Use dataset level styles for lines & points
		chart.data.datasets[0].backgroundColor = 'rgb(98, 98, 98)';
		chart.data.datasets[0].borderColor = 'rgb(8, 8, 8)';
		chart.data.datasets[0].borderWidth = 0.55;

		// point styles
		chart.data.datasets[0].radius = 22;
		chart.data.datasets[0].hitRadius = 3.3;

		chart.update();

		for (var i=0; i<4; ++i) {
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				backgroundColor: 'rgb(98, 98, 98)',
				borderColor: 'rgb(8, 8, 8)',
				borderWidth: 0.55,
				hitRadius: 3.3,
				skip: false
			}));
		}

		// point styles
		meta.data[0].custom = {
			radius: 2.2,
			backgroundColor: 'rgb(0, 1, 3)',
			borderColor: 'rgb(4, 6, 8)',
			borderWidth: 0.787,
			tension: 0.15,
			hitRadius: 5,
			skip: true
		};

		chart.update();

		expect(meta.data[0]._model).toEqual(jasmine.objectContaining({
			backgroundColor: 'rgb(0, 1, 3)',
			borderColor: 'rgb(4, 6, 8)',
			borderWidth: 0.787,
			hitRadius: 5,
			skip: true
		}));
	});

	it('should handle number of data point changes in update', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: [{
						x: 10,
						y: 10,
						r: 5
					}, {
						x: -15,
						y: -10,
						r: 1
					}, {
						x: 0,
						y: -9,
						r: 2
					}, {
						x: -4,
						y: 10,
						r: 1
					}]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			}
		});

		var meta = chart.getDatasetMeta(0);

		expect(meta.data.length).toBe(4);

		chart.data.datasets[0].data = [{
			x: 1,
			y: 1,
			r: 10
		}, {
			x: 10,
			y: 5,
			r: 2
		}]; // remove 2 items

		chart.update();

		expect(meta.data.length).toBe(2);
		expect(meta.data[0] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Point).toBe(true);

		chart.data.datasets[0].data = [{
			x: 10,
			y: 10,
			r: 5
		}, {
			x: -15,
			y: -10,
			r: 1
		}, {
			x: 0,
			y: -9,
			r: 2
		}, {
			x: -4,
			y: 10,
			r: 1
		}, {
			x: -5,
			y: 0,
			r: 3
		}]; // add 3 items

		chart.update();

		expect(meta.data.length).toBe(5);
		expect(meta.data[0] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[4] instanceof Chart.elements.Point).toBe(true);
	});

	it('should set hover styles', function() {
		var chart = window.acquireChart({
			type: 'bubble',
			data: {
				datasets: [{
					data: [{
						x: 10,
						y: 10,
						r: 5
					}, {
						x: -15,
						y: -10,
						r: 1
					}, {
						x: 0,
						y: -9,
						r: 2
					}, {
						x: -4,
						y: 10,
						r: 1
					}]
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
						radius: 3
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
		expect(point._model.radius).toBe(9);

		// Can set hover style per dataset
		chart.data.datasets[0].hoverRadius = 3.3;
		chart.data.datasets[0].hoverBackgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].hoverBorderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].hoverBorderWidth = 2.1;

		meta.controller.setHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(77, 79, 81)');
		expect(point._model.borderColor).toBe('rgb(123, 125, 127)');
		expect(point._model.borderWidth).toBe(2.1);
		expect(point._model.radius).toBe(8.3);

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
			type: 'bubble',
			data: {
				datasets: [{
					data: [{
						x: 10,
						y: 10,
						r: 5
					}, {
						x: -15,
						y: -10,
						r: 1
					}, {
						x: 0,
						y: -9,
						r: 2
					}, {
						x: -4,
						y: 10,
						r: 1
					}]
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
						radius: 3
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
		expect(point._model.radius).toBe(5);

		// Can set hover style per dataset
		chart.data.datasets[0].radius = 3.3;
		chart.data.datasets[0].backgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].borderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].borderWidth = 2.1;

		meta.controller.removeHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(77, 79, 81)');
		expect(point._model.borderColor).toBe('rgb(123, 125, 127)');
		expect(point._model.borderWidth).toBe(2.1);
		expect(point._model.radius).toBe(5);

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
