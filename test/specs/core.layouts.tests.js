function getLabels(scale) {
	return scale.ticks.map(t => t.label);
}

describe('Chart.layouts', function() {
	it('should be exposed through Chart.layouts', function() {
		expect(Chart.layouts).toBeDefined();
		expect(typeof Chart.layouts).toBe('object');
		expect(Chart.layouts.defaults).toBeDefined();
		expect(Chart.layouts.addBox).toBeDefined();
		expect(Chart.layouts.removeBox).toBeDefined();
		expect(Chart.layouts.configure).toBeDefined();
		expect(Chart.layouts.update).toBeDefined();
	});

	it('should fit a simple chart with 2 scales', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [
					{data: [10, 5, 0, 25, 78, -10]}
				],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
			}
		}, {
			canvas: {
				height: 150,
				width: 250
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(120);
		expect(chart.chartArea.left).toBeCloseToPixel(34);
		expect(chart.chartArea.right).toBeCloseToPixel(247);
		expect(chart.chartArea.top).toBeCloseToPixel(32);

		// Is xScale at the right spot
		expect(chart.scales.x.bottom).toBeCloseToPixel(150);
		expect(chart.scales.x.left).toBeCloseToPixel(34);
		expect(chart.scales.x.right).toBeCloseToPixel(247);
		expect(chart.scales.x.top).toBeCloseToPixel(120);
		expect(chart.scales.x.labelRotation).toBeCloseTo(0);

		// Is yScale at the right spot
		expect(chart.scales.y.bottom).toBeCloseToPixel(120);
		expect(chart.scales.y.left).toBeCloseToPixel(0);
		expect(chart.scales.y.right).toBeCloseToPixel(34);
		expect(chart.scales.y.top).toBeCloseToPixel(32);
		expect(chart.scales.y.labelRotation).toBeCloseTo(0);
	});

	it('should fit scales that are in the top and right positions', function() {
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
					x: {
						type: 'category',
						position: 'top'
					},
					y: {
						type: 'linear',
						position: 'right'
					}
				}
			}
		}, {
			canvas: {
				height: 150,
				width: 250
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(142);
		expect(chart.chartArea.left).toBeCloseToPixel(3);
		expect(chart.chartArea.right).toBeCloseToPixel(216);
		expect(chart.chartArea.top).toBeCloseToPixel(62);

		// Is xScale at the right spot
		expect(chart.scales.x.bottom).toBeCloseToPixel(62);
		expect(chart.scales.x.left).toBeCloseToPixel(3);
		expect(chart.scales.x.right).toBeCloseToPixel(216);
		expect(chart.scales.x.top).toBeCloseToPixel(32);
		expect(chart.scales.x.labelRotation).toBeCloseTo(0);

		// Is yScale at the right spot
		expect(chart.scales.y.bottom).toBeCloseToPixel(142);
		expect(chart.scales.y.left).toBeCloseToPixel(216);
		expect(chart.scales.y.right).toBeCloseToPixel(250);
		expect(chart.scales.y.top).toBeCloseToPixel(62);
		expect(chart.scales.y.labelRotation).toBeCloseTo(0);
	});

	it('should fit scales with long labels correctly', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [
					{data: [10, 5, 0, 25, 78, -10]}
				],
				labels: ['tick1 is very long one', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6 is very long one']
			},
			options: {
				legend: {
					display: false
				},
				scales: {
					x: {
						type: 'category',
						ticks: {
							maxRotation: 0,
							autoSkip: false
						}
					},
					y: {
						type: 'linear',
						position: 'right'
					}
				}
			}
		}, {
			canvas: {
				height: 150,
				width: 512
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(120);
		expect(chart.chartArea.left).toBeCloseToPixel(60);
		expect(chart.chartArea.right).toBeCloseToPixel(452);
		expect(chart.chartArea.top).toBeCloseToPixel(7);

		// Is xScale at the right spot
		expect(chart.scales.x.bottom).toBeCloseToPixel(150);
		expect(chart.scales.x.left).toBeCloseToPixel(60);
		expect(chart.scales.x.right).toBeCloseToPixel(452);
		expect(chart.scales.x.top).toBeCloseToPixel(120);
		expect(chart.scales.x.labelRotation).toBeCloseTo(0);

		expect(chart.scales.x.height).toBeCloseToPixel(30);
		expect(chart.scales.x.paddingLeft).toBeCloseToPixel(60);
		expect(chart.scales.x.paddingTop).toBeCloseToPixel(0);
		expect(chart.scales.x.paddingRight).toBeCloseToPixel(60);
		expect(chart.scales.x.paddingBottom).toBeCloseToPixel(0);

		// Is yScale at the right spot
		expect(chart.scales.y.bottom).toBeCloseToPixel(120);
		expect(chart.scales.y.left).toBeCloseToPixel(452);
		expect(chart.scales.y.right).toBeCloseToPixel(486);
		expect(chart.scales.y.top).toBeCloseToPixel(7);
		expect(chart.scales.y.labelRotation).toBeCloseTo(0);

		expect(chart.scales.y.width).toBeCloseToPixel(34);
		expect(chart.scales.y.paddingLeft).toBeCloseToPixel(0);
		expect(chart.scales.y.paddingTop).toBeCloseToPixel(7);
		expect(chart.scales.y.paddingRight).toBeCloseToPixel(0);
		expect(chart.scales.y.paddingBottom).toBeCloseToPixel(7);
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

		var scale = chart.scales.r;
		expect(scale.bottom).toBeCloseToPixel(512);
		expect(scale.left).toBeCloseToPixel(0);
		expect(scale.right).toBeCloseToPixel(512);
		expect(scale.top).toBeCloseToPixel(32);
		expect(scale.width).toBeCloseToPixel(512);
		expect(scale.height).toBeCloseToPixel(480);
	});

	it('should fit multiple axes in the same position', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'y',
					data: [10, 5, 0, 25, 78, -10]
				}, {
					yAxisID: 'y2',
					data: [-19, -20, 0, -99, -50, 0]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
			},
			options: {
				scales: {
					x: {
						type: 'category'
					},
					y: {
						type: 'linear'
					},
					y2: {
						type: 'linear'
					}
				}
			}
		}, {
			canvas: {
				height: 150,
				width: 250
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(118);
		expect(chart.chartArea.left).toBeCloseToPixel(73);
		expect(chart.chartArea.right).toBeCloseToPixel(247);
		expect(chart.chartArea.top).toBeCloseToPixel(32);

		// Is xScale at the right spot
		expect(chart.scales.x.bottom).toBeCloseToPixel(150);
		expect(chart.scales.x.left).toBeCloseToPixel(73);
		expect(chart.scales.x.right).toBeCloseToPixel(247);
		expect(chart.scales.x.top).toBeCloseToPixel(118);
		expect(chart.scales.x.labelRotation).toBeCloseTo(40, -1);

		// Are yScales at the right spot
		expect(chart.scales.y.bottom).toBeCloseToPixel(118);
		expect(chart.scales.y.left).toBeCloseToPixel(41);
		expect(chart.scales.y.right).toBeCloseToPixel(73);
		expect(chart.scales.y.top).toBeCloseToPixel(32);
		expect(chart.scales.y.labelRotation).toBeCloseTo(0);

		expect(chart.scales.y2.bottom).toBeCloseToPixel(118);
		expect(chart.scales.y2.left).toBeCloseToPixel(0);
		expect(chart.scales.y2.right).toBeCloseToPixel(41);
		expect(chart.scales.y2.top).toBeCloseToPixel(32);
		expect(chart.scales.y2.labelRotation).toBeCloseTo(0);
	});

	it ('should fit a full width box correctly', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					xAxisID: 'x',
					data: [10, 5, 0, 25, 78, -10]
				}, {
					xAxisID: 'x2',
					data: [-19, -20, 0, -99, -50, 0]
				}],
				labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
			},
			options: {
				scales: {
					x: {
						type: 'category',
						offset: false
					},
					x2: {
						type: 'category',
						position: 'top',
						fullWidth: true,
						offset: false
					},
					y: {
						type: 'linear'
					}
				}
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(484);
		expect(chart.chartArea.left).toBeCloseToPixel(40);
		expect(chart.chartArea.right).toBeCloseToPixel(496);
		expect(chart.chartArea.top).toBeCloseToPixel(62);

		// Are xScales at the right spot
		expect(chart.scales.x.bottom).toBeCloseToPixel(512);
		expect(chart.scales.x.left).toBeCloseToPixel(40);
		expect(chart.scales.x.right).toBeCloseToPixel(496);
		expect(chart.scales.x.top).toBeCloseToPixel(484);

		expect(chart.scales.x2.bottom).toBeCloseToPixel(62);
		expect(chart.scales.x2.left).toBeCloseToPixel(0);
		expect(chart.scales.x2.right).toBeCloseToPixel(512);
		expect(chart.scales.x2.top).toBeCloseToPixel(32);

		// Is yScale at the right spot
		expect(chart.scales.y.bottom).toBeCloseToPixel(484);
		expect(chart.scales.y.left).toBeCloseToPixel(0);
		expect(chart.scales.y.right).toBeCloseToPixel(40);
		expect(chart.scales.y.top).toBeCloseToPixel(62);
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
						x: {
							type: 'category',
							display: false
						},
						y: {
							type: 'linear',
							display: false
						}
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
						x: {
							type: 'category',
							display: false
						},
						y: {
							type: 'linear',
							display: false
						}
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
						x: {
							type: 'category',
							display: false
						},
						y: {
							type: 'linear',
							display: false
						}
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

			var xAxis = chart.scales.x;
			var yAxis = chart.scales.y;
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
						x: {
							type: 'category',
							position: 'bottom',
							display: true,
							weight: 1
						},
						x1: {
							type: 'category',
							position: 'bottom',
							display: true,
							weight: 2
						},
						x2: {
							type: 'category',
							position: 'bottom',
							display: true
						},
						x3: {
							type: 'category',
							display: true,
							position: 'top',
							weight: 1
						},
						x4: {
							type: 'category',
							display: true,
							position: 'top',
							weight: 2
						},
						y: {
							type: 'linear',
							display: true,
							weight: 1
						},
						y1: {
							type: 'linear',
							position: 'left',
							display: true,
							weight: 2
						},
						y2: {
							type: 'linear',
							position: 'left',
							display: true
						},
						y3: {
							type: 'linear',
							display: true,
							position: 'right',
							weight: 1
						},
						y4: {
							type: 'linear',
							display: true,
							position: 'right',
							weight: 2
						}
					}
				}
			}, {
				canvas: {
					height: 150,
					width: 250
				}
			});

			var xScale0 = chart.scales.x;
			var xScale1 = chart.scales.x1;
			var xScale2 = chart.scales.x2;
			var xScale3 = chart.scales.x3;
			var xScale4 = chart.scales.x4;

			var yScale0 = chart.scales.y;
			var yScale1 = chart.scales.y1;
			var yScale2 = chart.scales.y2;
			var yScale3 = chart.scales.y3;
			var yScale4 = chart.scales.y4;

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

	describe('box sizing', function() {
		it('should correctly compute y-axis width to fit labels', function() {
			var chart = window.acquireChart({
				type: 'bar',
				data: {
					labels: ['tick 1', 'tick 2', 'tick 3', 'tick 4', 'tick 5'],
					datasets: [{
						data: [0, 2.25, 1.5, 1.25, 2.5]
					}],
				},
				options: {
					legend: {
						display: false,
					},
				},
			}, {
				canvas: {
					height: 256,
					width: 256
				}
			});
			var yAxis = chart.scales.y;

			// issue #4441: y-axis labels partially hidden.
			// minimum horizontal space required to fit labels
			expect(yAxis.width).toBeCloseToPixel(33);
			expect(getLabels(yAxis)).toEqual(['2.5', '2.0', '1.5', '1.0', '0.5', '0']);
		});
	});
});
