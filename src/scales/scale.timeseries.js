import TimeScale from './scale.time';
import {_arrayUnique, _lookup} from '../helpers/helpers.collection';

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

		/** @type {function}*/
		this._normalizeTimestamps = timestamps => timestamps;

		/** @type {object[]} */
		this._table = [];
	}

	/**
	 * @protected
	 */
	initOffsets(timestamps) {
		const me = this;
		me._table = me._buildLookupTable();
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
	 * @return {number[]}
	 * @private
	 */
	_buildLookupTable() {
		const me = this;
		const {min, max} = me;
		const timestamps = me._getTimestampsForTable();
		if (!timestamps.length) {
			return [min, max];
		}

		const items = [min];
		let i, ilen, curr;

		for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
			curr = timestamps[i];
			if (curr > min && curr < max) {
				items.push(curr);
			}
		}

		items.push(max);

		return items;
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
		const table = this._table;
		const index = _lookup(table, value);
		return index === null ? null : index / (table.length - 1);
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
	 * @param {number} pixel
	 * @return {number}
	 */
	getValueForPixel(pixel) {
		const me = this;
		const table = this._table;
		const offsets = me._offsets;
		const pos = me.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
		return table[Math.round(pos * table.length)];
	}
}

TimeSeriesScale.id = 'timeseries';

// INTERNAL: default options, registered in src/index.js
TimeSeriesScale.defaults = TimeScale.defaults;

export default TimeSeriesScale;
