// Test the rectangle element

describe('Title block tests', function() {
	it('Should be constructed', function() {
		var title = new Chart.Title({});
		expect(title).not.toBe(undefined);
	});

	it('Should have the correct default config', function() {
		expect(Chart.defaults.global.title).toEqual({
			display: false,
			position: 'top',
			fullWidth: true,
			fontStyle: 'bold',
			padding: 10,
			text: ''
		});
	});

	it('should update correctly', function() {
		var chart = {};

		var options = Chart.helpers.clone(Chart.defaults.global.title);
		options.text = 'My title';

		var title = new Chart.Title({
			chart: chart,
			options: options
		});

		var minSize = title.update(400, 200);

		expect(minSize).toEqual({
			width: 400,
			height: 0
		});

		// Now we have a height since we display
		title.options.display = true;

		minSize = title.update(400, 200);

		expect(minSize).toEqual({
			width: 400,
			height: 32
		});
	});

	it('should update correctly when vertical', function() {
		var chart = {};

		var options = Chart.helpers.clone(Chart.defaults.global.title);
		options.text = 'My title';
		options.position = 'left';

		var title = new Chart.Title({
			chart: chart,
			options: options
		});

		var minSize = title.update(200, 400);

		expect(minSize).toEqual({
			width: 0,
			height: 400
		});

		// Now we have a height since we display
		title.options.display = true;

		minSize = title.update(200, 400);

		expect(minSize).toEqual({
			width: 32,
			height: 400
		});
	});

	it('should draw correctly horizontally', function() {
		var chart = {};
		var context = window.createMockContext();

		var options = Chart.helpers.clone(Chart.defaults.global.title);
		options.text = 'My title';

		var title = new Chart.Title({
			chart: chart,
			options: options,
			ctx: context
		});

		title.update(400, 200);
		title.draw();

		expect(context.getCalls()).toEqual([]);

		// Now we have a height since we display
		title.options.display = true;

		var minSize = title.update(400, 200);
		title.top = 50;
		title.left = 100;
		title.bottom = title.top + minSize.height;
		title.right = title.left + minSize.width;
		title.draw();

		expect(context.getCalls()).toEqual([{
			name: 'setFillStyle',
			args: ['#666']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [300, 66]
		}, {
			name: 'rotate',
			args: [0]
		}, {
			name: 'fillText',
			args: ['My title', 0, 0, 400]
		}, {
			name: 'restore',
			args: []
		}]);
	});

	it ('should draw correctly vertically', function() {
		var chart = {};
		var context = window.createMockContext();

		var options = Chart.helpers.clone(Chart.defaults.global.title);
		options.text = 'My title';
		options.position = 'left';

		var title = new Chart.Title({
			chart: chart,
			options: options,
			ctx: context
		});

		title.update(200, 400);
		title.draw();

		expect(context.getCalls()).toEqual([]);

		// Now we have a height since we display
		title.options.display = true;

		var minSize = title.update(200, 400);
		title.top = 50;
		title.left = 100;
		title.bottom = title.top + minSize.height;
		title.right = title.left + minSize.width;
		title.draw();

		expect(context.getCalls()).toEqual([{
			name: 'setFillStyle',
			args: ['#666']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [106, 250]
		}, {
			name: 'rotate',
			args: [-0.5 * Math.PI]
		}, {
			name: 'fillText',
			args: ['My title', 0, 0, 400]
		}, {
			name: 'restore',
			args: []
		}]);

		// Rotation is other way on right side
		title.options.position = 'right';

		// Reset call tracker
		context.resetCalls();

		minSize = title.update(200, 400);
		title.top = 50;
		title.left = 100;
		title.bottom = title.top + minSize.height;
		title.right = title.left + minSize.width;
		title.draw();

		expect(context.getCalls()).toEqual([{
			name: 'setFillStyle',
			args: ['#666']
		}, {
			name: 'save',
			args: []
		}, {
			name: 'translate',
			args: [126, 250]
		}, {
			name: 'rotate',
			args: [0.5 * Math.PI]
		}, {
			name: 'fillText',
			args: ['My title', 0, 0, 400]
		}, {
			name: 'restore',
			args: []
		}]);
	});
});
