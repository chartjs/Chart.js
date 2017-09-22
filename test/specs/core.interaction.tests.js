// Tests of the interaction handlers in Core.Interaction

// Test the rectangle element
describe('Core.Interaction', function() {
	describe('point mode', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
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
		});

		it ('should return all items under the point', function() {
			var chart = this.chart;
			var meta0 = chart.getDatasetMeta(0);
			var meta1 = chart.getDatasetMeta(1);
			var point = meta0.data[1];

			var evt = {
				type: 'click',
				chart: chart,
				native: true, // needed otherwise things its a DOM event
				x: point._model.x,
				y: point._model.y,
			};

			var elements = Chart.Interaction.modes.point(chart, evt);
			expect(elements).toEqual([point, meta1.data[1]]);
		});

		it ('should return an empty array when no items are found', function() {
			var chart = this.chart;
			var evt = {
				type: 'click',
				chart: chart,
				native: true, // needed otherwise things its a DOM event
				x: 0,
				y: 0
			};

			var elements = Chart.Interaction.modes.point(chart, evt);
			expect(elements).toEqual([]);
		});
	});

	describe('index mode', function() {
		describe('intersect: true', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
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
			});

			it ('gets correct items', function() {
				var chart = this.chart;
				var meta0 = chart.getDatasetMeta(0);
				var meta1 = chart.getDatasetMeta(1);
				var point = meta0.data[1];

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: point._model.x,
					y: point._model.y,
				};

				var elements = Chart.Interaction.modes.index(chart, evt, {intersect: true});
				expect(elements).toEqual([point, meta1.data[1]]);
			});

			it ('returns empty array when nothing found', function() {
				var chart = this.chart;
				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: 0,
					y: 0,
				};

				var elements = Chart.Interaction.modes.index(chart, evt, {intersect: true});
				expect(elements).toEqual([]);
			});
		});

		describe ('intersect: false', function() {
			var data = {
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
			};

			beforeEach(function() {
				this.chart = window.acquireChart({
					type: 'line',
					data: data
				});
			});

			it ('axis: x gets correct items', function() {
				var chart = this.chart;
				var meta0 = chart.getDatasetMeta(0);
				var meta1 = chart.getDatasetMeta(1);

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: 0,
					y: 0
				};

				var elements = Chart.Interaction.modes.index(chart, evt, {intersect: false});
				expect(elements).toEqual([meta0.data[0], meta1.data[0]]);
			});

			it ('axis: y gets correct items', function() {
				var chart = window.acquireChart({
					type: 'horizontalBar',
					data: data
				});

				var meta0 = chart.getDatasetMeta(0);
				var meta1 = chart.getDatasetMeta(1);
				var center = meta0.data[0].getCenterPoint();

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: center.x,
					y: center.y + 30,
				};

				var elements = Chart.Interaction.modes.index(chart, evt, {axis: 'y', intersect: false});
				expect(elements).toEqual([meta0.data[0], meta1.data[0]]);
			});

			it ('axis: xy gets correct items', function() {
				var chart = this.chart;
				var meta0 = chart.getDatasetMeta(0);
				var meta1 = chart.getDatasetMeta(1);

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: 0,
					y: 0
				};

				var elements = Chart.Interaction.modes.index(chart, evt, {axis: 'xy', intersect: false});
				expect(elements).toEqual([meta0.data[0], meta1.data[0]]);
			});
		});
	});

	describe('dataset mode', function() {
		describe('intersect: true', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
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
			});

			it ('should return all items in the dataset of the first item found', function() {
				var chart = this.chart;
				var meta = chart.getDatasetMeta(0);
				var point = meta.data[1];

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: point._model.x,
					y: point._model.y
				};

				var elements = Chart.Interaction.modes.dataset(chart, evt, {intersect: true});
				expect(elements).toEqual(meta.data);
			});

			it ('should return an empty array if nothing found', function() {
				var chart = this.chart;
				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: 0,
					y: 0
				};

				var elements = Chart.Interaction.modes.dataset(chart, evt, {intersect: true});
				expect(elements).toEqual([]);
			});
		});

		describe('intersect: false', function() {
			var data = {
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
			};

			beforeEach(function() {
				this.chart = window.acquireChart({
					type: 'line',
					data: data
				});
			});

			it ('axis: x gets correct items', function() {
				var chart = window.acquireChart({
					type: 'horizontalBar',
					data: data
				});

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: 0,
					y: 0
				};

				var elements = Chart.Interaction.modes.dataset(chart, evt, {axis: 'x', intersect: false});

				var meta = chart.getDatasetMeta(0);
				expect(elements).toEqual(meta.data);
			});

			it ('axis: y gets correct items', function() {
				var chart = this.chart;
				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: 0,
					y: 0
				};

				var elements = Chart.Interaction.modes.dataset(chart, evt, {axis: 'y', intersect: false});

				var meta = chart.getDatasetMeta(1);
				expect(elements).toEqual(meta.data);
			});

			it ('axis: xy gets correct items', function() {
				var chart = this.chart;
				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: 0,
					y: 0
				};

				var elements = Chart.Interaction.modes.dataset(chart, evt, {intersect: false});

				var meta = chart.getDatasetMeta(1);
				expect(elements).toEqual(meta.data);
			});
		});
	});

	describe('nearest mode', function() {
		describe('intersect: false', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
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
			});

			it ('axis: xy should return the nearest item', function() {
				var chart = this.chart;
				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: 0,
					y: 0
				};

				// Nearest to 0,0 (top left) will be first point of dataset 2
				var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: false});
				var meta = chart.getDatasetMeta(1);
				expect(elements).toEqual([meta.data[0]]);
			});

			it ('should return the smallest item if more than 1 are at the same distance', function() {
				var chart = this.chart;
				var meta0 = chart.getDatasetMeta(0);
				var meta1 = chart.getDatasetMeta(1);

				// Halfway between 2 mid points
				var pt = {
					x: meta0.data[1]._view.x,
					y: (meta0.data[1]._view.y + meta1.data[1]._view.y) / 2
				};

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: pt.x,
					y: pt.y
				};

				// Nearest to 0,0 (top left) will be first point of dataset 2
				var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: false});
				expect(elements).toEqual([meta0.data[1]]);
			});

			it ('should return the lowest dataset index if size and area are the same', function() {
				var chart = this.chart;
				// Make equal sized points at index: 1
				chart.data.datasets[0].pointRadius[1] = 10;
				chart.update();

				// Trigger an event over top of the
				var meta0 = chart.getDatasetMeta(0);
				var meta1 = chart.getDatasetMeta(1);

				// Halfway between 2 mid points
				var pt = {
					x: meta0.data[1]._view.x,
					y: (meta0.data[1]._view.y + meta1.data[1]._view.y) / 2
				};

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: pt.x,
					y: pt.y
				};

				// Nearest to 0,0 (top left) will be first point of dataset 2
				var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: false});
				expect(elements).toEqual([meta0.data[1]]);
			});
		});

		describe('intersect: true', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
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
			});

			it ('should return the nearest item', function() {
				var chart = this.chart;
				var meta = chart.getDatasetMeta(1);
				var point = meta.data[1];

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: point._view.x + 15,
					y: point._view.y
				};

				// Nothing intersects so find nothing
				var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: true});
				expect(elements).toEqual([]);

				evt = {
					type: 'click',
					chart: chart,
					native: true,
					x: point._view.x,
					y: point._view.y
				};
				elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: true});
				expect(elements).toEqual([point]);
			});

			it ('should return the nearest item even if 2 intersect', function() {
				var chart = this.chart;
				chart.data.datasets[0].pointRadius = [5, 30, 5];
				chart.data.datasets[0].data[1] = 39;

				chart.data.datasets[1].pointRadius = [10, 10, 10];

				// Trigger an event over top of the
				var meta0 = chart.getDatasetMeta(0);

				// Halfway between 2 mid points
				var pt = {
					x: meta0.data[1]._view.x,
					y: meta0.data[1]._view.y
				};

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: pt.x,
					y: pt.y
				};

				var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: true});
				expect(elements).toEqual([meta0.data[1]]);
			});

			it ('should return the smallest item if more than 1 are at the same distance', function() {
				var chart = this.chart;
				chart.data.datasets[0].pointRadius = [5, 5, 5];
				chart.data.datasets[0].data[1] = 40;

				chart.data.datasets[1].pointRadius = [10, 10, 10];

				// Trigger an event over top of the
				var meta0 = chart.getDatasetMeta(0);

				// Halfway between 2 mid points
				var pt = {
					x: meta0.data[1]._view.x,
					y: meta0.data[1]._view.y
				};

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: pt.x,
					y: pt.y
				};

				var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: true});
				expect(elements).toEqual([meta0.data[1]]);
			});

			it ('should return the item at the lowest dataset index if distance and area are the same', function() {
				var chart = this.chart;
				chart.data.datasets[0].pointRadius = [5, 10, 5];
				chart.data.datasets[0].data[1] = 40;

				chart.data.datasets[1].pointRadius = [10, 10, 10];

				// Trigger an event over top of the
				var meta0 = chart.getDatasetMeta(0);

				// Halfway between 2 mid points
				var pt = {
					x: meta0.data[1]._view.x,
					y: meta0.data[1]._view.y
				};

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: pt.x,
					y: pt.y
				};

				// Nearest to 0,0 (top left) will be first point of dataset 2
				var elements = Chart.Interaction.modes.nearest(chart, evt, {intersect: true});
				expect(elements).toEqual([meta0.data[1]]);
			});
		});
	});

	describe('x mode', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
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
		});

		it('should return items at the same x value when intersect is false', function() {
			var chart = this.chart;
			var meta0 = chart.getDatasetMeta(0);
			var meta1 = chart.getDatasetMeta(1);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var evt = {
				type: 'click',
				chart: chart,
				native: true, // needed otherwise things its a DOM event
				x: pt.x,
				y: 0
			};

			var elements = Chart.Interaction.modes.x(chart, evt, {intersect: false});
			expect(elements).toEqual([meta0.data[1], meta1.data[1]]);

			evt = {
				type: 'click',
				chart: chart,
				native: true, // needed otherwise things its a DOM event
				x: pt.x + 20,
				y: 0
			};

			elements = Chart.Interaction.modes.x(chart, evt, {intersect: false});
			expect(elements).toEqual([]);
		});

		it('should return items at the same x value when intersect is true', function() {
			var chart = this.chart;
			var meta0 = chart.getDatasetMeta(0);
			var meta1 = chart.getDatasetMeta(1);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var evt = {
				type: 'click',
				chart: chart,
				native: true, // needed otherwise things its a DOM event
				x: pt.x,
				y: 0
			};

			var elements = Chart.Interaction.modes.x(chart, evt, {intersect: true});
			expect(elements).toEqual([]); // we don't intersect anything

			evt = {
				type: 'click',
				chart: chart,
				native: true, // needed otherwise things its a DOM event
				x: pt.x,
				y: pt.y
			};

			elements = Chart.Interaction.modes.x(chart, evt, {intersect: true});
			expect(elements).toEqual([meta0.data[1], meta1.data[1]]);
		});
	});

	describe('y mode', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
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
		});

		it('should return items at the same y value when intersect is false', function() {
			var chart = this.chart;
			var meta0 = chart.getDatasetMeta(0);
			var meta1 = chart.getDatasetMeta(1);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var evt = {
				type: 'click',
				chart: chart,
				native: true,
				x: 0,
				y: pt.y,
			};

			var elements = Chart.Interaction.modes.y(chart, evt, {intersect: false});
			expect(elements).toEqual([meta0.data[1], meta1.data[0], meta1.data[1], meta1.data[2]]);

			evt = {
				type: 'click',
				chart: chart,
				native: true,
				x: pt.x,
				y: pt.y + 20, // out of range
			};

			elements = Chart.Interaction.modes.y(chart, evt, {intersect: false});
			expect(elements).toEqual([]);
		});

		it('should return items at the same y value when intersect is true', function() {
			var chart = this.chart;
			var meta0 = chart.getDatasetMeta(0);
			var meta1 = chart.getDatasetMeta(1);

			// Halfway between 2 mid points
			var pt = {
				x: meta0.data[1]._view.x,
				y: meta0.data[1]._view.y
			};

			var evt = {
				type: 'click',
				chart: chart,
				native: true,
				x: 0,
				y: pt.y
			};

			var elements = Chart.Interaction.modes.y(chart, evt, {intersect: true});
			expect(elements).toEqual([]); // we don't intersect anything

			evt = {
				type: 'click',
				chart: chart,
				native: true,
				x: pt.x,
				y: pt.y,
			};

			elements = Chart.Interaction.modes.y(chart, evt, {intersect: true});
			expect(elements).toEqual([meta0.data[1], meta1.data[0], meta1.data[1], meta1.data[2]]);
		});
	});
});
