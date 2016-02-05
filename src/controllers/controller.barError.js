(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.barError = helpers.extend(Chart.defaults.bar, {
		errorDir: "both",
		errorStrokeWidth: 1,
		errorCapWidth: 0.75,
		errorColor: null
	});

	Chart.controllers.barError = Chart.controllers.bar.extend({
		initialize: function(chart, datasetIndex) {
			Chart.controllers.bar.prototype.initialize.apply(this, arguments);
		},

		addElements: function() {
			//call Super
			Chart.controllers.bar.prototype.addElements.call(this);

			if (this.getDataset().error) {
				this.getDataset().metaError = new Array(this.getDataset().error.length);
			} else {
				this.getDataset().metaError = new Array();
			}

			helpers.each(this.getDataset().error, function(value, index) {
				this.getDataset().metaError[index] = new Chart.elements.ErrorBar({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index
				});
			}, this);
		},

		addElementAndReset: function(index) {
			Chart.controllers.bar.prototype.addElementAndReset.call(this, index);
			var rectangle = this.getDataset().metaData[index];

			if (this.getDataset().error && this.getDataset().error[index]) {

				var errorBar = new Chart.elements.ErrorBar({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index
				});

				var numBars = this.getBarCount();

				this.updateErrorBar(errorBar, rectangle, index, true, numBars);
				this.getDataset().metaError.splice(index, 0, errorBar);
			}

		},

		update: function update(reset) {
			var numBars = this.getBarCount();

			//ensure that there are not more error bars than data
			if (this.getDataset().error) {
				this.getDataset().error = this.getDataset().error.slice(0, this.getDataset().metaData.length);
			}
			if (this.getDataset().metaError) {
				this.getDataset().metaError = this.getDataset().metaError.slice(0, this.getDataset().metaData.length);
			}

			helpers.each(this.getDataset().metaData, function(rectangle, index) {
				var errorBar;
				//update the bar
				this.updateElement(rectangle, index, reset, numBars);

				if (this.getDataset().error) {
					if (index in this.getDataset().metaError) {
						errorBar = this.getDataset().metaError[index];
						this.updateErrorBar(errorBar, rectangle, index, reset, numBars);
					}
				}

			}, this);
		},

		updateErrorBar: function(errorBar, rectangle, index, reset, numBars) {

			var xScale = this.getScaleForId(this.getDataset().xAxisID);
			var yScale = this.getScaleForId(this.getDataset().yAxisID);

			//TODO: abstract out so these can be global options
			var errorDir = this.getDataset().errorDir || Chart.defaults.barError.errorDir;
			var errorCapWidth = this.getDataset().errorCapWidth || Chart.defaults.barError.errorCapWidth;
			var errorStrokeColor = this.getDataset().errorColor || rectangle._model.backgroundColor;
			var errorStrokeWidth = this.getDataset().errorStrokeWidth || Chart.defaults.barError.errorStrokeWidth;

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

					// Appearance
					capWidth: rectangle._model.width * errorCapWidth,
					direction: errorDir,
					strokeColor: errorStrokeColor,
					strokeWidth: errorStrokeWidth
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
