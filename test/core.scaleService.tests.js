// Tests of the scale service
describe('Test the scale service', function() {
	it('should fit a simple chart with 2 scales', function() {
		var chartInstance = {
			scales: [],
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

		chartInstance.scales.push(xScale);
		chartInstance.scales.push(yScale);

		var canvasWidth = 250;
		var canvasHeight = 150;
		Chart.scaleService.update(chartInstance, canvasWidth, canvasHeight);

		expect(chartInstance.chartArea).toEqual({
			left: 55,
			right: 245,
			top: 5,
			bottom: 75.0664716027288,
		});

		// Is xScale at the right spot
		expect(xScale.left).toBe(55);
		expect(xScale.right).toBe(245);
		expect(xScale.top).toBe(75.0664716027288);
		expect(xScale.bottom).toBe(145);
		expect(xScale.labelRotation).toBe(57);

		// Is yScale at the right spot
		expect(yScale.left).toBe(5);
		expect(yScale.right).toBe(55);
		expect(yScale.top).toBe(5);
		expect(yScale.bottom).toBe(75.0664716027288);
	});

	it('should fit scales that are in the top and right positions', function() {
		var chartInstance = {
			scales: [],
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

		chartInstance.scales.push(xScale);
		chartInstance.scales.push(yScale);

		var canvasWidth = 250;
		var canvasHeight = 150;
		Chart.scaleService.update(chartInstance, canvasWidth, canvasHeight);

		expect(chartInstance.chartArea).toEqual({
			left: 5,
			right: 195,
			top: 74.9335283972712,
			bottom: 145,
		});

		// Is xScale at the right spot
		expect(xScale.left).toBe(5);
		expect(xScale.right).toBe(195);
		expect(xScale.top).toBe(5);
		expect(xScale.bottom).toBe(74.9335283972712);
		expect(xScale.labelRotation).toBe(57);

		// Is yScale at the right spot
		expect(yScale.left).toBe(195);
		expect(yScale.right).toBe(245);
		expect(yScale.top).toBe(74.9335283972712);
		expect(yScale.bottom).toBe(145);
	});

	it('should fit multiple axes in the same position', function() {
		var chartInstance = {
			scales: [],
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

		chartInstance.scales.push(xScale);
		chartInstance.scales.push(yScale1);
		chartInstance.scales.push(yScale2);

		var canvasWidth = 250;
		var canvasHeight = 150;
		Chart.scaleService.update(chartInstance, canvasWidth, canvasHeight);

		expect(chartInstance.chartArea).toEqual({
			left: 115,
			right: 245,
			top: 5,
			bottom: 68.48521368620018,
		});

		// Is xScale at the right spot
		expect(xScale.left).toBe(115);
		expect(xScale.right).toBe(245);
		expect(xScale.top).toBe(68.48521368620018);
		expect(xScale.bottom).toBe(145);

		// Are yScales at the right spot
		expect(yScale1.left).toBe(5);
		expect(yScale1.right).toBe(55);
		expect(yScale1.top).toBe(5);
		expect(yScale1.bottom).toBe(68.48521368620018);

		expect(yScale2.left).toBe(55);
		expect(yScale2.right).toBe(115);
		expect(yScale2.top).toBe(5);
		expect(yScale2.bottom).toBe(68.48521368620018);
	});

	// This is an oddball case. What happens is, when the scales are fit the first time they must fit within the assigned size. In this case,
	// the labels on the xScale need to rotate to fit. However, when the scales are fit again after the width of the left axis is determined, 
	// the labels do not need to rotate. Previously, the chart was too small because the chartArea did not expand to take up the space freed up 
	// due to the lack of label rotation
	it('should fit scales that overlap the chart area', function() {
		var chartInstance = {
			scales: [],
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

		chartInstance.scales.push(scale);

		var canvasWidth = 300;
		var canvasHeight = 350;
		Chart.scaleService.update(chartInstance, canvasWidth, canvasHeight);

		expect(chartInstance.chartArea).toEqual({
			left: 5,
			right: 295,
			top: 5,
			bottom: 345,
		});

		expect(scale.left).toBe(5);
		expect(scale.right).toBe(295);
		expect(scale.top).toBe(5);
		expect(scale.bottom).toBe(345);
		expect(scale.width).toBe(290);
		expect(scale.height).toBe(340)
	});
});