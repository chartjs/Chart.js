import TimeScale from './scale.time';
import {_lookupByKey} from '../helpers/helpers.collection';

/**
 * Linearly interpolates the given source `val` using the table. If value is out of bounds, values
 * at edges are used for the interpolation.
 * @param {object} table
 * @param {number} val
 * @param {boolean} [reverse] lookup time based on position instead of vice versa
 * @return {object}
 */
function interpolate(table, val, reverse) {
  let lo = 0;
  let hi = table.length - 1;
  let prevSource, nextSource, prevTarget, nextTarget;
  if (reverse) {
    if (val >= table[lo].pos && val <= table[hi].pos) {
      ({lo, hi} = _lookupByKey(table, 'pos', val));
    }
    ({pos: prevSource, time: prevTarget} = table[lo]);
    ({pos: nextSource, time: nextTarget} = table[hi]);
  } else {
    if (val >= table[lo].time && val <= table[hi].time) {
      ({lo, hi} = _lookupByKey(table, 'time', val));
    }
    ({time: prevSource, pos: prevTarget} = table[lo]);
    ({time: nextSource, pos: nextTarget} = table[hi]);
  }

  const span = nextSource - prevSource;
  return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
}

class TimeSeriesScale extends TimeScale {

  /**
	 * @param {object} props
	 */
  constructor(props) {
    super(props);

    /** @type {object[]} */
    this._table = [];
    /** @type {number} */
    this._minPos = undefined;
    /** @type {number} */
    this._tableRange = undefined;
  }

  /**
	 * @protected
	 */
  initOffsets() {
    const me = this;
    const timestamps = me._getTimestampsForTable();
    const table = me._table = me.buildLookupTable(timestamps);
    me._minPos = interpolate(table, me.min);
    me._tableRange = interpolate(table, me.max) - me._minPos;
    super.initOffsets(timestamps);
  }

  /**
	 * Returns an array of {time, pos} objects used to interpolate a specific `time` or position
	 * (`pos`) on the scale, by searching entries before and after the requested value. `pos` is
	 * a decimal between 0 and 1: 0 being the start of the scale (left or top) and 1 the other
	 * extremity (left + width or top + height). Note that it would be more optimized to directly
	 * store pre-computed pixels, but the scale dimensions are not guaranteed at the time we need
	 * to create the lookup table. The table ALWAYS contains at least two items: min and max.
	 * @param {number[]} timestamps
	 * @return {object[]}
	 * @protected
	 */
  buildLookupTable(timestamps) {
    const {min, max} = this;
    const items = [];
    const table = [];
    let i, ilen, prev, curr, next;

    for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
      curr = timestamps[i];
      if (curr >= min && curr <= max) {
        items.push(curr);
      }
    }

    if (items.length < 2) {
      // In case there is less that 2 timestamps between min and max, the scale is defined by min and max
      return [
        {time: min, pos: 0},
        {time: max, pos: 1}
      ];
    }

    for (i = 0, ilen = items.length; i < ilen; ++i) {
      next = items[i + 1];
      prev = items[i - 1];
      curr = items[i];

      // only add points that breaks the scale linearity
      if (Math.round((next + prev) / 2) !== curr) {
        table.push({time: curr, pos: i / (ilen - 1)});
      }
    }
    return table;
  }

  /**
	 * Returns all timestamps
	 * @return {number[]}
	 * @private
	 */
  _getTimestampsForTable() {
    const me = this;
    let timestamps = me._cache.all || [];

    if (timestamps.length) {
      return timestamps;
    }

    const data = me.getDataTimestamps();
    const label = me.getLabelTimestamps();
    if (data.length && label.length) {
      // If combining labels and data (data might not contain all labels),
      // we need to recheck uniqueness and sort
      timestamps = me.normalize(data.concat(label));
    } else {
      timestamps = data.length ? data : label;
    }
    timestamps = me._cache.all = timestamps;

    return timestamps;
  }

  /**
	 * @param {number} value - Milliseconds since epoch (1 January 1970 00:00:00 UTC)
	 * @return {number}
	 */
  getDecimalForValue(value) {
    return (interpolate(this._table, value) - this._minPos) / this._tableRange;
  }

  /**
	 * @param {number} pixel
	 * @return {number}
	 */
  getValueForPixel(pixel) {
    const me = this;
    const offsets = me._offsets;
    const decimal = me.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
    return interpolate(me._table, decimal * me._tableRange + me._minPos, true);
  }
}

TimeSeriesScale.id = 'timeseries';

/**
 * @type {any}
 */
TimeSeriesScale.defaults = TimeScale.defaults;

export default TimeSeriesScale;
