// Tests for the radial linear scale used by the polar area and radar charts
describe('Test the radial linear scale', function() {
	var chartInstance;

	beforeEach(function() {
		window.addDefaultMatchers(jasmine);
	});

	afterEach(function() {
		if (chartInstance) {
			releaseChart(chartInstance);
		}
	});

	it('Should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('radialLinear');
		expect(defaultConfig).toEqual({
			angleLines: {
				display: true,
				color: "rgba(0, 0, 0, 0.1)",
				lineWidth: 1
			},
			animate: true,
			display: true,
			gridLines: {
				color: "rgba(0, 0, 0, 0.1)",
				drawBorder: true,
				drawOnChartArea: true,
				drawTicks: true,
				tickMarkLength: 10,
				lineWidth: 1,
				offsetGridLines: false,
				display: true,
				zeroLineColor: "rgba(0,0,0,0.25)",
				zeroLineWidth: 1,
			},
			lineArc: false,
			pointLabels: {
				fontSize: 10,
				callback: defaultConfig.pointLabels.callback, // make this nicer, then check explicitly below
			},
			position: "chartArea",
			scaleLabel: {
				labelString: '',
				display: false,
			},
			ticks: {
				backdropColor: "rgba(255,255,255,0.75)",
				backdropPaddingY: 2,
				backdropPaddingX: 2,
				beginAtZero: false,
				minRotation: 0,
				maxRotation: 50,
				mirror: false,
				padding: 10,
				reverse: false,
				showLabelBackdrop: true,
				display: true,
				callback: defaultConfig.ticks.callback, // make this nicer, then check explicitly below
				autoSkip: true,
				autoSkipPadding: 0,
				labelOffset: 0
			},
		});

		// Is this actually a function
		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
		expect(defaultConfig.pointLabels.callback).toEqual(jasmine.any(Function));
	});

	it('Should correctly determine the max & min data values', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, -5, 78, -100]
				}, {
					data: [150]
				}],
				labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scales: {

				}
			}
		});

		expect(chartInstance.scale.min).toBe(-100);
		expect(chartInstance.scale.max).toBe(150);
	});

	it('Should correctly determine the max & min of string data values', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: ['10', '5', '0', '-5', '78', '-100']
				}, {
					data: ['150']
				}],
				labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scales: {

				}
			}
		});

		expect(chartInstance.scale.min).toBe(-100);
		expect(chartInstance.scale.max).toBe(150);
	});

	it('Should correctly determine the max & min data values when there are hidden datasets', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: ['10', '5', '0', '-5', '78', '-100']
				}, {
					data: ['150']
				}, {
					data: [1000],
					hidden: true
				}],
				labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scales: {

				}
			}
		});

		expect(chartInstance.scale.min).toBe(-100);
		expect(chartInstance.scale.max).toBe(150);
	});

	it('Should correctly determine the max & min data values when there is NaN data', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [50, 60, NaN, 70, null, undefined]
				}],
				labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scales: {

				}
			}
		});

		expect(chartInstance.scale.min).toBe(50);
		expect(chartInstance.scale.max).toBe(70);
	});

	it('Should ensure that the scale has a max and min that are not equal', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [],
			labels: []
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: Chart.scaleService.getScaleDefaults('radialLinear'), // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		scale.update(200, 300);
		expect(scale.min).toBe(-1);
		expect(scale.max).toBe(1);
	});

	it('Should use the suggestedMin and suggestedMax options', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [1, 1, 1, 2, 1, 0]
				}],
				labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scale: {
					ticks: {
						suggestedMin: -10,
						suggestedMax: 10
					}
				}
			}
		});

		expect(chartInstance.scale.min).toBe(-10);
		expect(chartInstance.scale.max).toBe(10);
	});

	it('Should use the min and max options', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [1, 1, 1, 2, 1, 0]
				}],
				labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scale: {
					ticks: {
						min: -1010,
						max: 1010
					}
				}
			}
		});

		expect(chartInstance.scale.min).toBe(-1010);
		expect(chartInstance.scale.max).toBe(1010);
		expect(chartInstance.scale.ticks).toEqual(['-1010', '-1000', '-500', '0', '500', '1000', '1010']);
	});

	it('should forcibly include 0 in the range if the beginAtZero option is used', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [20, 30, 40, 50]
				}],
				labels: ['lablel1', 'label2', 'label3', 'label4']
			},
			options: {
				scale: {
					ticks: {
						beginAtZero: false
					}
				}
			}
		});

		expect(chartInstance.scale.ticks).toEqual(['20', '25', '30', '35', '40', '45', '50']);

		chartInstance.scale.options.ticks.beginAtZero = true;
		chartInstance.update();

		expect(chartInstance.scale.ticks).toEqual(['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50']);

		chartInstance.data.datasets[0].data = [-20, -30, -40, -50];
		chartInstance.update();

		expect(chartInstance.scale.ticks).toEqual(['-50', '-45', '-40', '-35', '-30', '-25', '-20', '-15', '-10', '-5', '0']);

		chartInstance.scale.options.ticks.beginAtZero = false;
		chartInstance.update();

		expect(chartInstance.scale.ticks).toEqual(['-50', '-45', '-40', '-35', '-30', '-25', '-20']);
	});

	it('Should generate tick marks in the correct order in reversed mode', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['lablel1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					ticks: {
						reverse: true
					}
				}
			}
		});

		expect(chartInstance.scale.ticks).toEqual(['80', '70', '60', '50', '40', '30', '20', '10', '0']);
		expect(chartInstance.scale.start).toBe(80);
		expect(chartInstance.scale.end).toBe(0);
	});

	it('Should build labels using the user supplied callback', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					ticks: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				}
			}
		});

		expect(chartInstance.scale.ticks).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
		expect(chartInstance.scale.pointLabels).toEqual(['label1', 'label2', 'label3', 'label4', 'label5']);
	});

	it('Should build point labels using the user supplied callback', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					pointLabels: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				}
			}
		});

		expect(chartInstance.scale.pointLabels).toEqual(['0', '1', '2', '3', '4']);
	});

	it('should correctly set the center point', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					pointLabels: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				}
			}
		});

		expect(chartInstance.scale.drawingArea).toBe(225);
		expect(chartInstance.scale.xCenter).toBe(256);
		expect(chartInstance.scale.yCenter).toBe(272);
	});

	it('should correctly get the label for a given data index', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					pointLabels: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				}
			}
		});
		expect(chartInstance.scale.getLabelForIndex(1, 0)).toBe(5);
	});

	it('should get the correct distance from the center point', function() {
		chartInstance = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					pointLabels: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				}
			}
		});

		expect(chartInstance.scale.getDistanceFromCenterForValue(chartInstance.scale.min)).toBe(0);
		expect(chartInstance.scale.getDistanceFromCenterForValue(chartInstance.scale.max)).toBe(225);
		expect(chartInstance.scale.getPointPositionForValue(1, 5)).toEqual({
			x: 269,
			y: 268,
		});

		chartInstance.scale.options.reverse = true;
		chartInstance.update();

		expect(chartInstance.scale.getDistanceFromCenterForValue(chartInstance.scale.min)).toBe(225);
		expect(chartInstance.scale.getDistanceFromCenterForValue(chartInstance.scale.max)).toBe(0);
	});
});
