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

		expect(chart.chartArea.bottom).toBeCloseToPixel(120);
		expect(chart.chartArea.left).toBeCloseToPixel(34);
		expect(chart.chartArea.right).toBeCloseToPixel(247);
		expect(chart.chartArea.top).toBeCloseToPixel(32);

		// Is xScale at the right spot
		expect(chart.scales.xScale.bottom).toBeCloseToPixel(150);
		expect(chart.scales.xScale.left).toBeCloseToPixel(34);
		expect(chart.scales.xScale.right).toBeCloseToPixel(247);
		expect(chart.scales.xScale.top).toBeCloseToPixel(120);
		expect(chart.scales.xScale.labelRotation).toBeCloseTo(0);

		// Is yScale at the right spot
		expect(chart.scales.yScale.bottom).toBeCloseToPixel(120);
		expect(chart.scales.yScale.left).toBeCloseToPixel(0);
		expect(chart.scales.yScale.right).toBeCloseToPixel(34);
		expect(chart.scales.yScale.top).toBeCloseToPixel(32);
		expect(chart.scales.yScale.labelRotation).toBeCloseTo(0);
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

		expect(chart.chartArea.bottom).toBeCloseToPixel(142);
		expect(chart.chartArea.left).toBeCloseToPixel(3);
		expect(chart.chartArea.right).toBeCloseToPixel(216);
		expect(chart.chartArea.top).toBeCloseToPixel(62);

		// Is xScale at the right spot
		expect(chart.scales.xScale.bottom).toBeCloseToPixel(62);
		expect(chart.scales.xScale.left).toBeCloseToPixel(3);
		expect(chart.scales.xScale.right).toBeCloseToPixel(216);
		expect(chart.scales.xScale.top).toBeCloseToPixel(32);
		expect(chart.scales.xScale.labelRotation).toBeCloseTo(0);

		// Is yScale at the right spot
		expect(chart.scales.yScale.bottom).toBeCloseToPixel(142);
		expect(chart.scales.yScale.left).toBeCloseToPixel(216);
		expect(chart.scales.yScale.right).toBeCloseToPixel(250);
		expect(chart.scales.yScale.top).toBeCloseToPixel(62);
		expect(chart.scales.yScale.labelRotation).toBeCloseTo(0);
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
					xAxes: [{
						id: 'xScale',
						type: 'category',
						ticks: {
							maxRotation: 0,
							autoSkip: false
						}
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
				width: 512
			}
		});

		expect(chart.chartArea.bottom).toBeCloseToPixel(120);
		expect(chart.chartArea.left).toBeCloseToPixel(60);
		expect(chart.chartArea.right).toBeCloseToPixel(452);
		expect(chart.chartArea.top).toBeCloseToPixel(7);

		// Is xScale at the right spot
		expect(chart.scales.xScale.bottom).toBeCloseToPixel(150);
		expect(chart.scales.xScale.left).toBeCloseToPixel(60);
		expect(chart.scales.xScale.right).toBeCloseToPixel(452);
		expect(chart.scales.xScale.top).toBeCloseToPixel(120);
		expect(chart.scales.xScale.labelRotation).toBeCloseTo(0);

		expect(chart.scales.xScale.height).toBeCloseToPixel(30);
		expect(chart.scales.xScale.paddingLeft).toBeCloseToPixel(60);
		expect(chart.scales.xScale.paddingTop).toBeCloseToPixel(0);
		expect(chart.scales.xScale.paddingRight).toBeCloseToPixel(60);
		expect(chart.scales.xScale.paddingBottom).toBeCloseToPixel(0);

		// Is yScale at the right spot
		expect(chart.scales.yScale.bottom).toBeCloseToPixel(120);
		expect(chart.scales.yScale.left).toBeCloseToPixel(452);
		expect(chart.scales.yScale.right).toBeCloseToPixel(486);
		expect(chart.scales.yScale.top).toBeCloseToPixel(7);
		expect(chart.scales.yScale.labelRotation).toBeCloseTo(0);

		expect(chart.scales.yScale.width).toBeCloseToPixel(34);
		expect(chart.scales.yScale.paddingLeft).toBeCloseToPixel(0);
		expect(chart.scales.yScale.paddingTop).toBeCloseToPixel(7);
		expect(chart.scales.yScale.paddingRight).toBeCloseToPixel(0);
		expect(chart.scales.yScale.paddingBottom).toBeCloseToPixel(7);
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

	it('should fit multiple axes in the same position', function() {
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

		expect(chart.chartArea.bottom).toBeCloseToPixel(118);
		expect(chart.chartArea.left).toBeCloseToPixel(73);
		expect(chart.chartArea.right).toBeCloseToPixel(247);
		expect(chart.chartArea.top).toBeCloseToPixel(32);

		// Is xScale at the right spot
		expect(chart.scales.xScale.bottom).toBeCloseToPixel(150);
		expect(chart.scales.xScale.left).toBeCloseToPixel(73);
		expect(chart.scales.xScale.right).toBeCloseToPixel(247);
		expect(chart.scales.xScale.top).toBeCloseToPixel(118);
		expect(chart.scales.xScale.labelRotation).toBeCloseTo(40, -1);

		// Are yScales at the right spot
		expect(chart.scales.yScale1.bottom).toBeCloseToPixel(118);
		expect(chart.scales.yScale1.left).toBeCloseToPixel(41);
		expect(chart.scales.yScale1.right).toBeCloseToPixel(73);
		expect(chart.scales.yScale1.top).toBeCloseToPixel(32);
		expect(chart.scales.yScale1.labelRotation).toBeCloseTo(0);

		expect(chart.scales.yScale2.bottom).toBeCloseToPixel(118);
		expect(chart.scales.yScale2.left).toBeCloseToPixel(0);
		expect(chart.scales.yScale2.right).toBeCloseToPixel(41);
		expect(chart.scales.yScale2.top).toBeCloseToPixel(32);
		expect(chart.scales.yScale2.labelRotation).toBeCloseTo(0);
	});

	it ('should fit a full width box correctly', function() {
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
		expect(chart.chartArea.left).toBeCloseToPixel(40);
		expect(chart.chartArea.right).toBeCloseToPixel(496);
		expect(chart.chartArea.top).toBeCloseToPixel(62);

		// Are xScales at the right spot
		expect(chart.scales.xScale1.bottom).toBeCloseToPixel(512);
		expect(chart.scales.xScale1.left).toBeCloseToPixel(40);
		expect(chart.scales.xScale1.right).toBeCloseToPixel(496);
		expect(chart.scales.xScale1.top).toBeCloseToPixel(484);

		expect(chart.scales.xScale2.bottom).toBeCloseToPixel(62);
		expect(chart.scales.xScale2.left).toBeCloseToPixel(0);
		expect(chart.scales.xScale2.right).toBeCloseToPixel(512);
		expect(chart.scales.xScale2.top).toBeCloseToPixel(32);

		// Is yScale at the right spot
		expect(chart.scales.yScale.bottom).toBeCloseToPixel(484);
		expect(chart.scales.yScale.left).toBeCloseToPixel(0);
		expect(chart.scales.yScale.right).toBeCloseToPixel(40);
		expect(chart.scales.yScale.top).toBeCloseToPixel(62);
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
			var yAxis = chart.scales['y-axis-0'];

			// issue #4441: y-axis labels partially hidden.
			// minimum horizontal space required to fit labels
			expect(yAxis.width).toBeCloseToPixel(33);
			expect(yAxis.ticks).toEqual(['2.5', '2.0', '1.5', '1.0', '0.5', '0']);
		});

		it('should correctly handle NaN dimensions', function() {

			// issue #7761: Maximum call stack size exceeded
			var chartContainer = document.createElement('div');
			chartContainer.style.width = '600px';
			chartContainer.style.height = '400px';

			var chartCanvas = document.createElement('canvas');
			chartContainer.appendChild(chartCanvas);

			var chart = new Chart(chartCanvas, {
				type: 'line',
				responsive: true,
				data: {
					labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
					datasets: [{
						label: '# of Votes',
						data: [12, 19, 3, 5, 2, 3]
					}]
				},
				options: {
					scales: {
						yAxes: [{
							type: 'linear',
							label: 'first axis',
							position: 'right'
						}, {
							type: 'linear',
							label: 'second axis',
							position: 'right'
						}]
					}
				}
			});

			expect(chart.width).toBeNaN();
			expect(chart.height).toBeNaN();

		});
	});
});
