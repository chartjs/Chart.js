// Test the rectangle element
describe('Legend block tests', function() {
	it('Should be constructed', function() {
		var legend = new Chart.Legend({});
		expect(legend).not.toBe(undefined);
	});

	it('should have the correct default config', function() {
		expect(Chart.defaults.global.legend).toEqual({
			display: true,
			position: 'top',
			fullWidth: true, // marks that this box should take the full width of the canvas (pushing down other boxes)
			reverse: false,

			// a callback that will handle
			onClick: jasmine.any(Function),
			onHover: null,

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

	it('should draw correctly', function() {
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
					data: []
				}],
				labels: []
			}
		});

		expect(chart.legend.legendHitBoxes.length).toBe(3);

		[
			{h: 12, l: 101, t: 10, w: 93},
			{h: 12, l: 205, t: 10, w: 93},
			{h: 12, l: 308, t: 10, w: 93}
		].forEach(function(expected, i) {
			expect(chart.legend.legendHitBoxes[i].height).toBeCloseToPixel(expected.h);
			expect(chart.legend.legendHitBoxes[i].left).toBeCloseToPixel(expected.l);
			expect(chart.legend.legendHitBoxes[i].top).toBeCloseToPixel(expected.t);
			expect(chart.legend.legendHitBoxes[i].width).toBeCloseToPixel(expected.w);
		});

		// NOTE(SB) We should get ride of the following tests and use image diff instead.
		// For now, as discussed with Evert Timberg, simply comment out.
		// See http://humblesoftware.github.io/js-imagediff/test.html
		/* chart.legend.ctx = window.createMockContext();
		chart.update();

		expect(chart.legend.ctx .getCalls()).toEqual([{
			"name": "measureText",
			"args": ["dataset1"]
		}, {
			"name": "measureText",
			"args": ["dataset2"]
		}, {
			"name": "measureText",
			"args": ["dataset3"]
		}, {
			"name": "measureText",
			"args": ["dataset1"]
		}, {
			"name": "measureText",
			"args": ["dataset2"]
		}, {
			"name": "measureText",
			"args": ["dataset3"]
		}, {
			"name": "setLineWidth",
			"args": [0.5]
		}, {
			"name": "setStrokeStyle",
			"args": ["#666"]
		}, {
			"name": "setFillStyle",
			"args": ["#666"]
		}, {
			"name": "measureText",
			"args": ["dataset1"]
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "setFillStyle",
			"args": ["#f31"]
		}, {
			"name": "setLineCap",
			"args": ["butt"]
		}, {
			"name": "setLineDashOffset",
			"args": [5.5]
		}, {
			"name": "setLineJoin",
			"args": ["miter"]
		}, {
			"name": "setLineWidth",
			"args": [3]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0,0,0,0.1)"]
		}, {
			"name": "setLineDash",
			"args": [
				[2, 2]
			]
		}, {
			"name": "strokeRect",
			"args": [114, 110, 40, 12]
		}, {
			"name": "fillRect",
			"args": [114, 110, 40, 12]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "fillText",
			"args": ["dataset1", 160, 110]
		}, {
			"name": "measureText",
			"args": ["dataset2"]
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "setFillStyle",
			"args": ["rgba(0,0,0,0.1)"]
		}, {
			"name": "setLineCap",
			"args": ["butt"]
		}, {
			"name": "setLineDashOffset",
			"args": [0]
		}, {
			"name": "setLineJoin",
			"args": ["miter"]
		}, {
			"name": "setLineWidth",
			"args": [3]
		}, {
			"name": "setStrokeStyle",
			"args": ["rgba(0,0,0,0.1)"]
		}, {
			"name": "setLineDash",
			"args": [
				[]
			]
		}, {
			"name": "strokeRect",
			"args": [250, 110, 40, 12]
		}, {
			"name": "fillRect",
			"args": [250, 110, 40, 12]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "fillText",
			"args": ["dataset2", 296, 110]
		}, {
			"name": "beginPath",
			"args": []
		}, {
			"name": "setLineWidth",
			"args": [2]
		}, {
			"name": "moveTo",
			"args": [296, 116]
		}, {
			"name": "lineTo",
			"args": [376, 116]
		}, {
			"name": "stroke",
			"args": []
		}, {
			"name": "measureText",
			"args": ["dataset3"]
		}, {
			"name": "save",
			"args": []
		}, {
			"name": "setFillStyle",
			"args": ["rgba(0,0,0,0.1)"]
		}, {
			"name": "setLineCap",
			"args": ["butt"]
		}, {
			"name": "setLineDashOffset",
			"args": [0]
		}, {
			"name": "setLineJoin",
			"args": ["miter"]
		}, {
			"name": "setLineWidth",
			"args": [10]
		}, {
			"name": "setStrokeStyle",
			"args": ["green"]
		}, {
			"name": "setLineDash",
			"args": [
				[]
			]
		}, {
			"name": "strokeRect",
			"args": [182, 132, 40, 12]
		}, {
			"name": "fillRect",
			"args": [182, 132, 40, 12]
		}, {
			"name": "restore",
			"args": []
		}, {
			"name": "fillText",
			"args": ["dataset3", 228, 132]
		}]);*/
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
});
