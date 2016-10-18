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
});
