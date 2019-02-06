// Test the rectangle element

describe('Rectangle element tests', function() {
	it ('Should be constructed', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		expect(rectangle).not.toBe(undefined);
		expect(rectangle._datasetIndex).toBe(2);
		expect(rectangle._index).toBe(1);
	});

	it ('Should correctly identify as in range', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Safely handles if these are called before the viewmodel is instantiated
		expect(rectangle.inRange(5)).toBe(false);
		expect(rectangle.inLabelRange(5)).toBe(false);

		// Attach a view object as if we were the controller
		rectangle._view = {
			base: 0,
			width: 4,
			x: 10,
			y: 15
		};

		expect(rectangle.inRange(10, 15)).toBe(true);
		expect(rectangle.inRange(10, 10)).toBe(true);
		expect(rectangle.inRange(10, 16)).toBe(false);
		expect(rectangle.inRange(5, 5)).toBe(false);

		expect(rectangle.inLabelRange(5)).toBe(false);
		expect(rectangle.inLabelRange(7)).toBe(false);
		expect(rectangle.inLabelRange(10)).toBe(true);
		expect(rectangle.inLabelRange(12)).toBe(true);
		expect(rectangle.inLabelRange(15)).toBe(false);
		expect(rectangle.inLabelRange(20)).toBe(false);

		// Test when the y is below the base (negative bar)
		var negativeRectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		negativeRectangle._view = {
			base: 0,
			width: 4,
			x: 10,
			y: -15
		};

		expect(negativeRectangle.inRange(10, -16)).toBe(false);
		expect(negativeRectangle.inRange(10, 1)).toBe(false);
		expect(negativeRectangle.inRange(10, -5)).toBe(true);
	});

	it ('should get the correct height', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			base: 0,
			width: 4,
			x: 10,
			y: 15
		};

		expect(rectangle.height()).toBe(-15);

		// Test when the y is below the base (negative bar)
		var negativeRectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		negativeRectangle._view = {
			base: -10,
			width: 4,
			x: 10,
			y: -15
		};
		expect(negativeRectangle.height()).toBe(5);
	});

	it ('should get the correct tooltip position', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			base: 0,
			width: 4,
			x: 10,
			y: 15
		};

		expect(rectangle.tooltipPosition()).toEqual({
			x: 10,
			y: 15,
		});

		// Test when the y is below the base (negative bar)
		var negativeRectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		negativeRectangle._view = {
			base: -10,
			width: 4,
			x: 10,
			y: -15
		};

		expect(negativeRectangle.tooltipPosition()).toEqual({
			x: 10,
			y: -15,
		});
	});

	it ('should get the correct vertical area', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			base: 0,
			width: 4,
			x: 10,
			y: 15
		};

		expect(rectangle.getArea()).toEqual(60);
	});

	it ('should get the correct horizontal area', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			base: 0,
			height: 4,
			x: 10,
			y: 15
		};

		expect(rectangle.getArea()).toEqual(40);
	});

	it ('should get the center', function() {
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			base: 0,
			width: 4,
			x: 10,
			y: 15
		};

		expect(rectangle.getCenterPoint()).toEqual({x: 10, y: 7.5});
	});

	it ('should draw correctly', function() {
		var mockContext = window.createMockContext();
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1,
			_chart: {
				ctx: mockContext,
			}
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			backgroundColor: 'rgb(255, 0, 0)',
			base: 0,
			borderColor: 'rgb(0, 0, 255)',
			borderWidth: 1,
			ctx: mockContext,
			width: 4,
			x: 10,
			y: 15,
		};

		rectangle.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setFillStyle',
			args: ['rgb(255, 0, 0)']
		}, {
			name: 'setStrokeStyle',
			args: ['rgb(0, 0, 255)'],
		}, {
			name: 'fillRect',
			args: [9, 0, 2, 14],
		}, {
			name: 'beginPath',
			args: [],
		}, {
			name: 'moveTo',
			args: [8.5, 0]
		}, {
			name: 'lineTo',
			args: [8.5, 14.5] // This is a minus bar. Not 15.5
		}, {
			name: 'lineTo',
			args: [11.5, 14.5]
		}, {
			name: 'lineTo',
			args: [11.5, 0]
		}, {
			name: 'setLineWidth',
			args: [1]
		}, {
			name: 'stroke',
			args: []
		}]);
	});

	it ('should draw correctly with no stroke', function() {
		var mockContext = window.createMockContext();
		var rectangle = new Chart.elements.Rectangle({
			_datasetIndex: 2,
			_index: 1,
			_chart: {
				ctx: mockContext,
			}
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			backgroundColor: 'rgb(255, 0, 0)',
			base: 0,
			borderColor: 'rgb(0, 0, 255)',
			ctx: mockContext,
			width: 4,
			x: 10,
			y: 15,
		};

		rectangle.draw();

		expect(mockContext.getCalls()).toEqual([{
			name: 'setFillStyle',
			args: ['rgb(255, 0, 0)']
		}, {
			name: 'setStrokeStyle',
			args: ['rgb(0, 0, 255)'],
		}, {
			name: 'fillRect',
			args: [8, 0, 4, 15],
		}]);
	});

	function testBorderSkipped(borderSkipped, expectedDrawCalls) {
		var mockContext = window.createMockContext();
		var rectangle = new Chart.elements.Rectangle({
			_chart: {ctx: mockContext}
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			borderWidth: 2,
			borderSkipped: borderSkipped, // set tested 'borderSkipped' parameter
			ctx: mockContext,
			base: 0,
			width: 4,
			x: 10,
			y: 15,
		};

		rectangle.draw();

		var drawCalls = rectangle._view.ctx.getCalls().splice(4, 5);
		expect(drawCalls).toEqual(expectedDrawCalls);
	}

	it ('should draw correctly respecting "borderSkipped" == "bottom"', function() {
		testBorderSkipped ('bottom', [
			{name: 'moveTo', args: [9, 0]},
			{name: 'lineTo', args: [9, 14]},
			{name: 'lineTo', args: [11, 14]},
			{name: 'lineTo', args: [11, 0]},
			{name: 'setLineWidth', args: [2]},
		]);
	});

	it ('should draw correctly respecting "borderSkipped" == "left"', function() {
		testBorderSkipped ('left', [
			{name: 'moveTo', args: [12, 1]},
			{name: 'lineTo', args: [8, 1]},
			{name: 'moveTo', args: [8, 14]},
			{name: 'lineTo', args: [11, 14]},
			{name: 'lineTo', args: [11, 1]},
		]);
	});

	it ('should draw correctly respecting "borderSkipped" == "top"', function() {
		testBorderSkipped ('top', [
			{name: 'moveTo', args: [12, 1]},
			{name: 'lineTo', args: [9, 1]},
			{name: 'lineTo', args: [9, 15]},
			{name: 'moveTo', args: [11, 15]},
			{name: 'lineTo', args: [11, 1]},
		]);
	});

	it ('should draw correctly respecting "borderSkipped" == "right"', function() {
		testBorderSkipped ('right', [
			{name: 'moveTo', args: [12, 1]},
			{name: 'lineTo', args: [9, 1]},
			{name: 'lineTo', args: [9, 14]},
			{name: 'lineTo', args: [12, 14]},
			{name: 'setLineWidth', args: [2]},
		]);
	});

	it ('should draw correctly respecting "borderSkipped" == "none"', function() {
		testBorderSkipped ('none', [
			{name: 'moveTo', args: [12, 1]},
			{name: 'lineTo', args: [9, 1]},
			{name: 'lineTo', args: [9, 14]},
			{name: 'lineTo', args: [11, 14]},
			{name: 'lineTo', args: [11, 1]},
		]);
	});

	it ('should draw correctly respecting "borderSkipped" == {left: true, right: true}', function() {
		testBorderSkipped({left: true, right: true}, [
			{name: 'moveTo', args: [12, 1]},
			{name: 'lineTo', args: [8, 1]},
			{name: 'moveTo', args: [8, 14]},
			{name: 'lineTo', args: [12, 14]},
			{name: 'setLineWidth', args: [2]},
		]);
	});

	it ('should draw correctly respecting "borderSkipped" == {top: true, bottom: true}', function() {
		testBorderSkipped({top: true, bottom: true}, [
			{name: 'moveTo', args: [9, 0]},
			{name: 'lineTo', args: [9, 15]},
			{name: 'moveTo', args: [11, 15]},
			{name: 'lineTo', args: [11, 0]},
			{name: 'setLineWidth', args: [2]},
		]);
	});

	function testBorderWidth(borderWidth, expectedDrawCalls) {
		var mockContext = window.createMockContext();
		var rectangle = new Chart.elements.Rectangle({
			_chart: {ctx: mockContext}
		});

		// Attach a view object as if we were the controller
		rectangle._view = {
			borderWidth: borderWidth,
			ctx: mockContext,
			base: 0,
			width: 4,
			x: 10,
			y: 15,
		};

		rectangle.draw();

		var drawCalls = rectangle._view.ctx.getCalls().slice(4);
		expect(drawCalls).toEqual(expectedDrawCalls);
	}

	it ('should draw correctly respecting "borderWidth" == {bottom: 4, left: 1, top: 2, right: 3}', function() {
		testBorderWidth({bottom: 4, left: 1, top: 2, right: 3}, [
			{name: 'moveTo', args: [12, 2]},
			{name: 'lineTo', args: [8.5, 2]},
			{name: 'setLineWidth', args: [4]},
			{name: 'stroke', args: []},
			{name: 'beginPath', args: []},
			{name: 'moveTo', args: [8.5, 0]},
			{name: 'lineTo', args: [8.5, 14]},
			{name: 'setLineWidth', args: [1]},
			{name: 'stroke', args: []},
			{name: 'beginPath', args: []},
			{name: 'moveTo', args: [8, 14]},
			{name: 'lineTo', args: [10.5, 14]},
			{name: 'setLineWidth', args: [2]},
			{name: 'stroke', args: []},
			{name: 'beginPath', args: []},
			{name: 'moveTo', args: [10.5, 15]},
			{name: 'lineTo', args: [10.5, 2]},
			{name: 'setLineWidth', args: [3]},
			{name: 'stroke', args: []},
		]);
	});

});
