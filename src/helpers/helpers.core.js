'use strict';

/**
 * @namespace Chart.helpers
 */
/**
 * An empty function that can be used, for example, for optional callback.
 */
export function noop() {}

/**
 * Returns a unique id, sequentially generated from a global variable.
 * @returns {number}
 * @function
 */
export const uid = (function() {
	var id = 0;
	return function() {
		return id++;
	};
}());

/**
 * Returns true if `value` is neither null nor undefined, else returns false.
 * @param {*} value - The value to test.
 * @returns {boolean}
 * @since 2.7.0
 */
export function isNullOrUndef(value) {
	return value === null || typeof value === 'undefined';
}

/**
 * Returns true if `value` is an array (including typed arrays), else returns false.
 * @param {*} value - The value to test.
 * @returns {boolean}
 * @function
 */
export function isArray(value) {
	if (Array.isArray && Array.isArray(value)) {
		return true;
	}
	var type = Object.prototype.toString.call(value);
	if (type.substr(0, 7) === '[object' && type.substr(-6) === 'Array]') {
		return true;
	}
	return false;
}

/**
 * Returns true if `value` is an object (excluding null), else returns false.
 * @param {*} value - The value to test.
 * @returns {boolean}
 * @since 2.7.0
 */
export function isObject(value) {
	return value !== null && Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Returns true if `value` is a finite number, else returns false
 * @param {*} value  - The value to test.
 * @returns {boolean}
 */
const isNumberFinite = (value) => {
	return (typeof value === 'number' || value instanceof Number) && isFinite(value);
};
export {
	isNumberFinite as isFinite,
};

/**
 * Returns `value` if defined, else returns `defaultValue`.
 * @param {*} value - The value to return if defined.
 * @param {*} defaultValue - The value to return if `value` is undefined.
 * @returns {*}
 */
export function valueOrDefault(value, defaultValue) {
	return typeof value === 'undefined' ? defaultValue : value;
}

/**
 * Returns value at the given `index` in array if defined, else returns `defaultValue`.
 * @param {Array} value - The array to lookup for value at `index`.
 * @param {number} index - The index in `value` to lookup for value.
 * @param {*} defaultValue - The value to return if `value[index]` is undefined.
 * @returns {*}
 */
export function valueAtIndexOrDefault(value, index, defaultValue) {
	return valueOrDefault(isArray(value) ? value[index] : value, defaultValue);
}

/**
 * Calls `fn` with the given `args` in the scope defined by `thisArg` and returns the
 * value returned by `fn`. If `fn` is not a function, this method returns undefined.
 * @param {function} fn - The function to call.
 * @param {Array|undefined|null} args - The arguments with which `fn` should be called.
 * @param {object} [thisArg] - The value of `this` provided for the call to `fn`.
 * @returns {*}
 */
export function callback(fn, args, thisArg) {
	if (fn && typeof fn.call === 'function') {
		return fn.apply(thisArg, args);
	}
}

/**
 * Note(SB) for performance sake, this method should only be used when loopable type
 * is unknown or in none intensive code (not called often and small loopable). Else
 * it's preferable to use a regular for() loop and save extra function calls.
 * @param {object|Array} loopable - The object or array to be iterated.
 * @param {function} fn - The function to call for each item.
 * @param {object} [thisArg] - The value of `this` provided for the call to `fn`.
 * @param {boolean} [reverse] - If true, iterates backward on the loopable.
 */
export function each(loopable, fn, thisArg, reverse) {
	var i, len, keys;
	if (isArray(loopable)) {
		len = loopable.length;
		if (reverse) {
			for (i = len - 1; i >= 0; i--) {
				fn.call(thisArg, loopable[i], i);
			}
		} else {
			for (i = 0; i < len; i++) {
				fn.call(thisArg, loopable[i], i);
			}
		}
	} else if (isObject(loopable)) {
		keys = Object.keys(loopable);
		len = keys.length;
		for (i = 0; i < len; i++) {
			fn.call(thisArg, loopable[keys[i]], keys[i]);
		}
	}
}

/**
 * Returns true if the `a0` and `a1` arrays have the same content, else returns false.
 * @see https://stackoverflow.com/a/14853974
 * @param {Array} a0 - The array to compare
 * @param {Array} a1 - The array to compare
 * @returns {boolean}
 */
export function arrayEquals(a0, a1) {
	var i, ilen, v0, v1;

	if (!a0 || !a1 || a0.length !== a1.length) {
		return false;
	}

	for (i = 0, ilen = a0.length; i < ilen; ++i) {
		v0 = a0[i];
		v1 = a1[i];

		if (v0 instanceof Array && v1 instanceof Array) {
			if (!arrayEquals(v0, v1)) {
				return false;
			}
		} else if (v0 !== v1) {
			// NOTE: two different object instances will never be equal: {x:20} != {x:20}
			return false;
		}
	}

	return true;
}

/**
 * Returns true if the `a0` and `a1` arrays have the same content, else returns false.
 * @param {Array} a0 - The array to compare
 * @param {Array} a1 - The array to compare
 * @returns {boolean}
 */
export function _elementsEqual(a0, a1) {
	let i, ilen, v0, v1;

	if (!a0 || !a1 || a0.length !== a1.length) {
		return false;
	}

	for (i = 0, ilen = a0.length; i < ilen; ++i) {
		v0 = a0[i];
		v1 = a1[i];

		if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
			return false;
		}
	}

	return true;
}

/**
 * Returns a deep copy of `source` without keeping references on objects and arrays.
 * @param {*} source - The value to clone.
 * @returns {*}
 */
export function clone(source) {
	if (isArray(source)) {
		return source.map(clone);
	}

	if (isObject(source)) {
		var target = {};
		var keys = Object.keys(source);
		var klen = keys.length;
		var k = 0;

		for (; k < klen; ++k) {
			target[keys[k]] = clone(source[keys[k]]);
		}

		return target;
	}

	return source;
}

/**
 * The default merger when Chart.helpers.merge is called without merger option.
 * Note(SB): also used by mergeConfig and mergeScaleConfig as fallback.
 * @private
 */
export function _merger(key, target, source, options) {
	var tval = target[key];
	var sval = source[key];

	if (isObject(tval) && isObject(sval)) {
		// eslint-disable-next-line no-use-before-define
		merge(tval, sval, options);
	} else {
		target[key] = clone(sval);
	}
}

/**
 * Recursively deep copies `source` properties into `target` with the given `options`.
 * IMPORTANT: `target` is not cloned and will be updated with `source` properties.
 * @param {object} target - The target object in which all sources are merged into.
 * @param {object|object[]} source - Object(s) to merge into `target`.
 * @param {object} [options] - Merging options:
 * @param {function} [options.merger] - The merge method (key, target, source, options)
 * @returns {object} The `target` object.
 */
export function merge(target, source, options) {
	var sources = isArray(source) ? source : [source];
	var ilen = sources.length;
	var merger, i, keys, klen, k;

	if (!isObject(target)) {
		return target;
	}

	options = options || {};
	merger = options.merger || _merger;

	for (i = 0; i < ilen; ++i) {
		source = sources[i];
		if (!isObject(source)) {
			continue;
		}

		keys = Object.keys(source);
		for (k = 0, klen = keys.length; k < klen; ++k) {
			merger(keys[k], target, source, options);
		}
	}

	return target;
}

/**
 * Recursively deep copies `source` properties into `target` *only* if not defined in target.
 * IMPORTANT: `target` is not cloned and will be updated with `source` properties.
 * @param {object} target - The target object in which all sources are merged into.
 * @param {object|object[]} source - Object(s) to merge into `target`.
 * @returns {object} The `target` object.
 */
export function mergeIf(target, source) {
	// eslint-disable-next-line no-use-before-define
	return merge(target, source, {merger: _mergerIf});
}

/**
 * Merges source[key] in target[key] only if target[key] is undefined.
 * @private
 */
export function _mergerIf(key, target, source) {
	var tval = target[key];
	var sval = source[key];

	if (isObject(tval) && isObject(sval)) {
		mergeIf(tval, sval);
	} else if (!Object.prototype.hasOwnProperty.call(target, key)) {
		target[key] = clone(sval);
	}
}

/**
 * Applies the contents of two or more objects together into the first object.
 * @param {object} target - The target object in which all objects are merged into.
 * @param {object} arg1 - Object containing additional properties to merge in target.
 * @param {object} argN - Additional objects containing properties to merge in target.
 * @returns {object} The `target` object.
 */
export const extend = Object.assign || function(target) {
	return merge(target, [].slice.call(arguments, 1), {
		merger: function(key, dst, src) {
			dst[key] = src[key];
		}
	});
};

/**
 * Basic javascript inheritance based on the model created in Backbone.js
 */
export function inherits(extensions) {
	var me = this;
	var ChartElement = (extensions && Object.prototype.hasOwnProperty.call(extensions, 'constructor')) ? extensions.constructor : function() {
		return me.apply(this, arguments);
	};

	var Surrogate = function() {
		this.constructor = ChartElement;
	};

	Surrogate.prototype = me.prototype;
	ChartElement.prototype = new Surrogate();
	ChartElement.extend = inherits;

	if (extensions) {
		extend(ChartElement.prototype, extensions);
	}

	ChartElement.__super__ = me.prototype;
	return ChartElement;
}

export function _deprecated(scope, value, previous, current) {
	if (value !== undefined) {
		console.warn(scope + ': "' + previous +
			'" is deprecated. Please use "' + current + '" instead');
	}
}
