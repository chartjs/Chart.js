'use strict';

import adapters from '../core/core.adapters';
import defaults from '../core/core.defaults';
import helpers from '../helpers/index';
import Scale from '../core/core.scale';

const resolve = helpers.options.resolve;
const valueOrDefault = helpers.valueOrDefault;

// Integer constants are from the ES6 spec.
const MAX_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

const INTERVALS = {
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

const UNITS = Object.keys(INTERVALS);

function sorter(a, b) {
	return a - b;
}

function arrayUnique(items) {
	const hash = {};
	const out = [];
	let i, ilen, item;

	for (i = 0, ilen = items.length; i < ilen; ++i) {
		item = items[i];
		if (!hash[item]) {
			hash[item] = true;
			out.push(item);
		}
	}

	return out;
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

	const table = [];
	const items = [min];
	let i, ilen, prev, curr, next;

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
	let lo = 0;
	let hi = table.length - 1;
	let mid, i0, i1;

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
	const range = lookup(table, skey, sval);

	// Note: the lookup table ALWAYS contains at least 2 items (min and max)
	const prev = !range.lo ? table[0] : !range.hi ? table[table.length - 2] : range.lo;
	const next = !range.lo ? table[1] : !range.hi ? table[table.length - 1] : range.hi;

	const span = next[skey] - prev[skey];
	const ratio = span ? (sval - prev[skey]) / span : 0;
	const offset = (next[tkey] - prev[tkey]) * ratio;

	return prev[tkey] + offset;
}

function parse(scale, input) {
	if (helpers.isNullOrUndef(input)) {
		return null;
	}

	const adapter = scale._adapter;
	const options = scale.options.time;
	const parser = options.parser;
	let value = input;

	if (typeof parser === 'function') {
		value = parser(value);
	}

	// Only parse if its not a timestamp already
	if (!helpers.isFinite(value)) {
		value = typeof parser === 'string'
			? adapter.parse(value, parser)
			: adapter.parse(value);
	}

	if (value === null) {
		return value;
	}

	if (options.round) {
		value = scale._adapter.startOf(value, options.round);
	}

	return +value;
}

/**
 * Figures out what unit results in an appropriate number of auto-generated ticks
 */
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
	const ilen = UNITS.length;
	let i, interval, factor;

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
	let i, unit;

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
	const adapter = scale._adapter;
	const options = scale.options;
	const timeOpts = options.time;
	const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, capacity);
	const stepSize = resolve([timeOpts.stepSize, timeOpts.unitStepSize, 1]);
	const weekday = minor === 'week' ? timeOpts.isoWeekday : false;
	const ticks = [];
	let first = min;
	let time;

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
	let start = 0;
	let end = 0;
	let first, last;

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
	const adapter = scale._adapter;
	const first = +adapter.startOf(ticks[0].value, majorUnit);
	const last = ticks[ticks.length - 1].value;
	let major, index;

	for (major = first; major <= last; major = +adapter.add(major, 1, majorUnit)) {
		index = map[major];
		if (index >= 0) {
			ticks[index].major = true;
		}
	}
	return ticks;
}

function ticksFromTimestamps(scale, values, majorUnit) {
	const ticks = [];
	const map = {};
	const ilen = values.length;
	let i, value;

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

function getDataTimestamps(scale) {
	const isSeries = scale.options.distribution === 'series';
	let timestamps = scale._cache.data || [];
	let i, ilen, metas;

	if (timestamps.length) {
		return timestamps;
	}

	metas = scale._getMatchingVisibleMetas();

	if (isSeries && metas.length) {
		return metas[0].controller._getAllParsedValues(scale);
	}

	for (i = 0, ilen = metas.length; i < ilen; ++i) {
		timestamps = timestamps.concat(metas[i].controller._getAllParsedValues(scale));
	}

	// We can not assume data is in order or unique - not even for single dataset
	// It seems to be somewhat faster to do sorting first
	return (scale._cache.data = arrayUnique(timestamps.sort(sorter)));
}

function getLabelTimestamps(scale) {
	const isSeries = scale.options.distribution === 'series';
	const timestamps = scale._cache.labels || [];
	let i, ilen, labels;

	if (timestamps.length) {
		return timestamps;
	}

	labels = scale._getLabels();
	for (i = 0, ilen = labels.length; i < ilen; ++i) {
		timestamps.push(parse(scale, labels[i]));
	}

	// We could assume labels are in order and unique - but let's not
	return (scale._cache.labels = isSeries ? timestamps : arrayUnique(timestamps.sort(sorter)));
}

function getAllTimestamps(scale) {
	let timestamps = scale._cache.all || [];
	let label, data;

	if (timestamps.length) {
		return timestamps;
	}

	data = getDataTimestamps(scale);
	label = getLabelTimestamps(scale);
	if (data.length && label.length) {
		// If combining labels and data (data might not contain all labels),
		// we need to recheck uniqueness and sort
		timestamps = arrayUnique(data.concat(label).sort(sorter));
	} else {
		timestamps = data.length ? data : label;
	}
	timestamps = scale._cache.all = timestamps;

	return timestamps;
}


function getTimestampsForTicks(scale) {
	const min = scale.min;
	const max = scale.max;
	const options = scale.options;
	const capacity = scale._getLabelCapacity(min);
	const source = options.ticks.source;
	let timestamps;

	if (source === 'data' || (source === 'auto' && options.distribution === 'series')) {
		timestamps = getAllTimestamps(scale);
	} else if (source === 'labels') {
		timestamps = getLabelTimestamps(scale);
	} else {
		timestamps = generate(scale, min, max, capacity, options);
	}

	return timestamps;
}

function getTimestampsForTable(scale) {
	return scale.options.distribution === 'series'
		? getAllTimestamps(scale)
		: [scale.min, scale.max];
}

function getLabelBounds(scale) {
	const arr = getLabelTimestamps(scale);
	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;

	if (arr.length) {
		min = arr[0];
		max = arr[arr.length - 1];
	}
	return {min, max};
}

/**
 * Return subset of `timestamps` between `min` and `max`.
 * Timestamps are assumend to be in sorted order.
 * @param {int[]} timestamps - array of timestamps
 * @param {int} min - min value (timestamp)
 * @param {int} max - max value (timestamp)
 */
function filterBetween(timestamps, min, max) {
	let start = 0;
	let end = timestamps.length - 1;

	while (start < end && timestamps[start] < min) {
		start++;
	}
	while (end > start && timestamps[end] > max) {
		end--;
	}
	end++; // slice does not include last element

	return start > 0 || end < timestamps.length
		? timestamps.slice(start, end)
		: timestamps;
}

const defaultConfig = {
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

class TimeScale extends Scale {
	_parse(raw, index) { // eslint-disable-line no-unused-vars
		if (raw === undefined) {
			return NaN;
		}
		return parse(this, raw);
	}

	_parseObject(obj, axis, index) {
		if (obj && obj.t) {
			return this._parse(obj.t, index);
		}
		if (obj[axis] !== undefined) {
			return this._parse(obj[axis], index);
		}
		return null;
	}

	_invalidateCaches() {
		this._cache = {};
	}

	constructor(props) {
		super(props);

		const me = this;
		const options = me.options;
		const time = options.time || (options.time = {});
		const adapter = me._adapter = new adapters._date(options.adapters.date);


		me._cache = {};

		// Backward compatibility: before introducing adapter, `displayFormats` was
		// supposed to contain *all* unit/string pairs but this can't be resolved
		// when loading the scale (adapters are loaded afterward), so let's populate
		// missing formats on update

		helpers.mergeIf(time.displayFormats, adapter.formats());
	}

	determineDataLimits() {
		const me = this;
		const options = me.options;
		const adapter = me._adapter;
		const unit = options.time.unit || 'day';
		let {min, max, minDefined, maxDefined} = me._getUserBounds();

		function _applyBounds(bounds) {
			if (!minDefined && !isNaN(bounds.min)) {
				min = Math.min(min, bounds.min);
			}
			if (!maxDefined && !isNaN(bounds.max)) {
				max = Math.max(max, bounds.max);
			}
		}

		// If we have user provided `min` and `max` labels / data bounds can be ignored
		if (!minDefined || !maxDefined) {
			// Labels are always considered, when user did not force bounds
			_applyBounds(getLabelBounds(me));

			// If `bounds` is `'ticks'` and `ticks.source` is `'labels'`,
			// data bounds are ignored (and don't need to be determined)
			if (options.bounds !== 'ticks' || options.ticks.source !== 'labels') {
				_applyBounds(me._getMinMax(false));
			}
		}

		min = helpers.isFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
		max = helpers.isFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;

		// Make sure that max is strictly higher than min (required by the lookup table)
		me.min = Math.min(min, max);
		me.max = Math.max(min + 1, max);
	}

	buildTicks() {
		const me = this;
		const options = me.options;
		const timeOpts = options.time;
		const tickOpts = options.ticks;
		const distribution = options.distribution;

		const timestamps = getTimestampsForTicks(me);

		if (options.bounds === 'ticks' && timestamps.length) {
			me.min = me._userMin || timestamps[0];
			me.max = me._userMax || timestamps[timestamps.length - 1];
		}

		const min = me.min;
		const max = me.max;

		const ticks = filterBetween(timestamps, min, max);

		// PRIVATE
		// determineUnitForFormatting relies on the number of ticks so we don't use it when
		// autoSkip is enabled because we don't yet know what the final number of ticks will be
		me._unit = timeOpts.unit || (tickOpts.autoSkip
			? determineUnitForAutoTicks(timeOpts.minUnit, me.min, me.max, me._getLabelCapacity(min))
			: determineUnitForFormatting(me, ticks.length, timeOpts.minUnit, me.min, me.max));
		me._majorUnit = !tickOpts.major.enabled || me._unit === 'year' ? undefined
			: determineMajorUnit(me._unit);
		me._table = buildLookupTable(getTimestampsForTable(me), min, max, distribution);
		me._offsets = computeOffsets(me._table, ticks, min, max, options);

		if (options.reverse) {
			ticks.reverse();
		}

		return ticksFromTimestamps(me, ticks, me._majorUnit);
	}

	getLabelForValue(value) {
		const me = this;
		const adapter = me._adapter;
		const timeOpts = me.options.time;

		if (timeOpts.tooltipFormat) {
			return adapter.format(value, timeOpts.tooltipFormat);
		}
		return adapter.format(value, timeOpts.displayFormats.datetime);
	}

	/**
	 * Function to format an individual tick mark
	 * @private
	 */
	_tickFormatFunction(time, index, ticks, format) {
		const me = this;
		const adapter = me._adapter;
		const options = me.options;
		const formats = options.time.displayFormats;
		const minorFormat = formats[me._unit];
		const majorUnit = me._majorUnit;
		const majorFormat = formats[majorUnit];
		const tick = ticks[index];
		const tickOpts = options.ticks;
		const major = majorUnit && majorFormat && tick && tick.major;
		const label = adapter.format(time, format ? format : major ? majorFormat : minorFormat);
		const nestedTickOpts = major ? tickOpts.major : tickOpts.minor;
		const formatter = resolve([
			nestedTickOpts.callback,
			tickOpts.callback
		]);

		return formatter ? formatter(label, index, ticks) : label;
	}

	generateTickLabels(ticks) {
		let i, ilen, tick;

		for (i = 0, ilen = ticks.length; i < ilen; ++i) {
			tick = ticks[i];
			tick.label = this._tickFormatFunction(tick.value, i, ticks);
		}
	}

	/**
	 * @param {number} value - Milliseconds since epoch (1 January 1970 00:00:00 UTC)
	 */
	getPixelForValue(value) {
		const me = this;
		const offsets = me._offsets;
		const pos = interpolate(me._table, 'time', value, 'pos');
		return me.getPixelForDecimal((offsets.start + pos) * offsets.factor);
	}

	getPixelForTick(index) {
		const ticks = this.getTicks();
		return index >= 0 && index < ticks.length ?
			this.getPixelForValue(ticks[index].value) :
			null;
	}

	getValueForPixel(pixel) {
		const me = this;
		const offsets = me._offsets;
		const pos = me.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
		return interpolate(me._table, 'pos', pos, 'time');
	}

	/**
	 * @private
	 */
	_getLabelSize(label) {
		const me = this;
		const ticksOpts = me.options.ticks;
		const tickLabelWidth = me.ctx.measureText(label).width;
		const angle = helpers.toRadians(me.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
		const cosRotation = Math.cos(angle);
		const sinRotation = Math.sin(angle);
		const tickFontSize = valueOrDefault(ticksOpts.fontSize, defaults.global.defaultFontSize);

		return {
			w: (tickLabelWidth * cosRotation) + (tickFontSize * sinRotation),
			h: (tickLabelWidth * sinRotation) + (tickFontSize * cosRotation)
		};
	}

	/**
	 * @private
	 */
	_getLabelCapacity(exampleTime) {
		const me = this;
		const timeOpts = me.options.time;
		const displayFormats = timeOpts.displayFormats;

		// pick the longest format (milliseconds) for guestimation
		const format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
		const exampleLabel = me._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(me, [exampleTime], me._majorUnit), format);
		const size = me._getLabelSize(exampleLabel);
		let capacity = Math.floor(me.isHorizontal() ? me.width / size.w : me.height / size.h);

		if (me.options.offset) {
			capacity--;
		}

		return capacity > 0 ? capacity : 1;
	}
}

// INTERNAL: static default options, registered in src/index.js
TimeScale._defaults = defaultConfig;
export default TimeScale;
