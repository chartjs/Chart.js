'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;

	var defaultConfig = {
		position: 'left',

		// label settings
		ticks: {
			callback: Chart.Ticks.formatters.logarithmic
		}
	};

	var LogarithmicScale = Chart.Scale.extend({
		determineDataLimits: function() {
			var me = this;
			var opts = me.options;
			var tickOpts = opts.ticks;
			var chart = me.chart;
			var data = chart.data;
			var datasets = data.datasets;
			var getValueOrDefault = helpers.getValueOrDefault;
			var isHorizontal = me.isHorizontal();
			function IDMatches(meta) {
				return isHorizontal ? meta.xAxisID === me.id : meta.yAxisID === me.id;
			}

			// Calculate Range
			me.min = null;
			me.max = null;
			me.minNotZero = null;

			var hasStacks = opts.stacked;
			if (hasStacks === undefined) {
				helpers.each(datasets, function(dataset, datasetIndex) {
					if (hasStacks) {
						return;
					}

					var meta = chart.getDatasetMeta(datasetIndex);
					if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta) &&
						meta.stack !== undefined) {
						hasStacks = true;
					}
				});
			}

			if (opts.stacked || hasStacks) {
				var valuesPerStack = {};

				helpers.each(datasets, function(dataset, datasetIndex) {
					var meta = chart.getDatasetMeta(datasetIndex);
					var key = [
						meta.type,
						// we have a separate stack for stack=undefined datasets when the opts.stacked is undefined
						((opts.stacked === undefined && meta.stack === undefined) ? datasetIndex : ''),
						meta.stack
					].join('.');

					if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
						if (valuesPerStack[key] === undefined) {
							valuesPerStack[key] = [];
						}

						helpers.each(dataset.data, function(rawValue, index) {
							var values = valuesPerStack[key];
							var value = +me.getRightValue(rawValue);
							if (isNaN(value) || meta.data[index].hidden) {
								return;
							}

							values[index] = values[index] || 0;

							if (opts.relativePoints) {
								values[index] = 100;
							} else {
								// Don't need to split positive and negative since the log scale can't handle a 0 crossing
								values[index] += value;
							}
						});
					}
				});

				helpers.each(valuesPerStack, function(valuesForType) {
					var minVal = helpers.min(valuesForType);
					var maxVal = helpers.max(valuesForType);
					me.min = me.min === null ? minVal : Math.min(me.min, minVal);
					me.max = me.max === null ? maxVal : Math.max(me.max, maxVal);
				});

			} else {
				helpers.each(datasets, function(dataset, datasetIndex) {
					var meta = chart.getDatasetMeta(datasetIndex);
					if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
						helpers.each(dataset.data, function(rawValue, index) {
							var value = +me.getRightValue(rawValue);
							if (isNaN(value) || meta.data[index].hidden) {
								return;
							}

							if (me.min === null) {
								me.min = value;
							} else if (value < me.min) {
								me.min = value;
							}

							if (me.max === null) {
								me.max = value;
							} else if (value > me.max) {
								me.max = value;
							}

							if (value !== 0 && (me.minNotZero === null || value < me.minNotZero)) {
								me.minNotZero = value;
							}
						});
					}
				});
			}

			me.min = getValueOrDefault(tickOpts.min, me.min);
			me.max = getValueOrDefault(tickOpts.max, me.max);

			if (me.min === me.max) {
				if (me.min !== 0 && me.min !== null) {
					me.min = Math.pow(10, Math.floor(helpers.log10(me.min)) - 1);
					me.max = Math.pow(10, Math.floor(helpers.log10(me.max)) + 1);
				} else {
					me.min = 1;
					me.max = 10;
				}
			}
		},
		buildTicks: function() {
			var me = this;
			var opts = me.options;
			var tickOpts = opts.ticks;

			var generationOptions = {
				min: tickOpts.min,
				max: tickOpts.max
			};
			var ticks = me.ticks = Chart.Ticks.generators.logarithmic(generationOptions, me);

			if (!me.isHorizontal()) {
				// We are in a vertical orientation. The top value is the highest. So reverse the array
				ticks.reverse();
			}

			// At this point, we need to update our max and min given the tick values since we have expanded the
			// range of the scale
			me.max = helpers.max(ticks);
			me.min = helpers.min(ticks);

			if (tickOpts.reverse) {
				ticks.reverse();

				me.start = me.max;
				me.end = me.min;
			} else {
				me.start = me.min;
				me.end = me.max;
			}
		},
		convertTicksToLabels: function() {
			this.tickValues = this.ticks.slice();

			Chart.Scale.prototype.convertTicksToLabels.call(this);
		},
		// Get the correct tooltip label
		getLabelForIndex: function(index, datasetIndex) {
			return +this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);
		},
		getPixelForTick: function(index) {
			return this.getPixelForValue(this.tickValues[index]);
		},
		getPixelForValue: function(value) {
			var me = this;
			var innerDimension = me.isHorizontal() ? me.width : me.height;
			var start = me.start;
			var end = me.end;
			var newVal = +me.getRightValue(value);
			var opts = me.options;
			var tickOpts = opts.ticks;
			var zero = me.isHorizontal() ? (tickOpts.reverse ? me.right : me.left) : (tickOpts.reverse ? me.top : me.bottom);

			var pixel, range, valueOffset;

			if (start === 0 || end === 0) { // 0 is in range
				var min = Math.pow(10, Math.floor(helpers.log10(me.minNotZero)));
				var max = tickOpts.reverse ? start : end;
				range = helpers.log10(max) - Math.floor(helpers.log10(me.minNotZero));
				var fontSize = helpers.getValueOrDefault(tickOpts.fontSize, Chart.defaults.global.defaultFontSize);
				var diff = fontSize;
				innerDimension -= diff;

				if (newVal === 0) { // 0
					pixel = zero;
				} else if (newVal === min) { // 0 in range, minNotZero
					pixel = me.isHorizontal() ? (tickOpts.reverse ? zero - diff : zero + diff) : (tickOpts.reverse ? zero + diff : zero - diff);
				} else { // 0 in range, common case
					valueOffset = innerDimension / range * (helpers.log10(newVal) - Math.floor(helpers.log10(me.minNotZero)));
					pixel = me.isHorizontal()
						? (tickOpts.reverse ? zero - diff - valueOffset : zero + diff + valueOffset)
						: (tickOpts.reverse ? zero + diff + valueOffset : zero - diff - valueOffset);
				}
			} else { // 0 is not in range
				range = helpers.log10(end) - helpers.log10(start);
				valueOffset = innerDimension / range * (helpers.log10(newVal) - helpers.log10(start));
				pixel = me.isHorizontal() ? me.left + valueOffset : me.bottom - valueOffset;
			}
			return pixel;
		},
		getValueForPixel: function(pixel) {
			var me = this;
			var range = helpers.log10(me.end) - helpers.log10(me.start);
			var value, innerDimension;
			var tickOpts = me.options.ticks;

			if (me.start === 0 || me.end === 0) {
				var zero = me.isHorizontal() ? (tickOpts.reverse ? me.right : me.left) : (tickOpts.reverse ? me.top : me.bottom);
				range = helpers.log10(tickOpts.reverse ? me.start : me.end) - Math.floor(helpers.log10(me.minNotZero));
				var fontSize = helpers.getValueOrDefault(tickOpts.fontSize, Chart.defaults.global.defaultFontSize);
				var diff = fontSize;
				innerDimension -= diff;

				//
				var pixelMinNotZero;
				if (me.isHorizontal()) {
					pixelMinNotZero = tickOpts.reverse ? zero - diff : zero + diff;
				} else {
					pixelMinNotZero = tickOpts.reverse ? zero + diff : zero - diff;
				}

				if (pixel === zero) {
					value = 0;
				} else if (pixel === pixelMinNotZero) {
					value = me.minNotZero;
				} else {
					var p = me.isHorizontal() ? (tickOpts.reverse ? zero - diff - pixel : zero + diff + pixel) : (tickOpts.reverse ? zero + diff + pixel : zero - diff - pixel);
					value = me.minNotZero * Math.pow(10, p * range / innerDimension);
				}
			} else if (me.isHorizontal()) {
				innerDimension = me.width;
				value = me.start * Math.pow(10, (pixel - me.left) * range / innerDimension);
			} else {
				innerDimension = me.height;
				value = Math.pow(10, (me.bottom - pixel) * range / innerDimension) / me.start;
			}
			return value;
		}
	});
	Chart.scaleService.registerScaleType('logarithmic', LogarithmicScale, defaultConfig);

};
