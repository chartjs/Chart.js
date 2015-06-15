(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;


	Chart.defaults.bar = {
		hover: {
			mode: "label"
		},

		scales: {
			xAxes: [{
				type: "category",
				categorySpacing: 10,
				spacing: 1,

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

	// Chart.Type.extend({
	// 	name: "Bar",
	// 	defaults: defaultConfig,
	// 	initialize: function() {
	// 		this.elementController = new Chart.RectangularElementController(this);
	// 		this.canvasController = new Chart.RectangularCanvasController(this, this.elementController);

	// 		//Create a new bar for each piece of data
	// 		helpers.each(this.data.datasets, function(dataset, datasetIndex) {
	// 			helpers.each(dataset.data, function(dataPoint, index) {
	// 				this.elementController.addRectangle(dataset, datasetIndex, index);
	// 			}, this);

	// 			// The bar chart only supports a single x axis because the x axis is always a category axis
	// 			dataset.xAxisID = this.options.scales.xAxes[0].id;

	// 			if (!dataset.yAxisID) {
	// 				dataset.yAxisID = this.options.scales.yAxes[0].id;
	// 			}
	// 		}, this);

	// 		this.canvasController.initialize();
	// 	},
	// 	draw: function(ease) {

	// 		var easingDecimal = ease || 1;
	// 		this.clear();

	// 		// Draw all the scales
	// 		helpers.each(this.scales, function(scale) {
	// 			scale.draw(this.chartArea);
	// 		}, this);

	// 		//Draw all the bars for each dataset
	// 		this.eachElement(function(bar, index, datasetIndex) {
	// 			bar.transition(easingDecimal).draw();
	// 		}, this);

	// 		// Finally draw the tooltip
	// 		this.tooltip.transition(easingDecimal).draw();
	// 	},
	// });


}).call(this);
