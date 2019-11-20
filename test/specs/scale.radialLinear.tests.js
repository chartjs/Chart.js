function getLabels(scale) {
	return scale.ticks.map(t => t.label);
}

// Tests for the radial linear scale used by the polar area and radar charts
describe('Test the radial linear scale', function() {
	describe('auto', jasmine.fixture.specs('scale.radialLinear'));

	it('Should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('radialLinear');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('Should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('radialLinear');
		expect(defaultConfig).toEqual({
			angleLines: {
				display: true,
				color: 'rgba(0,0,0,0.1)',
				lineWidth: 1,
				borderDash: [],
				borderDashOffset: 0.0
			},
			animate: true,
			display: true,
			gridLines: {
				circular: false,
				color: 'rgba(0,0,0,0.1)',
				drawBorder: true,
				drawOnChartArea: true,
				drawTicks: true,
				tickMarkLength: 10,
				lineWidth: 1,
				offsetGridLines: false,
				display: true,
				borderDash: [],
				borderDashOffset: 0.0
			},
			pointLabels: {
				display: true,
				fontSize: 10,
				callback: defaultConfig.pointLabels.callback, // make this nicer, then check explicitly below
			},
			position: 'chartArea',
			offset: false,
			reverse: false,
			beginAtZero: false,
			scaleLabel: Chart.defaults.scale.scaleLabel,
			ticks: {
				backdropColor: 'rgba(255,255,255,0.75)',
				backdropPaddingY: 2,
				backdropPaddingX: 2,
				minRotation: 0,
				maxRotation: 50,
				mirror: false,
				padding: 0,
				showLabelBackdrop: true,
				display: true,
				callback: defaultConfig.ticks.callback, // make this nicer, then check explicitly below
				autoSkip: true,
				autoSkipPadding: 0,
				labelOffset: 0,
				minor: {},
				major: {},
			},
		});

		// Is this actually a function
		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
		expect(defaultConfig.pointLabels.callback).toEqual(jasmine.any(Function));
	});

	it('Should correctly determine the max & min data values', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, -5, 78, -100]
				}, {
					data: [150]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scales: {}
			}
		});

		expect(chart.scales.r.min).toBe(-100);
		expect(chart.scales.r.max).toBe(150);
	});

	it('Should correctly determine the max & min of string data values', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: ['10', '5', '0', '-5', '78', '-100']
				}, {
					data: ['150']
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scales: {}
			}
		});

		expect(chart.scales.r.min).toBe(-100);
		expect(chart.scales.r.max).toBe(150);
	});

	it('Should correctly determine the max & min data values when there are hidden datasets', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: ['10', '5', '0', '-5', '78', '-100']
				}, {
					data: ['150']
				}, {
					data: [1000],
					hidden: true
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scales: {}
			}
		});

		expect(chart.scales.r.min).toBe(-100);
		expect(chart.scales.r.max).toBe(150);
	});

	it('Should correctly determine the max & min data values when there is NaN data', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [50, 60, NaN, 70, null, undefined, Infinity, -Infinity]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6', 'label7', 'label8']
			},
			options: {
				scales: {}
			}
		});

		expect(chart.scales.r.min).toBe(50);
		expect(chart.scales.r.max).toBe(70);
	});

	it('Should ensure that the scale has a max and min that are not equal', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [],
				labels: []
			},
			options: {
				scales: {
					rScale: {}
				}
			}
		});

		var scale = chart.scales.rScale;

		expect(scale.min).toBe(-1);
		expect(scale.max).toBe(1);
	});

	it('Should use the suggestedMin and suggestedMax options', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [1, 1, 1, 2, 1, 0]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scale: {
					suggestedMin: -10,
					suggestedMax: 10
				}
			}
		});

		expect(chart.scales.r.min).toBe(-10);
		expect(chart.scales.r.max).toBe(10);
	});

	it('Should use the min and max options', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [1, 1, 1, 2, 1, 0]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5', 'label6']
			},
			options: {
				scale: {
					min: -1010,
					max: 1010
				}
			}
		});

		expect(chart.scales.r.min).toBe(-1010);
		expect(chart.scales.r.max).toBe(1010);
		expect(getLabels(chart.scales.r)).toEqual(['-1010', '-1000', '-500', '0', '500', '1000', '1010']);
	});

	it('should forcibly include 0 in the range if the beginAtZero option is used', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [20, 30, 40, 50]
				}],
				labels: ['label1', 'label2', 'label3', 'label4']
			},
			options: {
				scale: {
					beginAtZero: false
				}
			}
		});

		expect(getLabels(chart.scales.r)).toEqual(['20', '25', '30', '35', '40', '45', '50']);

		chart.scales.r.options.beginAtZero = true;
		chart.update();

		expect(getLabels(chart.scales.r)).toEqual(['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50']);

		chart.data.datasets[0].data = [-20, -30, -40, -50];
		chart.update();

		expect(getLabels(chart.scales.r)).toEqual(['-50', '-45', '-40', '-35', '-30', '-25', '-20', '-15', '-10', '-5', '0']);

		chart.scales.r.options.beginAtZero = false;
		chart.update();

		expect(getLabels(chart.scales.r)).toEqual(['-50', '-45', '-40', '-35', '-30', '-25', '-20']);
	});

	it('Should generate tick marks in the correct order in reversed mode', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					reverse: true
				}
			}
		});

		expect(getLabels(chart.scales.r)).toEqual(['80', '70', '60', '50', '40', '30', '20', '10', '0']);
		expect(chart.scales.r.start).toBe(80);
		expect(chart.scales.r.end).toBe(0);
	});

	it('Should correctly limit the maximum number of ticks', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				labels: ['label1', 'label2', 'label3'],
				datasets: [{
					data: [0.5, 1.5, 2.5]
				}]
			},
			options: {
				scale: {
					pointLabels: {
						display: false
					}
				}
			}
		});

		expect(getLabels(chart.scales.r)).toEqual(['0.5', '1.0', '1.5', '2.0', '2.5']);

		chart.options.scales.r.ticks.maxTicksLimit = 11;
		chart.update();

		expect(getLabels(chart.scales.r)).toEqual(['0.5', '1.0', '1.5', '2.0', '2.5']);

		chart.options.scales.r.ticks.stepSize = 0.01;
		chart.update();

		expect(getLabels(chart.scales.r)).toEqual(['0.5', '1.0', '1.5', '2.0', '2.5']);

		chart.options.scales.r.min = 0.3;
		chart.options.scales.r.max = 2.8;
		chart.update();

		expect(getLabels(chart.scales.r)).toEqual(['0.3', '0.5', '1.0', '1.5', '2.0', '2.5', '2.8']);
	});

	it('Should build labels using the user supplied callback', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					ticks: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				}
			}
		});

		expect(getLabels(chart.scales.r)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
		expect(chart.scales.r.pointLabels).toEqual(['label1', 'label2', 'label3', 'label4', 'label5']);
	});

	it('Should build point labels using the user supplied callback', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					pointLabels: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				}
			}
		});

		expect(chart.scales.r.pointLabels).toEqual(['0', '1', '2', '3', '4']);
	});

	it('Should build point labels from falsy values', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78, 20]
				}],
				labels: [0, '', undefined, null, NaN, false]
			}
		});

		expect(chart.scales.r.pointLabels).toEqual([0, '', '', '', '', '']);
	});

	it('should correctly set the center point', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					pointLabels: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				}
			}
		});

		expect(chart.scales.r.drawingArea).toBe(227);
		expect(chart.scales.r.xCenter).toBe(256);
		expect(chart.scales.r.yCenter).toBe(284);
	});

	it('should correctly get the label for a given data index', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					pointLabels: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				}
			}
		});
		expect(chart.scales.r.getLabelForValue(5)).toBe(5);
	});

	it('should get the correct distance from the center point', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					pointLabels: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				}
			}
		});

		expect(chart.scales.r.getDistanceFromCenterForValue(chart.scales.r.min)).toBe(0);
		expect(chart.scales.r.getDistanceFromCenterForValue(chart.scales.r.max)).toBe(227);

		var position = chart.scales.r.getPointPositionForValue(1, 5);
		expect(position.x).toBeCloseToPixel(270);
		expect(position.y).toBeCloseToPixel(278);

		chart.scales.r.options.reverse = true;
		chart.update();

		expect(chart.scales.r.getDistanceFromCenterForValue(chart.scales.r.min)).toBe(227);
		expect(chart.scales.r.getDistanceFromCenterForValue(chart.scales.r.max)).toBe(0);
	});

	it('should correctly get angles for all points', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					pointLabels: {
						callback: function(value, index) {
							return index.toString();
						}
					}
				},
				startAngle: 15
			}
		});

		var radToNearestDegree = function(rad) {
			return Math.round((360 * rad) / (2 * Math.PI));
		};

		var slice = 72; // (360 / 5)

		for (var i = 0; i < 5; i++) {
			expect(radToNearestDegree(chart.scales.r.getIndexAngle(i))).toBe(15 + (slice * i));
		}

		chart.options.startAngle = 0;
		chart.update();

		for (var x = 0; x < 5; x++) {
			expect(radToNearestDegree(chart.scales.r.getIndexAngle(x))).toBe((slice * x));
		}
	});

	it('should correctly get the correct label alignment for all points', function() {
		var chart = window.acquireChart({
			type: 'radar',
			data: {
				datasets: [{
					data: [10, 5, 0, 25, 78]
				}],
				labels: ['label1', 'label2', 'label3', 'label4', 'label5']
			},
			options: {
				scale: {
					pointLabels: {
						callback: function(value, index) {
							return index.toString();
						}
					},
					ticks: {
						display: false
					}
				}
			}
		});

		var scale = chart.scales.r;

		[{
			startAngle: 30,
			textAlign: ['right', 'right', 'left', 'left', 'left'],
			y: [82, 366, 506, 319, 53]
		}, {
			startAngle: -30,
			textAlign: ['right', 'right', 'left', 'left', 'right'],
			y: [319, 506, 366, 82, 53]
		}, {
			startAngle: 750,
			textAlign: ['right', 'right', 'left', 'left', 'left'],
			y: [82, 366, 506, 319, 53]
		}].forEach(function(expected) {
			chart.options.startAngle = expected.startAngle;
			chart.update();

			scale.ctx = window.createMockContext();
			chart.draw();

			scale.ctx.getCalls().filter(function(x) {
				return x.name === 'setTextAlign';
			}).forEach(function(x, i) {
				expect(x.args[0]).toBe(expected.textAlign[i]);
			});

			scale.ctx.getCalls().filter(function(x) {
				return x.name === 'fillText';
			}).map(function(x, i) {
				expect(x.args[2]).toBeCloseToPixel(expected.y[i]);
			});
		});
	});
});
