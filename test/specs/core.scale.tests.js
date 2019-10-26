describe('Core.scale', function() {
	describe('auto', jasmine.fixture.specs('core.scale'));

	it('should provide default scale label options', function() {
		expect(Chart.defaults.scale.scaleLabel).toEqual({
			// display property
			display: false,

			// actual label
			labelString: '',

			// top/bottom padding
			padding: {
				top: 4,
				bottom: 4
			}
		});
	});

	describe('displaying xAxis ticks with autoSkip=true', function() {
		function getChart(data) {
			return window.acquireChart({
				type: 'line',
				data: data,
				options: {
					scales: {
						xAxes: [{
							ticks: {
								autoSkip: true
							}
						}]
					}
				}
			});
		}

		function lastTick(chart) {
			var xAxis = chart.scales['x-axis-0'];
			var ticks = xAxis.getTicks();
			return ticks[ticks.length - 1];
		}

		it('should display the last tick if it fits evenly with other ticks', function() {
			var chart = getChart({
				labels: [
					'January 2018', 'February 2018', 'March 2018', 'April 2018',
					'May 2018', 'June 2018', 'July 2018', 'August 2018',
					'September 2018'
				],
				datasets: [{
					data: [12, 19, 3, 5, 2, 3, 7, 8, 9]
				}]
			});

			expect(lastTick(chart).label).toEqual('September 2018');
		});

		it('should not display the last tick if it does not fit evenly', function() {
			var chart = getChart({
				labels: [
					'January 2018', 'February 2018', 'March 2018', 'April 2018',
					'May 2018', 'June 2018', 'July 2018', 'August 2018',
					'September 2018', 'October 2018', 'November 2018', 'December 2018',
					'January 2019', 'February 2019', 'March 2019', 'April 2019',
					'May 2019', 'June 2019', 'July 2019', 'August 2019',
					'September 2019', 'October 2019', 'November 2019', 'December 2019',
					'January 2020', 'February 2020'
				],
				datasets: [{
					data: [12, 19, 3, 5, 2, 3, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
				}]
			});

			expect(lastTick(chart).label).toBeUndefined();
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
		expected: [51.5, 153.5, 256.5, 358.5, 460.5]
	}, {
		labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
		offsetGridLines: true,
		offset: false,
		expected: [64.5, 192.5, 320.5, 448.5]
	}, {
		labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'],
		offsetGridLines: true,
		offset: true,
		expected: [0.5, 102.5, 204.5, 307.5, 409.5, 512.5]
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
		expected: [512.5]
	}, {
		labels: ['tick1'],
		offsetGridLines: true,
		offset: true,
		expected: [0.5, 512.5]
	}];

	gridLineTests.forEach(function(test) {
		it('should get the correct pixels for gridLine(s) for the horizontal scale when offsetGridLines is ' + test.offsetGridLines + ' and offset is ' + test.offset, function() {
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
		it('should get the correct pixels for gridLine(s) for the vertical scale when offsetGridLines is ' + test.offsetGridLines + ' and offset is ' + test.offset, function() {
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
				return x.name === 'moveTo' && x.args[0] === 1;
			}).map(function(x) {
				return x.args[1];
			})).toEqual(test.expected);
		});
	});

	it('should add the correct padding for long tick labels', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				labels: [
					'This is a very long label',
					'This is a very long label'
				],
				datasets: [{
					data: [0, 1]
				}]
			},
			options: {
				scales: {
					xAxes: [{
						id: 'foo'
					}],
					yAxes: [{
						display: false
					}]
				},
				legend: {
					display: false
				}
			}
		}, {
			canvas: {
				height: 100,
				width: 200
			}
		});

		var scale = chart.scales.foo;
		expect(scale.left).toBeGreaterThan(100);
		expect(scale.right).toBeGreaterThan(190);
	});

	describe('given the axes display option is set to auto', function() {
		describe('for the x axes', function() {
			it('should draw the axes if at least one associated dataset is visible', function() {
				var chart = window.acquireChart({
					type: 'line',
					data: {
						datasets: [{
							data: [100, 200, 100, 50],
							xAxisId: 'foo',
							hidden: true,
							labels: ['Q1', 'Q2', 'Q3', 'Q4']
						}, {
							data: [100, 200, 100, 50],
							xAxisId: 'foo',
							labels: ['Q1', 'Q2', 'Q3', 'Q4']
						}]
					},
					options: {
						scales: {
							xAxes: [{
								id: 'foo',
								display: 'auto'
							}],
							yAxes: [{
								type: 'category',
								id: 'yScale0'
							}]
						}
					}
				});

				var scale = chart.scales.foo;
				scale.ctx = window.createMockContext();
				chart.draw();

				expect(scale.ctx.getCalls().length).toBeGreaterThan(0);
				expect(scale.height).toBeGreaterThan(0);
			});

			it('should not draw the axes if no associated datasets are visible', function() {
				var chart = window.acquireChart({
					type: 'line',
					data: {
						datasets: [{
							data: [100, 200, 100, 50],
							xAxisId: 'foo',
							hidden: true,
							labels: ['Q1', 'Q2', 'Q3', 'Q4']
						}]
					},
					options: {
						scales: {
							xAxes: [{
								id: 'foo',
								display: 'auto'
							}]
						}
					}
				});

				var scale = chart.scales.foo;
				scale.ctx = window.createMockContext();
				chart.draw();

				expect(scale.ctx.getCalls().length).toBe(0);
				expect(scale.height).toBe(0);
			});
		});

		describe('for the y axes', function() {
			it('should draw the axes if at least one associated dataset is visible', function() {
				var chart = window.acquireChart({
					type: 'line',
					data: {
						datasets: [{
							data: [100, 200, 100, 50],
							yAxisId: 'foo',
							hidden: true,
							labels: ['Q1', 'Q2', 'Q3', 'Q4']
						}, {
							data: [100, 200, 100, 50],
							yAxisId: 'foo',
							labels: ['Q1', 'Q2', 'Q3', 'Q4']
						}]
					},
					options: {
						scales: {
							yAxes: [{
								id: 'foo',
								display: 'auto'
							}]
						}
					}
				});

				var scale = chart.scales.foo;
				scale.ctx = window.createMockContext();
				chart.draw();

				expect(scale.ctx.getCalls().length).toBeGreaterThan(0);
				expect(scale.width).toBeGreaterThan(0);
			});

			it('should not draw the axes if no associated datasets are visible', function() {
				var chart = window.acquireChart({
					type: 'line',
					data: {
						datasets: [{
							data: [100, 200, 100, 50],
							yAxisId: 'foo',
							hidden: true,
							labels: ['Q1', 'Q2', 'Q3', 'Q4']
						}]
					},
					options: {
						scales: {
							yAxes: [{
								id: 'foo',
								display: 'auto'
							}]
						}
					}
				});

				var scale = chart.scales.foo;
				scale.ctx = window.createMockContext();
				chart.draw();

				expect(scale.ctx.getCalls().length).toBe(0);
				expect(scale.width).toBe(0);
			});
		});
	});

	describe('afterBuildTicks', function() {
		it('should allow filtering of ticks', function() {
			var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
			var chart = window.acquireChart({
				type: 'line',
				options: {
					scales: {
						xAxes: [{
							id: 'x',
							type: 'category',
							labels: labels,
							afterBuildTicks: function(axis, ticks) {
								return ticks.slice(1);
							}
						}]
					}
				}
			});

			var scale = chart.scales.x;
			expect(scale.ticks).toEqual(labels.slice(1));
		});

		it('should allow filtering of ticks (for new implementation of buildTicks)', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					labels: ['2016', '2017', '2018']
				},
				options: {
					scales: {
						xAxes: [{
							id: 'x',
							type: 'time',
							time: {
								parser: 'YYYY'
							},
							ticks: {
								source: 'labels'
							},
							afterBuildTicks: function(axis, ticks) {
								return ticks.slice(1);
							}
						}]
					}
				}
			});

			var scale = chart.scales.x;
			expect(scale.ticks.length).toEqual(2);
		});

		it('should allow no return value from callback', function() {
			var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
			var chart = window.acquireChart({
				type: 'line',
				options: {
					scales: {
						xAxes: [{
							id: 'x',
							type: 'category',
							labels: labels,
							afterBuildTicks: function() { }
						}]
					}
				}
			});

			var scale = chart.scales.x;
			expect(scale.ticks).toEqual(labels);
		});

		it('should allow empty ticks', function() {
			var labels = ['tick1', 'tick2', 'tick3', 'tick4', 'tick5'];
			var chart = window.acquireChart({
				type: 'line',
				options: {
					scales: {
						xAxes: [{
							id: 'x',
							type: 'category',
							labels: labels,
							afterBuildTicks: function() {
								return [];
							}
						}]
					}
				}
			});

			var scale = chart.scales.x;
			expect(scale.ticks.length).toBe(0);
		});
	});

	describe('_layers', function() {
		it('should default to one layer', function() {
			var chart = window.acquireChart({
				type: 'line',
				options: {
					scales: {
						xAxes: [{
							id: 'x',
							type: 'linear',
						}]
					}
				}
			});

			var scale = chart.scales.x;
			expect(scale._layers().length).toEqual(1);
		});

		it('should default to one layer for custom scales', function() {
			var customScale = Chart.Scale.extend({
				draw: function() {},
				convertTicksToLabels: function() {
					return ['tick'];
				}
			});
			Chart.scaleService.registerScaleType('customScale', customScale, {});

			var chart = window.acquireChart({
				type: 'line',
				options: {
					scales: {
						xAxes: [{
							id: 'x',
							type: 'customScale',
							gridLines: {
								z: 10
							},
							ticks: {
								z: 20
							}
						}]
					}
				}
			});

			var scale = chart.scales.x;
			expect(scale._layers().length).toEqual(1);
			expect(scale._layers()[0].z).toEqual(20);
		});

		it('should default to one layer when z is equal between ticks and grid', function() {
			var chart = window.acquireChart({
				type: 'line',
				options: {
					scales: {
						xAxes: [{
							id: 'x',
							type: 'linear',
							ticks: {
								z: 10
							},
							gridLines: {
								z: 10
							}
						}]
					}
				}
			});

			var scale = chart.scales.x;
			expect(scale._layers().length).toEqual(1);
		});


		it('should return 2 layers when z is not equal between ticks and grid', function() {
			var chart = window.acquireChart({
				type: 'line',
				options: {
					scales: {
						xAxes: [{
							id: 'x',
							type: 'linear',
							ticks: {
								z: 10
							}
						}]
					}
				}
			});

			expect(chart.scales.x._layers().length).toEqual(2);

			chart = window.acquireChart({
				type: 'line',
				options: {
					scales: {
						xAxes: [{
							id: 'x',
							type: 'linear',
							gridLines: {
								z: 11
							}
						}]
					}
				}
			});

			expect(chart.scales.x._layers().length).toEqual(2);

			chart = window.acquireChart({
				type: 'line',
				options: {
					scales: {
						xAxes: [{
							id: 'x',
							type: 'linear',
							ticks: {
								z: 10
							},
							gridLines: {
								z: 11
							}
						}]
					}
				}
			});

			expect(chart.scales.x._layers().length).toEqual(2);

		});

	});
});
