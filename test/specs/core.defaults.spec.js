import {descriptors, overrides} from '../../src/core/core.defaults.js';

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

describe('Chart.defaults', function() {
  describe('.set', function() {
    it('Should set defaults directly to root when scope is not provided', function() {
      expect(Chart.defaults.test).toBeUndefined();
      Chart.defaults.set({test: true});
      expect(Chart.defaults.test).toEqual(true);
      delete Chart.defaults.test;
    });

    it('Should create scope when it does not exist', function() {
      expect(Chart.defaults.test).toBeUndefined();
      Chart.defaults.set('test', {value: true});
      expect(Chart.defaults.test.value).toEqual(true);
      delete Chart.defaults.test;
    });
  });

  describe('.route', function() {
    it('Should read the source, but not change it', function() {
      expect(Chart.defaults.testscope).toBeUndefined();

      Chart.defaults.set('testscope', {test: true});
      Chart.defaults.route('testscope', 'test2', 'testscope', 'test');

      expect(Chart.defaults.testscope.test).toEqual(true);
      expect(Chart.defaults.testscope.test2).toEqual(true);

      Chart.defaults.set('testscope', {test2: false});
      expect(Chart.defaults.testscope.test).toEqual(true);
      expect(Chart.defaults.testscope.test2).toEqual(false);

      Chart.defaults.set('testscope', {test2: undefined});
      expect(Chart.defaults.testscope.test2).toEqual(true);

      delete Chart.defaults.testscope;
    });
  });

  describe('paths that leave the defaults', function() {
    const invalid = /^Invalid defaults scope: /;
    const proto = Object.getPrototypeOf(Chart.defaults);

    // Undo what a method that does not throw would leave behind, so that one
    // failing spec does not change the objects the next one reads. A route
    // defines properties that cannot be deleted; deleteProperty then returns
    // false instead of throwing.
    afterEach(function() {
      for (const object of [Object.prototype, proto, Chart.defaults]) {
        Reflect.deleteProperty(object, 'p');
      }
      for (const fn of [Object.prototype.toString, Object.prototype.valueOf, proto.set, Array.prototype.push]) {
        Reflect.deleteProperty(fn, 'x');
      }
      Reflect.deleteProperty(Chart.defaults.elements, 'x');
      for (const object of [descriptors, overrides]) {
        Reflect.deleteProperty(object, '__proto__');
        Reflect.deleteProperty(object, 'constructor');
      }
      const added = ['rtscope', 'newscope', 'newtarget', 'nullscope', 'testfn', 'myconstructor', 'describe', 'set'];
      for (const key of added) {
        Reflect.deleteProperty(Chart.defaults, key);
      }
      Reflect.deleteProperty(Chart.defaults.font, 'toString');
      Chart.defaults.color = '#666';
      Chart.defaults.font.size = 12;
    });

    it('should throw for __proto__ as the first segment', function() {
      expect(() => Chart.defaults.set('__proto__', {p: 1})).toThrow(invalid);
      expect(Chart.defaults.p).toBeUndefined();
      expect(proto.p).toBeUndefined();
      expect(({}).p).toBeUndefined();
    });

    it('should throw for __proto__ as a nested segment', function() {
      expect(() => Chart.defaults.set('plugins.__proto__', {p: 1})).toThrow(invalid);
      expect(({}).p).toBeUndefined();
    });

    it('should throw for constructor.prototype', function() {
      expect(() => Chart.defaults.set('constructor.prototype', {p: 1})).toThrow(invalid);
      expect(Chart.defaults.p).toBeUndefined();
      expect(proto.p).toBeUndefined();
    });

    it('should throw for a segment that names an inherited property', function() {
      expect(() => Chart.defaults.set('toString.x', {p: 1})).toThrow(invalid);
      expect(() => Chart.defaults.set('plugins.valueOf.x', {p: 1})).toThrow(invalid);
      expect(() => Chart.defaults.set('set.x', {p: 1})).toThrow(invalid);
      expect(Object.prototype.toString.x).toBeUndefined();
      expect(Object.prototype.valueOf.x).toBeUndefined();
      expect(Chart.defaults.set.x).toBeUndefined();
    });

    it('should throw from get', function() {
      expect(() => Chart.defaults.get('plugins.__proto__')).toThrow(invalid);
      expect(() => Chart.defaults.get('constructor.prototype')).toThrow(invalid);
      expect(() => Chart.defaults.get('toString')).toThrow(invalid);
    });

    it('should throw from describe', function() {
      expect(() => Chart.defaults.describe('__proto__', {p: 1})).toThrow(invalid);
      expect(() => Chart.defaults.describe('constructor.x', {p: 1})).toThrow(invalid);
      expect(hasOwn(descriptors, '__proto__')).toBe(false);
      expect(hasOwn(descriptors, 'constructor')).toBe(false);
    });

    it('should throw from override', function() {
      expect(() => Chart.defaults.override('__proto__', {p: 1})).toThrow(invalid);
      expect(() => Chart.defaults.override('constructor.x', {p: 1})).toThrow(invalid);
      expect(hasOwn(overrides, '__proto__')).toBe(false);
      expect(hasOwn(overrides, 'constructor')).toBe(false);
    });

    it('should throw from route for its scope and target scope', function() {
      expect(() => Chart.defaults.route('__proto__', 'rp', '', 'color')).toThrow(invalid);
      expect(() => Chart.defaults.route('', 'rq', 'constructor.prototype', 'color')).toThrow(invalid);
      expect(hasOwn(proto, 'rp')).toBe(false);
      expect(hasOwn(Chart.defaults, 'rq')).toBe(false);
    });

    it('should throw from route for the name it defines', function() {
      // A plain object, so that it inherits from Object.prototype like most
      // objects in the defaults do.
      Chart.defaults.rtscope = {};
      expect(() => Chart.defaults.route('rtscope', '__proto__', '', 'color')).toThrow(invalid);
      expect(() => Chart.defaults.route('rtscope', 'constructor', '', 'color')).toThrow(invalid);
      expect(() => Chart.defaults.route('rtscope', 'toString', '', 'color')).toThrow(invalid);
      expect(Object.getOwnPropertyNames(Chart.defaults.rtscope)).toEqual([]);
    });

    it('should throw from route for the private name it defines', function() {
      Chart.defaults.rtscope = {};
      // The value is kept under '_' + name, here '__proto__'.
      expect(() => Chart.defaults.route('rtscope', '_proto__', '', 'color')).toThrow(invalid);
      expect(Object.getOwnPropertyNames(Chart.defaults.rtscope)).toEqual([]);
    });

    it('should create no scope for a rejected path', function() {
      expect(() => Chart.defaults.set('newscope.constructor', {p: 1})).toThrow(invalid);
      expect(() => Chart.defaults.route('newscope', '__proto__', 'newtarget', 'color')).toThrow(invalid);
      expect(() => Chart.defaults.route('newscope', 'x', 'newtarget', '__proto__')).toThrow(invalid);
      expect(hasOwn(Chart.defaults, 'newscope')).toBe(false);
      expect(hasOwn(Chart.defaults, 'newtarget')).toBe(false);
    });

    it('should read a path through a value that is not an object', function() {
      expect(Chart.defaults.get('color.length')).toBe(4);
      expect(() => Chart.defaults.get('color.toString')).toThrow(invalid);
    });

    it('should throw from route for the name it targets', function() {
      Chart.defaults.rtscope = {};
      expect(() => Chart.defaults.route('rtscope', 'x', '', '__proto__')).toThrow(invalid);
      expect(() => Chart.defaults.route('rtscope', 'y', '', 'toString')).toThrow(invalid);
      expect(Object.getOwnPropertyNames(Chart.defaults.rtscope)).toEqual([]);
    });

    it('should skip a key of the values that the target inherits', function() {
      Chart.defaults.set({describe: {a: 1}, color: 'red'});
      expect(typeof Chart.defaults.describe).toBe('function');
      expect(hasOwn(Chart.defaults, 'describe')).toBe(false);
      expect(Chart.defaults.color).toBe('red');
    });

    it('should skip an inherited key of nested values', function() {
      Chart.defaults.set({font: {toString: 'x', size: 13}});
      expect(hasOwn(Chart.defaults.font, 'toString')).toBe(false);
      expect(Chart.defaults.font.size).toBe(13);
    });

    it('should skip an inherited key of the values given with a scope', function() {
      Chart.defaults.set('', {set: 1});
      expect(typeof Chart.defaults.set).toBe('function');
      expect(hasOwn(Chart.defaults, 'set')).toBe(false);
      Chart.defaults.set('font', {toString: 1});
      expect(hasOwn(Chart.defaults.font, 'toString')).toBe(false);
    });

    it('should check each key against the node it is read from', function() {
      // `push` is inherited by the array, not by the root.
      expect(() => Chart.defaults.get('events.push')).toThrow(invalid);
      expect(() => Chart.defaults.set('events.push', {x: 1})).toThrow(invalid);
      expect(Array.prototype.push.x).toBeUndefined();

      // The same below a scope without a prototype.
      Chart.defaults.set('nullscope', {});
      Chart.defaults.nullscope.list = [];
      expect(() => Chart.defaults.set('nullscope.list.push.x', {y: 1})).toThrow(invalid);
      expect(Array.prototype.push.x).toBeUndefined();
    });

    it('should throw for the prototype of a function in the defaults', function() {
      Chart.defaults.testfn = function() {};
      expect(() => Chart.defaults.set('testfn.prototype.x', {y: 1})).toThrow(invalid);
      expect(Chart.defaults.testfn.prototype.x).toBeUndefined();
    });

    it('should check the target name of a route against the target scope', function() {
      expect(() => Chart.defaults.route('elements.x', 'a', 'events', 'push')).toThrow(invalid);
      expect(hasOwn(Chart.defaults.elements, 'x')).toBe(false);
    });

    it('should accept a path that only contains one of the names', function() {
      Chart.defaults.set('myconstructor.a', {b: 1});
      expect(Chart.defaults.myconstructor.a.b).toBe(1);
      expect(Chart.defaults.get('myconstructor.a')).toBe(Chart.defaults.myconstructor.a);
    });
  });
});
