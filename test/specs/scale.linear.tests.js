describe('Linear Scale', function() {
	it('Should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('linear');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('linear');
		expect(defaultConfig).toEqual({
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
				callback: defaultConfig.ticks.callback, // make this work nicer, then check below
				autoSkip: true,
				autoSkipPadding: 0,
				labelOffset: 0,
				minor: {},
				major: {},
			}
		});

		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
	});

	it('Should correctly determine the max & min data values', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [10, 5, 0, -5, 78, -100]
				}, {
					yAxisID: 'yScale1',
					data: [-1000, 1000],
				}, {
					yAxisID: 'yScale0',
					data: [150]
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}, {
						id: 'yScale1',
						type: 'linear'
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min).toBe(-100);
		expect(chart.scales.yScale0.max).toBe(150);
	});

	it('Should correctly determine the max & min of string data values', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: ['10', '5', '0', '-5', '78', '-100']
				}, {
					yAxisID: 'yScale1',
					data: ['-1000', '1000'],
				}, {
					yAxisID: 'yScale0',
					data: ['150']
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}, {
						id: 'yScale1',
						type: 'linear'
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min).toBe(-100);
		expect(chart.scales.yScale0.max).toBe(150);
	});

	it('Should correctly determine the max & min when no values provided and suggested minimum and maximum are set', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: []
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						ticks: {
							suggestedMin: -10,
							suggestedMax: 15
						}
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min).toBe(-10);
		expect(chart.scales.yScale0.max).toBe(15);
	});

	it('Should correctly determine the max & min data values ignoring hidden datasets', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: ['10', '5', '0', '-5', '78', '-100']
				}, {
					yAxisID: 'yScale1',
					data: ['-1000', '1000'],
				}, {
					yAxisID: 'yScale0',
					data: ['150'],
					hidden: true
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}, {
						id: 'yScale1',
						type: 'linear'
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min).toBe(-100);
		expect(chart.scales.yScale0.max).toBe(80);
	});

	it('Should correctly determine the max & min data values ignoring data that is NaN', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [null, 90, NaN, undefined, 45, 30, Infinity, -Infinity]
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});

		expect(chart.scales.yScale0.min).toBe(30);
		expect(chart.scales.yScale0.max).toBe(90);

		// Scale is now stacked
		chart.scales.yScale0.options.stacked = true;
		chart.update();

		expect(chart.scales.yScale0.min).toBe(0);
		expect(chart.scales.yScale0.max).toBe(90);
	});

	it('Should correctly determine the max & min data values for small numbers', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [-1e-8, 3e-8, -4e-8, 6e-8]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min * 1e8).toBeCloseTo(-4);
		expect(chart.scales.yScale0.max * 1e8).toBeCloseTo(6);
	});

	it('Should correctly determine the max & min for scatter data', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: [{
						x: 10,
						y: 100
					}, {
						x: -10,
						y: 0
					}, {
						x: 0,
						y: 0
					}, {
						x: 99,
						y: 7
					}]
				}],
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'linear',
						position: 'bottom'
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});
		chart.update();

		expect(chart.scales.xScale0.min).toBe(-20);
		expect(chart.scales.xScale0.max).toBe(100);
		expect(chart.scales.yScale0.min).toBe(0);
		expect(chart.scales.yScale0.max).toBe(100);
	});

	it('Should correctly get the label for the given index', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: [{
						x: 10,
						y: 100
					}, {
						x: -10,
						y: 0
					}, {
						x: 0,
						y: 0
					}, {
						x: 99,
						y: 7
					}]
				}],
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'linear',
						position: 'bottom'
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});
		chart.update();

		expect(chart.scales.yScale0.getLabelForIndex(3, 0)).toBe(7);
	});

	it('Should correctly determine the min and max data values when stacked mode is turned on', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [10, 5, 0, -5, 78, -100],
					type: 'bar'
				}, {
					yAxisID: 'yScale1',
					data: [-1000, 1000],
				}, {
					yAxisID: 'yScale0',
					data: [150, 0, 0, -100, -10, 9],
					type: 'bar'
				}, {
					yAxisID: 'yScale0',
					data: [10, 10, 10, 10, 10, 10],
					type: 'line'
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						stacked: true
					}, {
						id: 'yScale1',
						type: 'linear'
					}]
				}
			}
		});
		chart.update();

		expect(chart.scales.yScale0.min).toBe(-150);
		expect(chart.scales.yScale0.max).toBe(200);
	});

	it('Should correctly determine the min and max data values when stacked mode is turned on and there are hidden datasets', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [10, 5, 0, -5, 78, -100],
				}, {
					yAxisID: 'yScale1',
					data: [-1000, 1000],
				}, {
					yAxisID: 'yScale0',
					data: [150, 0, 0, -100, -10, 9],
				}, {
					yAxisID: 'yScale0',
					data: [10, 20, 30, 40, 50, 60],
					hidden: true
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						stacked: true
					}, {
						id: 'yScale1',
						type: 'linear'
					}]
				}
			}
		});
		chart.update();

		expect(chart.scales.yScale0.min).toBe(-150);
		expect(chart.scales.yScale0.max).toBe(200);
	});

	it('Should correctly determine the min and max data values when stacked mode is turned on there are multiple types of datasets', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					type: 'bar',
					data: [10, 5, 0, -5, 78, -100]
				}, {
					type: 'line',
					data: [10, 10, 10, 10, 10, 10],
				}, {
					type: 'bar',
					data: [150, 0, 0, -100, -10, 9]
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						stacked: true
					}]
				}
			}
		});

		chart.scales.yScale0.determineDataLimits();
		expect(chart.scales.yScale0.min).toBe(-105);
		expect(chart.scales.yScale0.max).toBe(160);
	});

	it('Should ensure that the scale has a max and min that are not equal', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min).toBe(-1);
		expect(chart.scales.yScale0.max).toBe(1);
	});

	it('Should ensure that the scale has a max and min that are not equal when beginAtZero is set', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						ticks: {
							beginAtZero: true
						}
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min).toBe(0);
		expect(chart.scales.yScale0.max).toBe(1);
	});

	it('Should use the suggestedMin and suggestedMax options', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [1, 1, 1, 2, 1, 0]
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						ticks: {
							suggestedMax: 10,
							suggestedMin: -10
						}
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min).toBe(-10);
		expect(chart.scales.yScale0.max).toBe(10);
	});

	it('Should use the min and max options', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [1, 1, 1, 2, 1, 0]
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						ticks: {
							max: 1010,
							min: -1010
						}
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min).toBe(-1010);
		expect(chart.scales.yScale0.max).toBe(1010);
		expect(chart.scales.yScale0.ticks[0]).toBe('1010');
		expect(chart.scales.yScale0.ticks[chart.scales.yScale0.ticks.length - 1]).toBe('-1010');
	});

	it('Should use min, max and stepSize to create fixed spaced ticks', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [10, 3, 6, 8, 3, 1]
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						ticks: {
							min: 1,
							max: 11,
							stepSize: 2
						}
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min).toBe(1);
		expect(chart.scales.yScale0.max).toBe(11);
		expect(chart.scales.yScale0.ticks).toEqual(['11', '10', '8', '6', '4', '2', '1']);
	});

	it('Should create decimal steps if stepSize is a decimal number', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [10, 3, 6, 8, 3, 1]
				}],
				labels: ['a', 'b', 'c', 'd', 'e', 'f']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						ticks: {
							stepSize: 2.5
						}
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.min).toBe(0);
		expect(chart.scales.yScale0.max).toBe(10);
		expect(chart.scales.yScale0.ticks).toEqual(['10', '7.5', '5', '2.5', '0']);
	});

	describe('precision', function() {
		it('Should create integer steps if precision is 0', function() {
			var chart = window.acquireChart({
				type: 'bar',
				data: {
					datasets: [{
						yAxisID: 'yScale0',
						data: [0, 1, 2, 1, 0, 1]
					}],
					labels: ['a', 'b', 'c', 'd', 'e', 'f']
				},
				options: {
					scales: {
						yAxes: [{
							id: 'yScale0',
							type: 'linear',
							ticks: {
								precision: 0
							}
						}]
					}
				}
			});

			expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
			expect(chart.scales.yScale0.min).toBe(0);
			expect(chart.scales.yScale0.max).toBe(2);
			expect(chart.scales.yScale0.ticks).toEqual(['2', '1', '0']);
		});

		it('Should round the step size to the given number of decimal places', function() {
			var chart = window.acquireChart({
				type: 'bar',
				data: {
					datasets: [{
						yAxisID: 'yScale0',
						data: [0, 0.001, 0.002, 0.003, 0, 0.001]
					}],
					labels: ['a', 'b', 'c', 'd', 'e', 'f']
				},
				options: {
					scales: {
						yAxes: [{
							id: 'yScale0',
							type: 'linear',
							ticks: {
								precision: 2
							}
						}]
					}
				}
			});

			expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
			expect(chart.scales.yScale0.min).toBe(0);
			expect(chart.scales.yScale0.max).toBe(0.01);
			expect(chart.scales.yScale0.ticks).toEqual(['0.01', '0']);
		});
	});


	it('should forcibly include 0 in the range if the beginAtZero option is used', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [20, 30, 40, 50]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.ticks).toEqual(['50', '45', '40', '35', '30', '25', '20']);

		chart.scales.yScale0.options.ticks.beginAtZero = true;
		chart.update();
		expect(chart.scales.yScale0.ticks).toEqual(['50', '45', '40', '35', '30', '25', '20', '15', '10', '5', '0']);

		chart.data.datasets[0].data = [-20, -30, -40, -50];
		chart.update();
		expect(chart.scales.yScale0.ticks).toEqual(['0', '-5', '-10', '-15', '-20', '-25', '-30', '-35', '-40', '-45', '-50']);

		chart.scales.yScale0.options.ticks.beginAtZero = false;
		chart.update();
		expect(chart.scales.yScale0.ticks).toEqual(['-20', '-25', '-30', '-35', '-40', '-45', '-50']);
	});

	it('Should generate tick marks in the correct order in reversed mode', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						ticks: {
							reverse: true
						}
					}]
				}
			}
		});

		expect(chart.scales.yScale0.ticks).toEqual(['0', '10', '20', '30', '40', '50', '60', '70', '80']);
		expect(chart.scales.yScale0.start).toBe(80);
		expect(chart.scales.yScale0.end).toBe(0);
	});

	it('should use the correct number of decimal places in the default format function', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [0.06, 0.005, 0, 0.025, 0.0078]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
					}]
				}
			}
		});
		expect(chart.scales.yScale0.ticks).toEqual(['0.06', '0.05', '0.04', '0.03', '0.02', '0.01', '0']);
	});

	it('Should correctly limit the maximum number of ticks', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				labels: ['a', 'b'],
				datasets: [{
					data: [0.5, 2.5]
				}]
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale'
					}]
				}
			}
		});

		expect(chart.scales.yScale.ticks).toEqual(['2.5', '2.0', '1.5', '1.0', '0.5']);

		chart.options.scales.yAxes[0].ticks.maxTicksLimit = 11;
		chart.update();

		expect(chart.scales.yScale.ticks).toEqual(['2.5', '2.0', '1.5', '1.0', '0.5']);

		chart.options.scales.yAxes[0].ticks.maxTicksLimit = 21;
		chart.update();

		expect(chart.scales.yScale.ticks).toEqual([
			'2.5', '2.4', '2.3', '2.2', '2.1', '2.0', '1.9', '1.8', '1.7', '1.6',
			'1.5', '1.4', '1.3', '1.2', '1.1', '1.0', '0.9', '0.8', '0.7', '0.6',
			'0.5'
		]);

		chart.options.scales.yAxes[0].ticks.maxTicksLimit = 11;
		chart.options.scales.yAxes[0].ticks.stepSize = 0.01;
		chart.update();

		expect(chart.scales.yScale.ticks).toEqual(['2.5', '2.0', '1.5', '1.0', '0.5']);

		chart.options.scales.yAxes[0].ticks.min = 0.3;
		chart.options.scales.yAxes[0].ticks.max = 2.8;
		chart.update();

		expect(chart.scales.yScale.ticks).toEqual(['2.8', '2.5', '2.0', '1.5', '1.0', '0.5', '0.3']);
	});

	it('Should build labels using the user supplied callback', function() {
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					yAxisID: 'yScale0',
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['a', 'b', 'c', 'd']
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						ticks: {
							callback: function(value, index) {
								return index.toString();
							}
						}
					}]
				}
			}
		});

		// Just the index
		expect(chart.scales.yScale0.ticks).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
	});

	it('Should get the correct pixel value for a point', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: []
				}],
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'linear',
						position: 'bottom'
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});

		var xScale = chart.scales.xScale0;
		expect(xScale.getPixelForValue(1, 0, 0)).toBeCloseToPixel(501); // right - paddingRight
		expect(xScale.getPixelForValue(-1, 0, 0)).toBeCloseToPixel(31 + 6); // left + paddingLeft + lineSpace
		expect(xScale.getPixelForValue(0, 0, 0)).toBeCloseToPixel(266 + 6 / 2); // halfway*/

		expect(xScale.getValueForPixel(501)).toBeCloseTo(1, 1e-2);
		expect(xScale.getValueForPixel(31)).toBeCloseTo(-1, 1e-2);
		expect(xScale.getValueForPixel(266)).toBeCloseTo(0, 1e-2);

		var yScale = chart.scales.yScale0;
		expect(yScale.getPixelForValue(1, 0, 0)).toBeCloseToPixel(32); // right - paddingRight
		expect(yScale.getPixelForValue(-1, 0, 0)).toBeCloseToPixel(484); // left + paddingLeft
		expect(yScale.getPixelForValue(0, 0, 0)).toBeCloseToPixel(258); // halfway*/

		expect(yScale.getValueForPixel(32)).toBeCloseTo(1, 1e-2);
		expect(yScale.getValueForPixel(484)).toBeCloseTo(-1, 1e-2);
		expect(yScale.getValueForPixel(258)).toBeCloseTo(0, 1e-2);
	});

	it('should fit correctly', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: [{
						x: 10,
						y: 100
					}, {
						x: -10,
						y: 0
					}, {
						x: 0,
						y: 0
					}, {
						x: 99,
						y: 7
					}]
				}],
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'linear',
						position: 'bottom'
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'linear'
					}]
				}
			}
		});

		var xScale = chart.scales.xScale0;
		expect(xScale.paddingTop).toBeCloseToPixel(0);
		expect(xScale.paddingBottom).toBeCloseToPixel(0);
		expect(xScale.paddingLeft).toBeCloseToPixel(0);
		expect(xScale.paddingRight).toBeCloseToPixel(0);
		expect(xScale.width).toBeCloseToPixel(468 - 6); // minus lineSpace
		expect(xScale.height).toBeCloseToPixel(30);

		var yScale = chart.scales.yScale0;
		expect(yScale.paddingTop).toBeCloseToPixel(0);
		expect(yScale.paddingBottom).toBeCloseToPixel(0);
		expect(yScale.paddingLeft).toBeCloseToPixel(0);
		expect(yScale.paddingRight).toBeCloseToPixel(0);
		expect(yScale.width).toBeCloseToPixel(30 + 6); // plus lineSpace
		expect(yScale.height).toBeCloseToPixel(450);

		// Extra size when scale label showing
		xScale.options.scaleLabel.display = true;
		yScale.options.scaleLabel.display = true;
		chart.update();

		expect(xScale.paddingTop).toBeCloseToPixel(0);
		expect(xScale.paddingBottom).toBeCloseToPixel(0);
		expect(xScale.paddingLeft).toBeCloseToPixel(0);
		expect(xScale.paddingRight).toBeCloseToPixel(0);
		expect(xScale.width).toBeCloseToPixel(440);
		expect(xScale.height).toBeCloseToPixel(53);

		expect(yScale.paddingTop).toBeCloseToPixel(0);
		expect(yScale.paddingBottom).toBeCloseToPixel(0);
		expect(yScale.paddingLeft).toBeCloseToPixel(0);
		expect(yScale.paddingRight).toBeCloseToPixel(0);
		expect(yScale.width).toBeCloseToPixel(58);
		expect(yScale.height).toBeCloseToPixel(427);
	});

	it('should fit correctly when display is turned off', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'xScale0',
					yAxisID: 'yScale0',
					data: [{
						x: 10,
						y: 100
					}, {
						x: -10,
						y: 0
					}, {
						x: 0,
						y: 0
					}, {
						x: 99,
						y: 7
					}]
				}],
			},
			options: {
				scales: {
					xAxes: [{
						id: 'xScale0',
						type: 'linear',
						position: 'bottom'
					}],
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
						gridLines: {
							drawTicks: false,
							drawBorder: false
						},
						scaleLabel: {
							display: false,
							lineHeight: 1.2
						},
						ticks: {
							display: false,
							padding: 0
						}
					}]
				}
			}
		});

		var yScale = chart.scales.yScale0;
		expect(yScale.width).toBeCloseToPixel(0);
	});

	it('max and min value should be valid and finite when charts datasets are hidden', function() {
		var barData = {
			labels: ['S1', 'S2', 'S3'],
			datasets: [{
				label: 'Closed',
				backgroundColor: '#382765',
				data: [2500, 2000, 1500]
			}, {
				label: 'In Progress',
				backgroundColor: '#7BC225',
				data: [1000, 2000, 1500]
			}, {
				label: 'Assigned',
				backgroundColor: '#ffC225',
				data: [1000, 2000, 1500]
			}]
		};

		var chart = window.acquireChart({
			type: 'horizontalBar',
			data: barData,
			options: {
				scales: {
					xAxes: [{
						stacked: true
					}],
					yAxes: [{
						stacked: true
					}]
				}
			}
		});

		barData.datasets.forEach(function(data, index) {
			var meta = chart.getDatasetMeta(index);
			meta.hidden = true;
			chart.update();
		});

		expect(chart.scales['x-axis-0'].min).toEqual(0);
		expect(chart.scales['x-axis-0'].max).toEqual(1);
	});

	it('max and min value should be valid when min is set and all datasets are hidden', function() {
		var barData = {
			labels: ['S1', 'S2', 'S3'],
			datasets: [{
				label: 'dataset 1',
				backgroundColor: '#382765',
				data: [2500, 2000, 1500],
				hidden: true,
			}]
		};

		var chart = window.acquireChart({
			type: 'horizontalBar',
			data: barData,
			options: {
				scales: {
					xAxes: [{
						ticks: {
							min: 20
						}
					}]
				}
			}
		});

		expect(chart.scales['x-axis-0'].min).toEqual(20);
		expect(chart.scales['x-axis-0'].max).toEqual(21);
	});

	it('min settings should be used if set to zero', function() {
		var barData = {
			labels: ['S1', 'S2', 'S3'],
			datasets: [{
				label: 'dataset 1',
				backgroundColor: '#382765',
				data: [2500, 2000, 1500]
			}]
		};

		var chart = window.acquireChart({
			type: 'horizontalBar',
			data: barData,
			options: {
				scales: {
					xAxes: [{
						ticks: {
							min: 0,
							max: 3000
						}
					}]
				}
			}
		});

		expect(chart.scales['x-axis-0'].min).toEqual(0);
	});

	it('max settings should be used if set to zero', function() {
		var barData = {
			labels: ['S1', 'S2', 'S3'],
			datasets: [{
				label: 'dataset 1',
				backgroundColor: '#382765',
				data: [-2500, -2000, -1500]
			}]
		};

		var chart = window.acquireChart({
			type: 'horizontalBar',
			data: barData,
			options: {
				scales: {
					xAxes: [{
						ticks: {
							min: -3000,
							max: 0
						}
					}]
				}
			}
		});

		expect(chart.scales['x-axis-0'].max).toEqual(0);
	});

	it('minBarLength settings should be used on Y axis on bar chart', function() {
		var minBarLength = 4;
		var chart = window.acquireChart({
			type: 'bar',
			data: {
				datasets: [{
					data: [0.05, -0.05, 10, 15, 20, 25, 30, 35]
				}]
			},
			options: {
				scales: {
					yAxes: [{
						minBarLength: minBarLength
					}]
				}
			}
		});

		var data = chart.getDatasetMeta(0).data;

		expect(data[0]._model.base - minBarLength).toEqual(data[0]._model.y);
		expect(data[1]._model.base + minBarLength).toEqual(data[1]._model.y);
	});

	it('minBarLength settings should be used on X axis on horizontalBar chart', function() {
		var minBarLength = 4;
		var chart = window.acquireChart({
			type: 'horizontalBar',
			data: {
				datasets: [{
					data: [0.05, -0.05, 10, 15, 20, 25, 30, 35]
				}]
			},
			options: {
				scales: {
					xAxes: [{
						minBarLength: minBarLength
					}]
				}
			}
		});

		var data = chart.getDatasetMeta(0).data;

		expect(data[0]._model.base + minBarLength).toEqual(data[0]._model.x);
		expect(data[1]._model.base - minBarLength).toEqual(data[1]._model.x);
	});

	it('Should generate max and min that are not equal when data contains values that are very close to each other', function() {
		var chart = window.acquireChart({
			type: 'scatter',
			data: {
				datasets: [{
					data: [
						{x: 1, y: 1.8548483304974972},
						{x: 2, y: 1.8548483304974974},
					]
				}],
			},
			options: {
				scales: {
					yAxes: [{
						id: 'yScale0',
						type: 'linear',
					}]
				}
			}
		});

		expect(chart.scales.yScale0).not.toEqual(undefined); // must construct
		expect(chart.scales.yScale0.max).toBeGreaterThan(chart.scales.yScale0.min);
	});
});
