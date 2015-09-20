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
			position: "left",
			gridLines: {
				show: true,
				color: "rgba(0, 0, 0, 0.1)",
				lineWidth: 1,
				drawOnChartArea: true,
				drawTicks: true,
				zeroLineWidth: 1,
				zeroLineColor: "rgba(0,0,0,0.25)",
			},
			scaleLabel: {
				fontColor: '#666',
				fontFamily: 'Helvetica Neue',
				fontSize: 12,
				fontStyle: 'normal',
				labelString: '',
				show: false,
			},
			reverse: false,
			override: null,
			labels: {
				show: true,
				mirror: false,
				padding: 10,
				template: "<%var remain = value / (Math.pow(10, Math.floor(Chart.helpers.log10(value))));if (remain === 1 || remain === 2 || remain === 5) {%><%=value.toExponential()%><%} else {%><%= null %><%}%>",
				fontSize: 12,
				fontStyle: "normal",
				fontColor: "#666",
				fontFamily: "Helvetica Neue"
			}
		});
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

		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: {},
			options: Chart.scaleService.getScaleDefaults('logarithmic'), // use default config for scale
			data: mockData,
			id: scaleID
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		scale.calculateRange();
		expect(scale.min).toBe(5);
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

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var verticalScale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		verticalScale.calculateRange();
		expect(verticalScale.min).toBe(6);
		expect(verticalScale.max).toBe(121);

		var horizontalConfig = Chart.helpers.clone(config);
		horizontalConfig.position = 'bottom';
		var horizontalScale = new Constructor({
			ctx: {},
			options: horizontalConfig,
			data: mockData,
			id: scaleID,
		});

		horizontalScale.calculateRange();
		expect(horizontalScale.min).toBe(2);
		expect(horizontalScale.max).toBe(99);
	});

	it('Should correctly determine the min and max data values when stacked mode is turned on', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 1, 5, 78, 100]
			}, {
				yAxisID: 'second scale',
				data: [-1000, 1000],
			}, {
				yAxisID: scaleID,
				data: [150, 10, 10, 100, 10, 9]
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		config.stacked = true; // enable scale stacked mode

		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		scale.calculateRange();
		expect(scale.min).toBe(11);
		expect(scale.max).toBe(160);
	});

	it('Should ensure that the scale has a max and min that are not equal', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: []
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID
		});

		scale.calculateRange();
		expect(scale.min).toBe(1);
		expect(scale.max).toBe(10);

		mockData.datasets = [{
			yAxisID: scaleID,
			data: [0.15, 0.15]
		}];

		scale.calculateRange();
		expect(scale.min).toBe(0.01);
		expect(scale.max).toBe(1);
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
		expect(scale.ticks).toEqual([100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
		expect(scale.start).toBe(1);
		expect(scale.end).toBe(100);
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
		config.reverse = true;

		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
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
		expect(scale.ticks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
		expect(scale.start).toBe(100);
		expect(scale.end).toBe(1);
	});

	it('Should generate tick marks using the user supplied options', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}, ]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		config.override = {
			steps: 9,
			start: 1,
			stepWidth: 1
		};

		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
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

		expect(scale.ticks).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
		expect(scale.start).toBe(1);
		expect(scale.end).toBe(10);
	});

	it('Should build labels using the default template', function() {
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

		expect(scale.labels).toEqual(['1e+2', '', '', '', '', '5e+1', '', '', '2e+1', '1e+1', '', '', '', '', '5e+0', '', '', '2e+0', '1e+0']);
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
		config.labels.userCallback = function(value, index) {
			return index.toString();
		};

		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
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
		expect(scale.labels).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18']);
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

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
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

		expect(verticalScale.getPointPixelForValue(100, 0, 0)).toBe(5); // top + paddingTop
		expect(verticalScale.getPointPixelForValue(1, 0, 0)).toBe(105); // bottom - paddingBottom
		expect(verticalScale.getPointPixelForValue(10, 0, 0)).toBe(55); // halfway

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
		expect(horizontalScale.getPointPixelForValue(100, 0, 0)).toBe(105); // right - paddingRight
		expect(horizontalScale.getPointPixelForValue(1, 0, 0)).toBe(5); // left + paddingLeft
		expect(horizontalScale.getPointPixelForValue(10, 0, 0)).toBe(55); // halfway
	});

	it('should get the correct pixel value for a bar', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [10, 5, 1, 25, 78]
			}]
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
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

		expect(verticalScale.calculateBarBase()).toBe(105); // bottom
		expect(verticalScale.calculateBarY(0, 3)).toBe(35.10299956639811); // bottom
	});

	it('should fit correctly', function() {
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
			data: mockData,
			id: scaleID
		});

		var minSize = verticalScale.fit(100, 300);
		expect(minSize).toEqual({
			width: 53,
			height: 300,
		});
		expect(verticalScale.width).toBe(53);
		expect(verticalScale.height).toBe(300);
		expect(verticalScale.paddingTop).toBe(6);
		expect(verticalScale.paddingBottom).toBe(6);
		expect(verticalScale.paddingLeft).toBe(0);
		expect(verticalScale.paddingRight).toBe(0);

		// Refit with margins to see the padding go away
		minSize = verticalScale.fit(53, 300, {
			left: 0,
			right: 0,
			top: 15,
			bottom: 3
		});
		expect(minSize).toEqual({
			width: 53,
			height: 300,
		});
		expect(verticalScale.paddingTop).toBe(0);
		expect(verticalScale.paddingBottom).toBe(3);
		expect(verticalScale.paddingLeft).toBe(0);
		expect(verticalScale.paddingRight).toBe(0);
	});

	it('should fit correctly when horizontal', function() {
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
		config.position = "bottom";
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var verticalScale = new Constructor({
			ctx: mockContext,
			options: config,
			data: mockData,
			id: scaleID
		});

		var minSize = verticalScale.fit(100, 300);
		expect(minSize).toEqual({
			width: 100,
			height: 28,
		});
		expect(verticalScale.width).toBe(100);
		expect(verticalScale.height).toBe(28);
		expect(verticalScale.paddingTop).toBe(0);
		expect(verticalScale.paddingBottom).toBe(0);
		expect(verticalScale.paddingLeft).toBe(20);
		expect(verticalScale.paddingRight).toBe(20);

		// Refit with margins to see the padding go away
		minSize = verticalScale.fit(100, 28, {
			left: 10,
			right: 6,
			top: 15,
			bottom: 3
		});
		expect(minSize).toEqual({
			width: 100,
			height: 28,
		});
		expect(verticalScale.paddingTop).toBe(0);
		expect(verticalScale.paddingBottom).toBe(0);
		expect(verticalScale.paddingLeft).toBe(10);
		expect(verticalScale.paddingRight).toBe(14);
	});

	it('should draw correctly horizontally', function() {
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
		config.position = "bottom";
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var horizontalScale = new Constructor({
			ctx: mockContext,
			options: config,
			data: mockData,
			id: scaleID
		});

		var minSize = horizontalScale.fit(100, 300);
		minSize = horizontalScale.fit(100, 28, {
			left: 10,
			right: 6,
			top: 15,
			bottom: 3
		});

		horizontalScale.left = 0;
		horizontalScale.right = minSize.width;
		horizontalScale.top = 0;
		horizontalScale.bottom = minSize.height;

		var chartArea = {
			top: 100,
			bottom: 0,
			left: 0,
			right: minSize.width
		};
		horizontalScale.draw(chartArea);

		expect(mockContext.getCalls()).toEqual([{
			"name": "measureText",
			"args": ["1e+0"]
		}, {
			"name": "measureText",
			"args": ["1e+2"]
		}, {
			"name": "measureText",
			"args": ["1e+0"]
		}, {
			"name": "measureText",
			"args": ["1e+2"]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
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
			"args": [10.5, 0]
		}, {
			"name": "lineTo",
			"args": [10.5, 5]
		}, {
			"name": "moveTo",
			"args": [10.5, 100]
		}, {
			"name": "lineTo",
			"args": [10.5, 0]
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
			"name": "moveTo",
			"args": [21.939139835231288, 0]
		}, {
			"name": "lineTo",
			"args": [21.939139835231288, 5]
		}, {
			"name": "moveTo",
			"args": [21.939139835231288, 100]
		}, {
			"name": "lineTo",
			"args": [21.939139835231288, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [28.63060767934717, 0]
		}, {
			"name": "lineTo",
			"args": [28.63060767934717, 5]
		}, {
			"name": "moveTo",
			"args": [28.63060767934717, 100]
		}, {
			"name": "lineTo",
			"args": [28.63060767934717, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [33.378279670462575, 0]
		}, {
			"name": "lineTo",
			"args": [33.378279670462575, 5]
		}, {
			"name": "moveTo",
			"args": [33.378279670462575, 100]
		}, {
			"name": "lineTo",
			"args": [33.378279670462575, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [37.06086016476871, 0]
		}, {
			"name": "lineTo",
			"args": [37.06086016476871, 5]
		}, {
			"name": "moveTo",
			"args": [37.06086016476871, 100]
		}, {
			"name": "lineTo",
			"args": [37.06086016476871, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [40.06974751457846, 0]
		}, {
			"name": "lineTo",
			"args": [40.06974751457846, 5]
		}, {
			"name": "moveTo",
			"args": [40.06974751457846, 100]
		}, {
			"name": "lineTo",
			"args": [40.06974751457846, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [42.613725520541756, 0]
		}, {
			"name": "lineTo",
			"args": [42.613725520541756, 5]
		}, {
			"name": "moveTo",
			"args": [42.613725520541756, 100]
		}, {
			"name": "lineTo",
			"args": [42.613725520541756, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [44.817419505693856, 0]
		}, {
			"name": "lineTo",
			"args": [44.817419505693856, 5]
		}, {
			"name": "moveTo",
			"args": [44.817419505693856, 100]
		}, {
			"name": "lineTo",
			"args": [44.817419505693856, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [46.76121535869434, 0]
		}, {
			"name": "lineTo",
			"args": [46.76121535869434, 5]
		}, {
			"name": "moveTo",
			"args": [46.76121535869434, 100]
		}, {
			"name": "lineTo",
			"args": [46.76121535869434, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [48.5, 0]
		}, {
			"name": "lineTo",
			"args": [48.5, 5]
		}, {
			"name": "moveTo",
			"args": [48.5, 100]
		}, {
			"name": "lineTo",
			"args": [48.5, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [59.93913983523129, 0]
		}, {
			"name": "lineTo",
			"args": [59.93913983523129, 5]
		}, {
			"name": "moveTo",
			"args": [59.93913983523129, 100]
		}, {
			"name": "lineTo",
			"args": [59.93913983523129, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [66.63060767934718, 0]
		}, {
			"name": "lineTo",
			"args": [66.63060767934718, 5]
		}, {
			"name": "moveTo",
			"args": [66.63060767934718, 100]
		}, {
			"name": "lineTo",
			"args": [66.63060767934718, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [71.37827967046258, 0]
		}, {
			"name": "lineTo",
			"args": [71.37827967046258, 5]
		}, {
			"name": "moveTo",
			"args": [71.37827967046258, 100]
		}, {
			"name": "lineTo",
			"args": [71.37827967046258, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [75.06086016476871, 0]
		}, {
			"name": "lineTo",
			"args": [75.06086016476871, 5]
		}, {
			"name": "moveTo",
			"args": [75.06086016476871, 100]
		}, {
			"name": "lineTo",
			"args": [75.06086016476871, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [78.06974751457845, 0]
		}, {
			"name": "lineTo",
			"args": [78.06974751457845, 5]
		}, {
			"name": "moveTo",
			"args": [78.06974751457845, 100]
		}, {
			"name": "lineTo",
			"args": [78.06974751457845, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [80.61372552054176, 0]
		}, {
			"name": "lineTo",
			"args": [80.61372552054176, 5]
		}, {
			"name": "moveTo",
			"args": [80.61372552054176, 100]
		}, {
			"name": "lineTo",
			"args": [80.61372552054176, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [82.81741950569385, 0]
		}, {
			"name": "lineTo",
			"args": [82.81741950569385, 5]
		}, {
			"name": "moveTo",
			"args": [82.81741950569385, 100]
		}, {
			"name": "lineTo",
			"args": [82.81741950569385, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [84.76121535869434, 0]
		}, {
			"name": "lineTo",
			"args": [84.76121535869434, 5]
		}, {
			"name": "moveTo",
			"args": [84.76121535869434, 100]
		}, {
			"name": "lineTo",
			"args": [84.76121535869434, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [86.5, 0]
		}, {
			"name": "lineTo",
			"args": [86.5, 5]
		}, {
			"name": "moveTo",
			"args": [86.5, 100]
		}, {
			"name": "lineTo",
			"args": [86.5, 0]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "fillText",
			"args": ["1e+0", 10, 10]
		}, {
			"name": "fillText",
			"args": ["2e+0", 21.439139835231288, 10]
		}, {
			"name": "fillText",
			"args": ["5e+0", 36.56086016476871, 10]
		}, {
			"name": "fillText",
			"args": ["1e+1", 48, 10]
		}, {
			"name": "fillText",
			"args": ["2e+1", 59.43913983523129, 10]
		}, {
			"name": "fillText",
			"args": ["5e+1", 74.56086016476871, 10]
		}, {
			"name": "fillText",
			"args": ["1e+2", 86, 10]
		}]);

		// Turn off some drawing
		config.gridLines.drawTicks = false;
		config.gridLines.drawOnChartArea = false;
		config.labels.show = false;

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
		}]);

		// Turn off display

		mockContext.resetCalls();
		config.display = false;
		horizontalScale.draw();
		expect(mockContext.getCalls()).toEqual([]);
	});

	it('should draw correctly vertically', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				xAxisID: scaleID, // for the horizontal scale
				yAxisID: scaleID,
				data: [10, 5, 1, 2.5, 7.8]
			}]
		};
		var mockContext = window.createMockContext();

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('logarithmic'));
		var Constructor = Chart.scaleService.getScaleConstructor('logarithmic');
		var verticalScale = new Constructor({
			ctx: mockContext,
			options: config,
			data: mockData,
			id: scaleID
		});

		var minSize = verticalScale.fit(100, 300);
		minSize = verticalScale.fit(33, 300, {
			left: 0,
			right: 0,
			top: 15,
			bottom: 3
		});
		expect(minSize).toEqual({
			width: 33,
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
		verticalScale.draw(chartArea);

		var expected = [{
			"name": "measureText",
			"args": ["1e+1"]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": ["5e+0"]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": ["2e+0"]
		}, {
			"name": "measureText",
			"args": ["1e+0"]
		}, {
			"name": "measureText",
			"args": ["1e+1"]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": ["5e+0"]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": [""]
		}, {
			"name": "measureText",
			"args": ["2e+0"]
		}, {
			"name": "measureText",
			"args": ["1e+0"]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
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
			"args": [28, 0.5]
		}, {
			"name": "lineTo",
			"args": [33, 0.5]
		}, {
			"name": "moveTo",
			"args": [33, 0.5]
		}, {
			"name": "lineTo",
			"args": [133, 0.5]
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
			"name": "moveTo",
			"args": [28, 14.089974696520528]
		}, {
			"name": "lineTo",
			"args": [33, 14.089974696520528]
		}, {
			"name": "moveTo",
			"args": [33, 14.089974696520528]
		}, {
			"name": "lineTo",
			"args": [133, 14.089974696520528]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [28, 29.28227386339279]
		}, {
			"name": "lineTo",
			"args": [33, 29.28227386339279]
		}, {
			"name": "moveTo",
			"args": [33, 29.28227386339279]
		}, {
			"name": "lineTo",
			"args": [133, 29.28227386339279]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [28, 46.50588211576573]
		}, {
			"name": "lineTo",
			"args": [33, 46.50588211576573]
		}, {
			"name": "moveTo",
			"args": [33, 46.50588211576573]
		}, {
			"name": "lineTo",
			"args": [133, 46.50588211576573]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [28, 66.38907863605783]
		}, {
			"name": "lineTo",
			"args": [33, 66.38907863605783]
		}, {
			"name": "moveTo",
			"args": [33, 66.38907863605783]
		}, {
			"name": "lineTo",
			"args": [133, 66.38907863605783]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [28, 89.9059087122024]
		}, {
			"name": "lineTo",
			"args": [33, 89.9059087122024]
		}, {
			"name": "moveTo",
			"args": [33, 89.9059087122024]
		}, {
			"name": "lineTo",
			"args": [133, 89.9059087122024]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [28, 118.68818257559516]
		}, {
			"name": "lineTo",
			"args": [33, 118.68818257559516]
		}, {
			"name": "moveTo",
			"args": [33, 118.68818257559516]
		}, {
			"name": "lineTo",
			"args": [133, 118.68818257559516]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [28, 155.79498734826026]
		}, {
			"name": "lineTo",
			"args": [33, 155.79498734826026]
		}, {
			"name": "moveTo",
			"args": [33, 155.79498734826026]
		}, {
			"name": "lineTo",
			"args": [133, 155.79498734826026]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [28, 208.0940912877976]
		}, {
			"name": "lineTo",
			"args": [33, 208.0940912877976]
		}, {
			"name": "moveTo",
			"args": [33, 208.0940912877976]
		}, {
			"name": "lineTo",
			"args": [133, 208.0940912877976]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [28, 297.5]
		}, {
			"name": "lineTo",
			"args": [33, 297.5]
		}, {
			"name": "moveTo",
			"args": [33, 297.5]
		}, {
			"name": "lineTo",
			"args": [133, 297.5]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "fillText",
			"args": ["1e+1", 23, 0]
		}, {
			"name": "fillText",
			"args": ["", 23, 13.589974696520528]
		}, {
			"name": "fillText",
			"args": ["", 23, 28.78227386339279]
		}, {
			"name": "fillText",
			"args": ["", 23, 46.00588211576573]
		}, {
			"name": "fillText",
			"args": ["", 23, 65.88907863605783]
		}, {
			"name": "fillText",
			"args": ["5e+0", 23, 89.4059087122024]
		}, {
			"name": "fillText",
			"args": ["", 23, 118.18818257559516]
		}, {
			"name": "fillText",
			"args": ["", 23, 155.29498734826026]
		}, {
			"name": "fillText",
			"args": ["2e+0", 23, 207.5940912877976]
		}, {
			"name": "fillText",
			"args": ["1e+0", 23, 297]
		}];
		expect(mockContext.getCalls()).toEqual(expected);

		// Turn off some drawing
		config.gridLines.drawTicks = false;
		config.gridLines.drawOnChartArea = false;
		config.labels.show = false;

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
		}]);
	});
});