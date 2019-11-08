describe('Default Configs', function() {
	describe('Bubble Chart', function() {
		it('should return correct tooltip strings', function() {
			var config = Chart.defaults.bubble;
			var chart = window.acquireChart({
				type: 'bubble',
				data: {
					datasets: [{
						label: 'My dataset',
						data: [{
							x: 10,
							y: 12,
							r: 5
						}]
					}]
				},
				options: config
			});

			// fake out the tooltip hover and force the tooltip to update
			chart.tooltip._active = [{element: chart.getDatasetMeta(0).data[0], datasetIndex: 0, index: 0}];
			chart.tooltip.update();

			// Title is always blank
			expect(chart.tooltip._model.title).toEqual([]);
			expect(chart.tooltip._model.body).toEqual([{
				before: [],
				lines: ['My dataset: (10, 12, 5)'],
				after: []
			}]);
		});
	});

	describe('Doughnut Chart', function() {
		it('should return correct tooltip strings', function() {
			var config = Chart.defaults.doughnut;
			var chart = window.acquireChart({
				type: 'doughnut',
				data: {
					labels: ['label1', 'label2', 'label3'],
					datasets: [{
						data: [10, 20, 30],
					}]
				},
				options: config
			});

			// fake out the tooltip hover and force the tooltip to update
			chart.tooltip._active = [{element: chart.getDatasetMeta(0).data[1], datasetIndex: 0, index: 1}];
			chart.tooltip.update();

			// Title is always blank
			expect(chart.tooltip._model.title).toEqual([]);
			expect(chart.tooltip._model.body).toEqual([{
				before: [],
				lines: ['label2: 20'],
				after: []
			}]);
		});

		it('should return correct tooltip string for a multiline label', function() {
			var config = Chart.defaults.doughnut;
			var chart = window.acquireChart({
				type: 'doughnut',
				data: {
					labels: ['label1', ['row1', 'row2', 'row3'], 'label3'],
					datasets: [{
						data: [10, 20, 30],
					}]
				},
				options: config
			});

			// fake out the tooltip hover and force the tooltip to update
			chart.tooltip._active = [{element: chart.getDatasetMeta(0).data[1], datasetIndex: 0, index: 1}];
			chart.tooltip.update();

			// Title is always blank
			expect(chart.tooltip._model.title).toEqual([]);
			expect(chart.tooltip._model.body).toEqual([{
				before: [],
				lines: [
					'row1: 20',
					'row2',
					'row3'
				],
				after: []
			}]);
		});

		it('should return the correct html legend', function() {
			var config = Chart.defaults.doughnut;
			var chart = window.acquireChart({
				type: 'doughnut',
				data: {
					labels: ['label1', 'label2'],
					datasets: [{
						data: [10, 20],
						backgroundColor: ['red', 'green']
					}]
				},
				options: config
			});

			var expectedLegend = '<ul class="' + chart.id + '-legend"><li><span style="background-color: red;"></span>label1</li><li><span style="background-color: green;"></span>label2</li></ul>';
			expect(chart.generateLegend()).toBe(expectedLegend);
		});

		it('should return correct legend label objects', function() {
			var config = Chart.defaults.doughnut;
			var chart = window.acquireChart({
				type: 'doughnut',
				data: {
					labels: ['label1', 'label2', 'label3'],
					datasets: [{
						data: [10, 20, NaN],
						backgroundColor: ['red', 'green', 'blue'],
						borderWidth: 2,
						borderColor: '#000'
					}]
				},
				options: config
			});

			var expected = [{
				text: 'label1',
				fillStyle: 'red',
				hidden: undefined,
				index: 0,
				strokeStyle: '#000',
				lineWidth: 2
			}, {
				text: 'label2',
				fillStyle: 'green',
				hidden: undefined,
				index: 1,
				strokeStyle: '#000',
				lineWidth: 2
			}, {
				text: 'label3',
				fillStyle: 'blue',
				hidden: true,
				index: 2,
				strokeStyle: '#000',
				lineWidth: 2
			}];
			expect(chart.legend.legendItems).toEqual(expected);
		});

		it('should hide the correct arc when a legend item is clicked', function() {
			var config = Chart.defaults.doughnut;
			var chart = window.acquireChart({
				type: 'doughnut',
				data: {
					labels: ['label1', 'label2', 'label3'],
					datasets: [{
						data: [10, 20, NaN],
						backgroundColor: ['red', 'green', 'blue'],
						borderWidth: 2,
						borderColor: '#000'
					}]
				},
				options: config
			});
			var meta = chart.getDatasetMeta(0);

			spyOn(chart, 'update').and.callThrough();

			var legendItem = chart.legend.legendItems[0];
			config.legend.onClick.call(chart.legend, null, legendItem);

			expect(meta.data[0].hidden).toBe(true);
			expect(chart.update).toHaveBeenCalled();

			config.legend.onClick.call(chart.legend, null, legendItem);
			expect(meta.data[0].hidden).toBe(false);
		});
	});

	describe('Polar Area Chart', function() {
		it('should return correct tooltip strings', function() {
			var config = Chart.defaults.polarArea;
			var chart = window.acquireChart({
				type: 'polarArea',
				data: {
					labels: ['label1', 'label2', 'label3'],
					datasets: [{
						data: [10, 20, 30],
					}]
				},
				options: config
			});

			// fake out the tooltip hover and force the tooltip to update
			chart.tooltip._active = [{element: chart.getDatasetMeta(0).data[1], datasetIndex: 0, index: 1}];
			chart.tooltip.update();

			// Title is always blank
			expect(chart.tooltip._model.title).toEqual([]);
			expect(chart.tooltip._model.body).toEqual([{
				before: [],
				lines: ['label2: 20'],
				after: []
			}]);
		});

		it('should return the correct html legend', function() {
			var config = Chart.defaults.polarArea;
			var chart = window.acquireChart({
				type: 'polarArea',
				data: {
					labels: ['label1', 'label2'],
					datasets: [{
						data: [10, 20],
						backgroundColor: ['red', 'green']
					}]
				},
				options: config
			});

			var expectedLegend = '<ul class="' + chart.id + '-legend"><li><span style="background-color: red;"></span>label1</li><li><span style="background-color: green;"></span>label2</li></ul>';
			expect(chart.generateLegend()).toBe(expectedLegend);
		});

		it('should return correct legend label objects', function() {
			var config = Chart.defaults.polarArea;
			var chart = window.acquireChart({
				type: 'polarArea',
				data: {
					labels: ['label1', 'label2', 'label3'],
					datasets: [{
						data: [10, 20, NaN],
						backgroundColor: ['red', 'green', 'blue'],
						borderWidth: 2,
						borderColor: '#000'
					}]
				},
				options: config
			});

			var expected = [{
				text: 'label1',
				fillStyle: 'red',
				hidden: undefined,
				index: 0,
				strokeStyle: '#000',
				lineWidth: 2
			}, {
				text: 'label2',
				fillStyle: 'green',
				hidden: undefined,
				index: 1,
				strokeStyle: '#000',
				lineWidth: 2
			}, {
				text: 'label3',
				fillStyle: 'blue',
				hidden: true,
				index: 2,
				strokeStyle: '#000',
				lineWidth: 2
			}];
			expect(chart.legend.legendItems).toEqual(expected);
		});

		it('should hide the correct arc when a legend item is clicked', function() {
			var config = Chart.defaults.polarArea;
			var chart = window.acquireChart({
				type: 'polarArea',
				data: {
					labels: ['label1', 'label2', 'label3'],
					datasets: [{
						data: [10, 20, NaN],
						backgroundColor: ['red', 'green', 'blue'],
						borderWidth: 2,
						borderColor: '#000'
					}]
				},
				options: config
			});
			var meta = chart.getDatasetMeta(0);

			spyOn(chart, 'update').and.callThrough();

			var legendItem = chart.legend.legendItems[0];
			config.legend.onClick.call(chart.legend, null, legendItem);

			expect(meta.data[0].hidden).toBe(true);
			expect(chart.update).toHaveBeenCalled();

			config.legend.onClick.call(chart.legend, null, legendItem);
			expect(meta.data[0].hidden).toBe(false);
		});
	});
});
