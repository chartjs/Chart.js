/**
 * @namespace Chart._adapters
 * @since 2.8.0
 * @private
 */

import type {AnyObject} from '../../types/basic';
import type {BindContextToMethods} from '../../types/utils';
import type {ChartOptions} from '../../types';

export type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

function abstract<T = void>(): T {
  throw new Error('This method is not implemented: Check that a complete date adapter is provided.');
}

/**
 * Date adapter (current used by the time scale)
 * @namespace Chart._adapters._date
 * @memberof Chart._adapters
 * @private
 */
export class DateAdapter<T extends AnyObject = AnyObject> {

  /**
   * Override default date adapter methods.
   * Accepts type parameter to define options type.
   * @example
   * Chart._adapters._date.override<{myAdapterOption: string}>({
   *   init() {
   *     console.log(this.options.myAdapterOption);
   *   }
   * })
   */
  static override<T extends AnyObject = AnyObject>(
    members: Partial<BindContextToMethods<Omit<DateAdapter, 'options'>, DateAdapter<T>>>
  ) {
    Object.assign(DateAdapter.prototype, members);
  }

  readonly options: T;

  constructor(options: T) {
    this.options = options || {} as T;
  }

  /**
   * Will called with chart options after adapter creation.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  init(chartOptions: ChartOptions) {}

  /**
	 * Returns a map of time formats for the supported formatting units defined
	 * in Unit as well as 'datetime' representing a detailed date/time string.
	 */
  formats(): Record<string, string> {
    return abstract();
  }

  /**
	 * Parses the given `value` and return the associated timestamp.
	 * @param value - the value to parse (usually comes from the data)
	 * @param [format] - the expected data format
	 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse(value: unknown, format?: TimeUnit): number | null {
    return abstract();
  }

  /**
	 * Returns the formatted date in the specified `format` for a given `timestamp`.
	 * @param timestamp - the timestamp to format
	 * @param format - the date/time token
	 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  format(timestamp: number, format: TimeUnit): string {
    return abstract();
  }

  /**
	 * Adds the specified `amount` of `unit` to the given `timestamp`.
	 * @param timestamp - the input timestamp
	 * @param amount - the amount to add
	 * @param unit - the unit as string
	 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  add(timestamp: number, amount: number, unit: TimeUnit): number {
    return abstract();
  }

  /**
	 * Returns the number of `unit` between the given timestamps.
	 * @param a - the input timestamp (reference)
	 * @param b - the timestamp to subtract
	 * @param unit - the unit as string
	 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  diff(a: number, b: number, unit: TimeUnit): number {
    return abstract();
  }

  /**
	 * Returns start of `unit` for the given `timestamp`.
	 * @param timestamp - the input timestamp
	 * @param unit - the unit as string
	 * @param [weekday] - the ISO day of the week with 1 being Monday
	 * and 7 being Sunday (only needed if param *unit* is `isoWeek`).
	 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startOf(timestamp: number, unit: TimeUnit | 'isoWeek', weekday?: number): number {
    return abstract();
  }

  /**
	 * Returns end of `unit` for the given `timestamp`.
	 * @param timestamp - the input timestamp
	 * @param unit - the unit as string
	 */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endOf(timestamp: number, unit: TimeUnit | 'isoWeek'): number {
    return abstract();
  }

}

export default {
  _date: DateAdapter
};
