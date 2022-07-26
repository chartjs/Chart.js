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
      expect(helpers.isArray(new Int8Array(2))).toBeTruthy();
      expect(helpers.isArray(new Uint8Array())).toBeTruthy();
      expect(helpers.isArray(new Uint8ClampedArray([128, 244]))).toBeTruthy();
      expect(helpers.isArray(new Int16Array())).toBeTruthy();
      expect(helpers.isArray(new Uint16Array())).toBeTruthy();
      expect(helpers.isArray(new Int32Array())).toBeTruthy();
      expect(helpers.isArray(new Uint32Array())).toBeTruthy();
      expect(helpers.isArray(new Float32Array([1.2]))).toBeTruthy();
      expect(helpers.isArray(new Float64Array([]))).toBeTruthy();
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

  describe('isFinite', function() {
    it('should return true if value is a finite number', function() {
      expect(helpers.isFinite(0)).toBeTruthy();
      // eslint-disable-next-line no-new-wrappers
      expect(helpers.isFinite(new Number(10))).toBeTruthy();
    });

    it('should return false if the value is infinite', function() {
      expect(helpers.isFinite(Number.POSITIVE_INFINITY)).toBeFalsy();
      expect(helpers.isFinite(Number.NEGATIVE_INFINITY)).toBeFalsy();
    });

    it('should return false if the value is not a number', function() {
      expect(helpers.isFinite('a')).toBeFalsy();
      expect(helpers.isFinite({})).toBeFalsy();
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

  describe('valueOrDefault', function() {
    it('should return value if defined', function() {
      var object = {};
      var array = [];

      expect(helpers.valueOrDefault(null, 42)).toBe(null);
      expect(helpers.valueOrDefault(false, 42)).toBe(false);
      expect(helpers.valueOrDefault(object, 42)).toBe(object);
      expect(helpers.valueOrDefault(array, 42)).toBe(array);
      expect(helpers.valueOrDefault('', 42)).toBe('');
      expect(helpers.valueOrDefault(0, 42)).toBe(0);
    });
    it('should return default if undefined', function() {
      expect(helpers.valueOrDefault(undefined, 42)).toBe(42);
      expect(helpers.valueOrDefault({}.foo, 42)).toBe(42);
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
        return i + 1;
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

  describe('_elementsEqual', function() {
    it('should return true if arrays are the same', function() {
      expect(helpers._elementsEqual(
        [{datasetIndex: 0, index: 1}, {datasetIndex: 0, index: 2}],
        [{datasetIndex: 0, index: 1}, {datasetIndex: 0, index: 2}])).toBeTruthy();
    });
    it('should return false if arrays are not the same', function() {
      expect(helpers._elementsEqual([], [{datasetIndex: 0, index: 1}])).toBeFalsy();
      expect(helpers._elementsEqual([{datasetIndex: 0, index: 2}], [{datasetIndex: 0, index: 1}])).toBeFalsy();
    });
  });

  describe('clone', function() {
    it('should clone primitive values', function() {
      expect(helpers.clone()).toBe(undefined);
      expect(helpers.clone(null)).toBe(null);
      expect(helpers.clone(true)).toBe(true);
      expect(helpers.clone(42)).toBe(42);
      expect(helpers.clone('foo')).toBe('foo');
    });
    it('should perform a deep copy of arrays', function() {
      var o0 = {a: 42};
      var o1 = {s: 's'};
      var a0 = ['bar'];
      var a1 = [a0, o0, 2];
      var f0 = function() {};
      var input = [a1, o1, f0, 42, 'foo'];
      var output = helpers.clone(input);

      expect(output).toEqual(input);
      expect(output).not.toBe(input);
      expect(output[0]).not.toBe(a1);
      expect(output[0][0]).not.toBe(a0);
      expect(output[1]).not.toBe(o1);
    });
    it('should perform a deep copy of objects', function() {
      var a0 = ['bar'];
      var a1 = [1, 2, 3];
      var o0 = {a: a1, i: 42};
      var f0 = function() {};
      var input = {o: o0, a: a0, f: f0, s: 'foo', i: 42};
      var output = helpers.clone(input);

      expect(output).toEqual(input);
      expect(output).not.toBe(input);
      expect(output.o).not.toBe(o0);
      expect(output.o.a).not.toBe(a1);
      expect(output.a).not.toBe(a0);
    });
  });

  describe('merge', function() {
    it('should not allow prototype pollution', function() {
      var test = helpers.merge({}, JSON.parse('{"__proto__":{"polluted": true}}'));
      expect(test.prototype).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();
    });
    it('should update target and return it', function() {
      var target = {a: 1};
      var result = helpers.merge(target, {a: 2, b: 'foo'});
      expect(target).toEqual({a: 2, b: 'foo'});
      expect(target).toBe(result);
    });
    it('should return target if not an object', function() {
      expect(helpers.merge(undefined, {a: 42})).toEqual(undefined);
      expect(helpers.merge(null, {a: 42})).toEqual(null);
      expect(helpers.merge('foo', {a: 42})).toEqual('foo');
      expect(helpers.merge(['foo', 'bar'], {a: 42})).toEqual(['foo', 'bar']);
    });
    it('should ignore sources which are not objects', function() {
      expect(helpers.merge({a: 42})).toEqual({a: 42});
      expect(helpers.merge({a: 42}, null)).toEqual({a: 42});
      expect(helpers.merge({a: 42}, 42)).toEqual({a: 42});
    });
    it('should recursively overwrite target with source properties', function() {
      expect(helpers.merge({a: {b: 1}}, {a: {c: 2}})).toEqual({a: {b: 1, c: 2}});
      expect(helpers.merge({a: {b: 1}}, {a: {b: 2}})).toEqual({a: {b: 2}});
      expect(helpers.merge({a: [1, 2]}, {a: [3, 4]})).toEqual({a: [3, 4]});
      expect(helpers.merge({a: 42}, {a: {b: 0}})).toEqual({a: {b: 0}});
      expect(helpers.merge({a: 42}, {a: null})).toEqual({a: null});
      expect(helpers.merge({a: 42}, {a: undefined})).toEqual({a: undefined});
    });
    it('should merge multiple sources in the correct order', function() {
      var t0 = {a: {b: 1, c: [1, 2]}};
      var s0 = {a: {d: 3}, e: {f: 4}};
      var s1 = {a: {b: 5}};
      var s2 = {a: {c: [6, 7]}, e: 'foo'};

      expect(helpers.merge(t0, [s0, s1, s2])).toEqual({a: {b: 5, c: [6, 7], d: 3}, e: 'foo'});
    });
    it('should deep copy merged values from sources', function() {
      var a0 = ['foo'];
      var a1 = [1, 2, 3];
      var o0 = {a: a1, i: 42};
      var output = helpers.merge({}, {a: a0, o: o0});

      expect(output).toEqual({a: a0, o: o0});
      expect(output.a).not.toBe(a0);
      expect(output.o).not.toBe(o0);
      expect(output.o.a).not.toBe(a1);
    });
  });

  describe('mergeIf', function() {
    it('should not allow prototype pollution', function() {
      var test = helpers.mergeIf({}, JSON.parse('{"__proto__":{"polluted": true}}'));
      expect(test.prototype).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();
    });
    it('should update target and return it', function() {
      var target = {a: 1};
      var result = helpers.mergeIf(target, {a: 2, b: 'foo'});
      expect(target).toEqual({a: 1, b: 'foo'});
      expect(target).toBe(result);
    });
    it('should return target if not an object', function() {
      expect(helpers.mergeIf(undefined, {a: 42})).toEqual(undefined);
      expect(helpers.mergeIf(null, {a: 42})).toEqual(null);
      expect(helpers.mergeIf('foo', {a: 42})).toEqual('foo');
      expect(helpers.mergeIf(['foo', 'bar'], {a: 42})).toEqual(['foo', 'bar']);
    });
    it('should ignore sources which are not objects', function() {
      expect(helpers.mergeIf({a: 42})).toEqual({a: 42});
      expect(helpers.mergeIf({a: 42}, null)).toEqual({a: 42});
      expect(helpers.mergeIf({a: 42}, 42)).toEqual({a: 42});
    });
    it('should recursively copy source properties in target only if they do not exist in target', function() {
      expect(helpers.mergeIf({a: {b: 1}}, {a: {c: 2}})).toEqual({a: {b: 1, c: 2}});
      expect(helpers.mergeIf({a: {b: 1}}, {a: {b: 2}})).toEqual({a: {b: 1}});
      expect(helpers.mergeIf({a: [1, 2]}, {a: [3, 4]})).toEqual({a: [1, 2]});
      expect(helpers.mergeIf({a: 0}, {a: {b: 2}})).toEqual({a: 0});
      expect(helpers.mergeIf({a: null}, {a: 42})).toEqual({a: null});
      expect(helpers.mergeIf({a: undefined}, {a: 42})).toEqual({a: undefined});
    });
    it('should merge multiple sources in the correct order', function() {
      var t0 = {a: {b: 1, c: [1, 2]}};
      var s0 = {a: {d: 3}, e: {f: 4}};
      var s1 = {a: {b: 5}};
      var s2 = {a: {c: [6, 7]}, e: 'foo'};

      expect(helpers.mergeIf(t0, [s0, s1, s2])).toEqual({a: {b: 1, c: [1, 2], d: 3}, e: {f: 4}});
    });
    it('should deep copy merged values from sources', function() {
      var a0 = ['foo'];
      var a1 = [1, 2, 3];
      var o0 = {a: a1, i: 42};
      var output = helpers.mergeIf({}, {a: a0, o: o0});

      expect(output).toEqual({a: a0, o: o0});
      expect(output.a).not.toBe(a0);
      expect(output.o).not.toBe(o0);
      expect(output.o.a).not.toBe(a1);
    });
  });

  describe('resolveObjectKey', function() {
    it('should resolve empty key to root object', function() {
      const obj = {test: true};
      expect(helpers.resolveObjectKey(obj, '')).toEqual(obj);
    });
    it('should resolve one level', function() {
      const obj = {
        bool: true,
        str: 'test',
        int: 42,
        obj: {name: 'object'}
      };
      expect(helpers.resolveObjectKey(obj, 'bool')).toEqual(true);
      expect(helpers.resolveObjectKey(obj, 'str')).toEqual('test');
      expect(helpers.resolveObjectKey(obj, 'int')).toEqual(42);
      expect(helpers.resolveObjectKey(obj, 'obj')).toEqual(obj.obj);
    });
    it('should resolve multiple levels', function() {
      const obj = {
        child: {
          level: 1,
          child: {
            level: 2,
            child: {
              level: 3
            }
          }
        }
      };
      expect(helpers.resolveObjectKey(obj, 'child.level')).toEqual(1);
      expect(helpers.resolveObjectKey(obj, 'child.child.level')).toEqual(2);
      expect(helpers.resolveObjectKey(obj, 'child.child.child.level')).toEqual(3);
    });
    it('should resolve circular reference', function() {
      const root = {};
      const child = {root};
      child.child = child;
      root.child = child;
      expect(helpers.resolveObjectKey(root, 'child')).toEqual(child);
      expect(helpers.resolveObjectKey(root, 'child.child.child.child.child.child')).toEqual(child);
      expect(helpers.resolveObjectKey(root, 'child.child.root')).toEqual(root);
    });
    it('should break at empty key', function() {
      const obj = {
        child: {
          level: 1,
          child: {
            level: 2,
            child: {
              level: 3
            }
          }
        }
      };
      expect(helpers.resolveObjectKey(obj, 'child..level')).toEqual(obj.child);
      expect(helpers.resolveObjectKey(obj, 'child.child.level...')).toEqual(2);
      expect(helpers.resolveObjectKey(obj, '.')).toEqual(obj);
      expect(helpers.resolveObjectKey(obj, '..')).toEqual(obj);
    });
    it('should resolve undefined', function() {
      const obj = {
        child: {
          level: 1,
          child: {
            level: 2,
            child: {
              level: 3
            }
          }
        }
      };
      expect(helpers.resolveObjectKey(obj, 'level')).toEqual(undefined);
      expect(helpers.resolveObjectKey(obj, 'child.level.a')).toEqual(undefined);
    });
    it('should throw on invalid input', function() {
      expect(() => helpers.resolveObjectKey(undefined, undefined)).toThrow();
      expect(() => helpers.resolveObjectKey({}, null)).toThrow();
      expect(() => helpers.resolveObjectKey({}, false)).toThrow();
      expect(() => helpers.resolveObjectKey({}, true)).toThrow();
      expect(() => helpers.resolveObjectKey({}, 1)).toThrow();
    });
    it('should allow escaping dot symbol', function() {
      expect(helpers.resolveObjectKey({'test.dot': 10}, 'test\\.dot')).toEqual(10);
      expect(helpers.resolveObjectKey({test: {dot: 10}}, 'test\\.dot')).toEqual(undefined);
    });
    it('should allow nested keys with a dot', function() {
      expect(helpers.resolveObjectKey({
        a: {
          'bb.ccc': 'works',
          bb: {
            ccc: 'fails'
          }
        }
      }, 'a.bb\\.ccc')).toEqual('works');
    });

  });

  describe('_splitKey', function() {
    it('should return array with one entry for string without a dot', function() {
      expect(helpers._splitKey('')).toEqual(['']);
      expect(helpers._splitKey('test')).toEqual(['test']);
      const asciiWithoutDot = ' !"#$%&\'()*+,-/0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
      expect(helpers._splitKey(asciiWithoutDot)).toEqual([asciiWithoutDot]);
    });

    it('should split on dot', function() {
      expect(helpers._splitKey('test1.test2')).toEqual(['test1', 'test2']);
      expect(helpers._splitKey('a.b.c')).toEqual(['a', 'b', 'c']);
      expect(helpers._splitKey('a.b.')).toEqual(['a', 'b', '']);
      expect(helpers._splitKey('a..c')).toEqual(['a', '', 'c']);
    });

    it('should preserve escaped dot', function() {
      expect(helpers._splitKey('test1\\.test2')).toEqual(['test1.test2']);
      expect(helpers._splitKey('a\\.b.c')).toEqual(['a.b', 'c']);
      expect(helpers._splitKey('a.b\\.c')).toEqual(['a', 'b.c']);
      expect(helpers._splitKey('a.\\.c')).toEqual(['a', '.c']);
    });
  });

  describe('setsEqual', function() {
    it('should handle set comparison', function() {
      var a = new Set([1]);
      var b = new Set(['1']);
      var c = new Set([1]);

      expect(helpers.setsEqual(a, b)).toBeFalse();
      expect(helpers.setsEqual(a, c)).toBeTrue();
    });
  });
});
