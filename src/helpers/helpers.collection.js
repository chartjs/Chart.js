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

/**
 * Return subset of `values` between `min` and `max` inclusive.
 * Values are assumed to be in sorted order.
 * @param {number[]} values - sorted array of values
 * @param {number} min - min value
 * @param {number} max - max value
 */
export function _filterBetween(values, min, max) {
	let start = 0;
	let end = values.length;

	while (start < end && values[start] < min) {
		start++;
	}
	while (end > start && values[end - 1] > max) {
		end--;
	}

	return start > 0 || end < values.length
		? values.slice(start, end)
		: values;
}

const arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'];

/**
 * Hooks the array methods that add or remove values ('push', pop', 'shift', 'splice',
 * 'unshift') and notify the listener AFTER the array has been altered. Listeners are
 * called on the '_onData*' callbacks (e.g. _onDataPush, etc.) with same arguments.
 */
export function listenArrayEvents(array, listener) {
	if (array._chartjs) {
		array._chartjs.listeners.push(listener);
		return;
	}

	Object.defineProperty(array, '_chartjs', {
		configurable: true,
		enumerable: false,
		value: {
			listeners: [listener]
		}
	});

	arrayEvents.forEach((key) => {
		const method = '_onData' + key.charAt(0).toUpperCase() + key.slice(1);
		const base = array[key];

		Object.defineProperty(array, key, {
			configurable: true,
			enumerable: false,
			value(...args) {
				const res = base.apply(this, args);

				array._chartjs.listeners.forEach((object) => {
					if (typeof object[method] === 'function') {
						object[method](...args);
					}
				});

				return res;
			}
		});
	});
}


/**
 * Removes the given array event listener and cleanup extra attached properties (such as
 * the _chartjs stub and overridden methods) if array doesn't have any more listeners.
 */
export function unlistenArrayEvents(array, listener) {
	const stub = array._chartjs;
	if (!stub) {
		return;
	}

	const listeners = stub.listeners;
	const index = listeners.indexOf(listener);
	if (index !== -1) {
		listeners.splice(index, 1);
	}

	if (listeners.length > 0) {
		return;
	}

	arrayEvents.forEach((key) => {
		delete array[key];
	});

	delete array._chartjs;
}

/**
 * @param {Array} items
 */
export function _arrayUnique(items) {
	const set = new Set();
	let i, ilen;

	for (i = 0, ilen = items.length; i < ilen; ++i) {
		set.add(items[i]);
	}

	if (set.size === ilen) {
		return items;
	}

	const result = [];
	set.forEach(item => {
		result.push(item);
	});
	return result;
}
