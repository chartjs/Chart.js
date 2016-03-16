describe('Linear Scale', function() {

	it('Should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('linear');
		expect(defaultConfig).toEqual({
			display: true,

			gridLines: {
				color: "rgba(0, 0, 0, 0.1)",
				drawOnChartArea: true,
				drawTicks: true, // draw ticks extending towards the label
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
				maxRotation: 90,
				mirror: false,
				padding: 10,
				reverse: false,
				display: true,
				callback: defaultConfig.ticks.callback, // make this work nicer, then check below
				autoSkip: true,
				autoSkipPadding: 20
			}
		});

		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
	});

	it('Should correctly determine the max & min data values', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, -5, 78, -100]
			}, {
				yAxisID: 'second scale',
				data: [-1000, 1000],
			}, {
				yAxisID: scaleID,
				data: [150]
			}]
		};

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: Chart.scaleService.getScaleDefaults('linear'), // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		// Set arbitrary width and height for now
		scale.width = 50;
		scale.height = 400;

		scale.determineDataLimits();
		expect(scale.min).toBe(-100);
		expect(scale.max).toBe(150);
	});

	it('Should correctly determine the max & min of string data values', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: ['10', '5', '0', '-5', '78', '-100']
			}, {
				yAxisID: 'second scale',
				data: ['-1000', '1000'],
			}, {
				yAxisID: scaleID,
				data: ['150']
			}]
		};

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: Chart.scaleService.getScaleDefaults('linear'), // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		// Set arbitrary width and height for now
		scale.width = 50;
		scale.height = 400;

		scale.determineDataLimits();
		expect(scale.min).toBe(-100);
		expect(scale.max).toBe(150);
	});

	it('Should correctly determine the max & min data values ignoring hidden datasets', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, -5, 78, -100]
			}, {
				yAxisID: 'second scale',
				data: [-1000, 1000],
			}, {
				yAxisID: scaleID,
				data: [150],
				hidden: true
			}]
		};

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: Chart.scaleService.getScaleDefaults('linear'), // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		// Set arbitrary width and height for now
		scale.width = 50;
		scale.height = 400;

		scale.determineDataLimits();
		scale.buildTicks();
		expect(scale.min).toBe(-100);
		expect(scale.max).toBe(80);
	});

	it('Should correctly determine the max & min data values ignoring data that is NaN', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [null, 90, NaN, undefined, 45, 30]
			}]
		};

		var options = Chart.scaleService.getScaleDefaults('linear');
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: options, // use default config for scale
			chart: {
				data: mockData
			},
			id: scaleID
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		// Set arbitrary width and height for now
		scale.width = 50;
		scale.height = 400;

		scale.determineDataLimits();
		scale.buildTicks();
		expect(scale.min).toBe(30);
		expect(scale.max).toBe(90);

		// Scale is now stacked
		options.stacked = true;

		scale.determineDataLimits();
		expect(scale.min).toBe(0);
		expect(scale.max).toBe(90);
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
					x: -10,
					y: 0
				}, {
					x: 0,
					y: 0
				}, {
					x: 99,
					y: 7
				}]
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScale = new Constructor({
			ctx: {},
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// Set arbitrary width and height for now
		verticalScale.width = 50;
		verticalScale.height = 400;

		verticalScale.determineDataLimits();
		verticalScale.buildTicks();
		expect(verticalScale.min).toBe(0);
		expect(verticalScale.max).toBe(100);

		var horizontalConfig = Chart.helpers.clone(config);
		horizontalConfig.position = 'bottom';
		var horizontalScale = new Constructor({
			ctx: {},
			options: horizontalConfig,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		// Set arbitrary width and height for now
		horizontalScale.width = 400;
		horizontalScale.height = 50;

		horizontalScale.determineDataLimits();
		horizontalScale.buildTicks();
		expect(horizontalScale.min).toBe(-20);
		expect(horizontalScale.max).toBe(100);
	});

	it('Should correctly get the label for the given index', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [{
					x: 10,
					y: 100
				}, {
					x: -10,
					y: 0
				}, {
					x: 0,
					y: 0
				}, {
					x: 99,
					y: 7
				}]
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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

		expect(scale.getLabelForIndex(3, 0)).toBe(7)
	});

	it('Should correctly determine the min and max data values when stacked mode is turned on', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, -5, 78, -100],
				type: 'bar'
			}, {
				yAxisID: 'second scale',
				data: [-1000, 1000],
			}, {
				yAxisID: scaleID,
				data: [150, 0, 0, -100, -10, 9],
				type: 'bar'
			}, {
				yAxisID: scaleID,
				data: [10, 10, 10, 10, 10, 10],
				type: 'line'
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.stacked = true; // enable scale stacked mode

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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
		expect(scale.min).toBe(-150);
		expect(scale.max).toBe(200);
	});

	it('Should correctly determine the min and max data values when stacked mode is turned on and there are hidden datasets', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, -5, 78, -100]
			}, {
				yAxisID: 'second scale',
				data: [-1000, 1000],
			}, {
				yAxisID: scaleID,
				data: [150, 0, 0, -100, -10, 9]
			}, {
				yAxisID: scaleID,
				data: [10, 20, 30, 40, 50, 60],
				hidden: true
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.stacked = true; // enable scale stacked mode

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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
		expect(scale.min).toBe(-150);
		expect(scale.max).toBe(200);
	});

	it('Should correctly determine the min and max data values when stacked mode is turned on there are multiple types of datasets', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				type: 'bar',
				yAxisID: scaleID,
				data: [10, 5, 0, -5, 78, -100]
			}, {
				type: 'line',
				yAxisID: scaleID,
				data: [10, 10, 10, 10, 10, 10],
			}, {
				type: 'bar',
				yAxisID: scaleID,
				data: [150, 0, 0, -100, -10, 9]
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.stacked = true; // enable scale stacked mode

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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
		expect(scale.min).toBe(-105);
		expect(scale.max).toBe(160);
	});

	it('Should ensure that the scale has a max and min that are not equal', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: []
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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
		expect(scale.min).toBe(-1);
		expect(scale.max).toBe(1);
	});

	it('Should use the suggestedMin and suggestedMax options', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [1, 1, 1, 2, 1, 0]
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.ticks.suggestedMin = -10;
		config.ticks.suggestedMax = 10;

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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
		expect(scale.min).toBe(-10);
		expect(scale.max).toBe(10);
	});

	it('Should use the min and max options', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [1, 1, 1, 2, 1, 0]
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.ticks.min = -1010;
		config.ticks.max = 1010;

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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
		expect(scale.min).toBe(-1010);
		expect(scale.max).toBe(1010);
		expect(scale.ticks[0]).toBe(1010);
		expect(scale.ticks[scale.ticks.length - 1]).toBe(-1010);
	});

	it('should forcibly include 0 in the range if the beginAtZero option is used', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [20, 30, 40, 50]
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));


		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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
		expect(scale.ticks).toEqual([50, 45, 40, 35, 30, 25, 20]);

		config.ticks.beginAtZero = true;
		scale.determineDataLimits();
		scale.buildTicks();
		expect(scale.ticks).toEqual([50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0]);

		mockData.datasets[0].data = [-20, -30, -40, -50];
		scale.determineDataLimits();
		scale.buildTicks();
		expect(scale.ticks).toEqual([0, -5, -10, -15, -20, -25, -30, -35, -40, -45, -50]);

		config.ticks.beginAtZero = false;
		scale.determineDataLimits();
		scale.buildTicks();
		expect(scale.ticks).toEqual([-20, -25, -30, -35, -40, -45, -50]);
	});

	it('Should generate tick marks', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}, ]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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
		expect(scale.ticks).toEqual([80, 70, 60, 50, 40, 30, 20, 10, 0]);
		expect(scale.start).toBe(0);
		expect(scale.end).toBe(80);
	});

	it('Should generate tick marks in the correct order in reversed mode', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}, ]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.ticks.reverse = true;
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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

		// Reverse mode makes this count up
		expect(scale.ticks).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80]);
		expect(scale.start).toBe(80);
		expect(scale.end).toBe(0);
	});

	it('Should build labels using the default template', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}, ]
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// Set arbitrary width and height for now
		scale.update(50, 400);
		expect(scale.ticks).toEqual(['80', '70', '60', '50', '40', '30', '20', '10', '0']);
	});

	it('should use the correct number of decimal places in the default format function', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [0.06, 0.005, 0, 0.025, 0.0078]
			}, ]
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// Set arbitrary width and height for now
		scale.update(50, 400);
		expect(scale.ticks).toEqual(['0.06', '0.05', '0.04', '0.03', '0.02', '0.01', '0']);
	});

	it('Should build labels using the user supplied callback', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}, ]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.ticks.callback = function(value, index) {
			return index.toString();
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
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
		expect(scale.ticks).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
	});

	it('Should get the correct pixel value for a point', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: []
			}]
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// Update
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

		expect(verticalScale.getPixelForValue(1, 0, 0)).toBe(5); // top + paddingTop
		expect(verticalScale.getPixelForValue(-1, 0, 0)).toBe(105); // bottom - paddingBottom
		expect(verticalScale.getPixelForValue(0, 0, 0)).toBe(55); // halfway

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

		// Range expands to [-2, 2] due to nicenum algorithm
		expect(horizontalScale.getPixelForValue(2, 0, 0)).toBe(105); // right - paddingRight
		expect(horizontalScale.getPixelForValue(-2, 0, 0)).toBe(5); // left + paddingLeft
		expect(horizontalScale.getPixelForValue(0, 0, 0)).toBe(55); // halfway
	});

	it('should fit correctly', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [-5, 0, 2, -3, 5]
			}]
		};
		var mockContext = window.createMockContext();

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		var minSize = verticalScale.update(100, 300);
		expect(minSize).toEqual({
			width: 40,
			height: 300,
		});
		expect(verticalScale.width).toBe(40);
		expect(verticalScale.height).toBe(300);
		expect(verticalScale.paddingTop).toBe(6);
		expect(verticalScale.paddingBottom).toBe(6);
		expect(verticalScale.paddingLeft).toBe(0);
		expect(verticalScale.paddingRight).toBe(0);

		// Refit with margins to see the padding go away
		minSize = verticalScale.update(30, 300, {
			left: 0,
			right: 0,
			top: 15,
			bottom: 3
		});
		expect(minSize).toEqual({
			width: 30,
			height: 300,
		});
		expect(verticalScale.paddingTop).toBe(0);
		expect(verticalScale.paddingBottom).toBe(3);
		expect(verticalScale.paddingLeft).toBe(0);
		expect(verticalScale.paddingRight).toBe(0);

		// Extra size when scale label showing
		config.scaleLabel.display = true;
		minSize = verticalScale.update(100, 300);
		expect(minSize).toEqual({
			width: 58,
			height: 300,
		});
	});

	it('should fit correctly when horizontal', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [-5, 0, 2, -3, 5]
			}]
		};
		var mockContext = window.createMockContext();

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.position = "bottom";
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var horizontalScale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		var minSize = horizontalScale.update(200, 300);
		expect(minSize).toEqual({
			width: 200,
			height: 28,
		});
		expect(horizontalScale.width).toBe(200);
		expect(horizontalScale.height).toBe(28);
		expect(horizontalScale.paddingTop).toBe(0);
		expect(horizontalScale.paddingBottom).toBe(0);
		expect(horizontalScale.paddingLeft).toBe(13);
		expect(horizontalScale.paddingRight).toBe(8);
		expect(horizontalScale.labelRotation).toBe(0);

		// Refit with margins to see the padding go away
		minSize = horizontalScale.update(200, 28, {
			left: 10,
			right: 6,
			top: 15,
			bottom: 3
		});
		expect(minSize).toEqual({
			width: 200,
			height: 28,
		});
		expect(horizontalScale.paddingTop).toBe(0);
		expect(horizontalScale.paddingBottom).toBe(0);
		expect(horizontalScale.paddingLeft).toBe(3);
		expect(horizontalScale.paddingRight).toBe(2);

		// Extra size when scale label showing
		config.scaleLabel.display = true;
		minSize = horizontalScale.update(200, 300);
		expect(minSize).toEqual({
			width: 200,
			height: 46,
		});
	});

	it('Should draw correctly horizontally', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [-5, 0, 2, -3, 5]
			}]
		};
		var mockContext = window.createMockContext();

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.position = "bottom";
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var horizontalScale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		var minSize = horizontalScale.update(200, 300);
		minSize = horizontalScale.update(200, 28, {
			left: 10,
			right: 6,
			top: 15,
			bottom: 3
		});

		horizontalScale.left = 0;
		horizontalScale.right = minSize.width;
		horizontalScale.top = 100;
		horizontalScale.bottom = 100 + minSize.height;

		var chartArea = {
			top: 0,
			bottom: 100,
			left: 0,
			right: minSize.width
		};
		mockContext.resetCalls();
		horizontalScale.draw(chartArea);

		var expected = [{
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [3.5, 100]
		}, {
			"name": "lineTo",
			"args": [3.5, 110]
		}, {
			"name": "moveTo",
			"args": [3.5, 0]
		}, {
			"name": "lineTo",
			"args": [3.5, 100]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [3, 110]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["-5", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0,0,0,0.25)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [101.5, 100]
		}, {
			"name": "lineTo",
			"args": [101.5, 110]
		}, {
			"name": "moveTo",
			"args": [101.5, 0]
		}, {
			"name": "lineTo",
			"args": [101.5, 100]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [101, 110]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["0", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [198.5, 100]
		}, {
			"name": "lineTo",
			"args": [198.5, 110]
		}, {
			"name": "moveTo",
			"args": [198.5, 0]
		}, {
			"name": "lineTo",
			"args": [198.5, 100]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [198, 110]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["5", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [0, 100.5]
		}, {
			"name": "lineTo",
			"args": [200, 100.5]
		}, {
			"name": "stroke",
			"args": []
		}];
		expect(mockContext.getCalls()).toEqual(expected);

		// Turn off some drawing
		config.gridLines.drawTicks = false;
		config.gridLines.drawOnChartArea = false;
		config.ticks.display = false;
		config.scaleLabel.display = true;
		config.scaleLabel.labelString = 'myLabel';

		mockContext.resetCalls();

		horizontalScale.draw();
		expect(mockContext.getCalls()).toEqual([{
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0,0,0,0.25)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["myLabel", 100, 122]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [0, 100.5]
		}, {
			"name": "lineTo",
			"args": [200, 100.5]
		}, {
			"name": "stroke",
			"args": []
		}]);

		// Turn off display

		mockContext.resetCalls();
		config.display = false;
		horizontalScale.draw();
		expect(mockContext.getCalls()).toEqual([]);
	});

	it('Should draw correctly vertically', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [-5, 0, 2, -3, 5]
			}]
		};
		var mockContext = window.createMockContext();

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		var minSize = verticalScale.update(100, 300);
		minSize = verticalScale.update(30, 300, {
			left: 0,
			right: 0,
			top: 15,
			bottom: 3
		});
		expect(minSize).toEqual({
			width: 30,
			height: 300,
		});

		verticalScale.left = 0;
		verticalScale.right = minSize.width;
		verticalScale.top = 0;
		verticalScale.bottom = minSize.height;

		var chartArea = {
			top: 0,
			bottom: minSize.height,
			left: minSize.width,
			right: minSize.width + 100
		};

		mockContext.resetCalls();
		verticalScale.draw(chartArea);

		expect(mockContext.getCalls()).toEqual([{
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 0.5]
		}, {
			"name": "lineTo",
			"args": [30, 0.5]
		}, {
			"name": "moveTo",
			"args": [30, 0.5]
		}, {
			"name": "lineTo",
			"args": [130, 0.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 0]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["5", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 30.5]
		}, {
			"name": "lineTo",
			"args": [30, 30.5]
		}, {
			"name": "moveTo",
			"args": [30, 30.5]
		}, {
			"name": "lineTo",
			"args": [130, 30.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 30]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["4", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 59.5]
		}, {
			"name": "lineTo",
			"args": [30, 59.5]
		}, {
			"name": "moveTo",
			"args": [30, 59.5]
		}, {
			"name": "lineTo",
			"args": [130, 59.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 59]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["3", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 89.5]
		}, {
			"name": "lineTo",
			"args": [30, 89.5]
		}, {
			"name": "moveTo",
			"args": [30, 89.5]
		}, {
			"name": "lineTo",
			"args": [130, 89.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 89]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["2", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 119.5]
		}, {
			"name": "lineTo",
			"args": [30, 119.5]
		}, {
			"name": "moveTo",
			"args": [30, 119.5]
		}, {
			"name": "lineTo",
			"args": [130, 119.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 119]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["1", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0,0,0,0.25)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 149.5]
		}, {
			"name": "lineTo",
			"args": [30, 149.5]
		}, {
			"name": "moveTo",
			"args": [30, 149.5]
		}, {
			"name": "lineTo",
			"args": [130, 149.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 149]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["0", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 178.5]
		}, {
			"name": "lineTo",
			"args": [30, 178.5]
		}, {
			"name": "moveTo",
			"args": [30, 178.5]
		}, {
			"name": "lineTo",
			"args": [130, 178.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 178]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["-1", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 208.5]
		}, {
			"name": "lineTo",
			"args": [30, 208.5]
		}, {
			"name": "moveTo",
			"args": [30, 208.5]
		}, {
			"name": "lineTo",
			"args": [130, 208.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 208]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["-2", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 238.5]
		}, {
			"name": "lineTo",
			"args": [30, 238.5]
		}, {
			"name": "moveTo",
			"args": [30, 238.5]
		}, {
			"name": "lineTo",
			"args": [130, 238.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 238]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["-3", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 267.5]
		}, {
			"name": "lineTo",
			"args": [30, 267.5]
		}, {
			"name": "moveTo",
			"args": [30, 267.5]
		}, {
			"name": "lineTo",
			"args": [130, 267.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 267]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["-4", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 297.5]
		}, {
			"name": "lineTo",
			"args": [30, 297.5]
		}, {
			"name": "moveTo",
			"args": [30, 297.5]
		}, {
			"name": "lineTo",
			"args": [130, 297.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 297]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["-5", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [30.5, 0]
		}, {
			"name": "lineTo",
			"args": [30.5, 300]
		}, {
			"name": "stroke",
			"args": []
		}]);

		// Turn off some drawing
		config.gridLines.drawTicks = false;
		config.gridLines.drawOnChartArea = false;
		config.ticks.display = false;
		config.scaleLabel.display = true;

		mockContext.resetCalls();

		verticalScale.draw();
		expect(mockContext.getCalls()).toEqual([{
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0,0,0,0.25)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [6, 150]
		}, {
			"name": "rotate",
			"args": [-1.5707963267948966]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [30.5, 0]
		}, {
			"name": "lineTo",
			"args": [30.5, 300]
		}, {
			"name": "stroke",
			"args": []
		}]);
	});

	it("should not draw lines where the callback function returned null or undefined", function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [-5, 0, 2, -3, 5]
			}]
		};
		var mockContext = window.createMockContext();

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.ticks.callback = function(tickValue, index) {
			return index % 2 === 0 ? null : tickValue.toString();
		};
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		var minSize = verticalScale.update(100, 300);
		minSize = verticalScale.update(30, 300, {
			left: 0,
			right: 0,
			top: 15,
			bottom: 3
		});
		expect(minSize).toEqual({
			width: 30,
			height: 300,
		});

		verticalScale.left = 0;
		verticalScale.right = minSize.width;
		verticalScale.top = 0;
		verticalScale.bottom = minSize.height;

		var chartArea = {
			top: 0,
			bottom: minSize.height,
			left: minSize.width,
			right: minSize.width + 100
		};

		mockContext.resetCalls();
		verticalScale.draw(chartArea);

		expect(mockContext.getCalls()).toEqual([{
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 30.5]
		}, {
			"name": "lineTo",
			"args": [30, 30.5]
		}, {
			"name": "moveTo",
			"args": [30, 30.5]
		}, {
			"name": "lineTo",
			"args": [130, 30.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 30]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["4", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 89.5]
		}, {
			"name": "lineTo",
			"args": [30, 89.5]
		}, {
			"name": "moveTo",
			"args": [30, 89.5]
		}, {
			"name": "lineTo",
			"args": [130, 89.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 89]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["2", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0,0,0,0.25)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 149.5]
		}, {
			"name": "lineTo",
			"args": [30, 149.5]
		}, {
			"name": "moveTo",
			"args": [30, 149.5]
		}, {
			"name": "lineTo",
			"args": [130, 149.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 149]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["0", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 208.5]
		}, {
			"name": "lineTo",
			"args": [30, 208.5]
		}, {
			"name": "moveTo",
			"args": [30, 208.5]
		}, {
			"name": "lineTo",
			"args": [130, 208.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 208]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["-2", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [25, 267.5]
		}, {
			"name": "lineTo",
			"args": [30, 267.5]
		}, {
			"name": "moveTo",
			"args": [30, 267.5]
		}, {
			"name": "lineTo",
			"args": [130, 267.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "translate",
			"args": [20, 267]
		}, {
			"name": "rotate",
			"args": [-0]
		}, {
			"name": "fillText",
			"args": ["-4", 0, 0]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [30.5, 0]
		}, {
			"name": "lineTo",
			"args": [30.5, 300]
		}, {
			"name": "stroke",
			"args": []
		}])
	});
});