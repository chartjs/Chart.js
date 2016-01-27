// Test the polar area controller
describe('Polar area controller tests', function() {
	it('Should be constructed', function() {
		var chart = {
			data: {
				datasets: [{
					data: []
				}]
			}
		};

		var controller = new Chart.controllers.polarArea(chart, 0);
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
				}]
			},
			config: {
				type: 'polarArea'
			},
			options: {
			}
		};

		var controller = new Chart.controllers.polarArea(chart, 0);

		expect(chart.data.datasets[0].metaData.length).toBe(4); // 4 arcs created
		expect(chart.data.datasets[0].metaData[0] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[1] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[2] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[3] instanceof Chart.elements.Arc).toBe(true);
	});

	it('should draw all elements', function() {
		var chart = {
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
			config: {
				type: 'polarArea'
			},
			options: {
			}
		};

		var controller = new Chart.controllers.polarArea(chart, 0);

		spyOn(chart.data.datasets[0].metaData[0], 'draw');
		spyOn(chart.data.datasets[0].metaData[1], 'draw');
		spyOn(chart.data.datasets[0].metaData[2], 'draw');
		spyOn(chart.data.datasets[0].metaData[3], 'draw');

		controller.draw();

		expect(chart.data.datasets[0].metaData[0].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[1].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[2].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[3].draw.calls.count()).toBe(1);
	});

	it('should update elements', function() {
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
		scaleConfig = Chart.helpers.scaleMerge(scaleConfig, Chart.defaults.polarArea.scale);
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
			chart: {
				data: data
			},
		});

		// Update ticks & set physical dimensions
		scale.update(300, 300);
		scale.top = 0;
		scale.left = 0;
		scale.right = 300;
		scale.bottom = 300;

		var chart = {
			chartArea: {
				bottom: 300,
				left: 0,
				right: 300,
				top: 0
			},
			data: data,
			config: {
				type: 'line'
			},
			options: {
				showLines: true,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 255, 0)',
						borderWidth: 1.2,
					},
				},
			},
			scale: scale
		};

		var controller = new Chart.controllers.polarArea(chart, 0);
		controller.update();

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			x: 150,
			y: 150,
			innerRadius: 0,
			outerRadius: 59.5,
			startAngle: -0.5 * Math.PI,
			endAngle: 0,
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 255, 0)',
			borderWidth: 1.2,
			label: 'label1'
		});

		expect(chart.data.datasets[0].metaData[1]._model).toEqual({
			x: 150,
			y: 150,
			innerRadius: 0,
			outerRadius: 80.75,
			startAngle: 0,
			endAngle: 0.5 * Math.PI,
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 255, 0)',
			borderWidth: 1.2,
			label: 'label2'
		});

		expect(chart.data.datasets[0].metaData[2]._model).toEqual({
			x: 150,
			y: 150,
			innerRadius: 0,
			outerRadius: 17,
			startAngle: 0.5 * Math.PI,
			endAngle: Math.PI,
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 255, 0)',
			borderWidth: 1.2,
			label: 'label3'
		});

		expect(chart.data.datasets[0].metaData[3]._model).toEqual({
			x: 150,
			y: 150,
			innerRadius: 0,
			outerRadius: 0,
			startAngle: Math.PI,
			endAngle: 1.5 * Math.PI,
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 255, 0)',
			borderWidth: 1.2,
			label: 'label4'
		});

		// arc styles
		chart.data.datasets[0].backgroundColor = 'rgb(128, 129, 130)';
		chart.data.datasets[0].borderColor = 'rgb(56, 57, 58)';
		chart.data.datasets[0].borderWidth = 1.123;

		controller.update();

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			x: 150,
			y: 150,
			innerRadius: 0,
			outerRadius: 59.5,
			startAngle: -0.5 * Math.PI,
			endAngle: 0,
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			label: 'label1'
		});

		expect(chart.data.datasets[0].metaData[1]._model).toEqual({
			x: 150,
			y: 150,
			innerRadius: 0,
			outerRadius: 80.75,
			startAngle: 0,
			endAngle: 0.5 * Math.PI,
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			label: 'label2'
		});

		expect(chart.data.datasets[0].metaData[2]._model).toEqual({
			x: 150,
			y: 150,
			innerRadius: 0,
			outerRadius: 17,
			startAngle: 0.5 * Math.PI,
			endAngle: Math.PI,
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			label: 'label3'
		});

		expect(chart.data.datasets[0].metaData[3]._model).toEqual({
			x: 150,
			y: 150,
			innerRadius: 0,
			outerRadius: 0,
			startAngle: Math.PI,
			endAngle: 1.5 * Math.PI,
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			label: 'label4'
		});

		// arc styles
		chart.data.datasets[0].metaData[0].custom = {
			backgroundColor: 'rgb(0, 1, 3)',
			borderColor: 'rgb(4, 6, 8)',
			borderWidth: 0.787,

		};

		controller.update();

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			x: 150,
			y: 150,
			innerRadius: 0,
			outerRadius: 59.5,
			startAngle: -0.5 * Math.PI,
			endAngle: 0,
			backgroundColor: 'rgb(0, 1, 3)',
			borderWidth: 0.787,
			borderColor: 'rgb(4, 6, 8)',
			label: 'label1'
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
		scaleConfig = Chart.helpers.scaleMerge(scaleConfig, Chart.defaults.polarArea.scale);
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
			chart: {
				data: data
			},
		});

		// Update ticks & set physical dimensions
		scale.update(300, 300);
		scale.top = 0;
		scale.left = 0;
		scale.right = 300;
		scale.bottom = 300;

		var chart = {
			chartArea: {
				bottom: 300,
				left: 0,
				right: 300,
				top: 0
			},
			data: data,
			config: {
				type: 'line'
			},
			options: {
				showLines: true,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 255, 0)',
						borderWidth: 1.2,
					},
				},
			},
			scale: scale
		};

		var controller = new Chart.controllers.polarArea(chart, 0);
		controller.update();
		expect(chart.data.datasets[0].metaData.length).toBe(4);

		chart.data.datasets[0].data = [1, 2]; // remove 2 items
		controller.buildOrUpdateElements();
		controller.update();
		expect(chart.data.datasets[0].metaData.length).toBe(2);
		expect(chart.data.datasets[0].metaData[0] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[1] instanceof Chart.elements.Arc).toBe(true);

		chart.data.datasets[0].data = [1, 2, 3, 4, 5]; // add 3 items
		controller.buildOrUpdateElements();
		controller.update();
		expect(chart.data.datasets[0].metaData.length).toBe(5);
		expect(chart.data.datasets[0].metaData[0] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[1] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[2] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[3] instanceof Chart.elements.Arc).toBe(true);
		expect(chart.data.datasets[0].metaData[4] instanceof Chart.elements.Arc).toBe(true);
	});

	it('should set arc hover styles', function() {
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
		scaleConfig = Chart.helpers.scaleMerge(scaleConfig, Chart.defaults.polarArea.scale);
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
			chart: {
				data: data
			},
		});

		// Update ticks & set physical dimensions
		scale.update(300, 300);
		scale.top = 0;
		scale.left = 0;
		scale.right = 300;
		scale.bottom = 300;

		var chart = {
			chartArea: {
				bottom: 300,
				left: 0,
				right: 300,
				top: 0
			},
			data: data,
			config: {
				type: 'line'
			},
			options: {
				showLines: true,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 255, 0)',
						borderWidth: 1.2,
					},
				},
			},
			scale: scale
		};

		var controller = new Chart.controllers.polarArea(chart, 0);
		controller.update();
		var arc = chart.data.datasets[0].metaData[0];

		controller.setHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(230, 0, 0)');
		expect(arc._model.borderColor).toBe('rgb(0, 230, 0)');
		expect(arc._model.borderWidth).toBe(1.2);

		// Can set hover style per dataset
		chart.data.datasets[0].hoverBackgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].hoverBorderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].hoverBorderWidth = 2.1;

		controller.setHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(77, 79, 81)');
		expect(arc._model.borderColor).toBe('rgb(123, 125, 127)');
		expect(arc._model.borderWidth).toBe(2.1);

		// Custom style
		arc.custom = {
			hoverBorderWidth: 5.5,
			hoverBackgroundColor: 'rgb(0, 0, 0)',
			hoverBorderColor: 'rgb(10, 10, 10)'
		};

		controller.setHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(0, 0, 0)');
		expect(arc._model.borderColor).toBe('rgb(10, 10, 10)');
		expect(arc._model.borderWidth).toBe(5.5);
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
		scaleConfig = Chart.helpers.scaleMerge(scaleConfig, Chart.defaults.polarArea.scale);
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
			chart: {
				data: data
			},
		});

		// Update ticks & set physical dimensions
		scale.update(300, 300);
		scale.top = 0;
		scale.left = 0;
		scale.right = 300;
		scale.bottom = 300;

		var chart = {
			chartArea: {
				bottom: 300,
				left: 0,
				right: 300,
				top: 0
			},
			data: data,
			config: {
				type: 'line'
			},
			options: {
				showLines: true,
				elements: {
					arc: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 255, 0)',
						borderWidth: 1.2,
					},
				},
			},
			scale: scale
		};

		var controller = new Chart.controllers.polarArea(chart, 0);
		controller.update();
		var arc = chart.data.datasets[0].metaData[0];

		chart.options.elements.arc.backgroundColor = 'rgb(45, 46, 47)';
		chart.options.elements.arc.borderColor = 'rgb(50, 51, 52)';
		chart.options.elements.arc.borderWidth = 10.1;

		controller.removeHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(45, 46, 47)');
		expect(arc._model.borderColor).toBe('rgb(50, 51, 52)');
		expect(arc._model.borderWidth).toBe(10.1);

		// Can set hover style per dataset
		chart.data.datasets[0].backgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].borderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].borderWidth = 2.1;

		controller.removeHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(77, 79, 81)');
		expect(arc._model.borderColor).toBe('rgb(123, 125, 127)');
		expect(arc._model.borderWidth).toBe(2.1);

		// Custom style
		arc.custom = {
			borderWidth: 5.5,
			backgroundColor: 'rgb(0, 0, 0)',
			borderColor: 'rgb(10, 10, 10)'
		};

		controller.removeHoverStyle(arc);
		expect(arc._model.backgroundColor).toBe('rgb(0, 0, 0)');
		expect(arc._model.borderColor).toBe('rgb(10, 10, 10)');
		expect(arc._model.borderWidth).toBe(5.5);
	});
});