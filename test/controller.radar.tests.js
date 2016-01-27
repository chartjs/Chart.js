// Test the polar area controller
describe('Radar controller tests', function() {
	it('Should be constructed', function() {
		var chart = {
			data: {
				datasets: [{
					data: []
				}]
			}
		};

		var controller = new Chart.controllers.radar(chart, 0);
		expect(controller).not.toBe(undefined);
		expect(controller.index).toBe(0);
		expect(chart.data.datasets[0].metaData).toEqual([]);

		controller.updateIndex(1);
		expect(controller.index).toBe(1);
	});

	it('Should create arc elements for each data item during initialization', function() {
		var chart = {
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			config: {
				type: 'radar'
			},
			options: {
			}
		};

		var controller = new Chart.controllers.radar(chart, 0);

		// Line element
		expect(chart.data.datasets[0].metaDataset instanceof Chart.elements.Line).toBe(true);

		expect(chart.data.datasets[0].metaData.length).toBe(4); // 4 points created
		expect(chart.data.datasets[0].metaData[0] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[1] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[2] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[3] instanceof Chart.elements.Point).toBe(true);
	});

	it('should draw all elements', function() {
		var chart = {
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
			config: {
				type: 'radar'
			},
			options: {
			}
		};

		var controller = new Chart.controllers.radar(chart, 0);

		spyOn(chart.data.datasets[0].metaDataset, 'draw');
		spyOn(chart.data.datasets[0].metaData[0], 'draw');
		spyOn(chart.data.datasets[0].metaData[1], 'draw');
		spyOn(chart.data.datasets[0].metaData[2], 'draw');
		spyOn(chart.data.datasets[0].metaData[3], 'draw');

		controller.draw();

		expect(chart.data.datasets[0].metaDataset.draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[0].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[1].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[2].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[3].draw.calls.count()).toBe(1);
	});

	it('should update elements', function() {
		var data = {
			datasets: [{
				data: [10, 15, 0, -4],
				label: 'dataset2'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var ScaleConstructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		scaleConfig = Chart.helpers.scaleMerge(scaleConfig, Chart.defaults.radar.scale);
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
			chart: {
				data: data
			},
		});

		// Update ticks & set physical dimensions
		scale.top = 0;
		scale.left = 0;
		scale.right = 300;
		scale.bottom = 300;
		scale.update(300, 300);

		var chart = {
			chartArea: {
				bottom: 300,
				left: 0,
				right: 300,
				top: 0
			},
			data: data,
			config: {
				type: 'radar'
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
			},
			scale: scale
		};

		var controller = new Chart.controllers.radar(chart, 0);
		controller.update();

		// Line element
		expect(chart.data.datasets[0].metaDataset._model).toEqual({
			backgroundColor: 'rgb(255, 0, 0)',
			borderCapStyle: 'round',
			borderColor: 'rgb(0, 255, 0)',
			borderDash: [],
			borderDashOffset: 0.1,
			borderJoinStyle: 'bevel',
			borderWidth: 1.2,
			fill: true,
			tension: 0.1,

			scaleTop: 0,
			scaleBottom: 300,
			scaleZero: {
				x: 150,
				y: 133
			},
		});

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 3,
			pointStyle: 'circle',
			skip: false,
			tension: 0.1,

			// Point
			x: 150,
			y: 91,

			// Control points
			controlPointPreviousX: 146.99829997808834,
			controlPointPreviousY: 91,
			controlPointNextX: 155.09829997808833,
			controlPointNextY: 91,
		});

		expect(chart.data.datasets[0].metaData[1]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 3,
			pointStyle: 'circle',
			skip: false,
			tension: 0.1,

			// Point
			x: 231,
			y: 150,

			// Control points
			controlPointPreviousX: 231,
			controlPointPreviousY: 145.8377025234528,
			controlPointNextX: 231,
			controlPointNextY: 153.4377025234528,
		});

		expect(chart.data.datasets[0].metaData[2]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 3,
			pointStyle: 'circle',
			skip: false,
			tension: 0.1,

			// Point
			x: 150,
			y: 167,

			// Control points
			controlPointPreviousX: 156.7197526476963,
			controlPointPreviousY: 167,
			controlPointNextX: 148.61975264769632,
			controlPointNextY: 167,
		});

		expect(chart.data.datasets[0].metaData[3]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 3,
			pointStyle: 'circle',
			skip: false,
			tension: 0.1,

			// Point
			x: 150,
			y: 150,

			// Control points
			controlPointPreviousX: 150,
			controlPointPreviousY: 151.7,
			controlPointNextX: 150,
			controlPointNextY: 144.1,
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

		controller.update();

		expect(chart.data.datasets[0].metaDataset._model).toEqual({
			backgroundColor: 'rgb(98, 98, 98)',
			borderCapStyle: 'butt',
			borderColor: 'rgb(8, 8, 8)',
			borderDash: [2, 3],
			borderDashOffset: 7,
			borderJoinStyle: 'miter',
			borderWidth: 0.55,
			fill: false,
			tension: 0,

			scaleTop: 0,
			scaleBottom: 300,
			scaleZero: {
				x: 150,
				y: 133
			}
		});

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			hitRadius: 3.3,
			radius: 22,
			pointStyle: 'circle',
			skip: false,
			tension: 0,

			// Point
			x: 150,
			y: 91,

			// Control points
			controlPointPreviousX: 150,
			controlPointPreviousY: 91,
			controlPointNextX: 150,
			controlPointNextY: 91,
		});

		expect(chart.data.datasets[0].metaData[1]._model).toEqual({
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			hitRadius: 3.3,
			radius: 22,
			pointStyle: 'circle',
			skip: false,
			tension: 0,

			// Point
			x: 231,
			y: 150,

			// Control points
			controlPointPreviousX: 231,
			controlPointPreviousY: 150,
			controlPointNextX: 231,
			controlPointNextY: 150,
		});

		expect(chart.data.datasets[0].metaData[2]._model).toEqual({
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			hitRadius: 3.3,
			radius: 22,
			pointStyle: 'circle',
			skip: false,
			tension: 0,

			// Point
			x: 150,
			y: 167,

			// Control points
			controlPointPreviousX: 150,
			controlPointPreviousY: 167,
			controlPointNextX: 150,
			controlPointNextY: 167,
		});

		expect(chart.data.datasets[0].metaData[3]._model).toEqual({
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			hitRadius: 3.3,
			radius: 22,
			pointStyle: 'circle',
			skip: false,
			tension: 0,

			// Point
			x: 150,
			y: 150,

			// Control points
			controlPointPreviousX: 150,
			controlPointPreviousY: 150,
			controlPointNextX: 150,
			controlPointNextY: 150,
		});

		// Use custom styles for lines & first point
		chart.data.datasets[0].metaDataset.custom = {
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
		chart.data.datasets[0].metaData[0].custom = {
			radius: 2.2,
			backgroundColor: 'rgb(0, 1, 3)',
			borderColor: 'rgb(4, 6, 8)',
			borderWidth: 0.787,
			tension: 0.15,
			skip: true,
			hitRadius: 5,
		};

		controller.update();

		expect(chart.data.datasets[0].metaDataset._model).toEqual({
			backgroundColor: 'rgb(55, 55, 54)',
			borderCapStyle: 'square',
			borderColor: 'rgb(8, 7, 6)',
			borderDash: [4, 3],
			borderDashOffset: 4.4,
			borderJoinStyle: 'round',
			borderWidth: 0.3,
			fill: true,
			tension: 0.25,

			scaleTop: 0,
			scaleBottom: 300,
			scaleZero: {
				x: 150,
				y: 133
			},
		});

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			backgroundColor: 'rgb(0, 1, 3)',
			borderWidth: 0.787,
			borderColor: 'rgb(4, 6, 8)',
			hitRadius: 5,
			radius: 2.2,
			pointStyle: 'circle',
			skip: true,
			tension: 0.15,

			// Point
			x: 150,
			y: 91,

			// Control points
			controlPointPreviousX: 145.4974499671325,
			controlPointPreviousY: 91,
			controlPointNextX: 157.6474499671325,
			controlPointNextY: 91,
		});
	});

	it('should handle number of data point changes in update', function() {
		var data = {
			datasets: [{
				data: [10, 15, 0, -4],
				label: 'dataset2',
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var ScaleConstructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		scaleConfig = Chart.helpers.scaleMerge(scaleConfig, Chart.defaults.radar.scale);
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
			chart: {
				data: data
			},
		});

		// Update ticks & set physical dimensions
		scale.top = 0;
		scale.left = 0;
		scale.right = 300;
		scale.bottom = 300;
		scale.update(300, 300);

		var chart = {
			chartArea: {
				bottom: 300,
				left: 0,
				right: 300,
				top: 0
			},
			data: data,
			config: {
				type: 'radar'
			},
			options: {
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
					}
				},
			},
			scale: scale
		};

		var controller = new Chart.controllers.radar(chart, 0);
		controller.update();
		expect(chart.data.datasets[0].metaData.length).toBe(4);

		chart.data.datasets[0].data = [1, 2]; // remove 2 items
		controller.buildOrUpdateElements();
		controller.update();
		expect(chart.data.datasets[0].metaData.length).toBe(2);
		expect(chart.data.datasets[0].metaData[0] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[1] instanceof Chart.elements.Point).toBe(true);

		chart.data.datasets[0].data = [1, 2, 3, 4, 5]; // add 3 items
		controller.buildOrUpdateElements();
		controller.update();
		expect(chart.data.datasets[0].metaData.length).toBe(5);
		expect(chart.data.datasets[0].metaData[0] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[1] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[2] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[3] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[4] instanceof Chart.elements.Point).toBe(true);
	});

	it('should set point hover styles', function() {
		var data = {
			datasets: [{
				data: [10, 15, 0, -4],
				label: 'dataset2',
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var ScaleConstructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		scaleConfig = Chart.helpers.scaleMerge(scaleConfig, Chart.defaults.radar.scale);
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
			chart: {
				data: data
			},
		});

		// Update ticks & set physical dimensions
		scale.top = 0;
		scale.left = 0;
		scale.right = 300;
		scale.bottom = 300;
		scale.update(300, 300);


		var chart = {
			chartArea: {
				bottom: 300,
				left: 0,
				right: 300,
				top: 0
			},
			data: data,
			config: {
				type: 'radar'
			},
			options: {
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
			},
			scale: scale
		};

		var controller = new Chart.controllers.radar(chart, 0);
		controller.update();
		var point = chart.data.datasets[0].metaData[0];

		controller.setHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(229, 230, 0)');
		expect(point._model.borderColor).toBe('rgb(230, 230, 230)');
		expect(point._model.borderWidth).toBe(1);
		expect(point._model.radius).toBe(4);

		// Can set hover style per dataset
		chart.data.datasets[0].pointHoverRadius = 3.3;
		chart.data.datasets[0].pointHoverBackgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].pointHoverBorderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].pointHoverBorderWidth = 2.1;

		controller.setHoverStyle(point);
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

		controller.setHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(0, 0, 0)');
		expect(point._model.borderColor).toBe('rgb(10, 10, 10)');
		expect(point._model.borderWidth).toBe(5.5);
		expect(point._model.radius).toBe(4.4);
	});


	it('should remove hover styles', function() {
		var data = {
			datasets: [{
				data: [10, 15, 0, -4],
				label: 'dataset2',
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var ScaleConstructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		scaleConfig = Chart.helpers.scaleMerge(scaleConfig, Chart.defaults.radar.scale);
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
			chart: {
				data: data
			},
		});

		// Update ticks & set physical dimensions
		scale.top = 0;
		scale.left = 0;
		scale.right = 300;
		scale.bottom = 300;
		scale.update(300, 300);


		var chart = {
			chartArea: {
				bottom: 300,
				left: 0,
				right: 300,
				top: 0
			},
			data: data,
			config: {
				type: 'radar'
			},
			options: {
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
			},
			scale: scale
		};

		var controller = new Chart.controllers.radar(chart, 0);
		controller.update();
		var point = chart.data.datasets[0].metaData[0];

		chart.options.elements.point.backgroundColor = 'rgb(45, 46, 47)';
		chart.options.elements.point.borderColor = 'rgb(50, 51, 52)';
		chart.options.elements.point.borderWidth = 10.1;
		chart.options.elements.point.radius = 1.01;

		controller.removeHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(45, 46, 47)');
		expect(point._model.borderColor).toBe('rgb(50, 51, 52)');
		expect(point._model.borderWidth).toBe(10.1);
		expect(point._model.radius).toBe(1.01);

		// Can set hover style per dataset
		chart.data.datasets[0].radius = 3.3;
		chart.data.datasets[0].pointBackgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].pointBorderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].pointBorderWidth = 2.1;

		controller.removeHoverStyle(point);
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

		controller.removeHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(0, 0, 0)');
		expect(point._model.borderColor).toBe('rgb(10, 10, 10)');
		expect(point._model.borderWidth).toBe(5.5);
		expect(point._model.radius).toBe(4.4);
	});
});