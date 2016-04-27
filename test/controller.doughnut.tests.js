// Test the bar controller
describe('Doughnut controller tests', function() {

	beforeEach(function() {
		window.addDefaultMatchers(jasmine);
	});

	afterEach(function() {
		window.releaseAllCharts();
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
						borderWidth: 2,
						hoverBackgroundColor: 'rgb(255, 255, 255)'
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(1);

		meta.controller.reset(); // reset first

		expect(meta.data.length).toBe(4);

		[	{ c: 0 },
			{ c: 0 },
			{ c: 0,           },
			{ c: 0 }
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(256);
			expect(meta.data[i]._model.y).toBeCloseToPixel(272);
			expect(meta.data[i]._model.outerRadius).toBeCloseToPixel(239);
			expect(meta.data[i]._model.innerRadius).toBeCloseToPixel(179);
			expect(meta.data[i]._model.circumference).toBeCloseTo(expected.c, 8);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				startAngle: Math.PI * -0.5,
				endAngle: Math.PI * -0.5,
				label: chart.data.labels[i],
				hoverBackgroundColor: 'rgb(255, 255, 255)',
				backgroundColor: 'rgb(255, 0, 0)',
				borderColor: 'rgb(0, 0, 255)',
				borderWidth: 2
			}));
		})

		chart.update();

		[	{ c: 1.7453292519, s: -1.5707963267, e: 0.1745329251 },
			{ c: 2.0943951023, s:  0.1745329251, e: 2.2689280275 },
			{ c: 0,            s:  2.2689280275, e: 2.2689280275 },
			{ c: 2.4434609527, s:  2.2689280275, e: 4.7123889803 }
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(256);
			expect(meta.data[i]._model.y).toBeCloseToPixel(272);
			expect(meta.data[i]._model.outerRadius).toBeCloseToPixel(239);
			expect(meta.data[i]._model.innerRadius).toBeCloseToPixel(179);
			expect(meta.data[i]._model.circumference).toBeCloseTo(expected.c, 8);
			expect(meta.data[i]._model.startAngle).toBeCloseTo(expected.s, 8);
			expect(meta.data[i]._model.endAngle).toBeCloseTo(expected.e, 8);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				label: chart.data.labels[i],
				hoverBackgroundColor: 'rgb(255, 255, 255)',
				backgroundColor: 'rgb(255, 0, 0)',
				borderColor: 'rgb(0, 0, 255)',
				borderWidth: 2
			}));
		})

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
				cutoutPercentage: 50,
				rotation: Math.PI,
				circumference: Math.PI * 0.5,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
						hoverBackgroundColor: 'rgb(255, 255, 255)'
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(1);

		expect(meta.data.length).toBe(2);

		// Only startAngle, endAngle and circumference should be different.
		[	{ c:     Math.PI / 8, s: Math.PI,               e: Math.PI + Math.PI / 8 },
			{ c: 3 * Math.PI / 8, s: Math.PI + Math.PI / 8, e: Math.PI + Math.PI / 2 }
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(495);
			expect(meta.data[i]._model.y).toBeCloseToPixel(511);
			expect(meta.data[i]._model.outerRadius).toBeCloseToPixel(478);
			expect(meta.data[i]._model.innerRadius).toBeCloseToPixel(359);
			expect(meta.data[i]._model.circumference).toBeCloseTo(expected.c,8);
			expect(meta.data[i]._model.startAngle).toBeCloseTo(expected.s, 8);
			expect(meta.data[i]._model.endAngle).toBeCloseTo(expected.e, 8);
		})
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

	it ('should set the hover style of an arc', function() {
		var chart = window.acquireChart({
			type: 'doughnut',
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: ['label0', 'label1', 'label2', 'label3']
			},
			options: {
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(0);
		var arc = meta.data[0];

		meta.controller.setHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(230, 0, 0)');
		expect(arc._model.borderColor).toBe('rgb(0, 0, 230)');
		expect(arc._model.borderWidth).toBe(2);

		// Set a dataset style to take precedence
		chart.data.datasets[0].hoverBackgroundColor = 'rgb(9, 9, 9)';
		chart.data.datasets[0].hoverBorderColor = 'rgb(18, 18, 18)';
		chart.data.datasets[0].hoverBorderWidth = 1.56;

		meta.controller.setHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(9, 9, 9)');
		expect(arc._model.borderColor).toBe('rgb(18, 18, 18)');
		expect(arc._model.borderWidth).toBe(1.56);

		// Dataset styles can be an array
		chart.data.datasets[0].hoverBackgroundColor = ['rgb(255, 255, 255)', 'rgb(9, 9, 9)'];
		chart.data.datasets[0].hoverBorderColor = ['rgb(18, 18, 18)'];
		chart.data.datasets[0].hoverBorderWidth = [0.1, 1.56];

		meta.controller.setHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(255, 255, 255)');
		expect(arc._model.borderColor).toBe('rgb(18, 18, 18)');
		expect(arc._model.borderWidth).toBe(0.1);

		// Element custom styles also work
		arc.custom = {
			hoverBackgroundColor: 'rgb(7, 7, 7)',
			hoverBorderColor: 'rgb(17, 17, 17)',
			hoverBorderWidth: 3.14159,
		};

		meta.controller.setHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(7, 7, 7)');
		expect(arc._model.borderColor).toBe('rgb(17, 17, 17)');
		expect(arc._model.borderWidth).toBe(3.14159);
	});

	it ('should unset the hover style of an arc', function() {
		var chart = window.acquireChart({
			type: 'doughnut',
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: ['label0', 'label1', 'label2', 'label3']
			},
			options: {
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(0);
		var arc = meta.data[0];

		meta.controller.removeHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(255, 0, 0)');
		expect(arc._model.borderColor).toBe('rgb(0, 0, 255)');
		expect(arc._model.borderWidth).toBe(2);

		// Set a dataset style to take precedence
		chart.data.datasets[0].backgroundColor = 'rgb(9, 9, 9)';
		chart.data.datasets[0].borderColor = 'rgb(18, 18, 18)';
		chart.data.datasets[0].borderWidth = 1.56;

		meta.controller.removeHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(9, 9, 9)');
		expect(arc._model.borderColor).toBe('rgb(18, 18, 18)');
		expect(arc._model.borderWidth).toBe(1.56);

		// Dataset styles can be an array
		chart.data.datasets[0].backgroundColor = ['rgb(255, 255, 255)', 'rgb(9, 9, 9)'];
		chart.data.datasets[0].borderColor = ['rgb(18, 18, 18)'];
		chart.data.datasets[0].borderWidth = [0.1, 1.56];

		meta.controller.removeHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(255, 255, 255)');
		expect(arc._model.borderColor).toBe('rgb(18, 18, 18)');
		expect(arc._model.borderWidth).toBe(0.1);

		// Element custom styles also work
		arc.custom = {
			backgroundColor: 'rgb(7, 7, 7)',
			borderColor: 'rgb(17, 17, 17)',
			borderWidth: 3.14159,
		};

		meta.controller.removeHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(7, 7, 7)');
		expect(arc._model.borderColor).toBe('rgb(17, 17, 17)');
		expect(arc._model.borderWidth).toBe(3.14159);
	});
});
