describe('Chart.plugins', function() {
	describe('Chart.notifyPlugins', function() {
		it('should call inline plugins with arguments', function() {
			var plugin = {hook: function() {}};
			var chart = window.acquireChart({
				plugins: [plugin]
			});
			var args = {value: 42};

			spyOn(plugin, 'hook');

			chart.notifyPlugins('hook', args);
			expect(plugin.hook.calls.count()).toBe(1);
			expect(plugin.hook.calls.first().args[0]).toBe(chart);
			expect(plugin.hook.calls.first().args[1]).toBe(args);
			expect(plugin.hook.calls.first().args[2]).toEqual({});
		});

		it('should call global plugins with arguments', function() {
			var plugin = {id: 'a', hook: function() {}};
			var chart = window.acquireChart({});
			var args = {value: 42};

			spyOn(plugin, 'hook');

			Chart.register(plugin);
			chart.notifyPlugins('hook', args);
			expect(plugin.hook.calls.count()).toBe(1);
			expect(plugin.hook.calls.first().args[0]).toBe(chart);
			expect(plugin.hook.calls.first().args[1]).toBe(args);
			expect(plugin.hook.calls.first().args[2]).toEqual({});
			Chart.unregister(plugin);
		});

		it('should call plugin only once even if registered multiple times', function() {
			var plugin = {id: 'test', hook: function() {}};
			var chart = window.acquireChart({
				plugins: [plugin, plugin]
			});

			spyOn(plugin, 'hook');

			Chart.register([plugin, plugin]);
			chart.notifyPlugins('hook');
			expect(plugin.hook.calls.count()).toBe(1);
			Chart.unregister(plugin);
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

			var plugins = [{
				id: 'a',
				hook: function() {
					results.push(4);
				}
			}, {
				id: 'b',
				hook: function() {
					results.push(5);
				}
			}, {
				id: 'c',
				hook: function() {
					results.push(6);
				}
			}];
			Chart.register(plugins);

			var ret = chart.notifyPlugins('hook');
			expect(ret).toBeTruthy();
			expect(results).toEqual([4, 5, 6, 1, 2, 3]);
			Chart.unregister(plugins);
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

			var ret = chart.notifyPlugins('hook');
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

			var ret = chart.notifyPlugins('hook', {cancelable: true});
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

			Chart.register(plugin);
			chart.notifyPlugins('hook');
			chart.notifyPlugins('hook', {arg1: 'bla'});
			chart.notifyPlugins('hook', {arg1: 'bla', arg2: 42});

			expect(plugin.hook.calls.count()).toBe(3);
			expect(plugin.hook.calls.argsFor(0)[2]).toEqual({a: '123'});
			expect(plugin.hook.calls.argsFor(1)[2]).toEqual({a: '123'});
			expect(plugin.hook.calls.argsFor(2)[2]).toEqual({a: '123'});

			Chart.unregister(plugin);
		});

		it('should call plugins with options associated to their identifier', function() {
			var plugins = {
				a: {id: 'a', hook: function() {}},
				b: {id: 'b', hook: function() {}},
				c: {id: 'c', hook: function() {}}
			};

			Chart.register(plugins.a);

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

			chart.notifyPlugins('hook');

			expect(plugins.a.hook).toHaveBeenCalled();
			expect(plugins.b.hook).toHaveBeenCalled();
			expect(plugins.c.hook).toHaveBeenCalled();
			expect(plugins.a.hook.calls.first().args[2]).toEqual({a: '123'});
			expect(plugins.b.hook.calls.first().args[2]).toEqual({b: '456'});
			expect(plugins.c.hook.calls.first().args[2]).toEqual({c: '789'});

			Chart.unregister(plugins.a);
		});

		it('should not called plugins when config.options.plugins.{id} is FALSE', function() {
			var plugins = {
				a: {id: 'a', hook: function() {}},
				b: {id: 'b', hook: function() {}},
				c: {id: 'c', hook: function() {}}
			};

			Chart.register(plugins.a);

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

			chart.notifyPlugins('hook');

			expect(plugins.a.hook).not.toHaveBeenCalled();
			expect(plugins.b.hook).not.toHaveBeenCalled();
			expect(plugins.c.hook).toHaveBeenCalled();

			Chart.unregister(plugins.a);
		});

		it('should call plugins with default options when plugin options is TRUE', function() {
			var plugin = {id: 'a', hook: function() {}, defaults: {a: 42}};

			Chart.register(plugin);

			var chart = window.acquireChart({
				options: {
					plugins: {
						a: true
					}
				}
			});

			spyOn(plugin, 'hook');

			chart.notifyPlugins('hook');

			expect(plugin.hook).toHaveBeenCalled();
			expect(plugin.hook.calls.first().args[2]).toEqual({a: 42});

			Chart.unregister(plugin);
		});


		it('should call plugins with default options if plugin config options is undefined', function() {
			var plugin = {id: 'a', hook: function() {}, defaults: {a: 'foobar'}};

			Chart.register(plugin);
			spyOn(plugin, 'hook');

			var chart = window.acquireChart();

			chart.notifyPlugins('hook');

			expect(plugin.hook).toHaveBeenCalled();
			expect(plugin.hook.calls.first().args[2]).toEqual({a: 'foobar'});

			Chart.unregister(plugin);
		});

		// https://github.com/chartjs/Chart.js/issues/5111#issuecomment-355934167
		it('should update plugin options', function() {
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

			chart.notifyPlugins('hook');

			expect(plugin.hook).toHaveBeenCalled();
			expect(plugin.hook.calls.first().args[2]).toEqual({foo: 'foo'});

			chart.options.plugins.a = {bar: 'bar'};
			chart.update();

			plugin.hook.calls.reset();
			chart.notifyPlugins('hook');

			expect(plugin.hook).toHaveBeenCalled();
			expect(plugin.hook.calls.first().args[2]).toEqual({bar: 'bar'});
		});

		it('should disable all plugins', function() {
			var plugin = {id: 'a', hook: function() {}};
			var chart = window.acquireChart({
				plugins: [plugin],
				options: {
					plugins: false
				}
			});

			spyOn(plugin, 'hook');

			chart.notifyPlugins('hook');

			expect(plugin.hook).not.toHaveBeenCalled();
		});

		it('should not restart plugins when a double register occurs', function() {
			var results = [];
			var chart = window.acquireChart({
				plugins: [{
					start: function() {
						results.push(1);
					}
				}]
			});

			Chart.register({id: 'abc', hook: function() {}});
			Chart.register({id: 'def', hook: function() {}});

			chart.update();

			// The plugin on the chart should only be started once
			expect(results).toEqual([1]);
		});
	});
});
