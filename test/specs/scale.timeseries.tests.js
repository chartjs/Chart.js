// Time scale tests
describe('TimeSeries scale tests', function() {
	function createScale(data, options) {
		var scaleID = 'myScale';
		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('timeseries');
		var scale = new Constructor({
			ctx: mockContext,
			options: options,
			chart: {
				data: data
			},
			id: scaleID
		});

		scale.update(400, 50);
		return scale;
	}

	function getTicksValues(ticks) {
		return ticks.map(function(tick) {
			return tick.value;
		});
	}

	beforeEach(function() {
		// Need a time matcher for getValueFromPixel
		jasmine.addMatchers({
			toBeCloseToTime: function() {
				return {
					compare: function(actual, expected) {
						var result = false;

						var diff = actual.diff(expected.value, expected.unit, true);
						result = Math.abs(diff) < (expected.threshold !== undefined ? expected.threshold : 0.01);

						return {
							pass: result
						};
					}
				};
			}
		});
	});

	it('Should load moment.js as a dependency', function() {
		expect(window.moment).not.toBe(undefined);
	});

	it('Should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('timeseries');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('timeseries');
		expect(defaultConfig).toEqual({
			display: true,
			gridLines: {
				color: 'rgba(0, 0, 0, 0.1)',
				drawBorder: true,
				drawOnChartArea: true,
				drawTicks: true,
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
				labelString: '',
				display: false
			},
			ticks: {
				beginAtZero: false,
				minRotation: 0,
				maxRotation: 50,
				mirror: false,
				padding: 0,
				reverse: false,
				display: true,
				callback: defaultConfig.ticks.callback, // make this nicer, then check explicitly below,
				autoSkip: true,
				autoSkipPadding: 0,
				labelOffset: 0,
				minor: {},
				major: {},
			},
			time: {
				parser: false,
				format: false,
				unit: false,
				round: false,
				displayFormat: false,
				minUnit: 'millisecond',
				displayFormats: {
					millisecond: 'h:mm:ss.SSS a', // 11:20:01.123 AM
					second: 'h:mm:ss a', // 11:20:01 AM
					minute: 'h:mm:ss a', // 11:20:01 AM
					hour: 'MMM D, hA', // Sept 4, 5PM
					day: 'll', // Sep 4 2015
					week: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
					month: 'MMM YYYY', // Sept 2015
					quarter: '[Q]Q - YYYY', // Q3
					year: 'YYYY' // 2015
				}
			}
		});

		// Is this actually a function
		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
	});
//
	describe('when given inputs of different types', function() {
		// Helper to build date objects
		function newDateFromRef(days) {
			return moment('01/01/2015 12:00', 'DD/MM/YYYY HH:mm').add(days, 'd').toDate();
		}

		it('should accept labels as strings', function() {
			var mockData = {
				labels: ['2015-01-01T12:00:00', '2015-01-02T21:00:00', '2015-01-03T22:00:00', '2015-01-05T23:00:00', '2015-01-07T03:00', '2015-01-08T10:00', '2015-01-10T12:00'], // days
			};

			var scale = createScale(mockData, Chart.scaleService.getScaleDefaults('timeseries'));
			scale.update(1000, 200);
			expect(getTicksValues(scale.ticks)).toEqual(['Jan 1, 2015', 'Jan 2, 2015', 'Jan 3, 2015', 'Jan 5, 2015', 'Jan 7, 2015', 'Jan 8, 2015', 'Jan 10, 2015']);
		});

		it('should accept labels as date objects', function() {
			var mockData = {
				labels: [newDateFromRef(0), newDateFromRef(1), newDateFromRef(2), newDateFromRef(4), newDateFromRef(6), newDateFromRef(7), newDateFromRef(9)], // days
			};
			var scale = createScale(mockData, Chart.scaleService.getScaleDefaults('timeseries'));
			scale.update(1000, 200);
			expect(getTicksValues(scale.ticks)).toEqual(['Jan 1, 2015', 'Jan 2, 2015', 'Jan 3, 2015', 'Jan 5, 2015', 'Jan 7, 2015', 'Jan 8, 2015', 'Jan 10, 2015']);
		});

		it('should accept data as xy points', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						xAxisID: 'xScale0',
						data: [{
							x: newDateFromRef(0),
							y: 1
						}, {
							x: newDateFromRef(1),
							y: 10
						}, {
							x: newDateFromRef(2),
							y: 0
						}, {
							x: newDateFromRef(4),
							y: 5
						}, {
							x: newDateFromRef(6),
							y: 77
						}, {
							x: newDateFromRef(7),
							y: 9
						}, {
							x: newDateFromRef(9),
							y: 5
						}]
					}],
				},
				options: {
					scales: {
						xAxes: [{
							id: 'xScale0',
							type: 'timeseries',
							position: 'bottom'
						}],
					}
				}
			});

			var xScale = chart.scales.xScale0;
			xScale.update(800, 200);
			expect(getTicksValues(xScale.ticks)).toEqual(['Jan 1, 2015', 'Jan 2, 2015', 'Jan 3, 2015', 'Jan 5, 2015', 'Jan 7, 2015', 'Jan 8, 2015', 'Jan 10, 2015']);
		});
	});

	it('should allow custom time parsers', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					data: [{
						x: 375068900,
						y: 1
					}]
				}],
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'timeseries',
						position: 'bottom',
						time: {
							unit: 'day',
							round: true,
							parser: function(label) {
								return moment.unix(label);
							}
						}
					}],
				}
			}
		});

		// Counts down because the lines are drawn top to bottom
		var xScale = chart.scales.xScale0;

		// Counts down because the lines are drawn top to bottom
		expect(getTicksValues(xScale.ticks)[0]).toEqualOneOf(['Nov 19, 1981', 'Nov 20, 1981', 'Nov 21, 1981']); // handle time zone changes
	});

	it('should build ticks using the config unit', function() {
		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00'], // days
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('timeseries'));
		config.time.unit = 'hour';

		var scale = createScale(mockData, config);
		scale.update(2500, 200);
		expect(getTicksValues(scale.ticks)).toEqual(['Jan 1, 8PM', 'Jan 2, 9PM']);
	});

	it('build ticks honoring the minUnit', function() {
		var mockData = {
			labels: ['2015-01-01T20:00:00', '2016-01-02T21:00:00'], // days
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('timeseries'));
		config.time.minUnit = 'year';

		var scale = createScale(mockData, config);
		expect(getTicksValues(scale.ticks)).toEqual(['2015', '2016']);
	});

	it('should build ticks using the config diff', function() {
		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-02-02T21:00:00', '2015-02-21T01:00:00'], // days
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
		config.time.unit = 'week';
		config.time.round = 'week';

		var scale = createScale(mockData, config);
		scale.update(800, 200);

		// last date is feb 15 because we round to start of week
		expect(getTicksValues(scale.ticks)).toEqual(['Dec 28, 2014', 'Feb 1, 2015', 'Feb 15, 2015']);
	});

	it('should get the correct label for a data value', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					data: [null, 10, 3]
				}],
				labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00', '2015-01-03T22:00:00', '2015-01-05T23:00:00', '2015-01-07T03:00', '2015-01-08T10:00', '2015-01-10T12:00'], // days
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'time',
						position: 'bottom'
					}],
				}
			}
		});

		var xScale = chart.scales.xScale0;
		expect(xScale.getLabelForIndex(0, 0)).toBeTruthy();
		expect(xScale.getLabelForIndex(0, 0)).toBe('2015-01-01T20:00:00');
		expect(xScale.getLabelForIndex(6, 0)).toBe('2015-01-10T12:00');
	});

	it ('Should get the correct pixel for a value', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00', '2015-01-03T22:00:00', '2015-01-05T23:00:00', '2015-01-07T03:00']
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'timeseries',
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
		expect(xScale.getPixelForValue(0, 0, 0, false)).toBeCloseToPixel(42);
		expect(xScale.getPixelForValue(0, 0, 0, true)).toBeCloseToPixel(42);
		expect(xScale.getValueForPixel(33)).toBe(0);

		expect(xScale.getPixelForValue(0, 4, 0, false)).toBeCloseToPixel(470);
		expect(xScale.getPixelForValue(0, 4, 0, true)).toBeCloseToPixel(470);
		expect(xScale.getValueForPixel(487)).toBe(4);

		xScale.options.gridLines.offsetGridLines = true;

		expect(xScale.getPixelForValue(0, 0, 0, false)).toBeCloseToPixel(42);
		expect(xScale.getPixelForValue(0, 0, 0, true)).toBeCloseToPixel(85);
		expect(xScale.getValueForPixel(33)).toBe(0);
		expect(xScale.getValueForPixel(78)).toBe(0);

		expect(xScale.getPixelForValue(0, 4, 0, false)).toBeCloseToPixel(384);
		expect(xScale.getPixelForValue(0, 4, 0, true)).toBeCloseToPixel(427);
		expect(xScale.getValueForPixel(410)).toBe(4);
		expect(xScale.getValueForPixel(433)).toBe(4);
	});

	it('does not create a negative width chart when hidden', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: []
				}]
			},
			options: {
				scales: {
					xAxes: [{
						type: 'time',
						time: {
							min: moment().subtract(1, 'months'),
							max: moment(),
						}
					}],
				},
				responsive: true,
			},
		}, {
			wrapper: {
				style: 'display: none',
			},
		});
		expect(chart.scales['y-axis-0'].width).toEqual(0);
		expect(chart.scales['y-axis-0'].maxWidth).toEqual(0);
		expect(chart.width).toEqual(0);
	});
});
