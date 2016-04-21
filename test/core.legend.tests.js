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

			labels: {
				boxWidth: 40,
				padding: 10,
				generateLabels: jasmine.any(Function)
			}
		});
	});

	it('should update correctly', function() {
		var chart = {
			data: {
				datasets: [{
					label: 'dataset1',
					backgroundColor: '#f31',
					borderCapStyle: 'butt',
					borderDash: [2, 2],
					borderDashOffset: 5.5
				}, {
					label: 'dataset2',
					hidden: true,
					borderJoinStyle: 'miter',
				}, {
					label: 'dataset3',
					borderWidth: 10,
					borderColor: 'green'
				}]
			}
		};
		var context = window.createMockContext();
		var options = Chart.helpers.clone(Chart.defaults.global.legend);
		var legend = new Chart.Legend({
			chart: chart,
			ctx: context,
			options: options
		});

		var minSize = legend.update(400, 200);
		expect(minSize).toEqual({
			width: 400,
			height: 54
		});
		expect(legend.legendItems).toEqual([{
			text: 'dataset1',
			fillStyle: '#f31',
			hidden: undefined,
			lineCap: 'butt',
			lineDash: [2, 2],
			lineDashOffset: 5.5,
			lineJoin: undefined,
			lineWidth: undefined,
			strokeStyle: undefined,
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
			datasetIndex: 1
		}, {
			text: 'dataset3',
			fillStyle: undefined,
			hidden: undefined,
			lineCap: undefined,
			lineDash: undefined,
			lineDashOffset: undefined,
			lineJoin: undefined,
			lineWidth: 10,
			strokeStyle: 'green',
			datasetIndex: 2
		}]);
	});

	it('should draw correctly', function() {
		var chart = {
			data: {
				datasets: [{
					label: 'dataset1',
					backgroundColor: '#f31',
					borderCapStyle: 'butt',
					borderDash: [2, 2],
					borderDashOffset: 5.5
				}, {
					label: 'dataset2',
					hidden: true,
					borderJoinStyle: 'miter',
				}, {
					label: 'dataset3',
					borderWidth: 10,
					borderColor: 'green'
				}]
			}
		};
		var context = window.createMockContext();
		var options = Chart.helpers.clone(Chart.defaults.global.legend);
		var legend = new Chart.Legend({
			chart: chart,
			ctx: context,
			options: options
		});

		var minSize = legend.update(400, 200);
		legend.left = 50;
		legend.top = 100;
		legend.right = legend.left + minSize.width;
		legend.bottom = legend.top + minSize.height;

		legend.draw();
		expect(legend.legendHitBoxes).toEqual([{
			left: 114,
			top: 110,
			width: 126,
			height: 12
		}, {
			left: 250,
			top: 110,
			width: 126,
			height: 12
		}, {
			left: 182,
			top: 132,
			width: 126,
			height: 12
		}]);
		expect(context.getCalls()).toEqual([{
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
		}]);
	});
});
