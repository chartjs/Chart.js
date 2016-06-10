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

	it ('Should allow notifying plugins', function() {
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
});
