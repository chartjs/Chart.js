describe('Linear Scale', function() {

	it ('Should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it ('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('linear');
		expect(defaultConfig).toEqual({
			display: true,
			position: "left",
			gridLines: {
				show: true,
				color: "rgba(0, 0, 0, 0.1)",
				lineWidth: 1,
				drawOnChartArea: true,
				drawTicks: true, // draw ticks extending towards the label
				zeroLineWidth: 1,
				zeroLineColor: "rgba(0,0,0,0.25)",
			},
			reverse: false,
			beginAtZero: false,
			override: null,
			labels: {
				show: true,
				mirror: false,
				padding: 10,
				template: "<%=value.toLocaleString()%>",
				fontSize: 12,
				fontStyle: "normal",
				fontColor: "#666",
				fontFamily: "Helvetica Neue"
			}
		});
	});

	it ('Should correctly determine the max & min data values', function() {
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
				}
			]
		};

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: Chart.scaleService.getScaleDefaults('linear'), // use default config for scale
			data: mockData,
			id: scaleID
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		scale.calculateRange();
		expect(scale.min).toBe(-100);
		expect(scale.max).toBe(150);
	});

	it ('Should correctly determine the max & min for scatter data', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [{x: 10, y: 100}, {x: -10, y: 0}, {x: 0, y: 0}, {x: 99, y: 7}]
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		verticalScale.calculateRange();
		expect(verticalScale.min).toBe(0);
		expect(verticalScale.max).toBe(100);

		var horizontalConfig = Chart.helpers.clone(config);
		horizontalConfig.position = 'bottom';
		var horizontalScale = new Constructor({
			ctx: {},
			options: horizontalConfig,
			data: mockData,
			id: scaleID,
		});

		horizontalScale.calculateRange();
		expect(horizontalScale.min).toBe(-10);
		expect(horizontalScale.max).toBe(99);
	});

	it ('Should correctly determine the min and max data values when stacked mode is turned on', function() {
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
				}
			]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.stacked = true; // enable scale stacked mode

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		scale.calculateRange();
		expect(scale.min).toBe(-105);
		expect(scale.max).toBe(160);
	});

	it ('Should ensure that the scale has a max and min that are not equal', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: []
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		scale.calculateRange();
		expect(scale.min).toBe(-1);
		expect(scale.max).toBe(1);
	});

	it ('Should generate tick marks', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
					yAxisID: scaleID,
					data: [10, 5, 0, 25, 78]
				},
			]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		scale.calculateRange();

		expect(scale.ticks).toBe(undefined); // not set

		// Large enough to be unimportant
		var maxWidth = 400;
		var maxHeight = 400; 
		scale.generateTicks(maxWidth, maxHeight);

		// Counts down because the lines are drawn top to bottom
		expect(scale.ticks).toEqual([80, 70, 60, 50, 40, 30, 20, 10, 0]);
		expect(scale.start).toBe(0);
		expect(scale.end).toBe(80);
	});

	it ('Should generate tick marks in the correct order in reversed mode', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
					yAxisID: scaleID,
					data: [10, 5, 0, 25, 78]
				},
			]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.reverse = true;
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		scale.calculateRange();

		expect(scale.ticks).toBe(undefined); // not set

		// Large enough to be unimportant
		var maxWidth = 400;
		var maxHeight = 400; 
		scale.generateTicks(maxWidth, maxHeight);

		// Reverse mode makes this count up
		expect(scale.ticks).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80]);
		expect(scale.start).toBe(80);
		expect(scale.end).toBe(0);
	});

	it ('Should generate tick marks using the user supplied options', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
					yAxisID: scaleID,
					data: [10, 5, 0, 25, 78]
				},
			]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.override = {
			steps: 10,
			start: 0,
			stepWidth: 10
		};

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		scale.calculateRange();

		// Large enough to be unimportant
		var maxWidth = 400;
		var maxHeight = 400; 
		scale.generateTicks(maxWidth, maxHeight);

		expect(scale.ticks).toEqual([100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]);
		expect(scale.start).toBe(0);
		expect(scale.end).toBe(100);
	});

	it ('Should build labels using the default template', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
					yAxisID: scaleID,
					data: [10, 5, 0, 25, 78]
				},
			]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		scale.calculateRange();

		// Large enough to be unimportant
		var maxWidth = 400;
		var maxHeight = 400; 
		scale.generateTicks(maxWidth, maxHeight);

		// Generate labels
		scale.buildLabels();

		expect(scale.labels).toEqual(['80', '70', '60', '50', '40', '30', '20', '10', '0']);
	});

	it ('Should build labels using the user supplied callback', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
					yAxisID: scaleID,
					data: [10, 5, 0, 25, 78]
				},
			]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		config.labels.userCallback = function(value, index) {
			return index.toString();
		};

		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		scale.calculateRange();

		// Large enough to be unimportant
		var maxWidth = 400;
		var maxHeight = 400; 
		scale.generateTicks(maxWidth, maxHeight);

		// Generate labels
		scale.buildLabels();

		// Just the index
		expect(scale.labels).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
	});

	it ('Should get the correct pixel value for a point', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: []
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		var verticalScale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		verticalScale.calculateRange();
		verticalScale.generateTicks(50, 100);

		// Fake out positioning of the scale service
		verticalScale.left = 0;
		verticalScale.top = 0;
		verticalScale.right = 50;
		verticalScale.bottom = 110;
		verticalScale.paddingTop = 5;
		verticalScale.paddingBottom = 5;
		verticalScale.width = 50;
		verticalScale.height = 110;

		expect(verticalScale.getPointPixelForValue(1, 0, 0)).toBe(5); // top + paddingTop
		expect(verticalScale.getPointPixelForValue(-1, 0, 0)).toBe(105); // bottom - paddingBottom
		expect(verticalScale.getPointPixelForValue(0, 0, 0)).toBe(55); // halfway

		var horizontalConfig = Chart.helpers.clone(config);
		horizontalConfig.position = 'bottom';
		var horizontalScale = new Constructor({
			ctx: {},
			options: horizontalConfig,
			data: mockData,
			id: scaleID,
		});

		horizontalScale.calculateRange();
		horizontalScale.generateTicks(100, 50);

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
		expect(horizontalScale.getPointPixelForValue(2, 0, 0)).toBe(105); // right - paddingRight
		expect(horizontalScale.getPointPixelForValue(-2, 0, 0)).toBe(5); // left + paddingLeft
		expect(horizontalScale.getPointPixelForValue(0, 0, 0)).toBe(55); // halfway
	});
});