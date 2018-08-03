describe('Deprecations', function() {
	describe('Version 2.8.0', function() {
		describe('Chart.layoutService', function() {
			it('should be defined and an alias of Chart.layouts', function() {
				expect(Chart.layoutService).toBeDefined();
				expect(Chart.layoutService).toBe(Chart.layouts);
			});
		});
	});

	describe('Version 2.7.0', function() {
		describe('Chart.Controller.update(duration, lazy)', function() {
			it('should add an animation with the provided options', function() {
				var chart = acquireChart({
					type: 'doughnut',
					options: {
						animation: {
							easing: 'linear',
							duration: 500
						}
					}
				});

				spyOn(Chart.animationService, 'addAnimation');

				chart.update(800, false);

				expect(Chart.animationService.addAnimation).toHaveBeenCalledWith(
					chart,
					jasmine.objectContaining({easing: 'linear'}),
					800,
					false
				);
			});
		});

		describe('Chart.Controller.render(duration, lazy)', function() {
			it('should add an animation with the provided options', function() {
				var chart = acquireChart({
					type: 'doughnut',
					options: {
						animation: {
							easing: 'linear',
							duration: 500
						}
					}
				});

				spyOn(Chart.animationService, 'addAnimation');

				chart.render(800, true);

				expect(Chart.animationService.addAnimation).toHaveBeenCalledWith(
					chart,
					jasmine.objectContaining({easing: 'linear'}),
					800,
					true
				);
			});
		});

		describe('Chart.helpers.indexOf', function() {
			it('should be defined and a function', function() {
				expect(Chart.helpers.indexOf).toBeDefined();
				expect(typeof Chart.helpers.indexOf).toBe('function');
			});
			it('should returns the correct index', function() {
				expect(Chart.helpers.indexOf([1, 2, 42], 42)).toBe(2);
				expect(Chart.helpers.indexOf([1, 2, 42], 3)).toBe(-1);
				expect(Chart.helpers.indexOf([1, 42, 2, 42], 42, 2)).toBe(3);
				expect(Chart.helpers.indexOf([1, 42, 2, 42], 3, 2)).toBe(-1);
			});
		});

		describe('Chart.helpers.clear', function() {
			it('should be defined and an alias of Chart.helpers.canvas.clear', function() {
				expect(Chart.helpers.clear).toBeDefined();
				expect(Chart.helpers.clear).toBe(Chart.helpers.canvas.clear);
			});
		});

		describe('Chart.helpers.getValueOrDefault', function() {
			it('should be defined and an alias of Chart.helpers.valueOrDefault', function() {
				expect(Chart.helpers.getValueOrDefault).toBeDefined();
				expect(Chart.helpers.getValueOrDefault).toBe(Chart.helpers.valueOrDefault);
			});
		});

		describe('Chart.helpers.getValueAtIndexOrDefault', function() {
			it('should be defined and an alias of Chart.helpers.valueAtIndexOrDefault', function() {
				expect(Chart.helpers.getValueAtIndexOrDefault).toBeDefined();
				expect(Chart.helpers.getValueAtIndexOrDefault).toBe(Chart.helpers.valueAtIndexOrDefault);
			});
		});

		describe('Chart.helpers.easingEffects', function() {
			it('should be defined and an alias of Chart.helpers.easing.effects', function() {
				expect(Chart.helpers.easingEffects).toBeDefined();
				expect(Chart.helpers.easingEffects).toBe(Chart.helpers.easing.effects);
			});
		});

		describe('Chart.helpers.drawRoundedRectangle', function() {
			it('should be defined and a function', function() {
				expect(Chart.helpers.drawRoundedRectangle).toBeDefined();
				expect(typeof Chart.helpers.drawRoundedRectangle).toBe('function');
			});
			it('should call Chart.helpers.canvas.roundedRect', function() {
				var ctx = window.createMockContext();
				spyOn(Chart.helpers.canvas, 'roundedRect');

				Chart.helpers.drawRoundedRectangle(ctx, 10, 20, 30, 40, 5);

				var calls = ctx.getCalls();
				expect(calls[0]).toEqual({name: 'beginPath', args: []});
				expect(Chart.helpers.canvas.roundedRect).toHaveBeenCalledWith(ctx, 10, 20, 30, 40, 5);
			});
		});

		describe('Chart.helpers.addEvent', function() {
			it('should be defined and a function', function() {
				expect(Chart.helpers.addEvent).toBeDefined();
				expect(typeof Chart.helpers.addEvent).toBe('function');
			});
			it('should correctly add event listener', function() {
				var listener = jasmine.createSpy('spy');
				Chart.helpers.addEvent(window, 'test', listener);
				window.dispatchEvent(new Event('test'));
				expect(listener).toHaveBeenCalled();
			});
		});

		describe('Chart.helpers.removeEvent', function() {
			it('should be defined and a function', function() {
				expect(Chart.helpers.removeEvent).toBeDefined();
				expect(typeof Chart.helpers.removeEvent).toBe('function');
			});
			it('should correctly remove event listener', function() {
				var listener = jasmine.createSpy('spy');
				Chart.helpers.addEvent(window, 'test', listener);
				Chart.helpers.removeEvent(window, 'test', listener);
				window.dispatchEvent(new Event('test'));
				expect(listener).not.toHaveBeenCalled();
			});
		});
	});

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
				expect(proxy.aspectRatio).toBe(140 / 320);
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

		describe('Chart.helpers.callCallback', function() {
			it('should be defined and an alias of Chart.helpers.callback', function() {
				expect(Chart.helpers.callCallback).toBeDefined();
				expect(Chart.helpers.callCallback).toBe(Chart.helpers.callback);
			});
		});

		describe('Time Axis: unitStepSize option', function() {
			it('should use the stepSize property', function() {
				var chart = window.acquireChart({
					type: 'line',
					data: {
						labels: ['2015-01-01T20:00:00', '2015-01-01T21:00:00'],
					},
					options: {
						scales: {
							xAxes: [{
								id: 'time',
								type: 'time',
								bounds: 'ticks',
								time: {
									unit: 'hour',
									unitStepSize: 2
								}
							}]
						}
					}
				});

				var ticks = chart.scales.time.getTicks().map(function(tick) {
					return tick.label;
				});

				expect(ticks).toEqual(['8PM', '10PM']);
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

				var override = Chart.layouts.update;
				Chart.layouts.update = function() {
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

	describe('Version 2.4.0', function() {
		describe('x-axis mode', function() {
			it ('behaves like index mode with intersect: false', function() {
				var data = {
					datasets: [{
						label: 'Dataset 1',
						data: [10, 20, 30],
						pointHoverBorderColor: 'rgb(255, 0, 0)',
						pointHoverBackgroundColor: 'rgb(0, 255, 0)'
					}, {
						label: 'Dataset 2',
						data: [40, 40, 40],
						pointHoverBorderColor: 'rgb(0, 0, 255)',
						pointHoverBackgroundColor: 'rgb(0, 255, 255)'
					}],
					labels: ['Point 1', 'Point 2', 'Point 3']
				};

				var chart = window.acquireChart({
					type: 'line',
					data: data
				});
				var meta0 = chart.getDatasetMeta(0);
				var meta1 = chart.getDatasetMeta(1);

				var evt = {
					type: 'click',
					chart: chart,
					native: true, // needed otherwise things its a DOM event
					x: 0,
					y: 0
				};

				var elements = Chart.Interaction.modes['x-axis'](chart, evt);
				expect(elements).toEqual([meta0.data[0], meta1.data[0]]);
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

		describe('Chart.Legend', function() {
			it('should be defined and an instance of Chart.Element', function() {
				var legend = new Chart.Legend({});
				expect(Chart.Legend).toBeDefined();
				expect(legend).not.toBe(undefined);
				expect(legend instanceof Chart.Element).toBeTruthy();
			});
		});

		describe('Chart.Title', function() {
			it('should be defined and an instance of Chart.Element', function() {
				var title = new Chart.Title({});
				expect(Chart.Title).toBeDefined();
				expect(title).not.toBe(undefined);
				expect(title instanceof Chart.Element).toBeTruthy();
			});
		});
	});
});
