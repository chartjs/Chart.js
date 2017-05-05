/* global window: false */
'use strict';

var moment = require('moment');
moment = typeof(moment) === 'function' ? moment : window.moment;

module.exports = function(Chart) {

	var helpers = Chart.helpers;
	var interval = {
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
		}
		if (typeof timeOpts.parser === 'function') {
			return timeOpts.parser(label);
		}
		if (typeof label.getMonth === 'function' || typeof label === 'number') {
			// Date objects
			return moment(label);
		}
		if (label.isValid && label.isValid()) {
			// Moment support
			return label;
		}
		var format = timeOpts.format;
		if (typeof format !== 'string' && format.call) {
			// Custom parsing (return an instance of moment)
			console.warn('options.time.format is deprecated and replaced by options.time.parser.');
			return format(label);
		}
		// Moment format parsing
		return moment(label, format);
	}

	/**
	 * Figure out which is the best unit for the scale
	 * @param minUnit {String} minimum unit to use
	 * @param min {Number} scale minimum
	 * @param max {Number} scale maximum
	 * @return {String} the unit to use
	 */
	function determineUnit(minUnit, min, max, maxTicks) {
		var units = Object.keys(interval);
		var unit;
		var numUnits = units.length;

		for (var i = units.indexOf(minUnit); i < numUnits; i++) {
			unit = units[i];
			var unitDetails = interval[unit];
			var steps = (unitDetails.steps && unitDetails.steps[unitDetails.steps.length - 1]) || unitDetails.maxStep;
			if (steps === undefined || Math.ceil((max - min) / (steps * unitDetails.size)) <= maxTicks) {
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
	 * @return {Number} the axis step size as a multiple of unit
	 */
	function determineStepSize(min, max, unit, maxTicks) {
		// Using our unit, figoure out what we need to scale as
		var unitDefinition = interval[unit];
		var unitSizeInMilliSeconds = unitDefinition.size;
		var sizeInUnits = Math.ceil((max - min) / unitSizeInMilliSeconds);
		var multiplier = 1;
		var range = max - min;

		if (unitDefinition.steps) {
			// Have an array of steps
			var numSteps = unitDefinition.steps.length;
			for (var i = 0; i < numSteps && sizeInUnits > maxTicks; i++) {
				multiplier = unitDefinition.steps[i];
				sizeInUnits = Math.ceil(range / (unitSizeInMilliSeconds * multiplier));
			}
		} else {
			while (sizeInUnits > maxTicks && maxTicks > 0) {
				++multiplier;
				sizeInUnits = Math.ceil(range / (unitSizeInMilliSeconds * multiplier));
			}
		}

		return multiplier;
	}

	/**
	 * Helper for generating axis labels.
	 * @param options {ITimeGeneratorOptions} the options for generation
	 * @param dataRange {IRange} the data range
	 * @param niceRange {IRange} the pretty range to display
	 * @return {Number[]} ticks
	 */
	function generateTicks(options, dataRange, niceRange) {
		var ticks = [];
		if (options.maxTicks) {
			var stepSize = options.stepSize;
			ticks.push(options.min !== undefined ? options.min : niceRange.min);
			var cur = moment(niceRange.min);
			while (cur.add(stepSize, options.unit).valueOf() < niceRange.max) {
				ticks.push(cur.valueOf());
			}
			var realMax = options.max || niceRange.max;
			if (ticks[ticks.length - 1] !== realMax) {
				ticks.push(realMax);
			}
		}
		return ticks;
	}

	/**
	 * @function Chart.Ticks.generators.time
	 * @param options {ITimeGeneratorOptions} the options for generation
	 * @param dataRange {IRange} the data range
	 * @return {Number[]} ticks
	 */
	Chart.Ticks.generators.time = function(options, dataRange) {
		var niceMin;
		var niceMax;
		var isoWeekday = options.isoWeekday;
		if (options.unit === 'week' && isoWeekday !== false) {
			niceMin = moment(dataRange.min).startOf('isoWeek').isoWeekday(isoWeekday).valueOf();
			niceMax = moment(dataRange.max).startOf('isoWeek').isoWeekday(isoWeekday);
			if (dataRange.max - niceMax > 0) {
				niceMax.add(1, 'week');
			}
			niceMax = niceMax.valueOf();
		} else {
			niceMin = moment(dataRange.min).startOf(options.unit).valueOf();
			niceMax = moment(dataRange.max).startOf(options.unit);
			if (dataRange.max - niceMax > 0) {
				niceMax.add(1, options.unit);
			}
			niceMax = niceMax.valueOf();
		}
		return generateTicks(options, dataRange, {
			min: niceMin,
			max: niceMax
		});
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

			helpers.each(chartData.labels, function(label, labelIndex) {
				var labelMoment = parseTime(me, label);

				if (labelMoment.isValid()) {
					// We need to round the time
					if (timeOpts.round) {
						labelMoment.startOf(timeOpts.round);
					}

					timestamp = labelMoment.valueOf();
					dataMin = Math.min(timestamp, dataMin);
					dataMax = Math.max(timestamp, dataMax);

					// Store this value for later
					parsedData.labels[labelIndex] = timestamp;
				}
			});

			helpers.each(chartData.datasets, function(dataset, datasetIndex) {
				var timestamps = [];

				if (typeof dataset.data[0] === 'object' && dataset.data[0] !== null && me.chart.isDatasetVisible(datasetIndex)) {
					// We have potential point data, so we need to parse this
					helpers.each(dataset.data, function(value, dataIndex) {
						var dataMoment = parseTime(me, me.getRightValue(value));

						if (dataMoment.isValid()) {
							if (timeOpts.round) {
								dataMoment.startOf(timeOpts.round);
							}

							timestamp = dataMoment.valueOf();
							dataMin = Math.min(timestamp, dataMin);
							dataMax = Math.max(timestamp, dataMax);
							timestamps[dataIndex] = timestamp;
						}
					});
				} else {
					// We have no x coordinates, so use the ones from the labels
					timestamps = parsedData.labels.slice();
				}

				parsedData.datasets[datasetIndex] = timestamps;
			});

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

			var maxTicks = me.getLabelCapacity(minTimestamp || dataMin);
			var unit = timeOpts.unit || determineUnit(timeOpts.minUnit, minTimestamp || dataMin, maxTimestamp || dataMax, maxTicks);
			me.displayFormat = timeOpts.displayFormats[unit];

			var stepSize = timeOpts.stepSize || determineStepSize(minTimestamp || dataMin, maxTimestamp || dataMax, unit, maxTicks);
			var ticks = me.ticks = Chart.Ticks.generators.time({
				maxTicks: maxTicks,
				min: minTimestamp,
				max: maxTimestamp,
				stepSize: stepSize,
				unit: unit,
				isoWeekday: timeOpts.isoWeekday
			}, {
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
			me.ticksAsTimestamps = me.ticks;
			me.ticks = me.ticks.map(function(tick) {
				return moment(tick);
			}).map(me.tickFormatFunction, me);
		},
		getPixelForOffset: function(offset) {
			var me = this;
			var epochWidth = me.max - me.min;
			var decimal = epochWidth ? (offset - me.min) / epochWidth : 0;

			if (me.isHorizontal()) {
				var valueOffset = (me.width * decimal);
				return me.left + Math.round(valueOffset);
			}

			var heightOffset = (me.height * decimal);
			return me.top + Math.round(heightOffset);
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
				return me.getPixelForOffset(offset);
			}
		},
		getPixelForTick: function(index) {
			return this.getPixelForOffset(this.ticksAsTimestamps[index]);
		},
		getValueForPixel: function(pixel) {
			var me = this;
			var innerDimension = me.isHorizontal() ? me.width : me.height;
			var offset = (pixel - (me.isHorizontal() ? me.left : me.top)) / innerDimension;
			return moment(me.min + (offset * (me.max - me.min)));
		},
		// Crude approximation of what the label width might be
		getLabelWidth: function(label) {
			var me = this;
			var ticks = me.options.ticks;

			var tickLabelWidth = me.ctx.measureText(label).width;
			var cosRotation = Math.cos(helpers.toRadians(ticks.maxRotation));
			var sinRotation = Math.sin(helpers.toRadians(ticks.maxRotation));
			var tickFontSize = helpers.getValueOrDefault(ticks.fontSize, Chart.defaults.global.defaultFontSize);
			return (tickLabelWidth * cosRotation) + (tickFontSize * sinRotation);
		},
		getLabelCapacity: function(exampleTime) {
			var me = this;

			me.displayFormat = me.options.time.displayFormats.millisecond;	// Pick the longest format for guestimation
			var exampleLabel = me.tickFormatFunction(moment(exampleTime), 0, []);
			var tickLabelWidth = me.getLabelWidth(exampleLabel);

			var innerWidth = me.isHorizontal() ? me.width : me.height;
			var labelCapacity = innerWidth / tickLabelWidth;
			return labelCapacity;
		}
	});
	Chart.scaleService.registerScaleType('time', TimeScale, defaultConfig);

};
