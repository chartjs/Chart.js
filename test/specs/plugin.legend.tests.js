// Test the rectangle element
describe('Legend block tests', function() {
	describe('auto', jasmine.fixture.specs('plugin.legend'));

	it('should have the correct default config', function() {
		expect(Chart.defaults.global.legend).toEqual({
			display: true,
			position: 'top',
			align: 'center',
			fullWidth: true, // marks that this box should take the full width of the canvas (pushing down other boxes)
			reverse: false,
			weight: 1000,

			// a callback that will handle
			onClick: jasmine.any(Function),
			onHover: null,
			onLeave: null,

			labels: {
				boxWidth: 40,
				padding: 10,
				generateLabels: jasmine.any(Function)
			}
		});
	});

	it('should update correctly', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					label: 'dataset1',
					backgroundColor: '#f31',
					borderCapStyle: 'butt',
					borderDash: [2, 2],
					borderDashOffset: 5.5,
					data: []
				}, {
					label: 'dataset2',
					hidden: true,
					borderJoinStyle: 'miter',
					data: []
				}, {
					label: 'dataset3',
					borderWidth: 10,
					borderColor: 'green',
					pointStyle: 'crossRot',
					data: []
				}],
				labels: []
			}
		});

		expect(chart.legend.legendItems).toEqual([{
			text: 'dataset1',
			fillStyle: '#f31',
			hidden: false,
			lineCap: 'butt',
			lineDash: [2, 2],
			lineDashOffset: 5.5,
			lineJoin: undefined,
			lineWidth: undefined,
			strokeStyle: undefined,
			pointStyle: undefined,
			datasetIndex: 0
		}, {
			text: 'dataset2',
			fillStyle: undefined,
			hidden: true,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: 'miter',
			lineWidth: undefined,
			strokeStyle: undefined,
			pointStyle: undefined,
			datasetIndex: 1
		}, {
			text: 'dataset3',
			fillStyle: undefined,
			hidden: false,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 10,
			strokeStyle: 'green',
			pointStyle: 'crossRot',
			datasetIndex: 2
		}]);
	});

	it('should filter items', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					label: 'dataset1',
					backgroundColor: '#f31',
					borderCapStyle: 'butt',
					borderDash: [2, 2],
					borderDashOffset: 5.5,
					data: []
				}, {
					label: 'dataset2',
					hidden: true,
					borderJoinStyle: 'miter',
					data: [],
					legendHidden: true
				}, {
					label: 'dataset3',
					borderWidth: 10,
					borderColor: 'green',
					pointStyle: 'crossRot',
					data: []
				}],
				labels: []
			},
			options: {
				legend: {
					labels: {
						filter: function(legendItem, data) {
							var dataset = data.datasets[legendItem.datasetIndex];
							return !dataset.legendHidden;
						}
					}
				}
			}
		});

		expect(chart.legend.legendItems).toEqual([{
			text: 'dataset1',
			fillStyle: '#f31',
			hidden: false,
			lineCap: 'butt',
			lineDash: [2, 2],
			lineDashOffset: 5.5,
			lineJoin: undefined,
			lineWidth: undefined,
			strokeStyle: undefined,
			pointStyle: undefined,
			datasetIndex: 0
		}, {
			text: 'dataset3',
			fillStyle: undefined,
			hidden: false,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 10,
			strokeStyle: 'green',
			pointStyle: 'crossRot',
			datasetIndex: 2
		}]);
	});

	it('should not throw when the label options are missing', function() {
		var makeChart = function() {
			window.acquireChart({
				type: 'bar',
				data: {
					datasets: [{
						label: 'dataset1',
						backgroundColor: '#f31',
						borderCapStyle: 'butt',
						borderDash: [2, 2],
						borderDashOffset: 5.5,
						data: []
					}],
					labels: []
				},
				options: {
					legend: {
						labels: false,
					}
				}
			});
		};
		expect(makeChart).not.toThrow();
	});

	it('should not draw legend items outside of the chart bounds', function() {
		var chart = window.acquireChart(
			{
				type: 'line',
				data: {
					datasets: [1, 2, 3].map(function(n) {
						return {
							label: 'dataset' + n,
							data: []
						};
					}),
					labels: []
				},
				options: {
					legend: {
						position: 'right'
					}
				}
			},
			{
				canvas: {
					width: 512,
					height: 105
				}
			}
		);

		// Check some basic assertions about the test setup
		expect(chart.width).toBe(512);
		expect(chart.legend.legendHitBoxes.length).toBe(3);

		// Check whether any legend items reach outside the established bounds
		chart.legend.legendHitBoxes.forEach(function(item) {
			expect(item.left + item.width).toBeLessThanOrEqual(chart.width);
		});
	});

	describe('config update', function() {
		it ('should update the options', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					legend: {
						display: true
					}
				}
			});
			expect(chart.legend.options.display).toBe(true);

			chart.options.legend.display = false;
			chart.update();
			expect(chart.legend.options.display).toBe(false);
		});

		it ('should update the associated layout item', function() {
			var chart = acquireChart({
				type: 'line',
				data: {},
				options: {
					legend: {
						fullWidth: true,
						position: 'top',
						weight: 150
					}
				}
			});

			expect(chart.legend.fullWidth).toBe(true);
			expect(chart.legend.position).toBe('top');
			expect(chart.legend.weight).toBe(150);

			chart.options.legend.fullWidth = false;
			chart.options.legend.position = 'left';
			chart.options.legend.weight = 42;
			chart.update();

			expect(chart.legend.fullWidth).toBe(false);
			expect(chart.legend.position).toBe('left');
			expect(chart.legend.weight).toBe(42);
		});

		it ('should remove the legend if the new options are false', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				}
			});
			expect(chart.legend).not.toBe(undefined);

			chart.options.legend = false;
			chart.update();
			expect(chart.legend).toBe(undefined);
		});

		it ('should create the legend if the legend options are changed to exist', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					legend: false
				}
			});
			expect(chart.legend).toBe(undefined);

			chart.options.legend = {};
			chart.update();
			expect(chart.legend).not.toBe(undefined);
			expect(chart.legend.options).toEqual(jasmine.objectContaining(Chart.defaults.global.legend));
		});
	});

	describe('callbacks', function() {
		it('should call onClick, onHover and onLeave at the correct times', function() {
			var clickItem = null;
			var hoverItem = null;
			var leaveItem = null;

			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					legend: {
						onClick: function(_, item) {
							clickItem = item;
						},
						onHover: function(_, item) {
							hoverItem = item;
						},
						onLeave: function(_, item) {
							leaveItem = item;
						}
					}
				}
			});

			var hb = chart.legend.legendHitBoxes[0];
			var el = {
				x: hb.left + (hb.width / 2),
				y: hb.top + (hb.height / 2)
			};

			jasmine.triggerMouseEvent(chart, 'click', el);

			expect(clickItem).toBe(chart.legend.legendItems[0]);

			jasmine.triggerMouseEvent(chart, 'mousemove', el);

			expect(hoverItem).toBe(chart.legend.legendItems[0]);

			jasmine.triggerMouseEvent(chart, 'mousemove', chart.getDatasetMeta(0).data[0]);

			expect(leaveItem).toBe(chart.legend.legendItems[0]);
		});
	});
});

