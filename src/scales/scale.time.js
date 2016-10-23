/* global window: false */
'use strict';

var moment = require('moment');
moment = typeof(moment) === 'function' ? moment : window.moment;

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	var time = {
		millisecond: {
			size: 1,
			steps: [1, 2, 5, 10, 20, 50, 100, 250, 500]
		},
		second: {
			size: 1000,
			steps: [1, 2, 5, 10, 30]
		},
		minute: {
			size: 60000,
			steps: [1, 2, 5, 10, 30]
		},
		hour: {
			size: 3600000,
			steps: [1, 2, 3, 6, 12]
		},
		day: {
			size: 86400000,
			steps: [1, 2, 5]
		},
		week: {
			size: 604800000,
			maxStep: 4
		},
		month: {
			size: 2.628e9,
			maxStep: 3
		},
		quarter: {
			size: 7.884e9,
			maxStep: 4
		},
		year: {
			size: 3.154e10,
			maxStep: false
		}
	};

	var defaultConfig = {
		position: 'bottom',

		time: {
			parser: false, // false == a pattern string from http://momentjs.com/docs/#/parsing/string-format/ or a custom callback that converts its argument to a moment
			format: false, // DEPRECATED false == date objects, moment object, callback or a pattern string from http://momentjs.com/docs/#/parsing/string-format/
			unit: false, // false == automatic or override with week, month, year, etc.
			round: false, // none, or override with week, month, year, etc.
			displayFormat: false, // DEPRECATED
			isoWeekday: false, // override week start day - see http://momentjs.com/docs/#/get-set/iso-weekday/
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
			autoSkip: false
		}
	};

	/**
	 * Helper function to parse time to a moment object
	 * @param axis {TimeAxis} the time axis
	 * @param label {Date|string|number|Moment} The thing to parse
	 * @return {Moment} parsed time
	 */
	function parseTime(axis, label) {
		var timeOpts = axis.options.time;
		if (typeof timeOpts.parser === 'string') {
			return moment(label, timeOpts.parser);
		} else if (typeof timeOpts.parser === 'function') {
			return timeOpts.parser(label);
		} else if (typeof label.getMonth === 'function' || typeof label === 'number') {
			// Date objects
			return moment(label);
		} else if (label.isValid && label.isValid()) {
			// Moment support
			return label;
		} else if (typeof timeOpts.format !== 'string' && timeOpts.format.call) {
			// Custom parsing (return an instance of moment)
			console.warn('options.time.format is deprecated and replaced by options.time.parser. See http://nnnick.github.io/Chart.js/docs-v2/#scales-time-scale');
			return timeOpts.format(label);
		}
		// Moment format parsing
		return moment(label, timeOpts.format);
	}

	/**
	 * Figure out which is the best unit for the scale
	 * @param min {Number} scale minimum
	 * @param max {Number} scale maximum
	 * @return {String} the unit to use
	 */
	function determineUnit(min, max) {
		var units = Object.keys(time);
		var maxTicks = 11;
		var unit;

		for (var i = 0; i < units.length; i++) {
			unit = units[i];
			var unitDetails = time[unit];
			var fits = false;

			if (unitDetails.steps) {
				fits = Math.ceil((max - min) / (unitDetails.steps[unitDetails.steps.length - 1] * unitDetails.size)) <= maxTicks;
			} else if (unitDetails.maxStep) {
				fits = Math.ceil((max - min) / (unitDetails.maxStep * unitDetails.size)) <= maxTicks;
			} else {
				// No limit on the multiplier so it always fits
				fits = true;
			}

			if (fits) {
				break;
			}
		}

		return unit;
	}

	/**
	 * Determines how we scale the unit
	 * @param min {Number} the scale minimum
	 * @param max {Number} the scale maximum
	 * @param unit {String} the unit determined by the {@see determineUnit} method
	 * @return {Number} the axis step size in milliseconds
	 */
	function determineStepSize(min, max, unit) {
		// Using our unit, figoure out what we need to scale as
		var maxTicks = 11; // eventually configure this
		var unitDefinition = time[unit];
		var unitSizeInMilliSeconds = unitDefinition.size;
		var sizeInUnits = Math.ceil((max - min) % unitSizeInMilliSeconds);
		var multiplier = 1;

		if (unitDefinition.steps) {
			// Have an array of steps
			for (var i = 0; i < unitDefinition.steps.length && sizeInUnits > maxTicks; i++) {
				multiplier = unitDefinition.steps[i];
				sizeInUnits = Math.ceil((max - min) / (unitSizeInMilliSeconds * multiplier));
			}
		} else {
			while (sizeInUnits > maxTicks) {
				++multiplier;
				sizeInUnits = Math.ceil((max - min) / (unitSizeInMilliSeconds * multiplier));
			}
		}

		return unitSizeInMilliSeconds * multiplier;
	}

	/**
	 * @function Chart.Ticks.generators.time
	 * @param generationOptions {ITimeGeneratorOptions} the options for generation
	 * @param dataRange {IRange} the data range
	 * @return {Number[]} ticks
	 */
	Chart.Ticks.generators.time = function(generationOptions, dataRange) {
		var ticks = [];
		var spacing = generationOptions.stepSize;
		var baseSpacing = generationOptions.baseSize;
		var niceMin = Math.floor(dataRange.min / baseSpacing) * baseSpacing;
		var niceMax = Math.ceil(dataRange.max / baseSpacing) * baseSpacing;

		// If min, max and stepSize is set and they make an evenly spaced scale use it.
		if (generationOptions.min && generationOptions.max && generationOptions.stepSize) {
			var minMaxDeltaDivisableByStepSize = ((generationOptions.max - generationOptions.min) % generationOptions.stepSize) === 0;
			if (minMaxDeltaDivisableByStepSize) {
				niceMin = generationOptions.min;
				niceMax = generationOptions.max;
			}
		}

		var numSpaces = (niceMax - niceMin) / spacing;
		// If very close to our rounded value, use it.
		if (helpers.almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
			numSpaces = Math.round(numSpaces);
		} else {
			numSpaces = Math.ceil(numSpaces);
		}

		// Put the values into the ticks array
		ticks.push(generationOptions.min !== undefined ? generationOptions.min : niceMin);
		for (var j = 1; j < numSpaces; ++j) {
			ticks.push(niceMin + (j * spacing));
		}
		ticks.push(generationOptions.max !== undefined ? generationOptions.max : niceMax);

		return ticks;
	};

	var TimeScale = Chart.Scale.extend({
		initialize: function() {
			if (!moment) {
				throw new Error('Chart.js - Moment.js could not be found! You must include it before Chart.js to use the time scale. Download at https://momentjs.com');
			}

			Chart.Scale.prototype.initialize.call(this);
		},
		determineDataLimits: function() {
			var me = this;
			var timeOpts = me.options.time;

			// We store the data range as unix millisecond timestamps so dataMin and dataMax will always be integers.
			var dataMin = Number.MAX_SAFE_INTEGER;
			var dataMax = Number.MIN_SAFE_INTEGER;

			var chartData = me.chart.data;
			var parsedData = {
				labels: [],
				datasets: []
			};

			var timestamp;

			if (chartData.labels && chartData.labels.length) {
				for (var i = 0; i < chartData.labels.length; i++) {
					var labelMoment = parseTime(me, chartData.labels[i]);

					if (labelMoment.isValid()) {
						// We need to round the time
						if (timeOpts.round) {
							labelMoment.startOf(timeOpts.round);
						}

						timestamp = labelMoment.valueOf();
						dataMin = Math.min(timestamp, dataMin);
						dataMax = Math.max(timestamp, dataMax);

						// Store this value for later
						parsedData.labels[i] = timestamp;
					}
				}
			}

			var datasets = chartData.datasets;
			for (var datasetIndex = 0; datasetIndex < datasets.length; datasetIndex++) {
				var dataset = datasets[datasetIndex];
				if (me.chart.isDatasetVisible(datasetIndex) && dataset.data.length) {
					var timestamps = [];

					if (typeof dataset.data[0] === 'object' && dataset.data[0] !== null) {
						// We have potential point data, so we need to parse this
						for (var dataIndex = 0; dataIndex < dataset.data.length; dataIndex++) {
							var dataMoment = parseTime(me, me.getRightValue(dataset.data[dataIndex]));

							if (dataMoment.isValid()) {
								if (timeOpts.round) {
									dataMoment.startOf(timeOpts.round);
								}

								timestamp = dataMoment.valueOf();
								dataMin = Math.min(timestamp, dataMin);
								dataMax = Math.max(timestamp, dataMax);
								timestamps[dataIndex] = timestamp;
							}
						}
					} else {
						// We have no x coordinates, so use the ones from the labels
						timestamps = parsedData.labels.slice();
					}

					parsedData.datasets[datasetIndex] = timestamps;
				}
			}

			me.dataMin = dataMin;
			me.dataMax = dataMax;
			me._parsedData = parsedData;
		},
		buildTicks: function() {
			var me = this;
			var timeOpts = me.options.time;

			var minTimestamp;
			var maxTimestamp;
			var dataMin = me.dataMin;
			var dataMax = me.dataMax;

			if (timeOpts.min) {
				var minMoment = parseTime(me, timeOpts.min);
				if (timeOpts.round) {
					minMoment.round(timeOpts.round);
				}
				minTimestamp = minMoment.valueOf();
			}

			if (timeOpts.max) {
				maxTimestamp = parseTime(me, timeOpts.max).valueOf();
			}

			var unit;
			if (timeOpts.unit) {
				unit = timeOpts.unit;
			} else {
				// Auto Determine Unit
				unit = determineUnit(minTimestamp || dataMin, maxTimestamp || dataMax);
			}
			me.displayFormat = timeOpts.displayFormats[unit];

			var stepSize;
			if (timeOpts.stepSize) {
				stepSize = timeOpts.stepSize;
			} else {
				// Auto determine step size
				stepSize = determineStepSize(minTimestamp || dataMin, maxTimestamp || dataMax, unit);
			}

			var timeGeneratorOptions = {
				maxTicks: 11,
				min: minTimestamp,
				max: maxTimestamp,
				stepSize: stepSize,
				baseSize: time[unit].size
			};
			var ticks = me.ticks = Chart.Ticks.generators.time(timeGeneratorOptions, {
				min: dataMin,
				max: dataMax
			});

			// At this point, we need to update our max and min given the tick values since we have expanded the
			// range of the scale
			me.max = helpers.max(ticks);
			me.min = helpers.min(ticks);
		},
		// Get tooltip label
		getLabelForIndex: function(index, datasetIndex) {
			var me = this;
			var label = me.chart.data.labels && index < me.chart.data.labels.length ? me.chart.data.labels[index] : '';
			var value = me.chart.data.datasets[datasetIndex].data[index];

			if (value !== null && typeof value === 'object') {
				label = me.getRightValue(value);
			}

			// Format nicely
			if (me.options.time.tooltipFormat) {
				label = parseTime(me, label).format(me.options.time.tooltipFormat);
			}

			return label;
		},
		// Function to format an individual tick mark
		tickFormatFunction: function(tick, index, ticks) {
			var formattedTick = tick.format(this.displayFormat);
			var tickOpts = this.options.ticks;
			var callback = helpers.getValueOrDefault(tickOpts.callback, tickOpts.userCallback);

			if (callback) {
				return callback(formattedTick, index, ticks);
			}
			return formattedTick;
		},
		convertTicksToLabels: function() {
			var me = this;
			me._ticksAsTimestamps = me.ticks;
			me.ticks = me.ticks.map(function(tick) {
				return moment(tick);
			}).map(me.tickFormatFunction, me);
		},
		getPixelForValue: function(value, index, datasetIndex) {
			var me = this;
			var offset = null;
			if (index !== undefined && datasetIndex !== undefined) {
				offset = me._parsedData.datasets[datasetIndex][index];
			}

			if (offset === null) {
				if (!value || !value.isValid) {
					// not already a moment object
					value = parseTime(me, me.getRightValue(value));
				}

				if (value && value.isValid && value.isValid()) {
					offset = value.valueOf();
				}
			}

			if (offset !== null) {
				var decimal = (offset - me.min) / (me.max - me.min);

				if (me.isHorizontal()) {
					var valueOffset = (me.width * decimal);
					return me.left + Math.round(valueOffset);
				}

				var heightOffset = (me.height * decimal);
				return me.top + Math.round(heightOffset);
			}
		},
		getPixelForTick: function(index) {
			return this.getPixelForValue(this._ticksAsTimestamps[index]);
		},
		getValueForPixel: function(pixel) {
			var me = this;
			var innerDimension = me.isHorizontal() ? me.width : me.height;
			var offset = (pixel - (me.isHorizontal() ? me.left : me.top)) / innerDimension;
			return moment(me.min + (offset * (me.max - me.min)));
		},
	});
	Chart.scaleService.registerScaleType('time', TimeScale, defaultConfig);

};
