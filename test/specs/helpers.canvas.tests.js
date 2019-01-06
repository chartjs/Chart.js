'use strict';

describe('Chart.helpers.canvas', function() {
	describe('auto', jasmine.fixture.specs('helpers.canvas'));

	var helpers = Chart.helpers;

	describe('clear', function() {
		it('should clear the chart canvas', function() {
			var chart = acquireChart({}, {
				canvas: {
					style: 'width: 150px; height: 245px'
				}
			});

			spyOn(chart.ctx, 'clearRect');

			helpers.canvas.clear(chart);

			expect(chart.ctx.clearRect.calls.count()).toBe(1);
			expect(chart.ctx.clearRect.calls.first().object).toBe(chart.ctx);
			expect(chart.ctx.clearRect.calls.first().args).toEqual([0, 0, 150, 245]);
		});
	});

	describe('roundedRect', function() {
		it('should create a rounded rectangle path', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 30, 40, 5);

			expect(context.getCalls()).toEqual([
				{name: 'moveTo', args: [10, 25]},
				{name: 'arc', args: [15, 25, 5, -Math.PI, -Math.PI / 2]},
				{name: 'arc', args: [35, 25, 5, -Math.PI / 2, 0]},
				{name: 'arc', args: [35, 55, 5, 0, Math.PI / 2]},
				{name: 'arc', args: [15, 55, 5, Math.PI / 2, Math.PI]},
				{name: 'closePath', args: []},
				{name: 'moveTo', args: [10, 20]}
			]);
		});
		it('should optimize path if radius is exactly half of height', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 40, 30, 15);

			expect(context.getCalls()).toEqual([
				{name: 'moveTo', args: [10, 35]},
				{name: 'moveTo', args: [25, 20]},
				{name: 'arc', args: [35, 35, 15, -Math.PI / 2, Math.PI / 2]},
				{name: 'arc', args: [25, 35, 15, Math.PI / 2, Math.PI * 3 / 2]},
				{name: 'closePath', args: []},
				{name: 'moveTo', args: [10, 20]}
			]);
		});
		it('should optimize path if radius is exactly half of width', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 30, 40, 15);

			expect(context.getCalls()).toEqual([
				{name: 'moveTo', args: [10, 35]},
				{name: 'arc', args: [25, 35, 15, -Math.PI, 0]},
				{name: 'arc', args: [25, 45, 15, 0, Math.PI]},
				{name: 'closePath', args: []},
				{name: 'moveTo', args: [10, 20]}
			]);
		});
		it('should optimize path if radius is exactly half of width and height', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 30, 30, 15);

			expect(context.getCalls()).toEqual([
				{name: 'moveTo', args: [10, 35]},
				{name: 'arc', args: [25, 35, 15, -Math.PI, Math.PI]},
				{name: 'closePath', args: []},
				{name: 'moveTo', args: [10, 20]}
			]);
		});
		it('should optimize path if radius is 0', function() {
			var context = window.createMockContext();

			helpers.canvas.roundedRect(context, 10, 20, 30, 40, 0);

			expect(context.getCalls()).toEqual([{name: 'rect', args: [10, 20, 30, 40]}]);
		});
	});

	describe('isPointInArea', function() {
		it('should determine if a point is in the area', function() {
			var isPointInArea = helpers.canvas._isPointInArea;
			var area = {left: 0, top: 0, right: 512, bottom: 256};

			expect(isPointInArea({x: 0, y: 0}, area)).toBe(true);
			expect(isPointInArea({x: -1e-12, y: -1e-12}, area)).toBe(true);
			expect(isPointInArea({x: 512, y: 256}, area)).toBe(true);
			expect(isPointInArea({x: 512 + 1e-12, y: 256 + 1e-12}, area)).toBe(true);
			expect(isPointInArea({x: -1e-3, y: 0}, area)).toBe(false);
			expect(isPointInArea({x: 0, y: 256 + 1e-3}, area)).toBe(false);
		});
	});

	describe('longestText', function() {
		it('should return the width of the longest text in an Array and 2D Array', function() {
			var context = window.createMockContext();
			var font = "normal 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
			var arrayOfThings1D = ['FooBar', 'Bar'];
			var arrayOfThings2D = [['FooBar_1', 'Bar_2'], 'Foo_1'];


			// Regardless 'FooBar' is the longest label it should return (characters * 10)
			expect(helpers.canvas.longestText(context, font, arrayOfThings1D, {})).toEqual(60);
			expect(helpers.canvas.longestText(context, font, arrayOfThings2D, {})).toEqual(80);
			// We check to make sure we made the right calls to the canvas.
			expect(context.getCalls()).toEqual([{
				name: 'measureText',
				args: ['FooBar']
			}, {
				name: 'measureText',
				args: ['Bar']
			}, {
				name: 'measureText',
				args: ['FooBar_1']
			}, {
				name: 'measureText',
				args: ['Bar_2']
			}, {
				name: 'measureText',
				args: ['Foo_1']
			}]);
		});
	});
	describe('measureText', function() {
		it('compare text with current longest and update', function() {
			var context = window.createMockContext();
			var data = {};
			var gc = [];
			var longest = 70;

			expect(helpers.canvas.measureText(context, data, gc, longest, 'foobar')).toEqual(70);
			expect(helpers.canvas.measureText(context, data, gc, longest, 'foobar_')).toEqual(70);
			expect(helpers.canvas.measureText(context, data, gc, longest, 'foobar_1')).toEqual(80);
			// We check to make sure we made the right calls to the canvas.
			expect(context.getCalls()).toEqual([{
				name: 'measureText',
				args: ['foobar']
			}, {
				name: 'measureText',
				args: ['foobar_']
			}, {
				name: 'measureText',
				args: ['foobar_1']
			}]);
		});
	});
	describe('numberOfLabelLines', function() {
		it('count look at all the labels and return maximum number of lines', function() {
			window.createMockContext();
			var arrayOfThings1 = ['Foo', 'Bar'];
			var arrayOfThings2 = [['Foo', 'Bar'], 'Foo'];
			var arrayOfThings3 = [['Foo', 'Bar', 'Boo'], ['Foo', 'Bar'], 'Foo'];

			expect(helpers.canvas.numberOfLabelLines(arrayOfThings1)).toEqual(1);
			expect(helpers.canvas.numberOfLabelLines(arrayOfThings2)).toEqual(2);
			expect(helpers.canvas.numberOfLabelLines(arrayOfThings3)).toEqual(3);
		});
	});

	describe('Color helper', function() {
		function isColorInstance(obj) {
			return typeof obj === 'object' && obj.hasOwnProperty('values') && obj.values.hasOwnProperty('rgb');
		}

		it('should return a color when called with a color', function() {
			expect(isColorInstance(helpers.canvas.color('rgb(1, 2, 3)'))).toBe(true);
		});

		it('should return a color when called with a CanvasGradient instance', function() {
			var context = document.createElement('canvas').getContext('2d');
			var gradient = context.createLinearGradient(0, 1, 2, 3);

			expect(isColorInstance(helpers.canvas.color(gradient))).toBe(true);
		});
	});

	describe('Background hover color helper', function() {
		it('should return a CanvasPattern when called with a CanvasPattern', function(done) {
			var dots = new Image();
			dots.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAAD1BMVEUAAAD///////////////+PQt5oAAAABXRSTlMAHlFhZsfk/BEAAAAqSURBVHgBY2BgZGJmYmSAAUYWEIDzmcBcJhiXGcxlRpPFrhdmMiqgvX0AcGIBEUAo6UAAAAAASUVORK5CYII=';
			dots.onload = function() {
				var chartContext = document.createElement('canvas').getContext('2d');
				var patternCanvas = document.createElement('canvas');
				var patternContext = patternCanvas.getContext('2d');
				var pattern = patternContext.createPattern(dots, 'repeat');
				patternContext.fillStyle = pattern;

				var backgroundColor = helpers.canvas.getHoverColor(chartContext.createPattern(patternCanvas, 'repeat'));

				expect(backgroundColor instanceof CanvasPattern).toBe(true);

				done();
			};
		});

		it('should return a CanvasGradient when called with a CanvasGradient', function() {
			var context = document.createElement('canvas').getContext('2d');
			var gradient = context.createLinearGradient(0, 1, 2, 3);

			expect(helpers.canvas.getHoverColor(gradient) instanceof CanvasGradient).toBe(true);
		});

		it('should return a modified version of color when called with a color', function() {
			var originalColorRGB = 'rgb(70, 191, 189)';

			expect(helpers.canvas.getHoverColor('#46BFBD')).not.toEqual(originalColorRGB);
		});
	});
});
