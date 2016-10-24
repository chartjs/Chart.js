// Test the polar area controller
describe('Radar controller tests', function() {
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
		expect(meta.dataset._model.scaleTop).toBeCloseToPixel(32);
		expect(meta.dataset._model.scaleBottom).toBeCloseToPixel(512);
		expect(meta.dataset._model.scaleZero.x).toBeCloseToPixel(256);
		expect(meta.dataset._model.scaleZero.y).toBeCloseToPixel(272);
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
			{x: 256, y: 272, cppx: 256, cppy: 272, cpnx: 256, cpny: 272},
			{x: 256, y: 272, cppx: 256, cppy: 272, cpnx: 256, cpny: 272},
			{x: 256, y: 272, cppx: 256, cppy: 272, cpnx: 256, cpny: 272},
			{x: 256, y: 272, cppx: 256, cppy: 272, cpnx: 256, cpny: 272},
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
				tension: 0.1,
			}));
		});

		// Now update controller and ensure proper updates
		meta.controller.update();

		[
			{x: 256, y: 133, cppx: 246, cppy: 133, cpnx: 272, cpny: 133},
			{x: 464, y: 272, cppx: 464, cppy: 264, cpnx: 464, cpny: 278},
			{x: 256, y: 272, cppx: 276.9, cppy: 272, cpnx: 250.4, cpny: 272},
			{x: 200, y: 272, cppx: 200, cppy: 275, cpnx: 200, cpny: 261},
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
				tension: 0.1,
			}));
		});

		// Use dataset level styles for lines & points
		chart.data.datasets[0].tension = 0;
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

		meta.controller.update();

		expect(meta.dataset._model.scaleTop).toBeCloseToPixel(32);
		expect(meta.dataset._model.scaleBottom).toBeCloseToPixel(512);
		expect(meta.dataset._model.scaleZero.x).toBeCloseToPixel(256);
		expect(meta.dataset._model.scaleZero.y).toBeCloseToPixel(272);
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
			{x: 256, y: 133},
			{x: 464, y: 272},
			{x: 256, y: 272},
			{x: 200, y: 272},
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
				tension: 0,
			}));
		});


		// Use custom styles for lines & first point
		meta.dataset.custom = {
			tension: 0.25,
			backgroundColor: 'rgb(55, 55, 54)',
			borderColor: 'rgb(8, 7, 6)',
			borderWidth: 0.3,
			borderCapStyle: 'square',
			borderDash: [4, 3],
			borderDashOffset: 4.4,
			borderJoinStyle: 'round',
			fill: true,
		};

		// point styles
		meta.data[0].custom = {
			radius: 2.2,
			backgroundColor: 'rgb(0, 1, 3)',
			borderColor: 'rgb(4, 6, 8)',
			borderWidth: 0.787,
			tension: 0.15,
			skip: true,
			hitRadius: 5,
		};

		meta.controller.update();

		expect(meta.dataset._model.scaleTop).toBeCloseToPixel(32);
		expect(meta.dataset._model.scaleBottom).toBeCloseToPixel(512);
		expect(meta.dataset._model.scaleZero.x).toBeCloseToPixel(256);
		expect(meta.dataset._model.scaleZero.y).toBeCloseToPixel(272);
		expect(meta.dataset._model).toEqual(jasmine.objectContaining({
			backgroundColor: 'rgb(55, 55, 54)',
			borderCapStyle: 'square',
			borderColor: 'rgb(8, 7, 6)',
			borderDash: [4, 3],
			borderDashOffset: 4.4,
			borderJoinStyle: 'round',
			borderWidth: 0.3,
			fill: true,
			tension: 0.25,
		}));

		expect(meta.data[0]._model.x).toBeCloseToPixel(256);
		expect(meta.data[0]._model.y).toBeCloseToPixel(133);
		expect(meta.data[0]._model.controlPointPreviousX).toBeCloseToPixel(241);
		expect(meta.data[0]._model.controlPointPreviousY).toBeCloseToPixel(133);
		expect(meta.data[0]._model.controlPointNextX).toBeCloseToPixel(281);
		expect(meta.data[0]._model.controlPointNextY).toBeCloseToPixel(133);
		expect(meta.data[0]._model).toEqual(jasmine.objectContaining({
			radius: 2.2,
			backgroundColor: 'rgb(0, 1, 3)',
			borderColor: 'rgb(4, 6, 8)',
			borderWidth: 0.787,
			tension: 0.15,
			skip: true,
			hitRadius: 5,
		}));
	});

	it('should set point hover styles', function() {
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
						skipNull: true,
						tension: 0.1,
					},
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

		meta.controller.update(); // reset first

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
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 15, 0, 4]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				showLines: true,
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
						skipNull: true,
						tension: 0.1,
					},
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

		meta.controller.update(); // reset first

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
