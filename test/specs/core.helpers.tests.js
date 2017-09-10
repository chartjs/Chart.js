describe('Core helper tests', function() {

	var helpers;

	beforeAll(function() {
		helpers = window.Chart.helpers;
	});

	it('should extend an object', function() {
		var original = {
			myProp1: 'abc',
			myProp2: 56
		};

		var extension = {
			myProp3: [2, 5, 6],
			myProp2: 0
		};

		helpers.extend(original, extension);

		expect(original).toEqual({
			myProp1: 'abc',
			myProp2: 0,
			myProp3: [2, 5, 6],
		});
	});

	it('should merge a normal config without scales', function() {
		var baseConfig = {
			valueProp: 5,
			arrayProp: [1, 2, 3, 4, 5, 6],
			objectProp: {
				prop1: 'abc',
				prop2: 56
			}
		};

		var toMerge = {
			valueProp2: null,
			arrayProp: ['a', 'c'],
			objectProp: {
				prop1: 'c',
				prop3: 'prop3'
			}
		};

		var merged = helpers.configMerge(baseConfig, toMerge);
		expect(merged).toEqual({
			valueProp: 5,
			valueProp2: null,
			arrayProp: ['a', 'c'],
			objectProp: {
				prop1: 'c',
				prop2: 56,
				prop3: 'prop3'
			}
		});
	});

	it('should merge scale configs', function() {
		var baseConfig = {
			scales: {
				prop1: {
					abc: 123,
					def: '456'
				},
				prop2: 777,
				yAxes: [{
					type: 'linear',
				}, {
					type: 'log'
				}]
			}
		};

		var toMerge = {
			scales: {
				prop1: {
					def: 'bbb',
					ghi: 78
				},
				prop2: null,
				yAxes: [{
					type: 'linear',
					axisProp: 456
				}, {
					// pulls in linear default config since axis type changes
					type: 'linear',
					position: 'right'
				}, {
					// Pulls in linear default config since axis not in base
					type: 'linear'
				}]
			}
		};

		var merged = helpers.configMerge(baseConfig, toMerge);
		expect(merged).toEqual({
			scales: {
				prop1: {
					abc: 123,
					def: 'bbb',
					ghi: 78
				},
				prop2: null,
				yAxes: [{
					type: 'linear',
					axisProp: 456
				}, {
					display: true,

					gridLines: {
						color: 'rgba(0, 0, 0, 0.1)',
						drawBorder: true,
						drawOnChartArea: true,
						drawTicks: true, // draw ticks extending towards the label
						tickMarkLength: 10,
						lineWidth: 1,
						offsetGridLines: false,
						display: true,
						zeroLineColor: 'rgba(0,0,0,0.25)',
						zeroLineWidth: 1,
						zeroLineBorderDash: [],
						zeroLineBorderDashOffset: 0.0,
						borderDash: [],
						borderDashOffset: 0.0
					},
					position: 'right',
					offset: false,
					scaleLabel: Chart.defaults.scale.scaleLabel,
					ticks: {
						beginAtZero: false,
						minRotation: 0,
						maxRotation: 50,
						mirror: false,
						padding: 0,
						reverse: false,
						display: true,
						callback: merged.scales.yAxes[1].ticks.callback, // make it nicer, then check explicitly below
						autoSkip: true,
						autoSkipPadding: 0,
						labelOffset: 0,
						minor: {},
						major: {},
					},
					type: 'linear'
				}, {
					display: true,

					gridLines: {
						color: 'rgba(0, 0, 0, 0.1)',
						drawBorder: true,
						drawOnChartArea: true,
						drawTicks: true, // draw ticks extending towards the label,
						tickMarkLength: 10,
						lineWidth: 1,
						offsetGridLines: false,
						display: true,
						zeroLineColor: 'rgba(0,0,0,0.25)',
						zeroLineWidth: 1,
						zeroLineBorderDash: [],
						zeroLineBorderDashOffset: 0.0,
						borderDash: [],
						borderDashOffset: 0.0
					},
					position: 'left',
					offset: false,
					scaleLabel: Chart.defaults.scale.scaleLabel,
					ticks: {
						beginAtZero: false,
						minRotation: 0,
						maxRotation: 50,
						mirror: false,
						padding: 0,
						reverse: false,
						display: true,
						callback: merged.scales.yAxes[2].ticks.callback, // make it nicer, then check explicitly below
						autoSkip: true,
						autoSkipPadding: 0,
						labelOffset: 0,
						minor: {},
						major: {},
					},
					type: 'linear'
				}]
			}
		});

		// Are these actually functions
		expect(merged.scales.yAxes[1].ticks.callback).toEqual(jasmine.any(Function));
		expect(merged.scales.yAxes[2].ticks.callback).toEqual(jasmine.any(Function));
	});

	it('should filter an array', function() {
		var data = [-10, 0, 6, 0, 7];
		var callback = function(item) {
			return item > 2;
		};
		expect(helpers.where(data, callback)).toEqual([6, 7]);
		expect(helpers.findNextWhere(data, callback)).toEqual(6);
		expect(helpers.findNextWhere(data, callback, 2)).toBe(7);
		expect(helpers.findNextWhere(data, callback, 4)).toBe(undefined);
		expect(helpers.findPreviousWhere(data, callback)).toBe(7);
		expect(helpers.findPreviousWhere(data, callback, 3)).toBe(6);
		expect(helpers.findPreviousWhere(data, callback, 0)).toBe(undefined);
	});

	it('should get the correct sign', function() {
		expect(helpers.sign(0)).toBe(0);
		expect(helpers.sign(10)).toBe(1);
		expect(helpers.sign(-5)).toBe(-1);
	});

	it('should do a log10 operation', function() {
		expect(helpers.log10(0)).toBe(-Infinity);
		expect(helpers.log10(1)).toBe(0);
		expect(helpers.log10(1000)).toBeCloseTo(3, 1e-9);
	});

	it('should correctly determine if two numbers are essentially equal', function() {
		expect(helpers.almostEquals(0, Number.EPSILON, 2 * Number.EPSILON)).toBe(true);
		expect(helpers.almostEquals(1, 1.1, 0.0001)).toBe(false);
		expect(helpers.almostEquals(1e30, 1e30 + Number.EPSILON, 0)).toBe(false);
		expect(helpers.almostEquals(1e30, 1e30 + Number.EPSILON, 2 * Number.EPSILON)).toBe(true);
	});

	it('should correctly determine if a numbers are essentially whole', function() {
		expect(helpers.almostWhole(0.99999, 0.0001)).toBe(true);
		expect(helpers.almostWhole(0.9, 0.0001)).toBe(false);
	});

	it('should generate integer ids', function() {
		var uid = helpers.uid();
		expect(uid).toEqual(jasmine.any(Number));
		expect(helpers.uid()).toBe(uid + 1);
		expect(helpers.uid()).toBe(uid + 2);
		expect(helpers.uid()).toBe(uid + 3);
	});

	it('should detect a number', function() {
		expect(helpers.isNumber(123)).toBe(true);
		expect(helpers.isNumber('123')).toBe(true);
		expect(helpers.isNumber(null)).toBe(false);
		expect(helpers.isNumber(NaN)).toBe(false);
		expect(helpers.isNumber(undefined)).toBe(false);
		expect(helpers.isNumber('cbc')).toBe(false);
	});

	it('should convert between radians and degrees', function() {
		expect(helpers.toRadians(180)).toBe(Math.PI);
		expect(helpers.toRadians(90)).toBe(0.5 * Math.PI);
		expect(helpers.toDegrees(Math.PI)).toBe(180);
		expect(helpers.toDegrees(Math.PI * 3 / 2)).toBe(270);
	});

	it('should get an angle from a point', function() {
		var center = {
			x: 0,
			y: 0
		};

		expect(helpers.getAngleFromPoint(center, {
			x: 0,
			y: 10
		})).toEqual({
			angle: Math.PI / 2,
			distance: 10,
		});

		expect(helpers.getAngleFromPoint(center, {
			x: Math.sqrt(2),
			y: Math.sqrt(2)
		})).toEqual({
			angle: Math.PI / 4,
			distance: 2
		});

		expect(helpers.getAngleFromPoint(center, {
			x: -1.0 * Math.sqrt(2),
			y: -1.0 * Math.sqrt(2)
		})).toEqual({
			angle: Math.PI * 1.25,
			distance: 2
		});
	});

	it('should spline curves', function() {
		expect(helpers.splineCurve({
			x: 0,
			y: 0
		}, {
			x: 1,
			y: 1
		}, {
			x: 2,
			y: 0
		}, 0)).toEqual({
			previous: {
				x: 1,
				y: 1,
			},
			next: {
				x: 1,
				y: 1,
			}
		});

		expect(helpers.splineCurve({
			x: 0,
			y: 0
		}, {
			x: 1,
			y: 1
		}, {
			x: 2,
			y: 0
		}, 1)).toEqual({
			previous: {
				x: 0,
				y: 1,
			},
			next: {
				x: 2,
				y: 1,
			}
		});
	});

	it('should spline curves with monotone cubic interpolation', function() {
		var dataPoints = [
			{_model: {x: 0, y: 0, skip: false}},
			{_model: {x: 3, y: 6, skip: false}},
			{_model: {x: 9, y: 6, skip: false}},
			{_model: {x: 12, y: 60, skip: false}},
			{_model: {x: 15, y: 60, skip: false}},
			{_model: {x: 18, y: 120, skip: false}},
			{_model: {x: null, y: null, skip: true}},
			{_model: {x: 21, y: 180, skip: false}},
			{_model: {x: 24, y: 120, skip: false}},
			{_model: {x: 27, y: 125, skip: false}},
			{_model: {x: 30, y: 105, skip: false}},
			{_model: {x: 33, y: 110, skip: false}},
			{_model: {x: 33, y: 110, skip: false}},
			{_model: {x: 36, y: 170, skip: false}}
		];
		helpers.splineCurveMonotone(dataPoints);
		expect(dataPoints).toEqual([{
			_model: {
				x: 0,
				y: 0,
				skip: false,
				controlPointNextX: 1,
				controlPointNextY: 2
			}
		},
		{
			_model: {
				x: 3,
				y: 6,
				skip: false,
				controlPointPreviousX: 2,
				controlPointPreviousY: 6,
				controlPointNextX: 5,
				controlPointNextY: 6
			}
		},
		{
			_model: {
				x: 9,
				y: 6,
				skip: false,
				controlPointPreviousX: 7,
				controlPointPreviousY: 6,
				controlPointNextX: 10,
				controlPointNextY: 6
			}
		},
		{
			_model: {
				x: 12,
				y: 60,
				skip: false,
				controlPointPreviousX: 11,
				controlPointPreviousY: 60,
				controlPointNextX: 13,
				controlPointNextY: 60
			}
		},
		{
			_model: {
				x: 15,
				y: 60,
				skip: false,
				controlPointPreviousX: 14,
				controlPointPreviousY: 60,
				controlPointNextX: 16,
				controlPointNextY: 60
			}
		},
		{
			_model: {
				x: 18,
				y: 120,
				skip: false,
				controlPointPreviousX: 17,
				controlPointPreviousY: 100
			}
		},
		{
			_model: {
				x: null,
				y: null,
				skip: true
			}
		},
		{
			_model: {
				x: 21,
				y: 180,
				skip: false,
				controlPointNextX: 22,
				controlPointNextY: 160
			}
		},
		{
			_model: {
				x: 24,
				y: 120,
				skip: false,
				controlPointPreviousX: 23,
				controlPointPreviousY: 120,
				controlPointNextX: 25,
				controlPointNextY: 120
			}
		},
		{
			_model: {
				x: 27,
				y: 125,
				skip: false,
				controlPointPreviousX: 26,
				controlPointPreviousY: 125,
				controlPointNextX: 28,
				controlPointNextY: 125
			}
		},
		{
			_model: {
				x: 30,
				y: 105,
				skip: false,
				controlPointPreviousX: 29,
				controlPointPreviousY: 105,
				controlPointNextX: 31,
				controlPointNextY: 105
			}
		},
		{
			_model: {
				x: 33,
				y: 110,
				skip: false,
				controlPointPreviousX: 32,
				controlPointPreviousY: 110,
				controlPointNextX: 33,
				controlPointNextY: 110
			}
		},
		{
			_model: {
				x: 33,
				y: 110,
				skip: false,
				controlPointPreviousX: 33,
				controlPointPreviousY: 110,
				controlPointNextX: 34,
				controlPointNextY: 110
			}
		},
		{
			_model: {
				x: 36,
				y: 170,
				skip: false,
				controlPointPreviousX: 35,
				controlPointPreviousY: 150
			}
		}]);
	});

	it('should get the next or previous item in an array', function() {
		var testData = [0, 1, 2];

		expect(helpers.nextItem(testData, 0, false)).toEqual(1);
		expect(helpers.nextItem(testData, 2, false)).toEqual(2);
		expect(helpers.nextItem(testData, 2, true)).toEqual(0);
		expect(helpers.nextItem(testData, 1, true)).toEqual(2);
		expect(helpers.nextItem(testData, -1, false)).toEqual(0);

		expect(helpers.previousItem(testData, 0, false)).toEqual(0);
		expect(helpers.previousItem(testData, 0, true)).toEqual(2);
		expect(helpers.previousItem(testData, 2, false)).toEqual(1);
		expect(helpers.previousItem(testData, 1, true)).toEqual(0);
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

	it('count look at all the labels and return maximum number of lines', function() {
		window.createMockContext();
		var arrayOfThings1 = ['Foo', 'Bar'];
		var arrayOfThings2 = [['Foo', 'Bar'], 'Foo'];
		var arrayOfThings3 = [['Foo', 'Bar', 'Boo'], ['Foo', 'Bar'], 'Foo'];

		expect(helpers.numberOfLabelLines(arrayOfThings1)).toEqual(1);
		expect(helpers.numberOfLabelLines(arrayOfThings2)).toEqual(2);
		expect(helpers.numberOfLabelLines(arrayOfThings3)).toEqual(3);
	});

	it ('should get the maximum width and height for a node', function() {
		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '300px';

		document.body.appendChild(div);

		// Create the div we want to get the max size for
		var innerDiv = document.createElement('div');
		div.appendChild(innerDiv);

		expect(helpers.getMaximumWidth(innerDiv)).toBe(200);
		expect(helpers.getMaximumHeight(innerDiv)).toBe(300);

		document.body.removeChild(div);
	});

	it ('should get the maximum width of a node that has a max-width style', function() {
		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '300px';

		document.body.appendChild(div);

		// Create the div we want to get the max size for and set a max-width style
		var innerDiv = document.createElement('div');
		innerDiv.style.maxWidth = '150px';
		div.appendChild(innerDiv);

		expect(helpers.getMaximumWidth(innerDiv)).toBe(150);

		document.body.removeChild(div);
	});

	it ('should get the maximum height of a node that has a max-height style', function() {
		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '300px';

		document.body.appendChild(div);

		// Create the div we want to get the max size for and set a max-height style
		var innerDiv = document.createElement('div');
		innerDiv.style.maxHeight = '150px';
		div.appendChild(innerDiv);

		expect(helpers.getMaximumHeight(innerDiv)).toBe(150);

		document.body.removeChild(div);
	});

	it ('should get the maximum width of a node when the parent has a max-width style', function() {
		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '300px';

		document.body.appendChild(div);

		// Create an inner wrapper around our div we want to size and give that a max-width style
		var parentDiv = document.createElement('div');
		parentDiv.style.maxWidth = '150px';
		div.appendChild(parentDiv);

		// Create the div we want to get the max size for
		var innerDiv = document.createElement('div');
		parentDiv.appendChild(innerDiv);

		expect(helpers.getMaximumWidth(innerDiv)).toBe(150);

		document.body.removeChild(div);
	});

	it ('should get the maximum height of a node when the parent has a max-height style', function() {
		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '300px';

		document.body.appendChild(div);

		// Create an inner wrapper around our div we want to size and give that a max-height style
		var parentDiv = document.createElement('div');
		parentDiv.style.maxHeight = '150px';
		div.appendChild(parentDiv);

		// Create the div we want to get the max size for
		var innerDiv = document.createElement('div');
		innerDiv.style.height = '300px'; // make it large
		parentDiv.appendChild(innerDiv);

		expect(helpers.getMaximumHeight(innerDiv)).toBe(150);

		document.body.removeChild(div);
	});

	it ('should get the maximum width of a node that has a percentage max-width style', function() {
		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '300px';

		document.body.appendChild(div);

		// Create the div we want to get the max size for and set a max-width style
		var innerDiv = document.createElement('div');
		innerDiv.style.maxWidth = '50%';
		div.appendChild(innerDiv);

		expect(helpers.getMaximumWidth(innerDiv)).toBe(100);

		document.body.removeChild(div);
	});

	it ('should get the maximum height of a node that has a percentage max-height style', function() {
		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '300px';

		document.body.appendChild(div);

		// Create the div we want to get the max size for and set a max-height style
		var innerDiv = document.createElement('div');
		innerDiv.style.maxHeight = '50%';
		div.appendChild(innerDiv);

		expect(helpers.getMaximumHeight(innerDiv)).toBe(150);

		document.body.removeChild(div);
	});

	it ('should get the maximum width of a node when the parent has a percentage max-width style', function() {
		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '300px';

		document.body.appendChild(div);

		// Create an inner wrapper around our div we want to size and give that a max-width style
		var parentDiv = document.createElement('div');
		parentDiv.style.maxWidth = '50%';
		div.appendChild(parentDiv);

		// Create the div we want to get the max size for
		var innerDiv = document.createElement('div');
		parentDiv.appendChild(innerDiv);

		expect(helpers.getMaximumWidth(innerDiv)).toBe(100);

		document.body.removeChild(div);
	});

	it ('should get the maximum height of a node when the parent has a percentage max-height style', function() {
		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '300px';

		document.body.appendChild(div);

		// Create an inner wrapper around our div we want to size and give that a max-height style
		var parentDiv = document.createElement('div');
		parentDiv.style.maxHeight = '50%';
		div.appendChild(parentDiv);

		var innerDiv = document.createElement('div');
		innerDiv.style.height = '300px'; // make it large
		parentDiv.appendChild(innerDiv);

		expect(helpers.getMaximumHeight(innerDiv)).toBe(150);

		document.body.removeChild(div);
	});

	describe('Color helper', function() {
		function isColorInstance(obj) {
			return typeof obj === 'object' && obj.hasOwnProperty('values') && obj.values.hasOwnProperty('rgb');
		}

		it('should return a color when called with a color', function() {
			expect(isColorInstance(helpers.color('rgb(1, 2, 3)'))).toBe(true);
		});

		it('should return a color when called with a CanvasGradient instance', function() {
			var context = document.createElement('canvas').getContext('2d');
			var gradient = context.createLinearGradient(0, 1, 2, 3);

			expect(isColorInstance(helpers.color(gradient))).toBe(true);
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

		it('should return a modified version of color when called with a color', function() {
			var originalColorRGB = 'rgb(70, 191, 189)';

			expect(helpers.getHoverColor('#46BFBD')).not.toEqual(originalColorRGB);
		});
	});
});
