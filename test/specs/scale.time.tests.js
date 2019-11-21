// Time scale tests
describe('Time scale tests', function() {
	function createScale(data, options, dimensions) {
		var width = (dimensions && dimensions.width) || 400;
		var height = (dimensions && dimensions.height) || 50;

		options = options || {};
		options.type = 'time';
		options.id = 'xScale0';

		var chart = window.acquireChart({
			type: 'line',
			data: data,
			options: {
				scales: {
					x: options
				}
			}
		}, {canvas: {width: width, height: height}});


		return chart.scales.x;
	}

	function getLabels(scale) {
		return scale.ticks.map(t => t.label);
	}

	beforeEach(function() {
		// Need a time matcher for getValueFromPixel
		jasmine.addMatchers({
			toBeCloseToTime: function() {
				return {
					compare: function(time, expected) {
						var result = false;
						var actual = moment(time);
						var diff = actual.diff(expected.value, expected.unit, true);
						result = Math.abs(diff) < (expected.threshold !== undefined ? expected.threshold : 0.01);

						return {
							pass: result
						};
					}
				};
			}
		});
	});

	it('should load moment.js as a dependency', function() {
		expect(window.moment).not.toBe(undefined);
	});

	it('should register the constructor with the scale service', function() {
		var Constructor = Chart.scaleService.getScaleConstructor('time');
		expect(Constructor).not.toBe(undefined);
		expect(typeof Constructor).toBe('function');
	});

	it('should have the correct default config', function() {
		var defaultConfig = Chart.scaleService.getScaleDefaults('time');
		expect(defaultConfig).toEqual({
			display: true,
			gridLines: {
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
			position: 'bottom',
			offset: false,
			reverse: false,
			beginAtZero: false,
			scaleLabel: Chart.defaults.scale.scaleLabel,
			bounds: 'data',
			distribution: 'linear',
			adapters: {},
			ticks: {
				minRotation: 0,
				maxRotation: 50,
				mirror: false,
				source: 'auto',
				padding: 0,
				display: true,
				callback: defaultConfig.ticks.callback, // make this nicer, then check explicitly below,
				autoSkip: false,
				autoSkipPadding: 0,
				labelOffset: 0,
				minor: {},
				major: {
					enabled: false
				},
			},
			time: {
				parser: false,
				unit: false,
				round: false,
				isoWeekday: false,
				minUnit: 'millisecond',
				displayFormats: {}
			}
		});

		// Is this actually a function
		expect(defaultConfig.ticks.callback).toEqual(jasmine.any(Function));
	});

	describe('when given inputs of different types', function() {
		// Helper to build date objects
		function newDateFromRef(days) {
			return moment('01/01/2015 12:00', 'DD/MM/YYYY HH:mm').add(days, 'd').toDate();
		}

		it('should accept labels as strings', function() {
			var mockData = {
				labels: ['2015-01-01T12:00:00', '2015-01-02T21:00:00', '2015-01-03T22:00:00', '2015-01-05T23:00:00', '2015-01-07T03:00', '2015-01-08T10:00', '2015-01-10T12:00'], // days
			};

			var scaleOptions = Chart.scaleService.getScaleDefaults('time');
			var scale = createScale(mockData, scaleOptions, {width: 1000, height: 200});
			var ticks = getLabels(scale);

			// `bounds === 'data'`: first and last ticks removed since outside the data range
			expect(ticks.length).toEqual(44);
		});

		it('should accept labels as date objects', function() {
			var mockData = {
				labels: [newDateFromRef(0), newDateFromRef(1), newDateFromRef(2), newDateFromRef(4), newDateFromRef(6), newDateFromRef(7), newDateFromRef(9)], // days
			};
			var scale = createScale(mockData, Chart.scaleService.getScaleDefaults('time'), {width: 1000, height: 200});
			var ticks = getLabels(scale);

			// `bounds === 'data'`: first and last ticks removed since outside the data range
			expect(ticks.length).toEqual(44);
		});

		it('should accept data as xy points', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						xAxisID: 'x',
						data: [{
							x: newDateFromRef(0),
							y: 1
						}, {
							x: newDateFromRef(1),
							y: 10
						}, {
							x: newDateFromRef(2),
							y: 0
						}, {
							x: newDateFromRef(4),
							y: 5
						}, {
							x: newDateFromRef(6),
							y: 77
						}, {
							x: newDateFromRef(7),
							y: 9
						}, {
							x: newDateFromRef(9),
							y: 5
						}]
					}],
				},
				options: {
					scales: {
						x: {
							type: 'time',
							position: 'bottom'
						},
					}
				}
			}, {canvas: {width: 800, height: 200}});

			var xScale = chart.scales.x;
			var ticks = getLabels(xScale);

			// `bounds === 'data'`: first and last ticks removed since outside the data range
			expect(ticks.length).toEqual(37);
		});

		it('should accept data as ty points', function() {
			var chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						xAxisID: 'x',
						data: [{
							t: newDateFromRef(0),
							y: 1
						}, {
							t: newDateFromRef(1),
							y: 10
						}, {
							t: newDateFromRef(2),
							y: 0
						}, {
							t: newDateFromRef(4),
							y: 5
						}, {
							t: newDateFromRef(6),
							y: 77
						}, {
							t: newDateFromRef(7),
							y: 9
						}, {
							t: newDateFromRef(9),
							y: 5
						}]
					}],
				},
				options: {
					scales: {
						x: {
							type: 'time',
							position: 'bottom'
						},
					}
				}
			}, {canvas: {width: 800, height: 200}});

			var tScale = chart.scales.x;
			var ticks = getLabels(tScale);

			// `bounds === 'data'`: first and last ticks removed since outside the data range
			expect(ticks.length).toEqual(37);
		});
	});

	it('should allow custom time parsers', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				labels: ['foo', 'bar'],
				datasets: [{
					xAxisID: 'x',
					data: [0, 1]
				}],
			},
			options: {
				scales: {
					x: {
						type: 'time',
						position: 'bottom',
						time: {
							unit: 'day',
							round: true,
							parser: function(label) {
								return label === 'foo' ?
									moment('2000/01/02', 'YYYY/MM/DD') :
									moment('2016/05/08', 'YYYY/MM/DD');
							}
						},
						ticks: {
							source: 'labels'
						}
					},
				}
			}
		});

		// Counts down because the lines are drawn top to bottom
		var labels = getLabels(chart.scales.x);

		// Counts down because the lines are drawn top to bottom
		expect(labels[0]).toBe('Jan 2');
		expect(labels[1]).toBe('May 8');
	});

	it('should build ticks using the config unit', function() {
		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00'], // days
		};

		var config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
		config.time.unit = 'hour';

		var scale = createScale(mockData, config, {width: 2500, height: 200});
		var ticks = getLabels(scale);

		expect(ticks).toEqual(['8PM', '9PM', '10PM', '11PM', '12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM']);
	});

	it('should build ticks honoring the minUnit', function() {
		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00'], // days
		};

		var config = Chart.helpers.mergeIf({
			bounds: 'ticks',
			time: {
				minUnit: 'day'
			}
		}, Chart.scaleService.getScaleDefaults('time'));

		var scale = createScale(mockData, config);
		var ticks = getLabels(scale);

		expect(ticks).toEqual(['Jan 1', 'Jan 2', 'Jan 3']);
	});

	it('should correctly determine the unit', function() {
		var date = moment('Jan 01 1990', 'MMM DD YYYY');
		var data = [];
		for (var i = 0; i < 60; i++) {
			data.push({x: date.valueOf(), y: Math.random()});
			date = date.clone().add(1, 'month');
		}

		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					data: data
				}],
			},
			options: {
				scales: {
					x: {
						type: 'time',
						ticks: {
							source: 'data',
							autoSkip: true
						}
					},
				}
			}
		});

		var scale = chart.scales.x;

		expect(scale._unit).toEqual('month');
	});

	it('should build ticks based on the appropriate label capacity', function() {
		var mockData = {
			labels: [
				'2012-01-01', '2013-01-01', '2014-01-01', '2015-01-01',
				'2016-01-01', '2017-01-01', '2018-01-01', '2019-01-01'
			]
		};

		var config = Chart.helpers.mergeIf({
			time: {
				unit: 'year'
			}
		}, Chart.scaleService.getScaleDefaults('time'));

		var scale = createScale(mockData, config);
		var ticks = getLabels(scale);

		expect(ticks).toEqual(['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']);
	});

	it('should build ticks using the config diff', function() {
		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-02-02T21:00:00', '2015-02-21T01:00:00'], // days
		};

		var config = Chart.helpers.mergeIf({
			bounds: 'ticks',
			time: {
				unit: 'week',
				round: 'week'
			}
		}, Chart.scaleService.getScaleDefaults('time'));

		var scale = createScale(mockData, config, {width: 800, height: 200});
		var ticks = getLabels(scale);

		// last date is feb 15 because we round to start of week
		expect(ticks).toEqual(['Dec 28, 2014', 'Jan 4, 2015', 'Jan 11, 2015', 'Jan 18, 2015', 'Jan 25, 2015', 'Feb 1, 2015', 'Feb 8, 2015', 'Feb 15, 2015']);
	});

	describe('config step size', function() {
		it('should use the stepSize property', function() {
			var mockData = {
				labels: ['2015-01-01T20:00:00', '2015-01-01T21:00:00'],
			};

			var config = Chart.helpers.mergeIf({
				bounds: 'ticks',
				time: {
					unit: 'hour',
					stepSize: 2
				}
			}, Chart.scaleService.getScaleDefaults('time'));

			var scale = createScale(mockData, config, {width: 2500, height: 200});
			var ticks = getLabels(scale);

			expect(ticks).toEqual(['8PM', '10PM']);
		});
	});

	describe('when specifying limits', function() {
		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-01-02T20:00:00', '2015-01-03T20:00:00'],
		};

		var config;
		beforeEach(function() {
			config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
			config.ticks.source = 'labels';
			config.time.unit = 'day';
		});

		it('should use the min option when less than first label for building ticks', function() {
			config.min = '2014-12-29T04:00:00';

			var labels = getLabels(createScale(mockData, config));
			expect(labels[0]).toEqual('Jan 1');
		});

		it('should use the min option when greater than first label for building ticks', function() {
			config.min = '2015-01-02T04:00:00';

			var labels = getLabels(createScale(mockData, config));
			expect(labels[0]).toEqual('Jan 2');
		});

		it('should use the max option when greater than last label for building ticks', function() {
			config.max = '2015-01-05T06:00:00';

			var labels = getLabels(createScale(mockData, config));
			expect(labels[labels.length - 1]).toEqual('Jan 3');
		});

		it('should use the max option when less than last label for building ticks', function() {
			config.max = '2015-01-02T23:00:00';

			var labels = getLabels(createScale(mockData, config));
			expect(labels[labels.length - 1]).toEqual('Jan 2');
		});
	});

	describe('when specifying limits in a deprecated fashion', function() {
		var mockData = {
			labels: ['2015-01-01T20:00:00', '2015-01-02T20:00:00', '2015-01-03T20:00:00'],
		};

		var config;
		beforeEach(function() {
			config = Chart.helpers.clone(Chart.scaleService.getScaleDefaults('time'));
			config.ticks.source = 'labels';
			config.time.unit = 'day';
		});

		it('should use the min option when less than first label for building ticks', function() {
			config.min = '2014-12-29T04:00:00';

			var labels = getLabels(createScale(mockData, config));
			expect(labels[0]).toEqual('Jan 1');
		});

		it('should use the min option when greater than first label for building ticks', function() {
			config.min = '2015-01-02T04:00:00';

			var labels = getLabels(createScale(mockData, config));
			expect(labels[0]).toEqual('Jan 2');
		});

		it('should use the max option when greater than last label for building ticks', function() {
			config.max = '2015-01-05T06:00:00';

			var labels = getLabels(createScale(mockData, config));
			expect(labels[labels.length - 1]).toEqual('Jan 3');
		});

		it('should use the max option when less than last label for building ticks', function() {
			config.max = '2015-01-02T23:00:00';

			var labels = getLabels(createScale(mockData, config));
			expect(labels[labels.length - 1]).toEqual('Jan 2');
		});
	});

	it('should use the isoWeekday option', function() {
		var mockData = {
			labels: [
				'2015-01-01T20:00:00', // Thursday
				'2015-01-02T20:00:00', // Friday
				'2015-01-03T20:00:00' // Saturday
			]
		};

		var config = Chart.helpers.mergeIf({
			bounds: 'ticks',
			time: {
				unit: 'week',
				isoWeekday: 3 // Wednesday
			}
		}, Chart.scaleService.getScaleDefaults('time'));

		var scale = createScale(mockData, config);
		var ticks = getLabels(scale);

		expect(ticks).toEqual(['Dec 31, 2014', 'Jan 7, 2015']);
	});

	describe('when rendering several days', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						xAxisID: 'x',
						data: []
					}],
					labels: [
						'2015-01-01T20:00:00',
						'2015-01-02T21:00:00',
						'2015-01-03T22:00:00',
						'2015-01-05T23:00:00',
						'2015-01-07T03:00',
						'2015-01-08T10:00',
						'2015-01-10T12:00'
					]
				},
				options: {
					scales: {
						x: {
							type: 'time',
							position: 'bottom'
						},
					}
				}
			});

			this.scale = this.chart.scales.x;
		});

		it('should be bounded by the nearest week beginnings', function() {
			var chart = this.chart;
			var scale = this.scale;
			expect(scale.getValueForPixel(scale.left)).toBeGreaterThan(moment(chart.data.labels[0]).startOf('week'));
			expect(scale.getValueForPixel(scale.right)).toBeLessThan(moment(chart.data.labels[chart.data.labels.length - 1]).add(1, 'week').endOf('week'));
		});

		it('should convert between screen coordinates and times', function() {
			var chart = this.chart;
			var scale = this.scale;
			var timeRange = moment(scale.max).valueOf() - moment(scale.min).valueOf();
			var msPerPix = timeRange / scale.width;
			var firstPointOffsetMs = moment(chart.config.data.labels[0]).valueOf() - scale.min;
			var firstPointPixel = scale.left + firstPointOffsetMs / msPerPix;
			var lastPointOffsetMs = moment(chart.config.data.labels[chart.config.data.labels.length - 1]).valueOf() - scale.min;
			var lastPointPixel = scale.left + lastPointOffsetMs / msPerPix;

			expect(scale.getPixelForValue(moment('2015-01-01T20:00:00').valueOf())).toBeCloseToPixel(firstPointPixel);
			expect(scale.getPixelForValue(moment(chart.data.labels[0]).valueOf())).toBeCloseToPixel(firstPointPixel);
			expect(scale.getValueForPixel(firstPointPixel)).toBeCloseToTime({
				value: moment(chart.data.labels[0]),
				unit: 'hour',
			});

			expect(scale.getPixelForValue(moment('2015-01-10T12:00').valueOf())).toBeCloseToPixel(lastPointPixel);
			expect(scale.getValueForPixel(lastPointPixel)).toBeCloseToTime({
				value: moment(chart.data.labels[6]),
				unit: 'hour'
			});
		});
	});

	describe('when rendering several years', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
				type: 'line',
				data: {
					labels: ['2005-07-04', '2017-01-20'],
				},
				options: {
					scales: {
						x: {
							type: 'time',
							bounds: 'ticks',
							position: 'bottom'
						},
					}
				}
			}, {canvas: {width: 800, height: 200}});

			this.scale = this.chart.scales.x;
		});

		it('should be bounded by nearest step\'s year start and end', function() {
			var scale = this.scale;
			var ticks = scale.getTicks();
			var step = ticks[1].value - ticks[0].value;
			var stepsAmount = Math.floor((scale.max - scale.min) / step);

			expect(scale.getValueForPixel(scale.left)).toBeCloseToTime({
				value: moment(scale.min).startOf('year'),
				unit: 'hour',
			});
			expect(scale.getValueForPixel(scale.right)).toBeCloseToTime({
				value: moment(scale.min + step * stepsAmount).endOf('year'),
				unit: 'hour',
			});
		});

		it('should build the correct ticks', function() {
			expect(getLabels(this.scale)).toEqual(['2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018']);
		});

		it('should have ticks with accurate labels', function() {
			var scale = this.scale;
			var ticks = scale.getTicks();
			// pixelsPerTick is an aproximation which assumes same number of milliseconds per year (not true)
			// we use a threshold of 1 day so that we still match these values
			var pixelsPerTick = scale.width / (ticks.length - 1);

			for (var i = 0; i < ticks.length - 1; i++) {
				var offset = pixelsPerTick * i;
				expect(scale.getValueForPixel(scale.left + offset)).toBeCloseToTime({
					value: moment(ticks[i].label + '-01-01'),
					unit: 'day',
					threshold: 1,
				});
			}
		});
	});

	it('should get the correct label for a data value', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					data: [null, 10, 3]
				}],
				labels: ['2015-01-01T20:00:00', '2015-01-02T21:00:00', '2015-01-03T22:00:00', '2015-01-05T23:00:00', '2015-01-07T03:00', '2015-01-08T10:00', '2015-01-10T12:00'], // days
			},
			options: {
				scales: {
					x: {
						type: 'time',
						position: 'bottom',
						ticks: {
							source: 'labels',
							autoSkip: false
						}
					}
				}
			}
		});

		var xScale = chart.scales.x;
		var controller = chart.getDatasetMeta(0).controller;
		expect(xScale.getLabelForValue(controller._getParsed(0)[xScale.id])).toBeTruthy();
		expect(xScale.getLabelForValue(controller._getParsed(0)[xScale.id])).toBe('Jan 1, 2015, 8:00:00 pm');
		expect(xScale.getLabelForValue(xScale.getValueForPixel(xScale.getPixelForTick(6)))).toBe('Jan 10, 2015, 12:00:00 pm');
	});

	describe('when ticks.callback is specified', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						xAxisID: 'x',
						data: [0, 0]
					}],
					labels: ['2015-01-01T20:00:00', '2015-01-01T20:01:00']
				},
				options: {
					scales: {
						x: {
							type: 'time',
							time: {
								displayFormats: {
									second: 'h:mm:ss'
								}
							},
							ticks: {
								callback: function(value) {
									return '<' + value + '>';
								}
							}
						}
					}
				}
			});
			this.scale = this.chart.scales.x;
		});

		it('should get the correct labels for ticks', function() {
			var labels = getLabels(this.scale);

			expect(labels.length).toEqual(21);
			expect(labels[0]).toEqual('<8:00:00>');
			expect(labels[labels.length - 1]).toEqual('<8:01:00>');
		});

		it('should update ticks.callback correctly', function() {
			var chart = this.chart;
			chart.options.scales.x.ticks.callback = function(value) {
				return '{' + value + '}';
			};
			chart.update();

			var labels = getLabels(this.scale);
			expect(labels.length).toEqual(21);
			expect(labels[0]).toEqual('{8:00:00}');
			expect(labels[labels.length - 1]).toEqual('{8:01:00}');
		});
	});

	describe('when ticks.major.callback and ticks.minor.callback are specified', function() {
		beforeEach(function() {
			this.chart = window.acquireChart({
				type: 'line',
				data: {
					datasets: [{
						xAxisID: 'x',
						data: [0, 0]
					}],
					labels: ['2015-01-01T20:00:00', '2015-01-01T20:01:00']
				},
				options: {
					scales: {
						x: {
							type: 'time',
							ticks: {
								callback: function(value) {
									return '<' + value + '>';
								},
								major: {
									enabled: true,
									callback: function(value) {
										return '[[' + value + ']]';
									}
								},
								minor: {
									callback: function(value) {
										return '(' + value + ')';
									}
								}
							}
						}
					}
				}
			});
			this.scale = this.chart.scales.x;
		});

		it('should get the correct labels for major and minor ticks', function() {
			var labels = getLabels(this.scale);

			expect(labels.length).toEqual(21);
			expect(labels[0]).toEqual('[[8:00 pm]]');
			expect(labels[Math.floor(labels.length / 2)]).toEqual('(8:00:30 pm)');
			expect(labels[labels.length - 1]).toEqual('[[8:01 pm]]');
		});

		it('should only use ticks.minor callback if ticks.major.enabled is false', function() {
			var chart = this.chart;
			chart.options.scales.x.ticks.major.enabled = false;
			chart.update();

			var labels = getLabels(this.scale);
			expect(labels.length).toEqual(21);
			expect(labels[0]).toEqual('(8:00:00 pm)');
			expect(labels[labels.length - 1]).toEqual('(8:01:00 pm)');
		});

		it('should use ticks.callback if ticks.major.callback is omitted', function() {
			var chart = this.chart;
			chart.options.scales.x.ticks.major.callback = undefined;
			chart.update();

			var labels = getLabels(this.scale);
			expect(labels.length).toEqual(21);
			expect(labels[0]).toEqual('<8:00 pm>');
			expect(labels[labels.length - 1]).toEqual('<8:01 pm>');
		});

		it('should use ticks.callback if ticks.minor.callback is omitted', function() {
			var chart = this.chart;
			chart.options.scales.x.ticks.minor.callback = undefined;
			chart.update();

			var labels = getLabels(this.scale);
			expect(labels.length).toEqual(21);
			expect(labels[0]).toEqual('[[8:00 pm]]');
			expect(labels[Math.floor(labels.length / 2)]).toEqual('<8:00:30 pm>');
			expect(labels[labels.length - 1]).toEqual('[[8:01 pm]]');
		});
	});

	it('should get the correct label when time is specified as a string', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					data: [{t: '2015-01-01T20:00:00', y: 10}, {t: '2015-01-02T21:00:00', y: 3}]
				}],
			},
			options: {
				scales: {
					x: {
						type: 'time',
						position: 'bottom'
					},
				}
			}
		});

		var xScale = chart.scales.x;
		var controller = chart.getDatasetMeta(0).controller;
		var value = controller._getParsed(0)[xScale.id];
		expect(xScale.getLabelForValue(value)).toBeTruthy();
		expect(xScale.getLabelForValue(value)).toBe('Jan 1, 2015, 8:00:00 pm');
	});

	it('should get the correct label for a timestamp', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					data: [
						{t: +new Date('2018-01-08 05:14:23.234'), y: 10},
						{t: +new Date('2018-01-09 06:17:43.426'), y: 3}
					]
				}],
			},
			options: {
				scales: {
					x: {
						type: 'time',
						position: 'bottom'
					},
				}
			}
		});

		var xScale = chart.scales.x;
		var controller = chart.getDatasetMeta(0).controller;
		var label = xScale.getLabelForValue(controller._getParsed(0)[xScale.id]);
		expect(label).toEqual('Jan 8, 2018, 5:14:23 am');
	});

	it('should get the correct pixel for only one data in the dataset', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				labels: ['2016-05-27'],
				datasets: [{
					xAxisID: 'x',
					data: [5]
				}]
			},
			options: {
				scales: {
					x: {
						display: true,
						type: 'time'
					}
				}
			}
		});

		var xScale = chart.scales.x;
		var pixel = xScale.getPixelForValue(moment('2016-05-27').valueOf());

		expect(xScale.getValueForPixel(pixel)).toEqual(moment(chart.data.labels[0]).valueOf());
	});

	it('does not create a negative width chart when hidden', function() {
		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					data: []
				}]
			},
			options: {
				scales: {
					x: {
						type: 'time',
						ticks: {
							min: moment().subtract(1, 'months'),
							max: moment(),
						}
					},
				},
				responsive: true,
			},
		}, {
			wrapper: {
				style: 'display: none',
			},
		});
		expect(chart.scales.y.width).toEqual(0);
		expect(chart.scales.y.maxWidth).toEqual(0);
		expect(chart.width).toEqual(0);
	});

	describe('when ticks.source', function() {
		describe('is "labels"', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
					type: 'line',
					data: {
						labels: ['2017', '2019', '2020', '2025', '2042'],
						datasets: [{data: [0, 1, 2, 3, 4, 5]}]
					},
					options: {
						scales: {
							x: {
								type: 'time',
								time: {
									parser: 'YYYY'
								},
								ticks: {
									source: 'labels'
								}
							}
						}
					}
				});
			});

			it ('should generate ticks from "data.labels"', function() {
				var scale = this.chart.scales.x;

				expect(scale.min).toEqual(+moment('2017', 'YYYY'));
				expect(scale.max).toEqual(+moment('2042', 'YYYY'));
				expect(getLabels(scale)).toEqual([
					'2017', '2019', '2020', '2025', '2042']);
			});
			it ('should not add ticks for min and max if they extend the labels range', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.min = '2012';
				options.max = '2051';
				chart.update();

				expect(scale.min).toEqual(+moment('2012', 'YYYY'));
				expect(scale.max).toEqual(+moment('2051', 'YYYY'));
				expect(getLabels(scale)).toEqual([
					'2017', '2019', '2020', '2025', '2042']);
			});
			it ('should not duplicate ticks if min and max are the labels limits', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.min = '2017';
				options.max = '2042';
				chart.update();

				expect(scale.min).toEqual(+moment('2017', 'YYYY'));
				expect(scale.max).toEqual(+moment('2042', 'YYYY'));
				expect(getLabels(scale)).toEqual([
					'2017', '2019', '2020', '2025', '2042']);
			});
			it ('should correctly handle empty `data.labels` using "day" if `time.unit` is undefined`', function() {
				var chart = this.chart;
				var scale = chart.scales.x;

				chart.data.labels = [];
				chart.update();

				expect(scale.min).toEqual(+moment().startOf('day'));
				expect(scale.max).toEqual(+moment().endOf('day') + 1);
				expect(getLabels(scale)).toEqual([]);
			});
			it ('should correctly handle empty `data.labels` using `time.unit`', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.time.unit = 'year';
				chart.data.labels = [];
				chart.update();

				expect(scale.min).toEqual(+moment().startOf('year'));
				expect(scale.max).toEqual(+moment().endOf('year') + 1);
				expect(getLabels(scale)).toEqual([]);
			});
		});

		describe('is "data"', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
					type: 'line',
					data: {
						labels: ['2017', '2019', '2020', '2025', '2042'],
						datasets: [
							{data: [0, 1, 2, 3, 4, 5]},
							{data: [
								{t: '2018', y: 6},
								{t: '2020', y: 7},
								{t: '2043', y: 8}
							]}
						]
					},
					options: {
						scales: {
							x: {
								type: 'time',
								time: {
									parser: 'YYYY'
								},
								ticks: {
									source: 'data'
								}
							}
						}
					}
				});
			});

			it ('should generate ticks from "datasets.data"', function() {
				var scale = this.chart.scales.x;

				expect(scale.min).toEqual(+moment('2017', 'YYYY'));
				expect(scale.max).toEqual(+moment('2043', 'YYYY'));
				expect(getLabels(scale)).toEqual([
					'2017', '2018', '2019', '2020', '2025', '2042', '2043']);
			});
			it ('should not add ticks for min and max if they extend the labels range', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.min = '2012';
				options.max = '2051';
				chart.update();

				expect(scale.min).toEqual(+moment('2012', 'YYYY'));
				expect(scale.max).toEqual(+moment('2051', 'YYYY'));
				expect(getLabels(scale)).toEqual([
					'2017', '2018', '2019', '2020', '2025', '2042', '2043']);
			});
			it ('should not duplicate ticks if min and max are the labels limits', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.min = '2017';
				options.max = '2043';
				chart.update();

				expect(scale.min).toEqual(+moment('2017', 'YYYY'));
				expect(scale.max).toEqual(+moment('2043', 'YYYY'));
				expect(getLabels(scale)).toEqual([
					'2017', '2018', '2019', '2020', '2025', '2042', '2043']);
			});
			it ('should correctly handle empty `data.labels` using "day" if `time.unit` is undefined`', function() {
				var chart = this.chart;
				var scale = chart.scales.x;

				chart.data.labels = [];
				chart.update();

				expect(scale.min).toEqual(+moment('2018', 'YYYY'));
				expect(scale.max).toEqual(+moment('2043', 'YYYY'));
				expect(getLabels(scale)).toEqual([
					'2018', '2020', '2043']);
			});
			it ('should correctly handle empty `data.labels` and hidden datasets using `time.unit`', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.time.unit = 'year';
				chart.data.labels = [];
				var meta = chart.getDatasetMeta(1);
				meta.hidden = true;
				chart.update();

				expect(scale.min).toEqual(+moment().startOf('year'));
				expect(scale.max).toEqual(+moment().endOf('year') + 1);
				expect(getLabels(scale)).toEqual([]);
			});
		});
	});

	describe('when distribution', function() {
		describe('is "series"', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
					type: 'line',
					data: {
						labels: ['2017', '2019', '2020', '2025', '2042'],
						datasets: [{data: [0, 1, 2, 3, 4, 5]}]
					},
					options: {
						scales: {
							x: {
								type: 'time',
								time: {
									parser: 'YYYY'
								},
								distribution: 'series',
								ticks: {
									source: 'labels'
								}
							},
							y: {
								display: false
							}
						}
					}
				});
			});

			it ('should space data out with the same gap, whatever their time values', function() {
				var scale = this.chart.scales.x;
				var start = scale.left;
				var slice = scale.width / 4;

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start);
				expect(scale.getPixelForValue(moment('2019').valueOf())).toBeCloseToPixel(start + slice);
				expect(scale.getPixelForValue(moment('2020').valueOf())).toBeCloseToPixel(start + slice * 2);
				expect(scale.getPixelForValue(moment('2025').valueOf())).toBeCloseToPixel(start + slice * 3);
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start + slice * 4);
			});
			it ('should add a step before if scale.min is before the first data', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.min = '2012';
				chart.update();

				var start = scale.left;
				var slice = scale.width / 5;

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start + slice);
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start + slice * 5);
			});
			it ('should add a step after if scale.max is after the last data', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.max = '2050';
				chart.update();

				var start = scale.left;
				var slice = scale.width / 5;

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start);
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start + slice * 4);
			});
			it ('should add steps before and after if scale.min/max are outside the data range', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.min = '2012';
				options.max = '2050';
				chart.update();

				var start = scale.left;
				var slice = scale.width / 6;

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start + slice);
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start + slice * 5);
			});
		});
		describe('is "linear"', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
					type: 'line',
					data: {
						labels: ['2017', '2019', '2020', '2025', '2042'],
						datasets: [{data: [0, 1, 2, 3, 4, 5]}]
					},
					options: {
						scales: {
							x: {
								type: 'time',
								time: {
									parser: 'YYYY'
								},
								distribution: 'linear',
								ticks: {
									source: 'labels'
								}
							},
							y: {
								display: false
							}
						}
					}
				});
			});

			it ('should space data out with a gap relative to their time values', function() {
				var scale = this.chart.scales.x;
				var start = scale.left;
				var slice = scale.width / (2042 - 2017);

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start);
				expect(scale.getPixelForValue(moment('2019').valueOf())).toBeCloseToPixel(start + slice * (2019 - 2017));
				expect(scale.getPixelForValue(moment('2020').valueOf())).toBeCloseToPixel(start + slice * (2020 - 2017));
				expect(scale.getPixelForValue(moment('2025').valueOf())).toBeCloseToPixel(start + slice * (2025 - 2017));
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start + slice * (2042 - 2017));
			});
			it ('should take in account scale min and max if outside the ticks range', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.min = '2012';
				options.max = '2050';
				chart.update();

				var start = scale.left;
				var slice = scale.width / (2050 - 2012);

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start + slice * (2017 - 2012));
				expect(scale.getPixelForValue(moment('2019').valueOf())).toBeCloseToPixel(start + slice * (2019 - 2012));
				expect(scale.getPixelForValue(moment('2020').valueOf())).toBeCloseToPixel(start + slice * (2020 - 2012));
				expect(scale.getPixelForValue(moment('2025').valueOf())).toBeCloseToPixel(start + slice * (2025 - 2012));
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start + slice * (2042 - 2012));
			});
		});
	});

	describe('when bounds', function() {
		describe('is "data"', function() {
			it ('should preserve the data range', function() {
				var chart = window.acquireChart({
					type: 'line',
					data: {
						labels: ['02/20 08:00', '02/21 09:00', '02/22 10:00', '02/23 11:00'],
						datasets: [{data: [0, 1, 2, 3, 4, 5]}]
					},
					options: {
						scales: {
							x: {
								type: 'time',
								bounds: 'data',
								time: {
									parser: 'MM/DD HH:mm',
									unit: 'day'
								}
							},
							y: {
								display: false
							}
						}
					}
				});

				var scale = chart.scales.x;

				expect(scale.min).toEqual(+moment('02/20 08:00', 'MM/DD HH:mm'));
				expect(scale.max).toEqual(+moment('02/23 11:00', 'MM/DD HH:mm'));
				expect(scale.getPixelForValue(moment('02/20 08:00', 'MM/DD HH:mm').valueOf())).toBeCloseToPixel(scale.left);
				expect(scale.getPixelForValue(moment('02/23 11:00', 'MM/DD HH:mm').valueOf())).toBeCloseToPixel(scale.left + scale.width);
				expect(getLabels(scale)).toEqual([
					'Feb 21', 'Feb 22', 'Feb 23']);
			});
		});

		describe('is "labels"', function() {
			it('should preserve the label range', function() {
				var chart = window.acquireChart({
					type: 'line',
					data: {
						labels: ['02/20 08:00', '02/21 09:00', '02/22 10:00', '02/23 11:00'],
						datasets: [{data: [0, 1, 2, 3, 4, 5]}]
					},
					options: {
						scales: {
							x: {
								type: 'time',
								bounds: 'ticks',
								time: {
									parser: 'MM/DD HH:mm',
									unit: 'day'
								}
							},
							y: {
								display: false
							}
						}
					}
				});

				var scale = chart.scales.x;
				var ticks = scale.getTicks();

				expect(scale.min).toEqual(ticks[0].value);
				expect(scale.max).toEqual(ticks[ticks.length - 1].value);
				expect(scale.getPixelForValue(moment('02/20 08:00', 'MM/DD HH:mm').valueOf())).toBeCloseToPixel(60);
				expect(scale.getPixelForValue(moment('02/23 11:00', 'MM/DD HH:mm').valueOf())).toBeCloseToPixel(426);
				expect(getLabels(scale)).toEqual([
					'Feb 20', 'Feb 21', 'Feb 22', 'Feb 23', 'Feb 24']);
			});
		});
	});

	describe('when min and/or max are defined', function() {
		['auto', 'data', 'labels'].forEach(function(source) {
			['data', 'ticks'].forEach(function(bounds) {
				describe('and ticks.source is "' + source + '" and bounds "' + bounds + '"', function() {
					beforeEach(function() {
						this.chart = window.acquireChart({
							type: 'line',
							data: {
								labels: ['02/20 08:00', '02/21 09:00', '02/22 10:00', '02/23 11:00'],
								datasets: [{data: [0, 1, 2, 3, 4, 5]}]
							},
							options: {
								scales: {
									x: {
										type: 'time',
										bounds: bounds,
										time: {
											parser: 'MM/DD HH:mm',
											unit: 'day'
										},
										ticks: {
											source: source
										}
									},
									y: {
										display: false
									}
								}
							}
						});
					});

					it ('should expand scale to the min/max range', function() {
						var chart = this.chart;
						var scale = chart.scales.x;
						var options = chart.options.scales.x;
						var min = '02/19 07:00';
						var max = '02/24 08:00';
						var minMillis = +moment(min, 'MM/DD HH:mm');
						var maxMillis = +moment(max, 'MM/DD HH:mm');

						options.min = min;
						options.max = max;
						chart.update();

						expect(scale.min).toEqual(minMillis);
						expect(scale.max).toEqual(maxMillis);
						expect(scale.getPixelForValue(minMillis)).toBeCloseToPixel(scale.left);
						expect(scale.getPixelForValue(maxMillis)).toBeCloseToPixel(scale.left + scale.width);
						scale.getTicks().forEach(function(tick) {
							expect(tick.value >= minMillis).toBeTruthy();
							expect(tick.value <= maxMillis).toBeTruthy();
						});
					});
					it ('should shrink scale to the min/max range', function() {
						var chart = this.chart;
						var scale = chart.scales.x;
						var options = chart.options.scales.x;
						var min = '02/21 07:00';
						var max = '02/22 20:00';
						var minMillis = +moment(min, 'MM/DD HH:mm');
						var maxMillis = +moment(max, 'MM/DD HH:mm');

						options.min = min;
						options.max = max;
						chart.update();

						expect(scale.min).toEqual(minMillis);
						expect(scale.max).toEqual(maxMillis);
						expect(scale.getPixelForValue(minMillis)).toBeCloseToPixel(scale.left);
						expect(scale.getPixelForValue(maxMillis)).toBeCloseToPixel(scale.left + scale.width);
						scale.getTicks().forEach(function(tick) {
							expect(tick.value >= minMillis).toBeTruthy();
							expect(tick.value <= maxMillis).toBeTruthy();
						});
					});
				});
			});
		});
	});

	['auto', 'data', 'labels'].forEach(function(source) {
		['series', 'linear'].forEach(function(distribution) {
			describe('when ticks.source is "' + source + '" and distribution is "' + distribution + '"', function() {
				beforeEach(function() {
					this.chart = window.acquireChart({
						type: 'line',
						data: {
							labels: ['2017', '2019', '2020', '2025', '2042'],
							datasets: [{data: [0, 1, 2, 3, 4, 5]}]
						},
						options: {
							scales: {
								x: {
									type: 'time',
									time: {
										parser: 'YYYY'
									},
									ticks: {
										source: source
									},
									distribution: distribution
								}
							}
						}
					});
				});

				it ('should not add offset from the edges', function() {
					var scale = this.chart.scales.x;

					expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(scale.left);
					expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(scale.left + scale.width);
				});

				it ('should add offset from the edges if offset is true', function() {
					var chart = this.chart;
					var scale = chart.scales.x;
					var options = chart.options.scales.x;

					options.offset = true;
					chart.update();

					var numTicks = scale.ticks.length;
					var firstTickInterval = scale.getPixelForTick(1) - scale.getPixelForTick(0);
					var lastTickInterval = scale.getPixelForTick(numTicks - 1) - scale.getPixelForTick(numTicks - 2);

					expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(scale.left + firstTickInterval / 2);
					expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(scale.left + scale.width - lastTickInterval / 2);
				});

				it ('should not add offset if min and max extend the labels range', function() {
					var chart = this.chart;
					var scale = chart.scales.x;
					var options = chart.options.scales.x;

					options.min = '2012';
					options.max = '2051';
					chart.update();

					expect(scale.getPixelForValue(moment('2012').valueOf())).toBeCloseToPixel(scale.left);
					expect(scale.getPixelForValue(moment('2051').valueOf())).toBeCloseToPixel(scale.left + scale.width);
				});
			});
		});
	});

	['data', 'labels'].forEach(function(source) {
		['series', 'linear'].forEach(function(distribution) {
			describe('when ticks.source is "' + source + '" and distribution is "' + distribution + '"', function() {
				beforeEach(function() {
					this.chart = window.acquireChart({
						type: 'line',
						data: {
							labels: ['2017', '2019', '2020', '2025', '2042'],
							datasets: [{data: [0, 1, 2, 3, 4, 5]}]
						},
						options: {
							scales: {
								x: {
									id: 'x',
									type: 'time',
									time: {
										parser: 'YYYY'
									},
									ticks: {
										source: source
									},
									distribution: distribution
								}
							}
						}
					});
				});

				it ('should add offset if min and max extend the labels range and offset is true', function() {
					var chart = this.chart;
					var scale = chart.scales.x;
					var options = chart.options.scales.x;

					options.min = '2012';
					options.max = '2051';
					options.offset = true;
					chart.update();

					var numTicks = scale.ticks.length;
					var firstTickInterval = scale.getPixelForTick(1) - scale.getPixelForTick(0);
					var lastTickInterval = scale.getPixelForTick(numTicks - 1) - scale.getPixelForTick(numTicks - 2);
					expect(scale.getPixelForValue(moment('2012').valueOf())).toBeCloseToPixel(scale.left + firstTickInterval / 2);
					expect(scale.getPixelForValue(moment('2051').valueOf())).toBeCloseToPixel(scale.left + scale.width - lastTickInterval / 2);
				});
			});
		});
	});

	describe('when reverse', function() {
		describe('is "true"', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
					type: 'line',
					data: {
						labels: ['2017', '2019', '2020', '2025', '2042'],
						datasets: [{data: [0, 1, 2, 3, 4, 5]}]
					},
					options: {
						scales: {
							x: {
								type: 'time',
								reverse: true,
								time: {
									parser: 'YYYY',
								},
								ticks: {
									source: 'labels',
								}
							},
							y: {
								display: false
							}
						}
					}
				});
			});

			it ('should reverse the labels', function() {
				var scale = this.chart.scales.x;
				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(scale.left + scale.width);
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(scale.left);
			});

			it ('should reverse the values for pixels', function() {
				var scale = this.chart.scales.x;
				expect(scale.getValueForPixel(scale.left)).toBeCloseToTime({
					value: moment('2042-01-01T00:00:00'),
					unit: 'hour',
				});
				expect(scale.getValueForPixel(scale.left + scale.width)).toBeCloseToTime({
					value: moment('2017-01-01T00:00:00'),
					unit: 'hour',
				});
			});

			it ('should reverse the bars and add offsets if offset is true', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.offset = true;
				chart.update();

				var numTicks = scale.ticks.length;
				var firstTickInterval = scale.getPixelForTick(1) - scale.getPixelForTick(0);
				var lastTickInterval = scale.getPixelForTick(numTicks - 1) - scale.getPixelForTick(numTicks - 2);

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(scale.left + scale.width - lastTickInterval / 2);
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(scale.left + firstTickInterval / 2);
			});

			it ('should reverse the values for pixels if offset is true', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.offset = true;
				chart.update();

				var numTicks = scale.ticks.length;
				var firstTickInterval = scale.getPixelForTick(1) - scale.getPixelForTick(0);
				var lastTickInterval = scale.getPixelForTick(numTicks - 1) - scale.getPixelForTick(numTicks - 2);

				expect(scale.getValueForPixel(scale.left + lastTickInterval / 2)).toBeCloseToTime({
					value: moment('2042-01-01T00:00:00'),
					unit: 'hour',
				});
				expect(scale.getValueForPixel(scale.left + scale.width - firstTickInterval / 2)).toBeCloseToTime({
					value: moment('2017-01-01T00:00:00'),
					unit: 'hour',
				});
			});
		});
	});

	describe('when reverse is "true" and distribution', function() {
		describe('is "series"', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
					type: 'line',
					data: {
						labels: ['2017', '2019', '2020', '2025', '2042'],
						datasets: [{data: [0, 1, 2, 3, 4, 5]}]
					},
					options: {
						scales: {
							x: {
								type: 'time',
								time: {
									parser: 'YYYY'
								},
								distribution: 'series',
								reverse: true,
								ticks: {
									source: 'labels'
								}
							},
							y: {
								display: false
							}
						}
					}
				});
			});

			it ('should reverse the labels and space data out with the same gap, whatever their time values', function() {
				var scale = this.chart.scales.x;
				var start = scale.left;
				var slice = scale.width / 4;

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start + slice * 4);
				expect(scale.getPixelForValue(moment('2019').valueOf())).toBeCloseToPixel(start + slice * 3);
				expect(scale.getPixelForValue(moment('2020').valueOf())).toBeCloseToPixel(start + slice * 2);
				expect(scale.getPixelForValue(moment('2025').valueOf())).toBeCloseToPixel(start + slice);
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start);
			});

			it ('should reverse the labels and should add a step before if scale.min is before the first data', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.min = '2012';
				chart.update();

				var start = scale.left;
				var slice = scale.width / 5;

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start + slice * 4);
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start);
			});

			it ('should reverse the labels and should add a step after if scale.max is after the last data', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.max = '2050';
				chart.update();

				var start = scale.left;
				var slice = scale.width / 5;

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start + slice * 5);
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start + slice);
			});

			it ('should reverse the labels and should add steps before and after if scale.min/max are outside the data range', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.min = '2012';
				options.max = '2050';
				chart.update();

				var start = scale.left;
				var slice = scale.width / 6;

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start + slice * 5);
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start + slice);
			});
		});
		describe('is "linear"', function() {
			beforeEach(function() {
				this.chart = window.acquireChart({
					type: 'line',
					data: {
						labels: ['2017', '2019', '2020', '2025', '2042'],
						datasets: [{data: [0, 1, 2, 3, 4, 5]}]
					},
					options: {
						scales: {
							x: {
								type: 'time',
								time: {
									parser: 'YYYY'
								},
								distribution: 'linear',
								reverse: true,
								ticks: {
									source: 'labels'
								}
							},
							y: {
								display: false
							}
						}
					}
				});
			});

			it ('should reverse the labels and should space data out with a gap relative to their time values', function() {
				var scale = this.chart.scales.x;
				var start = scale.left;
				var slice = scale.width / (2042 - 2017);

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start + slice * (2042 - 2017));
				expect(scale.getPixelForValue(moment('2019').valueOf())).toBeCloseToPixel(start + slice * (2042 - 2019));
				expect(scale.getPixelForValue(moment('2020').valueOf())).toBeCloseToPixel(start + slice * (2042 - 2020));
				expect(scale.getPixelForValue(moment('2025').valueOf())).toBeCloseToPixel(start + slice * (2042 - 2025));
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start);
			});

			it ('should reverse the labels and should take in account scale min and max if outside the ticks range', function() {
				var chart = this.chart;
				var scale = chart.scales.x;
				var options = chart.options.scales.x;

				options.min = '2012';
				options.max = '2050';
				chart.update();

				var start = scale.left;
				var slice = scale.width / (2050 - 2012);

				expect(scale.getPixelForValue(moment('2017').valueOf())).toBeCloseToPixel(start + slice * (2050 - 2017));
				expect(scale.getPixelForValue(moment('2019').valueOf())).toBeCloseToPixel(start + slice * (2050 - 2019));
				expect(scale.getPixelForValue(moment('2020').valueOf())).toBeCloseToPixel(start + slice * (2050 - 2020));
				expect(scale.getPixelForValue(moment('2025').valueOf())).toBeCloseToPixel(start + slice * (2050 - 2025));
				expect(scale.getPixelForValue(moment('2042').valueOf())).toBeCloseToPixel(start + slice * (2050 - 2042));
			});
		});
	});

	describe('labels', function() {
		it('should read labels from scale / xLabels / yLabels', function() {
			var timeOpts = {
				parser: 'YYYY',
				unit: 'year',
				displayFormats: {
					year: 'YYYY'
				}
			};
			var chart = window.acquireChart({
				type: 'line',
				data: {
					labels: ['1975', '1976', '1977'],
					xLabels: ['1985', '1986', '1987'],
					yLabels: ['1995', '1996', '1997']
				},
				options: {
					scales: {
						x: {
							type: 'time',
							labels: ['2015', '2016', '2017'],
							time: timeOpts
						},
						x2: {
							type: 'time',
							position: 'bottom',
							time: timeOpts
						},
						y: {
							type: 'time',
							time: timeOpts
						},
						y2: {
							position: 'left',
							type: 'time',
							labels: ['2005', '2006', '2007'],
							time: timeOpts
						}
					}
				}
			});

			expect(getLabels(chart.scales.x)).toEqual(['2015', '2016', '2017']);
			expect(getLabels(chart.scales.x2)).toEqual(['1985', '1986', '1987']);
			expect(getLabels(chart.scales.y)).toEqual(['1995', '1996', '1997']);
			expect(getLabels(chart.scales.y2)).toEqual(['2005', '2006', '2007']);
		});
	});

	it('should handle autoskip with major and minor ticks', function() {
		var date = moment('Jan 01 1990', 'MMM DD YYYY');
		var data = [];
		for (var i = 0; i < 60; i++) {
			data.push({x: date.valueOf(), y: Math.random()});
			date = date.clone().add(1, 'month');
		}

		var chart = window.acquireChart({
			type: 'line',
			data: {
				datasets: [{
					xAxisID: 'x',
					data: data
				}],
			},
			options: {
				scales: {
					x: {
						type: 'time',
						ticks: {
							major: {
								enabled: true
							},
							source: 'data',
							autoSkip: true
						}
					},
				}
			}
		});

		var scale = chart.scales.x;

		var labels = scale.ticks.map(function(t) {
			return t.label;
		});
		expect(labels).toEqual([
			'1990', 'Apr 1990', 'Jul 1990', 'Oct 1990',
			'1991', 'Apr 1991', 'Jul 1991', 'Oct 1991',
			'1992', 'Apr 1992', 'Jul 1992', 'Oct 1992',
			'1993', 'Apr 1993', 'Jul 1993', 'Oct 1993',
			'1994', 'Apr 1994', 'Jul 1994', 'Oct 1994']);
	});

	describe('Deprecations', function() {
		describe('options.time.displayFormats', function() {
			it('should generate defaults from adapter presets', function() {
				var chart = window.acquireChart({
					type: 'line',
					data: {},
					options: {
						scales: {
							x: {
								type: 'time'
							}
						}
					}
				});

				// NOTE: built-in adapter uses moment
				var expected = {
					datetime: 'MMM D, YYYY, h:mm:ss a',
					millisecond: 'h:mm:ss.SSS a',
					second: 'h:mm:ss a',
					minute: 'h:mm a',
					hour: 'hA',
					day: 'MMM D',
					week: 'll',
					month: 'MMM YYYY',
					quarter: '[Q]Q - YYYY',
					year: 'YYYY'
				};

				expect(chart.scales.x.options.time.displayFormats).toEqual(expected);
				expect(chart.options.scales.x.time.displayFormats).toEqual(expected);
			});

			it('should merge user formats with adapter presets', function() {
				var chart = window.acquireChart({
					type: 'line',
					data: {},
					options: {
						scales: {
							x: {
								type: 'time',
								time: {
									displayFormats: {
										millisecond: 'foo',
										hour: 'bar',
										month: 'bla'
									}
								}
							}
						}
					}
				});

				// NOTE: built-in adapter uses moment
				var expected = {
					datetime: 'MMM D, YYYY, h:mm:ss a',
					millisecond: 'foo',
					second: 'h:mm:ss a',
					minute: 'h:mm a',
					hour: 'bar',
					day: 'MMM D',
					week: 'll',
					month: 'bla',
					quarter: '[Q]Q - YYYY',
					year: 'YYYY'
				};

				expect(chart.scales.x.options.time.displayFormats).toEqual(expected);
				expect(chart.options.scales.x.time.displayFormats).toEqual(expected);
			});
		});
	});
});
