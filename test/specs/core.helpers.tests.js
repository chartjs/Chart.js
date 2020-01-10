describe('Core helper tests', function() {

	var helpers;

	beforeAll(function() {
		helpers = window.Chart.helpers;
	});

	it('should filter an array', function() {
		var data = [-10, 0, 6, 0, 7];
		var callback = function(item) {
			return item > 2;
		};
		expect(helpers.findNextWhere(data, callback)).toEqual(6);
		expect(helpers.findNextWhere(data, callback, 2)).toBe(7);
		expect(helpers.findNextWhere(data, callback, 4)).toBe(undefined);
		expect(helpers.findPreviousWhere(data, callback)).toBe(7);
		expect(helpers.findPreviousWhere(data, callback, 3)).toBe(6);
		expect(helpers.findPreviousWhere(data, callback, 0)).toBe(undefined);
	});

	it('should generate integer ids', function() {
		var uid = helpers.uid();
		expect(uid).toEqual(jasmine.any(Number));
		expect(helpers.uid()).toBe(uid + 1);
		expect(helpers.uid()).toBe(uid + 2);
		expect(helpers.uid()).toBe(uid + 3);
	});

	it('should return the width of the longest text in an Array and 2D Array', function() {
		var context = window.createMockContext();
		var font = "normal 12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
		var arrayOfThings1D = ['FooBar', 'Bar'];
		var arrayOfThings2D = [['FooBar_1', 'Bar_2'], 'Foo_1'];


		// Regardless 'FooBar' is the longest label it should return (characters * 10)
		expect(helpers.longestText(context, font, arrayOfThings1D, {})).toEqual(60);
		expect(helpers.longestText(context, font, arrayOfThings2D, {})).toEqual(80);
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

	it('compare text with current longest and update', function() {
		var context = window.createMockContext();
		var data = {};
		var gc = [];
		var longest = 70;

		expect(helpers.measureText(context, data, gc, longest, 'foobar')).toEqual(70);
		expect(helpers.measureText(context, data, gc, longest, 'foobar_')).toEqual(70);
		expect(helpers.measureText(context, data, gc, longest, 'foobar_1')).toEqual(80);
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

	describe('Color helper', function() {
		function isColorInstance(obj) {
			return typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, 'values') && Object.prototype.hasOwnProperty.call(obj.values, 'rgb');
		}

		it('should return a color when called with a color', function() {
			expect(isColorInstance(helpers.color('rgb(1, 2, 3)'))).toBe(true);
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

				var backgroundColor = helpers.getHoverColor(chartContext.createPattern(patternCanvas, 'repeat'));

				expect(backgroundColor instanceof CanvasPattern).toBe(true);

				done();
			};
		});

		it('should return a CanvasGradient when called with a CanvasGradient', function() {
			var context = document.createElement('canvas').getContext('2d');
			var gradient = context.createLinearGradient(0, 1, 2, 3);

			expect(helpers.getHoverColor(gradient) instanceof CanvasGradient).toBe(true);
		});

		it('should return a modified version of color when called with a color', function() {
			var originalColorRGB = 'rgb(70, 191, 189)';

			expect(helpers.getHoverColor('#46BFBD')).not.toEqual(originalColorRGB);
		});
	});
});
