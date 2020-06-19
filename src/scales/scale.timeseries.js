import TimeScale from './scale.time';
import {_arrayUnique, _lookupByKey} from '../helpers/helpers.collection';

/**
 * Linearly interpolates the given source `value` using the table items `skey` values and
 * returns the associated `tkey` value. For example, interpolate(table, 'time', 42, 'pos')
 * returns the position for a timestamp equal to 42. If value is out of bounds, values at
 * index [0, 1] or [n - 1, n] are used for the interpolation.
 * @param {object} table
 * @param {string} skey
 * @param {number} sval
 * @param {string} tkey
 * @return {object}
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
 * @param {number} a
 * @param {number} b
 */
function sorter(a, b) {
	return a - b;
}

class TimeSeriesScale extends TimeScale {

	/**
	 * @param {object} props
	 */
	constructor(props) {
		super(props);

		/** @type {object[]} */
		this._table = [];
	}

	initOffsets(timestamps) {
		const me = this;
		me._table = me.buildLookupTable();
		super.initOffsets(timestamps);
	}

	/**
	 * Returns an array of {time, pos} objects used to interpolate a specific `time` or position
	 * (`pos`) on the scale, by searching entries before and after the requested value. `pos` is
	 * a decimal between 0 and 1: 0 being the start of the scale (left or top) and 1 the other
	 * extremity (left + width or top + height). Note that it would be more optimized to directly
	 * store pre-computed pixels, but the scale dimensions are not guaranteed at the time we need
	 * to create the lookup table. The table ALWAYS contains at least two items: min and max.
	 *
	 * @return {object[]}
	 * @protected
	 */
	buildLookupTable() {
		const me = this;
		const {min, max} = me;
		const timestamps = me._getTimestampsForTable();
		if (!timestamps.length) {
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
	 * Returns all timestamps
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
			timestamps = _arrayUnique(data.concat(label).sort(sorter));
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
		return interpolate(this._table, 'time', value, 'pos');
	}

	/**
	 * @protected
	 */
	getDataTimestamps() {
		const me = this;
		const timestamps = me._cache.data || [];

		if (timestamps.length) {
			return timestamps;
		}

		const metas = me.getMatchingVisibleMetas();
		return (me._cache.data = metas.length ? metas[0].controller.getAllParsedValues(me) : []);
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
			timestamps.push(me.parse(labels[i]));
		}

		// We could assume labels are in order and unique - but let's not
		return (me._cache.labels = timestamps);
	}

	/**
	 * @param {number} pixel
	 * @return {number}
	 */
	getValueForPixel(pixel) {
		const me = this;
		const offsets = me._offsets;
		const pos = me.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
		return interpolate(me._table, 'pos', pos, 'time');
	}
}

TimeSeriesScale.id = 'timeseries';

// INTERNAL: default options, registered in src/index.js
TimeSeriesScale.defaults = TimeScale.defaults;

export default TimeSeriesScale;
