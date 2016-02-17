// Test the line controller
describe('Line controller tests', function() {
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

		var controller = new Chart.controllers.line(chart, 0);
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

		var controller = new Chart.controllers.line(chart, 0);
		expect(chart.data.datasets[0].xAxisID).toBe('firstXScaleID');
		expect(chart.data.datasets[0].yAxisID).toBe('firstYScaleID');
	});

	it('Should create line elements and point elements for each data item during initialization', function() {
		var chart = {
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
			config: {
				type: 'line'
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

		var controller = new Chart.controllers.line(chart, 0);

		expect(chart.data.datasets[0].metaData.length).toBe(4); // 4 points created
		expect(chart.data.datasets[0].metaData[0] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[1] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[2] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaData[3] instanceof Chart.elements.Point).toBe(true);
		expect(chart.data.datasets[0].metaDataset instanceof Chart.elements.Line).toBe(true); // 1 line element
	});

	it('should draw all elements', function() {
		var chart = {
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
			config: {
				type: 'line'
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

		var controller = new Chart.controllers.line(chart, 0);

		spyOn(chart.data.datasets[0].metaDataset, 'draw');
		spyOn(chart.data.datasets[0].metaData[0], 'draw');
		spyOn(chart.data.datasets[0].metaData[1], 'draw');
		spyOn(chart.data.datasets[0].metaData[2], 'draw');
		spyOn(chart.data.datasets[0].metaData[3], 'draw');

		controller.draw();

		expect(chart.data.datasets[0].metaDataset.draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[0].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[2].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[3].draw.calls.count()).toBe(1);
	});

	it('should draw all elements except lines', function() {
		var chart = {
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
			config: {
				type: 'line'
			},
			options: {
				showLines: false,
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

		var controller = new Chart.controllers.line(chart, 0);

		spyOn(chart.data.datasets[0].metaDataset, 'draw');
		spyOn(chart.data.datasets[0].metaData[0], 'draw');
		spyOn(chart.data.datasets[0].metaData[1], 'draw');
		spyOn(chart.data.datasets[0].metaData[2], 'draw');
		spyOn(chart.data.datasets[0].metaData[3], 'draw');

		controller.draw();

		expect(chart.data.datasets[0].metaDataset.draw.calls.count()).toBe(0);
		expect(chart.data.datasets[0].metaData[0].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[2].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[0].metaData[3].draw.calls.count()).toBe(1);
	});

	it('should update elements', function() {
		var data = {
			datasets: [{
				data: [10, 15, 0, -4],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.line.scales.yAxes[0]);
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

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('category');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.line.scales.xAxes[0]);
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
				type: 'line'
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

		var controller = new Chart.controllers.line(chart, 0);
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
			scaleBottom: 200,
			scaleZero: 156,
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
			x: 81,
			y: 62,

			// Control points
			controlPointPreviousX: 81,
			controlPointPreviousY: 62,
			controlPointNextX: 86,
			controlPointNextY: 57.3,
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
			x: 131,
			y: 15,

			// Control points
			controlPointPreviousX: 127.82889384189087,
			controlPointPreviousY: 12.04867347661131,
			controlPointNextX: 137.92889384189088,
			controlPointNextY: 21.44867347661131,
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
			x: 182,
			y: 156,

			// Control points
			controlPointPreviousX: 174.8815225337256,
			controlPointPreviousY: 143.38408449046415,
			controlPointNextX: 184.98152253372558,
			controlPointNextY: 161.28408449046415,
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
			x: 232,
			y: 194,

			// Control points
			controlPointPreviousX: 227,
			controlPointPreviousY: 190.2,
			controlPointNextX: 232,
			controlPointNextY: 194,
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
		chart.data.datasets[0].radius = 22;
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
			scaleBottom: 200,
			scaleZero: 156,
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
			x: 81,
			y: 62,

			// Control points
			controlPointPreviousX: 81,
			controlPointPreviousY: 62,
			controlPointNextX: 81,
			controlPointNextY: 62,
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
			x: 131,
			y: 15,

			// Control points
			controlPointPreviousX: 131,
			controlPointPreviousY: 15,
			controlPointNextX: 131,
			controlPointNextY: 15,
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
			x: 182,
			y: 156,

			// Control points
			controlPointPreviousX: 182,
			controlPointPreviousY: 156,
			controlPointNextX: 182,
			controlPointNextY: 156,
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
			x: 232,
			y: 194,

			// Control points
			controlPointPreviousX: 232,
			controlPointPreviousY: 194,
			controlPointNextX: 232,
			controlPointNextY: 194,
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
			scaleBottom: 200,
			scaleZero: 156,
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
			x: 81,
			y: 62,

			// Control points
			controlPointPreviousX: 81,
			controlPointPreviousY: 62,
			controlPointNextX: 88.5,
			controlPointNextY: 54.95,
		});
	});

	it('should update elements when the y scale is stacked', function() {
		var data = {
			datasets: [{
				data: [10, 15, -4, -4],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',
				type: 'line'
			}, {
				data: [20, 20, 30, -30],
				label: 'dataset1',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',
				type: 'line'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.line.scales.yAxes[0]);
		verticalScaleConfig.stacked = true;
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

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('category');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.line.scales.xAxes[0]);
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
				type: 'line'
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
						tension: 0,
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

		var controller = new Chart.controllers.line(chart, 0);
		var controller2 = new Chart.controllers.line(chart, 1);
		controller.update();
		controller2.update();

		// Line element
		expect(chart.data.datasets[0].metaDataset._model).toEqual(jasmine.objectContaining({
			scaleTop: 0,
			scaleBottom: 200,
			scaleZero: 100,
		}));

		expect(chart.data.datasets[0].metaData[0]._model).toEqual(jasmine.objectContaining({
			// Point
			x: 91,
			y: 77,
		}));

		expect(chart.data.datasets[0].metaData[1]._model).toEqual(jasmine.objectContaining({
			// Point
			x: 141,
			y: 65,
		}));

		expect(chart.data.datasets[0].metaData[2]._model).toEqual(jasmine.objectContaining({
			// Point
			x: 192,
			y: 109,
		}));

		expect(chart.data.datasets[0].metaData[3]._model).toEqual(jasmine.objectContaining({
			// Point
			x: 242,
			y: 109,
		}));

		expect(chart.data.datasets[1].metaData[0]._model).toEqual(jasmine.objectContaining({
			// Point
			x: 91,
			y: 30,
		}));

		expect(chart.data.datasets[1].metaData[1]._model).toEqual(jasmine.objectContaining({
			// Point
			x: 141,
			y: 18,
		}));

		expect(chart.data.datasets[1].metaData[2]._model).toEqual(jasmine.objectContaining({
			// Point
			x: 192,
			y: 30,
		}));

		expect(chart.data.datasets[1].metaData[3]._model).toEqual(jasmine.objectContaining({
			// Point
			x: 242,
			y: 180,
		}));


	});

	it('should find the correct scale zero when the data is all positive', function() {
		var data = {
			datasets: [{
				data: [10, 15, 20, 20],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',
				type: 'line'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.line.scales.yAxes[0]);
		verticalScaleConfig.stacked = true;
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

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('category');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.line.scales.xAxes[0]);
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
				type: 'line'
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
						tension: 0,
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

		var controller = new Chart.controllers.line(chart, 0);
		controller.update();

		// Line element
		expect(chart.data.datasets[0].metaDataset._model).toEqual(jasmine.objectContaining({
			scaleTop: 0,
			scaleBottom: 200,
			scaleZero: 194, // yScale.min is the 0 point
		}));
	});

	it('should find the correct scale zero when the data is all negative', function() {
		var data = {
			datasets: [{
				data: [-10, -15, -20, -20],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',
				type: 'line'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.line.scales.yAxes[0]);
		verticalScaleConfig.stacked = true;
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

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('category');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.line.scales.xAxes[0]);
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
				type: 'line'
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
						tension: 0,
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

		var controller = new Chart.controllers.line(chart, 0);
		controller.update();

		// Line element
		expect(chart.data.datasets[0].metaDataset._model).toEqual(jasmine.objectContaining({
			scaleTop: 0,
			scaleBottom: 200,
			scaleZero: 6, // yScale.max is the zero point
		}));
	});

	it ('should fall back to the line styles for points', function() {
		var data = {
			datasets: [{
				data: [0, 0],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',

				// line styles
				backgroundColor: 'rgb(98, 98, 98)',
				borderColor: 'rgb(8, 8, 8)',
				borderWidth: 0.55,
			}],
			labels: ['label1', 'label2']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.line.scales.yAxes[0]);
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

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('category');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.line.scales.xAxes[0]);
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

		var controller = new Chart.controllers.line(chart, 0);
		controller.update();

		expect(chart.data.datasets[0].metaData[0]._model.backgroundColor).toBe('rgb(98, 98, 98)');
		expect(chart.data.datasets[0].metaData[0]._model.borderColor).toBe('rgb(8, 8, 8)');
		expect(chart.data.datasets[0].metaData[0]._model.borderWidth).toBe(0.55);
	});

	it('should handle number of data point changes in update', function() {
		var data = {
			datasets: [{
				data: [10, 15, 0, -4],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.line.scales.yAxes[0]);
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

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('category');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.line.scales.xAxes[0]);
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

		var controller = new Chart.controllers.line(chart, 0);
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
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.line.scales.yAxes[0]);
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

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('category');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.line.scales.xAxes[0]);
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

		var controller = new Chart.controllers.line(chart, 0);
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
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.line.scales.yAxes[0]);
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

		var HorizontalScaleConstructor = Chart.scaleService.getScaleConstructor('category');
		var horizontalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.line.scales.xAxes[0]);
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

		var controller = new Chart.controllers.line(chart, 0);
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
