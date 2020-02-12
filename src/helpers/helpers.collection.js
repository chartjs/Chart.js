/**
 * Binary search
 * @param {array} table - the table search. must be sorted!
 * @param {number} value - value to find
 * @private
 */
export function _lookup(table, value) {
	let hi = table.length - 1;
	let lo = 0;
	let mid;

	while (hi - lo > 1) {
		mid = (lo + hi) >> 1;
		if (table[mid] < value) {
			lo = mid;
		} else {
			hi = mid;
		}
	}

	return {lo, hi};
}

/**
 * Binary search
 * @param {array} table - the table search. must be sorted!
 * @param {string} key - property name for the value in each entry
 * @param {number} value - value to find
 * @private
 */
export function _lookupByKey(table, key, value) {
	let hi = table.length - 1;
	let lo = 0;
	let mid;

	while (hi - lo > 1) {
		mid = (lo + hi) >> 1;
		if (table[mid][key] < value) {
			lo = mid;
		} else {
			hi = mid;
		}
	}

	return {lo, hi};
}

/**
 * Reverse binary search
 * @param {array} table - the table search. must be sorted!
 * @param {string} key - property name for the value in each entry
 * @param {number} value - value to find
 * @private
 */
export function _rlookupByKey(table, key, value) {
	let hi = table.length - 1;
	let lo = 0;
	let mid;

	while (hi - lo > 1) {
		mid = (lo + hi) >> 1;
		if (table[mid][key] < value) {
			hi = mid;
		} else {
			lo = mid;
		}
	}

	return {lo, hi};
}
