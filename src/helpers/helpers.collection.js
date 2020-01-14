'use strict';

/**
 * Compare function for binary search
 * @callback lookupCompare
 * @param {any} item - item to compare
 * @return less than 0 if item is lower, greater than 0 if item is higher
 */

/**
 * @see adapted from https://www.anujgakhar.com/2014/03/01/binary-search-in-javascript/
 * @param {array} table - array to search. Must be sorted!
 * @param {lookupCompare} compare - compare function
 */
export function lookupFn(table, compare) {
	let lo = 0;
	let hi = table.length - 1;
	let mid, i0, i1;

	while (lo >= 0 && lo <= hi) {
		mid = (lo + hi) >> 1;
		i0 = mid > 0 && table[mid - 1] || null;
		i1 = table[mid];

		if (!i0) {
			// given value is outside table (before first item)
			return {lo: null, hi: i1, loIndex: null, hiIndex: mid};
		} else if (compare(i1) < 0) {
			lo = mid + 1;
		} else if (compare(i0) > 0) {
			hi = mid - 1;
		} else {
			return {lo: i0, hi: i1, loIndex: mid - 1, hiIndex: mid};
		}
	}

	// given value is outside table (after last item)
	return {lo: i1, hi: null, loIndex: mid, hiIndex: null};
}

/**
 * Looks up items around or at specified value in table
 * @param {array} table - array to search. Must be sorted!
 * @param {string} key - item property name used for comparison
 * @param {number} value - value to compare against
 */
export function lookup(table, key, value) {
	return lookupFn(table, (item) => item[key] - value);
}
