// Test the category scale

function getLabels(scale) {
	return scale.ticks.map(t => t.label);
}

function getValues(scale) {
	return scale.ticks.map(t => t.value);
}

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
			reverse: false,
			beginAtZero: false,

			gridLines: {
				color: 'rgba(0,0,0,0.1)',
				drawBorder: true,
				drawOnChartArea: true,
				drawTicks: true, // draw ticks extending towards the label
				tickMarkLength: 10,
				lineWidth: 1,
				offsetGridLines: false,
				display: true,
				borderDash: [],
				borderDashOffset: 0.0
			},
			position: 'bottom',
			offset: false,
			scaleLabel: Chart.defaults.scale.scaleLabel,
			ticks: {
				minRotation: 0,
				maxRotation: 50,
				mirror: false,
				padding: 0,
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
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		var Constructor = Chart.scaleService.getScaleConstructor('category');
		var scale = new Constructor({
			ctx: {},
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.determineDataLimits();
		scale.ticks = scale.buildTicks();
		expect(getValues(scale)).toEqual(mockData.labels);
	});

	it('Should generate ticks from the data xLabels', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			xLabels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		var Constructor = Chart.scaleService.getScaleConstructor('category');
		var scale = new Constructor({
			ctx: {},
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.determineDataLimits();
		scale.ticks = scale.buildTicks();
		expect(getValues(scale)).toEqual(mockData.xLabels);
	});

	it('Should generate ticks from the data yLabels', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			yLabels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		config.position = 'left'; // y axis
		var Constructor = Chart.scaleService.getScaleConstructor('category');
		var scale = new Constructor({
			ctx: {},
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.determineDataLimits();
		scale.ticks = scale.buildTicks();
		expect(getValues(scale)).toEqual(mockData.yLabels);
	});

	it('Should generate ticks from the axis labels', function() {
		var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
		var chart = window.acquireChart({
			type: 'line',
			data: {
				data: [10, 5, 0, 25, 78]
			},
			options: {
				scales: {
					x: {
						type: 'category',
						labels: labels
					}
				}
			}
		});

		var scale = chart.scales.x;
		expect(getLabels(scale)).toEqual(labels);
	});

	it('should get the correct label for the index', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					yAxisID: 'y',
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
			},
			options: {
				scales: {
					x: {
						type: 'category',
						position: 'bottom'
					},
					y: {
						type: 'linear'
					}
				}
			}
		});

		var scale = chart.scales.x;

		expect(scale.getLabelForValue(1)).toBe('tick2');
	});

	it('Should get the correct pixel for a value when horizontal', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					yAxisID: 'y',
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
			},
			options: {
				scales: {
					x: {
						type: 'category',
						position: 'bottom'
					},
					y: {
						type: 'linear'
					}
				}
			}
		});

		var xScale = chart.scales.x;
		expect(xScale.getPixelForValue(0)).toBeCloseToPixel(23 + 6); // plus lineHeight
		expect(xScale.getValueForPixel(23)).toBe(0);

		expect(xScale.getPixelForValue(4)).toBeCloseToPixel(487);
		expect(xScale.getValueForPixel(487)).toBe(4);

		xScale.options.offset = true;
		chart.update();

		expect(xScale.getPixelForValue(0)).toBeCloseToPixel(71 + 6); // plus lineHeight
		expect(xScale.getValueForPixel(69)).toBe(0);

		expect(xScale.getPixelForValue(4)).toBeCloseToPixel(461);
		expect(xScale.getValueForPixel(417)).toBe(4);
	});

	it('Should get the correct pixel for a value when there are repeated labels', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					yAxisID: 'y',
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
			},
			options: {
				scales: {
					x: {
						type: 'category',
						position: 'bottom'
					},
					y: {
						type: 'linear'
					}
				}
			}
		});

		var xScale = chart.scales.x;
		expect(xScale.getPixelForValue('tick1')).toBeCloseToPixel(23 + 6); // plus lineHeight
	});

	it('Should get the correct pixel for a value when horizontal and zoomed', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					yAxisID: 'y',
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
			},
			options: {
				scales: {
					x: {
						type: 'category',
						position: 'bottom',
						min: 'tick2',
						max: 'tick4'
					},
					y: {
						type: 'linear'
					}
				}
			}
		});

		var xScale = chart.scales.x;
		expect(xScale.getPixelForValue(1)).toBeCloseToPixel(23 + 6); // plus lineHeight
		expect(xScale.getPixelForValue(3)).toBeCloseToPixel(496);

		xScale.options.offset = true;
		chart.update();

		expect(xScale.getPixelForValue(1)).toBeCloseToPixel(103 + 6); // plus lineHeight
		expect(xScale.getPixelForValue(3)).toBeCloseToPixel(429);
	});

	it('should get the correct pixel for a value when vertical', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					yAxisID: 'y',
					data: ['3', '5', '1', '4', '2']
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
				yLabels: ['1', '2', '3', '4', '5']
			},
			options: {
				scales: {
					x: {
						type: 'category',
						position: 'bottom',
					},
					y: {
						type: 'category',
						position: 'left'
					}
				}
			}
		});

		var yScale = chart.scales.y;
		expect(yScale.getPixelForValue(0)).toBeCloseToPixel(32);
		expect(yScale.getValueForPixel(257)).toBe(2);

		expect(yScale.getPixelForValue(4)).toBeCloseToPixel(481);
		expect(yScale.getValueForPixel(144)).toBe(1);

		yScale.options.offset = true;
		chart.update();

		expect(yScale.getPixelForValue(0)).toBeCloseToPixel(77);
		expect(yScale.getValueForPixel(256)).toBe(2);

		expect(yScale.getPixelForValue(4)).toBeCloseToPixel(436);
		expect(yScale.getValueForPixel(167)).toBe(1);
	});

	it('should get the correct pixel for a value when vertical and zoomed', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					yAxisID: 'y',
					data: ['3', '5', '1', '4', '2']
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
				yLabels: ['1', '2', '3', '4', '5']
			},
			options: {
				scales: {
					x: {
						type: 'category',
						position: 'bottom',
					},
					y: {
						type: 'category',
						position: 'left',
						min: '2',
						max: '4'
					}
				}
			}
		});

		var yScale = chart.scales.y;

		expect(yScale.getPixelForValue(1)).toBeCloseToPixel(32);
		expect(yScale.getPixelForValue(3)).toBeCloseToPixel(482);

		yScale.options.offset = true;
		chart.update();

		expect(yScale.getPixelForValue(1)).toBeCloseToPixel(107);
		expect(yScale.getPixelForValue(3)).toBeCloseToPixel(407);
	});

	it('Should get the correct pixel for an object value when horizontal', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					yAxisID: 'y',
					data: [
						{x: 0, y: 10},
						{x: 1, y: 5},
						{x: 2, y: 0},
						{x: 3, y: 25},
						{x: 0, y: 78}
					]
				}],
				labels: [0, 1, 2, 3]
			},
			options: {
				scales: {
					x: {
						type: 'category',
						position: 'bottom'
					},
					y: {
						type: 'linear'
					}
				}
			}
		});

		var xScale = chart.scales.x;
		expect(xScale.getPixelForValue(0)).toBeCloseToPixel(29);
		expect(xScale.getPixelForValue(3)).toBeCloseToPixel(506);
		expect(xScale.getPixelForValue(4)).toBeCloseToPixel(664);
	});

	it('Should get the correct pixel for an object value when vertical', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					yAxisID: 'y',
					data: [
						{x: 0, y: 2},
						{x: 1, y: 4},
						{x: 2, y: 0},
						{x: 3, y: 3},
						{x: 0, y: 1}
					]
				}],
				labels: [0, 1, 2, 3],
				yLabels: [0, 1, 2, 3, 4]
			},
			options: {
				scales: {
					x: {
						type: 'category',
						position: 'bottom'
					},
					y: {
						type: 'category',
						position: 'left'
					}
				}
			}
		});

		var yScale = chart.scales.y;
		expect(yScale.getPixelForValue(0)).toBeCloseToPixel(32);
		expect(yScale.getPixelForValue(4)).toBeCloseToPixel(481);
	});

	it('Should get the correct pixel for an object value in a bar chart', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					xAxisID: 'x',
					yAxisID: 'y',
					data: [
						{x: 0, y: 10},
						{x: 1, y: 5},
						{x: 2, y: 0},
						{x: 3, y: 25},
						{x: 0, y: 78}
					]
				}],
				labels: [0, 1, 2, 3]
			},
			options: {
				scales: {
					x: {
						type: 'category',
						position: 'bottom'
					},
					y: {
						type: 'linear'
					}
				}
			}
		});

		var xScale = chart.scales.x;
		expect(xScale.getPixelForValue(0)).toBeCloseToPixel(89);
		expect(xScale.getPixelForValue(3)).toBeCloseToPixel(449);
		expect(xScale.getPixelForValue(4)).toBeCloseToPixel(569);
	});

	it('Should get the correct pixel for an object value in a horizontal bar chart', function() {
		var chart = window.acquireChart({
			type: 'horizontalBar',
			data: {
				datasets: [{
					xAxisID: 'x',
					yAxisID: 'y',
					data: [
						{x: 10, y: 0},
						{x: 5, y: 1},
						{x: 0, y: 2},
						{x: 25, y: 3},
						{x: 78, y: 0}
					]
				}],
				labels: [0, 1, 2, 3]
			},
			options: {
				scales: {
					x: {
						type: 'linear',
						position: 'bottom'
					},
					y: {
						type: 'category'
					}
				}
			}
		});

		var yScale = chart.scales.y;
		expect(yScale.getPixelForValue(0)).toBeCloseToPixel(88);
		expect(yScale.getPixelForValue(3)).toBeCloseToPixel(426);
		expect(yScale.getPixelForValue(4)).toBeCloseToPixel(538);
	});
});
