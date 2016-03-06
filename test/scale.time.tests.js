// Time scale tests
describe('Time scale tests', function() {

	beforeEach(function() {
		jasmine.addMatchers({
			toEqualOneOf: function() {
				return {
					compare: function(actual, expecteds) {
						var result = false;
						for (var i = 0, l = expecteds.length; i < l; i++) {
							if (actual === expecteds[i]) {
								result = true;
								break;
							}
						}
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
				color: "rgba(0, 0, 0, 0.1)",
				drawOnChartArea: true,
				drawTicks: true,
				lineWidth: 1,
				offsetGridLines: false,
				display: true,
				zeroLineColor: "rgba(0,0,0,0.25)",
				zeroLineWidth: 1,
			},
			position: "bottom",
			scaleLabel: {
				labelString: '',
				display: false,
			},
			ticks: {
				beginAtZero: false,
				maxRotation: 90,
				mirror: false,
				padding: 10,
				reverse: false,
				display: true,
				callback: defaultConfig.ticks.callback, // make this nicer, then check explicitly below,
				autoSkip: false,
				autoSkipPadding: 20
			},
			time: {
				parser: false,
				format: false,
				unit: false,
				round: false,
				displayFormat: false,
				displayFormats: {
					'millisecond': 'h:mm:ss.SSS a', // 11:20:01.123 AM
					'second': 'h:mm:ss a', // 11:20:01 AM
					'minute': 'h:mm:ss a', // 11:20:01 AM
					'hour': 'MMM D, hA', // Sept 4, 5PM
					'day': 'll', // Sep 4 2015
					'week': 'll', // Week 46, or maybe "[W]WW - YYYY" ?
					'month': 'MMM YYYY', // Sept 2015
					'quarter': '[Q]Q - YYYY', // Q3
					'year': 'YYYY', // 2015
				},
			}
		});

		// Is this actually a function
		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
	});

	it('should build ticks using days', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ["2015-01-01T20:00:00", "2015-01-02T21:00:00", "2015-01-03T22:00:00", "2015-01-05T23:00:00", "2015-01-07T03:00", "2015-01-08T10:00", "2015-01-10T12:00"], // days
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

		//scale.buildTicks();
		scale.update(400, 50);

		// Counts down because the lines are drawn top to bottom
		expect(scale.ticks).toEqual(['Jan 1, 2015', 'Jan 3, 2015', 'Jan 5, 2015', 'Jan 7, 2015', 'Jan 9, 2015', 'Jan 11, 2015']);
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
		expect(scale.ticks).toEqual(['Jan 1, 2015', 'Jan 3, 2015', 'Jan 5, 2015', 'Jan 7, 2015', 'Jan 9, 2015', 'Jan 11, 2015']);
	});

	it('should build ticks when the data is xy points', function() {
		// Helper to build date objects
		function newDateFromRef(days) {
			return moment('01/01/2015 12:00', 'DD/MM/YYYY HH:mm').add(days, 'd').toDate();
		}

		var scaleID = 'myScale';
		var mockData = {
			datasets: [{
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
				}], // days
			}]
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
		expect(scale.ticks).toEqual(['Jan 1, 2015', 'Jan 3, 2015', 'Jan 5, 2015', 'Jan 7, 2015', 'Jan 9, 2015', 'Jan 11, 2015']);
	});

	it('should allow custom time parsers', function() {
		// Helper to build date objects


		var scaleID = 'myScale';
		var mockData = {
			datasets: [{
				data: [{
					x: 375068900,
					y: 1
				}],
			}]
		};
		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
		verticalScaleConfig.time.unit = 'day';
		verticalScaleConfig.time.round = true;
		verticalScaleConfig.time.parser = function customTimeParser(label) {
			return moment.unix(label);
		}

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('time');
		var scale = new Constructor({
			ctx: mockContext,
			options: verticalScaleConfig,
			chart: {
				data: mockData
			},
			id: scaleID
		});
		scale.update(400, 50);

		// Counts down because the lines are drawn top to bottom
		expect(scale.ticks[0]).toEqualOneOf(['Nov 19, 1981', 'Nov 20, 1981']); // handle time zone changes
		expect(scale.ticks[1]).toEqualOneOf(['Nov 19, 1981', 'Nov 20, 1981']); // handle time zone changes
	});

	it('should build ticks using the config unit', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ["2015-01-01T20:00:00", "2015-01-02T21:00:00"], // days
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

		//scale.buildTicks();
		scale.update(400, 50);
		expect(scale.ticks).toEqual(['Jan 1, 8PM', 'Jan 1, 9PM', 'Jan 1, 10PM', 'Jan 1, 11PM', 'Jan 2, 12AM', 'Jan 2, 1AM', 'Jan 2, 2AM', 'Jan 2, 3AM', 'Jan 2, 4AM', 'Jan 2, 5AM', 'Jan 2, 6AM', 'Jan 2, 7AM', 'Jan 2, 8AM', 'Jan 2, 9AM', 'Jan 2, 10AM', 'Jan 2, 11AM', 'Jan 2, 12PM', 'Jan 2, 1PM', 'Jan 2, 2PM', 'Jan 2, 3PM', 'Jan 2, 4PM', 'Jan 2, 5PM', 'Jan 2, 6PM', 'Jan 2, 7PM', 'Jan 2, 8PM', 'Jan 2, 9PM']);
	});

	it('should build ticks using the config diff', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ["2015-01-01T20:00:00", "2015-02-02T21:00:00", "2015-02-21T01:00:00"], // days
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

		//scale.buildTicks();
		scale.update(400, 50);

		// last date is feb 15 because we round to start of week
		expect(scale.ticks).toEqual(['Dec 28, 2014', 'Jan 4, 2015', 'Jan 11, 2015', 'Jan 18, 2015', 'Jan 25, 2015', 'Feb 1, 2015', 'Feb 8, 2015', 'Feb 15, 2015']);
	});

	it('Should use the min and max options', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ["2015-01-01T20:00:00", "2015-01-02T20:00:00", "2015-01-03T20:00:00"], // days
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
		config.time.min = "2015-01-01T04:00:00";
		config.time.max = "2015-01-05T06:00:00"
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
		expect(scale.ticks).toEqual(['Jan 1, 4AM', 'Jan 1, 4PM', 'Jan 2, 4AM', 'Jan 2, 4PM', 'Jan 3, 4AM', 'Jan 3, 4PM', 'Jan 4, 4AM', 'Jan 4, 4PM', 'Jan 5, 4AM', 'Jan 5, 6AM']);
	});

	it('should get the correct pixel for a value', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ["2015-01-01T20:00:00", "2015-01-02T21:00:00", "2015-01-03T22:00:00", "2015-01-05T23:00:00", "2015-01-07T03:00", "2015-01-08T10:00", "2015-01-10T12:00"], // days
			datasets: [{
				data: [],
			}]
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

		expect(scale.width).toBe(400);
		expect(scale.height).toBe(50);
		scale.left = 0;
		scale.right = 400;
		scale.top = 10;
		scale.bottom = 38;

		expect(scale.getPixelForValue('', 0, 0)).toBe(128);
		expect(scale.getPixelForValue('', 6, 0)).toBe(380);

		var verticalScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
		verticalScaleConfig.position = "left";

		var verticalScale = new Constructor({
			ctx: mockContext,
			options: verticalScaleConfig,
			chart: {
				data: mockData
			},
			id: scaleID
		});
		verticalScale.update(50, 400);
		expect(verticalScale.width).toBe(50);
		expect(verticalScale.height).toBe(400);
		verticalScale.top = 0;
		verticalScale.left = 0;
		verticalScale.right = 50;
		verticalScale.bottom = 400;

		expect(verticalScale.getPixelForValue('', 0, 0)).toBe(38);
		expect(verticalScale.getPixelForValue('', 6, 0)).toBe(375);
	});

	it('should get the correct label for a data value', function() {
		var scaleID = 'myScale';

		var mockData = {
			labels: ["2015-01-01T20:00:00", "2015-01-02T21:00:00", "2015-01-03T22:00:00", "2015-01-05T23:00:00", "2015-01-07T03:00", "2015-01-08T10:00", "2015-01-10T12:00"], // days
			datasets: [{
				data: [],
			}]
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

		expect(scale.width).toBe(400);
		expect(scale.height).toBe(50);
		scale.left = 0;
		scale.right = 400;
		scale.top = 10;
		scale.bottom = 38;

		expect(scale.getLabelForIndex(0, 0)).toBe('2015-01-01T20:00:00');
		expect(scale.getLabelForIndex(6, 0)).toBe('2015-01-10T12:00');

	});
});
