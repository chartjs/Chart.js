describe('Core.scale', function() {
	describe('auto', jasmine.fixture.specs('core.scale'));

	it('should provide default scale label options', function() {
		expect(Chart.defaults.scale.scaleLabel).toEqual({
			// display property
			display: false,

			// actual label
			labelString: '',

			// actual label
			lineHeight: 1.2,

			// top/bottom padding
			padding: {
				top: 4,
				bottom: 4
			}
		});
	});

	var gridLineTests = [{
		labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
		offsetGridLines: false,
		offset: false,
		expected: [0.5, 128.5, 256.5, 384.5, 512.5]
	}, {
		labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
		offsetGridLines: false,
		offset: true,
		expected: [51.5, 154.5, 256.5, 358.5, 461.5]
	}, {
		labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
		offsetGridLines: true,
		offset: false,
		expected: [-63.5, 64.5, 192.5, 320.5, 448.5]
	}, {
		labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
		offsetGridLines: true,
		offset: true,
		expected: [0, 103, 205.5, 307.5, 410]
	}, {
		labels: ['tick1'],
		offsetGridLines: false,
		offset: false,
		expected: [0.5]
	}, {
		labels: ['tick1'],
		offsetGridLines: false,
		offset: true,
		expected: [256.5]
	}, {
		labels: ['tick1'],
		offsetGridLines: true,
		offset: false,
		expected: [-511.5]
	}, {
		labels: ['tick1'],
		offsetGridLines: true,
		offset: true,
		expected: [0.5]
	}];

	gridLineTests.forEach(function(test) {
		it('should get the correct pixels for ' + test.labels.length + ' gridLine(s) for the horizontal scale when offsetGridLines is ' + test.offsetGridLines + ' and offset is ' + test.offset, function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						data: []
					}],
					labels: test.labels
				},
				options: {
					scales: {
						xAxes: [{
							id: 'xScale0',
							gridLines: {
								offsetGridLines: test.offsetGridLines,
								drawTicks: false
							},
							ticks: {
								display: false
							},
							offset: test.offset
						}],
						yAxes: [{
							display: false
						}]
					},
					legend: {
						display: false
					}
				}
			});

			var xScale = chart.scales.xScale0;
			xScale.ctx = window.createMockContext();
			chart.draw();

			expect(xScale.ctx.getCalls().filter(function(x) {
				return x.name === 'moveTo' && x.args[1] === 0;
			}).map(function(x) {
				return x.args[0];
			})).toEqual(test.expected);
		});
	});

	gridLineTests.forEach(function(test) {
		it('should get the correct pixels for ' + test.labels.length + ' gridLine(s) for the vertical scale when offsetGridLines is ' + test.offsetGridLines + ' and offset is ' + test.offset, function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						data: []
					}],
					labels: test.labels
				},
				options: {
					scales: {
						xAxes: [{
							display: false
						}],
						yAxes: [{
							type: 'category',
							id: 'yScale0',
							gridLines: {
								offsetGridLines: test.offsetGridLines,
								drawTicks: false
							},
							ticks: {
								display: false
							},
							offset: test.offset
						}]
					},
					legend: {
						display: false
					}
				}
			});

			var yScale = chart.scales.yScale0;
			yScale.ctx = window.createMockContext();
			chart.draw();

			expect(yScale.ctx.getCalls().filter(function(x) {
				return x.name === 'moveTo' && x.args[0] === 0;
			}).map(function(x) {
				return x.args[1];
			})).toEqual(test.expected);
		});
	});
});
