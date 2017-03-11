describe('Deprecations', function() {
	describe('Version 2.6.0', function() {
		// https://github.com/chartjs/Chart.js/issues/2481
		describe('Chart.Controller', function() {
			it('should be defined and an alias of Chart', function() {
				expect(Chart.Controller).toBeDefined();
				expect(Chart.Controller).toBe(Chart);
			});
			it('should be prototype of chart instances', function() {
				var chart = acquireChart({});
				expect(chart.constructor).toBe(Chart.Controller);
				expect(chart instanceof Chart.Controller).toBeTruthy();
				expect(Chart.Controller.prototype.isPrototypeOf(chart)).toBeTruthy();
			});
		});

		describe('chart.chart', function() {
			it('should be defined and an alias of chart', function() {
				var chart = acquireChart({});
				var proxy = chart.chart;
				expect(proxy).toBeDefined();
				expect(proxy).toBe(chart);
			});
			it('should defined previously existing properties', function() {
				var chart = acquireChart({}, {
					canvas: {
						style: 'width: 140px; height: 320px'
					}
				});

				var proxy = chart.chart;
				expect(proxy.config instanceof Object).toBeTruthy();
				expect(proxy.controller instanceof Chart.Controller).toBeTruthy();
				expect(proxy.canvas instanceof HTMLCanvasElement).toBeTruthy();
				expect(proxy.ctx instanceof CanvasRenderingContext2D).toBeTruthy();
				expect(proxy.currentDevicePixelRatio).toBe(window.devicePixelRatio || 1);
				expect(proxy.aspectRatio).toBe(140/320);
				expect(proxy.height).toBe(320);
				expect(proxy.width).toBe(140);
			});
		});

		describe('Chart.Animation.animationObject', function() {
			it('should be defined and an alias of Chart.Animation', function(done) {
				var animation = null;

				acquireChart({
					options: {
						animation: {
							duration: 50,
							onComplete: function(arg) {
								animation = arg;
							}
						}
					}
				});

				setTimeout(function() {
					expect(animation).not.toBeNull();
					expect(animation.animationObject).toBeDefined();
					expect(animation.animationObject).toBe(animation);
					done();
				}, 200);
			});
		});

		describe('Chart.Animation.chartInstance', function() {
			it('should be defined and an alias of Chart.Animation.chart', function(done) {
				var animation = null;
				var chart = acquireChart({
					options: {
						animation: {
							duration: 50,
							onComplete: function(arg) {
								animation = arg;
							}
						}
					}
				});

				setTimeout(function() {
					expect(animation).not.toBeNull();
					expect(animation.chartInstance).toBeDefined();
					expect(animation.chartInstance).toBe(chart);
					done();
				}, 200);
			});
		});

		describe('Chart.elements.Line: fill option', function() {
			it('should decode "zero", "top" and "bottom" as "origin", "start" and "end"', function() {
				var chart = window.acquireChart({
					type: 'line',
					data: {
						datasets: [
							{fill: 'zero'},
							{fill: 'bottom'},
							{fill: 'top'},
						]
					}
				});

				['origin', 'start', 'end'].forEach(function(expected, index) {
					var meta = chart.getDatasetMeta(index);
					expect(meta.$filler).toBeDefined();
					expect(meta.$filler.fill).toBe(expected);
				});
			});
		});
	});

	describe('Version 2.5.0', function() {
		describe('Chart.PluginBase', function() {
			it('should exist and extendable', function() {
				expect(Chart.PluginBase).toBeDefined();
				expect(Chart.PluginBase.extend).toBeDefined();
			});
		});

		describe('IPlugin.afterScaleUpdate', function() {
			it('should be called after the chart as been layed out', function() {
				var sequence = [];
				var plugin = {};
				var hooks = [
					'beforeLayout',
					'afterScaleUpdate',
					'afterLayout'
				];

				var override = Chart.layoutService.update;
				Chart.layoutService.update = function() {
					sequence.push('layoutUpdate');
					override.apply(this, arguments);
				};

				hooks.forEach(function(name) {
					plugin[name] = function() {
						sequence.push(name);
					};
				});

				window.acquireChart({plugins: [plugin]});
				expect(sequence).toEqual([].concat(
					'beforeLayout',
					'layoutUpdate',
					'afterScaleUpdate',
					'afterLayout'
				));
			});
		});
	});

	describe('Version 2.1.5', function() {
		// https://github.com/chartjs/Chart.js/pull/2752
		describe('Chart.pluginService', function() {
			it('should be defined and an alias of Chart.plugins', function() {
				expect(Chart.pluginService).toBeDefined();
				expect(Chart.pluginService).toBe(Chart.plugins);
			});
		});
	});
});
