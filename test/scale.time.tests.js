// Time scale tests
describe('Time scale tests', function() {
	beforeEach(function() {
		// Need a time matcher for getValueFromPixel
		jasmine.addMatchers({
			toBeCloseToTime: function() {
				return {
					compare: function(actual, expected) {
						var result = false;

						var diff = actual.diff(expected.value, expected.unit, true);
						result = Math.abs(diff) < (expected.threshold !== undefined ? expected.threshold : 0.5);

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
		var Constructor = Chart.scaleService.getScaleConstructor('time');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('time');
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
				padding: 10,
				reverse: false,
				display: true,
				callback: defaultConfig.ticks.callback, // make this nicer, then check explicitly below,
				autoSkip: false,
				autoSkipPadding: 0,
				labelOffset: 0
			},
			time: {
				parser: false,
				format: false,
				unit: false,
				round: false,
				isoWeekday: false,
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

	it('should build ticks using days', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00', '2015-01-03T22:00:00', '2015-01-05T23:00:00', '2015-01-07T03:00', '2015-01-08T10:00', '2015-01-10T12:00'], // days
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('time');
		var scale = new Constructor({
			ctx: mockContext,
			options: Chart.scaleService.getScaleDefaults('time'), // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// scale.buildTicks();
		scale.update(400, 50);

		// Counts down because the lines are drawn top to bottom
		expect(scale.ticks).toEqual(['Dec 28, 2014', 'Jan 4, 2015', 'Jan 11, 2015']);
	});

	it('should build ticks using date objects', function() {
		// Helper to build date objects
		function newDateFromRef(days) {
			return moment('01/01/2015 12:00', 'DD/MM/YYYY HH:mm').add(days, 'd').toDate();
		}

		var scaleID = 'myScale';
		var mockData = {
			labels: [newDateFromRef(0), newDateFromRef(1), newDateFromRef(2), newDateFromRef(4), newDateFromRef(6), newDateFromRef(7), newDateFromRef(9)], // days
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('time');
		var scale = new Constructor({
			ctx: mockContext,
			options: Chart.scaleService.getScaleDefaults('time'), // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.update(400, 50);

		// Counts down because the lines are drawn top to bottom
		expect(scale.ticks).toEqual(['Dec 28, 2014', 'Jan 4, 2015', 'Jan 11, 2015']);
	});

	it('should build ticks when the data is xy points', function() {
		// Helper to build date objects
		function newDateFromRef(days) {
			return moment('01/01/2015 12:00', 'DD/MM/YYYY HH:mm').add(days, 'd').toDate();
		}

		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
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
						type: 'time',
						position: 'bottom'
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});

		// Counts down because the lines are drawn top to bottom
		var xScale = chart.scales.xScale0;
		expect(xScale.ticks).toEqual(['Jan 1, 2015', 'Jan 3, 2015', 'Jan 5, 2015', 'Jan 7, 2015', 'Jan 9, 2015', 'Jan 11, 2015']);
	});

	it('should allow custom time parsers', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
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
						type: 'time',
						position: 'bottom',
						time: {
							unit: 'day',
							round: true,
							parser: function(label) {
								return moment.unix(label);
							}
						}
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});

		// Counts down because the lines are drawn top to bottom
		var xScale = chart.scales.xScale0;

		// Counts down because the lines are drawn top to bottom
		expect(xScale.ticks[0]).toEqualOneOf(['Nov 19, 1981', 'Nov 20, 1981', 'Nov 21, 1981']); // handle time zone changes
		expect(xScale.ticks[1]).toEqualOneOf(['Nov 19, 1981', 'Nov 20, 1981', 'Nov 21, 1981']); // handle time zone changes
	});

	it('should build ticks using the config unit', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00'], // days
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
		config.time.unit = 'hour';
		var Constructor = Chart.scaleService.getScaleConstructor('time');
		var scale = new Constructor({
			ctx: mockContext,
			options: config, // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// scale.buildTicks();
		scale.update(400, 50);
		expect(scale.ticks).toEqual(['Jan 1, 8PM', 'Jan 1, 9PM', 'Jan 1, 10PM', 'Jan 1, 11PM', 'Jan 2, 12AM', 'Jan 2, 1AM', 'Jan 2, 2AM', 'Jan 2, 3AM', 'Jan 2, 4AM', 'Jan 2, 5AM', 'Jan 2, 6AM', 'Jan 2, 7AM', 'Jan 2, 8AM', 'Jan 2, 9AM', 'Jan 2, 10AM', 'Jan 2, 11AM', 'Jan 2, 12PM', 'Jan 2, 1PM', 'Jan 2, 2PM', 'Jan 2, 3PM', 'Jan 2, 4PM', 'Jan 2, 5PM', 'Jan 2, 6PM', 'Jan 2, 7PM', 'Jan 2, 8PM', 'Jan 2, 9PM']);
	});

	it('build ticks honoring the minUnit', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00'], // days
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
		config.time.minUnit = 'day';
		var Constructor = Chart.scaleService.getScaleConstructor('time');
		var scale = new Constructor({
			ctx: mockContext,
			options: config, // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// scale.buildTicks();
		scale.update(400, 50);
		expect(scale.ticks).toEqual(['Jan 1, 2015', 'Jan 2, 2015', 'Jan 3, 2015']);
	});

	it('should build ticks using the config diff', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-02-02T21:00:00', '2015-02-21T01:00:00'], // days
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
		config.time.unit = 'week';
		config.time.round = 'week';
		var Constructor = Chart.scaleService.getScaleConstructor('time');
		var scale = new Constructor({
			ctx: mockContext,
			options: config, // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// scale.buildTicks();
		scale.update(400, 50);

		// last date is feb 15 because we round to start of week
		expect(scale.ticks).toEqual(['Dec 28, 2014', 'Jan 4, 2015', 'Jan 11, 2015', 'Jan 18, 2015', 'Jan 25, 2015', 'Feb 1, 2015', 'Feb 8, 2015', 'Feb 15, 2015']);
	});

	it('Should use the min and max options', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-01-02T20:00:00', '2015-01-03T20:00:00'], // days
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
		config.time.min = '2015-01-01T04:00:00';
		config.time.max = '2015-01-05T06:00:00';
		var Constructor = Chart.scaleService.getScaleConstructor('time');
		var scale = new Constructor({
			ctx: mockContext,
			options: config, // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.update(400, 50);
		expect(scale.ticks).toEqual(['Jan 1, 2015', 'Jan 5, 2015']);
	});

	it('Should use the isoWeekday option', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: [
				'2015-01-01T20:00:00', // Thursday
				'2015-01-02T20:00:00', // Friday
				'2015-01-03T20:00:00' // Saturday
			]
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
		config.time.unit = 'week';
		// Wednesday
		config.time.isoWeekday = 3;
		var Constructor = Chart.scaleService.getScaleConstructor('time');
		var scale = new Constructor({
			ctx: mockContext,
			options: config, // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.update(400, 50);
		expect(scale.ticks).toEqual(['Dec 31, 2014', 'Jan 7, 2015']);
	});

	it('should get the correct pixel for a value', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: []
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
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						position: 'left'
					}]
				}
			}
		});

		var xScale = chart.scales.xScale0;

		expect(xScale.getPixelForValue('', 0, 0)).toBeCloseToPixel(78);
		expect(xScale.getPixelForValue('', 6, 0)).toBeCloseToPixel(452);
		expect(xScale.getPixelForValue('2015-01-01T20:00:00')).toBeCloseToPixel(78);

		expect(xScale.getValueForPixel(78)).toBeCloseToTime({
			value: moment(chart.data.labels[0]),
			unit: 'hour',
			threshold: 0.75
		});
		expect(xScale.getValueForPixel(452)).toBeCloseToTime({
			value: moment(chart.data.labels[6]),
			unit: 'hour'
		});
	});

	it('should get the correct label for a data value', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: []
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
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						position: 'left'
					}]
				}
			}
		});

		var xScale = chart.scales.xScale0;
		expect(xScale.getLabelForIndex(0, 0)).toBe('2015-01-01T20:00:00');
		expect(xScale.getLabelForIndex(6, 0)).toBe('2015-01-10T12:00');
	});

	it('should get the correct pixel for only one data in the dataset', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				labels: ['2016-05-27'],
				datasets: [{
					xAxisID: 'xScale0',
					data: [5]
				}]
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						display: true,
						type: 'time'
					}]
				}
			}
		});

		var xScale = chart.scales.xScale0;

		expect(xScale.getPixelForValue('', 0, 0)).toBeCloseToPixel(62);

		expect(xScale.getValueForPixel(62)).toBeCloseToTime({
			value: moment(chart.data.labels[0]),
			unit: 'day',
			threshold: 0.75
		});
	});

	it('should not throw an error if the datasetIndex is out of bounds', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				labels: ['2016-06-26'],
				datasets: [{
					xAxisID: 'xScale0',
					data: [5]
				}]
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						display: true,
						type: 'time',
					}]
				}
			}
		});

		var xScale = chart.scales.xScale0;
		var getOutOfBoundLabelMoment = function() {
			xScale.getLabelMoment(12, 0);
		};

		expect(getOutOfBoundLabelMoment).not.toThrow();
	});

	it('should not throw an error if the datasetIndex or index are null', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				labels: ['2016-06-26'],
				datasets: [{
					xAxisID: 'xScale0',
					data: [5]
				}]
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						display: true,
						type: 'time',
					}]
				}
			}
		});

		var xScale = chart.scales.xScale0;

		var getNullDatasetIndexLabelMoment = function() {
			xScale.getLabelMoment(null, 1);
		};

		var getNullIndexLabelMoment = function() {
			xScale.getLabelMoment(1, null);
		};

		expect(getNullDatasetIndexLabelMoment).not.toThrow();
		expect(getNullIndexLabelMoment).not.toThrow();
	});
});
