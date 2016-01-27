// Test the bubble chart default config
describe("Test the bubble chart default config", function() {
	it('should reutrn correct tooltip strings', function() {
		var config = Chart.defaults.bubble;

		// Title is always blank
		expect(config.tooltips.callbacks.title()).toBe('');

		// Item label
		var data = {
			datasets: [{
				label: 'My dataset',
				data: [{
					x: 10,
					y: 12,
					r: 5
				}]
			}]
		};

		var tooltipItem = {
			datasetIndex: 0,
			index: 0
		};

		expect(config.tooltips.callbacks.label(tooltipItem, data)).toBe('My dataset: (10, 12, 5)');
	});
});

describe('Test the doughnut chart default config', function() {
	it('should return correct tooltip strings', function() {
		var config = Chart.defaults.doughnut;

		// Title is always blank
		expect(config.tooltips.callbacks.title()).toBe('');

		// Item label
		var data = {
			labels: ['label1', 'label2', 'label3'],
			datasets: [{
				data: [10, 20, 30],
			}]
		};

		var tooltipItem = {
			datasetIndex: 0,
			index: 1
		};

		expect(config.tooltips.callbacks.label(tooltipItem, data)).toBe('label2: 20');
	});

	it('should return the correct html legend', function() {
		var config = Chart.defaults.doughnut;

		var chart = {
			id: 'mychart',
			data: {
				labels: ['label1', 'label2'],
				datasets: [{
					data: [10, 20],
					backgroundColor: ['red', 'green']
				}]
			}
		};
		var expectedLegend = '<ul class="mychart-legend"><li><span style="background-color:red">label1</span></li><li><span style="background-color:green">label2</span></li></ul>';

		expect(config.legendCallback(chart)).toBe(expectedLegend);
	});

	it('should return correct legend label objects', function() {
		var config = Chart.defaults.doughnut;
		var data = {
			labels: ['label1', 'label2', 'label3'],
			datasets: [{
				data: [10, 20, NaN],
				backgroundColor: ['red', 'green', 'blue']
			}]
		};

		var expected = [{
			text: 'label1',
			fillStyle: 'red',
			hidden: false,
			index: 0
		}, {
			text: 'label2',
			fillStyle: 'green',
			hidden: false,
			index: 1
		}, {
			text: 'label3',
			fillStyle: 'blue',
			hidden: true,
			index: 2
		}];

		expect(config.legend.labels.generateLabels(data)).toEqual(expected);
	});

	it('should hide the correct arc when a legend item is clicked', function() {
		var config = Chart.defaults.doughnut;

		var legendItem = {
			text: 'label1',
			fillStyle: 'red',
			hidden: false,
			index: 0
		};

		var chart = {
			data: {
				labels: ['label1', 'label2', 'label3'],
				datasets: [{
					data: [10, 20, NaN],
					backgroundColor: ['red', 'green', 'blue']
				}]
			},
			update: function() {}
		};

		spyOn(chart, 'update');
		var scope = {
			chart: chart
		};

		config.legend.onClick.call(scope, null, legendItem);

		expect(chart.data.datasets[0].metaHiddenData).toEqual([10]);
		expect(chart.data.datasets[0].data).toEqual([NaN, 20, NaN]);

		expect(chart.update).toHaveBeenCalled();

		config.legend.onClick.call(scope, null, legendItem);
		expect(chart.data.datasets[0].data).toEqual([10, 20, NaN]);

		// Should not toggle index 2 since there was never data for it
		legendItem.index = 2;
		config.legend.onClick.call(scope, null, legendItem);
		expect(chart.data.datasets[0].data).toEqual([10, 20, NaN]);
	});
});

describe('Test the polar area chart default config', function() {
	it('should return correct tooltip strings', function() {
		var config = Chart.defaults.polarArea;

		// Title is always blank
		expect(config.tooltips.callbacks.title()).toBe('');

		// Item label
		var data = {
			labels: ['label1', 'label2', 'label3'],
			datasets: [{
				data: [10, 20, 30],
			}]
		};

		var tooltipItem = {
			datasetIndex: 0,
			index: 1,
			yLabel: 20
		};

		expect(config.tooltips.callbacks.label(tooltipItem, data)).toBe('label2: 20');
	});

	it('should return the correct html legend', function() {
		var config = Chart.defaults.polarArea;

		var chart = {
			id: 'mychart',
			data: {
				labels: ['label1', 'label2'],
				datasets: [{
					data: [10, 20],
					backgroundColor: ['red', 'green']
				}]
			}
		};
		var expectedLegend = '<ul class="mychart-legend"><li><span style="background-color:red">label1</span></li><li><span style="background-color:green">label2</span></li></ul>';

		expect(config.legendCallback(chart)).toBe(expectedLegend);
	});

	it('should return correct legend label objects', function() {
		var config = Chart.defaults.polarArea;
		var data = {
			labels: ['label1', 'label2', 'label3'],
			datasets: [{
				data: [10, 20, NaN],
				backgroundColor: ['red', 'green', 'blue']
			}]
		};

		var expected = [{
			text: 'label1',
			fillStyle: 'red',
			hidden: false,
			index: 0
		}, {
			text: 'label2',
			fillStyle: 'green',
			hidden: false,
			index: 1
		}, {
			text: 'label3',
			fillStyle: 'blue',
			hidden: true,
			index: 2
		}];

		expect(config.legend.labels.generateLabels(data)).toEqual(expected);
	});

	it('should hide the correct arc when a legend item is clicked', function() {
		var config = Chart.defaults.polarArea;

		var legendItem = {
			text: 'label1',
			fillStyle: 'red',
			hidden: false,
			index: 0
		};

		var chart = {
			data: {
				labels: ['label1', 'label2', 'label3'],
				datasets: [{
					data: [10, 20, NaN],
					backgroundColor: ['red', 'green', 'blue']
				}]
			},
			update: function() {}
		};

		spyOn(chart, 'update');
		var scope = {
			chart: chart
		};

		config.legend.onClick.call(scope, null, legendItem);

		expect(chart.data.datasets[0].metaHiddenData).toEqual([10]);
		expect(chart.data.datasets[0].data).toEqual([NaN, 20, NaN]);

		expect(chart.update).toHaveBeenCalled();

		config.legend.onClick.call(scope, null, legendItem);
		expect(chart.data.datasets[0].data).toEqual([10, 20, NaN]);

		// Should not toggle index 2 since there was never data for it
		legendItem.index = 2;
		config.legend.onClick.call(scope, null, legendItem);
		expect(chart.data.datasets[0].data).toEqual([10, 20, NaN]);
	});
});