// Tests of the scale service
describe('Test the layout service', function() {
	// Disable tests which need to be rewritten based on changes introduced by
	// the following changes: https://github.com/chartjs/Chart.js/pull/2346
	// using xit marks the test as pending: http://jasmine.github.io/2.0/introduction.html#section-Pending_Specs
	xit('should fit a simple chart with 2 scales', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [
					{data: [10, 5, 0, 25, 78, -10]}
				],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale',
						type: 'category'
					}],
					yAxes: [{
						id: 'yScale',
						type: 'linear'
					}]
				}
			}
		}, {
			canvas: {
				height: 150,
				width: 250
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(112);
		expect(chart.chartArea.left).toBeCloseToPixel(41);
		expect(chart.chartArea.right).toBeCloseToPixel(250);
		expect(chart.chartArea.top).toBeCloseToPixel(32);

		// Is xScale at the right spot
		expect(chart.scales.xScale.bottom).toBeCloseToPixel(150);
		expect(chart.scales.xScale.left).toBeCloseToPixel(41);
		expect(chart.scales.xScale.right).toBeCloseToPixel(250);
		expect(chart.scales.xScale.top).toBeCloseToPixel(112);
		expect(chart.scales.xScale.labelRotation).toBeCloseTo(25);

		// Is yScale at the right spot
		expect(chart.scales.yScale.bottom).toBeCloseToPixel(112);
		expect(chart.scales.yScale.left).toBeCloseToPixel(0);
		expect(chart.scales.yScale.right).toBeCloseToPixel(41);
		expect(chart.scales.yScale.top).toBeCloseToPixel(32);
		expect(chart.scales.yScale.labelRotation).toBeCloseTo(0);
	});

	xit('should fit scales that are in the top and right positions', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [
					{data: [10, 5, 0, 25, 78, -10]}
				],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale',
						type: 'category',
						position: 'top'
					}],
					yAxes: [{
						id: 'yScale',
						type: 'linear',
						position: 'right'
					}]
				}
			}
		}, {
			canvas: {
				height: 150,
				width: 250
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(150);
		expect(chart.chartArea.left).toBeCloseToPixel(0);
		expect(chart.chartArea.right).toBeCloseToPixel(209);
		expect(chart.chartArea.top).toBeCloseToPixel(71);

		// Is xScale at the right spot
		expect(chart.scales.xScale.bottom).toBeCloseToPixel(71);
		expect(chart.scales.xScale.left).toBeCloseToPixel(0);
		expect(chart.scales.xScale.right).toBeCloseToPixel(209);
		expect(chart.scales.xScale.top).toBeCloseToPixel(32);
		expect(chart.scales.xScale.labelRotation).toBeCloseTo(25);

		// Is yScale at the right spot
		expect(chart.scales.yScale.bottom).toBeCloseToPixel(150);
		expect(chart.scales.yScale.left).toBeCloseToPixel(209);
		expect(chart.scales.yScale.right).toBeCloseToPixel(250);
		expect(chart.scales.yScale.top).toBeCloseToPixel(71);
		expect(chart.scales.yScale.labelRotation).toBeCloseTo(0);
	});

	it('should fit scales that overlap the chart area', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78, -10]
				}, {
					data: [-19, -20, 0, -99, -50, 0]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(512);
		expect(chart.chartArea.left).toBeCloseToPixel(0);
		expect(chart.chartArea.right).toBeCloseToPixel(512);
		expect(chart.chartArea.top).toBeCloseToPixel(32);

		expect(chart.scale.bottom).toBeCloseToPixel(512);
		expect(chart.scale.left).toBeCloseToPixel(0);
		expect(chart.scale.right).toBeCloseToPixel(512);
		expect(chart.scale.top).toBeCloseToPixel(32);
		expect(chart.scale.width).toBeCloseToPixel(512);
		expect(chart.scale.height).toBeCloseToPixel(480);
	});

	xit('should fit multiple axes in the same position', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale1',
					data: [10, 5, 0, 25, 78, -10]
				}, {
					yAxisID: 'yScale2',
					data: [-19, -20, 0, -99, -50, 0]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale',
						type: 'category'
					}],
					yAxes: [{
						id: 'yScale1',
						type: 'linear'
					}, {
						id: 'yScale2',
						type: 'linear'
					}]
				}
			}
		}, {
			canvas: {
				height: 150,
				width: 250
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(102);
		expect(chart.chartArea.left).toBeCloseToPixel(86);
		expect(chart.chartArea.right).toBeCloseToPixel(250);
		expect(chart.chartArea.top).toBeCloseToPixel(32);

		// Is xScale at the right spot
		expect(chart.scales.xScale.bottom).toBeCloseToPixel(150);
		expect(chart.scales.xScale.left).toBeCloseToPixel(86);
		expect(chart.scales.xScale.right).toBeCloseToPixel(250);
		expect(chart.scales.xScale.top).toBeCloseToPixel(103);
		expect(chart.scales.xScale.labelRotation).toBeCloseTo(50);

		// Are yScales at the right spot
		expect(chart.scales.yScale1.bottom).toBeCloseToPixel(102);
		expect(chart.scales.yScale1.left).toBeCloseToPixel(0);
		expect(chart.scales.yScale1.right).toBeCloseToPixel(41);
		expect(chart.scales.yScale1.top).toBeCloseToPixel(32);
		expect(chart.scales.yScale1.labelRotation).toBeCloseTo(0);

		expect(chart.scales.yScale2.bottom).toBeCloseToPixel(102);
		expect(chart.scales.yScale2.left).toBeCloseToPixel(41);
		expect(chart.scales.yScale2.right).toBeCloseToPixel(86);
		expect(chart.scales.yScale2.top).toBeCloseToPixel(32);
		expect(chart.scales.yScale2.labelRotation).toBeCloseTo(0);
	});

	xit ('should fix a full width box correctly', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					xAxisID: 'xScale1',
					data: [10, 5, 0, 25, 78, -10]
				}, {
					xAxisID: 'xScale2',
					data: [-19, -20, 0, -99, -50, 0]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale1',
						type: 'category'
					}, {
						id: 'xScale2',
						type: 'category',
						position: 'top',
						fullWidth: true
					}],
					yAxes: [{
						id: 'yScale',
						type: 'linear'
					}]
				}
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(484);
		expect(chart.chartArea.left).toBeCloseToPixel(45);
		expect(chart.chartArea.right).toBeCloseToPixel(512);
		expect(chart.chartArea.top).toBeCloseToPixel(60);

		// Are xScales at the right spot
		expect(chart.scales.xScale1.bottom).toBeCloseToPixel(512);
		expect(chart.scales.xScale1.left).toBeCloseToPixel(45);
		expect(chart.scales.xScale1.right).toBeCloseToPixel(512);
		expect(chart.scales.xScale1.top).toBeCloseToPixel(484);

		expect(chart.scales.xScale2.bottom).toBeCloseToPixel(60);
		expect(chart.scales.xScale2.left).toBeCloseToPixel(0);
		expect(chart.scales.xScale2.right).toBeCloseToPixel(512);
		expect(chart.scales.xScale2.top).toBeCloseToPixel(32);

		// Is yScale at the right spot
		expect(chart.scales.yScale.bottom).toBeCloseToPixel(484);
		expect(chart.scales.yScale.left).toBeCloseToPixel(0);
		expect(chart.scales.yScale.right).toBeCloseToPixel(45);
		expect(chart.scales.yScale.top).toBeCloseToPixel(60);
	});

	describe('padding settings', function() {
		it('should apply a single padding to all dimensions', function() {
			var chart = window.acquireChart({
				type: 'bar',
				data: {
					datasets: [
						{
							data: [10, 5, 0, 25, 78, -10]
						}
					],
					labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
				},
				options: {
					scales: {
						xAxes: [{
							id: 'xScale',
							type: 'category',
							display: false
						}],
						yAxes: [{
							id: 'yScale',
							type: 'linear',
							display: false
						}]
					},
					legend: {
						display: false
					},
					title: {
						display: false
					},
					layout: {
						padding: 10
					}
				}
			}, {
				canvas: {
					height: 150,
					width: 250
				}
			});

			expect(chart.chartArea.bottom).toBeCloseToPixel(140);
			expect(chart.chartArea.left).toBeCloseToPixel(10);
			expect(chart.chartArea.right).toBeCloseToPixel(240);
			expect(chart.chartArea.top).toBeCloseToPixel(10);
		});

		it('should apply padding in all positions', function() {
			var chart = window.acquireChart({
				type: 'bar',
				data: {
					datasets: [
						{
							data: [10, 5, 0, 25, 78, -10]
						}
					],
					labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
				},
				options: {
					scales: {
						xAxes: [{
							id: 'xScale',
							type: 'category',
							display: false
						}],
						yAxes: [{
							id: 'yScale',
							type: 'linear',
							display: false
						}]
					},
					legend: {
						display: false
					},
					title: {
						display: false
					},
					layout: {
						padding: {
							left: 5,
							right: 15,
							top: 8,
							bottom: 12
						}
					}
				}
			}, {
				canvas: {
					height: 150,
					width: 250
				}
			});

			expect(chart.chartArea.bottom).toBeCloseToPixel(138);
			expect(chart.chartArea.left).toBeCloseToPixel(5);
			expect(chart.chartArea.right).toBeCloseToPixel(235);
			expect(chart.chartArea.top).toBeCloseToPixel(8);
		});

		it('should default to 0 padding if no dimensions specified', function() {
			var chart = window.acquireChart({
				type: 'bar',
				data: {
					datasets: [
						{
							data: [10, 5, 0, 25, 78, -10]
						}
					],
					labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
				},
				options: {
					scales: {
						xAxes: [{
							id: 'xScale',
							type: 'category',
							display: false
						}],
						yAxes: [{
							id: 'yScale',
							type: 'linear',
							display: false
						}]
					},
					legend: {
						display: false
					},
					title: {
						display: false
					},
					layout: {
						padding: {}
					}
				}
			}, {
				canvas: {
					height: 150,
					width: 250
				}
			});

			expect(chart.chartArea.bottom).toBeCloseToPixel(150);
			expect(chart.chartArea.left).toBeCloseToPixel(0);
			expect(chart.chartArea.right).toBeCloseToPixel(250);
			expect(chart.chartArea.top).toBeCloseToPixel(0);
		});
	});

	describe('ordering by weight', function() {
		it('should keep higher weights outside', function() {
			var chart = window.acquireChart({
				type: 'bar',
				data: {
					datasets: [
						{
							data: [10, 5, 0, 25, 78, -10]
						}
					],
					labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
				},
				options: {
					legend: {
						display: true,
						position: 'left',
					},
					title: {
						display: true,
						position: 'bottom',
					},
				},
			}, {
				canvas: {
					height: 150,
					width: 250
				}
			});

			var xAxis = chart.scales['x-axis-0'];
			var yAxis = chart.scales['y-axis-0'];
			var legend = chart.legend;
			var title = chart.titleBlock;

			expect(yAxis.left).toBe(legend.right);
			expect(xAxis.bottom).toBe(title.top);
		});

		it('should correctly set weights of scales and order them', function() {
			var chart = window.acquireChart({
				type: 'bar',
				data: {
					datasets: [
						{
							data: [10, 5, 0, 25, 78, -10]
						}
					],
					labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
				},
				options: {
					scales: {
						xAxes: [{
							id: 'xScale0',
							type: 'category',
							display: true,
							weight: 1
						}, {
							id: 'xScale1',
							type: 'category',
							display: true,
							weight: 2
						}, {
							id: 'xScale2',
							type: 'category',
							display: true
						}, {
							id: 'xScale3',
							type: 'category',
							display: true,
							position: 'top',
							weight: 1
						}, {
							id: 'xScale4',
							type: 'category',
							display: true,
							position: 'top',
							weight: 2
						}],
						yAxes: [{
							id: 'yScale0',
							type: 'linear',
							display: true,
							weight: 1
						}, {
							id: 'yScale1',
							type: 'linear',
							display: true,
							weight: 2
						}, {
							id: 'yScale2',
							type: 'linear',
							display: true
						}, {
							id: 'yScale3',
							type: 'linear',
							display: true,
							position: 'right',
							weight: 1
						}, {
							id: 'yScale4',
							type: 'linear',
							display: true,
							position: 'right',
							weight: 2
						}]
					}
				}
			}, {
				canvas: {
					height: 150,
					width: 250
				}
			});

			var xScale0 = chart.scales.xScale0;
			var xScale1 = chart.scales.xScale1;
			var xScale2 = chart.scales.xScale2;
			var xScale3 = chart.scales.xScale3;
			var xScale4 = chart.scales.xScale4;

			var yScale0 = chart.scales.yScale0;
			var yScale1 = chart.scales.yScale1;
			var yScale2 = chart.scales.yScale2;
			var yScale3 = chart.scales.yScale3;
			var yScale4 = chart.scales.yScale4;

			expect(xScale0.weight).toBe(1);
			expect(xScale1.weight).toBe(2);
			expect(xScale2.weight).toBe(0);

			expect(xScale3.weight).toBe(1);
			expect(xScale4.weight).toBe(2);

			expect(yScale0.weight).toBe(1);
			expect(yScale1.weight).toBe(2);
			expect(yScale2.weight).toBe(0);

			expect(yScale3.weight).toBe(1);
			expect(yScale4.weight).toBe(2);

			var isOrderCorrect = false;

			// bottom axes
			isOrderCorrect = xScale2.top < xScale0.top && xScale0.top < xScale1.top;
			expect(isOrderCorrect).toBe(true);

			// top axes
			isOrderCorrect = xScale4.top < xScale3.top;
			expect(isOrderCorrect).toBe(true);

			// left axes
			isOrderCorrect = yScale1.left < yScale0.left && yScale0.left < yScale2.left;
			expect(isOrderCorrect).toBe(true);

			// right axes
			isOrderCorrect = yScale3.left < yScale4.left;
			expect(isOrderCorrect).toBe(true);
		});
	});
});
