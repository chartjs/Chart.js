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
				color: "rgba(0, 0, 0, 0.1)",
				drawOnChartArea: true,
				drawTicks: true, // draw ticks extending towards the label
				tickMarkLength: 10,
				lineWidth: 1,
				offsetGridLines: false,
				display: true,
				zeroLineColor: "rgba(0,0,0,0.25)",
				zeroLineWidth: 1
			},
			position: "bottom",
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
				callback: defaultConfig.ticks.callback,  // make this nicer, then check explicitly below
				autoSkip: true,
				autoSkipPadding: 0,
				labelOffset: 0
			}
		});

		// Is this actually a function
		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
	});

	it('Should generate ticks from the data labales', function() {
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
		scale.buildTicks();
		expect(scale.ticks).toEqual(mockData.labels);
	});

	it ('should get the correct label for the index', function() {
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
		scale.buildTicks();

		expect(scale.getLabelForIndex(1)).toBe('tick2');
	});

	it ('Should get the correct pixel for a value when horizontal', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		config.gridLines.offsetGridLines = true;
		var Constructor = Chart.scaleService.getScaleConstructor('category');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		var minSize = scale.update(600, 100);

		expect(scale.width).toBe(600);
		expect(scale.height).toBe(28);
		expect(scale.paddingTop).toBe(0);
		expect(scale.paddingBottom).toBe(0);
		expect(scale.paddingLeft).toBe(28);
		expect(scale.paddingRight).toBe(48);
		expect(scale.labelRotation).toBe(0);

		expect(minSize).toEqual({
			width: 600,
			height: 28,
		});

		scale.left = 5;
		scale.top = 5;
		scale.right = 605;
		scale.bottom = 33;

		expect(scale.getPixelForValue(0, 0, 0, false)).toBe(33);
		expect(scale.getPixelForValue(0, 0, 0, true)).toBe(85);
		expect(scale.getValueForPixel(33)).toBe(0);
		expect(scale.getValueForPixel(85)).toBe(0);

		expect(scale.getPixelForValue(0, 4, 0, false)).toBe(452);
		expect(scale.getPixelForValue(0, 4, 0, true)).toBe(505);
		expect(scale.getValueForPixel(452)).toBe(4);
		expect(scale.getValueForPixel(505)).toBe(4);

		config.gridLines.offsetGridLines = false;

		expect(scale.getPixelForValue(0, 0, 0, false)).toBe(33);
		expect(scale.getPixelForValue(0, 0, 0, true)).toBe(33);
		expect(scale.getValueForPixel(33)).toBe(0);

		expect(scale.getPixelForValue(0, 4, 0, false)).toBe(557);
		expect(scale.getPixelForValue(0, 4, 0, true)).toBe(557);
		expect(scale.getValueForPixel(557)).toBe(4);
	});

	it ('Should get the correct pixel for a value when horizontal and zoomed', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		config.gridLines.offsetGridLines = true;
		config.ticks.min = "tick2";
		config.ticks.max = "tick4";

		var Constructor = Chart.scaleService.getScaleConstructor('category');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		var minSize = scale.update(600, 100);

		expect(scale.width).toBe(600);
		expect(scale.height).toBe(28);
		expect(scale.paddingTop).toBe(0);
		expect(scale.paddingBottom).toBe(0);
		expect(scale.paddingLeft).toBe(28);
		expect(scale.paddingRight).toBe(28);
		expect(scale.labelRotation).toBe(0);

		expect(minSize).toEqual({
			width: 600,
			height: 28,
		});

		scale.left = 5;
		scale.top = 5;
		scale.right = 605;
		scale.bottom = 33;

		expect(scale.getPixelForValue(0, 1, 0, false)).toBe(33);
		expect(scale.getPixelForValue(0, 1, 0, true)).toBe(124);

		expect(scale.getPixelForValue(0, 3, 0, false)).toBe(396);
		expect(scale.getPixelForValue(0, 3, 0, true)).toBe(486);

		config.gridLines.offsetGridLines = false;

		expect(scale.getPixelForValue(0, 1, 0, false)).toBe(33);
		expect(scale.getPixelForValue(0, 1, 0, true)).toBe(33);

		expect(scale.getPixelForValue(0, 3, 0, false)).toBe(577);
		expect(scale.getPixelForValue(0, 3, 0, true)).toBe(577);
	});

	it ('should get the correct pixel for a value when vertical', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		config.gridLines.offsetGridLines = true;
		config.position = "left";
		var Constructor = Chart.scaleService.getScaleConstructor('category');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		var minSize = scale.update(100, 200);

		expect(scale.width).toBe(100);
		expect(scale.height).toBe(200);
		expect(scale.paddingTop).toBe(6);
		expect(scale.paddingBottom).toBe(6);
		expect(scale.paddingLeft).toBe(0);
		expect(scale.paddingRight).toBe(0);
		expect(scale.labelRotation).toBe(0);

		expect(minSize).toEqual({
			width: 100,
			height: 200,
		});

		scale.left = 5;
		scale.top = 5;
		scale.right = 105;
		scale.bottom = 205;

		expect(scale.getPixelForValue(0, 0, 0, false)).toBe(11);
		expect(scale.getPixelForValue(0, 0, 0, true)).toBe(30);
		expect(scale.getValueForPixel(11)).toBe(0);
		expect(scale.getValueForPixel(30)).toBe(0);

		expect(scale.getPixelForValue(0, 4, 0, false)).toBe(161);
		expect(scale.getPixelForValue(0, 4, 0, true)).toBe(180);
		expect(scale.getValueForPixel(161)).toBe(4);

		config.gridLines.offsetGridLines = false;

		expect(scale.getPixelForValue(0, 0, 0, false)).toBe(11);
		expect(scale.getPixelForValue(0, 0, 0, true)).toBe(11);
		expect(scale.getValueForPixel(11)).toBe(0);

		expect(scale.getPixelForValue(0, 4, 0, false)).toBe(199);
		expect(scale.getPixelForValue(0, 4, 0, true)).toBe(199);
		expect(scale.getValueForPixel(199)).toBe(4);
	});

	it ('should get the correct pixel for a value when vertical and zoomed', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick_last']
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		config.gridLines.offsetGridLines = true;
		config.ticks.min = "tick2";
		config.ticks.max = "tick4";
		config.position = "left";

		var Constructor = Chart.scaleService.getScaleConstructor('category');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		var minSize = scale.update(100, 200);

		expect(scale.width).toBe(70);
		expect(scale.height).toBe(200);
		expect(scale.paddingTop).toBe(6);
		expect(scale.paddingBottom).toBe(6);
		expect(scale.paddingLeft).toBe(0);
		expect(scale.paddingRight).toBe(0);
		expect(scale.labelRotation).toBe(0);

		expect(minSize).toEqual({
			width: 70,
			height: 200,
		});

		scale.left = 5;
		scale.top = 5;
		scale.right = 75;
		scale.bottom = 205;

		expect(scale.getPixelForValue(0, 1, 0, false)).toBe(11);
		expect(scale.getPixelForValue(0, 1, 0, true)).toBe(42);

		expect(scale.getPixelForValue(0, 3, 0, false)).toBe(136);
		expect(scale.getPixelForValue(0, 3, 0, true)).toBe(168);

		config.gridLines.offsetGridLines = false;

		expect(scale.getPixelForValue(0, 1, 0, false)).toBe(11);
		expect(scale.getPixelForValue(0, 1, 0, true)).toBe(11);

		expect(scale.getPixelForValue(0, 3, 0, false)).toBe(199);
		expect(scale.getPixelForValue(0, 3, 0, true)).toBe(199);
	});
});
