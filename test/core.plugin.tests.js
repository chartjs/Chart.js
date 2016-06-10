// Plugin tests
describe('Test the plugin system', function() {
	var oldPlugins;

	beforeAll(function() {
		oldPlugins = Chart.plugins._plugins;
	});

	afterAll(function() {
		Chart.plugins._plugins = oldPlugins;
	});

	beforeEach(function() {
		Chart.plugins._plugins = [];
	});

	it ('Should register plugins', function() {
		var myplugin = {};
		Chart.plugins.register(myplugin);
		expect(Chart.plugins._plugins.length).toBe(1);

		// Should only add plugin once
		Chart.plugins.register(myplugin);
		expect(Chart.plugins._plugins.length).toBe(1);
	});

	it ('Should allow unregistering plugins', function() {
		var myplugin = {};
		Chart.plugins.register(myplugin);
		expect(Chart.plugins._plugins.length).toBe(1);

		// Should only add plugin once
		Chart.plugins.remove(myplugin);
		expect(Chart.plugins._plugins.length).toBe(0);

		// Removing a plugin that doesn't exist should not error
		Chart.plugins.remove(myplugin);
	});

	describe('Chart.plugins.notify', function() {
		it ('should call plugins with arguments', function() {
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
