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
			angleLines: {
				display: true,
				color: "rgba(0, 0, 0, 0.1)",
				lineWidth: 1
			},
			animate: true,
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
				maxRotation: 90,
				mirror: false,
				padding: 10,
				reverse: false,
				showLabelBackdrop: true,
				display: true,
				callback: defaultConfig.ticks.callback, // make this nicer, then check explicitly below
				autoSkip: true,
				autoSkipPadding: 20
			},
		});

		// Is this actually a function
		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
		expect(defaultConfig.pointLabels.callback).toEqual(jasmine.any(Function));
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
		expect(scale.min).toBe(-100);
		expect(scale.max).toBe(200);
	});

	it('Should correctly determine the max & min of string data values', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: ['10', '5', '0', '-5', '78', '-100']
			}, {
				yAxisID: scaleID,
				data: ['150']
			}],
			labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
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
		expect(scale.min).toBe(-100);
		expect(scale.max).toBe(200);
	});

	it('Should correctly determine the max & min data values when there are hidden datasets', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, -5, 78, -100]
			}, {
				yAxisID: scaleID,
				data: [150]
			}, {
				yAxisID: scaleID,
				data: [1000],
				hidden: true
			}],
			labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
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
		expect(scale.min).toBe(-100);
		expect(scale.max).toBe(200);
	});

	it('Should correctly determine the max & min data values when there is NaN data', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [50, 60, NaN, 70, null, undefined]
			}],
			labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
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
		expect(scale.min).toBe(50);
		expect(scale.max).toBe(70);
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
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [1, 1, 1, 2, 1, 0]
			}],
			labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		config.ticks.suggestedMin = -10;
		config.ticks.suggestedMax = 10;

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// Set arbitrary width and height for now
		scale.update(200, 300);
		expect(scale.min).toBe(-10);
		expect(scale.max).toBe(10);
	});

	it('Should use the min and max options', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [1, 1, 1, 2, 1, 0]
			}],
			labels: ['lablel1', 'label2', 'label3', 'label4', 'label5', 'label6']
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		config.ticks.min = -1010;
		config.ticks.max = 1010;

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		// Set arbitrary width and height for now
		scale.update(200, 300);
		expect(scale.min).toBe(-1010);
		expect(scale.max).toBe(1010);
		expect(scale.ticks[0]).toBe('-1010');
		expect(scale.ticks[scale.ticks.length - 1]).toBe('1010');
		expect(scale.ticks).toEqual(['-1010', '-1000', '0', '1000', '1010']);
	});

	it('should forcibly include 0 in the range if the beginAtZero option is used', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [20, 30, 40, 50]
			}],
			labels: [],
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		config.ticks.beginAtZero = false;
		scale.update(400, 400);
		expect(scale.ticks).toEqual(['20', '25', '30', '35', '40', '45', '50']);

		config.ticks.beginAtZero = true;
		scale.update(400, 400);
		expect(scale.ticks).toEqual(['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50']);

		mockData.datasets[0].data = [-20, -30, -40, -50];
		scale.update(400, 400);
		expect(scale.ticks).toEqual(['-50', '-45', '-40', '-35', '-30', '-25', '-20', '-15', '-10', '-5', '0']);

		config.ticks.beginAtZero = false;
		scale.update(400, 400);
		expect(scale.ticks).toEqual(['-50', '-45', '-40', '-35', '-30', '-25', '-20']);
	});

	it('Should generate tick marks in the correct order in reversed mode', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: []
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		config.ticks.reverse = true;
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		scale.update(200, 300);

		// Reverse mode makes this count up
		expect(scale.ticks).toEqual(['80', '60', '40', '20', '0']);
		expect(scale.start).toBe(80);
		expect(scale.end).toBe(0);
	});

	it('Should build labels using the user supplied callback', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['label1', 'label2', 'label3', 'label4', 'label5']
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		config.ticks.userCallback = function(value, index) {
			return index.toString();
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		scale.update(200, 300);

		// Just the index
		expect(scale.ticks).toEqual(['0', '1', '2', '3', '4']);
		expect(scale.pointLabels).toEqual(['label1', 'label2', 'label3', 'label4', 'label5']);
	});

	it('Should build point labels using the user supplied callback', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['label1', 'label2', 'label3', 'label4', 'label5']
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		config.pointLabels.callback = function(value, index) {
			return index.toString();
		};

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		scale.update(200, 300);

		// Just the index
		expect(scale.pointLabels).toEqual(['0', '1', '2', '3', '4']);
	});

	it('should correctly set the center point', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['point1', 'point2', 'point3', 'point4', 'point5'] // used in radar charts which use the same scales
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		scale.left = 10;
		scale.right = 210;
		scale.top = 5;
		scale.bottom = 305;
		scale.update(200, 300);

		expect(scale.drawingArea).toBe(37);
		expect(scale.xCenter).toBe(110);
		expect(scale.yCenter).toBe(155);
	});

	it('should correctly get the label for a given data index', function() {
		var scaleID = 'myScale';

		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78]
			}],
			labels: ['point1', 'point2', 'point3', 'point4', 'point5'] // used in radar charts which use the same scales
		};

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		scale.left = 10;
		scale.right = 210;
		scale.top = 5;
		scale.bottom = 305;
		scale.update(200, 300);

		expect(scale.getLabelForIndex(1, 0)).toBe(5);
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

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		scale.left = 0;
		scale.right = 200;
		scale.top = 0;
		scale.bottom = 300;
		scale.update(200, 300);

		expect(scale.getDistanceFromCenterForValue(scale.min)).toBe(0);
		expect(scale.getDistanceFromCenterForValue(scale.max)).toBe(37);
		expect(scale.getPointPositionForValue(1, 5)).toEqual({
			x: 102,
			y: 149,
		});

		config.reverse = true;

		scale.update(200, 300);

		expect(scale.getDistanceFromCenterForValue(scale.min)).toBe(37);
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

		var mockContext = window.createMockContext();
		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		config.lineArc = true;
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: config,
			chart: {
				data: mockData
			},
			id: scaleID,
		});

		scale.left = 0;
		scale.right = 200;
		scale.top = 0;
		scale.bottom = 300;
		scale.update(200, 300);

		scale.draw();

		var expected = [{
			"name": "measureText",
			"args": ["0"]
		}, {
			"name": "measureText",
			"args": ["80"]
		}, {
			"name": "measureText",
			"args": ["point1"]
		}, {
			"name": "measureText",
			"args": ["point2"]
		}, {
			"name": "measureText",
			"args": ["point3"]
		}, {
			"name": "measureText",
			"args": ["point4"]
		}, {
			"name": "measureText",
			"args": ["point5"]
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
			"args": [100, 150, 9.25, 0, 6.283185307179586]
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
			"args": [88, 132.75, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["20", 100, 140.75]
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
			"args": [100, 150, 18.5, 0, 6.283185307179586]
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
			"args": [88, 123.5, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["40", 100, 131.5]
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
			"args": [100, 150, 27.75, 0, 6.283185307179586]
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
			"args": [88, 114.25, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["60", 100, 122.25]
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
			"args": [100, 150, 37, 0, 6.283185307179586]
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
			"args": [88, 105, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["80", 100, 113]
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
			"args": [100, 141]
		}, {
			"name": "lineTo",
			"args": [109, 147]
		}, {
			"name": "lineTo",
			"args": [105, 157]
		}, {
			"name": "lineTo",
			"args": [95, 157]
		}, {
			"name": "lineTo",
			"args": [91, 147]
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
			"args": [88, 132.75, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["20", 100, 140.75]
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
			"args": [100, 132]
		}, {
			"name": "lineTo",
			"args": [118, 144]
		}, {
			"name": "lineTo",
			"args": [111, 165]
		}, {
			"name": "lineTo",
			"args": [89, 165]
		}, {
			"name": "lineTo",
			"args": [82, 144]
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
			"args": [88, 123.5, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["40", 100, 131.5]
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
			"args": [100, 122]
		}, {
			"name": "lineTo",
			"args": [126, 141]
		}, {
			"name": "lineTo",
			"args": [116, 172]
		}, {
			"name": "lineTo",
			"args": [84, 172]
		}, {
			"name": "lineTo",
			"args": [74, 141]
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
			"args": [88, 114.25, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["60", 100, 122.25]
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
			"args": [100, 113]
		}, {
			"name": "lineTo",
			"args": [135, 139]
		}, {
			"name": "lineTo",
			"args": [122, 180]
		}, {
			"name": "lineTo",
			"args": [78, 180]
		}, {
			"name": "lineTo",
			"args": [65, 139]
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
			"args": [88, 105, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["80", 100, 113]
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
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [65, 139]
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
			"args": ["point5", 60, 137]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [78, 180]
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
			"args": ["point4", 75, 184]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [122, 180]
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
			"args": ["point3", 125, 184]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [135, 139]
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
			"args": ["point2", 140, 137]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [100, 113]
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
			"args": ["point1", 100, 108]
		}]);
	});
});
