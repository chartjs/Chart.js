// Tests for the line element
describe('Line element tests', function() {
	it ('should be constructed', function() {
		var line = new Chart.elements.Line({
			_datasetindex: 2,
			_points: [1, 2, 3, 4]
		});

		expect(line).not.toBe(undefined);
		expect(line._datasetindex).toBe(2);
		expect(line._points).toEqual([1, 2, 3, 4]);
	});

	it ('should draw with default settings', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5
			}
		}));

		var line = new Chart.elements.Line({
			_datasetindex: 2,
			_chart: {
				ctx: mockContext,
			},
			_children: points,
			// Need to provide some settings
			_view: {
				fill: false, // don't want to fill
				tension: 0.0, // no bezier curve for now
			}
		})

		line.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'save',
			args: [],
		}, {
			name: 'moveTo',
			args: [0, 10]
		}, {
			name: 'lineTo',
			args: [5, 0]
		}, {
			name: 'lineTo',
			args: [15, -10]
		}, {
			name: 'lineTo',
			args: [19, -5]
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [[]]
		}, {
			name: 'setLineDashOffset',
			args: [0.0]
		}, {
			name: 'setLineJoin',
			args: ['miter']
		}, {
			name: 'setLineWidth',
			args: [3]
		}, {
			name: 'setStrokeStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 10]
		}, {
			name: 'lineTo',
			args: [5, 0]
		}, {
			name: 'lineTo',
			args: [15, -10]
		}, {
			name: 'lineTo',
			args: [19, -5]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}])
	});

	it ('should draw with custom settings', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5
			}
		}));

		var line = new Chart.elements.Line({
			_datasetindex: 2,
			_chart: {
				ctx: mockContext,
			},
			_children: points,
			// Need to provide some settings
			_view: {
				fill: true, 
				scaleZero: 2, // for filling lines
				tension: 0.0, // no bezier curve for now

				borderCapStyle: 'round',
				borderColor: 'rgb(255, 255, 0)',
				borderDash: [2, 2],
				borderDashOffset: 1.5,
				borderJoinStyle: 'bevel',
				borderWidth: 4,
				backgroundColor: 'rgb(0, 0, 0)'
			}
		})

		line.draw();

		var expected = [{
			name: 'save',
			args: [],
		}, {
			name: 'moveTo',
			args: [0, 10]
		}, {
			name: 'lineTo',
			args: [5, 0]
		}, {
			name: 'lineTo',
			args: [15, -10]
		}, {
			name: 'lineTo',
			args: [19, -5]
		}, {
			name: 'lineTo',
			args: [19, 2]
		}, {
			name: 'lineTo',
			args: [0, 2]
		}, {
			name: 'setFillStyle',
			args: ['rgb(0, 0, 0)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['round']
		}, {
			name: 'setLineDash',
			args: [[2, 2]]
		}, {
			name: 'setLineDashOffset',
			args: [1.5]
		}, {
			name: 'setLineJoin',
			args: ['bevel']
		}, {
			name: 'setLineWidth',
			args: [4]
		}, {
			name: 'setStrokeStyle',
			args: ['rgb(255, 255, 0)']
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 10]
		}, {
			name: 'lineTo',
			args: [5, 0]
		}, {
			name: 'lineTo',
			args: [15, -10]
		}, {
			name: 'lineTo',
			args: [19, -5]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected)
	});

	it ('should be able to draw with a loop back to the beginning point', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5
			}
		}));

		var line = new Chart.elements.Line({
			_datasetindex: 2,
			_chart: {
				ctx: mockContext,
			},
			_children: points,
			_loop: true, // want the line to loop back to the first point
			// Need to provide some settings
			_view: {
				fill: false, // don't want to fill
				tension: 0.0, // no bezier curve for now
			}
		})

		line.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'save',
			args: [],
		}, {
			name: 'moveTo',
			args: [0, 10]
		}, {
			name: 'lineTo',
			args: [5, 0]
		}, {
			name: 'lineTo',
			args: [15, -10]
		}, {
			name: 'lineTo',
			args: [19, -5]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [[]]
		}, {
			name: 'setLineDashOffset',
			args: [0.0]
		}, {
			name: 'setLineJoin',
			args: ['miter']
		}, {
			name: 'setLineWidth',
			args: [3]
		}, {
			name: 'setStrokeStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 10]
		}, {
			name: 'lineTo',
			args: [5, 0]
		}, {
			name: 'lineTo',
			args: [15, -10]
		}, {
			name: 'lineTo',
			args: [19, -5]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}])
	});

	it ('should draw with bezier curves if tension > 0', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 1,
				controlPointNextY: 1,
				controlPointPreviousX: 0,
				controlPointPreviousY: 0,
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointNextX: 6,
				controlPointNextY: 7,
				controlPointPreviousX: 4,
				controlPointPreviousY: 3,
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointNextX: 16,
				controlPointNextY: 17,
				controlPointPreviousX: 14,
				controlPointPreviousY: 13,
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointNextX: 20,
				controlPointNextY: 21,
				controlPointPreviousX: 18,
				controlPointPreviousY: 17,
			}
		}));

		var line = new Chart.elements.Line({
			_datasetindex: 2,
			_chart: {
				ctx: mockContext,
			},
			_children: points,
			// Need to provide some settings
			_view: {
				fill: true, 
				scaleZero: 2, // for filling lines
				tension: 0.5, // have bezier curves

				borderCapStyle: 'round',
				borderColor: 'rgb(255, 255, 0)',
				borderDash: [2, 2],
				borderDashOffset: 1.5,
				borderJoinStyle: 'bevel',
				borderWidth: 4,
				backgroundColor: 'rgb(0, 0, 0)'
			}
		})

		line.draw();

		var expected = [{
			name: 'save',
			args: [],
		}, {
			name: 'moveTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [1, 1, 4, 3, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [6, 7, 14, 13, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [16, 17, 18, 17, 19, -5]
		}, {
			name: 'lineTo',
			args: [19, 2]
		}, {
			name: 'lineTo',
			args: [0, 2]
		}, {
			name: 'setFillStyle',
			args: ['rgb(0, 0, 0)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['round']
		}, {
			name: 'setLineDash',
			args: [[2, 2]]
		}, {
			name: 'setLineDashOffset',
			args: [1.5]
		}, {
			name: 'setLineJoin',
			args: ['bevel']
		}, {
			name: 'setLineWidth',
			args: [4]
		}, {
			name: 'setStrokeStyle',
			args: ['rgb(255, 255, 0)']
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [1, 1, 4, 3, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [6, 7, 14, 13, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [16, 17, 18, 17, 19, -5]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected)
	});
});