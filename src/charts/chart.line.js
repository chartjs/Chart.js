(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
		hover: {
			mode: "label"
		},

		scales: {
			xAxes: [{
				type: "category",
			}],
			yAxes: [{
				type: "linear",
			}],
		},
	};


	Chart.Type.extend({
		name: "Line",
		defaults: defaultConfig,
		initialize: function() {

			this.elementController = new Chart.RectangularElementController(this);
			this.canvasController = new Chart.RectangularCanvasController(this, this.elementController);

			// Create a new line and its points for each dataset and piece of data
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				this.elementController.addLine(dataset, datasetIndex);
				
				helpers.each(dataset.data, function(dataPoint, index) {
					this.elementController.addPoint(dataset, datasetIndex, index);
				}, this);

				// The line chart onlty supports a single x axis because the x axis is always a dataset axis
				if (!dataset.xAxisID) {
					dataset.xAxisID = this.options.scales.xAxes[0].id;
				}

				if (!dataset.yAxisID) {
					dataset.yAxisID = this.options.scales.yAxes[0].id;
				}
			}, this);

			this.canvasController.initialize();
		},
		draw: function(ease) {

			var easingDecimal = ease || 1;
			this.clear();

			// Draw all the scales
			helpers.each(this.scales, function(scale) {
				scale.draw(this.chartArea);
			}, this);

			// reverse for-loop for proper stacking
			for (var i = this.data.datasets.length - 1; i >= 0; i--) {

				var dataset = this.data.datasets[i];

				// Transition Point Locations
				helpers.each(dataset.metaData, function(point, index) {
					point.transition(easingDecimal);
				}, this);

				// Transition and Draw the line
				dataset.metaDataset.transition(easingDecimal).draw();

				// Draw the points
				helpers.each(dataset.metaData, function(point) {
					point.draw();
				});
			}

			// Finally draw the tooltip
			this.tooltip.transition(easingDecimal).draw();
		},
	});
}).call(this);
