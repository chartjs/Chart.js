'use strict';

var adapters = require('../core/core.adapters');
var defaults = require('../core/core.defaults');
var helpers = require('../helpers/index');
var Scale = require('../core/core.scale');

var deprecated = helpers._deprecated;
var resolve = helpers.options.resolve;
var valueOrDefault = helpers.valueOrDefault;

// Integer constants are from the ES6 spec.
var MIN_INTEGER = Number.MIN_SAFE_INTEGER || -9007199254740991;
var MAX_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

var INTERVALS = {
	millisecond: {
		common: true,
		size: 1,
		steps: 1000
	},
	second: {
		common: true,
		size: 1000,
		steps: 60
	},
	minute: {
		common: true,
		size: 60000,
		steps: 60
	},
	hour: {
		common: true,
		size: 3600000,
		steps: 24
	},
	day: {
		common: true,
		size: 86400000,
		steps: 30
	},
	week: {
		common: false,
		size: 604800000,
		steps: 4
	},
	month: {
		common: true,
		size: 2.628e9,
		steps: 12
	},
	quarter: {
		common: false,
		size: 7.884e9,
		steps: 4
	},
	year: {
		common: true,
		size: 3.154e10
	}
};

var UNITS = Object.keys(INTERVALS);

function sorter(a, b) {
	return a - b;
}

function arrayUnique(items) {
	var hash = {};
	var out = [];
	var i, ilen, item;

	for (i = 0, ilen = items.length; i < ilen; ++i) {
		item = items[i];
		if (!hash[item]) {
			hash[item] = true;
			out.push(item);
		}
	}

	return out;
}

function getMin(options) {
	return helpers.valueOrDefault(options.time.min, options.ticks.min);
}

function getMax(options) {
	return helpers.valueOrDefault(options.time.max, options.ticks.max);
}

/**
 * Returns an array of {time, pos} objects used to interpolate a specific `time` or position
 * (`pos`) on the scale, by searching entries before and after the requested value. `pos` is
 * a decimal between 0 and 1: 0 being the start of the scale (left or top) and 1 the other
 * extremity (left + width or top + height). Note that it would be more optimized to directly
 * store pre-computed pixels, but the scale dimensions are not guaranteed at the time we need
 * to create the lookup table. The table ALWAYS contains at least two items: min and max.
 *
 * @param {number[]} timestamps - timestamps sorted from lowest to highest.
 * @param {string} distribution - If 'linear', timestamps will be spread linearly along the min
 * and max range, so basically, the table will contains only two items: {min, 0} and {max, 1}.
 * If 'series', timestamps will be positioned at the same distance from each other. In this
 * case, only timestamps that break the time linearity are registered, meaning that in the
 * best case, all timestamps are linear, the table contains only min and max.
 */
function buildLookupTable(timestamps, min, max, distribution) {
	if (distribution === 'linear' || !timestamps.length) {
		return [
			{time: min, pos: 0},
			{time: max, pos: 1}
		];
	}

	var table = [];
	var items = [min];
	var i, ilen, prev, curr, next;

	for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
		curr = timestamps[i];
		if (curr > min && curr < max) {
			items.push(curr);
		}
	}

	items.push(max);

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

// @see adapted from https://www.anujgakhar.com/2014/03/01/binary-search-in-javascript/
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

function toTimestamp(scale, input) {
	var adapter = scale._adapter;
	var options = scale.options.time;
	var parser = options.parser;
	var format = parser || options.format;
	var value = input;

	if (typeof parser === 'function') {
		value = parser(value);
	}

	// Only parse if its not a timestamp already
	if (!helpers.isFinite(value)) {
		value = typeof format === 'string'
			? adapter.parse(value, format)
			: adapter.parse(value);
	}

	if (value !== null) {
		return +value;
	}

	// Labels are in an incompatible format and no `parser` has been provided.
	// The user might still use the deprecated `format` option for parsing.
	if (!parser && typeof format === 'function') {
		value = format(input);

		// `format` could return something else than a timestamp, if so, parse it
		if (!helpers.isFinite(value)) {
			value = adapter.parse(value);
		}
	}

	return value;
}

function parse(scale, input) {
	if (helpers.isNullOrUndef(input)) {
		return null;
	}

	var options = scale.options.time;
	var value = toTimestamp(scale, scale.getRightValue(input));
	if (value === null) {
		return value;
	}

	if (options.round) {
		value = +scale._adapter.startOf(value, options.round);
	}

	return value;
}

/**
 * Figures out what unit results in an appropriate number of auto-generated ticks
 */
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
	var ilen = UNITS.length;
	var i, interval, factor;

	for (i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) {
		interval = INTERVALS[UNITS[i]];
		factor = interval.steps ? interval.steps : MAX_INTEGER;

		if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
			return UNITS[i];
		}
	}

	return UNITS[ilen - 1];
}

/**
 * Figures out what unit to format a set of ticks with
 */
function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
	var i, unit;

	for (i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--) {
		unit = UNITS[i];
		if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
			return unit;
		}
	}

	return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}

function determineMajorUnit(unit) {
	for (var i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
		if (INTERVALS[UNITS[i]].common) {
			return UNITS[i];
		}
	}
}

/**
 * Generates a maximum of `capacity` timestamps between min and max, rounded to the
 * `minor` unit using the given scale time `options`.
 * Important: this method can return ticks outside the min and max range, it's the
 * responsibility of the calling code to clamp values if needed.
 */
function generate(scale, min, max, capacity) {
	var adapter = scale._adapter;
	var options = scale.options;
	var timeOpts = options.time;
	var minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, capacity);
	var stepSize = resolve([timeOpts.stepSize, timeOpts.unitStepSize, 1]);
	var weekday = minor === 'week' ? timeOpts.isoWeekday : false;
	var first = min;
	var ticks = [];
	var time;

	// For 'week' unit, handle the first day of week option
	if (weekday) {
		first = +adapter.startOf(first, 'isoWeek', weekday);
	}

	// Align first ticks on unit
	first = +adapter.startOf(first, weekday ? 'day' : minor);

	// Prevent browser from freezing in case user options request millions of milliseconds
	if (adapter.diff(max, min, minor) > 100000 * stepSize) {
		throw min + ' and ' + max + ' are too far apart with stepSize of ' + stepSize + ' ' + minor;
	}

	for (time = first; time < max; time = +adapter.add(time, stepSize, minor)) {
		ticks.push(time);
	}

	if (time === max || options.bounds === 'ticks') {
		ticks.push(time);
	}

	return ticks;
}

/**
 * Returns the start and end offsets from edges in the form of {start, end}
 * where each value is a relative width to the scale and ranges between 0 and 1.
 * They add extra margins on the both sides by scaling down the original scale.
 * Offsets are added when the `offset` option is true.
 */
function computeOffsets(table, ticks, min, max, options) {
	var start = 0;
	var end = 0;
	var first, last;

	if (options.offset && ticks.length) {
		first = interpolate(table, 'time', ticks[0], 'pos');
		if (ticks.length === 1) {
			start = 1 - first;
		} else {
			start = (interpolate(table, 'time', ticks[1], 'pos') - first) / 2;
		}
		last = interpolate(table, 'time', ticks[ticks.length - 1], 'pos');
		if (ticks.length === 1) {
			end = last;
		} else {
			end = (last - interpolate(table, 'time', ticks[ticks.length - 2], 'pos')) / 2;
		}
	}

	return {start: start, end: end, factor: 1 / (start + 1 + end)};
}

function setMajorTicks(scale, ticks, map, majorUnit) {
	var adapter = scale._adapter;
	var first = +adapter.startOf(ticks[0].value, majorUnit);
	var last = ticks[ticks.length - 1].value;
	var major, index;

	for (major = first; major <= last; major = +adapter.add(major, 1, majorUnit)) {
		index = map[major];
		if (index >= 0) {
			ticks[index].major = true;
		}
	}
	return ticks;
}

function ticksFromTimestamps(scale, values, majorUnit) {
	var ticks = [];
	var map = {};
	var ilen = values.length;
	var i, value;

	for (i = 0; i < ilen; ++i) {
		value = values[i];
		map[value] = i;

		ticks.push({
			value: value,
			major: false
		});
	}

	// We set the major ticks separately from the above loop because calling startOf for every tick
	// is expensive when there is a large number of ticks
	return (ilen === 0 || !majorUnit) ? ticks : setMajorTicks(scale, ticks, map, majorUnit);
}

var defaultConfig = {
	position: 'bottom',

	/**
	 * Data distribution along the scale:
	 * - 'linear': data are spread according to their time (distances can vary),
	 * - 'series': data are spread at the same distance from each other.
	 * @see https://github.com/chartjs/Chart.js/pull/4507
	 * @since 2.7.0
	 */
	distribution: 'linear',

	/**
	 * Scale boundary strategy (bypassed by min/max time options)
	 * - `data`: make sure data are fully visible, ticks outside are removed
	 * - `ticks`: make sure ticks are fully visible, data outside are truncated
	 * @see https://github.com/chartjs/Chart.js/pull/4556
	 * @since 2.7.0
	 */
	bounds: 'data',

	adapters: {},
	time: {
		parser: false, // false == a pattern string from https://momentjs.com/docs/#/parsing/string-format/ or a custom callback that converts its argument to a moment
		unit: false, // false == automatic or override with week, month, year, etc.
		round: false, // none, or override with week, month, year, etc.
		displayFormat: false, // DEPRECATED
		isoWeekday: false, // override week start day - see https://momentjs.com/docs/#/get-set/iso-weekday/
		minUnit: 'millisecond',
		displayFormats: {}
	},
	ticks: {
		autoSkip: false,

		/**
		 * Ticks generation input values:
		 * - 'auto': generates "optimal" ticks based on scale size and time options.
		 * - 'data': generates ticks from data (including labels from data {t|x|y} objects).
		 * - 'labels': generates ticks from user given `data.labels` values ONLY.
		 * @see https://github.com/chartjs/Chart.js/pull/4507
		 * @since 2.7.0
		 */
		source: 'auto',

		major: {
			enabled: false
		}
	}
};

module.exports = Scale.extend({
	initialize: function() {
		this.mergeTicksOptions();
		Scale.prototype.initialize.call(this);
	},

	update: function() {
		var me = this;
		var options = me.options;
		var time = options.time || (options.time = {});
		var adapter = me._adapter = new adapters._date(options.adapters.date);

		// DEPRECATIONS: output a message only one time per update
		deprecated('time scale', time.format, 'time.format', 'time.parser');
		deprecated('time scale', time.min, 'time.min', 'ticks.min');
		deprecated('time scale', time.max, 'time.max', 'ticks.max');

		// Backward compatibility: before introducing adapter, `displayFormats` was
		// supposed to contain *all* unit/string pairs but this can't be resolved
		// when loading the scale (adapters are loaded afterward), so let's populate
		// missing formats on update
		helpers.mergeIf(time.displayFormats, adapter.formats());

		return Scale.prototype.update.apply(me, arguments);
	},

	/**
	 * Allows data to be referenced via 't' attribute
	 */
	getRightValue: function(rawValue) {
		if (rawValue && rawValue.t !== undefined) {
			rawValue = rawValue.t;
		}
		return Scale.prototype.getRightValue.call(this, rawValue);
	},

	determineDataLimits: function() {
		var me = this;
		var chart = me.chart;
		var adapter = me._adapter;
		var options = me.options;
		var unit = options.time.unit || 'day';
		var min = MAX_INTEGER;
		var max = MIN_INTEGER;
		var timestamps = [];
		var datasets = [];
		var labels = [];
		var i, j, ilen, jlen, data, timestamp, labelsAdded;
		var dataLabels = me._getLabels();

		for (i = 0, ilen = dataLabels.length; i < ilen; ++i) {
			labels.push(parse(me, dataLabels[i]));
		}

		for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
			if (chart.isDatasetVisible(i)) {
				data = chart.data.datasets[i].data;

				// Let's consider that all data have the same format.
				if (helpers.isObject(data[0])) {
					datasets[i] = [];

					for (j = 0, jlen = data.length; j < jlen; ++j) {
						timestamp = parse(me, data[j]);
						timestamps.push(timestamp);
						datasets[i][j] = timestamp;
					}
				} else {
					datasets[i] = labels.slice(0);
					if (!labelsAdded) {
						timestamps = timestamps.concat(labels);
						labelsAdded = true;
					}
				}
			} else {
				datasets[i] = [];
			}
		}

		if (labels.length) {
			min = Math.min(min, labels[0]);
			max = Math.max(max, labels[labels.length - 1]);
		}

		if (timestamps.length) {
			timestamps = ilen > 1 ? arrayUnique(timestamps).sort(sorter) : timestamps.sort(sorter);
			min = Math.min(min, timestamps[0]);
			max = Math.max(max, timestamps[timestamps.length - 1]);
		}

		min = parse(me, getMin(options)) || min;
		max = parse(me, getMax(options)) || max;

		// In case there is no valid min/max, set limits based on unit time option
		min = min === MAX_INTEGER ? +adapter.startOf(Date.now(), unit) : min;
		max = max === MIN_INTEGER ? +adapter.endOf(Date.now(), unit) + 1 : max;

		// Make sure that max is strictly higher than min (required by the lookup table)
		me.min = Math.min(min, max);
		me.max = Math.max(min + 1, max);

		// PRIVATE
		me._table = [];
		me._timestamps = {
			data: timestamps,
			datasets: datasets,
			labels: labels
		};
	},

	buildTicks: function() {
		var me = this;
		var min = me.min;
		var max = me.max;
		var options = me.options;
		var tickOpts = options.ticks;
		var timeOpts = options.time;
		var timestamps = me._timestamps;
		var ticks = [];
		var capacity = me.getLabelCapacity(min);
		var source = tickOpts.source;
		var distribution = options.distribution;
		var i, ilen, timestamp;

		if (source === 'data' || (source === 'auto' && distribution === 'series')) {
			timestamps = timestamps.data;
		} else if (source === 'labels') {
			timestamps = timestamps.labels;
		} else {
			timestamps = generate(me, min, max, capacity, options);
		}

		if (options.bounds === 'ticks' && timestamps.length) {
			min = timestamps[0];
			max = timestamps[timestamps.length - 1];
		}

		// Enforce limits with user min/max options
		min = parse(me, getMin(options)) || min;
		max = parse(me, getMax(options)) || max;

		// Remove ticks outside the min/max range
		for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
			timestamp = timestamps[i];
			if (timestamp >= min && timestamp <= max) {
				ticks.push(timestamp);
			}
		}

		me.min = min;
		me.max = max;

		// PRIVATE
		// determineUnitForFormatting relies on the number of ticks so we don't use it when
		// autoSkip is enabled because we don't yet know what the final number of ticks will be
		me._unit = timeOpts.unit || (tickOpts.autoSkip
			? determineUnitForAutoTicks(timeOpts.minUnit, me.min, me.max, capacity)
			: determineUnitForFormatting(me, ticks.length, timeOpts.minUnit, me.min, me.max));
		me._majorUnit = !tickOpts.major.enabled || me._unit === 'year' ? undefined
			: determineMajorUnit(me._unit);
		me._table = buildLookupTable(me._timestamps.data, min, max, distribution);
		me._offsets = computeOffsets(me._table, ticks, min, max, options);

		if (tickOpts.reverse) {
			ticks.reverse();
		}

		return ticksFromTimestamps(me, ticks, me._majorUnit);
	},

	getLabelForIndex: function(index, datasetIndex) {
		var me = this;
		var adapter = me._adapter;
		var data = me.chart.data;
		var timeOpts = me.options.time;
		var label = data.labels && index < data.labels.length ? data.labels[index] : '';
		var value = data.datasets[datasetIndex].data[index];

		if (helpers.isObject(value)) {
			label = me.getRightValue(value);
		}
		if (timeOpts.tooltipFormat) {
			return adapter.format(toTimestamp(me, label), timeOpts.tooltipFormat);
		}
		if (typeof label === 'string') {
			return label;
		}
		return adapter.format(toTimestamp(me, label), timeOpts.displayFormats.datetime);
	},

	/**
	 * Function to format an individual tick mark
	 * @private
	 */
	tickFormatFunction: function(time, index, ticks, format) {
		var me = this;
		var adapter = me._adapter;
		var options = me.options;
		var formats = options.time.displayFormats;
		var minorFormat = formats[me._unit];
		var majorUnit = me._majorUnit;
		var majorFormat = formats[majorUnit];
		var tick = ticks[index];
		var tickOpts = options.ticks;
		var major = majorUnit && majorFormat && tick && tick.major;
		var label = adapter.format(time, format ? format : major ? majorFormat : minorFormat);
		var nestedTickOpts = major ? tickOpts.major : tickOpts.minor;
		var formatter = resolve([
			nestedTickOpts.callback,
			nestedTickOpts.userCallback,
			tickOpts.callback,
			tickOpts.userCallback
		]);

		return formatter ? formatter(label, index, ticks) : label;
	},

	convertTicksToLabels: function(ticks) {
		var labels = [];
		var i, ilen;

		for (i = 0, ilen = ticks.length; i < ilen; ++i) {
			labels.push(this.tickFormatFunction(ticks[i].value, i, ticks));
		}

		return labels;
	},

	/**
	 * @private
	 */
	getPixelForOffset: function(time) {
		var me = this;
		var offsets = me._offsets;
		var pos = interpolate(me._table, 'time', time, 'pos');
		return me.getPixelForDecimal((offsets.start + pos) * offsets.factor);
	},

	getPixelForValue: function(value, index, datasetIndex) {
		var me = this;
		var time = null;

		if (index !== undefined && datasetIndex !== undefined) {
			time = me._timestamps.datasets[datasetIndex][index];
		}

		if (time === null) {
			time = parse(me, value);
		}

		if (time !== null) {
			return me.getPixelForOffset(time);
		}
	},

	getPixelForTick: function(index) {
		var ticks = this.getTicks();
		return index >= 0 && index < ticks.length ?
			this.getPixelForOffset(ticks[index].value) :
			null;
	},

	getValueForPixel: function(pixel) {
		var me = this;
		var offsets = me._offsets;
		var pos = me.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
		var time = interpolate(me._table, 'pos', pos, 'time');

		// DEPRECATION, we should return time directly
		return me._adapter._create(time);
	},

	/**
	 * @private
	 */
	_getLabelSize: function(label) {
		var me = this;
		var ticksOpts = me.options.ticks;
		var tickLabelWidth = me.ctx.measureText(label).width;
		var angle = helpers.toRadians(me.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
		var cosRotation = Math.cos(angle);
		var sinRotation = Math.sin(angle);
		var tickFontSize = valueOrDefault(ticksOpts.fontSize, defaults.global.defaultFontSize);

		return {
			w: (tickLabelWidth * cosRotation) + (tickFontSize * sinRotation),
			h: (tickLabelWidth * sinRotation) + (tickFontSize * cosRotation)
		};
	},

	/**
	 * Crude approximation of what the label width might be
	 * @private
	 */
	getLabelWidth: function(label) {
		return this._getLabelSize(label).w;
	},

	/**
	 * @private
	 */
	getLabelCapacity: function(exampleTime) {
		var me = this;
		var timeOpts = me.options.time;
		var displayFormats = timeOpts.displayFormats;

		// pick the longest format (milliseconds) for guestimation
		var format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
		var exampleLabel = me.tickFormatFunction(exampleTime, 0, ticksFromTimestamps(me, [exampleTime], me._majorUnit), format);
		var size = me._getLabelSize(exampleLabel);
		var capacity = Math.floor(me.isHorizontal() ? me.width / size.w : me.height / size.h);

		if (me.options.offset) {
			capacity--;
		}

		return capacity > 0 ? capacity : 1;
	}
});

// INTERNAL: static default options, registered in src/index.js
module.exports._defaults = defaultConfig;
