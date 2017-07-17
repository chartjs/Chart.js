// Test the category scale

describe('Category scale tests', function() {
	it('Should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('category');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('category');
		expect(defaultConfig).toEqual({
			display: true,

			gridLines: {
				color: 'rgba(0, 0, 0, 0.1)',
				drawBorder: true,
				drawOnChartArea: true,
				drawTicks: true, // draw ticks extending towards the label
				tickMarkLength: 10,
				lineWidth: 1,
				offsetGridLines: false,
				display: true,
				zeroLineColor: 'rgba(0,0,0,0.25)',
				zeroLineWidth: 1,
				zeroLineBorderDash: [],
				zeroLineBorderDashOffset: 0.0,
				borderDash: [],
				borderDashOffset: 0.0
			},
			position: 'bottom',
			scaleLabel: {
				display: false,
				labelString: '',
				lineHeight: 1.2
			},
			ticks: {
				beginAtZero: false,
				minRotation: 0,
				maxRotation: 50,
				mirror: false,
				padding: 0,
				reverse: false,
				display: true,
				callback: defaultConfig.ticks.callback, // make this nicer, then check explicitly below
				autoSkip: true,
				autoSkipPadding: 0,
				labelOffset: 0,
				minor: {},
				major: {},
			}
		});

		// Is this actually a function
		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
	});

	it('Should generate ticks from the data labels', function() {
		var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78],
				}],
				labels: labels
			},
			options: {
				scales: {
					xAxes: [{
						id: 'x',
						type: 'category'
					}]
				}
			}
		});

		var scale = chart.scales.x;
		expect(scale.ticks).toEqual(labels);
	});

	it('Should generate ticks from the data xLabels', function() {
		var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78],
				}],
				xLabels: labels
			},
			options: {
				scales: {
					xAxes: [{
						id: 'x',
						type: 'category'
					}]
				}
			}
		});

		var scale = chart.scales.x;
		expect(scale.ticks).toEqual(labels);
	});

	it('Should generate ticks from the data yLabels', function() {
		var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					data: [10, 5, 0, 25, 78],
				}],
				yLabels: labels
			},
			options: {
				scales: {
					xAxes: [{
						id: 'x',
						type: 'linear'
					}],
					yAxes: [{
						id: 'y',
						type: 'category',
					}]
				}
			}
		});

		var scale = chart.scales.y;
		expect(scale.ticks).toEqual(labels);
	});

	it ('Should get the correct data label for the index', function() {
		var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78],
				}],
				labels: labels
			},
			options: {
				scales: {
					xAxes: [{
						id: 'x',
						type: 'category'
					}]
				}
			}
		});

		var scale = chart.scales.x;
		expect(scale.getLabelForIndex(1)).toBe('tick2');
	});

	it('Should get the correct data xLabel for the index', function() {
		var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78],
				}],
				xLabels: labels
			},
			options: {
				scales: {
					xAxes: [{
						id: 'x',
						type: 'category'
					}]
				}
			}
		});

		var scale = chart.scales.x;
		expect(scale.ticks).toEqual(labels);
	});

	// NOTE: test for vertical line chart
	// 		 chart type not currently support
	// it('Should get the correct data yLabel for the index', function() {
	// 	var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
	// 	var chart = window.acquireChart({
	// 		type: 'line',
	// 		data: {
	// 			datasets: [{
	// 				xAxisID: 'x',
	// 				data: [10, 5, 0, 25, 78],
	// 			}],
	// 			yLabels: labels
	// 		},
	// 		options: {
	// 			scales: {
	// 				xAxes: [{
	// 					id: 'x',
	// 					type: 'linear'
	// 				}],
	// 				yAxes: [{
	// 					id: 'y',
	// 					type: 'category',
	// 				}]
	// 			}
	// 		}
	// 	});

	// 	var scale = chart.scales.y;
	// 	expect(scale.getLabelForIndex(1)).toBe('tick2');
	// });

	// test for #3278
	it('Should get the correct tooltip for the index', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				xLabels: ["APR", "MAY", "JUN", "JUL", "AUG", "SEP"],
				yLabels: ['A+', 'A', 'B', 'C', 'D'],
				datasets: [{
					label: 'Grade',
					data: ['A+', 'B', 'C', 'B', 'B'],
				}]
			},
			options: {
				scales: {
					xAxes: [{
						id: 'x',
						type: 'category'
					}],
					yAxes: [{
						id: 'y',
						type: 'category'
					}]
				}
			}
		});

		// fake out the tooltip hover and force the tooltip to update
		chart.tooltip._active = [chart.getDatasetMeta(0).data[0]];
		chart.tooltip.update();

		expect(chart.tooltip._model.body).toEqual([{
			before: [],
			lines: ['Grade: A+'],
			after: []
		}]);

		// fake out the tooltip hover and force the tooltip to update
		chart.tooltip._active = [chart.getDatasetMeta(0).data[1]];
		chart.tooltip.update();

		expect(chart.tooltip._model.body).toEqual([{
			before: [],
			lines: ['Grade: B'],
			after: []
		}]);
	});

	it ('Should get the correct pixel for a value when horizontal', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'category',
						position: 'bottom'
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});

		var xScale = chart.scales.xScale0;
		expect(xScale.getPixelForValue(0, 0, 0, false)).toBeCloseToPixel(23);
		expect(xScale.getPixelForValue(0, 0, 0, true)).toBeCloseToPixel(23);
		expect(xScale.getValueForPixel(33)).toBe(0);

		expect(xScale.getPixelForValue(0, 4, 0, false)).toBeCloseToPixel(487);
		expect(xScale.getPixelForValue(0, 4, 0, true)).toBeCloseToPixel(487);
		expect(xScale.getValueForPixel(487)).toBe(4);

		xScale.options.gridLines.offsetGridLines = true;

		expect(xScale.getPixelForValue(0, 0, 0, false)).toBeCloseToPixel(23);
		expect(xScale.getPixelForValue(0, 0, 0, true)).toBeCloseToPixel(69);
		expect(xScale.getValueForPixel(33)).toBe(0);
		expect(xScale.getValueForPixel(78)).toBe(0);

		expect(xScale.getPixelForValue(0, 4, 0, false)).toBeCloseToPixel(395);
		expect(xScale.getPixelForValue(0, 4, 0, true)).toBeCloseToPixel(441);
		expect(xScale.getValueForPixel(397)).toBe(4);
		expect(xScale.getValueForPixel(441)).toBe(4);
	});

	it ('Should get the correct pixel for a value when there are repeated labels', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'category',
						position: 'bottom'
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});

		var xScale = chart.scales.xScale0;
		expect(xScale.getPixelForValue('tick_1', 0, 0, false)).toBeCloseToPixel(23);
		expect(xScale.getPixelForValue('tick_1', 1, 0, false)).toBeCloseToPixel(139);
	});

	it ('Should get the correct pixel for a value when horizontal and zoomed', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'category',
						position: 'bottom',
						ticks: {
							min: 'tick2',
							max: 'tick4'
						}
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});

		var xScale = chart.scales.xScale0;
		expect(xScale.getPixelForValue(0, 1, 0, false)).toBeCloseToPixel(23);
		expect(xScale.getPixelForValue(0, 1, 0, true)).toBeCloseToPixel(23);

		expect(xScale.getPixelForValue(0, 3, 0, false)).toBeCloseToPixel(496);
		expect(xScale.getPixelForValue(0, 3, 0, true)).toBeCloseToPixel(496);

		xScale.options.gridLines.offsetGridLines = true;

		expect(xScale.getPixelForValue(0, 1, 0, false)).toBeCloseToPixel(23);
		expect(xScale.getPixelForValue(0, 1, 0, true)).toBeCloseToPixel(102);

		expect(xScale.getPixelForValue(0, 3, 0, false)).toBeCloseToPixel(338);
		expect(xScale.getPixelForValue(0, 3, 0, true)).toBeCloseToPixel(419);
	});

	it ('should get the correct pixel for a value when vertical', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: ['3', '5', '1', '4', '2']
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
				yLabels: ['1', '2', '3', '4', '5']
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'category',
						position: 'bottom',
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'category',
						position: 'left'
					}]
				}
			}
		});

		var yScale = chart.scales.yScale0;
		expect(yScale.getPixelForValue(0, 0, 0, false)).toBe(32);
		expect(yScale.getPixelForValue(0, 0, 0, true)).toBe(32);
		expect(yScale.getValueForPixel(32)).toBe(0);

		expect(yScale.getPixelForValue(0, 4, 0, false)).toBe(484);
		expect(yScale.getPixelForValue(0, 4, 0, true)).toBe(484);
		expect(yScale.getValueForPixel(484)).toBe(4);

		yScale.options.gridLines.offsetGridLines = true;

		expect(yScale.getPixelForValue(0, 0, 0, false)).toBe(32);
		expect(yScale.getPixelForValue(0, 0, 0, true)).toBe(77);
		expect(yScale.getValueForPixel(32)).toBe(0);
		expect(yScale.getValueForPixel(77)).toBe(0);

		expect(yScale.getPixelForValue(0, 4, 0, false)).toBe(394);
		expect(yScale.getPixelForValue(0, 4, 0, true)).toBe(439);
		expect(yScale.getValueForPixel(394)).toBe(4);
		expect(yScale.getValueForPixel(439)).toBe(4);
	});

	it ('should get the correct pixel for a value when vertical and zoomed', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: ['3', '5', '1', '4', '2']
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
				yLabels: ['1', '2', '3', '4', '5']
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'category',
						position: 'bottom',
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'category',
						position: 'left',
						ticks: {
							min: '2',
							max: '4'
						}
					}]
				}
			}
		});

		var yScale = chart.scales.yScale0;

		expect(yScale.getPixelForValue(0, 1, 0, false)).toBe(32);
		expect(yScale.getPixelForValue(0, 1, 0, true)).toBe(32);

		expect(yScale.getPixelForValue(0, 3, 0, false)).toBe(484);
		expect(yScale.getPixelForValue(0, 3, 0, true)).toBe(484);

		yScale.options.gridLines.offsetGridLines = true;

		expect(yScale.getPixelForValue(0, 1, 0, false)).toBe(32);
		expect(yScale.getPixelForValue(0, 1, 0, true)).toBe(107);

		expect(yScale.getPixelForValue(0, 3, 0, false)).toBe(333);
		expect(yScale.getPixelForValue(0, 3, 0, true)).toBe(409);
	});
});
