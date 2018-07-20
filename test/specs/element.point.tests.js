// Test the point element

describe('Point element tests', function() {
	it ('Should be constructed', function() {
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1
		});

		expect(point).not.toBe(undefined);
		expect(point._datasetIndex).toBe(2);
		expect(point._index).toBe(1);
	});

	it ('Should correctly identify as in range', function() {
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1
		});

		// Safely handles if these are called before the viewmodel is instantiated
		expect(point.inRange(5)).toBe(false);
		expect(point.inLabelRange(5)).toBe(false);

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			hitRadius: 3,
			x: 10,
			y: 15
		};

		expect(point.inRange(10, 15)).toBe(true);
		expect(point.inRange(10, 10)).toBe(false);
		expect(point.inRange(10, 5)).toBe(false);
		expect(point.inRange(5, 5)).toBe(false);

		expect(point.inLabelRange(5)).toBe(false);
		expect(point.inLabelRange(7)).toBe(true);
		expect(point.inLabelRange(10)).toBe(true);
		expect(point.inLabelRange(12)).toBe(true);
		expect(point.inLabelRange(15)).toBe(false);
		expect(point.inLabelRange(20)).toBe(false);
	});

	it ('should get the correct tooltip position', function() {
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			borderWidth: 6,
			x: 10,
			y: 15
		};

		expect(point.tooltipPosition()).toEqual({
			x: 10,
			y: 15,
			padding: 8
		});
	});

	it('should get the correct area', function() {
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
		};

		expect(point.getArea()).toEqual(Math.PI * 4);
	});

	it('should get the correct center point', function() {
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			x: 10,
			y: 10
		};

		expect(point.getCenterPoint()).toEqual({x: 10, y: 10});
	});

	it ('should draw correctly', function() {
		var mockContext = window.createMockContext();
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1,
			_chart: {
				ctx: mockContext,
			}
		});

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			pointStyle: 'circle',
			rotation: 25,
			hitRadius: 3,
			borderColor: 'rgba(1, 2, 3, 1)',
			borderWidth: 6,
			backgroundColor: 'rgba(0, 255, 0)',
			x: 10,
			y: 15,
			ctx: mockContext
		};
		var tx = point._view.x - point._view.radius;
		var ty = point._view.y - point._view.radius;
		var tw = point._view.radius * 2;

		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setStrokeStyle',
			args: ['rgba(1, 2, 3, 1)']
		}, {
			name: 'setLineWidth',
			args: [6]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0, 255, 0)']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [tx, ty]
		}, {
			name: 'rotate',
			args: [25 * Math.PI / 180]
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'arc',
			args: [2, 2, 2, 0, 2 * Math.PI]
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'fill',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}]);

		mockContext.resetCalls();
		point._view.pointStyle = 'triangle';
		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setStrokeStyle',
			args: ['rgba(1, 2, 3, 1)']
		}, {
			name: 'setLineWidth',
			args: [6]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0, 255, 0)']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [tx, ty]
		}, {
			name: 'rotate',
			args: [25 * Math.PI / 180]
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, tw]
		}, {
			name: 'lineTo',
			args: [tw / 2, 0],
		}, {
			name: 'lineTo',
			args: [tw, tw],
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'fill',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}]);

		mockContext.resetCalls();
		point._view.pointStyle = 'rect';
		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setStrokeStyle',
			args: ['rgba(1, 2, 3, 1)']
		}, {
			name: 'setLineWidth',
			args: [6]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0, 255, 0)']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [tx, ty]
		}, {
			name: 'rotate',
			args: [25 * Math.PI / 180]
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'rect',
			args: [0, 0, tw, tw]
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'fill',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}]);

		var drawRoundedRectangleSpy = jasmine.createSpy('drawRoundedRectangle');
		var drawRoundedRectangle = Chart.helpers.canvas.roundedRect;
		Chart.helpers.canvas.roundedRect = drawRoundedRectangleSpy;
		mockContext.resetCalls();
		point._view.pointStyle = 'rectRounded';
		point.draw();

		expect(drawRoundedRectangleSpy).toHaveBeenCalledWith(
			mockContext,
			0,
			0,
			tw,
			tw,
			tw * Math.SQRT2 / 4
		);
		expect(mockContext.getCalls()).toContain(
			jasmine.objectContaining({
				name: 'fill',
				args: [],
			})
		);

		Chart.helpers.canvas.roundedRect = drawRoundedRectangle;
		mockContext.resetCalls();
		point._view.pointStyle = 'rectRot';
		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setStrokeStyle',
			args: ['rgba(1, 2, 3, 1)']
		}, {
			name: 'setLineWidth',
			args: [6]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0, 255, 0)']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [tx, ty]
		}, {
			name: 'rotate',
			args: [25 * Math.PI / 180]
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, tw / 2]
		}, {
			name: 'lineTo',
			args: [tw / 2, 0]
		}, {
			name: 'lineTo',
			args: [tw, tw / 2],
		}, {
			name: 'lineTo',
			args: [tw / 2, tw],
		}, {
			name: 'closePath',
			args: []
		}, {
			name: 'fill',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}]);

		mockContext.resetCalls();
		point._view.pointStyle = 'cross';
		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setStrokeStyle',
			args: ['rgba(1, 2, 3, 1)']
		}, {
			name: 'setLineWidth',
			args: [6]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0, 255, 0)']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [tx, ty]
		}, {
			name: 'rotate',
			args: [25 * Math.PI / 180]
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [tw / 2, 0]
		}, {
			name: 'lineTo',
			args: [tw / 2, tw],
		}, {
			name: 'moveTo',
			args: [0, tw / 2],
		}, {
			name: 'lineTo',
			args: [tw, tw / 2],
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}]);

		mockContext.resetCalls();
		point._view.pointStyle = 'crossRot';
		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setStrokeStyle',
			args: ['rgba(1, 2, 3, 1)']
		}, {
			name: 'setLineWidth',
			args: [6]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0, 255, 0)']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [tx, ty]
		}, {
			name: 'rotate',
			args: [25 * Math.PI / 180]
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, 0]
		}, {
			name: 'lineTo',
			args: [tw, tw],
		}, {
			name: 'moveTo',
			args: [0, tw],
		}, {
			name: 'lineTo',
			args: [tw, 0],
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}]);

		mockContext.resetCalls();
		point._view.pointStyle = 'star';
		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setStrokeStyle',
			args: ['rgba(1, 2, 3, 1)']
		}, {
			name: 'setLineWidth',
			args: [6]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0, 255, 0)']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [tx, ty]
		}, {
			name: 'rotate',
			args: [25 * Math.PI / 180]
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [tw / 2, 0]
		}, {
			name: 'lineTo',
			args: [tw / 2, tw],
		}, {
			name: 'moveTo',
			args: [0, tw / 2],
		}, {
			name: 'lineTo',
			args: [tw, tw / 2],
		}, {
			name: 'moveTo',
			args: [0, 0]
		}, {
			name: 'lineTo',
			args: [tw, tw],
		}, {
			name: 'moveTo',
			args: [0, tw],
		}, {
			name: 'lineTo',
			args: [tw, 0],
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}]);

		mockContext.resetCalls();
		point._view.pointStyle = 'line';
		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setStrokeStyle',
			args: ['rgba(1, 2, 3, 1)']
		}, {
			name: 'setLineWidth',
			args: [6]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0, 255, 0)']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [tx, ty]
		}, {
			name: 'rotate',
			args: [25 * Math.PI / 180]
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [0, tw / 2]
		}, {
			name: 'lineTo',
			args: [tw, tw / 2],
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}]);

		mockContext.resetCalls();
		point._view.pointStyle = 'dash';
		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setStrokeStyle',
			args: ['rgba(1, 2, 3, 1)']
		}, {
			name: 'setLineWidth',
			args: [6]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0, 255, 0)']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [tx, ty]
		}, {
			name: 'rotate',
			args: [25 * Math.PI / 180]
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'moveTo',
			args: [tw / 2, tw / 2]
		}, {
			name: 'lineTo',
			args: [tw, tw / 2],
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}, {
			name: 'restore',
			args: []
		}]);

	});

	it ('should draw correctly with default settings if necessary', function() {
		var mockContext = window.createMockContext();
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1,
			_chart: {
				ctx: mockContext,
			}
		});

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			hitRadius: 3,
			x: 10,
			y: 15,
			ctx: mockContext
		};

		point.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setStrokeStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'setLineWidth',
			args: [1]
		}, {
			name: 'setFillStyle',
			args: ['rgba(0,0,0,0.1)']
		}, {
			name: 'beginPath',
			args: []
		}, {
			name: 'arc',
			args: [10, 15, 2, 0, 2 * Math.PI]
		}, {
			name: 'closePath',
			args: [],
		}, {
			name: 'fill',
			args: [],
		}, {
			name: 'stroke',
			args: []
		}]);
	});

	it ('should not draw if skipped', function() {
		var mockContext = window.createMockContext();
		var point = new Chart.elements.Point({
			_datasetIndex: 2,
			_index: 1,
			_chart: {
				ctx: mockContext,
			}
		});

		// Attach a view object as if we were the controller
		point._view = {
			radius: 2,
			hitRadius: 3,
			x: 10,
			y: 15,
			ctx: mockContext,
			skip: true
		};

		point.draw();

		expect(mockContext.getCalls()).toEqual([]);
	});
});
