// Tests of the interaction handlers in Core.Interaction

// Test the rectangle element
describe('Core.Interaction', function() {
	describe('intersect mode', function() {
		it ('should return all items under the point', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 20, 30],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 20, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				},
				options: {
					tooltips: {
						mode: 'single'
					}
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);
			var meta1 = chartInstance.getDatasetMeta(1);
			var point = meta0.data[1];

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();

			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + point._model.x,
				clientY: rect.top + point._model.y,
				currentTarget: node
			};

			var elements = Chart.Interaction.modes.intersect(chartInstance, evt);
			expect(elements).toEqual([point, meta1.data[1]]);
		});

		it ('should return an empty array when no items are found', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 20, 30],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 20, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				},
				options: {
					tooltips: {
						mode: 'single'
					}
				}
			});

			// Trigger an event at (0, 0)
			var node = chartInstance.chart.canvas;
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: 0,
				clientY: 0,
				currentTarget: node
			};

			var elements = Chart.Interaction.modes.intersect(chartInstance, evt);
			expect(elements).toEqual([]);
		});
	});
});
