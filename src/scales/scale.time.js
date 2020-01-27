'use strict';

import adapters from '../core/core.adapters';
import {isFinite, isNullOrUndef, mergeIf, valueOrDefault} from '../helpers/helpers.core';
import Scale from '../core/core.scale';
import {_lookup, _lookupByKey} from '../helpers/helpers.collection';
import {_limitValue, toRadians} from '../helpers/helpers.math';

/**
 * @typedef {import('../core/core.adapters').Unit} Unit
 */

const INTERVALS = {
	millisecond: {
		common: true,
		maxSpan: 5000,
		steps: [1, 2, 5, 10, 20, 50, 100, 250, 500]
	},
	second: {
		common: true,
		maxSpan: 600,
		steps: [1, 2, 5, 10, 15, 30]
	},
	minute: {
		common: true,
		maxSpan: 600,
		steps: [1, 2, 5, 10, 15, 30]
	},
	hour: {
		common: true,
		maxSpan: 120,
		steps: [1]
	},
	day: {
		common: true,
		maxSpan: 150,
		steps: [1]
	},
	week: {
		common: false,
		maxSpan: 12,
		steps: [1, 2, 4]
	},
	month: {
		common: true,
		maxSpan: 60,
		steps: [1, 2, 3, 6]
	},
	quarter: {
		common: false,
		maxSpan: 20,
		steps: [1, 2]
	},
	year: {
		common: true,
		maxSpan: 1000,
		steps: [1, 2, 4, 5, 10, 20, 40, 50, 100]
	}
};

const UNITS = /** @type Unit[] */(Object.keys(INTERVALS));

/**
 * @param {number} a
 * @param {number} b
 */
function sorter(a, b) {
	return a - b;
}

/**
 * @param {any[]} items
 */
function arrayUnique(items) {
	const set = new Set();
	let i, ilen;

	for (i = 0, ilen = items.length; i < ilen; ++i) {
		set.add(items[i]);
	}

	if (set.size === ilen) {
		return items;
	}

	return [...set];
}

/**
 * @param {TimeScale} scale
 * @param {any} input
 */
function parse(scale, input) {
	if (isNullOrUndef(input)) {
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
	if (!isFinite(value)) {
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
 * @param {TimeScale} scale
 */
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

/**
 * @param {TimeScale} scale
 */
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

/**
 * @param {TimeScale} scale
 */
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

/**
 * Returns an array of {time, pos} objects used to interpolate a specific `time` or position
 * (`pos`) on the scale, by searching entries before and after the requested value. `pos` is
 * a decimal between 0 and 1: 0 being the start of the scale (left or top) and 1 the other
 * extremity (left + width or top + height). Note that it would be more optimized to directly
 * store pre-computed pixels, but the scale dimensions are not guaranteed at the time we need
 * to create the lookup table. The table ALWAYS contains at least two items: min and max.
 * @param {number[]} timestamps - timestamps sorted from lowest to highest.
 * @param {number} min
 * @param {number} max
 * @param {string} distribution - If 'linear', timestamps will be spread linearly along the min
 * and max range, so basically, the table will contains only two items: {min, 0} and {max, 1}.
 * If 'series', timestamps will be positioned at the same distance from each other. In this
 * case, only timestamps that break the time linearity are registered, meaning that in the
 * best case, all timestamps are linear, the table contains only min and max.
 * @return {{time: number, pos: number}[]}
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

/**
 * Linearly interpolates the given source `value` using the table items `skey` values and
 * returns the associated `tkey` value. For example, interpolate(table, 'time', 42, 'pos')
 * returns the position for a timestamp equal to 42. If value is out of bounds, values at
 * index [0, 1] or [n - 1, n] are used for the interpolation.
 * @param {{time: number, pos: number}[]} table
 * @param {string} skey
 * @param {number} sval
 * @param {string} tkey
 */
function interpolate(table, skey, sval, tkey) {
	const {lo, hi} = _lookupByKey(table, skey, sval);

	// Note: the lookup table ALWAYS contains at least 2 items (min and max)
	const prev = table[lo];
	const next = table[hi];

	const span = next[skey] - prev[skey];
	const ratio = span ? (sval - prev[skey]) / span : 0;
	const offset = (next[tkey] - prev[tkey]) * ratio;

	return prev[tkey] + offset;
}

/**
 * @param {string | any[]} arr
 * @param {any} value
 * @param {number} def
 */
function indexOfOrDefault(arr, value, def) {
	const index = arr.indexOf(value);
	return _limitValue(index < 0 ? def : index, 0, arr.length - 1);
}

/**
 * @param {TimeScale} scale
 */
function determineUnits(scale) {
	const options = scale.options;
	const timeOpts = options.time;
	const minUnit = timeOpts.unit || timeOpts.minUnit;
	const maxUnit = timeOpts.unit || timeOpts.maxUnit;
	const availableUnits = timeOpts.units || UNITS.filter(unit => unit === minUnit || unit === maxUnit || INTERVALS[unit].common);
	const majors = options.ticks.major.enabled && availableUnits.length > 1;
	const maxIndex = indexOfOrDefault(availableUnits, maxUnit, availableUnits.length - 1);
	const min = scale.min;
	const max = scale.max;
	let minIndex = indexOfOrDefault(availableUnits, minUnit, 0);
	for (; minIndex < maxIndex; ++minIndex) {
		const unit = availableUnits[minIndex];
		if (scale._adapter.diff(max, min, unit) < INTERVALS[unit].maxSpan) {
			break;
		}
	}

	let units = availableUnits.slice(minIndex, (majors ? maxIndex : minIndex) + 1);
	if (!units.length) {
		units.push(availableUnits[maxIndex]);
	}

	return units;
}

/**
 * @param {TimeScale} scale
 * @param {number} time
 * @param {Unit} unit
 */
function roundDown(scale, time, unit) {
	const adapter = scale._adapter;
	const weekday = unit === 'week' ? scale.options.time.isoWeekday : false;
	return weekday ? +adapter.startOf(time, 'isoWeek', weekday) : +adapter.startOf(time, unit);
}

/**
 * @param {TimeScale} scale
 * @param {number} time
 * @param {Unit} unit
 * @param {boolean} [excludeTime]
 */
function roundUp(scale, time, unit, excludeTime) {
	const next = scale._adapter.add(time, 1, unit);
	const roundNext = roundDown(scale, next, unit);
	return !excludeTime && roundNext === next ? time : roundNext;
}

/**
 * @param {TimeScale} scale
 * @param {boolean} extendBounds
 */
function getMajors(scale, extendBounds) {
	const units = scale._units;
	const minor = units[0];
	const roundFirst = extendBounds ? roundDown : roundUp;
	const roundLast = extendBounds ? roundUp : roundDown;
	const first = scale._userMin || roundFirst(scale, scale.min, minor);
	const last = scale._userMax || roundLast(scale, scale.max, minor);
	const majors = {};
	for (let i = 1; i < units.length; ++i) {
		const unit = units[i];
		const time = roundUp(scale, first, unit);
		if (time > last) {
			break;
		}
		majors[unit] = time;
	}
	return {first, last, majors};
}

/**
 * @param {TimeScale} scale
 * @param {Object.<Unit, number>} majors
 * @param {Unit} unit
 */
function updateMajors(scale, majors, unit) {
	const units = scale._units;
	const time = majors[unit] + 1000; // make sure we get the next major, even if matching
	for (let i = units.indexOf(unit); i > 0; --i) {
		const majorUnit = units[i];
		majors[majorUnit] = roundUp(scale, time, majorUnit, true);
	}
}

/**
 * @param {number} time
 * @param {Unit[]} units
 * @param {Object<Unit, number>} majors
 */
function getUnit(time, units, majors) {
	for (let i = units.length - 1; i > 0; --i) {
		const unit = units[i];
		if (time >= majors[unit]) {
			return unit;
		}
	}
	return units[0];
}

/**
 * @param {{ value: number; }} tick
 * @param {number[]} timestamps
 */
function alignTickToData(tick, timestamps) {
	if (!timestamps) {
		return;
	}
	const {lo, hi} = _lookup(timestamps, tick.value);
	tick.value = timestamps[lo] >= tick.value ? timestamps[lo] : timestamps[hi];
}


/**
 * @param {{value: number, unit: Unit, level: number}} tick
 * @param {{index: number, level: number, offset: number, pos: number}} prevPos
 * @param {number} offset
 * @param {boolean} sameSlot
 */
function shouldReplaceTick(tick, prevPos, offset, sameSlot) {
	return ((tick.level > prevPos.level) ||
		(sameSlot && tick.level === prevPos.level && offset < prevPos.offset));
}

/**
 * Add a tick to ticks, considering available slots
 * @param {TimeScale} scale
 * @param {{value: number, unit: Unit, level: number}} tick
 * @param {{value: number, unit: Unit, level: number}[]} ticks
 * @param {{index: number, level: number, offset: number, pos: number}[]} positions
 * @return {boolean|number} - The new length of ticks or `false` if the tick was not added
 */
function addTick(scale, tick, ticks, positions) {
	const prev = positions[positions.length - 1] || /** @type {{index: number, level: number, offset: number, pos: number}} */ ({});
	const slots = scale._slots;
	const extension = scale.options.bounds === 'ticks' ? 1 / slots : 0;
	const pos = _limitValue(interpolate(scale._table, 'time', tick.value, 'pos'), -extension, 1 + extension) * slots;
	const index = Math.round(pos);
	const offset = Math.abs(pos - index);
	const sameSlot = prev.index === index;
	// Minimum distance between ticks is 75% of the slots size
	const tooClose = prev && (pos - prev.pos) < 0.8;

	if (sameSlot || tooClose) {
		if (ticks.length > 1 && shouldReplaceTick(tick, prev, offset, sameSlot)) {
			ticks.pop();
			positions.pop();
		} else {
			return false;
		}
	}
	positions.push({index, level: tick.level, offset, pos});

	return ticks.push(tick);
}

/**
 * Create a tick for given timestamp
 * @param {TimeScale} scale - the scale
 * @param {number} value - the timestamp
 * @param {Unit[]} units - available units
 * @param {Object<Unit, number>} majors - timestamps for the major units
 */
function createTick(scale, value, units, majors) {
	const unit = getUnit(value, units, majors);
	const major = unit !== units[0];
	if (major) {
		value = majors[unit];
		updateMajors(scale, majors, unit);
	}
	return {level: major ? units.indexOf(unit) : 0, major, unit, value};
}

/**
 * Generate ticks
 * @param {TimeScale} scale - the scale
 * @param {Unit[]} units - available units to use, in order from smallest to largest
 */
function generate(scale, units) {
	const {_adapter: adapter, options, max, _stepSize} = scale;
	const extendBounds = options.bounds === 'ticks';
	const positions = [];
	const minor = units[0];
	const ticks = [];
	const timestamps = options.ticks.source === 'data' && getDataTimestamps(scale);
	const {first, last, majors} = getMajors(scale, extendBounds);
	let value = first;

	for (; value < last; value = +adapter.add(value, _stepSize, minor)) {
		const tick = createTick(scale, value, units, majors);
		value = tick.value;
		if (value > last) {
			break;
		}
		alignTickToData(tick, timestamps);
		addTick(scale, tick, ticks, positions);
	}
	if (!extendBounds || scale._userMax) {
		value = max;
	}

	const tick = createTick(scale, value, units, majors);
	if (!addTick(scale, tick, ticks, positions) && ticks.length > 1) {
		// We want to include the last tick, rather than the one before that
		// Unless its of a greater unit than the last one
		const prev = ticks.pop();
		ticks.push(prev.level > tick.level ? prev : tick);
	}

	return ticks;
}

/**
 * Returns the start and end offsets from edges in the form of {start, end}
 * where each value is a relative width to the scale and ranges between 0 and 1.
 * They add extra margins on the both sides by scaling down the original scale.
 * Offsets are added when the `offset` option is true.
 * @param {{time: number, pos: number}[]} table
 * @param {string | any[]} ticks
 * @param {{ offset: boolean; }} options
 */
function computeOffsets(table, ticks, options) {
	let start = 0;
	let end = 0;
	let first, last;

	if (options.offset && ticks.length) {
		first = interpolate(table, 'time', ticks[0].value, 'pos');
		if (ticks.length === 1) {
			start = 1 - first;
		} else {
			start = (interpolate(table, 'time', ticks[1].value, 'pos') - first) / 2;
		}
		last = interpolate(table, 'time', ticks[ticks.length - 1].value, 'pos');
		if (ticks.length === 1) {
			end = last;
		} else {
			end = (last - interpolate(table, 'time', ticks[ticks.length - 2].value, 'pos')) / 2;
		}
	}

	return {start: start, end: end, factor: 1 / (start + 1 + end)};
}

/**
 * @param {TimeScale} scale
 * @param {number[]} values
 * @param {Unit} majorUnit
 */
function ticksFromTimestamps(scale, values, majorUnit) {
	const {_adapter: adapter, _userMin, _userMax} = scale;
	const ticks = [];
	const ilen = values.length;
	const unit = scale._unit;
	let nextMajor = majorUnit && +adapter.startOf(values[0], majorUnit);

	for (let i = 0; i < ilen; ++i) {
		let value = values[i];
		if (value < _userMin || value > _userMax) {
			continue;
		}
		let major = false;
		if (nextMajor) {
			if (value > nextMajor) {
				nextMajor = roundUp(scale, value, majorUnit);
			}
			major = value === nextMajor;
		}
		ticks.push({
			major,
			unit: major ? majorUnit : unit,
			value
		});

	}
	return ticks;
}

/**
 * @param {TimeScale} scale
 */
function getTimestampsForTable(scale) {
	return scale.options.distribution === 'series'
		? getAllTimestamps(scale)
		: [scale.min, scale.max];
}

/**
 * @param {TimeScale} scale
 */
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
 * Determine maximum number of slots, where a tick can be placed.
 * @param {TimeScale} scale
 */
function determineMaxSlots(scale) {
	const tickOpts = scale.options.ticks;
	const spacing = valueOrDefault(tickOpts.spacing, 10);
	const horizontal = scale.isHorizontal();
	const font = scale._resolveTickFontOptions(0);
	const h = font.lineHeight + spacing;
	const angle = toRadians(horizontal ? tickOpts.maxRotation : tickOpts.minRotation);
	const cos = Math.abs(Math.cos(angle));
	const sin = Math.abs(Math.sin(angle));
	const ctx = scale.ctx;
	let w = 0;

	ctx.save();
	ctx.font = font.string;
	scale._units.forEach(unit => {
		const label = scale._tickFormatFunction({value: scale.min, unit}, 0, []);
		w = Math.max(w, ctx.measureText(label).width);
	});
	w += spacing;
	ctx.restore();

	const interval = horizontal
		? h * cos < w * sin ? h / sin : w / cos
		: h * sin < w * cos ? h / cos : w / sin;

	return _limitValue(Math.round(scale._length / interval), 1, tickOpts.maxTicksLimit || 1000);
}

/**
 * Determine the stepSize.
 * @param {TimeScale} scale
 */
function determineStepSize(scale) {
	const unit = scale._unit;
	const count = scale._adapter.diff(scale.max, scale.min, unit) + 1;
	const interval = INTERVALS[unit];
	const steps = interval.steps;
	const target = Math.max(Math.ceil(count / scale._maxSlots), 1);
	let step = steps[0];

	for (let i = 0; i < steps.length && step < target; ++i) {
		step = steps[i];
	}

	scale._steps = count;
	// align the _maxSlots with stepSize, if possible
	scale._slots = _limitValue(Math.ceil(count / step) + 1, 1, scale._maxSlots);
	return step;
}

/**
 * @param {TimeScale} scale
 */
function generateTicks(scale) {
	const options = scale.options;
	const timeOpts = options.time;
	const autoSkip = options.ticks.autoSkip;
	const units = determineUnits(scale);
	scale._units = units;
	scale._unit = units[0];
	scale._majorUnit = units[1];
	scale._maxSlots = scale._slots = autoSkip ? 1000 : determineMaxSlots(scale);
	scale._stepSize = timeOpts.stepSize || (autoSkip ? 1 : determineStepSize(scale));

	return options.ticks.source === 'labels'
		? ticksFromTimestamps(scale, getLabelTimestamps(scale), scale._majorUnit)
		: generate(scale, units);
}

const defaultConfig = {
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

	constructor(props) {
		super(props);

		const options = this.options;
		const time = options.time || (options.time = {});
		const adapter = this._adapter = new adapters._date(options.adapters.date);


		this._cache = {};

		/** @type {Unit | undefined} */
		this._unit = undefined;
		/** @type {Unit | undefined} */
		this._majorUnit = undefined;
		/** @type {object | undefined} */
		this._offsets = undefined;
		/** @type {{time: number, pos: number}[] | undefined} */
		this._table = undefined;
		/** @type {Unit[] | undefined} */
		this._units = undefined;
		/** @type {number | undefined} */
		this._maxSlots = undefined;
		/** @type {number | undefined} */
		this._steps = undefined;
		/** @type {number | undefined} */
		this._slots = undefined;
		/** @type {number | undefined} */
		this._stepSize = undefined;

		// Backward compatibility: before introducing adapter, `displayFormats` was
		// supposed to contain *all* unit/string pairs but this can't be resolved
		// when loading the scale (adapters are loaded afterward), so let's populate
		// missing formats here
		mergeIf(time.displayFormats, adapter.formats());
	}

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

		min = isFinite(min) ? min : +adapter.startOf(Date.now(), unit);
		max = isFinite(max) ? max : +adapter.endOf(Date.now(), unit) + 1;

		// Make sure that max is strictly higher than min (required by the lookup table)
		me.min = Math.min(min, max);
		me.max = Math.max(min + 1, max);
	}

	buildTicks() {
		const me = this;
		const options = me.options;
		const distribution = options.distribution;
		const min = me.min;
		const max = me.max;

		me._table = buildLookupTable(getTimestampsForTable(me), min, max, distribution);

		const ticks = generateTicks(me);

		if (options.bounds === 'ticks') {
			me.min = me._userMin || ticks[0].value;
			me.max = me._userMax || ticks[ticks.length - 1].value;
			me._table = buildLookupTable(getTimestampsForTable(me), me.min, me.max, distribution);
		}
		me._offsets = computeOffsets(me._table, ticks, options);

		if (options.reverse) {
			ticks.reverse();
		}

		return ticks;
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
	 * @param {{ value: number; unit: string; }} tick
	 * @param {number} index
	 * @param {any} ticks
	 * @private
	 */
	_tickFormatFunction(tick, index, ticks) {
		const me = this;
		const options = me.options;
		const label = me._adapter.format(tick.value, options.time.displayFormats[tick.unit]);
		const formatter = options.ticks.callback;
		return formatter ? formatter(label, index, ticks) : label;
	}

	generateTickLabels(ticks) {
		let i, ilen, tick;

		for (i = 0, ilen = ticks.length; i < ilen; ++i) {
			tick = ticks[i];
			tick.label = this._tickFormatFunction(tick, i, ticks);
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
		const ticks = this.ticks;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return this.getPixelForValue(ticks[index].value);
	}

	getValueForPixel(pixel) {
		const me = this;
		const offsets = me._offsets;
		const pos = me.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
		return Math.round(interpolate(me._table, 'pos', pos, 'time'));
	}
}

// INTERNAL: static default options, registered in src/index.js
TimeScale._defaults = defaultConfig;
export default TimeScale;
