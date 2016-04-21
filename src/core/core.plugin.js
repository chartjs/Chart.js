"use strict";

module.exports = function(Chart) {
	var helpers = Chart.helpers;

	// Plugins are stored here
	Chart.plugins = [];
	Chart.pluginService = {
		// Register a new plugin
		register: function(plugin) {
			if (Chart.plugins.indexOf(plugin) === -1) {
				Chart.plugins.push(plugin);
			}
		},

		// Remove a registered plugin
		remove: function(plugin) {
			var idx = Chart.plugins.indexOf(plugin);
			if (idx !== -1) {
				Chart.plugins.splice(idx, 1);
			}
		},

		// Iterate over all plugins
		notifyPlugins: function(method, args, scope) {
			helpers.each(Chart.plugins, function(plugin) {
				if (plugin[method] && typeof plugin[method] === 'function') {
					plugin[method].apply(scope, args);
				}
			}, scope);
		}
	};

	Chart.PluginBase = Chart.Element.extend({
		// Plugin methods. All functions are passed the chart instance

		// Called at start of chart init
		beforeInit: helpers.noop,

		// Called at end of chart init
		afterInit: helpers.noop,

		// Called at start of update
		beforeUpdate: helpers.noop,

		// Called at end of update
		afterUpdate: helpers.noop,

		// Called at start of draw
		beforeDraw: helpers.noop,

		// Called at end of draw
		afterDraw: helpers.noop,

		// Called during destroy
		destroy: helpers.noop,
	});
};
