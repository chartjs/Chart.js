'use strict';

module.exports = function(Chart) {
	/**
	 * @namespace Chart.helpers
	 */
	var helpers = Chart.helpers = {
		/**
		 * An empty function that can be used, for example, for optional callback.
		 */
		noop: function() {},

		/**
		 * Returns a unique id, sequentially generated from a global variable.
		 * @returns {Number}
		 * @function
		 */
		uid: (function() {
			var id = 0;
			return function() {
				return id++;
			};
		}()),

		/**
		 * Returns true if `value` is neither null nor undefined, else returns false.
		 * @param {*} value - The value to test.
		 * @returns {Boolean}
		 * @since 2.7.0
		 */
		isNullOrUndef: function(value) {
			return value === null || typeof value === 'undefined';
		},

		/**
		 * Returns true if `value` is an array, else returns false.
		 * @param {*} value - The value to test.
		 * @returns {Boolean}
		 * @function
		 */
		isArray: Array.isArray? Array.isArray : function(value) {
			return Object.prototype.toString.call(value) === '[object Array]';
		},

		/**
		 * Returns true if `value` is an object (excluding null), else returns false.
		 * @param {*} value - The value to test.
		 * @returns {Boolean}
		 * @since 2.7.0
		 */
		isObject: function(value) {
			return value !== null && Object.prototype.toString.call(value) === '[object Object]';
		},

		/**
		 * Returns `value` if defined, else returns `defaultValue`.
		 * @param {*} value - The value to return if defined.
		 * @param {*} defaultValue - The value to return if `value` is undefined.
		 * @returns {*}
		 */
		valueOrDefault: function(value, defaultValue) {
			return typeof value === 'undefined'? defaultValue : value;
		},

		/**
		 * Returns value at the given `index` in array if defined, else returns `defaultValue`.
		 * @param {Array} value - The array to lookup for value at `index`.
		 * @param {Number} index - The index in `value` to lookup for value.
		 * @param {*} defaultValue - The value to return if `value[index]` is undefined.
		 * @returns {*}
		 */
		valueAtIndexOrDefault: function(value, index, defaultValue) {
			return helpers.valueOrDefault(helpers.isArray(value)? value[index] : value, defaultValue);
		},

		/**
		 * Calls `fn` with the given `args` in the scope defined by `thisArg` and returns the
		 * value returned by `fn`. If `fn` is not a function, this method returns undefined.
		 * @param {Function} fn - The function to call.
		 * @param {Array|undefined|null} args - The arguments with which `fn` should be called.
		 * @param {Object} [thisArg] - The value of `this` provided for the call to `fn`.
		 * @returns {*}
		 */
		callback: function(fn, args, thisArg) {
			if (fn && typeof fn.call === 'function') {
				return fn.apply(thisArg, args);
			}
		},

		/**
		 * Note(SB) for performance sake, this method should only be used when loopable type
		 * is unknown or in none intensive code (not called often and small loopable). Else
		 * it's preferable to use a regular for() loop and save extra function calls.
		 * @param {Object|Array} loopable - The object or array to be iterated.
		 * @param {Function} fn - The function to call for each item.
		 * @param {Object} [thisArg] - The value of `this` provided for the call to `fn`.
		 * @param {Boolean} [reverse] - If true, iterates backward on the loopable.
		 */
		each: function(loopable, fn, thisArg, reverse) {
			var i, len, keys;
			if (helpers.isArray(loopable)) {
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
			} else if (helpers.isObject(loopable)) {
				keys = Object.keys(loopable);
				len = keys.length;
				for (i = 0; i < len; i++) {
					fn.call(thisArg, loopable[keys[i]], keys[i]);
				}
			}
		},

		/**
		 * Returns true if the `a0` and `a1` arrays have the same content, else returns false.
		 * @see http://stackoverflow.com/a/14853974
		 * @param {Array} a0 - The array to compare
		 * @param {Array} a1 - The array to compare
		 * @returns {Boolean}
		 */
		arrayEquals: function(a0, a1) {
			var i, ilen, v0, v1;

			if (!a0 || !a1 || a0.length !== a1.length) {
				return false;
			}

			for (i = 0, ilen=a0.length; i < ilen; ++i) {
				v0 = a0[i];
				v1 = a1[i];

				if (v0 instanceof Array && v1 instanceof Array) {
					if (!helpers.arrayEquals(v0, v1)) {
						return false;
					}
				} else if (v0 !== v1) {
					// NOTE: two different object instances will never be equal: {x:20} != {x:20}
					return false;
				}
			}

			return true;
		},

		/**
		 * Returns a deep copy of `source` without keeping references on objects and arrays.
		 * @param {*} source - The value to clone.
		 * @returns {*}
		 */
		clone: function(source) {
			if (helpers.isArray(source)) {
				return source.map(helpers.clone);
			}

			if (helpers.isObject(source)) {
				var target = {};
				var keys = Object.keys(source);
				var klen = keys.length;
				var k = 0;

				for (; k<klen; ++k) {
					target[keys[k]] = helpers.clone(source[keys[k]]);
				}

				return target;
			}

			return source;
		},

		/**
		 * The default merger when Chart.helpers.merge is called without merger option.
		 * Note(SB): this method is also used by configMerge and scaleMerge as fallback.
		 * @private
		 */
		_merger: function(key, target, source, options) {
			var tval = target[key];
			var sval = source[key];

			if (helpers.isObject(tval) && helpers.isObject(sval)) {
				helpers.merge(tval, sval, options);
			} else {
				target[key] = helpers.clone(sval);
			}
		},

		/**
		 * Merges source[key] in target[key] only if target[key] is undefined.
		 * @private
		 */
		_mergerIf: function(key, target, source) {
			var tval = target[key];
			var sval = source[key];

			if (helpers.isObject(tval) && helpers.isObject(sval)) {
				helpers.mergeIf(tval, sval);
			} else if (!target.hasOwnProperty(key)) {
				target[key] = helpers.clone(sval);
			}
		},

		/**
		 * Recursively deep copies `source` properties into `target` with the given `options`.
		 * IMPORTANT: `target` is not cloned and will be updated with `source` properties.
		 * @param {Object} target - The target object in which all sources are merged into.
		 * @param {Object|Array(Object)} source - Object(s) to merge into `target`.
		 * @param {Object} [options] - Merging options:
		 * @param {Function} [options.merger] - The merge method (key, target, source, options)
		 * @returns {Object} The `target` object.
		 */
		merge: function(target, source, options) {
			var sources = helpers.isArray(source)? source : [source];
			var ilen = sources.length;
			var merge, i, keys, klen, k;

			if (!helpers.isObject(target)) {
				return target;
			}

			options = options || {};
			merge = options.merger || helpers._merger;

			for (i=0; i<ilen; ++i) {
				source = sources[i];
				if (!helpers.isObject(source)) {
					continue;
				}

				keys = Object.keys(source);
				for (k=0, klen = keys.length; k<klen; ++k) {
					merge(keys[k], target, source, options);
				}
			}

			return target;
		},

		/**
		 * Recursively deep copies `source` properties into `target` *only* if not defined in target.
		 * IMPORTANT: `target` is not cloned and will be updated with `source` properties.
		 * @param {Object} target - The target object in which all sources are merged into.
		 * @param {Object|Array(Object)} source - Object(s) to merge into `target`.
		 * @returns {Object} The `target` object.
		 */
		mergeIf: function(target, source) {
			return helpers.merge(target, source, {merger: helpers._mergerIf});
		}
	};

	/**
	 * Provided for backward compatibility, use Chart.helpers.callback instead.
	 * @function Chart.helpers.callCallback
	 * @deprecated since version 2.6.0
	 * @todo remove at version 3
	 * @private
	 */
	helpers.callCallback = helpers.callback;

	/**
	 * Provided for backward compatibility, use Array.prototype.indexOf instead.
	 * Array.prototype.indexOf compatibility: Chrome, Opera, Safari, FF1.5+, IE9+
	 * @function Chart.helpers.indexOf
	 * @deprecated since version 2.7.0
	 * @todo remove at version 3
	 * @private
	 */
	helpers.indexOf = function(array, item, fromIndex) {
		return Array.prototype.indexOf.call(array, item, fromIndex);
	};

	/**
	 * Provided for backward compatibility, use Chart.helpers.valueOrDefault instead.
	 * @function Chart.helpers.getValueOrDefault
	 * @deprecated since version 2.7.0
	 * @todo remove at version 3
	 * @private
	 */
	helpers.getValueOrDefault = helpers.valueOrDefault;

	/**
	 * Provided for backward compatibility, use Chart.helpers.valueAtIndexOrDefault instead.
	 * @function Chart.helpers.getValueAtIndexOrDefault
	 * @deprecated since version 2.7.0
	 * @todo remove at version 3
	 * @private
	 */
	helpers.getValueAtIndexOrDefault = helpers.valueAtIndexOrDefault;
};
