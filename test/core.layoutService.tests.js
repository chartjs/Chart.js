// Tests of the scale service
describe('Test the layout service', function() {
	it('should fit a simple chart with 2 scales', function() {
		var chartInstance = {
			boxes: [],
		};

		var xScaleID = 'xScale';
		var yScaleID = 'yScale';
		var mockData = {
			datasets: [{
				yAxisID: yScaleID,
				data: [10, 5, 0, 25, 78, -10]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
		};
		var mockContext = window.createMockContext();

		var xScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		var XConstructor = Chart.scaleService.getScaleConstructor('category');
		var xScale = new XConstructor({
			ctx: mockContext,
			options: xScaleConfig,
			chart: {
				data: mockData
			},
			id: xScaleID
		});

		var yScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var YConstructor = Chart.scaleService.getScaleConstructor('linear');
		var yScale = new YConstructor({
			ctx: mockContext,
			options: yScaleConfig,
			chart: {
				data: mockData
			},
			id: yScaleID
		});

		chartInstance.boxes.push(xScale);
		chartInstance.boxes.push(yScale);

		var canvasWidth = 250;
		var canvasHeight = 150;
		Chart.layoutService.update(chartInstance, canvasWidth, canvasHeight);

		expect(chartInstance.chartArea).toEqual({
			left: 50,
			right: 250,
			top: 0,
			bottom: 81.0423977855504,
		});

		// Is xScale at the right spot
		expect(xScale.left).toBe(50);
		expect(xScale.right).toBe(250);
		expect(xScale.top).toBe(81.0423977855504);
		expect(xScale.bottom).toBe(150);
		expect(xScale.labelRotation).toBe(55);

		// Is yScale at the right spot
		expect(yScale.left).toBe(0);
		expect(yScale.right).toBe(50);
		expect(yScale.top).toBe(0);
		expect(yScale.bottom).toBe(81.0423977855504);
	});

	it('should fit scales that are in the top and right positions', function() {
		var chartInstance = {
			boxes: [],
		};

		var xScaleID = 'xScale';
		var yScaleID = 'yScale';
		var mockData = {
			datasets: [{
				yAxisID: yScaleID,
				data: [10, 5, 0, 25, 78, -10]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
		};
		var mockContext = window.createMockContext();

		var xScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		xScaleConfig.position = 'top';
		var XConstructor = Chart.scaleService.getScaleConstructor('category');
		var xScale = new XConstructor({
			ctx: mockContext,
			options: xScaleConfig,
			chart: {
				data: mockData
			},
			id: xScaleID
		});

		var yScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		yScaleConfig.position = 'right';
		var YConstructor = Chart.scaleService.getScaleConstructor('linear');
		var yScale = new YConstructor({
			ctx: mockContext,
			options: yScaleConfig,
			chart: {
				data: mockData
			},
			id: yScaleID
		});

		chartInstance.boxes.push(xScale);
		chartInstance.boxes.push(yScale);

		var canvasWidth = 250;
		var canvasHeight = 150;
		Chart.layoutService.update(chartInstance, canvasWidth, canvasHeight);

		expect(chartInstance.chartArea).toEqual({
			left: 0,
			right: 200,
			top: 68.9576022144496,
			bottom: 150,
		});

		// Is xScale at the right spot
		expect(xScale.left).toBe(0);
		expect(xScale.right).toBe(200);
		expect(xScale.top).toBe(0);
		expect(xScale.bottom).toBe(68.9576022144496);
		expect(xScale.labelRotation).toBe(55);

		// Is yScale at the right spot
		expect(yScale.left).toBe(200);
		expect(yScale.right).toBe(250);
		expect(yScale.top).toBe(68.9576022144496);
		expect(yScale.bottom).toBe(150);
	});

	it('should fit multiple axes in the same position', function() {
		var chartInstance = {
			boxes: [],
		};

		var xScaleID = 'xScale';
		var yScaleID1 = 'yScale1';
		var yScaleID2 = 'yScale2';
		var mockData = {
			datasets: [{
				yAxisID: yScaleID1,
				data: [10, 5, 0, 25, 78, -10]
			}, {
				yAxisID: yScaleID2,
				data: [-19, -20, 0, -99, -50, 0]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
		};
		var mockContext = window.createMockContext();

		var xScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		var XConstructor = Chart.scaleService.getScaleConstructor('category');
		var xScale = new XConstructor({
			ctx: mockContext,
			options: xScaleConfig,
			chart: {
				data: mockData
			},
			id: xScaleID
		});

		var yScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var YConstructor = Chart.scaleService.getScaleConstructor('linear');
		var yScale1 = new YConstructor({
			ctx: mockContext,
			options: yScaleConfig,
			chart: {
				data: mockData
			},
			id: yScaleID1
		});
		var yScale2 = new YConstructor({
			ctx: mockContext,
			options: yScaleConfig,
			chart: {
				data: mockData
			},
			id: yScaleID2
		});

		chartInstance.boxes.push(xScale);
		chartInstance.boxes.push(yScale1);
		chartInstance.boxes.push(yScale2);

		var canvasWidth = 250;
		var canvasHeight = 150;
		Chart.layoutService.update(chartInstance, canvasWidth, canvasHeight);

		expect(chartInstance.chartArea).toEqual({
			left: 110,
			right: 250,
			top: 0,
			bottom: 75,
		});

		// Is xScale at the right spot
		expect(xScale.left).toBe(110);
		expect(xScale.right).toBe(250);
		expect(xScale.top).toBe(75);
		expect(xScale.bottom).toBe(150);

		// Are yScales at the right spot
		expect(yScale1.left).toBe(0);
		expect(yScale1.right).toBe(50);
		expect(yScale1.top).toBe(0);
		expect(yScale1.bottom).toBe(75);

		expect(yScale2.left).toBe(50);
		expect(yScale2.right).toBe(110);
		expect(yScale2.top).toBe(0);
		expect(yScale2.bottom).toBe(75);
	});

	// This is an oddball case. What happens is, when the scales are fit the first time they must fit within the assigned size. In this case,
	// the labels on the xScale need to rotate to fit. However, when the scales are fit again after the width of the left axis is determined, 
	// the labels do not need to rotate. Previously, the chart was too small because the chartArea did not expand to take up the space freed up 
	// due to the lack of label rotation
	it('should fit scales that overlap the chart area', function() {
		var chartInstance = {
			boxes: [],
		};

		var scaleID = 'scaleID';
		var mockData = {
			datasets: [{
				yAxisID: scaleID,
				data: [10, 5, 0, 25, 78, -10]
			}, {
				yAxisID: scaleID,
				data: [-19, -20, 0, -99, -50, 0]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
		};
		var mockContext = window.createMockContext();

		var scaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('radialLinear'));
		var ScaleConstructor = Chart.scaleService.getScaleConstructor('radialLinear');
		var scale = new ScaleConstructor({
			ctx: mockContext,
			options: scaleConfig,
			chart: {
				data: mockData
			},
			id: scaleID
		});

		chartInstance.boxes.push(scale);

		var canvasWidth = 300;
		var canvasHeight = 350;
		Chart.layoutService.update(chartInstance, canvasWidth, canvasHeight);

		expect(chartInstance.chartArea).toEqual({
			left: 0,
			right: 300,
			top: 0,
			bottom: 350,
		});

		expect(scale.left).toBe(0);
		expect(scale.right).toBe(300);
		expect(scale.top).toBe(0);
		expect(scale.bottom).toBe(350);
		expect(scale.width).toBe(300);
		expect(scale.height).toBe(350)
	});

	it ('should fix a full width box correctly', function() {
		var chartInstance = {
			boxes: [],
		};

		var xScaleID1= 'xScale1';
		var xScaleID2 = 'xScale2';
		var yScaleID = 'yScale2';

		var mockData = {
			datasets: [{
				xAxisID: xScaleID1,
				data: [10, 5, 0, 25, 78, -10]
			}, {
				xAxisID: xScaleID2,
				data: [-19, -20, 0, -99, -50, 0]
			}],
			labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5']
		};
		var mockContext = window.createMockContext();

		var xScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('category'));
		var XConstructor = Chart.scaleService.getScaleConstructor('category');
		var xScale1 = new XConstructor({
			ctx: mockContext,
			options: xScaleConfig,
			chart: {
				data: mockData
			},
			id: xScaleID1
		});
		var xScale2 = new XConstructor({
			ctx: mockContext,
			options: Chart.helpers.extend(Chart.helpers.clone(xScaleConfig), {
				position: 'top',
				fullWidth: true
			}),
			chart: {
				data: mockData,
			},
			id: xScaleID2
		});

		var yScaleConfig = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('linear'));
		var YConstructor = Chart.scaleService.getScaleConstructor('linear');
		var yScale = new YConstructor({
			ctx: mockContext,
			options: yScaleConfig,
			chart: {
				data: mockData
			},
			id: yScaleID
		});

		chartInstance.boxes.push(xScale1);
		chartInstance.boxes.push(xScale2);
		chartInstance.boxes.push(yScale);

		var canvasWidth = 250;
		var canvasHeight = 150;
		Chart.layoutService.update(chartInstance, canvasWidth, canvasHeight);

		expect(chartInstance.chartArea).toEqual({
			left: 60,
			right: 250,
			top: 54.495963211660246,
			bottom: 80.0664716027288,
		});

		// Are xScales at the right spot
		expect(xScale1.left).toBe(60);
		expect(xScale1.right).toBe(250);
		expect(xScale1.top).toBeCloseTo(80.06, 1e-3);
		expect(xScale1.bottom).toBe(150);

		expect(xScale2.left).toBe(0);
		expect(xScale2.right).toBe(250);
		expect(xScale2.top).toBe(0);
		expect(xScale2.bottom).toBeCloseTo(54.49, 1e-3);

		// Is yScale at the right spot
		expect(yScale.left).toBe(0);
		expect(yScale.right).toBe(60);
		expect(yScale.top).toBeCloseTo(54.49, 1e-3);
		expect(yScale.bottom).toBeCloseTo(80.06, 1e-3);
	});
});