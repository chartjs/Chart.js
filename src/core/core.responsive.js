(function() {

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart,
		helpers = Chart.helpers;


	// Attach global event to resize each chart instance when the browser resizes
	helpers.addEvent(window, "resize", (function() {
		// Basic debounce of resize function so it doesn't hurt performance when resizing browser.
		var timeout;
		return function() {
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				helpers.each(Chart.instances, function(instance) {
					// If the responsive flag is set in the chart instance config
					// Cascade the resize event down to the chart.
					if (instance.options.responsive) {
						instance.resize();
					}
				});
			}, 16);
		};
	})());

}).call(this);
