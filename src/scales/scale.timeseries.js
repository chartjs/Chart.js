'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	var timeHelpers = helpers.time;

	// Default config for a timeseries scale
	var defaultConfig = {
		position: 'bottom',

		time: {
			parser: false, // false == a pattern string from http://momentjs.com/docs/#/parsing/string-format/ or a custom callback that converts its argument to a moment
			format: false, // DEPRECATED false == date objects, moment object, callback or a pattern string from http://momentjs.com/docs/#/parsing/string-format/
			unit: false, // false == automatic or override with week, month, year, etc.
			round: false, // none, or override with week, month, year, etc.
			displayFormat: false, // DEPRECATED
			minUnit: 'millisecond',

			// defaults to unit's corresponding unitFormat below or override using pattern string from http://momentjs.com/docs/#/displaying/format/
			displayFormats: {
				millisecond: 'h:mm:ss.SSS a', // 11:20:01.123 AM,
				second: 'h:mm:ss a', // 11:20:01 AM
				minute: 'h:mm:ss a', // 11:20:01 AM
				hour: 'MMM D, hA', // Sept 4, 5PM
				day: 'll', // Sep 4 2015
				week: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
				month: 'MMM YYYY', // Sept 2015
				quarter: '[Q]Q - YYYY', // Q3
				year: 'YYYY' // 2015
			},
		},
		ticks: {
			autoSkip: true
		}
	};

	function arrayUnique(arr) {
		var result = [];
		for (var i = 0; i < arr.length; i++) {
			if (result.indexOf(arr[i]) === -1) {
				result.push(arr[i]);
			}
		}
		return result;
	}

	var TimeSeriesScale = Chart.TimeScaleBase.extend({
		/**
		* Internal function to get the correct labels. If data.xLabels or data.yLabels are defined, use those
		* else fall back to data.labels
		* @private
		*/
		getLabels: function() {
			var data = this.chart.data;
			return data.xLabels || data.labels;
		},

		determineDataLimits: function() {
			var me = this;
			var timeOpts = me.options.time;

			var chartData = me.chart.data;
			var parsedData = {
				labels: [],
				datasets: []
			};

			helpers.each(me.getLabels(), function(label, labelIndex) {
				var labelMoment = timeHelpers.parseTime(me, label);

				if (labelMoment.isValid()) {
					// We need to round the time
					if (timeOpts.round) {
						labelMoment.startOf(timeOpts.round);
					}
					// Store this value for later
					parsedData.labels[labelIndex] = labelMoment.valueOf();
				}
			});

			helpers.each(chartData.datasets, function(dataset, datasetIndex) {
				var timestamps = [];

				if (typeof dataset.data[0] === 'object' && dataset.data[0] !== null && me.chart.isDatasetVisible(datasetIndex)) {
					// We have potential point data, so we need to parse this
					helpers.each(dataset.data, function(value, dataIndex) {
						var dataMoment = timeHelpers.parseTime(me, me.getRightValue(value));

						if (dataMoment.isValid()) {
							if (timeOpts.round) {
								dataMoment.startOf(timeOpts.round);
							}

							timestamps[dataIndex] = dataMoment.valueOf();
						}
					});
				} else {
					// We have no x coordinates, so use the ones from the labels
					timestamps = parsedData.labels.slice();
				}

				parsedData.datasets[datasetIndex] = timestamps;
			});

			var allTimestamps = parsedData.labels;
			helpers.each(parsedData.datasets, function(value) {
				allTimestamps = allTimestamps.concat(value);
			});

			allTimestamps = arrayUnique(allTimestamps).sort(function(a, b) {
				return a - b;
			});

			parsedData.allTimestamps = allTimestamps;

			me._parsedData = parsedData;
		},

		buildTicks: function() {
			var me = this;
			var timeOpts = me.options.time;

			var allTimestamps = me._parsedData.allTimestamps;
			var dataMin = allTimestamps[0];
			var dataMax = allTimestamps[allTimestamps.length - 1];

			var maxTicks = me.getLabelCapacity(dataMin);
			var unit = timeOpts.unit || timeHelpers.determineUnit(timeOpts.minUnit, dataMin, dataMax, maxTicks);
			me.displayFormat = timeOpts.displayFormats[unit];

			me._tickTimestamps = allTimestamps;
			me.ticks = allTimestamps;
		},

		// Used to get data value locations.  Value can either be an index or a numerical value
		getPixelForValue: function(value, index, datasetIndex, includeOffset) {
			var me = this;

			var offsetAmt = Math.max((me.ticks.length - ((me.options.gridLines.offsetGridLines) ? 0 : 1)), 1);

			if (typeof datasetIndex === 'number') {
				var timestamp = me._parsedData.datasets[datasetIndex][index];
				var indexByTimestamp = me._tickTimestamps.indexOf(timestamp);
				index = indexByTimestamp !== -1 ? indexByTimestamp : index;
			}

			var valueWidth = me.width / offsetAmt;
			var widthOffset = valueWidth * index;

			if (me.options.gridLines.offsetGridLines && includeOffset || me.ticks.length === 1 && includeOffset) {
				widthOffset += (valueWidth / 2);
			}

			return me.left + Math.round(widthOffset);
		},
		getPixelForTick: function(index, includeOffset) {
			if (this.ticks.length === 1) {
				includeOffset = true;
			}
			return this.getPixelForValue(this.ticks[index], index, null, includeOffset);
		},
		getValueForPixel: function(pixel) {
			var me = this;
			var value;
			var offsetAmt = Math.max((me.ticks.length - ((me.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
			var valueDimension = me.width / offsetAmt;

			pixel -= me.left;

			if (me.options.gridLines.offsetGridLines) {
				pixel -= (valueDimension / 2);
			}

			if (pixel <= 0) {
				value = 0;
			} else {
				value = Math.round(pixel / valueDimension);
			}

			return value;
		},
		getBasePixel: function() {
			return this.bottom;
		}
	});

	Chart.scaleService.registerScaleType('timeseries', TimeSeriesScale, defaultConfig);

};
