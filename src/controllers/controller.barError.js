(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.barError = {
		hover: {
			mode: "label"
		},

		scales: {
			xAxes: [{
				type: "category",

				// Specific to Bar Controller
				categoryPercentage: 0.8,
				barPercentage: 0.9,

				// grid line settings
				gridLines: {
					offsetGridLines: true,
				},
			}],
			yAxes: [{
				type: "linear",
			}],
		},
	};

	Chart.controllers.barError = Chart.controllers.bar.extend({
		initialize: function(chart, datasetIndex) {
			Chart.controllers.bar.prototype.initialize.call(this, chart, datasetIndex);

			// Use this to indicate that this is a bar dataset.
			this.getDataset().bar = true;
		},

		draw: function(ease) {
			Chart.controllers.bar.prototype.draw.call(this, ease);

			return;
		}

	});
}).call(this);
