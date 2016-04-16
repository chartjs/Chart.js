// Test the bubble controller
describe('Bubble controller tests', function() {
	it('Should be constructed', function() {
		var chart = {
			data: {
				datasets: [{
					xAxisID: 'myXAxis',
					yAxisID: 'myYAxis',
					data: []
				}]
			}
		};

		var controller = new Chart.controllers.bubble(chart, 0);
		expect(controller).not.toBe(undefined);
		expect(controller.index).toBe(0);
		expect(chart.data.datasets[0].metaData).toEqual([]);

		controller.updateIndex(1);
		expect(controller.index).toBe(1);
	});

	it('Should use the first scale IDs if the dataset does not specify them', function() {
		var chart = {
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
		};

		var controller = new Chart.controllers.bubble(chart, 0);
		expect(chart.data.datasets[0].xAxisID).toBe('firstXScaleID');
		expect(chart.data.datasets[0].yAxisID).toBe('firstYScaleID');
	});

	it('Should create point elements for each data item during initialization', function() {
		var chart = {
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
			config: {
				type: 'bubble'
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
		};

		var controller = new Chart.controllers.bubble(chart, 0);

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
				type: 'bubble'
			},
			options: {
				showLines: true,
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			}
		};

		var controller = new Chart.controllers.bubble(chart, 0);

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
				}],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.bubble.scales.yAxes[0]);
		var yScale = new VerticalScaleConstructor({
			ctx: mockContext,
			options: verticalScaleConfig,
			chart: {
				data: data
			},
			id: 'firstYScaleID'
		});

		// Update ticks & set physical dimensions
		var verticalSize = yScale.update(50, 200);
		yScale.top = 0;
		yScale.left = 0;
		yScale.right = verticalSize.width;
		yScale.bottom = verticalSize.height;

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.bubble.scales.xAxes[0]);
		horizontalScaleConfig.position = 'bottom';
		var xScale = new HorizontalScaleConstructor({
			ctx: mockContext,
			options: horizontalScaleConfig,
			chart: {
				data: data
			},
			id: 'firstXScaleID'
		});

		// Update ticks & set physical dimensions
		var horizontalSize = xScale.update(200, 50);
		xScale.left = yScale.right;
		xScale.top = yScale.bottom;
		xScale.right = horizontalSize.width + xScale.left;
		xScale.bottom = horizontalSize.height + xScale.top;


		var chart = {
			chartArea: {
				bottom: 200,
				left: xScale.left,
				right: xScale.left + 200,
				top: 0
			},
			data: data,
			config: {
				type: 'bubble'
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
			scales: {
				firstXScaleID: xScale,
				firstYScaleID: yScale,
			}
		};

		var controller = new Chart.controllers.bubble(chart, 0);
		controller.update();

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 5,
			skip: false,

			// Point
			x: 195,
			y: 6,

		});

		expect(chart.data.datasets[0].metaData[1]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 1,
			skip: false,

			// Point
			x: 89,
			y: 194,
		});

		expect(chart.data.datasets[0].metaData[2]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 2,
			skip: false,

			// Point
			x: 153,
			y: 185,
		});

		expect(chart.data.datasets[0].metaData[3]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 1,
			skip: false,

			// Point
			x: 136,
			y: 6,
		});

		// Use dataset level styles for lines & points
		chart.data.datasets[0].backgroundColor = 'rgb(98, 98, 98)';
		chart.data.datasets[0].borderColor = 'rgb(8, 8, 8)';
		chart.data.datasets[0].borderWidth = 0.55;

		// point styles
		chart.data.datasets[0].radius = 22;
		chart.data.datasets[0].hitRadius = 3.3;

		controller.update();

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			backgroundColor: 'rgb(98, 98, 98)',
			borderWidth: 0.55,
			borderColor: 'rgb(8, 8, 8)',
			hitRadius: 3.3,
			radius: 5,
			skip: false,

			// Point
			x: 195,
			y: 6,
		});

		expect(chart.data.datasets[0].metaData[1]._model).toEqual({
			backgroundColor: 'rgb(98, 98, 98)',
			borderWidth: 0.55,
			borderColor: 'rgb(8, 8, 8)',
			hitRadius: 3.3,
			radius: 1,
			skip: false,

			// Point
			x: 89,
			y: 194,
		});

		expect(chart.data.datasets[0].metaData[2]._model).toEqual({
			backgroundColor: 'rgb(98, 98, 98)',
			borderWidth: 0.55,
			borderColor: 'rgb(8, 8, 8)',
			hitRadius: 3.3,
			radius: 2,
			skip: false,

			// Point
			x: 153,
			y: 185,
		});

		expect(chart.data.datasets[0].metaData[3]._model).toEqual({
			backgroundColor: 'rgb(98, 98, 98)',
			borderWidth: 0.55,
			borderColor: 'rgb(8, 8, 8)',
			hitRadius: 3.3,
			radius: 1,
			skip: false,

			// Point
			x: 136,
			y: 6,
		});

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

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			backgroundColor: 'rgb(0, 1, 3)',
			borderWidth: 0.787,
			borderColor: 'rgb(4, 6, 8)',
			hitRadius: 5,
			radius: 2.2,
			skip: true,

			// Point
			x: 195,
			y: 6,
		});
	});

	it('should handle number of data point changes in update', function() {
		var data = {
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
				}],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.bubble.scales.yAxes[0]);
		var yScale = new VerticalScaleConstructor({
			ctx: mockContext,
			options: verticalScaleConfig,
			chart: {
				data: data
			},
			id: 'firstYScaleID'
		});

		// Update ticks & set physical dimensions
		var verticalSize = yScale.update(50, 200);
		yScale.top = 0;
		yScale.left = 0;
		yScale.right = verticalSize.width;
		yScale.bottom = verticalSize.height;

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.bubble.scales.xAxes[0]);
		var xScale = new HorizontalScaleConstructor({
			ctx: mockContext,
			options: horizontalScaleConfig,
			chart: {
				data: data
			},
			id: 'firstXScaleID'
		});

		// Update ticks & set physical dimensions
		var horizontalSize = xScale.update(200, 50);
		xScale.left = yScale.right;
		xScale.top = yScale.bottom;
		xScale.right = horizontalSize.width + xScale.left;
		xScale.bottom = horizontalSize.height + xScale.top;


		var chart = {
			chartArea: {
				bottom: 200,
				left: xScale.left,
				right: 200,
				top: 0
			},
			data: data,
			config: {
				type: 'line'
			},
			options: {
				elements: {
					line: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 255, 0)',
						borderWidth: 1.2,
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
				scales: {
					xAxes: [{
						id: 'firstXScaleID'
					}],
					yAxes: [{
						id: 'firstYScaleID'
					}]
				}
			},
			scales: {
				firstXScaleID: xScale,
				firstYScaleID: yScale,
			}
		};

		var controller = new Chart.controllers.bubble(chart, 0);
		chart.data.datasets[0].data = [{
			x: 1,
			y: 1,
			r: 10
		}, {
			x: 10,
			y: 5,
			r: 2
		}]; // remove 2 items
		controller.buildOrUpdateElements();
		controller.update();
		expect(chart.data.datasets[0].metaData[0] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[1] instanceof Chart.elements.Point).toBe(true);

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
		controller.buildOrUpdateElements();
		controller.update();
		expect(chart.data.datasets[0].metaData[0] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[1] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[2] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[3] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[4] instanceof Chart.elements.Point).toBe(true);
	});

	it('should set hover styles', function() {
		var data = {
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
				}],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.bubble.scales.yAxes[0]);
		var yScale = new VerticalScaleConstructor({
			ctx: mockContext,
			options: verticalScaleConfig,
			chart: {
				data: data
			},
			id: 'firstYScaleID'
		});

		// Update ticks & set physical dimensions
		var verticalSize = yScale.update(50, 200);
		yScale.top = 0;
		yScale.left = 0;
		yScale.right = verticalSize.width;
		yScale.bottom = verticalSize.height;

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.bubble.scales.xAxes[0]);
		var xScale = new HorizontalScaleConstructor({
			ctx: mockContext,
			options: horizontalScaleConfig,
			chart: {
				data: data
			},
			id: 'firstXScaleID'
		});

		// Update ticks & set physical dimensions
		var horizontalSize = xScale.update(200, 50);
		xScale.left = yScale.right;
		xScale.top = yScale.bottom;
		xScale.right = horizontalSize.width + xScale.left;
		xScale.bottom = horizontalSize.height + xScale.top;


		var chart = {
			chartArea: {
				bottom: 200,
				left: xScale.left,
				right: 200,
				top: 0
			},
			data: data,
			config: {
				type: 'line'
			},
			options: {
				elements: {
					line: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 255, 0)',
						borderWidth: 1.2,
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
			scales: {
				firstXScaleID: xScale,
				firstYScaleID: yScale,
			}
		};

		var controller = new Chart.controllers.bubble(chart, 0);
		controller.update();
		var point = chart.data.datasets[0].metaData[0];

		controller.setHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(229, 230, 0)');
		expect(point._model.borderColor).toBe('rgb(230, 230, 230)');
		expect(point._model.borderWidth).toBe(1);
		expect(point._model.radius).toBe(9);

		// Can set hover style per dataset
		chart.data.datasets[0].hoverRadius = 3.3;
		chart.data.datasets[0].hoverBackgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].hoverBorderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].hoverBorderWidth = 2.1;

		controller.setHoverStyle(point);
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

		controller.setHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(0, 0, 0)');
		expect(point._model.borderColor).toBe('rgb(10, 10, 10)');
		expect(point._model.borderWidth).toBe(5.5);
		expect(point._model.radius).toBe(4.4);
	});

	it('should remove hover styles', function() {
		var data = {
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
				}],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.bubble.scales.yAxes[0]);
		var yScale = new VerticalScaleConstructor({
			ctx: mockContext,
			options: verticalScaleConfig,
			chart: {
				data: data
			},
			id: 'firstYScaleID'
		});

		// Update ticks & set physical dimensions
		var verticalSize = yScale.update(50, 200);
		yScale.top = 0;
		yScale.left = 0;
		yScale.right = verticalSize.width;
		yScale.bottom = verticalSize.height;

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.bubble.scales.xAxes[0]);
		var xScale = new HorizontalScaleConstructor({
			ctx: mockContext,
			options: horizontalScaleConfig,
			chart: {
				data: data
			},
			id: 'firstXScaleID'
		});

		// Update ticks & set physical dimensions
		var horizontalSize = xScale.update(200, 50);
		xScale.left = yScale.right;
		xScale.top = yScale.bottom;
		xScale.right = horizontalSize.width + xScale.left;
		xScale.bottom = horizontalSize.height + xScale.top;


		var chart = {
			chartArea: {
				bottom: 200,
				left: xScale.left,
				right: 200,
				top: 0
			},
			data: data,
			config: {
				type: 'line'
			},
			options: {
				elements: {
					line: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 255, 0)',
						borderWidth: 1.2,
						fill: true,
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
			scales: {
				firstXScaleID: xScale,
				firstYScaleID: yScale,
			}
		};

		var controller = new Chart.controllers.bubble(chart, 0);
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
		expect(point._model.radius).toBe(5);

		// Can set hover style per dataset
		chart.data.datasets[0].radius = 3.3;
		chart.data.datasets[0].backgroundColor = 'rgb(77, 79, 81)';
		chart.data.datasets[0].borderColor = 'rgb(123, 125, 127)';
		chart.data.datasets[0].borderWidth = 2.1;

		controller.removeHoverStyle(point);
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

		controller.removeHoverStyle(point);
		expect(point._model.backgroundColor).toBe('rgb(0, 0, 0)');
		expect(point._model.borderColor).toBe('rgb(10, 10, 10)');
		expect(point._model.borderWidth).toBe(5.5);
		expect(point._model.radius).toBe(4.4);
	});
});