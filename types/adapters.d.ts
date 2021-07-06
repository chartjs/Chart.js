export type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface DateAdapter {
	// Override one or multiple of the methods to adjust to the logic of the current date library.
	override(members: Partial<DateAdapter>): void;
	readonly options: unknown;

	/**
	 * Returns a map of time formats for the supported formatting units defined
	 * in Unit as well as 'datetime' representing a detailed date/time string.
	 * @returns {{string: string}}
	 */
	formats(): { [key: string]: string };
	/**
	 * Parses the given `value` and return the associated timestamp.
	 * @param {unknown} value - the value to parse (usually comes from the data)
	 * @param {string} [format] - the expected data format
	 */
	parse(value: unknown, format?: TimeUnit): number | null;
	/**
	 * Returns the formatted date in the specified `format` for a given `timestamp`.
	 * @param {number} timestamp - the timestamp to format
	 * @param {string} format - the date/time token
	 * @return {string}
	 */
	format(timestamp: number, format: TimeUnit): string;
	/**
	 * Adds the specified `amount` of `unit` to the given `timestamp`.
	 * @param {number} timestamp - the input timestamp
	 * @param {number} amount - the amount to add
	 * @param {Unit} unit - the unit as string
	 * @return {number}
	 */
	add(timestamp: number, amount: number, unit: TimeUnit): number;
	/**
	 * Returns the number of `unit` between the given timestamps.
	 * @param {number} a - the input timestamp (reference)
	 * @param {number} b - the timestamp to subtract
	 * @param {Unit} unit - the unit as string
	 * @return {number}
	 */
	diff(a: number, b: number, unit: TimeUnit): number;
	/**
	 * Returns start of `unit` for the given `timestamp`.
	 * @param {number} timestamp - the input timestamp
	 * @param {Unit|'isoWeek'} unit - the unit as string
	 * @param {number} [weekday] - the ISO day of the week with 1 being Monday
	 * and 7 being Sunday (only needed if param *unit* is `isoWeek`).
	 * @return {number}
	 */
	startOf(timestamp: number, unit: TimeUnit | 'isoWeek', weekday?: number): number;
	/**
	 * Returns end of `unit` for the given `timestamp`.
	 * @param {number} timestamp - the input timestamp
	 * @param {Unit|'isoWeek'} unit - the unit as string
	 * @return {number}
	 */
	endOf(timestamp: number, unit: TimeUnit | 'isoWeek'): number;
}

export const _adapters: {
	_date: DateAdapter;
};
