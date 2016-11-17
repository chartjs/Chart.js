// Tests for the line element
describe('Line element tests', function() {
	it('should be constructed', function() {
		var line = new Chart.elements.Line({
			_datasetindex: 2,
			_points: [1, 2, 3, 4]
		});

		expect(line).not.toBe(undefined);
		expect(line._datasetindex).toBe(2);
		expect(line._points).toEqual([1, 2, 3, 4]);
	});

	it('should draw with default settings', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
				scaleZero: 0
			}
		});

		line.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'save',
			args: [],
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
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
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}]);
	});

	it('should draw with straight lines for a tension of 0', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10,
				tension: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0,
				tension: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10,
				tension: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5,
				tension: 0
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
				scaleZero: 0
			}
		});

		line.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'save',
			args: [],
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
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
		}]);
	});

	it('should draw stepped lines', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10,
				steppedLine: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0,
				steppedLine: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10,
				steppedLine: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5,
				steppedLine: true
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
				scaleZero: 0
			}
		});

		line.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'save',
			args: [],
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
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
			args: [5, 10]
		}, {
			name: 'lineTo',
			args: [5, 0]
		}, {
			name: 'lineTo',
			args: [15, 0]
		}, {
			name: 'lineTo',
			args: [15, -10]
		}, {
			name: 'lineTo',
			args: [19, -10]
		}, {
			name: 'lineTo',
			args: [19, -5]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}]);
	});

	it('should draw with custom settings', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
		});

		line.draw();

		var expected = [{
			name: 'save',
			args: []
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'lineTo',
			args: [19, 2]
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
			args: [
				[2, 2]
			]
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
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected);
	});

	it('should draw with fillMode top', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
				fill: 'top',
				scaleZero: 2, // for filling lines
				scaleTop: -2,
				scaleBottom: 10,
				tension: 0.0, // no bezier curve for now

				borderCapStyle: 'round',
				borderColor: 'rgb(255, 255, 0)',
				borderDash: [2, 2],
				borderDashOffset: 1.5,
				borderJoinStyle: 'bevel',
				borderWidth: 4,
				backgroundColor: 'rgb(0, 0, 0)'
			}
		});

		line.draw();

		var expected = [{
			name: 'save',
			args: []
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, -2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'lineTo',
			args: [19, -2]
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
			args: [
				[2, 2]
			]
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
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected);
	});

	it('should draw with fillMode bottom', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
				fill: 'bottom',
				scaleZero: 2, // for filling lines
				scaleTop: -2,
				scaleBottom: 10,
				tension: 0.0, // no bezier curve for now

				borderCapStyle: 'round',
				borderColor: 'rgb(255, 255, 0)',
				borderDash: [2, 2],
				borderDashOffset: 1.5,
				borderJoinStyle: 'bevel',
				borderWidth: 4,
				backgroundColor: 'rgb(0, 0, 0)'
			}
		});

		line.draw();

		var expected = [{
			name: 'save',
			args: []
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 10]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'lineTo',
			args: [19, 10]
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
			args: [
				[2, 2]
			]
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
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected);
	});

	it('should skip points correctly', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10,
				skip: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
			}
		});

		line.draw();

		var expected = [{
			name: 'save',
			args: []
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'lineTo',
			args: [5, 2]
		}, {
			name: 'lineTo',
			args: [19, 2]
		}, {
			name: 'lineTo',
			args: [19, -5]
		}, {
			name: 'lineTo',
			args: [19, 2]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
		}, {
			name: 'setLineDashOffset',
			args: [0]
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
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'moveTo',
			args: [19, -5]
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected);
	});

	it('should skip points correctly when spanGaps is true', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10,
				skip: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
				spanGaps: true
			}
		});

		line.draw();

		var expected = [{
			name: 'save',
			args: []
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 19, -5, 19, -5]
		}, {
			name: 'lineTo',
			args: [19, 2]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
		}, {
			name: 'setLineDashOffset',
			args: [0]
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
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 19, -5, 19, -5]
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected);
	});

	it('should skip points correctly when all points are skipped', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10,
				skip: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0,
				skip: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10,
				skip: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5,
				skip: true
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
				spanGaps: true
			}
		});

		line.draw();

		var expected = [{
			name: 'save',
			args: []
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 2]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
		}, {
			name: 'setLineDashOffset',
			args: [0]
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
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected);
	});

	it('should skip the first point correctly', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10,
				skip: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
			}
		});

		line.draw();

		var expected = [{
			name: 'save',
			args: []
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 2]
		}, {
			name: 'lineTo',
			args: [5, 2]
		}, {
			name: 'lineTo',
			args: [5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'lineTo',
			args: [19, 2]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
		}, {
			name: 'setLineDashOffset',
			args: [0]
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
			args: [5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected);
	});

	it('should skip the first point correctly when spanGaps is true', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10,
				skip: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
				spanGaps: true
			}
		});

		line.draw();

		var expected = [{
			name: 'save',
			args: []
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 2]
		}, {
			name: 'lineTo',
			args: [5, 2]
		}, {
			name: 'lineTo',
			args: [5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'lineTo',
			args: [19, 2]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
		}, {
			name: 'setLineDashOffset',
			args: [0]
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
			args: [5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected);
	});

	it('should skip the last point correctly', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5,
				skip: true
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
			}
		});

		line.draw();

		var expected = [{
			name: 'save',
			args: []
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'lineTo',
			args: [15, 2]
		}, {
			name: 'lineTo',
			args: [15, 2]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
		}, {
			name: 'setLineDashOffset',
			args: [0]
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
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected);
	});

	it('should skip the last point correctly when spanGaps is true', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5,
				skip: true
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
				spanGaps: true
			}
		});

		line.draw();

		var expected = [{
			name: 'save',
			args: []
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'lineTo',
			args: [15, 2]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
		}, {
			name: 'setLineDashOffset',
			args: [0]
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
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}];
		expect(mockContext.getCalls()).toEqual(expected);
	});

	it('should be able to draw with a loop back to the beginning point', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointPreviousX: 0,
				controlPointPreviousY: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
				fill: true, // don't want to fill
				tension: 0.0, // no bezier curve for now
				scaleZero: {
					x: 3,
					y: 2
				},
			}
		});

		line.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'save',
			args: [],
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [3, 2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'bezierCurveTo',
			args: [19, -5, 0, 10, 0, 10]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
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
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'bezierCurveTo',
			args: [19, -5, 0, 10, 0, 10]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}]);
	});

	it('should be able to draw with a loop back to the beginning point when there is a skip in the middle of the dataset', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointPreviousX: 0,
				controlPointPreviousY: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0,
				skip: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
				fill: true, // don't want to fill
				tension: 0.0, // no bezier curve for now
				scaleZero: {
					x: 3,
					y: 2
				},
			}
		});

		line.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'save',
			args: [],
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [3, 2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'lineTo',
			args: [3, 2]
		}, {
			name: 'lineTo',
			args: [15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'bezierCurveTo',
			args: [19, -5, 0, 10, 0, 10]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
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
			name: 'moveTo',
			args: [15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'bezierCurveTo',
			args: [19, -5, 0, 10, 0, 10]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}]);
	});

	it('should be able to draw with a loop back to the beginning point when span gaps is true and there is a skip in the middle of the dataset', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointPreviousX: 0,
				controlPointPreviousY: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0,
				skip: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
				fill: true, // don't want to fill
				tension: 0.0, // no bezier curve for now
				scaleZero: {
					x: 3,
					y: 2
				},
				spanGaps: true
			}
		});

		line.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'save',
			args: [],
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [3, 2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [0, 10, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'bezierCurveTo',
			args: [19, -5, 0, 10, 0, 10]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
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
			name: 'bezierCurveTo',
			args: [0, 10, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'bezierCurveTo',
			args: [19, -5, 0, 10, 0, 10]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}]);
	});

	it('should be able to draw with a loop back to the beginning point when the first point is skipped', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointPreviousX: 0,
				controlPointPreviousY: 10,
				controlPointNextX: 0,
				controlPointNextY: 10,
				skip: true
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0,
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5
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
				fill: true, // don't want to fill
				tension: 0.0, // no bezier curve for now
				scaleZero: {
					x: 3,
					y: 2
				},
			}
		});

		line.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'save',
			args: [],
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [3, 2]
		}, {
			name: 'lineTo',
			args: [5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'lineTo',
			args: [3, 2]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
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
			args: [5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'bezierCurveTo',
			args: [15, -10, 19, -5, 19, -5]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}]);
	});

	it('should be able to draw with a loop back to the beginning point when the last point is skipped', function() {
		var mockContext = window.createMockContext();

		// Create our points
		var points = [];
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 0,
			_view: {
				x: 0,
				y: 10,
				controlPointPreviousX: 0,
				controlPointPreviousY: 10,
				controlPointNextX: 0,
				controlPointNextY: 10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 1,
			_view: {
				x: 5,
				y: 0,
				controlPointPreviousX: 5,
				controlPointPreviousY: 0,
				controlPointNextX: 5,
				controlPointNextY: 0,
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 2,
			_view: {
				x: 15,
				y: -10,
				controlPointPreviousX: 15,
				controlPointPreviousY: -10,
				controlPointNextX: 15,
				controlPointNextY: -10
			}
		}));
		points.push(new Chart.elements.Point({
			_datasetindex: 2,
			_index: 3,
			_view: {
				x: 19,
				y: -5,
				controlPointPreviousX: 19,
				controlPointPreviousY: -5,
				controlPointNextX: 19,
				controlPointNextY: -5,
				skip: true
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
				fill: true, // don't want to fill
				tension: 0.0, // no bezier curve for now
				scaleZero: {
					x: 3,
					y: 2
				},
			}
		});

		line.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'save',
			args: [],
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [3, 2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'lineTo',
			args: [3, 2]
		}, {
			name: 'lineTo',
			args: [0, 10]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: []
		}, {
			name: 'setLineCap',
			args: ['butt']
		}, {
			name: 'setLineDash',
			args: [
				[]
			]
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
			name: 'bezierCurveTo',
			args: [0, 10, 5, 0, 5, 0]
		}, {
			name: 'bezierCurveTo',
			args: [5, 0, 15, -10, 15, -10]
		}, {
			name: 'moveTo',
			args: [0, 10]
		}, {
			name: 'stroke',
			args: [],
		}, {
			name: 'restore',
			args: []
		}]);
	});
});
