// Test the bar controller
describe('Bar controller tests', function() {
	it('Should be constructed', function() {
		var chart = {
			data: {
				datasets: [{

				}, {
					xAxisID: 'myXAxis',
					yAxisID: 'myYAxis',
					data: []
				}]
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);
		expect(controller).not.toBe(undefined);
		expect(controller.index).toBe(1);
		expect(chart.data.datasets[1].metaData).toEqual([]);

		controller.updateIndex(0);
		expect(controller.index).toBe(0);
	});

	it('Should use the first scale IDs if the dataset does not specify them', function() {
		var chart = {
			data: {
				datasets: [{

				}, {
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

		var controller = new Chart.controllers.bar(chart, 1);
		expect(chart.data.datasets[1].xAxisID).toBe('firstXScaleID');
		expect(chart.data.datasets[1].yAxisID).toBe('firstYScaleID');
	});

	it('should correctly count the number of bar datasets', function() {
		var chart = {
			data: {
				datasets: [{
				}, {
					bar: true
				}, {
					bar: true
				}]
			},
			config: {
				type: 'bar'
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

		var controller = new Chart.controllers.bar(chart, 1);
		expect(controller.getBarCount()).toBe(2);
	});

	it('should correctly get the bar index accounting for hidden datasets', function() {
		var chart = {
			data: {
				datasets: [{
					bar: true,
				}, {
					bar: true,
					hidden: true
				}, {
				}, {
					bar: true,
				}]
			},
			config: {
				type: 'bar'
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

		var controller = new Chart.controllers.bar(chart, 1);
		expect(controller.getBarIndex(0)).toBe(0);
		expect(controller.getBarIndex(3)).toBe(1);
	});

	it('Should create rectangle elements for each data item during initialization', function() {
		var chart = {
			data: {
				datasets: [{}, {
					data: [10, 15, 0, -4]
				}]
			},
			config: {
				type: 'bar'
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

		var controller = new Chart.controllers.bar(chart, 1);

		expect(chart.data.datasets[1].metaData.length).toBe(4); // 4 rectangles created
		expect(chart.data.datasets[1].metaData[0] instanceof Chart.elements.Rectangle).toBe(true);
		expect(chart.data.datasets[1].metaData[1] instanceof Chart.elements.Rectangle).toBe(true);
		expect(chart.data.datasets[1].metaData[2] instanceof Chart.elements.Rectangle).toBe(true);
		expect(chart.data.datasets[1].metaData[3] instanceof Chart.elements.Rectangle).toBe(true);
	});

	it('should update elements', function() {
		var data = {
			datasets: [{
				data: [1, 2],
				label: 'dataset1',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',
				bar: true
			}, {
				data: [10, 15, 0, -4],
				label: 'dataset2'
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.bar.scales.yAxes[0]);
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
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.bar.scales.xAxes[0]);
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
			data: data,
			config: {
				type: 'bar'
			},
			options: {
				elements: {
					rectangle: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderSkipped: 'top',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
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

		var controller = new Chart.controllers.bar(chart, 1);

		chart.data.datasets[1].data = [1, 2]; // remove 2 items
		controller.buildOrUpdateElements();
		controller.update();

		expect(chart.data.datasets[1].metaData.length).toBe(2);
		
		var bar1 = chart.data.datasets[1].metaData[0];
		var bar2 = chart.data.datasets[1].metaData[1];

		expect(bar1._datasetIndex).toBe(1);
		expect(bar1._index).toBe(0);
		expect(bar1._xScale).toBe(chart.scales.firstXScaleID);
		expect(bar1._yScale).toBe(chart.scales.firstYScaleID);
		expect(bar1._model).toEqual({
			x: 113.60000000000001,
			y: 194,
			label: 'label1',
			datasetLabel: 'dataset2',

			base: 194,
			width: 13.680000000000001,
			backgroundColor: 'rgb(255, 0, 0)',
			borderSkipped: 'top',
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 2,
		});

		expect(bar2._datasetIndex).toBe(1);
		expect(bar2._index).toBe(1);
		expect(bar2._xScale).toBe(chart.scales.firstXScaleID);
		expect(bar2._yScale).toBe(chart.scales.firstYScaleID);
		expect(bar2._model).toEqual({
			x: 151.60000000000002,
			y: 6,
			label: 'label2',
			datasetLabel: 'dataset2',

			base: 194,
			width: 13.680000000000001,
			backgroundColor: 'rgb(255, 0, 0)',
			borderSkipped: 'top',
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 2,
		});

		chart.data.datasets[1].data = [1, 2, 3];
		controller.buildOrUpdateElements();
		controller.update();

		expect(chart.data.datasets[1].metaData.length).toBe(3); // should add a new meta data item
	});

	it ('should get the correct bar points when datasets of different types exist', function() {
		var data = {
			datasets: [{
				data: [1, 2],
				label: 'dataset1',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',
				bar: true,
			}, {
				data: [10, 15],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',
			}, {
				data: [30, 25],
				label: 'dataset3',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',
				bar: true
			}],
			labels: ['label1', 'label2']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.bar.scales.yAxes[0]);
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
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.bar.scales.xAxes[0]);
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
			data: data,
			config: {
				type: 'bar'
			},
			options: {
				elements: {
					rectangle: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
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

		var controller = new Chart.controllers.bar(chart, 2);
		controller.buildOrUpdateElements();
		controller.update();

		var bar1 = chart.data.datasets[2].metaData[0];
		var bar2 = chart.data.datasets[2].metaData[1];

		expect(bar1._model.x).toBe(119.9);
		expect(bar1._model.y).toBe(6);
		expect(bar2._model.x).toBe(186.9);
		expect(bar2._model.y).toBe(37);
	});

	it('should update elements when the scales are stacked', function() {
		var data = {
			datasets: [{
				data: [10, -10, 10, -10],
				label: 'dataset1',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',
				bar: true
			}, {
				data: [10, 15, 0, -4],
				label: 'dataset2',
				xAxisID: 'firstXScaleID',
				yAxisID: 'firstYScaleID',
				bar: true
			}],
			labels: ['label1', 'label2', 'label3', 'label4']
		};
		var mockContext = window.createMockContext();

		var VerticalScaleConstructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.bar.scales.yAxes[0]);
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
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.bar.scales.xAxes[0]);
		horizontalScaleConfig.stacked = true;
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
			data: data,
			config: {
				type: 'bar'
			},
			options: {
				elements: {
					rectangle: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
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

		var controller0 = new Chart.controllers.bar(chart, 0);
		var controller1 = new Chart.controllers.bar(chart, 1);

		controller0.buildOrUpdateElements();
		controller0.update();
		controller1.buildOrUpdateElements();
		controller1.update();

		expect(chart.data.datasets[0].metaData[0]._model).toEqual(jasmine.objectContaining({
			x: 106,
			y: 60,
			base: 113,
			width: 30.400000000000002
		}));
		expect(chart.data.datasets[0].metaData[1]._model).toEqual(jasmine.objectContaining({
			x: 144,
			y: 167,
			base: 113,
			width: 30.400000000000002
		}));
		expect(chart.data.datasets[0].metaData[2]._model).toEqual(jasmine.objectContaining({
			x: 183,
			y: 60,
			base: 113,
			width: 30.400000000000002
		}));
		expect(chart.data.datasets[0].metaData[3]._model).toEqual(jasmine.objectContaining({
			x: 222,
			y: 167,
			base: 113,
			width: 30.400000000000002
		}));

		expect(chart.data.datasets[1].metaData[0]._model).toEqual(jasmine.objectContaining({
			x: 106,
			y: 6,
			base: 60,
			width: 30.400000000000002
		}));
		expect(chart.data.datasets[1].metaData[1]._model).toEqual(jasmine.objectContaining({
			x: 144,
			y: 33,
			base: 113,
			width: 30.400000000000002
		}));
		expect(chart.data.datasets[1].metaData[2]._model).toEqual(jasmine.objectContaining({
			x: 183,
			y: 60,
			base: 60,
			width: 30.400000000000002
		}));
		expect(chart.data.datasets[1].metaData[3]._model).toEqual(jasmine.objectContaining({
			x: 222,
			y: 189,
			base: 167,
			width: 30.400000000000002
		}));
	});

	it ('should draw all bars', function() {
		var data = {
			datasets: [{}, {
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
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.bar.scales.yAxes[0]);
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
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.bar.scales.xAxes[0]);
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
			data: data,
			config: {
				type: 'bar'
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
			},
			scales: {
				firstXScaleID: xScale,
				firstYScaleID: yScale,
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);

		spyOn(chart.data.datasets[1].metaData[0], 'draw');
		spyOn(chart.data.datasets[1].metaData[1], 'draw');
		spyOn(chart.data.datasets[1].metaData[2], 'draw');
		spyOn(chart.data.datasets[1].metaData[3], 'draw');

		controller.draw();

		expect(chart.data.datasets[1].metaData[0].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[1].metaData[1].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[1].metaData[2].draw.calls.count()).toBe(1);
		expect(chart.data.datasets[1].metaData[3].draw.calls.count()).toBe(1);
	});

	it ('should set hover styles on rectangles', function() {
		var data = {
			datasets: [{}, {
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
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.bar.scales.yAxes[0]);
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
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.bar.scales.xAxes[0]);
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
			data: data,
			config: {
				type: 'bar'
			},
			options: {
				elements: {
					rectangle: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
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

		var controller = new Chart.controllers.bar(chart, 1);
		controller.update();
		var bar = chart.data.datasets[1].metaData[0];
		controller.setHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(230, 0, 0)');
		expect(bar._model.borderColor).toBe('rgb(0, 0, 230)');
		expect(bar._model.borderWidth).toBe(2);

		// Set a dataset style
		chart.data.datasets[1].hoverBackgroundColor = 'rgb(128, 128, 128)';
		chart.data.datasets[1].hoverBorderColor = 'rgb(0, 0, 0)';
		chart.data.datasets[1].hoverBorderWidth = 5;

		controller.setHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(128, 128, 128)');
		expect(bar._model.borderColor).toBe('rgb(0, 0, 0)');
		expect(bar._model.borderWidth).toBe(5);

		// Should work with array styles so that we can set per bar
		chart.data.datasets[1].hoverBackgroundColor = ['rgb(255, 255, 255)', 'rgb(128, 128, 128)'];
		chart.data.datasets[1].hoverBorderColor = ['rgb(9, 9, 9)', 'rgb(0, 0, 0)'];
		chart.data.datasets[1].hoverBorderWidth = [2.5, 5];

		controller.setHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(255, 255, 255)');
		expect(bar._model.borderColor).toBe('rgb(9, 9, 9)');
		expect(bar._model.borderWidth).toBe(2.5);

		// Should allow a custom style
		bar.custom = {
			hoverBackgroundColor: 'rgb(255, 0, 0)',
			hoverBorderColor: 'rgb(0, 255, 0)',
			hoverBorderWidth: 1.5
		};

		controller.setHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(255, 0, 0)');
		expect(bar._model.borderColor).toBe('rgb(0, 255, 0)');
		expect(bar._model.borderWidth).toBe(1.5);
	});

	it ('should remove a hover style from a bar', function() {
		var data = {
			datasets: [{}, {
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
		verticalScaleConfig = Chart.helpers.scaleMerge(verticalScaleConfig, Chart.defaults.bar.scales.yAxes[0]);
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
		horizontalScaleConfig = Chart.helpers.scaleMerge(horizontalScaleConfig, Chart.defaults.bar.scales.xAxes[0]);
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
			data: data,
			config: {
				type: 'bar'
			},
			options: {
				elements: {
					rectangle: {
						backgroundColor: 'rgb(255, 0, 0)',
						borderColor: 'rgb(0, 0, 255)',
						borderWidth: 2,
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

		var controller = new Chart.controllers.bar(chart, 1);
		controller.update();
		var bar = chart.data.datasets[1].metaData[0];

		// Change default
		chart.options.elements.rectangle.backgroundColor = 'rgb(128, 128, 128)';
		chart.options.elements.rectangle.borderColor = 'rgb(15, 15, 15)';
		chart.options.elements.rectangle.borderWidth = 3.14;

		// Remove to defaults
		controller.removeHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(128, 128, 128)');
		expect(bar._model.borderColor).toBe('rgb(15, 15, 15)');
		expect(bar._model.borderWidth).toBe(3.14);

		// Should work with array styles so that we can set per bar
		chart.data.datasets[1].backgroundColor = ['rgb(255, 255, 255)', 'rgb(128, 128, 128)'];
		chart.data.datasets[1].borderColor = ['rgb(9, 9, 9)', 'rgb(0, 0, 0)'];
		chart.data.datasets[1].borderWidth = [2.5, 5];

		controller.removeHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(255, 255, 255)');
		expect(bar._model.borderColor).toBe('rgb(9, 9, 9)');
		expect(bar._model.borderWidth).toBe(2.5);

		// Should allow a custom style
		bar.custom = {
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 255, 0)',
			borderWidth: 1.5
		};

		controller.removeHoverStyle(bar);

		expect(bar._model.backgroundColor).toBe('rgb(255, 0, 0)');
		expect(bar._model.borderColor).toBe('rgb(0, 255, 0)');
		expect(bar._model.borderWidth).toBe(1.5);
	});	
});