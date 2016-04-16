"use strict";

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	// Default config for a category scale
	var defaultConfig = {
		position: "bottom"
	};

	var DatasetScale = Chart.Scale.extend({
		buildTicks: function(index) {
			this.startIndex = 0;
			this.endIndex = this.chart.data.labels.length;
			var findIndex;

			if (this.options.ticks.min !== undefined) {
				// user specified min value
				findIndex = helpers.indexOf(this.chart.data.labels, this.options.ticks.min);
				this.startIndex = findIndex !== -1 ? findIndex : this.startIndex;
			}

			if (this.options.ticks.max !== undefined) {
				// user specified max value
				findIndex = helpers.indexOf(this.chart.data.labels, this.options.ticks.max);
				this.endIndex = findIndex !== -1 ? findIndex : this.endIndex;
			}

			// If we are viewing some subset of labels, slice the original array
			this.ticks = (this.startIndex === 0 && this.endIndex === this.chart.data.labels.length) ? this.chart.data.labels : this.chart.data.labels.slice(this.startIndex, this.endIndex + 1);
		},

		getLabelForIndex: function(index, datasetIndex) {
			return this.ticks[index];
		},

		// Used to get data value locations.  Value can either be an index or a numerical value
		getPixelForValue: function(value, index, datasetIndex, includeOffset) {
			// 1 is added because we need the length but we have the indexes
			var offsetAmt = Math.max((this.ticks.length - ((this.options.gridLines.offsetGridLines) ? 0 : 1)), 1);

			if (this.isHorizontal()) {
				var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
				var valueWidth = innerWidth / offsetAmt;
				var widthOffset = (valueWidth * (index - this.startIndex)) + this.paddingLeft;

				if (this.options.gridLines.offsetGridLines && includeOffset) {
					widthOffset += (valueWidth / 2);
				}

				return this.left + Math.round(widthOffset);
			} else {
				var innerHeight = this.height - (this.paddingTop + this.paddingBottom);
				var valueHeight = innerHeight / offsetAmt;
				var heightOffset = (valueHeight * (index - this.startIndex)) + this.paddingTop;

				if (this.options.gridLines.offsetGridLines && includeOffset) {
					heightOffset += (valueHeight / 2);
				}

				return this.top + Math.round(heightOffset);
			}
		},
		getPixelForTick: function(index, includeOffset) {
			return this.getPixelForValue(this.ticks[index], index + this.startIndex, null, includeOffset);
		}
	});

	Chart.scaleService.registerScaleType("category", DatasetScale, defaultConfig);

};