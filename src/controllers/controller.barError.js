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
			Chart.controllers.bar.prototype.initialize.apply(this, arguments);
		},


		addElements: function() {
			//call Super
			Chart.controllers.bar.prototype.addElements.call(this);
			this.getDataset().metaError = new Array(this.getDataset().error.length);
			helpers.each(this.getDataset().error, function(value, index) {
				this.getDataset().metaError[index] = new Chart.elements.ErrorBar({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index
				});
			}, this);
		},

		update: function update(reset) {
			var numBars = this.getBarCount();

			helpers.each(this.getDataset().metaData, function(rectangle, index) {
				var errorBar;
				//update the bar
				this.updateElement(rectangle, index, reset, numBars);
				if (index in this.getDataset().metaError) {
					errorBar = this.getDataset().metaError[index];
					this.updateErrorBar(errorBar, index, reset, numBars);
				}
			}, this);
		},

		updateErrorBar: function(errorBar, index, reset, numBars) {
			console.log(this.calculateBarX(index, this.index));
			console.log(this.calculateErrorBarTop(index, this.index));
		},

		calculateErrorBarTop: function(index, datasetIndex) {
			var value = this.getDataset().data[index] + this.getDataset.error[index],
				yScale = this.getScaleForID(this.getDataset().yAxisID);

			//still need to worry about stacked bar chart.
			return yScale.getPixelForValue(value);
		},

		calculateErrorBarBottom: function(index, datasetIndex) {
			var value = this.getDataset().data[index] - this.getDataset.error[index],
				yScale = this.getScaleForID(this.getDataset().yAxisID);

			//still need to worry about stacked bar chart.
			return yScale.getPixelForValue(value);
		},

		draw: function(ease) {
			Chart.controllers.bar.prototype.draw.call(this, ease);
			var easingDecimal = ease || 1;
			helpers.each(this.getDataset().metaError, function(errorBar, index) {
				var e = this.getDataset().error[index];
				if (e !== null && e !== undefined && !isNaN(e)) {
					errorBar.transition(easingDecimal).draw();
				}
			}, this);

			return;
		}

	});
}).call(this);
