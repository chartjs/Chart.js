"use strict";

module.exports = function(Chart) {

	var helpers = Chart.helpers;

	var defaultConfig = {
		position: "left",
		ticks: {
			callback: function(tickValue, index, ticks) {
				// If we have lots of ticks, don't use the ones
				var delta = ticks.length > 3 ? ticks[2] - ticks[1] : ticks[1] - ticks[0];

				// If we have a number like 2.5 as the delta, figure out how many decimal places we need
				if (Math.abs(delta) > 1) {
					if (tickValue !== Math.floor(tickValue)) {
						// not an integer
						delta = tickValue - Math.floor(tickValue);
					}
				}

				var logDelta = helpers.log10(Math.abs(delta));
				var tickString = '';

				if (tickValue !== 0) {
					var numDecimal = -1 * Math.floor(logDelta);
					numDecimal = Math.max(Math.min(numDecimal, 20), 0); // toFixed has a max of 20 decimal places
					tickString = tickValue.toFixed(numDecimal);
				} else {
					tickString = '0'; // never show decimal places for 0
				}

				return tickString;
			}
		}
	};

	var LinearScale = Chart.Scale.extend({
		determineDataLimits: function() {
			// First Calculate the range
			this.min = null;
			this.max = null;

			if (this.options.stacked) {
				var valuesPerType = {};
				var hasPositiveValues = false;
				var hasNegativeValues = false;

				helpers.each(this.chart.data.datasets, function(dataset) {
					if (valuesPerType[dataset.type] === undefined) {
						valuesPerType[dataset.type] = {
							positiveValues: [],
							negativeValues: []
						};
					}

					// Store these per type
					var positiveValues = valuesPerType[dataset.type].positiveValues;
					var negativeValues = valuesPerType[dataset.type].negativeValues;

					if (helpers.isDatasetVisible(dataset) && (this.isHorizontal() ? dataset.xAxisID === this.id : dataset.yAxisID === this.id)) {
						helpers.each(dataset.data, function(rawValue, index) {

							var value = +this.getRightValue(rawValue);
							if (isNaN(value)) {
								return;
							}

							positiveValues[index] = positiveValues[index] || 0;
							negativeValues[index] = negativeValues[index] || 0;

							if (this.options.relativePoints) {
								positiveValues[index] = 100;
							} else {
								if (value < 0) {
									hasNegativeValues = true;
									negativeValues[index] += value;
								} else {
									hasPositiveValues = true;
									positiveValues[index] += value;
								}
							}
						}, this);
					}
				}, this);

				helpers.each(valuesPerType, function(valuesForType) {
					var values = valuesForType.positiveValues.concat(valuesForType.negativeValues);
					var minVal = helpers.min(values);
					var maxVal = helpers.max(values);
					this.min = this.min === null ? minVal : Math.min(this.min, minVal);
					this.max = this.max === null ? maxVal : Math.max(this.max, maxVal);
				}, this);

			} else {
				helpers.each(this.chart.data.datasets, function(dataset) {
					if (helpers.isDatasetVisible(dataset) && (this.isHorizontal() ? dataset.xAxisID === this.id : dataset.yAxisID === this.id)) {
						helpers.each(dataset.data, function(rawValue, index) {
							var value = +this.getRightValue(rawValue);
							if (isNaN(value)) {
								return;
							}

							if (this.min === null) {
								this.min = value;
							} else if (value < this.min) {
								this.min = value;
							}

							if (this.max === null) {
								this.max = value;
							} else if (value > this.max) {
								this.max = value;
							}
						}, this);
					}
				}, this);
			}

			// If we are forcing it to begin at 0, but 0 will already be rendered on the chart,
			// do nothing since that would make the chart weird. If the user really wants a weird chart
			// axis, they can manually override it
			if (this.options.ticks.beginAtZero) {
				var minSign = helpers.sign(this.min);
				var maxSign = helpers.sign(this.max);

				if (minSign < 0 && maxSign < 0) {
					// move the top up to 0
					this.max = 0;
				} else if (minSign > 0 && maxSign > 0) {
					// move the botttom down to 0
					this.min = 0;
				}
			}

			if (this.options.ticks.min !== undefined) {
				this.min = this.options.ticks.min;
			} else if (this.options.ticks.suggestedMin !== undefined) {
				this.min = Math.min(this.min, this.options.ticks.suggestedMin);
			}

			if (this.options.ticks.max !== undefined) {
				this.max = this.options.ticks.max;
			} else if (this.options.ticks.suggestedMax !== undefined) {
				this.max = Math.max(this.max, this.options.ticks.suggestedMax);
			}

			if (this.min === this.max) {
				this.min--;
				this.max++;
			}
		},
		buildTicks: function() {

			// Then calulate the ticks
			this.ticks = [];

			// Figure out what the max number of ticks we can support it is based on the size of
			// the axis area. For now, we say that the minimum tick spacing in pixels must be 50
			// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
			// the graph

			var maxTicks;

			if (this.isHorizontal()) {
				maxTicks = Math.min(this.options.ticks.maxTicksLimit ? this.options.ticks.maxTicksLimit : 11, Math.ceil(this.width / 50));
			} else {
				// The factor of 2 used to scale the font size has been experimentally determined.
				var tickFontSize = helpers.getValueOrDefault(this.options.ticks.fontSize, Chart.defaults.global.defaultFontSize);
				maxTicks = Math.min(this.options.ticks.maxTicksLimit ? this.options.ticks.maxTicksLimit : 11, Math.ceil(this.height / (2 * tickFontSize)));
			}

			// Make sure we always have at least 2 ticks
			maxTicks = Math.max(2, maxTicks);

			// To get a "nice" value for the tick spacing, we will use the appropriately named
			// "nice number" algorithm. See http://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
			// for details.

			var spacing;
			var fixedStepSizeSet = (this.options.ticks.fixedStepSize && this.options.ticks.fixedStepSize > 0) || (this.options.ticks.stepSize && this.options.ticks.stepSize > 0);
			if (fixedStepSizeSet) {
				spacing = helpers.getValueOrDefault(this.options.ticks.fixedStepSize, this.options.ticks.stepSize);
			} else {
				var niceRange = helpers.niceNum(this.max - this.min, false);
				spacing = helpers.niceNum(niceRange / (maxTicks - 1), true);
			}
			var niceMin = Math.floor(this.min / spacing) * spacing;
			var niceMax = Math.ceil(this.max / spacing) * spacing;
			var numSpaces = (niceMax - niceMin) / spacing;

			// If very close to our rounded value, use it.
			if (helpers.almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
				numSpaces = Math.round(numSpaces);
			} else {
				numSpaces = Math.ceil(numSpaces);
			}

			// Put the values into the ticks array
			this.ticks.push(this.options.ticks.min !== undefined ? this.options.ticks.min : niceMin);
			for (var j = 1; j < numSpaces; ++j) {
				this.ticks.push(niceMin + (j * spacing));
			}
			this.ticks.push(this.options.ticks.max !== undefined ? this.options.ticks.max : niceMax);

			if (this.options.position === "left" || this.options.position === "right") {
				// We are in a vertical orientation. The top value is the highest. So reverse the array
				this.ticks.reverse();
			}

			// At this point, we need to update our max and min given the tick values since we have expanded the
			// range of the scale
			this.max = helpers.max(this.ticks);
			this.min = helpers.min(this.ticks);

			if (this.options.ticks.reverse) {
				this.ticks.reverse();

				this.start = this.max;
				this.end = this.min;
			} else {
				this.start = this.min;
				this.end = this.max;
			}
		},
		getLabelForIndex: function(index, datasetIndex) {
			return +this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);
		},
		convertTicksToLabels: function() {
			this.ticksAsNumbers = this.ticks.slice();
			this.zeroLineIndex = this.ticks.indexOf(0);

			Chart.Scale.prototype.convertTicksToLabels.call(this);
		},
		// Utils
		getPixelForValue: function(value, index, datasetIndex, includeOffset) {
			// This must be called after fit has been run so that
			//      this.left, this.top, this.right, and this.bottom have been defined
			var rightValue = +this.getRightValue(value);
			var pixel;
			var range = this.end - this.start;

			if (this.isHorizontal()) {
				var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
				pixel = this.left + (innerWidth / range * (rightValue - this.start));
				return Math.round(pixel + this.paddingLeft);
			} else {
				var innerHeight = this.height - (this.paddingTop + this.paddingBottom);
				pixel = (this.bottom - this.paddingBottom) - (innerHeight / range * (rightValue - this.start));
				return Math.round(pixel);
			}
		},
		getPixelForTick: function(index, includeOffset) {
			return this.getPixelForValue(this.ticksAsNumbers[index], null, null, includeOffset);
		}
	});
	Chart.scaleService.registerScaleType("linear", LinearScale, defaultConfig);

};