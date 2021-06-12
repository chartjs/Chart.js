import adapters from '../core/core.adapters';
import {callback as call, isFinite, isNullOrUndef, mergeIf, valueOrDefault} from '../helpers/helpers.core';
import {toRadians, isNumber, _limitValue} from '../helpers/helpers.math';
import Scale from '../core/core.scale';
import {_arrayUnique, _filterBetween, _lookup} from '../helpers/helpers.collection';

/**
 * @typedef { import("../core/core.adapters").Unit } Unit
 * @typedef {{common: boolean, size: number, steps?: number}} Interval
 */

/**
 * @type {Object<Unit, Interval>}
 */
const INTERVALS = {
  millisecond: {common: true, size: 1, steps: 1000},
  second: {common: true, size: 1000, steps: 60},
  minute: {common: true, size: 60000, steps: 60},
  hour: {common: true, size: 3600000, steps: 24},
  day: {common: true, size: 86400000, steps: 30},
  week: {common: false, size: 604800000, steps: 4},
  month: {common: true, size: 2.628e9, steps: 12},
  quarter: {common: false, size: 7.884e9, steps: 4},
  year: {common: true, size: 3.154e10}
};

/**
 * @type {Unit[]}
 */
const UNITS = /** @type Unit[] */(Object.keys(INTERVALS));

/**
 * @param {number} a
 * @param {number} b
 */
function sorter(a, b) {
  return a - b;
}

/**
 * @param {TimeScale} scale
 * @param {*} input
 * @return {number}
 */
function parse(scale, input) {
  if (isNullOrUndef(input)) {
    return null;
  }

  const adapter = scale._adapter;
  const {parser, round, isoWeekday} = scale._parseOpts;
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
    return null;
  }

  if (round) {
    value = round === 'week' && (isNumber(isoWeekday) || isoWeekday === true)
      ? adapter.startOf(value, 'isoWeek', isoWeekday)
      : adapter.startOf(value, round);
  }

  return +value;
}

/**
 * Figures out what unit results in an appropriate number of auto-generated ticks
 * @param {Unit} minUnit
 * @param {number} min
 * @param {number} max
 * @param {number} capacity
 * @return {object}
 */
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
  const ilen = UNITS.length;

  for (let i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) {
    const interval = INTERVALS[UNITS[i]];
    const factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER;

    if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
      return UNITS[i];
    }
  }

  return UNITS[ilen - 1];
}

/**
 * Figures out what unit to format a set of ticks with
 * @param {TimeScale} scale
 * @param {number} numTicks
 * @param {Unit} minUnit
 * @param {number} min
 * @param {number} max
 * @return {Unit}
 */
function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
  for (let i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--) {
    const unit = UNITS[i];
    if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
      return unit;
    }
  }

  return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}

/**
 * @param {Unit} unit
 * @return {object}
 */
function determineMajorUnit(unit) {
  for (let i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
    if (INTERVALS[UNITS[i]].common) {
      return UNITS[i];
    }
  }
}

/**
 * @param {object} ticks
 * @param {number} time
 * @param {number[]} [timestamps] - if defined, snap to these timestamps
 */
function addTick(ticks, time, timestamps) {
  if (!timestamps) {
    ticks[time] = true;
  } else if (timestamps.length) {
    const {lo, hi} = _lookup(timestamps, time);
    const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
    ticks[timestamp] = true;
  }
}

/**
 * @param {TimeScale} scale
 * @param {object[]} ticks
 * @param {object} map
 * @param {Unit} majorUnit
 * @return {object[]}
 */
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

/**
 * @param {TimeScale} scale
 * @param {number[]} values
 * @param {Unit|undefined} [majorUnit]
 * @return {object[]}
 */
function ticksFromTimestamps(scale, values, majorUnit) {
  const ticks = [];
  /** @type {Object<number,object>} */
  const map = {};
  const ilen = values.length;
  let i, value;

  for (i = 0; i < ilen; ++i) {
    value = values[i];
    map[value] = i;

    ticks.push({
      value,
      major: false
    });
  }

  // We set the major ticks separately from the above loop because calling startOf for every tick
  // is expensive when there is a large number of ticks
  return (ilen === 0 || !majorUnit) ? ticks : setMajorTicks(scale, ticks, map, majorUnit);
}

export default class TimeScale extends Scale {

  /**
	 * @param {object} props
	 */
  constructor(props) {
    super(props);

    /** @type {{data: number[], labels: number[], all: number[]}} */
    this._cache = {
      data: [],
      labels: [],
      all: []
    };

    /** @type {Unit} */
    this._unit = 'day';
    /** @type {Unit=} */
    this._majorUnit = undefined;
    this._offsets = {};
    this._normalized = false;
    this._parseOpts = undefined;
  }

  init(scaleOpts, opts) {
    const time = scaleOpts.time || (scaleOpts.time = {});
    const adapter = this._adapter = new adapters._date(scaleOpts.adapters.date);

    // Backward compatibility: before introducing adapter, `displayFormats` was
    // supposed to contain *all* unit/string pairs but this can't be resolved
    // when loading the scale (adapters are loaded afterward), so let's populate
    // missing formats on update
    mergeIf(time.displayFormats, adapter.formats());

    this._parseOpts = {
      parser: time.parser,
      round: time.round,
      isoWeekday: time.isoWeekday
    };

    super.init(scaleOpts);

    this._normalized = opts.normalized;
  }

  /**
	 * @param {*} raw
	 * @param {number?} [index]
	 * @return {number}
	 */
  parse(raw, index) { // eslint-disable-line no-unused-vars
    if (raw === undefined) {
      return null;
    }
    return parse(this, raw);
  }

  beforeLayout() {
    super.beforeLayout();
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }

  determineDataLimits() {
    const me = this;
    const options = me.options;
    const adapter = me._adapter;
    const unit = options.time.unit || 'day';
    // eslint-disable-next-line prefer-const
    let {min, max, minDefined, maxDefined} = me.getUserBounds();

    /**
		 * @param {object} bounds
		 */
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
      _applyBounds(me._getLabelBounds());

      // If `bounds` is `'ticks'` and `ticks.source` is `'labels'`,
      // data bounds are ignored (and don't need to be determined)
      if (options.bounds !== 'ticks' || options.ticks.source !== 'labels') {
        _applyBounds(me.getMinMax(false));
      }
    }

    min = isFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
    max = isFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;

    // Make sure that max is strictly higher than min (required by the timeseries lookup table)
    me.min = Math.min(min, max - 1);
    me.max = Math.max(min + 1, max);
  }

  /**
	 * @private
	 */
  _getLabelBounds() {
    const arr = this.getLabelTimestamps();
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    if (arr.length) {
      min = arr[0];
      max = arr[arr.length - 1];
    }
    return {min, max};
  }

  /**
	 * @return {object[]}
	 */
  buildTicks() {
    const me = this;
    const options = me.options;
    const timeOpts = options.time;
    const tickOpts = options.ticks;
    const timestamps = tickOpts.source === 'labels' ? me.getLabelTimestamps() : me._generate();

    if (options.bounds === 'ticks' && timestamps.length) {
      me.min = me._userMin || timestamps[0];
      me.max = me._userMax || timestamps[timestamps.length - 1];
    }

    const min = me.min;
    const max = me.max;

    const ticks = _filterBetween(timestamps, min, max);

    // PRIVATE
    // determineUnitForFormatting relies on the number of ticks so we don't use it when
    // autoSkip is enabled because we don't yet know what the final number of ticks will be
    me._unit = timeOpts.unit || (tickOpts.autoSkip
      ? determineUnitForAutoTicks(timeOpts.minUnit, me.min, me.max, me._getLabelCapacity(min))
      : determineUnitForFormatting(me, ticks.length, timeOpts.minUnit, me.min, me.max));
    me._majorUnit = !tickOpts.major.enabled || me._unit === 'year' ? undefined
      : determineMajorUnit(me._unit);
    me.initOffsets(timestamps);

    if (options.reverse) {
      ticks.reverse();
    }

    return ticksFromTimestamps(me, ticks, me._majorUnit);
  }

  /**
	 * Returns the start and end offsets from edges in the form of {start, end}
	 * where each value is a relative width to the scale and ranges between 0 and 1.
	 * They add extra margins on the both sides by scaling down the original scale.
	 * Offsets are added when the `offset` option is true.
	 * @param {number[]} timestamps
	 * @return {object}
	 * @protected
	 */
  initOffsets(timestamps) {
    const me = this;
    let start = 0;
    let end = 0;
    let first, last;

    if (me.options.offset && timestamps.length) {
      first = me.getDecimalForValue(timestamps[0]);
      if (timestamps.length === 1) {
        start = 1 - first;
      } else {
        start = (me.getDecimalForValue(timestamps[1]) - first) / 2;
      }
      last = me.getDecimalForValue(timestamps[timestamps.length - 1]);
      if (timestamps.length === 1) {
        end = last;
      } else {
        end = (last - me.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
      }
    }
    const limit = timestamps.length < 3 ? 0.5 : 0.25;
    start = _limitValue(start, 0, limit);
    end = _limitValue(end, 0, limit);

    me._offsets = {start, end, factor: 1 / (start + 1 + end)};
  }

  /**
	 * Generates a maximum of `capacity` timestamps between min and max, rounded to the
	 * `minor` unit using the given scale time `options`.
	 * Important: this method can return ticks outside the min and max range, it's the
	 * responsibility of the calling code to clamp values if needed.
	 * @private
	 */
  _generate() {
    const me = this;
    const adapter = me._adapter;
    const min = me.min;
    const max = me.max;
    const options = me.options;
    const timeOpts = options.time;
    // @ts-ignore
    const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, me._getLabelCapacity(min));
    const stepSize = valueOrDefault(timeOpts.stepSize, 1);
    const weekday = minor === 'week' ? timeOpts.isoWeekday : false;
    const hasWeekday = isNumber(weekday) || weekday === true;
    const ticks = {};
    let first = min;
    let time, count;

    // For 'week' unit, handle the first day of week option
    if (hasWeekday) {
      first = +adapter.startOf(first, 'isoWeek', weekday);
    }

    // Align first ticks on unit
    first = +adapter.startOf(first, hasWeekday ? 'day' : minor);

    // Prevent browser from freezing in case user options request millions of milliseconds
    if (adapter.diff(max, min, minor) > 100000 * stepSize) {
      throw new Error(min + ' and ' + max + ' are too far apart with stepSize of ' + stepSize + ' ' + minor);
    }

    const timestamps = options.ticks.source === 'data' && me.getDataTimestamps();
    for (time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++) {
      addTick(ticks, time, timestamps);
    }

    if (time === max || options.bounds === 'ticks' || count === 1) {
      addTick(ticks, time, timestamps);
    }

    // @ts-ignore
    return Object.keys(ticks).sort((a, b) => a - b).map(x => +x);
  }

  /**
	 * @param {number} value
	 * @return {string}
	 */
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
	 * @param {number} time
	 * @param {number} index
	 * @param {object[]} ticks
	 * @param {string|undefined} [format]
	 * @return {string}
	 * @private
	 */
  _tickFormatFunction(time, index, ticks, format) {
    const me = this;
    const options = me.options;
    const formats = options.time.displayFormats;
    const unit = me._unit;
    const majorUnit = me._majorUnit;
    const minorFormat = unit && formats[unit];
    const majorFormat = majorUnit && formats[majorUnit];
    const tick = ticks[index];
    const major = majorUnit && majorFormat && tick && tick.major;
    const label = me._adapter.format(time, format || (major ? majorFormat : minorFormat));
    const formatter = options.ticks.callback;
    return formatter ? call(formatter, [label, index, ticks], me) : label;
  }

  /**
	 * @param {object[]} ticks
	 */
  generateTickLabels(ticks) {
    let i, ilen, tick;

    for (i = 0, ilen = ticks.length; i < ilen; ++i) {
      tick = ticks[i];
      tick.label = this._tickFormatFunction(tick.value, i, ticks);
    }
  }

  /**
	 * @param {number} value - Milliseconds since epoch (1 January 1970 00:00:00 UTC)
	 * @return {number}
	 */
  getDecimalForValue(value) {
    const me = this;
    return value === null ? NaN : (value - me.min) / (me.max - me.min);
  }

  /**
	 * @param {number} value - Milliseconds since epoch (1 January 1970 00:00:00 UTC)
	 * @return {number}
	 */
  getPixelForValue(value) {
    const me = this;
    const offsets = me._offsets;
    const pos = me.getDecimalForValue(value);
    return me.getPixelForDecimal((offsets.start + pos) * offsets.factor);
  }

  /**
	 * @param {number} pixel
	 * @return {number}
	 */
  getValueForPixel(pixel) {
    const me = this;
    const offsets = me._offsets;
    const pos = me.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
    return me.min + pos * (me.max - me.min);
  }

  /**
	 * @param {string} label
	 * @return {{w:number, h:number}}
	 * @private
	 */
  _getLabelSize(label) {
    const me = this;
    const ticksOpts = me.options.ticks;
    const tickLabelWidth = me.ctx.measureText(label).width;
    const angle = toRadians(me.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
    const cosRotation = Math.cos(angle);
    const sinRotation = Math.sin(angle);
    const tickFontSize = me._resolveTickFontOptions(0).size;

    return {
      w: (tickLabelWidth * cosRotation) + (tickFontSize * sinRotation),
      h: (tickLabelWidth * sinRotation) + (tickFontSize * cosRotation)
    };
  }

  /**
	 * @param {number} exampleTime
	 * @return {number}
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
    // subtract 1 - if offset then there's one less label than tick
    // if not offset then one half label padding is added to each end leaving room for one less label
    const capacity = Math.floor(me.isHorizontal() ? me.width / size.w : me.height / size.h) - 1;
    return capacity > 0 ? capacity : 1;
  }

  /**
	 * @protected
	 */
  getDataTimestamps() {
    const me = this;
    let timestamps = me._cache.data || [];
    let i, ilen;

    if (timestamps.length) {
      return timestamps;
    }

    const metas = me.getMatchingVisibleMetas();

    if (me._normalized && metas.length) {
      return (me._cache.data = metas[0].controller.getAllParsedValues(me));
    }

    for (i = 0, ilen = metas.length; i < ilen; ++i) {
      timestamps = timestamps.concat(metas[i].controller.getAllParsedValues(me));
    }

    return (me._cache.data = me.normalize(timestamps));
  }

  /**
	 * @protected
	 */
  getLabelTimestamps() {
    const me = this;
    const timestamps = me._cache.labels || [];
    let i, ilen;

    if (timestamps.length) {
      return timestamps;
    }

    const labels = me.getLabels();
    for (i = 0, ilen = labels.length; i < ilen; ++i) {
      timestamps.push(parse(me, labels[i]));
    }

    return (me._cache.labels = me._normalized ? timestamps : me.normalize(timestamps));
  }

  /**
	 * @param {number[]} values
	 * @protected
	 */
  normalize(values) {
    // It seems to be somewhat faster to do sorting first
    return _arrayUnique(values.sort(sorter));
  }
}

TimeScale.id = 'time';

/**
 * @type {any}
 */
TimeScale.defaults = {
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
    parser: false, // false == a pattern string from or a custom callback that converts its argument to a timestamp
    unit: false, // false == automatic or override with week, month, year, etc.
    round: false, // none, or override with week, month, year, etc.
    isoWeekday: false, // override week start day
    minUnit: 'millisecond',
    displayFormats: {}
  },
  ticks: {
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
