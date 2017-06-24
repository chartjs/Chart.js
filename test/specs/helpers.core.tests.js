'use strict';

describe('Chart.helpers.core', function() {
	var helpers = Chart.helpers;

	describe('noop', function() {
		it('should be callable', function() {
			expect(helpers.noop).toBeDefined();
			expect(typeof helpers.noop).toBe('function');
			expect(typeof helpers.noop.call).toBe('function');
		});
		it('should returns "undefined"', function() {
			expect(helpers.noop(42)).not.toBeDefined();
			expect(helpers.noop.call(this, 42)).not.toBeDefined();
		});
	});

	describe('isArray', function() {
		it('should return true if value is an array', function() {
			expect(helpers.isArray([])).toBeTruthy();
			expect(helpers.isArray([42])).toBeTruthy();
			expect(helpers.isArray(new Array())).toBeTruthy();
			expect(helpers.isArray(Array.prototype)).toBeTruthy();
		});
		it('should return false if value is not an array', function() {
			expect(helpers.isArray()).toBeFalsy();
			expect(helpers.isArray({})).toBeFalsy();
			expect(helpers.isArray(undefined)).toBeFalsy();
			expect(helpers.isArray(null)).toBeFalsy();
			expect(helpers.isArray(true)).toBeFalsy();
			expect(helpers.isArray(false)).toBeFalsy();
			expect(helpers.isArray(42)).toBeFalsy();
			expect(helpers.isArray('Array')).toBeFalsy();
			expect(helpers.isArray({__proto__: Array.prototype})).toBeFalsy();
		});
	});

	describe('isObject', function() {
		it('should return true if value is an object', function() {
			expect(helpers.isObject({})).toBeTruthy();
			expect(helpers.isObject({a: 42})).toBeTruthy();
			expect(helpers.isObject(new Object())).toBeTruthy();
		});
		it('should return false if value is not an object', function() {
			expect(helpers.isObject()).toBeFalsy();
			expect(helpers.isObject(undefined)).toBeFalsy();
			expect(helpers.isObject(null)).toBeFalsy();
			expect(helpers.isObject(true)).toBeFalsy();
			expect(helpers.isObject(false)).toBeFalsy();
			expect(helpers.isObject(42)).toBeFalsy();
			expect(helpers.isObject('Object')).toBeFalsy();
			expect(helpers.isObject([])).toBeFalsy();
			expect(helpers.isObject([42])).toBeFalsy();
			expect(helpers.isObject(new Array())).toBeFalsy();
			expect(helpers.isObject(new Date())).toBeFalsy();
		});
	});

	describe('isNullOrUndef', function() {
		it('should return true if value is null/undefined', function() {
			expect(helpers.isNullOrUndef(null)).toBeTruthy();
			expect(helpers.isNullOrUndef(undefined)).toBeTruthy();
		});
		it('should return false if value is not null/undefined', function() {
			expect(helpers.isNullOrUndef(true)).toBeFalsy();
			expect(helpers.isNullOrUndef(false)).toBeFalsy();
			expect(helpers.isNullOrUndef('')).toBeFalsy();
			expect(helpers.isNullOrUndef('String')).toBeFalsy();
			expect(helpers.isNullOrUndef(0)).toBeFalsy();
			expect(helpers.isNullOrUndef([])).toBeFalsy();
			expect(helpers.isNullOrUndef({})).toBeFalsy();
			expect(helpers.isNullOrUndef([42])).toBeFalsy();
			expect(helpers.isNullOrUndef(new Date())).toBeFalsy();
		});
	});

	describe('getValueOrDefault', function() {
		it('should return value if defined', function() {
			var object = {};
			var array = [];

			expect(helpers.getValueOrDefault(null, 42)).toBe(null);
			expect(helpers.getValueOrDefault(false, 42)).toBe(false);
			expect(helpers.getValueOrDefault(object, 42)).toBe(object);
			expect(helpers.getValueOrDefault(array, 42)).toBe(array);
			expect(helpers.getValueOrDefault('', 42)).toBe('');
			expect(helpers.getValueOrDefault(0, 42)).toBe(0);
		});
		it('should return default if undefined', function() {
			expect(helpers.getValueOrDefault(undefined, 42)).toBe(42);
			expect(helpers.getValueOrDefault({}.foo, 42)).toBe(42);
		});
	});

	describe('getValueAtIndexOrDefault', function() {
		it('should return the passed value if not an array', function() {
			expect(helpers.getValueAtIndexOrDefault(0, 0, 42)).toBe(0);
			expect(helpers.getValueAtIndexOrDefault('', 0, 42)).toBe('');
			expect(helpers.getValueAtIndexOrDefault(false, 0, 42)).toBe(false);
			expect(helpers.getValueAtIndexOrDefault(98, 0, 42)).toBe(98);
		});
		it('should return the default value if the passed value is null or undefined', function() {
			expect(helpers.getValueAtIndexOrDefault(null, 0, 42)).toBe(42);
			expect(helpers.getValueAtIndexOrDefault(undefined, 0, 42)).toBe(42);
		});
		it('should return the value at index if defined', function() {
			expect(helpers.getValueAtIndexOrDefault([1, false, 'foo'], 1, 42)).toBe(false);
			expect(helpers.getValueAtIndexOrDefault([1, false, 'foo'], 2, 42)).toBe('foo');
		});
		it('should return the default value if value at index is undefined', function() {
			expect(helpers.getValueAtIndexOrDefault([1, false, 'foo'], 3, 42)).toBe(42);
			expect(helpers.getValueAtIndexOrDefault([1, undefined, 'foo'], 1, 42)).toBe(42);
		});
	});

	describe('callback', function() {
		it('should return undefined if fn is not a function', function() {
			expect(helpers.callback()).not.toBeDefined();
			expect(helpers.callback(null)).not.toBeDefined();
			expect(helpers.callback(42)).not.toBeDefined();
			expect(helpers.callback([])).not.toBeDefined();
			expect(helpers.callback({})).not.toBeDefined();
		});
		it('should call fn with the given args', function() {
			var spy = jasmine.createSpy('spy');
			helpers.callback(spy);
			helpers.callback(spy, []);
			helpers.callback(spy, ['foo']);
			helpers.callback(spy, [42, 'bar']);

			expect(spy.calls.argsFor(0)).toEqual([]);
			expect(spy.calls.argsFor(1)).toEqual([]);
			expect(spy.calls.argsFor(2)).toEqual(['foo']);
			expect(spy.calls.argsFor(3)).toEqual([42, 'bar']);
		});
		it('should call fn with the given scope', function() {
			var spy = jasmine.createSpy('spy');
			var scope = {};

			helpers.callback(spy);
			helpers.callback(spy, [], null);
			helpers.callback(spy, [], undefined);
			helpers.callback(spy, [], scope);

			expect(spy.calls.all()[0].object).toBe(window);
			expect(spy.calls.all()[1].object).toBe(window);
			expect(spy.calls.all()[2].object).toBe(window);
			expect(spy.calls.all()[3].object).toBe(scope);
		});
		it('should return the value returned by fn', function() {
			expect(helpers.callback(helpers.noop, [41])).toBe(undefined);
			expect(helpers.callback(function(i) {
				return i+1;
			}, [41])).toBe(42);
		});
	});

	describe('each', function() {
		it('should iterate over an array forward if reverse === false', function() {
			var scope = {};
			var scopes = [];
			var items = [];
			var keys = [];

			helpers.each(['foo', 'bar', 42], function(item, key) {
				scopes.push(this);
				items.push(item);
				keys.push(key);
			}, scope);

			expect(scopes).toEqual([scope, scope, scope]);
			expect(items).toEqual(['foo', 'bar', 42]);
			expect(keys).toEqual([0, 1, 2]);
		});
		it('should iterate over an array backward if reverse === true', function() {
			var scope = {};
			var scopes = [];
			var items = [];
			var keys = [];

			helpers.each(['foo', 'bar', 42], function(item, key) {
				scopes.push(this);
				items.push(item);
				keys.push(key);
			}, scope, true);

			expect(scopes).toEqual([scope, scope, scope]);
			expect(items).toEqual([42, 'bar', 'foo']);
			expect(keys).toEqual([2, 1, 0]);
		});
		it('should iterate over object properties', function() {
			var scope = {};
			var scopes = [];
			var items = [];

			helpers.each({a: 'foo', b: 'bar', c: 42}, function(item, key) {
				scopes.push(this);
				items[key] = item;
			}, scope);

			expect(scopes).toEqual([scope, scope, scope]);
			expect(items).toEqual(jasmine.objectContaining({a: 'foo', b: 'bar', c: 42}));
		});
		it('should not throw when called with a non iterable object', function() {
			expect(function() {
				helpers.each(undefined);
			}).not.toThrow();
			expect(function() {
				helpers.each(null);
			}).not.toThrow();
			expect(function() {
				helpers.each(42);
			}).not.toThrow();
		});
	});

	describe('arrayEquals', function() {
		it('should return false if arrays are not the same', function() {
			expect(helpers.arrayEquals([], [42])).toBeFalsy();
			expect(helpers.arrayEquals([42], ['42'])).toBeFalsy();
			expect(helpers.arrayEquals([1, 2, 3], [1, 2, 3, 4])).toBeFalsy();
			expect(helpers.arrayEquals(['foo', 'bar'], ['bar', 'foo'])).toBeFalsy();
			expect(helpers.arrayEquals([1, 2, 3], [1, 2, 'foo'])).toBeFalsy();
			expect(helpers.arrayEquals([1, 2, [3, 4]], [1, 2, [3, 'foo']])).toBeFalsy();
			expect(helpers.arrayEquals([{a: 42}], [{a: 42}])).toBeFalsy();
		});
		it('should return false if arrays are not the same', function() {
			var o0 = {};
			var o1 = {};
			var o2 = {};

			expect(helpers.arrayEquals([], [])).toBeTruthy();
			expect(helpers.arrayEquals([1, 2, 3], [1, 2, 3])).toBeTruthy();
			expect(helpers.arrayEquals(['foo', 'bar'], ['foo', 'bar'])).toBeTruthy();
			expect(helpers.arrayEquals([true, false, true], [true, false, true])).toBeTruthy();
			expect(helpers.arrayEquals([o0, o1, o2], [o0, o1, o2])).toBeTruthy();
		});
	});
});
