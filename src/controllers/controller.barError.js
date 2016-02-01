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
					this.updateErrorBar(errorBar, rectangle, index, reset, numBars);
				}
			}, this);
		},

		updateErrorBar: function(errorBar, rectangle, index, reset, numBars) {

			var xScale = this.getScaleForId(this.getDataset().xAxisID);
			var yScale = this.getScaleForId(this.getDataset().yAxisID);

			console.log(rectangle);

			helpers.extend(errorBar, {
				// Utility
				_chart: this.chart.chart,
				_xScale: xScale,
				_yScale: yScale,
				_datasetIndex: this.index,
				_index: index,

				_model: {
					x: this.calculateBarX(index, this.index),
					yTop: this.calculateErrorBarTop(index, this.index),
					yBottom: this.calculateErrorBarBottom(index, this.index),
					capWidth: 0.75 * rectangle._view.width,
					direction: 'both',
					strokeColor: '#000',
					strokeWidth: 1
				}

			});
			errorBar.pivot();
		},

		calculateErrorBarTop: function(index, datasetIndex) {
			var value = this.getDataset().data[index] + this.getDataset().error[index],
				yScale = this.getScaleForId(this.getDataset().yAxisID);

			//TODO: still need to worry about stacked bar chart.
			return yScale.getPixelForValue(value);
		},

		calculateErrorBarBottom: function(index, datasetIndex) {
			var value = this.getDataset().data[index] - this.getDataset().error[index],
				yScale = this.getScaleForId(this.getDataset().yAxisID);

			//TODO: still need to worry about stacked bar chart.
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
