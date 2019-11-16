describe('Chart.controllers.radar', function() {
	describe('auto', jasmine.fixture.specs('controller.radar'));

	it('should be registered as dataset controller', function() {
		expect(typeof Chart.controllers.radar).toBe('function');
	});

	it('Should be constructed', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: []
				}],
				labels: []
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.type).toBe('radar');
		expect(meta.controller).not.toBe(undefined);
		expect(meta.controller.index).toBe(0);
		expect(meta.data).toEqual([]);

		meta.controller.updateIndex(1);
		expect(meta.controller.index).toBe(1);
	});

	it('Should create arc elements for each data item during initialization', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			}
		});

		var meta = chart.getDatasetMeta(0);
		expect(meta.dataset instanceof Chart.elements.Line).toBe(true); // line element
		expect(meta.data.length).toBe(4); // 4 points created
		expect(meta.data[0] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[1] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[2] instanceof Chart.elements.Point).toBe(true);
		expect(meta.data[3] instanceof Chart.elements.Point).toBe(true);
	});

	it('should draw all elements', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			}
		});

		var meta = chart.getDatasetMeta(0);

		spyOn(meta.dataset, 'draw');
		spyOn(meta.data[0], 'draw');
		spyOn(meta.data[1], 'draw');
		spyOn(meta.data[2], 'draw');
		spyOn(meta.data[3], 'draw');

		chart.update();

		expect(meta.dataset.draw.calls.count()).toBe(1);
		expect(meta.data[0].draw.calls.count()).toBe(1);
		expect(meta.data[1].draw.calls.count()).toBe(1);
		expect(meta.data[2].draw.calls.count()).toBe(1);
		expect(meta.data[3].draw.calls.count()).toBe(1);
	});

	it('should update elements', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				showLines: true,
				legend: false,
				title: false,
				elements: {
					line: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderCapStyle: 'round',
						borderColor: 'rgb(0, 255, 0)',
						borderDash: [],
						borderDashOffset: 0.1,
						borderJoinStyle: 'bevel',
						borderWidth: 1.2,
						fill: true,
						tension: 0.1,
					},
					point: {
						backgroundColor: Chart.defaults.global.defaultColor,
						borderWidth: 1,
						borderColor: Chart.defaults.global.defaultColor,
						hitRadius: 1,
						hoverRadius: 4,
						hoverBorderWidth: 1,
						radius: 3,
						pointStyle: 'circle'
					}
				}
			}
		});

		var meta = chart.getDatasetMeta(0);

		meta.controller.reset(); // reset first

		// Line element
		expect(meta.dataset._model).toEqual(jasmine.objectContaining({
			backgroundColor: 'rgb(255, 0, 0)',
			borderCapStyle: 'round',
			borderColor: 'rgb(0, 255, 0)',
			borderDash: [],
			borderDashOffset: 0.1,
			borderJoinStyle: 'bevel',
			borderWidth: 1.2,
			fill: true,
			tension: 0.1,
		}));

		[
			{x: 256, y: 260, cppx: 256, cppy: 260, cpnx: 256, cpny: 260},
			{x: 256, y: 260, cppx: 256, cppy: 260, cpnx: 256, cpny: 260},
			{x: 256, y: 260, cppx: 256, cppy: 260, cpnx: 256, cpny: 260},
			{x: 256, y: 260, cppx: 256, cppy: 260, cpnx: 256, cpny: 260},
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(expected.x);
			expect(meta.data[i]._model.y).toBeCloseToPixel(expected.y);
			expect(meta.data[i]._model.controlPointPreviousX).toBeCloseToPixel(expected.cppx);
			expect(meta.data[i]._model.controlPointPreviousY).toBeCloseToPixel(expected.cppy);
			expect(meta.data[i]._model.controlPointNextX).toBeCloseToPixel(expected.cpnx);
			expect(meta.data[i]._model.controlPointNextY).toBeCloseToPixel(expected.cpny);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				backgroundColor: Chart.defaults.global.defaultColor,
				borderWidth: 1,
				borderColor: Chart.defaults.global.defaultColor,
				hitRadius: 1,
				radius: 3,
				pointStyle: 'circle',
				skip: false,
			}));
		});

		// Now update controller and ensure proper updates
		meta.controller._update();

		[
			{x: 256, y: 120, cppx: 246, cppy: 120, cpnx: 272, cpny: 120},
			{x: 464, y: 260, cppx: 464, cppy: 252, cpnx: 464, cpny: 266},
			{x: 256, y: 260, cppx: 277, cppy: 260, cpnx: 250, cpny: 260},
			{x: 200, y: 260, cppx: 200, cppy: 264, cpnx: 200, cpny: 250},
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(expected.x);
			expect(meta.data[i]._model.y).toBeCloseToPixel(expected.y);
			expect(meta.data[i]._model.controlPointPreviousX).toBeCloseToPixel(expected.cppx);
			expect(meta.data[i]._model.controlPointPreviousY).toBeCloseToPixel(expected.cppy);
			expect(meta.data[i]._model.controlPointNextX).toBeCloseToPixel(expected.cpnx);
			expect(meta.data[i]._model.controlPointNextY).toBeCloseToPixel(expected.cpny);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				backgroundColor: Chart.defaults.global.defaultColor,
				borderWidth: 1,
				borderColor: Chart.defaults.global.defaultColor,
				hitRadius: 1,
				radius: 3,
				pointStyle: 'circle',
				skip: false,
			}));
		});

		// Use dataset level styles for lines & points
		chart.data.datasets[0].lineTension = 0;
		chart.data.datasets[0].backgroundColor = 'rgb(98, 98, 98)';
		chart.data.datasets[0].borderColor = 'rgb(8, 8, 8)';
		chart.data.datasets[0].borderWidth = 0.55;
		chart.data.datasets[0].borderCapStyle = 'butt';
		chart.data.datasets[0].borderDash = [2, 3];
		chart.data.datasets[0].borderDashOffset = 7;
		chart.data.datasets[0].borderJoinStyle = 'miter';
		chart.data.datasets[0].fill = false;

		// point styles
		chart.data.datasets[0].pointRadius = 22;
		chart.data.datasets[0].hitRadius = 3.3;
		chart.data.datasets[0].pointBackgroundColor = 'rgb(128, 129, 130)';
		chart.data.datasets[0].pointBorderColor = 'rgb(56, 57, 58)';
		chart.data.datasets[0].pointBorderWidth = 1.123;

		meta.controller._update();

		expect(meta.dataset._model).toEqual(jasmine.objectContaining({
			backgroundColor: 'rgb(98, 98, 98)',
			borderCapStyle: 'butt',
			borderColor: 'rgb(8, 8, 8)',
			borderDash: [2, 3],
			borderDashOffset: 7,
			borderJoinStyle: 'miter',
			borderWidth: 0.55,
			fill: false,
			tension: 0,
		}));

		// Since tension is now 0, we don't care about the control points
		[
			{x: 256, y: 120},
			{x: 464, y: 260},
			{x: 256, y: 260},
			{x: 200, y: 260},
		].forEach(function(expected, i) {
			expect(meta.data[i]._model.x).toBeCloseToPixel(expected.x);
			expect(meta.data[i]._model.y).toBeCloseToPixel(expected.y);
			expect(meta.data[i]._model).toEqual(jasmine.objectContaining({
				backgroundColor: 'rgb(128, 129, 130)',
				borderWidth: 1.123,
				borderColor: 'rgb(56, 57, 58)',
				hitRadius: 3.3,
				radius: 22,
				pointStyle: 'circle',
				skip: false,
			}));
		});
	});

	describe('Interactions', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
				type: 'radar',
				data: {
					labels: ['label1', 'label2', 'label3', 'label4'],
					datasets: [{
						data: [10, 15, 0, 4]
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
	});

	it('should allow pointBorderWidth to be set to 0', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 15, 0, 4],
					pointBorderWidth: 0
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			}
		});

		var meta = chart.getDatasetMeta(0);
		var point = meta.data[0];
		expect(point._model.borderWidth).toBe(0);
	});

	it('should use the pointRadius setting over the radius setting', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 15, 0, 4],
					pointRadius: 10,
					radius: 15,
				}, {
					data: [20, 20, 20, 20],
					radius: 20
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			}
		});

		var meta0 = chart.getDatasetMeta(0);
		var meta1 = chart.getDatasetMeta(1);
		expect(meta0.data[0]._model.radius).toBe(10);
		expect(meta1.data[0]._model.radius).toBe(20);
	});

	it('should return id for value scale', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 15, 0, 4],
					pointBorderWidth: 0
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				scale: {id: 'test'}
			}
		});

		var controller = chart.getDatasetMeta(0).controller;
		expect(controller._getValueScaleId()).toBe('test');
	});
});
