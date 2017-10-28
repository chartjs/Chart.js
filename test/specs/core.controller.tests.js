describe('Chart', function() {

	// https://github.com/chartjs/Chart.js/issues/2481
	// See global.deprecations.tests.js for backward compatibility
	it('should be defined and prototype of chart instances', function() {
		var chart = acquireChart({});
		expect(Chart).toBeDefined();
		expect(Chart instanceof Object).toBeTruthy();
		expect(chart.constructor).toBe(Chart);
		expect(chart instanceof Chart).toBeTruthy();
		expect(Chart.prototype.isPrototypeOf(chart)).toBeTruthy();
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
			defaults.global.responsiveAnimationDuration = 42;
			defaults.global.hover.onHover = callback;
			defaults.line.hover.mode = 'x-axis';
			defaults.line.spanGaps = true;

			var chart = acquireChart({
				type: 'line'
			});

			var options = chart.options;
			expect(options.defaultFontSize).toBe(defaults.global.defaultFontSize);
			expect(options.showLines).toBe(defaults.line.showLines);
			expect(options.spanGaps).toBe(true);
			expect(options.responsiveAnimationDuration).toBe(42);
			expect(options.hover.onHover).toBe(callback);
			expect(options.hover.mode).toBe('x-axis');
		});

		it('should override default options', function() {
			var defaults = Chart.defaults;
			defaults.global.responsiveAnimationDuration = 42;
			defaults.line.hover.mode = 'x-axis';
			defaults.line.spanGaps = true;

			var chart = acquireChart({
				type: 'line',
				options: {
					responsiveAnimationDuration: 4242,
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
			expect(options.responsiveAnimationDuration).toBe(4242);
			expect(options.spanGaps).toBe(false);
			expect(options.hover.mode).toBe('dataset');
			expect(options.title.position).toBe('bottom');
		});

		it('should override axis positions that are incorrect', function() {
			var chart = acquireChart({
				type: 'line',
				options: {
					scales: {
						xAxes: [{
							position: 'left',
						}],
						yAxes: [{
							position: 'bottom'
						}]
					}
				}
			});

			var scaleOptions = chart.options.scales;
			expect(scaleOptions.xAxes[0].position).toBe('bottom');
			expect(scaleOptions.yAxes[0].position).toBe('left');
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
							xAxes: [{
								position: 'left',
							}],
							yAxes: [{
								position: 'bottom'
							}]
						}
					}
				});
			}
			expect(createChart).toThrow(new Error('"area" is not a chart type.'));
		});
	});

	describe('config.options.responsive: false', function() {
		it('should not inject the resizer element', function() {
			var chart = acquireChart({
				options: {
					responsive: false
				}
			});

			var wrapper = chart.canvas.parentNode;
			expect(wrapper.childNodes.length).toBe(1);
			expect(wrapper.firstChild.tagName).toBe('CANVAS');
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
			wrapper.style.width = '455px';
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 350,
					rw: 455, rh: 350,
				});

				wrapper.style.width = '150px';
				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 150, dh: 350,
						rw: 150, rh: 350,
					});

					done();
				});
			});
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
			wrapper.style.height = '455px';
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 300, dh: 455,
					rw: 300, rh: 455,
				});

				wrapper.style.height = '150px';
				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 300, dh: 150,
						rw: 300, rh: 150,
					});

					done();
				});
			});
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
			wrapper.style.height = '355px';
			wrapper.style.width = '455px';
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 355,
					rw: 455, rh: 355,
				});

				done();
			});
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
			canvas.style.display = 'block';
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 320, dh: 350,
					rw: 320, rh: 350,
				});

				done();
			});
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
			wrapper.style.display = 'block';
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 460, dh: 380,
					rw: 460, rh: 380,
				});

				done();
			});
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

			wrapper.style.cssText = 'width: 455px; height: 355px';
			wrapper.appendChild(canvas);
			body.appendChild(wrapper);

			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 355,
					rw: 455, rh: 355,
				});

				body.removeChild(wrapper);
				chart.destroy();
				done();
			});
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

			wrapper.style.cssText = 'width: 455px; height: 355px';
			wrapper.appendChild(canvas);
			body.appendChild(wrapper);

			waitForResize(chart, function() {
				var resizer = wrapper.firstChild;
				expect(resizer.className).toBe('chartjs-size-monitor');
				expect(resizer.tagName).toBe('DIV');
				expect(chart).toBeChartOfSize({
					dw: 455, dh: 355,
					rw: 455, rh: 355,
				});

				var target = document.createElement('div');
				target.style.cssText = 'width: 640px; height: 480px';
				target.appendChild(canvas);
				body.appendChild(target);

				waitForResize(chart, function() {
					expect(target.firstChild).toBe(resizer);
					expect(wrapper.firstChild).toBe(null);
					expect(chart).toBeChartOfSize({
						dw: 640, dh: 480,
						rw: 640, rh: 480,
					});

					body.removeChild(wrapper);
					body.removeChild(target);
					chart.destroy();
					done();
				});
			});
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
			parent.removeChild(wrapper);
			parent.appendChild(wrapper);
			wrapper.style.height = '355px';

			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 320, dh: 355,
					rw: 320, rh: 355,
				});

				parent.removeChild(wrapper);
				wrapper.style.width = '455px';
				parent.appendChild(wrapper);

				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 455, dh: 355,
						rw: 455, rh: 355,
					});

					done();
				});
			});
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

				canvas.parentNode.style.width = '455px';
				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 455, dh: 455,
						rw: 455, rh: 455,
					});

					done();
				});
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
			wrapper.style.width = '450px';
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 450, dh: 225,
					rw: 450, rh: 225,
				});

				wrapper.style.width = '150px';
				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 150, dh: 75,
						rw: 150, rh: 75,
					});

					done();
				});
			});
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
			wrapper.style.height = '455px';
			waitForResize(chart, function() {
				expect(chart).toBeChartOfSize({
					dw: 320, dh: 160,
					rw: 320, rh: 160,
				});

				wrapper.style.height = '150px';
				waitForResize(chart, function() {
					expect(chart).toBeChartOfSize({
						dw: 320, dh: 160,
						rw: 320, rh: 160,
					});

					done();
				});
			});
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

	describe('controller.destroy', function() {
		it('should remove the resizer element when responsive: true', function(done) {
			var chart = acquireChart({
				options: {
					responsive: true
				}
			});

			waitForResize(chart, function() {
				var wrapper = chart.canvas.parentNode;
				var resizer = wrapper.firstChild;
				expect(wrapper.childNodes.length).toBe(2);
				expect(resizer.className).toBe('chartjs-size-monitor');
				expect(resizer.tagName).toBe('DIV');

				chart.destroy();

				expect(wrapper.childNodes.length).toBe(1);
				expect(wrapper.firstChild.tagName).toBe('CANVAS');

				done();
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
			expect(meta.data[0]._model.y).toBe(333);
			expect(meta.data[1]._model.y).toBe(183);
			expect(meta.data[2]._model.y).toBe(32);
			expect(meta.data[3]._model.y).toBe(484);

			chart.reset();

			// For a line chart, the animation state is the bottom
			expect(meta.data[0]._model.y).toBe(484);
			expect(meta.data[1]._model.y).toBe(484);
			expect(meta.data[2]._model.y).toBe(484);
			expect(meta.data[3]._model.y).toBe(484);
		});
	});

	describe('config update', function() {
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

			chart.options.scales.yAxes[0].ticks.min = 0;
			chart.options.scales.yAxes[0].ticks.max = 10;
			chart.update();

			var yScale = chart.scales['y-axis-0'];
			expect(yScale.options.ticks.min).toBe(0);
			expect(yScale.options.ticks.max).toBe(10);
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
			expect(chart.tooltip._options).toEqual(jasmine.objectContaining(newTooltipConfig));
		});

		it ('should reset the tooltip on update', function() {
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

			var node = chart.canvas;
			var rect = node.getBoundingClientRect();

			var evt = new MouseEvent('mousemove', {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: rect.left + point._model.x,
				clientY: 0
			});

			// Manually trigger rather than having an async test
			node.dispatchEvent(evt);

			// Check and see if tooltip was displayed
			var tooltip = chart.tooltip;

			expect(chart.lastActive).toEqual([point]);
			expect(tooltip._lastActive).toEqual([]);

			// Update and confirm tooltip is reset
			chart.update();
			expect(chart.lastActive).toEqual([]);
			expect(tooltip._lastActive).toEqual([]);
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
						xAxes: [{
							type: 'time'
						}],
						yAxes: [{
							scaleLabel: {
								display: true,
								labelString: 'Value'
							}
						}]
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

			chart.canvas.parentNode.style.width = '400px';
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

	describe('controller.update', function() {
		beforeEach(function() {
			this.chart = acquireChart({
				type: 'doughnut',
				options: {
					animation: {
						easing: 'linear',
						duration: 500
					}
				}
			});

			this.addAnimationSpy = spyOn(Chart.animationService, 'addAnimation');
		});

		it('should add an animation with the default options', function() {
			this.chart.update();

			expect(this.addAnimationSpy).toHaveBeenCalledWith(
				this.chart,
				jasmine.objectContaining({easing: 'linear'}),
				undefined,
				undefined
			);
		});

		it('should add an animation with the provided options', function() {
			this.chart.update({
				duration: 800,
				easing: 'easeOutBounce',
				lazy: false,
			});

			expect(this.addAnimationSpy).toHaveBeenCalledWith(
				this.chart,
				jasmine.objectContaining({easing: 'easeOutBounce'}),
				800,
				false
			);
		});
	});
});
