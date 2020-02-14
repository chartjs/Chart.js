describe('Chart', function() {

	// https://github.com/chartjs/Chart.js/issues/2481
	// See global.deprecations.tests.js for backward compatibility
	it('should be defined and prototype of chart instances', function() {
		var chart = acquireChart({});
		expect(Chart).toBeDefined();
		expect(Chart instanceof Object).toBeTruthy();
		expect(chart.constructor).toBe(Chart);
		expect(chart instanceof Chart).toBeTruthy();
	});

	describe('config initialization', function() {
		it('should create missing config.data properties', function() {
			var chart = acquireChart({});
			var data = chart.data;

			expect(data instanceof Object).toBeTruthy();
			expect(data.labels instanceof Array).toBeTruthy();
			expect(data.labels.length).toBe(0);
			expect(data.datasets instanceof Array).toBeTruthy();
			expect(data.datasets.length).toBe(0);
		});

		it('should not alter config.data references', function() {
			var ds0 = {data: [10, 11, 12, 13]};
			var ds1 = {data: [20, 21, 22, 23]};
			var datasets = [ds0, ds1];
			var labels = [0, 1, 2, 3];
			var data = {labels: labels, datasets: datasets};

			var chart = acquireChart({
				type: 'line',
				data: data
			});

			expect(chart.data).toBe(data);
			expect(chart.data.labels).toBe(labels);
			expect(chart.data.datasets).toBe(datasets);
			expect(chart.data.datasets[0]).toBe(ds0);
			expect(chart.data.datasets[1]).toBe(ds1);
			expect(chart.data.datasets[0].data).toBe(ds0.data);
			expect(chart.data.datasets[1].data).toBe(ds1.data);
		});

		it('should define chart.data as an alias for config.data', function() {
			var config = {data: {labels: [], datasets: []}};
			var chart = acquireChart(config);

			expect(chart.data).toBe(config.data);

			chart.data = {labels: [1, 2, 3], datasets: [{data: [4, 5, 6]}]};

			expect(config.data).toBe(chart.data);
			expect(config.data.labels).toEqual([1, 2, 3]);
			expect(config.data.datasets[0].data).toEqual([4, 5, 6]);

			config.data = {labels: [7, 8, 9], datasets: [{data: [10, 11, 12]}]};

			expect(chart.data).toBe(config.data);
			expect(chart.data.labels).toEqual([7, 8, 9]);
			expect(chart.data.datasets[0].data).toEqual([10, 11, 12]);
		});

		it('should initialize config with default options', function() {
			var callback = function() {};
			var defaults = Chart.defaults;

			defaults.hover.onHover = callback;
			defaults.line.spanGaps = true;
			defaults.line.hover.mode = 'x-axis';

			var chart = acquireChart({
				type: 'line'
			});

			var options = chart.options;
			expect(options.fontSize).toBe(defaults.fontSize);
			expect(options.showLines).toBe(defaults.line.showLines);
			expect(options.spanGaps).toBe(true);
			expect(options.hover.onHover).toBe(callback);
			expect(options.hover.mode).toBe('x-axis');

			defaults.hover.onHover = null;
			defaults.line.spanGaps = false;
			defaults.line.hover.mode = 'index';
		});

		it('should override default options', function() {
			var callback = function() {};
			var defaults = Chart.defaults;

			defaults.hover.onHover = callback;
			defaults.line.hover.mode = 'x-axis';
			defaults.line.spanGaps = true;

			var chart = acquireChart({
				type: 'line',
				options: {
					spanGaps: false,
					hover: {
						mode: 'dataset',
					},
					title: {
						position: 'bottom'
					}
				}
			});

			var options = chart.options;
			expect(options.showLines).toBe(defaults.showLines);
			expect(options.spanGaps).toBe(false);
			expect(options.hover.mode).toBe('dataset');
			expect(options.title.position).toBe('bottom');

			defaults.hover.onHover = null;
			defaults.line.hover.mode = 'index';
			defaults.line.spanGaps = false;
		});

		it('should override axis positions that are incorrect', function() {
			var chart = acquireChart({
				type: 'line',
				options: {
					scales: {
						x: {
							position: 'left',
						},
						y: {
							position: 'bottom'
						}
					}
				}
			});

			var scaleOptions = chart.options.scales;
			expect(scaleOptions.x.position).toBe('bottom');
			expect(scaleOptions.y.position).toBe('left');
		});

		it('should throw an error if the chart type is incorrect', function() {
			function createChart() {
				acquireChart({
					type: 'area',
					data: {
						datasets: [{
							label: 'first',
							data: [10, 20]
						}],
						labels: ['0', '1'],
					},
					options: {
						scales: {
							x: {
								type: 'linear',
								position: 'left',
							},
							y: {
								type: 'category',
								position: 'bottom'
							}
						}
					}
				});
			}
			expect(createChart).toThrow(new Error('"area" is not a chart type.'));
		});
	});

	describe('when merging scale options', function() {
		beforeEach(function() {
			Chart.helpers.merge(Chart.defaults.scale, {
				_jasmineCheckA: 'a0',
				_jasmineCheckB: 'b0',
				_jasmineCheckC: 'c0'
			});

			Chart.helpers.merge(Chart.scaleService.defaults.logarithmic, {
				_jasmineCheckB: 'b1',
				_jasmineCheckC: 'c1',
			});
		});

		afterEach(function() {
			delete Chart.defaults.scale._jasmineCheckA;
			delete Chart.defaults.scale._jasmineCheckB;
			delete Chart.defaults.scale._jasmineCheckC;
			delete Chart.scaleService.defaults.logarithmic._jasmineCheckB;
			delete Chart.scaleService.defaults.logarithmic._jasmineCheckC;
		});

		it('should default to "category" for x scales and "linear" for y scales', function() {
			var chart = acquireChart({
				type: 'line',
				options: {
					scales: {
						xFoo0: {},
						xFoo1: {},
						yBar0: {},
						yBar1: {},
					}
				}
			});

			expect(chart.scales.xFoo0.type).toBe('category');
			expect(chart.scales.xFoo1.type).toBe('category');
			expect(chart.scales.yBar0.type).toBe('linear');
			expect(chart.scales.yBar1.type).toBe('linear');
		});

		it('should correctly apply defaults on central scale', function() {
			var chart = acquireChart({
				type: 'line',
				options: {
					scale: {
						id: 'foo',
						type: 'logarithmic',
						_jasmineCheckC: 'c2',
						_jasmineCheckD: 'd2'
					}
				}
			});

			// let's check a few values from the user options and defaults

			expect(chart.scales.foo.type).toBe('logarithmic');
			expect(chart.scales.foo.options).toEqual(chart.options.scales.foo);
			expect(chart.scales.foo.options).toEqual(
				jasmine.objectContaining({
					_jasmineCheckA: 'a0',
					_jasmineCheckB: 'b1',
					_jasmineCheckC: 'c2',
					_jasmineCheckD: 'd2'
				}));
		});

		it('should correctly apply defaults on xy scales', function() {
			var chart = acquireChart({
				type: 'line',
				options: {
					scales: {
						x: {
							type: 'logarithmic',
							_jasmineCheckC: 'c2',
							_jasmineCheckD: 'd2'
						},
						y: {
							type: 'time',
							_jasmineCheckC: 'c2',
							_jasmineCheckE: 'e2'
						}
					}
				}
			});

			expect(chart.scales.x.type).toBe('logarithmic');
			expect(chart.scales.x.options).toBe(chart.options.scales.x);
			expect(chart.scales.x.options).toEqual(
				jasmine.objectContaining({
					_jasmineCheckA: 'a0',
					_jasmineCheckB: 'b1',
					_jasmineCheckC: 'c2',
					_jasmineCheckD: 'd2'
				}));

			expect(chart.scales.y.type).toBe('time');
			expect(chart.scales.y.options).toBe(chart.options.scales.y);
			expect(chart.scales.y.options).toEqual(
				jasmine.objectContaining({
					_jasmineCheckA: 'a0',
					_jasmineCheckB: 'b0',
					_jasmineCheckC: 'c2',
					_jasmineCheckE: 'e2'
				}));
		});

		it('should not alter defaults when merging config', function() {
			var chart = acquireChart({
				type: 'line',
				options: {
					_jasmineCheck: 42,
					scales: {
						x: {
							type: 'linear',
							_jasmineCheck: 42,
						},
						y: {
							type: 'category',
							_jasmineCheck: 42,
						}
					}
				}
			});

			expect(chart.options._jasmineCheck).toBeDefined();
			expect(chart.scales.x.options._jasmineCheck).toBeDefined();
			expect(chart.scales.y.options._jasmineCheck).toBeDefined();

			expect(Chart.defaults.line._jasmineCheck).not.toBeDefined();
			expect(Chart.defaults._jasmineCheck).not.toBeDefined();
			expect(Chart.scaleService.defaults.linear._jasmineCheck).not.toBeDefined();
			expect(Chart.scaleService.defaults.category._jasmineCheck).not.toBeDefined();
		});
	});

	describe('config.options.responsive: true (maintainAspectRatio: false)', function() {
		it('should fill parent width and height', function() {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: 'width: 150px; height: 245px'
				},
				wrapper: {
					style: 'width: 300px; height: 350px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 350,
				rw: 300, rh: 350,
			});
		});

		it('should resize the canvas when parent width changes', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 300px; height: 350px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 350,
				rw: 300, rh: 350,
			});

			var wrapper = chart.canvas.parentNode;
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 350,
					rw: 455, rh: 350,
				});

				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 150, dh: 350,
						rw: 150, rh: 350,
					});

					done();
				});
				wrapper.style.width = '150px';
			});
			wrapper.style.width = '455px';
		});

		it('should resize the canvas when parent is RTL and width changes', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 300px; height: 350px; position: relative; direction: rtl'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 350,
				rw: 300, rh: 350,
			});

			var wrapper = chart.canvas.parentNode;
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 350,
					rw: 455, rh: 350,
				});

				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 150, dh: 350,
						rw: 150, rh: 350,
					});

					done();
				});
				wrapper.style.width = '150px';
			});
			wrapper.style.width = '455px';
		});

		it('should resize the canvas when parent height changes', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 300px; height: 350px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 350,
				rw: 300, rh: 350,
			});

			var wrapper = chart.canvas.parentNode;
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 300, dh: 455,
					rw: 300, rh: 455,
				});

				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 300, dh: 150,
						rw: 300, rh: 150,
					});

					done();
				});
				wrapper.style.height = '150px';
			});
			wrapper.style.height = '455px';
		});

		it('should not include parent padding when resizing the canvas', function(done) {
			var chart = acquireChart({
				type: 'line',
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'padding: 50px; width: 320px; height: 350px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 320, dh: 350,
				rw: 320, rh: 350,
			});

			var wrapper = chart.canvas.parentNode;
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 355,
					rw: 455, rh: 355,
				});

				done();
			});
			wrapper.style.height = '355px';
			wrapper.style.width = '455px';
		});

		it('should resize the canvas when the canvas display style changes from "none" to "block"', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: 'display: none;'
				},
				wrapper: {
					style: 'width: 320px; height: 350px'
				}
			});

			var canvas = chart.canvas;
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 320, dh: 350,
					rw: 320, rh: 350,
				});

				done();
			});
			canvas.style.display = 'block';
		});

		it('should resize the canvas when the wrapper display style changes from "none" to "block"', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'display: none; width: 460px; height: 380px'
				}
			});

			var wrapper = chart.canvas.parentNode;
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 460, dh: 380,
					rw: 460, rh: 380,
				});

				done();
			});
			wrapper.style.display = 'block';
		});

		// https://github.com/chartjs/Chart.js/issues/5485
		it('should resize the canvas when the devicePixelRatio changes', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false,
					devicePixelRatio: 1
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 400px; height: 200px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 400, dh: 200,
				rw: 400, rh: 200,
			});

			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 400, dh: 200,
					rw: 800, rh: 400,
				});

				done();
			});
			chart.options.devicePixelRatio = 2;
			chart.resize();
		});

		// https://github.com/chartjs/Chart.js/issues/3790
		it('should resize the canvas if attached to the DOM after construction', function(done) {
			var canvas = document.createElement('canvas');
			var wrapper = document.createElement('div');
			var body = window.document.body;
			var chart = new Chart(canvas, {
				type: 'line',
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 0, dh: 0,
				rw: 0, rh: 0,
			});

			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 355,
					rw: 455, rh: 355,
				});

				body.removeChild(wrapper);
				chart.destroy();
				done();
			});

			wrapper.style.cssText = 'width: 455px; height: 355px';
			wrapper.appendChild(canvas);
			body.appendChild(wrapper);
		});

		it('should resize the canvas when attached to a different parent', function(done) {
			var canvas = document.createElement('canvas');
			var wrapper = document.createElement('div');
			var body = window.document.body;
			var chart = new Chart(canvas, {
				type: 'line',
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 0, dh: 0,
				rw: 0, rh: 0,
			});

			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 355,
					rw: 455, rh: 355,
				});

				var target = document.createElement('div');

				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 640, dh: 480,
						rw: 640, rh: 480,
					});

					body.removeChild(wrapper);
					body.removeChild(target);
					chart.destroy();
					done();
				});

				target.style.cssText = 'width: 640px; height: 480px';
				target.appendChild(canvas);
				body.appendChild(target);
			});

			wrapper.style.cssText = 'width: 455px; height: 355px';
			wrapper.appendChild(canvas);
			body.appendChild(wrapper);
		});

		// https://github.com/chartjs/Chart.js/issues/3521
		it('should resize the canvas after the wrapper has been re-attached to the DOM', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 320px; height: 350px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 320, dh: 350,
				rw: 320, rh: 350,
			});

			var wrapper = chart.canvas.parentNode;
			var parent = wrapper.parentNode;

			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 320, dh: 355,
					rw: 320, rh: 355,
				});

				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 455, dh: 355,
						rw: 455, rh: 355,
					});

					done();
				});

				parent.removeChild(wrapper);
				wrapper.style.width = '455px';
				parent.appendChild(wrapper);
			});

			parent.removeChild(wrapper);
			parent.appendChild(wrapper);
			wrapper.style.height = '355px';
		});

		// https://github.com/chartjs/Chart.js/issues/4737
		it('should resize the canvas when re-creating the chart', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true
				}
			}, {
				wrapper: {
					style: 'width: 320px'
				}
			});

			var wrapper = chart.canvas.parentNode;

			waitForResize(chart, function() {
				var canvas = chart.canvas;
				expect(chart).toBeChartOfSize({
					dw: 320, dh: 320,
					rw: 320, rh: 320,
				});

				chart.destroy();
				chart = new Chart(canvas, {
					type: 'line',
					options: {
						responsive: true
					}
				});

				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 455, dh: 455,
						rw: 455, rh: 455,
					});

					chart.destroy();
					window.document.body.removeChild(wrapper);
					done();
				});
				canvas.parentNode.style.width = '455px';
			});
		});
	});

	describe('config.options.responsive: true (maintainAspectRatio: true)', function() {
		it('should resize the canvas with correct aspect ratio when parent width changes', function(done) {
			var chart = acquireChart({
				type: 'line', // AR == 2
				options: {
					responsive: true,
					maintainAspectRatio: true
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 300px; height: 350px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 300, dh: 150,
				rw: 300, rh: 150,
			});

			var wrapper = chart.canvas.parentNode;
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 450, dh: 225,
					rw: 450, rh: 225,
				});

				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 150, dh: 75,
						rw: 150, rh: 75,
					});

					done();
				});
				wrapper.style.width = '150px';
			});
			wrapper.style.width = '450px';
		});

		it('should not resize the canvas when parent height changes', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true,
					maintainAspectRatio: true
				}
			}, {
				canvas: {
					style: ''
				},
				wrapper: {
					style: 'width: 320px; height: 350px; position: relative'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 320, dh: 160,
				rw: 320, rh: 160,
			});

			var wrapper = chart.canvas.parentNode;
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 320, dh: 160,
					rw: 320, rh: 160,
				});

				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 320, dh: 160,
						rw: 320, rh: 160,
					});

					done();
				});
				wrapper.style.height = '150px';
			});
			wrapper.style.height = '455px';
		});
	});

	describe('Retina scale (a.k.a. device pixel ratio)', function() {
		beforeEach(function() {
			this.devicePixelRatio = window.devicePixelRatio;
			window.devicePixelRatio = 3;
		});

		afterEach(function() {
			window.devicePixelRatio = this.devicePixelRatio;
		});

		// see https://github.com/chartjs/Chart.js/issues/3575
		it ('should scale the render size but not the "implicit" display size', function() {
			var chart = acquireChart({
				options: {
					responsive: false
				}
			}, {
				canvas: {
					width: 320,
					height: 240,
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 320, dh: 240,
				rw: 960, rh: 720,
			});
		});

		it ('should scale the render size but not the "explicit" display size', function() {
			var chart = acquireChart({
				options: {
					responsive: false
				}
			}, {
				canvas: {
					style: 'width: 320px; height: 240px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 320, dh: 240,
				rw: 960, rh: 720,
			});
		});
	});

	describe('config.options.devicePixelRatio', function() {
		beforeEach(function() {
			this.devicePixelRatio = window.devicePixelRatio;
			window.devicePixelRatio = 1;
		});

		afterEach(function() {
			window.devicePixelRatio = this.devicePixelRatio;
		});

		// see https://github.com/chartjs/Chart.js/issues/3575
		it ('should scale the render size but not the "implicit" display size', function() {
			var chart = acquireChart({
				options: {
					responsive: false,
					devicePixelRatio: 3
				}
			}, {
				canvas: {
					width: 320,
					height: 240,
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 320, dh: 240,
				rw: 960, rh: 720,
			});
		});

		it ('should scale the render size but not the "explicit" display size', function() {
			var chart = acquireChart({
				options: {
					responsive: false,
					devicePixelRatio: 3
				}
			}, {
				canvas: {
					style: 'width: 320px; height: 240px'
				}
			});

			expect(chart).toBeChartOfSize({
				dw: 320, dh: 240,
				rw: 960, rh: 720,
			});
		});
	});

	describe('controller.reset', function() {
		it('should reset the chart elements', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 0]
					}]
				},
				options: {
					responsive: true
				}
			});

			var meta = chart.getDatasetMeta(0);

			// Verify that points are at their initial correct location,
			// then we will reset and see that they moved
			expect(meta.data[0].y).toBeCloseToPixel(333);
			expect(meta.data[1].y).toBeCloseToPixel(183);
			expect(meta.data[2].y).toBeCloseToPixel(32);
			expect(meta.data[3].y).toBeCloseToPixel(482);

			chart.reset();

			// For a line chart, the animation state is the bottom
			expect(meta.data[0].y).toBeCloseToPixel(482);
			expect(meta.data[1].y).toBeCloseToPixel(482);
			expect(meta.data[2].y).toBeCloseToPixel(482);
			expect(meta.data[3].y).toBeCloseToPixel(482);
		});
	});

	describe('config update', function() {
		it ('should update options', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					responsive: true
				}
			});

			chart.options = {
				responsive: false,
				scales: {
					y: {
						min: 0,
						max: 10
					}
				}
			};
			chart.update();

			var yScale = chart.scales.y;
			expect(yScale.options.min).toBe(0);
			expect(yScale.options.max).toBe(10);
		});

		it ('should update scales options', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					responsive: true
				}
			});

			chart.options.scales.y.min = 0;
			chart.options.scales.y.max = 10;
			chart.update();

			var yScale = chart.scales.y;
			expect(yScale.options.min).toBe(0);
			expect(yScale.options.max).toBe(10);
		});

		it ('should update scales options from new object', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					responsive: true
				}
			});

			var newScalesConfig = {
				y: {
					min: 0,
					max: 10
				}
			};
			chart.options.scales = newScalesConfig;

			chart.update();

			var yScale = chart.scales.y;
			expect(yScale.options.min).toBe(0);
			expect(yScale.options.max).toBe(10);
		});

		it ('should remove discarded scale', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					responsive: true,
					scales: {
						y: {
							min: 0,
							max: 10
						}
					}
				}
			});

			var newScalesConfig = {
				y: {
					min: 0,
					max: 10
				}
			};
			chart.options.scales = newScalesConfig;

			chart.update();

			var yScale = chart.scales.yAxis0;
			expect(yScale).toBeUndefined();
			var newyScale = chart.scales.y;
			expect(newyScale.options.min).toBe(0);
			expect(newyScale.options.max).toBe(10);
		});

		it ('should update tooltip options', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					responsive: true
				}
			});

			var newTooltipConfig = {
				mode: 'dataset',
				intersect: false
			};
			chart.options.tooltips = newTooltipConfig;

			chart.update();
			expect(chart.tooltip.options).toEqual(jasmine.objectContaining(newTooltipConfig));
		});

		it ('should update the tooltip on update', function(done) {
			var chart = acquireChart({
				type: 'line',
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						data: [10, 20, 30, 100]
					}]
				},
				options: {
					responsive: true,
					tooltip: {
						mode: 'nearest'
					}
				}
			});

			// Trigger an event over top of a point to
			// put an item into the tooltip
			var meta = chart.getDatasetMeta(0);
			var point = meta.data[1];

			afterEvent(chart, 'mousemove', function() {
				// Check and see if tooltip was displayed
				var tooltip = chart.tooltip;

				expect(chart.lastActive[0].element).toEqual(point);
				expect(tooltip._active[0].element).toEqual(point);

				// Update and confirm tooltip is updated
				chart.update();
				expect(chart.lastActive[0].element).toEqual(point);
				expect(tooltip._active[0].element).toEqual(point);

				done();
			});
			jasmine.triggerMouseEvent(chart, 'mousemove', point);
		});

		it ('should update the metadata', function() {
			var cfg = {
				data: {
					labels: ['A', 'B', 'C', 'D'],
					datasets: [{
						type: 'line',
						data: [10, 20, 30, 0]
					}]
				},
				options: {
					responsive: true,
					scales: {
						x: {
							type: 'category'
						},
						y: {
							type: 'linear',
							scaleLabel: {
								display: true,
								labelString: 'Value'
							}
						}
					}
				}
			};
			var chart = acquireChart(cfg);
			var meta = chart.getDatasetMeta(0);
			expect(meta.type).toBe('line');

			// change the dataset to bar and check that meta was updated
			chart.config.data.datasets[0].type = 'bar';
			chart.update();
			meta = chart.getDatasetMeta(0);
			expect(meta.type).toBe('bar');
		});
	});

	describe('plugin.extensions', function() {
		it ('should notify plugin in correct order', function(done) {
			var plugin = this.plugin = {};
			var sequence = [];
			var hooks = {
				init: [
					'beforeInit',
					'afterInit'
				],
				update: [
					'beforeUpdate',
					'beforeLayout',
					'afterLayout',
					'beforeDatasetsUpdate',
					'beforeDatasetUpdate',
					'afterDatasetUpdate',
					'afterDatasetsUpdate',
					'afterUpdate',
				],
				render: [
					'beforeRender',
					'beforeDraw',
					'beforeDatasetsDraw',
					'beforeDatasetDraw',
					'afterDatasetDraw',
					'afterDatasetsDraw',
					'beforeTooltipDraw',
					'afterTooltipDraw',
					'afterDraw',
					'afterRender',
				],
				resize: [
					'resize'
				],
				destroy: [
					'destroy'
				]
			};

			Object.keys(hooks).forEach(function(group) {
				hooks[group].forEach(function(name) {
					plugin[name] = function() {
						sequence.push(name);
					};
				});
			});

			var chart = window.acquireChart({
				type: 'line',
				data: {datasets: [{}]},
				plugins: [plugin],
				options: {
					responsive: true
				}
			}, {
				wrapper: {
					style: 'width: 300px'
				}
			});

			waitForResize(chart, function() {
				chart.destroy();

				expect(sequence).toEqual([].concat(
					hooks.init,
					hooks.update,
					hooks.render,
					hooks.resize,
					hooks.update,
					hooks.render,
					hooks.destroy
				));

				done();
			});
			chart.canvas.parentNode.style.width = '400px';
		});

		it('should not notify before/afterDatasetDraw if dataset is hidden', function() {
			var sequence = [];
			var plugin = this.plugin = {
				beforeDatasetDraw: function(chart, args) {
					sequence.push('before-' + args.index);
				},
				afterDatasetDraw: function(chart, args) {
					sequence.push('after-' + args.index);
				}
			};

			window.acquireChart({
				type: 'line',
				data: {datasets: [{}, {hidden: true}, {}]},
				plugins: [plugin]
			});

			expect(sequence).toEqual([
				'before-2', 'after-2',
				'before-0', 'after-0'
			]);
		});
	});

	describe('metasets', function() {
		beforeEach(function() {
			this.chart = acquireChart({
				type: 'line',
				data: {
					datasets: [
						{label: '1', order: 2},
						{label: '2', order: 1},
						{label: '3', order: 4},
						{label: '4', order: 3},
					]
				}
			});
		});
		afterEach(function() {
			const metasets = this.chart._metasets;
			expect(metasets.length).toEqual(this.chart.data.datasets.length);
			for (let i = 0; i < metasets.length; i++) {
				expect(metasets[i].index).toEqual(i);
				expect(metasets[i]._dataset).toEqual(this.chart.data.datasets[i]);
			}
		});
		it('should build metasets array in order', function() {
			const metasets = this.chart._metasets;
			expect(metasets[0].order).toEqual(2);
			expect(metasets[1].order).toEqual(1);
			expect(metasets[2].order).toEqual(4);
			expect(metasets[3].order).toEqual(3);
		});
		it('should build sorted metasets array in correct order', function() {
			const metasets = this.chart._sortedMetasets;
			expect(metasets[0].order).toEqual(1);
			expect(metasets[1].order).toEqual(2);
			expect(metasets[2].order).toEqual(3);
			expect(metasets[3].order).toEqual(4);
		});
		it('should be moved when datasets are removed from begining', function() {
			this.chart.data.datasets.splice(0, 2);
			this.chart.update();
			const metasets = this.chart._metasets;
			expect(metasets[0].order).toEqual(4);
			expect(metasets[1].order).toEqual(3);
		});
		it('should be moved when datasets are removed from middle', function() {
			this.chart.data.datasets.splice(1, 2);
			this.chart.update();
			const metasets = this.chart._metasets;
			expect(metasets[0].order).toEqual(2);
			expect(metasets[1].order).toEqual(3);
		});
		it('should be moved when datasets are inserted', function() {
			this.chart.data.datasets.splice(1, 0, {label: '1.5', order: 5});
			this.chart.update();
			const metasets = this.chart._metasets;
			expect(metasets[0].order).toEqual(2);
			expect(metasets[1].order).toEqual(5);
			expect(metasets[2].order).toEqual(1);
			expect(metasets[3].order).toEqual(4);
			expect(metasets[4].order).toEqual(3);
		});
		it('should be replaced when dataset is replaced', function() {
			this.chart.data.datasets.splice(1, 1, {label: '1.5', order: 5});
			this.chart.update();
			const metasets = this.chart._metasets;
			expect(metasets[0].order).toEqual(2);
			expect(metasets[1].order).toEqual(5);
			expect(metasets[2].order).toEqual(4);
			expect(metasets[3].order).toEqual(3);
		});
	});

	describe('data visibility', function() {
		it('should hide a dataset', function() {
			var chart = acquireChart({
				type: 'line',
				data: {
					datasets: [{
						data: [0, 1, 2]
					}],
					labels: ['a', 'b', 'c']
				}
			});

			chart.setDatasetVisibility(0, false);

			var meta = chart.getDatasetMeta(0);
			expect(meta.hidden).toBe(true);
		});

		it('should hide a single data item', function() {
			var chart = acquireChart({
				type: 'polarArea',
				data: {
					datasets: [{
						data: [1, 2, 3]
					}]
				}
			});

			chart.setDataVisibility(0, 1, false);

			var meta = chart.getDatasetMeta(0);
			expect(meta.data[1].hidden).toBe(true);
		});
	});
});
