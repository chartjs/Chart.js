describe('DOM helpers tests', function() {
	let helpers;

	beforeAll(function() {
		helpers = window.Chart.helpers.dom;
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

	describe('getRelativePosition', function() {
		it('should use offsetX/Y when available', function() {
			const event = {offsetX: 0, offsetY: 10};
			const chart = undefined;
			expect(helpers.getRelativePosition(event, chart)).toEqual({x: 0, y: 10});
		});

		it('should use layerX/Y - target offsets when available', function() {
			const chart = undefined;

			const event1 = {
				layerX: 0,
				layerY: 10,
				target: {
					offsetLeft: 0,
					offsetTop: 5
				}
			};
			expect(helpers.getRelativePosition(event1, chart)).toEqual({x: 0, y: 5});

			const event2 = {
				offsetX: 0,
				offsetY: 0,
				layerX: 10,
				layerY: 10,
				target: {
					offsetLeft: 0,
					offsetTop: 5
				}
			};
			expect(helpers.getRelativePosition(event2, chart)).toEqual({x: 10, y: 5});
		});

		it('should calculate from clientX/Y if offset/layer coords are not available', function() {
			const chart = window.acquireChart({}, {
				canvas: {
					height: 200,
					width: 200,
				}
			});

			const event = {
				clientX: 50,
				clientY: 100
			};

			const rect = chart.canvas.getBoundingClientRect();
			expect(helpers.getRelativePosition(event, chart)).toEqual({
				x: Math.round(event.clientX - rect.x),
				y: Math.round(event.clientY - rect.y)
			});

			const chart2 = window.acquireChart({}, {
				canvas: {
					height: 200,
					width: 200,
					style: 'padding: 10px'
				}
			});
			const rect2 = chart2.canvas.getBoundingClientRect();
			expect(helpers.getRelativePosition(event, chart2)).toEqual({
				x: Math.round((event.clientX - rect2.x - 10) / 180 * 200),
				y: Math.round((event.clientY - rect2.y - 10) / 180 * 200)
			});

			const chart3 = window.acquireChart({}, {
				canvas: {
					height: 200,
					width: 200,
					style: 'width: 400px, height: 400px; padding: 10px'
				}
			});
			const rect3 = chart3.canvas.getBoundingClientRect();
			expect(helpers.getRelativePosition(event, chart3)).toEqual({
				x: Math.round((event.clientX - rect3.x - 10) / 360 * 400),
				y: Math.round((event.clientY - rect3.y - 10) / 360 * 400)
			});
		});
	});
});
