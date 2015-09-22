// Test the bar controller
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

	it('should remove elements', function() {
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
		controller.removeElement(0);
		expect(chart.data.datasets[0].metaData.length).toBe(3);
	});

	it ('should draw all elements', function() {
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

	it ('should update elements', function() {
		var chart = {
			chartArea: {
				bottom: 100,
				left: 0,
				right: 200,
				top: 0
			},
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
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
				firstXScaleID: {
					getPointPixelForValue: function(value, index) {
						return index * 3;
					}
				},
				firstYScaleID: {
					calculateBarBase: function(datasetIndex, index) {
						return this.getPixelForValue(0);
					},
					getPointPixelForValue: function(value, datasetIndex, index) {
						return this.getPixelForValue(value);
					},
					getPixelForValue: function(value) {
						return value * 2;
					},
					max: 10,
					min: -10,
				}
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
			drawNull: undefined,
			skipNull: true,
			tension: 0.1,

			scaleTop: undefined,
			scaleBottom: undefined,
			scaleZero: 0,
		});

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 3,
			skip: false,
			tension: 0.1,
			
			// Point
			x: 0,
			y: 20,

			// Control points
			controlPointPreviousX: 0,
			controlPointPreviousY: 20,
			controlPointNextX: 0.30000000000000004,
			controlPointNextY: 21,
		});

		expect(chart.data.datasets[0].metaData[1]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 3,
			skip: false,
			tension: 0.1,
			
			// Point
			x: 3,
			y: 30,

			// Control points
			controlPointPreviousX: 2.845671490812908,
			controlPointPreviousY: 30.514428363956974,
			controlPointNextX: 3.4456714908129076,
			controlPointNextY: 28.514428363956974,
		});

		expect(chart.data.datasets[0].metaData[2]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 3,
			skip: false,
			tension: 0.1,
			
			// Point
			x: 6,
			y: 0,

			// Control points
			controlPointPreviousX: 5.532486979550596,
			controlPointPreviousY: 2.9609157961795605,
			controlPointNextX: 6.132486979550595,
			controlPointNextY: 0,
		});

		expect(chart.data.datasets[0].metaData[3]._model).toEqual({
			backgroundColor: Chart.defaults.global.defaultColor,
			borderWidth: 1,
			borderColor: Chart.defaults.global.defaultColor,
			hitRadius: 1,
			radius: 3,
			skip: false,
			tension: 0.1,
			
			// Point
			x: 9,
			y: -8,

			// Control points
			controlPointPreviousX: 8.7,
			controlPointPreviousY: 0,
			controlPointNextX: 9,
			controlPointNextY: 0,
		});

		// Use dataset level styles for lines & points
		chart.data.datasets[0].tension = 0.2;
		chart.data.datasets[0].backgroundColor = 'rgb(98, 98, 98)';
		chart.data.datasets[0].borderColor = 'rgb(8, 8, 8)';
		chart.data.datasets[0].borderWidth = 0.55;
		chart.data.datasets[0].borderCapStyle = 'butt';
		chart.data.datasets[0].borderDash = [2, 3];
		chart.data.datasets[0].borderDashOffset = 7;
		chart.data.datasets[0].borderJoinStyle = 'miter';
		chart.data.datasets[0].fill = false;
		chart.data.datasets[0].skipNull = false;
		chart.data.datasets[0].drawNull = true;

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
			drawNull: true,
			skipNull: false,
			tension: 0.2,

			scaleTop: undefined,
			scaleBottom: undefined,
			scaleZero: 0,
		});

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			hitRadius: 3.3,
			radius: 22,
			skip: false,
			tension: 0.2,
			
			// Point
			x: 0,
			y: 20,

			// Control points
			controlPointPreviousX: 0,
			controlPointPreviousY: 20,
			controlPointNextX: 0.6000000000000001,
			controlPointNextY: 22,
		});

		expect(chart.data.datasets[0].metaData[1]._model).toEqual({
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			hitRadius: 3.3,
			radius: 22,
			skip: false,
			tension: 0.2,
			
			// Point
			x: 3,
			y: 30,

			// Control points
			controlPointPreviousX: 2.6913429816258154,
			controlPointPreviousY: 31.028856727913947,
			controlPointNextX: 3.891342981625815,
			controlPointNextY: 27.028856727913947,
		});

		expect(chart.data.datasets[0].metaData[2]._model).toEqual({
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			hitRadius: 3.3,
			radius: 22,
			skip: false,
			tension: 0.2,
			
			// Point
			x: 6,
			y: 0,

			// Control points
			controlPointPreviousX: 5.0649739591011915,
			controlPointPreviousY: 5.921831592359121,
			controlPointNextX: 6.264973959101192,
			controlPointNextY: 0,
		});

		expect(chart.data.datasets[0].metaData[3]._model).toEqual({
			backgroundColor: 'rgb(128, 129, 130)',
			borderWidth: 1.123,
			borderColor: 'rgb(56, 57, 58)',
			hitRadius: 3.3,
			radius: 22,
			skip: false,
			tension: 0.2,
			
			// Point
			x: 9,
			y: -8,

			// Control points
			controlPointPreviousX: 8.4,
			controlPointPreviousY: 0,
			controlPointNextX: 9,
			controlPointNextY: 0,
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
			skipNull: true,
			drawNull: false,
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
			drawNull: true,
			skipNull: false,
			tension: 0.25,

			scaleTop: undefined,
			scaleBottom: undefined,
			scaleZero: 0,
		});

		expect(chart.data.datasets[0].metaData[0]._model).toEqual({
			backgroundColor: 'rgb(0, 1, 3)',
			borderWidth: 0.787,
			borderColor: 'rgb(4, 6, 8)',
			hitRadius: 5,
			radius: 2.2,
			skip: true,
			tension: 0.15,
			
			// Point
			x: 0,
			y: 20,

			// Control points
			controlPointPreviousX: 0,
			controlPointPreviousY: 20,
			controlPointNextX: 0.44999999999999996,
			controlPointNextY: 21.5,
		});
	});

	it ('should handle number of data point changes in update', function() {
		var chart = {
			chartArea: {
				bottom: 100,
				left: 0,
				right: 200,
				top: 0
			},
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
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
				firstXScaleID: {
					getPointPixelForValue: function(value, index) {
						return index * 3;
					}
				},
				firstYScaleID: {
					calculateBarBase: function(datasetIndex, index) {
						return this.getPixelForValue(0);
					},
					getPointPixelForValue: function(value, datasetIndex, index) {
						return this.getPixelForValue(value);
					},
					getPixelForValue: function(value) {
						return value * 2;
					},
					max: 10,
					min: -10,
				}
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

	it ('should set point hover styles', function() {
		var chart = {
			chartArea: {
				bottom: 100,
				left: 0,
				right: 200,
				top: 0
			},
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
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
				firstXScaleID: {
					getPointPixelForValue: function(value, index) {
						return index * 3;
					}
				},
				firstYScaleID: {
					calculateBarBase: function(datasetIndex, index) {
						return this.getPixelForValue(0);
					},
					getPointPixelForValue: function(value, datasetIndex, index) {
						return this.getPixelForValue(value);
					},
					getPixelForValue: function(value) {
						return value * 2;
					},
					max: 10,
					min: -10,
				}
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

	it ('should remove hover styles', function() {
				var chart = {
			chartArea: {
				bottom: 100,
				left: 0,
				right: 200,
				top: 0
			},
			data: {
				datasets: [{
					data: [10, 15, 0, -4]
				}]
			},
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
				firstXScaleID: {
					getPointPixelForValue: function(value, index) {
						return index * 3;
					}
				},
				firstYScaleID: {
					calculateBarBase: function(datasetIndex, index) {
						return this.getPixelForValue(0);
					},
					getPointPixelForValue: function(value, datasetIndex, index) {
						return this.getPixelForValue(value);
					},
					getPixelForValue: function(value) {
						return value * 2;
					},
					max: 10,
					min: -10,
				}
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