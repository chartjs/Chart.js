describe('Chart.plugins', function() {
	beforeEach(function() {
		this._plugins = Chart.plugins.getAll();
		Chart.plugins.clear();
	});

	afterEach(function() {
		Chart.plugins.clear();
		Chart.plugins.register(this._plugins);
		delete this._plugins;
	});

	describe('Chart.plugins.register', function() {
		it('should register a plugin', function() {
			Chart.plugins.register({});
			expect(Chart.plugins.count()).toBe(1);
			Chart.plugins.register({});
			expect(Chart.plugins.count()).toBe(2);
		});

		it('should register an array of plugins', function() {
			Chart.plugins.register([{}, {}, {}]);
			expect(Chart.plugins.count()).toBe(3);
		});

		it('should succeed to register an already registered plugin', function() {
			var plugin = {};
			Chart.plugins.register(plugin);
			expect(Chart.plugins.count()).toBe(1);
			Chart.plugins.register(plugin);
			expect(Chart.plugins.count()).toBe(1);
			Chart.plugins.register([{}, plugin, plugin]);
			expect(Chart.plugins.count()).toBe(2);
		});
	});

	describe('Chart.plugins.unregister', function() {
		it('should unregister a plugin', function() {
			var plugin = {};
			Chart.plugins.register(plugin);
			expect(Chart.plugins.count()).toBe(1);
			Chart.plugins.unregister(plugin);
			expect(Chart.plugins.count()).toBe(0);
		});

		it('should unregister an array of plugins', function() {
			var plugins = [{}, {}, {}];
			Chart.plugins.register(plugins);
			expect(Chart.plugins.count()).toBe(3);
			Chart.plugins.unregister(plugins.slice(0, 2));
			expect(Chart.plugins.count()).toBe(1);
		});

		it('should succeed to unregister a plugin not registered', function() {
			var plugin = {};
			Chart.plugins.register(plugin);
			expect(Chart.plugins.count()).toBe(1);
			Chart.plugins.unregister({});
			expect(Chart.plugins.count()).toBe(1);
			Chart.plugins.unregister([{}, plugin]);
			expect(Chart.plugins.count()).toBe(0);
		});
	});

	describe('Chart.plugins.notify', function() {
		it('should call inline plugins with arguments', function() {
			var plugin = {hook: function() {}};
			var chart = window.acquireChart({
				plugins: [plugin]
			});

			spyOn(plugin, 'hook');

			Chart.plugins.notify(chart, 'hook', 42);
			expect(plugin.hook.calls.count()).toBe(1);
			expect(plugin.hook.calls.first().args[0]).toBe(chart);
			expect(plugin.hook.calls.first().args[1]).toBe(42);
			expect(plugin.hook.calls.first().args[2]).toEqual({});
		});

		it('should call global plugins with arguments', function() {
			var plugin = {hook: function() {}};
			var chart = window.acquireChart({});

			spyOn(plugin, 'hook');

			Chart.plugins.register(plugin);
			Chart.plugins.notify(chart, 'hook', 42);
			expect(plugin.hook.calls.count()).toBe(1);
			expect(plugin.hook.calls.first().args[0]).toBe(chart);
			expect(plugin.hook.calls.first().args[1]).toBe(42);
			expect(plugin.hook.calls.first().args[2]).toEqual({});
		});

		it('should call plugin only once even if registered multiple times', function() {
			var plugin = {hook: function() {}};
			var chart = window.acquireChart({
				plugins: [plugin, plugin]
			});

			spyOn(plugin, 'hook');

			Chart.plugins.register([plugin, plugin]);
			Chart.plugins.notify(chart, 'hook');
			expect(plugin.hook.calls.count()).toBe(1);
		});

		it('should call plugins in the correct order (global first)', function() {
			var results = [];
			var chart = window.acquireChart({
				plugins: [{
					hook: function() {
						results.push(1);
					}
				}, {
					hook: function() {
						results.push(2);
					}
				}, {
					hook: function() {
						results.push(3);
					}
				}]
			});

			Chart.plugins.register([{
				hook: function() {
					results.push(4);
				}
			}, {
				hook: function() {
					results.push(5);
				}
			}, {
				hook: function() {
					results.push(6);
				}
			}]);

			var ret = Chart.plugins.notify(chart, 'hook');
			expect(ret).toBeTruthy();
			expect(results).toEqual([4, 5, 6, 1, 2, 3]);
		});

		it('should return TRUE if no plugin explicitly returns FALSE', function() {
			var chart = window.acquireChart({
				plugins: [{
					hook: function() {}
				}, {
					hook: function() {
						return null;
					}
				}, {
					hook: function() {
						return 0;
					}
				}, {
					hook: function() {
						return true;
					}
				}, {
					hook: function() {
						return 1;
					}
				}]
			});

			var plugins = chart.config.plugins;
			plugins.forEach(function(plugin) {
				spyOn(plugin, 'hook').and.callThrough();
			});

			var ret = Chart.plugins.notify(chart, 'hook');
			expect(ret).toBeTruthy();
			plugins.forEach(function(plugin) {
				expect(plugin.hook).toHaveBeenCalled();
			});
		});

		it('should return FALSE if any plugin explicitly returns FALSE', function() {
			var chart = window.acquireChart({
				plugins: [{
					hook: function() {}
				}, {
					hook: function() {
						return null;
					}
				}, {
					hook: function() {
						return false;
					}
				}, {
					hook: function() {
						return 42;
					}
				}, {
					hook: function() {
						return 'bar';
					}
				}]
			});

			var plugins = chart.config.plugins;
			plugins.forEach(function(plugin) {
				spyOn(plugin, 'hook').and.callThrough();
			});

			var ret = Chart.plugins.notify(chart, 'hook');
			expect(ret).toBeFalsy();
			expect(plugins[0].hook).toHaveBeenCalled();
			expect(plugins[1].hook).toHaveBeenCalled();
			expect(plugins[2].hook).toHaveBeenCalled();
			expect(plugins[3].hook).not.toHaveBeenCalled();
			expect(plugins[4].hook).not.toHaveBeenCalled();
		});
	});

	describe('config.options.plugins', function() {
		it('should call plugins with options at last argument', function() {
			var plugin = {id: 'foo', hook: function() {}};
			var chart = window.acquireChart({
				options: {
					plugins: {
						foo: {a: '123'},
					}
				}
			});

			spyOn(plugin, 'hook');

			Chart.plugins.register(plugin);
			Chart.plugins.notify(chart, 'hook');
			Chart.plugins.notify(chart, 'hook', ['bla']);
			Chart.plugins.notify(chart, 'hook', ['bla', 42]);

			expect(plugin.hook.calls.count()).toBe(3);
			expect(plugin.hook.calls.argsFor(0)[1]).toEqual({a: '123'});
			expect(plugin.hook.calls.argsFor(1)[2]).toEqual({a: '123'});
			expect(plugin.hook.calls.argsFor(2)[3]).toEqual({a: '123'});
		});

		it('should call plugins with options associated to their identifier', function() {
			var plugins = {
				a: {id: 'a', hook: function() {}},
				b: {id: 'b', hook: function() {}},
				c: {id: 'c', hook: function() {}}
			};

			Chart.plugins.register(plugins.a);

			var chart = window.acquireChart({
				plugins: [plugins.b, plugins.c],
				options: {
					plugins: {
						a: {a: '123'},
						b: {b: '456'},
						c: {c: '789'}
					}
				}
			});

			spyOn(plugins.a, 'hook');
			spyOn(plugins.b, 'hook');
			spyOn(plugins.c, 'hook');

			Chart.plugins.notify(chart, 'hook');

			expect(plugins.a.hook).toHaveBeenCalled();
			expect(plugins.b.hook).toHaveBeenCalled();
			expect(plugins.c.hook).toHaveBeenCalled();
			expect(plugins.a.hook.calls.first().args[1]).toEqual({a: '123'});
			expect(plugins.b.hook.calls.first().args[1]).toEqual({b: '456'});
			expect(plugins.c.hook.calls.first().args[1]).toEqual({c: '789'});
		});

		it('should not called plugins when config.options.plugins.{id} is FALSE', function() {
			var plugins = {
				a: {id: 'a', hook: function() {}},
				b: {id: 'b', hook: function() {}},
				c: {id: 'c', hook: function() {}}
			};

			Chart.plugins.register(plugins.a);

			var chart = window.acquireChart({
				plugins: [plugins.b, plugins.c],
				options: {
					plugins: {
						a: false,
						b: false
					}
				}
			});

			spyOn(plugins.a, 'hook');
			spyOn(plugins.b, 'hook');
			spyOn(plugins.c, 'hook');

			Chart.plugins.notify(chart, 'hook');

			expect(plugins.a.hook).not.toHaveBeenCalled();
			expect(plugins.b.hook).not.toHaveBeenCalled();
			expect(plugins.c.hook).toHaveBeenCalled();
		});

		it('should call plugins with default options when plugin options is TRUE', function() {
			var plugin = {id: 'a', hook: function() {}};

			Chart.defaults.global.plugins.a = {a: 42};
			Chart.plugins.register(plugin);

			var chart = window.acquireChart({
				options: {
					plugins: {
						a: true
					}
				}
			});

			spyOn(plugin, 'hook');

			Chart.plugins.notify(chart, 'hook');

			expect(plugin.hook).toHaveBeenCalled();
			expect(plugin.hook.calls.first().args[1]).toEqual({a: 42});

			delete Chart.defaults.global.plugins.a;
		});


		it('should call plugins with default options if plugin config options is undefined', function() {
			var plugin = {id: 'a', hook: function() {}};

			Chart.defaults.global.plugins.a = {a: 'foobar'};
			Chart.plugins.register(plugin);
			spyOn(plugin, 'hook');

			var chart = window.acquireChart();

			Chart.plugins.notify(chart, 'hook');

			expect(plugin.hook).toHaveBeenCalled();
			expect(plugin.hook.calls.first().args[1]).toEqual({a: 'foobar'});

			delete Chart.defaults.global.plugins.a;
		});

		// https://github.com/chartjs/Chart.js/issues/5111#issuecomment-355934167
		it('should invalidate cache when update plugin options', function() {
			var plugin = {id: 'a', hook: function() {}};
			var chart = window.acquireChart({
				plugins: [plugin],
				options: {
					plugins: {
						a: {
							foo: 'foo'
						}
					}
				},
			});

			spyOn(plugin, 'hook');

			Chart.plugins.notify(chart, 'hook');

			expect(plugin.hook).toHaveBeenCalled();
			expect(plugin.hook.calls.first().args[1]).toEqual({foo: 'foo'});

			chart.options.plugins.a = {bar: 'bar'};
			chart.update();

			plugin.hook.calls.reset();
			Chart.plugins.notify(chart, 'hook');

			expect(plugin.hook).toHaveBeenCalled();
			expect(plugin.hook.calls.first().args[1]).toEqual({bar: 'bar'});
		});
	});
});
