describe('Logarithmic Scale tests', function() {

	it('Should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('logarithmic');
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
			position: "left",
			scaleLabel: {
				labelString: '',
				display: false,
			},
			ticks: {
				beginAtZero: false,
				maxRotation: 50,
				mirror: false,
				padding: 10,
				reverse: false,
				display: true,
				callback: defaultConfig.ticks.callback, // make this nicer, then check explicitly below
				autoSkip: true,
				autoSkipPadding: 0
			},
		});

		// Is this actually a function
		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
	});

	it('Should correctly determine the max & min data values', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 5000, 78, 450]
			}, {
				yAxisID: 'second scale',
				data: [1, 1000, 10, 100],
			}, {
				yAxisID: scaleID,
				data: [150]
			}]
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: Chart.scaleService.getScaleDefaults('logarithmic'), // use default config for scale
			chart: {
				data: mockData,
			},
			id: scaleID
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		scale.update(400, 400);
		expect(scale.min).toBe(1);
		expect(scale.max).toBe(5000);
	});

	it('Should correctly determine the max & min of string data values', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: ['10', '5', '5000', '78', '450']
			}, {
				yAxisID: 'second scale',
				data: ['1', '1000', '10', '100'],
			}, {
				yAxisID: scaleID,
				data: ['150']
			}]
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: Chart.scaleService.getScaleDefaults('logarithmic'), // use default config for scale
			chart: {
				data: mockData,
			},
			id: scaleID
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		scale.update(400, 400);
		expect(scale.min).toBe(1);
		expect(scale.max).toBe(5000);
	});

	it('Should correctly determine the max & min data values when there are hidden datasets', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 5000, 78, 450]
			}, {
				yAxisID: 'second scale',
				data: [1, 1000, 10, 100],
			}, {
				yAxisID: scaleID,
				data: [50000],
				hidden: true
			}]
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: Chart.scaleService.getScaleDefaults('logarithmic'), // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		scale.update(400, 400);
		expect(scale.min).toBe(1);
		expect(scale.max).toBe(5000);
	});

	it('Should correctly determine the max & min data values when there is NaN data', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [undefined, 10, null, 5, 5000, NaN, 78, 450]
			}]
		};

		var mockContext = window.createMockContext();
		var options = Chart.scaleService.getScaleDefaults('logarithmic');
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: options, // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		scale.update(400, 400);
		expect(scale.min).toBe(1);
		expect(scale.max).toBe(5000);

		// Turn on stacked mode since it uses it's own
		options.stacked = true;

		scale.update(400, 400);
		expect(scale.min).toBe(1);
		expect(scale.max).toBe(5000);
	});


	it('Should correctly determine the max & min for scatter data', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [{
					x: 10,
					y: 100
				}, {
					x: 2,
					y: 6
				}, {
					x: 65,
					y: 121
				}, {
					x: 99,
					y: 7
				}]
			}]
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var verticalScale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		verticalScale.update(400, 400);
		expect(verticalScale.min).toBe(1);
		expect(verticalScale.max).toBe(200);

		var horizontalConfig = Chart.helpers.clone(config);
		horizontalConfig.position = 'bottom';
		var horizontalScale = new Constructor({
			ctx: mockContext,
			options: horizontalConfig,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		horizontalScale.update(400, 400);
		expect(horizontalScale.min).toBe(1);
		expect(horizontalScale.max).toBe(100);
	});

	it('Should correctly determine the min and max data values when stacked mode is turned on', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 1, 5, 78, 100],
				type: 'bar'
			}, {
				yAxisID: 'second scale',
				data: [-1000, 1000],
			}, {
				yAxisID: scaleID,
				data: [150, 10, 10, 100, 10, 9],
				type: 'bar'
			}, {
				yAxisID: scaleID,
				data: [100, 100, 100, 100, 100, 100],
				type: 'line'
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		config.stacked = true; // enable scale stacked mode

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.update(400, 400);
		expect(scale.min).toBe(10);
		expect(scale.max).toBe(200);
	});

	it('Should correctly determine the min and max data values when stacked mode is turned on ignoring hidden datasets', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 1, 5, 78, 100],
				type: 'bar'
			}, {
				yAxisID: 'second scale',
				data: [-1000, 1000],
				type: 'bar'
			}, {
				yAxisID: scaleID,
				data: [150, 10, 10, 100, 10, 9],
				type: 'bar'
			}, {
				yAxisID: scaleID,
				data: [10000, 10000, 10000, 10000, 10000, 10000],
				hidden: true,
				type: 'bar'
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		config.stacked = true; // enable scale stacked mode

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.update(400, 400);
		expect(scale.min).toBe(10);
		expect(scale.max).toBe(200);
	});

	it('Should ensure that the scale has a max and min that are not equal', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: []
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.update(400, 00);
		expect(scale.min).toBe(1);
		expect(scale.max).toBe(10);

		mockData.datasets = [{
			yAxisID: scaleID,
			data: [0.15, 0.15]
		}];

		scale.update(400, 400);
		expect(scale.min).toBe(0.01);
		expect(scale.max).toBe(1);
	});


	it('Should use the min and max options', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [1, 1, 1, 2, 1, 0]
			}]
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));

		config.ticks.min = 10;
		config.ticks.max = 1010;

		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.update(400, 00);
		scale.buildTicks();
		expect(scale.min).toBe(10);
		expect(scale.max).toBe(1010);
		expect(scale.ticks[0]).toBe(1010);
		expect(scale.ticks[scale.ticks.length - 1]).toBe(10);
	});

	it('Should generate tick marks', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 1, 25, 78]
			}, ]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: {},
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// Set arbitrary width and height for now
		scale.width = 50;
		scale.height = 400;

		scale.determineDataLimits();
		scale.buildTicks();

		// Counts down because the lines are drawn top to bottom
		expect(scale.ticks).toEqual([80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
		expect(scale.start).toBe(1);
		expect(scale.end).toBe(80);
	});

	it('Should generate tick marks in the correct order in reversed mode', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 1, 25, 78]
			}, ]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		config.ticks.reverse = true;

		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: {},
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// Set arbitrary width and height for now
		scale.width = 50;
		scale.height = 400;

		scale.determineDataLimits();
		scale.buildTicks();

		// Counts down because the lines are drawn top to bottom
		expect(scale.ticks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80]);
		expect(scale.start).toBe(80);
		expect(scale.end).toBe(1);
	});

	it('Should build labels using the default template', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 1, 25, 78]
			}, ]
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.update(400, 400);

		expect(scale.ticks).toEqual(['8e+1', '', '', '5e+1', '', '', '2e+1', '1e+1', '', '', '', '', '5e+0', '', '', '2e+0', '1e+0']);
	});

	it('Should build labels using the user supplied callback', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 1, 25, 78]
			}, ]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		config.ticks.userCallback = function(value, index) {
			return index.toString();
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		scale.update(400, 400);

		// Just the index
		expect(scale.ticks).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']);
	});

	it('Should correctly get the correct label for a data item', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 5000, 78, 450]
			}, {
				yAxisID: 'second scale',
				data: [1, 1000, 10, 100],
			}, {
				yAxisID: scaleID,
				data: [150]
			}]
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: mockContext,
			options: Chart.scaleService.getScaleDefaults('logarithmic'), // use default config for scale
			chart: {
				data: mockData,
			},
			id: scaleID
		});

		scale.update(400, 400);

		expect(scale.getLabelForIndex(0, 2)).toBe(150);
	});

	it('Should get the correct pixel value for a point', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [10, 5, 1, 25, 78]
			}]
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var verticalScale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		verticalScale.update(50, 100);

		// Fake out positioning of the scale service
		verticalScale.left = 0;
		verticalScale.top = 0;
		verticalScale.right = 50;
		verticalScale.bottom = 110;
		verticalScale.paddingTop = 5;
		verticalScale.paddingBottom = 5;
		verticalScale.width = 50;
		verticalScale.height = 110;

		expect(verticalScale.getPixelForValue(80, 0, 0)).toBe(5); // top + paddingTop
		expect(verticalScale.getPixelForValue(1, 0, 0)).toBe(105); // bottom - paddingBottom
		expect(verticalScale.getPixelForValue(10, 0, 0)).toBeCloseTo(52.4, 1e-4); // halfway
		expect(verticalScale.getPixelForValue(0, 0, 0)).toBe(5); // 0 is invalid. force it on top

		var horizontalConfig = Chart.helpers.clone(config);
		horizontalConfig.position = 'bottom';
		var horizontalScale = new Constructor({
			ctx: mockContext,
			options: horizontalConfig,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		horizontalScale.update(100, 50);

		// Fake out positioning of the scale service
		horizontalScale.left = 0;
		horizontalScale.top = 0;
		horizontalScale.right = 110;
		horizontalScale.bottom = 50;
		horizontalScale.paddingLeft = 5;
		horizontalScale.paddingRight = 5;
		horizontalScale.width = 110;
		horizontalScale.height = 50;

		expect(horizontalScale.getPixelForValue(80, 0, 0)).toBe(105); // right - paddingRight
		expect(horizontalScale.getPixelForValue(1, 0, 0)).toBe(5); // left + paddingLeft
		expect(horizontalScale.getPixelForValue(10, 0, 0)).toBeCloseTo(57.5, 1e-4); // halfway
		expect(horizontalScale.getPixelForValue(0, 0, 0)).toBe(5); // 0 is invalid, put it on the left.
	});
});
