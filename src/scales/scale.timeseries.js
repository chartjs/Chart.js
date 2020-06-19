import TimeScale from './scale.time';
import {_arrayUnique} from '../helpers/helpers.collection';

/**
 * @param {number} a
 * @param {number} b
 */
function sorter(a, b) {
	return a - b;
}

class TimeSeriesScale extends TimeScale {

	/**
	 * Returns all timestamps
	 * @protected
	 */
	getTimestampsForTable() {
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
	 * Returns an array of {time, pos} objects used to interpolate a specific `time` or position
	 * (`pos`) on the scale, by searching entries before and after the requested value. `pos` is
	 * a decimal between 0 and 1: 0 being the start of the scale (left or top) and 1 the other
	 * extremity (left + width or top + height). Note that it would be more optimized to directly
	 * store pre-computed pixels, but the scale dimensions are not guaranteed at the time we need
	 * to create the lookup table. The table ALWAYS contains at least two items: min and max.
	 *
	 * @param {number[]} timestamps - timestamps sorted from lowest to highest.
	 * @param {number} min
	 * @param {number} max
	 * @return {object[]}
	 * @protected
	 */
	buildLookupTable(timestamps, min, max) {
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
}

TimeSeriesScale.id = 'timeseries';

// INTERNAL: default options, registered in src/index.js
TimeSeriesScale.defaults = TimeScale.defaults;

export default TimeSeriesScale;
