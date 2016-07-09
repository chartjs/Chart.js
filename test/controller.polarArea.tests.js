// Test the polar area controller
describe('Polar area controller tests', function() {

	beforeEach(function() {
		window.addDefaultMatchers(jasmine);
	});

	afterEach(function() {
		window.releaseAllCharts();
	});

	it('should be constructed', function() {
		var chart = window.acquireChart({
		type: 'polarArea',
		data: {
			datasets: [
				{ data: [] },
				{ data: [] }
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
					{ data: [] },
					{ data: [10, 15, 0, -4] }
				],
				labels: []
			}
		});

		var meta = chart.getDatasetMeta(1);
		expect(meta.data.length).toBe(4); // 4 arcs created
		expect(meta.data[0] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Arc).toBe(true);
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
				showLines: true,
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

		[	{ o: 156, s: -0.5 * Math.PI, e:             0 },
			{ o: 211, s:              0, e: 0.5 * Math.PI },
			{ o:  45, s:  0.5 * Math.PI, e:       Math.PI },
			{ o:   0, s:        Math.PI, e: 1.5 * Math.PI }
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(256);
			expect(meta.data[i]._model.y).toBeCloseToPixel(272);
			expect(meta.data[i]._model.innerRadius).toBeCloseToPixel(0);
			expect(meta.data[i]._model.outerRadius).toBeCloseToPixel(expected.o);
			expect(meta.data[i]._model.startAngle).toBe(expected.s);
			expect(meta.data[i]._model.endAngle).toBe(expected.e);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				backgroundColor: 'rgb(255, 0, 0)',
				borderColor: 'rgb(0, 255, 0)',
				borderWidth: 1.2,
				label: chart.data.labels[i]
			}));
		});

		// arc styles
		chart.data.datasets[0].backgroundColor = 'rgb(128, 129, 130)';
		chart.data.datasets[0].borderColor = 'rgb(56, 57, 58)';
		chart.data.datasets[0].borderWidth = 1.123;

		chart.update();

		for (var i = 0; i < 4; ++i) {
			expect(meta.data[i]._model.backgroundColor).toBe('rgb(128, 129, 130)');
			expect(meta.data[i]._model.borderColor).toBe('rgb(56, 57, 58)');
			expect(meta.data[i]._model.borderWidth).toBe(1.123);
		}

		// arc styles
		meta.data[0].custom = {
			backgroundColor: 'rgb(0, 1, 3)',
			borderColor: 'rgb(4, 6, 8)',
			borderWidth: 0.787
		};

		chart.update();

		expect(meta.data[0]._model.x).toBeCloseToPixel(256);
		expect(meta.data[0]._model.y).toBeCloseToPixel(272);
		expect(meta.data[0]._model.innerRadius).toBeCloseToPixel(0);
		expect(meta.data[0]._model.outerRadius).toBeCloseToPixel(156);
		expect(meta.data[0]._model).toEqual(jasmine.objectContaining({
			startAngle: -0.5 * Math.PI,
			endAngle: 0,
			backgroundColor: 'rgb(0, 1, 3)',
			borderWidth: 0.787,
			borderColor: 'rgb(4, 6, 8)',
			label: 'label1'
		}));
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
				showLines: true,
				startAngle: 0, // default is -0.5 * Math.PI
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

		[	{ o: 156, s:              0, e: 0.5 * Math.PI },
			{ o: 211, s:  0.5 * Math.PI, e:       Math.PI },
			{ o:  45, s:        Math.PI, e: 1.5 * Math.PI },
			{ o:   0, s:  1.5 * Math.PI, e: 2.0 * Math.PI }
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(256);
			expect(meta.data[i]._model.y).toBeCloseToPixel(272);
			expect(meta.data[i]._model.innerRadius).toBeCloseToPixel(0);
			expect(meta.data[i]._model.outerRadius).toBeCloseToPixel(expected.o);
			expect(meta.data[i]._model.startAngle).toBe(expected.s);
			expect(meta.data[i]._model.endAngle).toBe(expected.e);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				backgroundColor: 'rgb(255, 0, 0)',
				borderColor: 'rgb(0, 255, 0)',
				borderWidth: 1.2,
				label: chart.data.labels[i]
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
				showLines: true,
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
		expect(meta.data[0] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Arc).toBe(true);

 		// add 3 items
		chart.data.labels = ['label1', 'label2', 'label3', 'label4', 'label5'];
		chart.data.datasets[0].data = [1, 2, 3, 4, 5];
		chart.update();

		expect(meta.data.length).toBe(5);
		expect(meta.data[0] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Arc).toBe(true);
		expect(meta.data[4] instanceof Chart.elements.Arc).toBe(true);
	});

	it('should set arc hover styles', function() {
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
				showLines: true,
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
		var arc = meta.data[0];

		meta.controller.setHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(230, 0, 0)');
		expect(arc._model.borderColor).toBe('rgb(0, 230, 0)');
		expect(arc._model.borderWidth).toBe(1.2);

		// Can set hover style per dataset
		chart.data.datasets[0].hoverBackgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].hoverBorderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].hoverBorderWidth = 2.1;

		meta.controller.setHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(77, 79, 81)');
		expect(arc._model.borderColor).toBe('rgb(123, 125, 127)');
		expect(arc._model.borderWidth).toBe(2.1);

		// Custom style
		arc.custom = {
			hoverBorderWidth: 5.5,
			hoverBackgroundColor: 'rgb(0, 0, 0)',
			hoverBorderColor: 'rgb(10, 10, 10)'
		};

		meta.controller.setHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(0, 0, 0)');
		expect(arc._model.borderColor).toBe('rgb(10, 10, 10)');
		expect(arc._model.borderWidth).toBe(5.5);
	});

	it('should remove hover styles', function() {
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
				showLines: true,
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
		var arc = meta.data[0];

		chart.options.elements.arc.backgroundColor = 'rgb(45, 46, 47)';
		chart.options.elements.arc.borderColor = 'rgb(50, 51, 52)';
		chart.options.elements.arc.borderWidth = 10.1;

		meta.controller.removeHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(45, 46, 47)');
		expect(arc._model.borderColor).toBe('rgb(50, 51, 52)');
		expect(arc._model.borderWidth).toBe(10.1);

		// Can set hover style per dataset
		chart.data.datasets[0].backgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].borderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].borderWidth = 2.1;

		meta.controller.removeHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(77, 79, 81)');
		expect(arc._model.borderColor).toBe('rgb(123, 125, 127)');
		expect(arc._model.borderWidth).toBe(2.1);

		// Custom style
		arc.custom = {
			borderWidth: 5.5,
			backgroundColor: 'rgb(0, 0, 0)',
			borderColor: 'rgb(10, 10, 10)'
		};

		meta.controller.removeHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(0, 0, 0)');
		expect(arc._model.borderColor).toBe('rgb(10, 10, 10)');
		expect(arc._model.borderWidth).toBe(5.5);
	});
});
