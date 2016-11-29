// Tests of the interaction handlers in Core.Interaction

// Test the rectangle element
describe('Core.Interaction', function() {
	describe('point mode', function() {
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

			var elements = Chart.Interaction.modes.point(chartInstance, evt);
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

			var elements = Chart.Interaction.modes.point(chartInstance, evt);
			expect(elements).toEqual([]);
		});
	});

	describe('index mode', function() {
		it ('should return all items at the same index', function() {
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
						data: [40, 40, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
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

			var elements = Chart.Interaction.modes.index(chartInstance, evt, {intersect: true});
			expect(elements).toEqual([point, meta1.data[1]]);
		});

		it ('should return all items at the same index when intersect is false', function() {
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
						data: [40, 40, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);
			var meta1 = chartInstance.getDatasetMeta(1);

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();

			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left,
				clientY: rect.top,
				currentTarget: node
			};

			var elements = Chart.Interaction.modes.index(chartInstance, evt, {intersect: false});
			expect(elements).toEqual([meta0.data[0], meta1.data[0]]);
		});
	});

	describe('dataset mode', function() {
		it ('should return all items in the dataset of the first item found', function() {
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
						data: [40, 40, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta = chartInstance.getDatasetMeta(0);
			var point = meta.data[1];

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

			var elements = Chart.Interaction.modes.dataset(chartInstance, evt, {intersect: true});
			expect(elements).toEqual(meta.data);
		});

		it ('should return all items in the dataset of the first item found when intersect is false', function() {
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
						data: [40, 40, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();

			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left,
				clientY: rect.top,
				currentTarget: node
			};

			var elements = Chart.Interaction.modes.dataset(chartInstance, evt, {intersect: false});

			var meta = chartInstance.getDatasetMeta(1);
			expect(elements).toEqual(meta.data);
		});
	});

	describe('nearest mode', function() {
		it ('should return the nearest item', function() {
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
						data: [40, 40, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta = chartInstance.getDatasetMeta(1);
			var node = chartInstance.chart.canvas;
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: 0,
				clientY: 0,
				currentTarget: node
			};

			// Nearest to 0,0 (top left) will be first point of dataset 2
			var elements = Chart.Interaction.modes.nearest(chartInstance, evt, {intersect: false});
			expect(elements).toEqual([meta.data[0]]);
		});

		it ('should return the smallest item if more than 1 are at the same distance', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 40, 30],
						pointRadius: [5, 5, 5],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointRadius: [10, 10, 10],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);
			var meta1 = chartInstance.getDatasetMeta(1);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: (meta0.data[1]._view.y + meta1.data[1]._view.y) / 2
			};

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x,
				clientY: rect.top + pt.y,
				currentTarget: node
			};

			// Nearest to 0,0 (top left) will be first point of dataset 2
			var elements = Chart.Interaction.modes.nearest(chartInstance, evt, {intersect: false});
			expect(elements).toEqual([meta0.data[1]]);
		});

		it ('should return the lowest dataset index if size and area are the same', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 40, 30],
						pointRadius: [5, 10, 5],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointRadius: [10, 10, 10],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);
			var meta1 = chartInstance.getDatasetMeta(1);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: (meta0.data[1]._view.y + meta1.data[1]._view.y) / 2
			};

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x,
				clientY: rect.top + pt.y,
				currentTarget: node
			};

			// Nearest to 0,0 (top left) will be first point of dataset 2
			var elements = Chart.Interaction.modes.nearest(chartInstance, evt, {intersect: false});
			expect(elements).toEqual([meta0.data[1]]);
		});
	});

	describe('nearest intersect mode', function() {
		it ('should return the nearest item', function() {
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
						data: [40, 40, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta = chartInstance.getDatasetMeta(1);
			var point = meta.data[1];

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + point._view.x + 15,
				clientY: rect.top + point._view.y,
				currentTarget: node
			};

			// Nothing intersects so find nothing
			var elements = Chart.Interaction.modes.nearest(chartInstance, evt, {intersect: true});
			expect(elements).toEqual([]);

			evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + point._view.x,
				clientY: rect.top + point._view.y,
				currentTarget: node
			};
			elements = Chart.Interaction.modes.nearest(chartInstance, evt, {intersect: true});
			expect(elements).toEqual([point]);
		});

		it ('should return the nearest item even if 2 intersect', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 39, 30],
						pointRadius: [5, 30, 5],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointRadius: [10, 10, 10],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x,
				clientY: rect.top + pt.y,
				currentTarget: node
			};

			// Nearest to 0,0 (top left) will be first point of dataset 2
			var elements = Chart.Interaction.modes.nearest(chartInstance, evt, {intersect: true});
			expect(elements).toEqual([meta0.data[1]]);
		});

		it ('should return the smallest item if more than 1 are at the same distance', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 40, 30],
						pointRadius: [5, 5, 5],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointRadius: [10, 10, 10],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x,
				clientY: rect.top + pt.y,
				currentTarget: node
			};

			// Nearest to 0,0 (top left) will be first point of dataset 2
			var elements = Chart.Interaction.modes.nearest(chartInstance, evt, {intersect: true});
			expect(elements).toEqual([meta0.data[1]]);
		});

		it ('should return the item at the lowest dataset index if distance and area are the same', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 40, 30],
						pointRadius: [5, 10, 5],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointRadius: [10, 10, 10],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x,
				clientY: rect.top + pt.y,
				currentTarget: node
			};

			// Nearest to 0,0 (top left) will be first point of dataset 2
			var elements = Chart.Interaction.modes.nearest(chartInstance, evt, {intersect: true});
			expect(elements).toEqual([meta0.data[1]]);
		});
	});

	describe('x mode', function() {
		it('should return items at the same x value when intersect is false', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 40, 30],
						pointRadius: [5, 10, 5],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointRadius: [10, 10, 10],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);
			var meta1 = chartInstance.getDatasetMeta(1);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x,
				clientY: rect.top,
				currentTarget: node
			};

			var elements = Chart.Interaction.modes.x(chartInstance, evt, {intersect: false});
			expect(elements).toEqual([meta0.data[1], meta1.data[1]]);

			evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x + 20, // out of range
				clientY: rect.top,
				currentTarget: node
			};

			elements = Chart.Interaction.modes.x(chartInstance, evt, {intersect: false});
			expect(elements).toEqual([]);
		});

		it('should return items at the same x value when intersect is true', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 40, 30],
						pointRadius: [5, 10, 5],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointRadius: [10, 10, 10],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);
			var meta1 = chartInstance.getDatasetMeta(1);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x,
				clientY: rect.top,
				currentTarget: node
			};

			var elements = Chart.Interaction.modes.x(chartInstance, evt, {intersect: true});
			expect(elements).toEqual([]); // we don't intersect anything

			evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x,
				clientY: rect.top + pt.y,
				currentTarget: node
			};

			elements = Chart.Interaction.modes.x(chartInstance, evt, {intersect: true});
			expect(elements).toEqual([meta0.data[1], meta1.data[1]]);
		});
	});

	describe('y mode', function() {
		it('should return items at the same y value when intersect is false', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 40, 30],
						pointRadius: [5, 10, 5],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointRadius: [10, 10, 10],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);
			var meta1 = chartInstance.getDatasetMeta(1);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left,
				clientY: rect.top + pt.y,
				currentTarget: node
			};

			var elements = Chart.Interaction.modes.y(chartInstance, evt, {intersect: false});
			expect(elements).toEqual([meta0.data[1], meta1.data[0], meta1.data[1], meta1.data[2]]);

			evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x,
				clientY: rect.top + pt.y + 20, // out of range
				currentTarget: node
			};

			elements = Chart.Interaction.modes.y(chartInstance, evt, {intersect: false});
			expect(elements).toEqual([]);
		});

		it('should return items at the same y value when intersect is true', function() {
			var chartInstance = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 40, 30],
						pointRadius: [5, 10, 5],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointRadius: [10, 10, 10],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				}
			});

			// Trigger an event over top of the
			var meta0 = chartInstance.getDatasetMeta(0);
			var meta1 = chartInstance.getDatasetMeta(1);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var node = chartInstance.chart.canvas;
			var rect = node.getBoundingClientRect();
			var evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left,
				clientY: rect.top + pt.y,
				currentTarget: node
			};

			var elements = Chart.Interaction.modes.y(chartInstance, evt, {intersect: true});
			expect(elements).toEqual([]); // we don't intersect anything

			evt = {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + pt.x,
				clientY: rect.top + pt.y,
				currentTarget: node
			};

			elements = Chart.Interaction.modes.y(chartInstance, evt, {intersect: true});
			expect(elements).toEqual([meta0.data[1], meta1.data[0], meta1.data[1], meta1.data[2]]);
		});
	});
});
