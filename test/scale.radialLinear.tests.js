// Tests for the radial linear scale used by the polar area and radar charts
describe('Test the radial linear scale', function() {
	it('Should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('radialLinear');
		expect(defaultConfig).toEqual({
			display: true,
			animate: true,
			lineArc: false,
			gridLines: {
				show: true,
				color: "rgba(0, 0, 0, 0.1)",
				lineWidth: 1,
			},
			angleLines: {
				show: true,
				color: "rgba(0,0,0, 0.1)",
				lineWidth: 1
			},
			reverse: false,
			beginAtZero: true,
			labels: {
				show: true,
				template: "<%=value.toLocaleString()%>",
				fontSize: 12,
				fontStyle: "normal",
				fontColor: "#666",
				fontFamily: "Helvetica Neue",
				showLabelBackdrop: true,
				backdropColor: "rgba(255,255,255,0.75)",
				backdropPaddingY: 2,
				backdropPaddingX: 2,
			},
			pointLabels: {
				fontFamily: "'Arial'",
				fontStyle: "normal",
				fontSize: 10,
				fontColor: "#666",
			},
		});
	});

	it('Should correctly determine the max & min data values', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, -5, 78, -100]
			}, {
				yAxisID: scaleID,
				data: [150]
			}],
			labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
		};

		var chart = {
			width: 200,
			height: 300,
		};

		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: {},
			options: Chart.scaleService.getScaleDefaults('radialLinear'), // use default config for scale
			data: mockData,
			id: scaleID,
			chart: chart,
		});

		expect(scale).not.toEqual(undefined); // must construct
		expect(scale.min).toBe(undefined); // not yet set
		expect(scale.max).toBe(undefined);

		scale.calculateRange();
		expect(scale.min).toBe(-100);
		expect(scale.max).toBe(150);
	});

	it('Should ensure that the scale has a max and min that are not equal', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: []
		};

		var chart = {
			width: 200,
			height: 300,
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID,
			chart: chart
		});

		scale.calculateRange();
		expect(scale.min).toBe(-1);
		expect(scale.max).toBe(1);
	});

	it('should forcibly include 0 in the range if the beginAtZero option is used', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [20, 30, 40, 50]
			}]
		};

		var chart = {
			width: 200,
			height: 300,
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID,
			chart: chart
		});

		config.beginAtZero = false;
		scale.calculateRange();
		scale.generateTicks(400, 400);
		expect(scale.ticks).toEqual([20, 30, 40, 50]);

		config.beginAtZero = true;
		scale.calculateRange();
		scale.generateTicks(400, 400);
		expect(scale.ticks).toEqual([0, 10, 20, 30, 40, 50]);

		mockData.datasets[0].data = [-20, -30, -40, -50];
		scale.calculateRange();
		scale.generateTicks(400, 400);
		expect(scale.ticks).toEqual([-50, -40, -30, -20, -10, 0]);

		config.beginAtZero = false;
		scale.calculateRange();
		scale.generateTicks(400, 400);
		expect(scale.ticks).toEqual([-50, -40, -30, -20]);
	});

	it('Should generate tick marks', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}, ]
		};

		var chart = {
			width: 200,
			height: 300,
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID,
			chart: chart
		});

		scale.calculateRange();
		expect(scale.ticks).toBe(undefined); // not set
		scale.generateTicks();

		// lines drawn from inside out
		expect(scale.ticks).toEqual([0, 20, 40, 60, 80]);
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

		var chart = {
			width: 200,
			height: 300,
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		config.reverse = true;
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID,
			chart: chart
		});

		scale.calculateRange();
		expect(scale.ticks).toBe(undefined); // not set
		scale.generateTicks();

		// Reverse mode makes this count up
		expect(scale.ticks).toEqual([80, 60, 40, 20, 0]);
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

		var chart = {
			width: 200,
			height: 300,
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID,
			chart: chart
		});

		scale.calculateRange();
		scale.generateTicks();

		// Generate labels
		scale.buildYLabels();
		expect(scale.yLabels).toEqual(['0', '20', '40', '60', '80']);
	});

	it('Should build labels using the user supplied callback', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}, ]
		};

		var chart = {
			width: 200,
			height: 300,
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		config.labels.userCallback = function(value, index) {
			return index.toString();
		};

		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID,
			chart: chart,
		});

		scale.calculateRange();
		scale.generateTicks();

		// Generate labels
		scale.buildYLabels();

		// Just the index
		expect(scale.yLabels).toEqual(['0', '1', '2', '3', '4']);
	});

	it('should correctly set the center point', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}, ],
			labels: ['point1', 'point2', 'point3', 'point4', 'point5'] // used in radar charts which use the same scales
		};

		var chart = {
			width: 200,
			height: 300,
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			data: mockData,
			id: scaleID,
			chart: chart,
		});

		scale.calculateRange();
		scale.generateTicks();

		// Generate labels
		scale.buildYLabels();

		scale.setScaleSize();

		expect(scale.drawingArea).toBe(36.33099108490252);
		expect(scale.xCenter).toBe(99.52981323656317);
		expect(scale.yCenter).toBe(150);
	});

	it('should get the correct distance from the center point', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['point1', 'point2', 'point3', 'point4', 'point5'] // used in radar charts which use the same scales
		};

		var chart = {
			width: 200,
			height: 300,
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: {},
			options: config,
			data: mockData,
			id: scaleID,
			chart: chart
		});

		scale.calculateRange();
		scale.generateTicks();

		scale.xCenter = 100;
		scale.yCenter = 150;

		expect(scale.getDistanceFromCenterForValue(scale.min)).toBe(0);
		expect(scale.getDistanceFromCenterForValue(scale.max)).toBe(92);
		expect(scale.getPointPositionForValue(1, 5)).toEqual({
			x: 105.46857496869713,
			y: 148.22315228234405,
		});

		config.reverse = true;

		scale.calculateRange();
		scale.generateTicks();

		scale.xCenter = 100;
		scale.yCenter = 150;

		expect(scale.getDistanceFromCenterForValue(scale.min)).toBe(92);
		expect(scale.getDistanceFromCenterForValue(scale.max)).toBe(0);
	});

	it('should draw correctly when there are no point labels', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}, ],
			labels: ['point1', 'point2', 'point3', 'point4', 'point5'] // used in radar charts which use the same scales
		};

		var chart = {
			width: 200,
			height: 300,
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		config.lineArc = true;
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			data: mockData,
			id: scaleID,
			chart: chart,
		});

		scale.calculateRange();
		scale.generateTicks();

		// Generate labels
		scale.buildYLabels();

		scale.draw();

		var expected = [{
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [100, 150, 23, 0, 6.283185307179586]
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "measureText",
			"args": ["20"]
		}, {
			"name": "setFillStyle",
			"args": ["rgba(255,255,255,0.75)"]
		}, {
			"name": "fillRect",
			"args": [88, 119, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["20", 100, 127]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [100, 150, 46, 0, 6.283185307179586]
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "measureText",
			"args": ["40"]
		}, {
			"name": "setFillStyle",
			"args": ["rgba(255,255,255,0.75)"]
		}, {
			"name": "fillRect",
			"args": [88, 96, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["40", 100, 104]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [100, 150, 69, 0, 6.283185307179586]
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "measureText",
			"args": ["60"]
		}, {
			"name": "setFillStyle",
			"args": ["rgba(255,255,255,0.75)"]
		}, {
			"name": "fillRect",
			"args": [88, 73, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["60", 100, 81]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "arc",
			"args": [100, 150, 92, 0, 6.283185307179586]
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "measureText",
			"args": ["80"]
		}, {
			"name": "setFillStyle",
			"args": ["rgba(255,255,255,0.75)"]
		}, {
			"name": "fillRect",
			"args": [88, 50, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["80", 100, 58]
		}];
		expect(mockContext.getCalls()).toEqual(expected);

		mockContext.resetCalls();
		config.lineArc = false;
		scale.draw();

		expect(mockContext.getCalls()).toEqual([{
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 127]
		}, {
			"name": "lineTo",
			"args": [121.87429987478853, 142.8926091293762]
		}, {
			"name": "lineTo",
			"args": [113.51906080272688, 168.6073908706238]
		}, {
			"name": "lineTo",
			"args": [86.48093919727312, 168.6073908706238]
		}, {
			"name": "lineTo",
			"args": [78.12570012521147, 142.8926091293762]
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "measureText",
			"args": ["20"]
		}, {
			"name": "setFillStyle",
			"args": ["rgba(255,255,255,0.75)"]
		}, {
			"name": "fillRect",
			"args": [88, 119, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["20", 100, 127]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 104]
		}, {
			"name": "lineTo",
			"args": [143.74859974957707, 135.78521825875242]
		}, {
			"name": "lineTo",
			"args": [127.03812160545377, 187.21478174124758]
		}, {
			"name": "lineTo",
			"args": [72.96187839454623, 187.21478174124758]
		}, {
			"name": "lineTo",
			"args": [56.25140025042293, 135.78521825875242]
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "measureText",
			"args": ["40"]
		}, {
			"name": "setFillStyle",
			"args": ["rgba(255,255,255,0.75)"]
		}, {
			"name": "fillRect",
			"args": [88, 96, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["40", 100, 104]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 81]
		}, {
			"name": "lineTo",
			"args": [165.62289962436557, 128.67782738812863]
		}, {
			"name": "lineTo",
			"args": [140.55718240818064, 205.82217261187137]
		}, {
			"name": "lineTo",
			"args": [59.44281759181936, 205.82217261187137]
		}, {
			"name": "lineTo",
			"args": [34.3771003756344, 128.67782738812863]
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "measureText",
			"args": ["60"]
		}, {
			"name": "setFillStyle",
			"args": ["rgba(255,255,255,0.75)"]
		}, {
			"name": "fillRect",
			"args": [88, 73, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["60", 100, 81]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0, 0, 0, 0.1)"]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 58]
		}, {
			"name": "lineTo",
			"args": [187.49719949915414, 121.57043651750485]
		}, {
			"name": "lineTo",
			"args": [154.07624321090753, 224.42956348249515]
		}, {
			"name": "lineTo",
			"args": [45.92375678909248, 224.42956348249515]
		}, {
			"name": "lineTo",
			"args": [12.502800500845865, 121.57043651750485]
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "measureText",
			"args": ["80"]
		}, {
			"name": "setFillStyle",
			"args": ["rgba(255,255,255,0.75)"]
		}, {
			"name": "fillRect",
			"args": [88, 50, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["80", 100, 58]
		}, {
			"name": "setLineWidth",
			"args": [1]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0,0,0, 0.1)"]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [12.502800500845865, 121.57043651750485]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["point5", 7.747517919370097, 120.02535154563012]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [45.92375678909248, 224.42956348249515]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["point4", 42.984830527630116, 228.4746484543699]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [154.07624321090753, 224.42956348249515]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["point3", 157.0151694723699, 228.4746484543699]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [187.49719949915414, 121.57043651750485]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["point2", 192.25248208062987, 120.0253515456301]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [100, 58]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "closePath",
			"args": []
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["point1", 100, 53]
		}]);
	});
});