"use strict";

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	var noop = helpers.noop;

	/**
	 * The plugin service singleton
	 * @namespace Chart.plugins
	 */
	Chart.plugins = {
		_plugins: [],

		// Register a new plugin
		register: function(plugin) {
			var p = this._plugins;
			if (p.indexOf(plugin) === -1) {
				p.push(plugin);
			}
		},

		// Remove a registered plugin
		remove: function(plugin) {
			var p = this._plugins;
			var idx = p.indexOf(plugin);
			if (idx !== -1) {
				p.splice(idx, 1);
			}
		},

		/**
		 * Calls registered plugins on the specified method, with the given args. This
		 * method immediately returns as soon as a plugin explicitly returns false.
		 * @returns {Boolean} false if any of the plugins return false, else returns true.
		 */
		notify: function(method, args, scope) {
			helpers.each(this._plugins, function(plugin) {
				if (plugin[method] && typeof plugin[method] === 'function') {
					plugin[method].apply(scope, args);
				}
			}, scope);
		}
	};

	Chart.PluginBase = Chart.Element.extend({
		// Plugin methods. All functions are passed the chart instance

		// Called at start of chart init
		beforeInit: noop,

		// Called at end of chart init
		afterInit: noop,

		// Called at start of update
		beforeUpdate: noop,

		// Called at end of update
		afterUpdate: noop,

		// Called at start of draw
		beforeDraw: noop,

		// Called at end of draw
		afterDraw: noop,

		// Called during destroy
		destroy: noop
	});

	/**
	 * Provided for backward compatibility, use Chart.plugins instead
	 * @namespace Chart.pluginService
	 * @deprecated since version 2.1.5
	 * @todo remove me at version 3
	 */
	Chart.pluginService = Chart.plugins;
};
