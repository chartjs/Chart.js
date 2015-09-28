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
				show: true,
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
				show: true,
				zeroLineColor: "rgba(0,0,0,0.25)",
				zeroLineWidth: 1,
			},
			lineArc: false,
			pointLabels: {
				fontColor: "#666",
				fontFamily: "'Arial'",
				fontSize: 10,
				fontStyle: "normal",
			},
			position: "chartArea",
			scaleLabel: {
				fontColor: '#666',
				fontFamily: 'Helvetica Neue',
				fontSize: 12,
				fontStyle: 'normal',
				labelString: '',
				show: false,
			},
			ticks: {
				backdropColor: "rgba(255,255,255,0.75)",
				backdropPaddingY: 2,
				backdropPaddingX: 2,
				beginAtZero: false,
				fontColor: "#666",
				fontFamily: "Helvetica Neue",
				fontSize: 12,
				fontStyle: "normal",
				maxRotation: 90,
				minRotation: 20,
				mirror: false,
				padding: 10,
				reverse: false,
				showLabelBackdrop: true,
				show: true,
				template: "<%=value%>",

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

		var mockContext = window.createMockContext();
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new Constructor({
			ctx: mockContext,
			options: Chart.scaleService.getScaleDefaults('radialLinear'), // use default config for scale
			data: mockData,
			id: scaleID,
		});

		scale.update(200, 300);
		expect(scale.min).toBe(-100);
		expect(scale.max).toBe(200);
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
			data: mockData,
			id: scaleID,
		});

		scale.update(200, 300);
		expect(scale.min).toBe(-1);
		expect(scale.max).toBe(1);
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
			data: mockData,
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
			data: mockData,
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
			labels: []
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
			data: mockData,
			id: scaleID,
		});

		scale.update(200, 300);

		// Just the index
		expect(scale.ticks).toEqual(['0', '1', '2', '3', '4']);
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
			data: mockData,
			id: scaleID,
		});

		scale.left = 10;
		scale.right = 210;
		scale.top = 5;
		scale.bottom = 305;
		scale.update(200, 300);

		expect(scale.drawingArea).toBe(36);
		expect(scale.xCenter).toBe(110);
		expect(scale.yCenter).toBe(155);
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
			data: mockData,
			id: scaleID,
		});

		scale.left = 0;
		scale.right = 200;
		scale.top = 0;
		scale.bottom = 300;
		scale.update(200, 300);

		expect(scale.getDistanceFromCenterForValue(scale.min)).toBe(0);
		expect(scale.getDistanceFromCenterForValue(scale.max)).toBe(36);
		expect(scale.getPointPositionForValue(1, 5)).toEqual({
			x: 102.13987716166409,
			y: 149.30471176265638,
		});

		config.reverse = true;

		scale.update(200, 300);

		expect(scale.getDistanceFromCenterForValue(scale.min)).toBe(36);
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
			data: mockData,
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
			"args": [100, 150, 9, 0, 6.283185307179586]
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
			"args": [88, 133, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["20", 100, 141]
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
			"args": [100, 150, 18, 0, 6.283185307179586]
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
			"args": [88, 124, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["40", 100, 132]
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
			"args": [100, 150, 27, 0, 6.283185307179586]
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
			"args": [88, 115, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["60", 100, 123]
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
			"args": [100, 150, 36, 0, 6.283185307179586]
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
			"args": [88, 106, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["80", 100, 114]
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
			"args": [108.55950864665638, 147.21884705062547]
		}, {
			"name": "lineTo",
			"args": [105.29006727063226, 157.28115294937453]
		}, {
			"name": "lineTo",
			"args": [94.70993272936774, 157.28115294937453]
		}, {
			"name": "lineTo",
			"args": [91.44049135334362, 147.21884705062547]
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
			"args": [88, 133, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["20", 100, 141]
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
			"args": [117.11901729331277, 144.43769410125094]
		}, {
			"name": "lineTo",
			"args": [110.58013454126451, 164.56230589874906]
		}, {
			"name": "lineTo",
			"args": [89.41986545873549, 164.56230589874906]
		}, {
			"name": "lineTo",
			"args": [82.88098270668723, 144.43769410125094]
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
			"args": [88, 124, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["40", 100, 132]
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
			"args": [100, 123]
		}, {
			"name": "lineTo",
			"args": [125.67852593996915, 141.6565411518764]
		}, {
			"name": "lineTo",
			"args": [115.87020181189678, 171.8434588481236]
		}, {
			"name": "lineTo",
			"args": [84.12979818810322, 171.8434588481236]
		}, {
			"name": "lineTo",
			"args": [74.32147406003085, 141.6565411518764]
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
			"args": [88, 115, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["60", 100, 123]
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
			"args": [100, 114]
		}, {
			"name": "lineTo",
			"args": [134.23803458662553, 138.87538820250188]
		}, {
			"name": "lineTo",
			"args": [121.16026908252903, 179.12461179749812]
		}, {
			"name": "lineTo",
			"args": [78.83973091747097, 179.12461179749812]
		}, {
			"name": "lineTo",
			"args": [65.76196541337447, 138.8753882025019]
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
			"args": [88, 106, 24, 16]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "fillText",
			"args": ["80", 100, 114]
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
			"args": [65.76196541337447, 138.8753882025019]
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
			"args": ["point5", 61.0066828318987, 137.33030323062715]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [78.83973091747097, 179.12461179749812]
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
			"args": ["point4", 75.9008046560086, 183.16969676937285]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [121.16026908252903, 179.12461179749812]
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
			"args": ["point3", 124.0991953439914, 183.16969676937285]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [134.23803458662553, 138.87538820250188]
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
			"args": ["point2", 138.9933171681013, 137.33030323062715]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "moveTo",
			"args": [100, 150]
		}, {
			"name": "lineTo",
			"args": [100, 114]
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
			"args": ["point1", 100, 109]
		}]);
	});
});