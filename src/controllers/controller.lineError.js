(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.lineError = helpers.extend(Chart.defaults.line, {
		errorDir: "both",
		errorStrokeWidth: 1,
		errorCapWidth: 2.5,
		errorColor: null
	});

	Chart.controllers.lineError = Chart.controllers.line.extend({
		addElements: function() {
			//call Super
			Chart.controllers.line.prototype.addElements.call(this);

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
			Chart.controllers.line.prototype.addElementAndReset.call(this, index);
			var point = this.getDataset().metaData[index];

			if (this.getDataset().error && this.getDataset().error[index]) {

				var errorBar = new Chart.elements.ErrorBar({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index
				});

				this.updateErrorBar(errorBar, point, index, true);
				this.getDataset().metaError.splice(index, 0, errorBar);
			}
		},

		update: function update(reset) {
			Chart.controllers.line.prototype.update.call(this, reset);

			//ensure that there are not more error bars than data
			if (this.getDataset().error) {
				this.getDataset().error = this.getDataset().error.slice(0, this.getDataset().metaData.length);
			}
			if (this.getDataset().metaError) {
				this.getDataset().metaError = this.getDataset().metaError.slice(0, this.getDataset().metaData.length);
			}

			helpers.each(this.getDataset().metaData, function(point, index) {
				var errorBar;

				if (this.getDataset().error) {
					if (index in this.getDataset().metaError) {
						errorBar = this.getDataset().metaError[index];
						this.updateErrorBar(errorBar, point, index, reset);
					}
				}

			}, this);
		},

		updateErrorBar: function(errorBar, point, index, reset) {

			var xScale = this.getScaleForId(this.getDataset().xAxisID);
			var yScale = this.getScaleForId(this.getDataset().yAxisID);

			//TODO: abstract out so these can be global options
			var errorDir = this.getDataset().errorDir || Chart.defaults.lineError.errorDir;
			var errorCapWidth = this.getDataset().errorCapWidth || Chart.defaults.lineError.errorCapWidth;
			var errorStrokeColor = this.getDataset().errorColor || point._model.backgroundColor;
			var errorStrokeWidth = this.getDataset().errorStrokeWidth || Chart.defaults.lineError.errorStrokeWidth;

			helpers.extend(errorBar, {
				// Utility
				_chart: this.chart.chart,
				_xScale: xScale,
				_yScale: yScale,
				_datasetIndex: this.index,
				_index: index,

				_model: {
					x: xScale.getPixelForValue(this.getDataset().data[index], index, this.index, this.chart.isCombo),
					yTop: this.calculateErrorBarTop(index, this.index),
					yBottom: this.calculateErrorBarBottom(index, this.index),

					// Appearance
					capWidth: point._model.radius * 2 * errorCapWidth,
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

			return yScale.getPixelForValue(value);
		},

		calculateErrorBarBottom: function(index, datasetIndex) {
			var value = this.getDataset().data[index] - this.getDataset().error[index],
				yScale = this.getScaleForId(this.getDataset().yAxisID);

			return yScale.getPixelForValue(value);
		},

		draw: function(ease) {
			Chart.controllers.line.prototype.draw.call(this, ease);
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
