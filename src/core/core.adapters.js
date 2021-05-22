/**
 * @namespace Chart._adapters
 * @since 2.8.0
 * @private
 */

/**
 * @return {*}
 */
function abstract() {
  throw new Error('This method is not implemented: Check that a complete date adapter is provided.');
}

/**
 * Date adapter (current used by the time scale)
 * @namespace Chart._adapters._date
 * @memberof Chart._adapters
 * @private
 */

/**
 * Currently supported unit string values.
 * @typedef {('millisecond'|'second'|'minute'|'hour'|'day'|'week'|'month'|'quarter'|'year')} Unit
 * @memberof Chart._adapters._date
 */

export class DateAdapter {

  constructor(options) {
    this.options = options || {};
  }

  /**
	 * Returns a map of time formats for the supported formatting units defined
	 * in Unit as well as 'datetime' representing a detailed date/time string.
	 * @returns {{string: string}}
	 */
  formats() {
    return abstract();
  }

  /**
	 * Parses the given `value` and return the associated timestamp.
	 * @param {any} value - the value to parse (usually comes from the data)
	 * @param {string} [format] - the expected data format
	 * @returns {(number|null)}
	 */
  parse(value, format) { // eslint-disable-line no-unused-vars
    return abstract();
  }

  /**
	 * Returns the formatted date in the specified `format` for a given `timestamp`.
	 * @param {number} timestamp - the timestamp to format
	 * @param {string} format - the date/time token
	 * @return {string}
	 */
  format(timestamp, format) { // eslint-disable-line no-unused-vars
    return abstract();
  }

  /**
	 * Adds the specified `amount` of `unit` to the given `timestamp`.
	 * @param {number} timestamp - the input timestamp
	 * @param {number} amount - the amount to add
	 * @param {Unit} unit - the unit as string
	 * @return {number}
	 */
  add(timestamp, amount, unit) { // eslint-disable-line no-unused-vars
    return abstract();
  }

  /**
	 * Returns the number of `unit` between the given timestamps.
	 * @param {number} a - the input timestamp (reference)
	 * @param {number} b - the timestamp to subtract
	 * @param {Unit} unit - the unit as string
	 * @return {number}
	 */
  diff(a, b, unit) { // eslint-disable-line no-unused-vars
    return abstract();
  }

  /**
	 * Returns start of `unit` for the given `timestamp`.
	 * @param {number} timestamp - the input timestamp
	 * @param {Unit|'isoWeek'} unit - the unit as string
	 * @param {number} [weekday] - the ISO day of the week with 1 being Monday
	 * and 7 being Sunday (only needed if param *unit* is `isoWeek`).
	 * @return {number}
	 */
  startOf(timestamp, unit, weekday) { // eslint-disable-line no-unused-vars
    return abstract();
  }

  /**
	 * Returns end of `unit` for the given `timestamp`.
	 * @param {number} timestamp - the input timestamp
	 * @param {Unit|'isoWeek'} unit - the unit as string
	 * @return {number}
	 */
  endOf(timestamp, unit) { // eslint-disable-line no-unused-vars
    return abstract();
  }

}

DateAdapter.override = function(members) {
  Object.assign(DateAdapter.prototype, members);
};

export default {
  _date: DateAdapter
};
