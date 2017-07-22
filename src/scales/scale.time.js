/* global window: false */
'use strict';

var moment = require('moment');
moment = typeof moment === 'function' ? moment : window.moment;

var defaults = require('../core/core.defaults');
var helpers = require('../helpers/index');

function sorter(a, b) {
	return a - b;
}

/**
 * Returns an array of {time, pos} objects used to interpolate a specific `time` or position
 * (`pos`) on the scale, by searching entries before and after the requested value. `pos` is
 * a decimal between 0 and 1: 0 being the start of the scale (left or top) and 1 the other
 * extremity (left + width or top + height). Note that it would be more optimized to directly
 * store pre-computed pixels, but the scale dimensions are not guaranteed at the time we need
 * to create the lookup table. The table ALWAYS contains at least two items: min and max.
 *
 * @param {Number[]} timestamps - timestamps sorted from lowest to highest.
 * @param {Boolean} linear - If true, timestamps will be spread linearly along the min/max
 * range, so basically, the table will contains only two items: {min, 0} and {max, 1}. If
 * false, timestamps will be positioned at the same distance from each other. In this case,
 * only timestamps that break the time linearity are registered, meaning that in the best
 * case, all timestamps are linear, the table contains only min and max.
 */
function buildLookupTable(timestamps, min, max, linear) {
	if (linear || !timestamps.length) {
		return [
			{time: min, pos: 0},
			{time: max, pos: 1}
		];
	}

	var table = [];
	var items = timestamps.slice(0);
	var i, ilen, prev, curr, next;

	if (min < timestamps[0]) {
		items.unshift(min);
	}
	if (max > timestamps[timestamps.length - 1]) {
		items.push(max);
	}

	for (i = 0, ilen = items.length; i < ilen; ++i) {
		next = items[i + 1];
		prev = items[i - 1];
		curr = items[i];

		// only add points that breaks the scale linearity
		if (prev === undefined || next === undefined || Math.round((next + prev) / 2) !== curr) {
			table.push({time: curr, pos: i / (ilen - 1)});
		}
	}

	return table;
}

// @see adapted from http://www.anujgakhar.com/2014/03/01/binary-search-in-javascript/
function lookup(table, key, value) {
	var lo = 0;
	var hi = table.length - 1;
	var mid, i0, i1;

	while (lo >= 0 && lo <= hi) {
		mid = (lo + hi) >> 1;
		i0 = table[mid - 1] || null;
		i1 = table[mid];

		if (!i0) {
			// given value is outside table (before first item)
			return {lo: null, hi: i1};
		} else if (i1[key] < value) {
			lo = mid + 1;
		} else if (i0[key] > value) {
			hi = mid - 1;
		} else {
			return {lo: i0, hi: i1};
		}
	}

	// given value is outside table (after last item)
	return {lo: i1, hi: null};
}

/**
 * Linearly interpolates the given source `value` using the table items `skey` values and
 * returns the associated `tkey` value. For example, interpolate(table, 'time', 42, 'pos')
 * returns the position for a timestamp equal to 42. If value is out of bounds, values at
 * index [0, 1] or [n - 1, n] are used for the interpolation.
 */
function interpolate(table, skey, sval, tkey) {
	var range = lookup(table, skey, sval);

	// Note: the lookup table ALWAYS contains at least 2 items (min and max)
	var prev = !range.lo ? table[0] : !range.hi ? table[table.length - 2] : range.lo;
	var next = !range.lo ? table[1] : !range.hi ? table[table.length - 1] : range.hi;

	var span = next[skey] - prev[skey];
	var ratio = span ? (sval - prev[skey]) / span : 0;
	var offset = (next[tkey] - prev[tkey]) * ratio;

	return prev[tkey] + offset;
}

function parse(input, scale) {
	if (helpers.isNullOrUndef(input)) {
		return null;
	}

	var round = scale.options.time.round;
	var value = scale.getRightValue(input);
	var time = value.isValid ? value : helpers.time.parseTime(scale, value);
	if (!time || !time.isValid()) {
		return null;
	}

	if (round) {
		time.startOf(round);
	}

	return time.valueOf();
}

module.exports = function(Chart) {

	var timeHelpers = helpers.time;

	// Integer constants are from the ES6 spec.
	var MIN_INTEGER = Number.MIN_SAFE_INTEGER || -9007199254740991;
	var MAX_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

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
				minute: 'h:mm a', // 11:20 AM
				hour: 'hA', // 5PM
				day: 'MMM D', // Sep 4
				week: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
				month: 'MMM YYYY', // Sept 2015
				quarter: '[Q]Q - YYYY', // Q3
				year: 'YYYY' // 2015
			},
		},
		ticks: {
			autoSkip: false,
			mode: 'linear',   // 'linear|series'
			source: 'auto'    // 'auto|labels'
		}
	};

	var TimeScale = Chart.Scale.extend({
		initialize: function() {
			if (!moment) {
				throw new Error('Chart.js - Moment.js could not be found! You must include it before Chart.js to use the time scale. Download at https://momentjs.com');
			}

			this.mergeTicksOptions();

			Chart.Scale.prototype.initialize.call(this);
		},

		/**
		 * Allows data to be referenced via 't' attribute
		 */
		getRightValue: function(rawValue) {
			if (rawValue && rawValue.t !== undefined) {
				rawValue = rawValue.t;
			}
			return Chart.Scale.prototype.getRightValue.call(this, rawValue);
		},

		determineDataLimits: function() {
			var me = this;
			var chart = me.chart;
			var options = me.options;
			var datasets = chart.data.datasets || [];
			var min = MAX_INTEGER;
			var max = MIN_INTEGER;
			var timestamps = [];
			var labels = [];
			var i, j, ilen, jlen, data, timestamp;

			// Convert labels to timestamps
			for (i = 0, ilen = chart.data.labels.length; i < ilen; ++i) {
				timestamp = parse(chart.data.labels[i], me);
				min = Math.min(min, timestamp);
				max = Math.max(max, timestamp);
				labels.push(timestamp);
			}

			// Convert data to timestamps
			for (i = 0, ilen = datasets.length; i < ilen; ++i) {
				if (chart.isDatasetVisible(i)) {
					data = datasets[i].data;

					// Let's consider that all data have the same format.
					if (helpers.isObject(data[0])) {
						timestamps[i] = [];

						for (j = 0, jlen = data.length; j < jlen; ++j) {
							timestamp = parse(data[j], me);
							min = Math.min(min, timestamp);
							max = Math.max(max, timestamp);
							timestamps[i][j] = timestamp;
						}
					} else {
						timestamps[i] = labels.slice(0);
					}
				} else {
					timestamps[i] = [];
				}
			}

			// Enforce limits with user min/max options
			min = parse(options.time.min, me) || min;
			max = parse(options.time.max, me) || max;

			// In case there is no valid min/max, let's use today limits
			min = min === MAX_INTEGER ? +moment().startOf('day') : min;
			max = max === MIN_INTEGER ? +moment().endOf('day') + 1 : max;

			me._model = {
				datasets: timestamps,
				horizontal: me.isHorizontal(),
				labels: labels.sort(sorter),    // Sort labels **after** data have been converted
				min: Math.min(min, max),        // Make sure that max is **strictly** higher ...
				max: Math.max(min + 1, max),    // ... than min (required by the lookup table)
				offset: null,
				size: null,
				table: []
			};
		},

		buildTicks: function() {
			var me = this;
			var model = me._model;
			var min = model.min;
			var max = model.max;
			var timeOpts = me.options.time;
			var ticksOpts = me.options.ticks;
			var formats = timeOpts.displayFormats;
			var capacity = me.getLabelCapacity(min);
			var unit = timeOpts.unit || timeHelpers.determineUnit(timeOpts.minUnit, min, max, capacity);
			var majorUnit = timeHelpers.determineMajorUnit(unit);
			var ticks = [];
			var i, ilen, timestamp, stepSize;

			if (ticksOpts.source === 'labels') {
				for (i = 0, ilen = model.labels.length; i < ilen; ++i) {
					timestamp = model.labels[i];
					if (timestamp >= min && timestamp <= max) {
						ticks.push(timestamp);
					}
				}
			} else {
				stepSize = helpers.valueOrDefault(timeOpts.stepSize, timeOpts.unitStepSize)
					|| timeHelpers.determineStepSize(min, max, unit, capacity);

				ticks = timeHelpers.generateTicks({
					maxTicks: capacity,
					min: parse(timeOpts.min, me),
					max: parse(timeOpts.max, me),
					stepSize: stepSize,
					majorUnit: majorUnit,
					unit: unit,
					timeOpts: timeOpts
				}, {
					min: min,
					max: max
				});

				// Recompute min/max, the ticks generation might have changed them (BUG?)
				min = ticks.length ? ticks[0] : min;
				max = ticks.length ? ticks[ticks.length - 1] : max;
			}

			me.ticks = ticks;
			me.min = min;
			me.max = max;
			me.unit = unit;
			me.majorUnit = majorUnit;
			me.displayFormat = formats[unit];
			me.majorDisplayFormat = formats[majorUnit];

			model.table = buildLookupTable(ticks, min, max, ticksOpts.mode === 'linear');
		},

		getLabelForIndex: function(index, datasetIndex) {
			var me = this;
			var data = me.chart.data;
			var timeOpts = me.options.time;
			var label = data.labels && index < data.labels.length ? data.labels[index] : '';
			var value = data.datasets[datasetIndex].data[index];

			if (helpers.isObject(value)) {
				label = me.getRightValue(value);
			}
			if (timeOpts.tooltipFormat) {
				label = timeHelpers.parseTime(me, label).format(timeOpts.tooltipFormat);
			}

			return label;
		},

		/**
		 * Function to format an individual tick mark
		 * @private
		 */
		tickFormatFunction: function(tick, index, ticks) {
			var me = this;
			var options = me.options;
			var time = tick.valueOf();
			var majorUnit = me.majorUnit;
			var majorFormat = me.majorDisplayFormat;
			var majorTime = tick.clone().startOf(me.majorUnit).valueOf();
			var major = majorUnit && majorFormat && time === majorTime;
			var formattedTick = tick.format(major ? majorFormat : me.displayFormat);
			var tickOpts = major ? options.ticks.major : options.ticks.minor;
			var formatter = helpers.valueOrDefault(tickOpts.callback, tickOpts.userCallback);

			if (formatter) {
				formattedTick = formatter(formattedTick, index, ticks);
			}

			return {
				value: formattedTick,
				major: major,
				time: time,
			};
		},

		convertTicksToLabels: function() {
			var ticks = this.ticks;
			var i, ilen;

			for (i = 0, ilen = ticks.length; i < ilen; ++i) {
				ticks[i] = this.tickFormatFunction(moment(ticks[i]));
			}
		},

		/**
		 * @private
		 */
		getPixelForOffset: function(time) {
			var me = this;
			var model = me._model;
			var size = model.horizontal ? me.width : me.height;
			var start = model.horizontal ? me.left : me.top;
			var pos = interpolate(model.table, 'time', time, 'pos');

			return start + size * pos;
		},

		getPixelForValue: function(value, index, datasetIndex) {
			var me = this;
			var time = null;

			if (index !== undefined && datasetIndex !== undefined) {
				time = me._model.datasets[datasetIndex][index];
			}

			if (time === null) {
				time = parse(value, me);
			}

			if (time !== null) {
				return me.getPixelForOffset(time);
			}
		},

		getPixelForTick: function(index) {
			return index >= 0 && index < this.ticks.length ?
				this.getPixelForOffset(this.ticks[index].time) :
				null;
		},

		getValueForPixel: function(pixel) {
			var me = this;
			var model = me._model;
			var size = model.horizontal ? me.width : me.height;
			var start = model.horizontal ? me.left : me.top;
			var pos = size ? (pixel - start) / size : 0;
			var time = interpolate(model.table, 'pos', pos, 'time');

			return moment(time);
		},

		/**
		 * Crude approximation of what the label width might be
		 * @private
		 */
		getLabelWidth: function(label) {
			var me = this;
			var ticksOpts = me.options.ticks;
			var tickLabelWidth = me.ctx.measureText(label).width;
			var angle = helpers.toRadians(ticksOpts.maxRotation);
			var cosRotation = Math.cos(angle);
			var sinRotation = Math.sin(angle);
			var tickFontSize = helpers.valueOrDefault(ticksOpts.fontSize, defaults.global.defaultFontSize);

			return (tickLabelWidth * cosRotation) + (tickFontSize * sinRotation);
		},

		/**
		 * @private
		 */
		getLabelCapacity: function(exampleTime) {
			var me = this;

			me.displayFormat = me.options.time.displayFormats.millisecond;	// Pick the longest format for guestimation

			var exampleLabel = me.tickFormatFunction(moment(exampleTime), 0, []).value;
			var tickLabelWidth = me.getLabelWidth(exampleLabel);
			var innerWidth = me.isHorizontal() ? me.width : me.height;

			return innerWidth / tickLabelWidth;
		}
	});

	Chart.scaleService.registerScaleType('time', TimeScale, defaultConfig);
};
