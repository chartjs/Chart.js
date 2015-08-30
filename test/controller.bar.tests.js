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
					type: 'line'
				}, {
					type: 'bar'
				}, {
					// no type, defaults to bar
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

	it('should remove elements', function() {
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
		controller.removeElement(1);
		expect(chart.data.datasets[1].metaData.length).toBe(3);
	});

	it('should update elements', function() {
		var chart = {
			data: {
				datasets: [{
					data: [1, 2],
					label: 'dataset1',
				}, {
					data: [10, 15, 0, -4],
					label: 'dataset2'
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
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
				firstXScaleID: {
					calculateBarWidth: function(numBars) { return numBars * 5; },
					calculateBarX: function(numBars, datasetIndex, index) {
						return chart.data.datasets[datasetIndex].data[index];
					},
				},
				firstYScaleID: {
					calculateBarBase: function(datasetIndex, index) {
						return this.getPixelForValue(0);
					},
					calculateBarY: function(datasetIndex, index) {
						return this.getPixelForValue(chart.data.datasets[datasetIndex].data[index]);
					},
					getPixelForValue: function(value) {
						return value * 2;
					},
					max: 10,
					min: -10,
				}
			}
		};

		var controller = new Chart.controllers.bar(chart, 1);

		chart.data.datasets[1].data = [1, 2]; // remove 2 items
		controller.update();

		expect(chart.data.datasets[1].metaData.length).toBe(2);
		
		var bar1 = chart.data.datasets[1].metaData[0];
		var bar2 = chart.data.datasets[1].metaData[1];

		expect(bar1._datasetIndex).toBe(1);
		expect(bar1._index).toBe(0);
		expect(bar1._xScale).toBe(chart.scales.firstXScaleID);
		expect(bar1._yScale).toBe(chart.scales.firstYScaleID);
		expect(bar1._model).toEqual({
			x: 1,
			y: 2,
			label: 'label1',
			datasetLabel: 'dataset2',

			base: 0,
			width: 10,
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 2,
		});

		expect(bar2._datasetIndex).toBe(1);
		expect(bar2._index).toBe(1);
		expect(bar2._xScale).toBe(chart.scales.firstXScaleID);
		expect(bar2._yScale).toBe(chart.scales.firstYScaleID);
		expect(bar2._model).toEqual({
			x: 2,
			y: 4,
			label: 'label2',
			datasetLabel: 'dataset2',

			base: 0,
			width: 10,
			backgroundColor: 'rgb(255, 0, 0)',
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 2,
		});

		chart.data.datasets[1].data = [1, 2, 3];
		controller.update();

		expect(chart.data.datasets[1].metaData.length).toBe(3); // should add a new meta data item
	});

	it ('should draw all bars', function() {
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
});