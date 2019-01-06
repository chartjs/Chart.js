describe('Core helper tests', function() {

	var helpers;

	beforeAll(function() {
		helpers = window.Chart.helpers;
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

	it('should generate integer ids', function() {
		var uid = helpers.uid();
		expect(uid).toEqual(jasmine.any(Number));
		expect(helpers.uid()).toBe(uid + 1);
		expect(helpers.uid()).toBe(uid + 2);
		expect(helpers.uid()).toBe(uid + 3);
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

	it ('should get the maximum width and height for a node in a ShadowRoot', function() {
		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '300px';

		document.body.appendChild(div);

		if (!div.attachShadow) {
			// Shadow DOM is not natively supported
			return;
		}

		var shadow = div.attachShadow({mode: 'closed'});

		// Create the div we want to get the max size for
		var innerDiv = document.createElement('div');
		shadow.appendChild(innerDiv);

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

	it ('should leave styled height and width on canvas if explicitly set', function() {
		var chart = window.acquireChart({}, {
			canvas: {
				height: 200,
				width: 200,
				style: 'height: 400px; width: 400px;'
			}
		});

		helpers.retinaScale(chart, true);

		var canvas = chart.canvas;

		expect(canvas.style.height).toBe('400px');
		expect(canvas.style.width).toBe('400px');
	});

	it ('Should get padding of parent as number (pixels) when defined as percent (returns incorrectly in IE11)', function() {

		// Create div with fixed size as a test bed
		var div = document.createElement('div');
		div.style.width = '300px';
		div.style.height = '300px';
		document.body.appendChild(div);

		// Inner DIV to have 5% padding of parent
		var innerDiv = document.createElement('div');

		div.appendChild(innerDiv);

		var canvas = document.createElement('canvas');
		innerDiv.appendChild(canvas);

		// No padding
		expect(helpers.getMaximumWidth(canvas)).toBe(300);

		// test with percentage
		innerDiv.style.padding = '5%';
		expect(helpers.getMaximumWidth(canvas)).toBe(270);

		// test with pixels
		innerDiv.style.padding = '10px';
		expect(helpers.getMaximumWidth(canvas)).toBe(280);

		document.body.removeChild(div);
	});
});
