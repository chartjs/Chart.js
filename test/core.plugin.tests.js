describe('Chart.plugins', function() {
	var oldPlugins;

	beforeAll(function() {
		oldPlugins = Chart.plugins.getAll();
	});

	afterAll(function() {
		Chart.plugins.register(oldPlugins);
	});

	beforeEach(function() {
		Chart.plugins.clear();
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
		it('should call plugins with arguments', function() {
			var myplugin = {
				count: 0,
				trigger: function(chart) {
					myplugin.count = chart.count;
				}
			};

			Chart.plugins.register(myplugin);
			Chart.plugins.notify('trigger', [{ count: 10 }]);
			expect(myplugin.count).toBe(10);
		});

		it('should return TRUE if no plugin explicitly returns FALSE', function() {
			Chart.plugins.register({ check: function() {} });
			Chart.plugins.register({ check: function() { return; } });
			Chart.plugins.register({ check: function() { return null; } });
			Chart.plugins.register({ check: function() { return 42 } });
			var res = Chart.plugins.notify('check');
			expect(res).toBeTruthy();
		});

		it('should return FALSE if no plugin explicitly returns FALSE', function() {
			Chart.plugins.register({ check: function() {} });
			Chart.plugins.register({ check: function() { return; } });
			Chart.plugins.register({ check: function() { return false; } });
			Chart.plugins.register({ check: function() { return 42 } });
			var res = Chart.plugins.notify('check');
			expect(res).toBeFalsy();
		});
	});
});
