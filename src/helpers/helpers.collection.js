'use strict';

import {each, isArray, isNullOrUndef} from './helpers.core';

var arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'];

/**
 * Hooks the array methods that add or remove values ('push', pop', 'shift', 'splice',
 * 'unshift') and notify the listener AFTER the array has been altered. Listeners are
 * called on the 'onData*' callbacks (e.g. onDataPush, etc.) with same arguments.
 * @param {array} array
 * @param {object} listener
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

	arrayEvents.forEach(function(key) {
		var method = 'onData' + key.charAt(0).toUpperCase() + key.slice(1);
		var base = array[key];

		Object.defineProperty(array, key, {
			configurable: true,
			enumerable: false,
			value: function() {
				var args = Array.prototype.slice.call(arguments);
				var res = base.apply(this, args);

				each(array._chartjs.listeners, function(object) {
					if (typeof object[method] === 'function') {
						object[method].apply(object, args);
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
 * @param {array} array
 * @param {object} listener
 */
export function unlistenArrayEvents(array, listener) {
	var stub = array._chartjs;
	if (!stub) {
		return;
	}

	var listeners = stub.listeners;
	var index = listeners.indexOf(listener);
	if (index !== -1) {
		listeners.splice(index, 1);
	}

	if (listeners.length > 0) {
		return;
	}

	arrayEvents.forEach(function(key) {
		delete array[key];
	});

	delete array._chartjs;
}


export function where(collection, filterCallback) {
	if (isArray(collection) && Array.prototype.filter) {
		return collection.filter(filterCallback);
	}
	var filtered = [];

	each(collection, function(item) {
		if (filterCallback(item)) {
			filtered.push(item);
		}
	});

	return filtered;
}

export const findIndex = Array.prototype.findIndex ?
	function(array, callback, scope) {
		return array.findIndex(callback, scope);
	} :
	function(array, callback, scope) {
		scope = scope === undefined ? array : scope;
		for (var i = 0, ilen = array.length; i < ilen; ++i) {
			if (callback.call(scope, array[i], i, array)) {
				return i;
			}
		}
		return -1;
	};

export function findNextWhere(arrayToSearch, filterCallback, startIndex) {
	// Default to start of the array
	if (isNullOrUndef(startIndex)) {
		startIndex = -1;
	}
	for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
		var currentItem = arrayToSearch[i];
		if (filterCallback(currentItem)) {
			return currentItem;
		}
	}
}

export function findPreviousWhere(arrayToSearch, filterCallback, startIndex) {
	// Default to end of the array
	if (isNullOrUndef(startIndex)) {
		startIndex = arrayToSearch.length;
	}
	for (var i = startIndex - 1; i >= 0; i--) {
		var currentItem = arrayToSearch[i];
		if (filterCallback(currentItem)) {
			return currentItem;
		}
	}
}
