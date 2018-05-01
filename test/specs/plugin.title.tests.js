// Test the rectangle element

describe('Title block tests', function() {
	it('Should have the correct default config', function() {
		expect(Chart.defaults.global.title).toEqual({
			display: false,
			position: 'top',
			fullWidth: true,
			weight: 2000,
			fontStyle: 'bold',
			lineHeight: 1.2,
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
			height: 34.4
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
			width: 34.4,
			height: 400
		});
	});

	it('should have the correct size when there are multiple lines of text', function() {
		var chart = {};

		var options = Chart.helpers.clone(Chart.defaults.global.title);
		options.text = ['line1', 'line2'];
		options.position = 'left';
		options.display = true;
		options.lineHeight = 1.5;

		var title = new Chart.Title({
			chart: chart,
			options: options
		});

		var minSize = title.update(200, 400);

		expect(minSize).toEqual({
			width: 56,
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
			args: [300, 67.2]
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
			args: [117.2, 250]
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
			args: [117.2, 250]
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

	describe('config update', function() {
		it ('should update the options', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					title: {
						display: true
					}
				}
			});
			expect(chart.titleBlock.options.display).toBe(true);

			chart.options.title.display = false;
			chart.update();
			expect(chart.titleBlock.options.display).toBe(false);
		});

		it ('should update the associated layout item', function() {
			var chart = acquireChart({
				type: 'line',
				data: {},
				options: {
					title: {
						fullWidth: true,
						position: 'top',
						weight: 150
					}
				}
			});

			expect(chart.titleBlock.fullWidth).toBe(true);
			expect(chart.titleBlock.position).toBe('top');
			expect(chart.titleBlock.weight).toBe(150);

			chart.options.title.fullWidth = false;
			chart.options.title.position = 'left';
			chart.options.title.weight = 42;
			chart.update();

			expect(chart.titleBlock.fullWidth).toBe(false);
			expect(chart.titleBlock.position).toBe('left');
			expect(chart.titleBlock.weight).toBe(42);
		});

		it ('should remove the title if the new options are false', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				}
			});
			expect(chart.titleBlock).not.toBe(undefined);

			chart.options.title = false;
			chart.update();
			expect(chart.titleBlock).toBe(undefined);
		});

		it ('should create the title if the title options are changed to exist', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					title: false
				}
			});
			expect(chart.titleBlock).toBe(undefined);

			chart.options.title = {};
			chart.update();
			expect(chart.titleBlock).not.toBe(undefined);
			expect(chart.titleBlock.options).toEqual(jasmine.objectContaining(Chart.defaults.global.title));
		});
	});
});
