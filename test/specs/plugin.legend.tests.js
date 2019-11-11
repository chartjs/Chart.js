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

	it('should update bar chart correctly', function() {
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
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 0,
			strokeStyle: 'rgba(0,0,0,0.1)',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 0
		}, {
			text: 'dataset2',
			fillStyle: 'rgba(0,0,0,0.1)',
			hidden: true,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 0,
			strokeStyle: 'rgba(0,0,0,0.1)',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 1
		}, {
			text: 'dataset3',
			fillStyle: 'rgba(0,0,0,0.1)',
			hidden: false,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 10,
			strokeStyle: 'green',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 2
		}]);
	});

	it('should update line chart correctly', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					label: 'dataset1',
					backgroundColor: '#f31',
					borderCapStyle: 'round',
					borderDash: [2, 2],
					borderDashOffset: 5.5,
					data: []
				}, {
					label: 'dataset2',
					hidden: true,
					borderJoinStyle: 'round',
					data: []
				}, {
					label: 'dataset3',
					borderWidth: 10,
					borderColor: 'green',
					pointStyle: 'crossRot',
					fill: false,
					data: []
				}],
				labels: []
			}
		});

		expect(chart.legend.legendItems).toEqual([{
			text: 'dataset1',
			fillStyle: '#f31',
			hidden: false,
			lineCap: 'round',
			lineDash: [2, 2],
			lineDashOffset: 5.5,
			lineJoin: 'miter',
			lineWidth: 3,
			strokeStyle: 'rgba(0,0,0,0.1)',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 0
		}, {
			text: 'dataset2',
			fillStyle: 'rgba(0,0,0,0.1)',
			hidden: true,
			lineCap: 'butt',
			lineDash: [],
			lineDashOffset: 0,
			lineJoin: 'round',
			lineWidth: 3,
			strokeStyle: 'rgba(0,0,0,0.1)',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 1
		}, {
			text: 'dataset3',
			fillStyle: 'green',
			hidden: false,
			lineCap: 'butt',
			lineDash: [],
			lineDashOffset: 0,
			lineJoin: 'miter',
			lineWidth: 10,
			strokeStyle: 'green',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 2
		}]);
	});

	it('should reverse correctly', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					label: 'dataset1',
					backgroundColor: '#f31',
					borderCapStyle: 'round',
					borderDash: [2, 2],
					borderDashOffset: 5.5,
					data: []
				}, {
					label: 'dataset2',
					hidden: true,
					borderJoinStyle: 'round',
					data: []
				}, {
					label: 'dataset3',
					borderWidth: 10,
					borderColor: 'green',
					pointStyle: 'crossRot',
					fill: false,
					data: []
				}],
				labels: []
			},
			options: {
				legend: {
					reverse: true
				}
			}
		});

		expect(chart.legend.legendItems).toEqual([{
			text: 'dataset3',
			fillStyle: 'green',
			hidden: false,
			lineCap: 'butt',
			lineDash: [],
			lineDashOffset: 0,
			lineJoin: 'miter',
			lineWidth: 10,
			strokeStyle: 'green',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 2
		}, {
			text: 'dataset2',
			fillStyle: 'rgba(0,0,0,0.1)',
			hidden: true,
			lineCap: 'butt',
			lineDash: [],
			lineDashOffset: 0,
			lineJoin: 'round',
			lineWidth: 3,
			strokeStyle: 'rgba(0,0,0,0.1)',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 1
		}, {
			text: 'dataset1',
			fillStyle: '#f31',
			hidden: false,
			lineCap: 'round',
			lineDash: [2, 2],
			lineDashOffset: 5.5,
			lineJoin: 'miter',
			lineWidth: 3,
			strokeStyle: 'rgba(0,0,0,0.1)',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 0
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
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 0,
			strokeStyle: 'rgba(0,0,0,0.1)',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 0
		}, {
			text: 'dataset3',
			fillStyle: 'rgba(0,0,0,0.1)',
			hidden: false,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 10,
			strokeStyle: 'green',
			pointStyle: undefined,
			rotation: undefined,
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

	it('should pick up the first item when the property is an array', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					label: 'dataset1',
					backgroundColor: ['#f31', '#666', '#14e'],
					borderWidth: [5, 10, 15],
					borderColor: ['red', 'green', 'blue'],
					data: []
				}],
				labels: []
			}
		});

		expect(chart.legend.legendItems).toEqual([{
			text: 'dataset1',
			fillStyle: '#f31',
			hidden: false,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 5,
			strokeStyle: 'red',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 0
		}]);
	});

	it('should use the value for the first item when the property is a function', function() {
		var helpers = window.Chart.helpers;
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					label: 'dataset1',
					backgroundColor: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return helpers.color({r: value * 10, g: 0, b: 0}).rgbString();
					},
					borderWidth: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return value;
					},
					borderColor: function(ctx) {
						var value = ctx.dataset.data[ctx.dataIndex] || 0;
						return helpers.color({r: 255 - value * 10, g: 0, b: 0}).rgbString();
					},
					data: [5, 10, 15, 20]
				}],
				labels: ['A', 'B', 'C', 'D']
			}
		});

		expect(chart.legend.legendItems).toEqual([{
			text: 'dataset1',
			fillStyle: 'rgb(50, 0, 0)',
			hidden: false,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 5,
			strokeStyle: 'rgb(205, 0, 0)',
			pointStyle: undefined,
			rotation: undefined,
			datasetIndex: 0
		}]);
	});

	it('should draw correctly when usePointStyle is true', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					label: 'dataset1',
					backgroundColor: '#f31',
					borderCapStyle: 'butt',
					borderDash: [2, 2],
					borderDashOffset: 5.5,
					borderWidth: 0,
					borderColor: '#f31',
					pointStyle: 'crossRot',
					pointBackgroundColor: 'rgba(0,0,0,0.1)',
					pointBorderWidth: 5,
					pointBorderColor: 'green',
					data: []
				}, {
					label: 'dataset2',
					backgroundColor: '#f31',
					borderJoinStyle: 'miter',
					borderWidth: 2,
					borderColor: '#f31',
					pointStyle: 'crossRot',
					pointRotation: 15,
					data: []
				}],
				labels: []
			},
			options: {
				legend: {
					labels: {
						usePointStyle: true
					}
				}
			}
		});

		expect(chart.legend.legendItems).toEqual([{
			text: 'dataset1',
			fillStyle: 'rgba(0,0,0,0.1)',
			hidden: false,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 5,
			strokeStyle: 'green',
			pointStyle: 'crossRot',
			rotation: undefined,
			datasetIndex: 0
		}, {
			text: 'dataset2',
			fillStyle: '#f31',
			hidden: false,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 2,
			strokeStyle: '#f31',
			pointStyle: 'crossRot',
			rotation: 15,
			datasetIndex: 1
		}]);
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

