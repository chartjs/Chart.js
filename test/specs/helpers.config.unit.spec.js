describe('Chart.helpers.config', function() {
  const {getHoverColor, _createResolver, _attachContext} = Chart.helpers;

  describe('_createResolver', function() {
    it('should resolve to raw values', function() {
      const defaults = {
        color: 'red',
        backgroundColor: 'green',
        hoverColor: (ctx, options) => getHoverColor(options.color)
      };
      const options = {
        color: 'blue'
      };
      const resolver = _createResolver([options, defaults]);
      expect(resolver.color).toEqual('blue');
      expect(resolver.backgroundColor).toEqual('green');
      expect(resolver.hoverColor).toEqual(defaults.hoverColor);
    });

    it('should resolve to parent scopes, when _fallback is true', function() {
      const descriptors = {
        _fallback: true
      };
      const defaults = {
        root: true,
        sub: {
          child: true
        }
      };
      const options = {
        child: 'sub default comes before this',
        opt: 'opt'
      };
      const resolver = _createResolver([options, defaults, descriptors]);
      const sub = resolver.sub;
      expect(sub.root).toEqual(true);
      expect(sub.child).toEqual(true);
      expect(sub.opt).toEqual('opt');
    });

    it('should support overriding options', function() {
      const defaults = {
        option1: 'defaults1',
        option2: 'defaults2',
        option3: 'defaults3',
      };
      const options = {
        option1: 'options1',
        option2: 'options2'
      };
      const overrides = {
        option1: 'override1'
      };
      const resolver = _createResolver([options, defaults]);
      expect(resolver).toEqualOptions({
        option1: 'options1',
        option2: 'options2',
        option3: 'defaults3'
      });
      expect(resolver.override(overrides)).toEqualOptions({
        option1: 'override1',
        option2: 'options2',
        option3: 'defaults3'
      });
    });

    it('should support common object methods', function() {
      const defaults = {
        option1: 'defaults'
      };
      class Options {
        constructor() {
          this.option2 = 'options';
        }
        get getter() {
          return 'options getter';
        }
      }
      const options = new Options();

      const resolver = _createResolver([options, defaults]);

      expect(Object.prototype.hasOwnProperty.call(resolver, 'option2')).toBe(true);

      expect(Object.prototype.hasOwnProperty.call(resolver, 'option1')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(resolver, 'getter')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(resolver, 'nonexistent')).toBe(false);

      expect(Object.keys(resolver)).toEqual(['option2']);
      expect(Object.getOwnPropertyNames(resolver)).toEqual(['option2', 'option1']);

      expect('option2' in resolver).toBe(true);
      expect('option1' in resolver).toBe(true);
      expect('getter' in resolver).toBe(false);
      expect('nonexistent' in resolver).toBe(false);

      expect(resolver instanceof Options).toBe(true);

      expect(resolver.getter).toEqual('options getter');
    });

    it('should resolve each option only once', function() {
      let reads = 0;
      const options = {
        get color() {
          reads++;
          return 'red';
        },
        sub: {value: 1}
      };
      const resolver = _createResolver([options]);
      expect(resolver.color).toEqual('red');
      expect(resolver.color).toEqual('red');
      expect(reads).toEqual(1);
      expect(resolver.sub).toBe(resolver.sub);
    });

    it('should not resolve the constructor from the scopes', function() {
      class Options {}
      const resolver = _createResolver([new Options()]);
      expect(resolver.constructor).toBe(Object);
    });

    it('should not fail on when options are frozen', function() {
      function create() {
        const defaults = Object.freeze({default: true});
        const options = Object.freeze({value: true});
        return _createResolver([options, defaults]);
      }
      expect(create).not.toThrow();
    });

    describe('_fallback', function() {
      it('should follow simple _fallback', function() {
        const defaults = {
          interaction: {
            mode: 'test',
            priority: 'fall'
          },
          hover: {
            _fallback: 'interaction',
            priority: 'main'
          }
        };
        const options = {
          interaction: {
            a: 1
          },
          hover: {
            b: 2
          }
        };
        const resolver = _createResolver([options, defaults]);
        expect(resolver.hover).toEqualOptions({
          mode: 'test',
          priority: 'main',
          a: 1,
          b: 2
        });
      });

      it('should support _fallback as function', function() {
        const descriptors = {
          _fallback: (prop, value) => prop === 'hover' && value.shouldFall && 'interaction',
        };
        const defaults = {
          interaction: {
            mode: 'test',
            priority: 'fall'
          },
          hover: {
            priority: 'main'
          }
        };
        const options = {
          interaction: {
            a: 1
          },
          hover: {
            shouldFall: true,
            b: 2
          }
        };
        const resolver = _createResolver([options, defaults, descriptors]);
        expect(resolver.hover).toEqualOptions({
          mode: 'test',
          priority: 'main',
          a: 1,
          b: 2
        });
      });

      it('should not fallback by default', function() {
        const defaults = {
          hover: {
            a: 'defaults.hover'
          },
          controllers: {
            y: 'defaults.controllers',
            bar: {
              z: 'defaults.controllers.bar',
              hover: {
                b: 'defaults.controllers.bar.hover'
              }
            }
          },
          x: 'defaults root'
        };
        const options = {
          x: 'options',
          hover: {
            c: 'options.hover',
            sub: {
              f: 'options.hover.sub'
            }
          },
          controllers: {
            y: 'options.controllers',
            bar: {
              z: 'options.controllers.bar',
              hover: {
                d: 'options.controllers.bar.hover',
                sub: {
                  e: 'options.controllers.bar.hover.sub'
                }
              }
            }
          }
        };
        const resolver = _createResolver([options, options.controllers.bar, options.controllers, defaults.controllers.bar, defaults.controllers, defaults]);
        expect(resolver.hover).toEqualOptions({
          a: 'defaults.hover',
          b: 'defaults.controllers.bar.hover',
          c: 'options.hover',
          d: 'options.controllers.bar.hover',
          e: undefined,
          f: undefined,
          x: undefined,
          y: undefined,
          z: undefined
        });
        expect(resolver.hover.sub).toEqualOptions({
          a: undefined,
          b: undefined,
          c: undefined,
          d: undefined,
          e: 'options.controllers.bar.hover.sub',
          f: 'options.hover.sub',
          x: undefined,
          y: undefined,
          z: undefined
        });
      });

      it('should fallback to specific scope', function() {
        const defaults = {
          hover: {
            _fallback: 'hover',
            a: 'defaults.hover'
          },
          controllers: {
            y: 'defaults.controllers',
            bar: {
              z: 'defaults.controllers.bar',
              hover: {
                b: 'defaults.controllers.bar.hover'
              }
            }
          },
          x: 'defaults root'
        };
        const options = {
          x: 'options',
          hover: {
            c: 'options.hover',
            sub: {
              f: 'options.hover.sub'
            }
          },
          controllers: {
            y: 'options.controllers',
            bar: {
              z: 'options.controllers.bar',
              hover: {
                d: 'options.controllers.bar.hover',
                sub: {
                  e: 'options.controllers.bar.hover.sub'
                }
              }
            }
          }
        };
        const resolver = _createResolver([options, options.controllers.bar, options.controllers, defaults.controllers.bar, defaults.controllers, defaults]);
        expect(resolver.hover).toEqualOptions({
          a: 'defaults.hover',
          b: 'defaults.controllers.bar.hover',
          c: 'options.hover',
          d: 'options.controllers.bar.hover',
          e: undefined,
          f: undefined,
          x: undefined,
          y: undefined,
          z: undefined
        });
        expect(resolver.hover.sub).toEqualOptions({
          a: 'defaults.hover',
          b: 'defaults.controllers.bar.hover',
          c: 'options.hover',
          d: 'options.controllers.bar.hover',
          e: 'options.controllers.bar.hover.sub',
          f: 'options.hover.sub',
          x: undefined,
          y: undefined,
          z: undefined
        });
      });

      it('should fallback through multiple routes', function() {
        const descriptors = {
          _fallback: 'level1',
          level1: {
            _fallback: 'root'
          },
          level2: {
            _fallback: 'level1'
          }
        };
        const defaults = {
          root: {
            a: 'root'
          },
          level1: {
            b: 'level1',
          },
          level2: {
            level1: {
              g: 'level2.level1'
            },
            c: 'level2',
            sublevel1: {
              d: 'sublevel1'
            },
            sublevel2: {
              e: 'sublevel2',
              level1: {
                f: 'sublevel2.level1'
              }
            }
          }
        };
        const resolver = _createResolver([defaults, descriptors]);
        expect(resolver.level1).toEqualOptions({
          a: 'root',
          b: 'level1',
          c: undefined
        });
        expect(resolver.level2).toEqualOptions({
          a: 'root',
          b: 'level1',
          c: 'level2',
          d: undefined
        });
        expect(resolver.level2.sublevel1).toEqualOptions({
          a: 'root',
          b: 'level1',
          c: undefined,
          d: 'sublevel1',
          e: undefined,
          f: undefined,
          g: 'level2.level1'
        });
        expect(resolver.level2.sublevel2).toEqualOptions({
          a: 'root',
          b: 'level1',
          c: undefined,
          d: undefined,
          e: 'sublevel2',
          f: undefined,
          g: 'level2.level1'
        });
        expect(resolver.level2.sublevel2.level1).toEqualOptions({
          a: 'root',
          b: 'level1',
          c: undefined,
          d: undefined,
          e: undefined,
          f: 'sublevel2.level1',
          g: undefined // same key only included from immediate parents and root
        });
      });

      it('should fallback through multiple routes (animations)', function() {
        const descriptors = {
          animations: {
            _fallback: 'animation',
          },
        };
        const defaults = {
          animation: {
            duration: 1000,
            easing: 'easeInQuad'
          },
          animations: {
            colors: {
              properties: ['color', 'backgroundColor'],
              type: 'color'
            },
            numbers: {
              properties: ['x', 'y'],
              type: 'number'
            }
          },
          transitions: {
            resize: {
              animation: {
                duration: 0
              }
            },
            show: {
              animation: {
                duration: 400
              },
              animations: {
                colors: {
                  from: 'transparent'
                }
              }
            }
          }
        };
        const options = {
          animation: {
            easing: 'linear'
          },
          animations: {
            colors: {
              properties: ['color', 'borderColor', 'backgroundColor'],
            },
            duration: {
              properties: ['a', 'b'],
              type: 'boolean'
            }
          }
        };

        const show = _createResolver([options, defaults.transitions.show, defaults, descriptors]);
        expect(show.animation).toEqualOptions({
          duration: 400,
          easing: 'linear'
        });
        expect(show.animations.colors._scopes).toEqual([
          options.animations.colors,
          defaults.transitions.show.animations.colors,
          defaults.animations.colors,
          options.animation,
          defaults.transitions.show.animation,
          defaults.animation
        ]);
        expect(show.animations.colors).toEqualOptions({
          duration: 400,
          from: 'transparent',
          easing: 'linear',
          type: 'color',
          properties: ['color', 'borderColor', 'backgroundColor']
        });
        expect(show.animations.duration).toEqualOptions({
          duration: 400,
          easing: 'linear',
          type: 'boolean',
          properties: ['a', 'b']
        });
        expect(Object.getOwnPropertyNames(show.animations).filter(k => Chart.helpers.isObject(show.animations[k]))).toEqual([
          'colors',
          'duration',
          'numbers',
        ]);
        const def = _createResolver([options, defaults, descriptors]);
        expect(def.animation).toEqualOptions({
          duration: 1000,
          easing: 'linear'
        });
        expect(def.animations.colors._scopes).toEqual([
          options.animations.colors,
          defaults.animations.colors,
          options.animation,
          defaults.animation
        ]);
        expect(def.animations.colors).toEqualOptions({
          duration: 1000,
          easing: 'linear',
          type: 'color',
          properties: ['color', 'borderColor', 'backgroundColor']
        });
        expect(def.animations.duration).toEqualOptions({
          duration: 1000,
          easing: 'linear',
          type: 'boolean',
          properties: ['a', 'b']
        });
        expect(Object.getOwnPropertyNames(def.animations).filter(k => Chart.helpers.isObject(show.animations[k]))).toEqual([
          'colors',
          'duration',
          'numbers',
        ]);
      });
    });
    describe('setting values', function() {
      it('should set values to first scope', function() {
        const defaults = {
          value: true
        };
        const options = {};
        const resolver = _createResolver([options, defaults]);
        resolver.value = false;
        expect(options.value).toBe(false);
        expect(defaults.value).toBe(true);
        expect(resolver.value).toBe(false);
      });

      it('should set values of sub-objects to first scope', function() {
        const defaults = {
          sub: {
            value: true
          }
        };
        const options = {};
        const resolver = _createResolver([options, defaults]);
        resolver.sub.value = false;
        expect(options.sub.value).toBe(false);
        expect(defaults.sub.value).toBe(true);
        expect(resolver.sub.value).toBe(false);
      });

      it('should throw when setting a value and options is frozen', function() {
        const defaults = Object.freeze({default: true});
        const options = Object.freeze({value: true});
        const resolver = _createResolver([options, defaults]);
        function set() {
          resolver.value = false;
        }
        expect(set).toThrow();
      });
    });
  });

  describe('_attachContext', function() {
    it('should resolve to final values', function() {
      const defaults = {
        color: 'red',
        backgroundColor: 'green',
        hoverColor: (ctx, options) => getHoverColor(options.color)
      };
      const options = {
        color: ['white', 'blue']
      };
      const resolver = _createResolver([options, defaults]);
      const opts = _attachContext(resolver, {index: 1});
      expect(opts.color).toEqual('blue');
      expect(opts.backgroundColor).toEqual('green');
      expect(opts.hoverColor).toEqual(getHoverColor('blue'));
    });

    it('should resolve each option only once', function() {
      let calls = 0;
      const options = {
        color: () => {
          calls++;
          return 'red';
        },
        sub: {value: 1}
      };
      const opts = _attachContext(_createResolver([options]), {index: 0});
      expect(opts.color).toEqual('red');
      expect(opts.color).toEqual('red');
      expect(calls).toEqual(1);
      expect(opts.sub).toBe(opts.sub);
    });

    it('should not resolve the constructor as a scriptable option', function() {
      const opts = _attachContext(_createResolver([{}]), {index: 0});
      expect(opts.constructor).toBe(Object);
    });

    it('should thrown on recursion', function() {
      const options = {
        foo: (ctx, opts) => opts.bar,
        bar: (ctx, opts) => opts.xyz,
        xyz: (ctx, opts) => opts.foo
      };
      const resolver = _createResolver([options]);
      const opts = _attachContext(resolver, {test: true});
      expect(function() {
        return opts.foo;
      }).toThrowError('Recursion detected: foo->bar->xyz->foo');
    });

    it('should support scriptable options in subscopes', function() {
      const defaults = {
        elements: {
          point: {
            backgroundColor: 'red'
          }
        }
      };
      const options = {
        elements: {
          point: {
            borderColor: (ctx, opts) => getHoverColor(opts.backgroundColor)
          }
        }
      };
      const resolver = _createResolver([options, defaults]);
      const opts = _attachContext(resolver, {});
      expect(opts.elements.point.borderColor).toEqual(getHoverColor('red'));
      expect(opts.elements.point.backgroundColor).toEqual('red');
    });

    it('same resolver should be usable with multiple contexts', function() {
      const defaults = {
        animation: {
          delay: 10
        }
      };
      const options = {
        animation: (ctx) => ctx.index === 0 ? {duration: 1000} : {duration: 500}
      };
      const resolver = _createResolver([options, defaults]);
      const opts1 = _attachContext(resolver, {index: 0});
      const opts2 = _attachContext(resolver, {index: 1});

      expect(opts1.animation.duration).toEqual(1000);
      expect(opts1.animation.delay).toEqual(10);

      expect(opts2.animation.duration).toEqual(500);
      expect(opts2.animation.delay).toEqual(10);
    });

    it('should fall back from object returned from scriptable option', function() {
      const defaults = {
        mainScope: {
          main: true,
          subScope: {
            sub: true
          }
        }
      };
      const options = {
        mainScope: (ctx) => ({
          mainTest: ctx.contextValue,
          subScope: {
            subText: 'a'
          }
        })
      };
      const opts = _attachContext(_createResolver([options, defaults]), {contextValue: 'test'});
      expect(opts.mainScope).toEqualOptions({
        main: true,
        mainTest: 'test',
        subScope: {
          sub: true,
          subText: 'a'
        }
      });
    });

    it('should resolve array of non-indexable objects properly', function() {
      const defaults = {
        label: {
          value: 42,
          text: (ctx) => ctx.text
        },
        labels: {
          _fallback: 'label',
          _indexable: false
        }
      };

      const options = {
        labels: [{text: 'a'}, {text: 'b'}, {value: 1}]
      };
      const opts = _attachContext(_createResolver([options, defaults]), {text: 'context'});
      expect(opts).toEqualOptions({
        labels: [
          {
            text: 'a',
            value: 42
          },
          {
            text: 'b',
            value: 42
          },
          {
            text: 'context',
            value: 1
          }
        ]
      });
    });

    it('should not expose the array through objects in an array', function() {
      const defaults = {
        array: [{a: 'default'}]
      };
      const options = {
        array: [{a: 1}, {a: 2}]
      };
      const resolver = _createResolver([options, defaults]);
      const opts = _attachContext(resolver, {});

      expect(Object.keys(opts.array[0])).toEqual(['a']);
      expect(JSON.stringify(opts.array)).toEqual('[{"a":1},{"a":2}]');
      expect(opts.array[0][1]).toBeUndefined();
      expect(opts.array[0].length).toBeUndefined();
    });

    it('should not list the indexes of an array as keys of its items in plugin options', function() {
      const options = {
        ranges: [{prop: 1}, {prop: 2}]
      };
      // The descriptor defaults that plugin options are resolved with
      const opts = _attachContext(_createResolver([options]), {}, undefined, {
        scriptable: false,
        indexable: false,
        allKeys: true
      });

      expect(Object.keys(opts.ranges[0])).toEqual(['prop']);
      expect(Object.keys(opts.ranges[1])).toEqual(['prop']);
      expect(opts.ranges[1].prop).toBe(2);
      expect(JSON.stringify(opts.ranges)).toEqual('[{"prop":1},{"prop":2}]');
    });

    it('should call _fallback with proper value from array when descriptor is object', function() {
      const spy = vi.fn();
      const descriptors = {
        items: {
          _fallback: spy
        }
      };
      const options = {
        items: [{test: true}]
      };
      const resolver = _createResolver([options, descriptors]);
      const opts = _attachContext(resolver, {dymmy: true});
      const item0 = opts.items[0];
      expect(item0.test).toEqual(true);
      expect(spy).toHaveBeenCalledWith('items', options.items[0]);
    });

    it('should call _fallback with proper value from array when descriptor and defaults are objects', function() {
      const spy = vi.fn();
      const descriptors = {
        items: {
          _fallback: spy
        }
      };
      const defaults = {
        items: {
          type: 'defaultType'
        }
      };
      const options = {
        items: [{test: true}]
      };
      const resolver = _createResolver([options, defaults, descriptors]);
      const opts = _attachContext(resolver, {dymmy: true});
      const item0 = opts.items[0];
      expect(item0.test).toEqual(true);
      expect(spy).toHaveBeenCalledWith('items', options.items[0]);
    });

    it('should support overriding options', function() {
      const options = {
        fn1: ctx => ctx.index,
        fn2: ctx => ctx.type
      };
      const override = {
        fn1: ctx => ctx.index * 2
      };
      const opts = _attachContext(_createResolver([options]), {index: 2, type: 'test'});
      expect(opts).toEqualOptions({
        fn1: 2,
        fn2: 'test'
      });
      expect(opts.override(override)).toEqualOptions({
        fn1: 4,
        fn2: 'test'
      });
    });

    it('should support changing context', function() {
      const opts = _attachContext(_createResolver([{fn: ctx => ctx.test}]), {test: 1});
      expect(opts.fn).toEqual(1);
      expect(opts.setContext({test: 2}).fn).toEqual(2);
      expect(opts.fn).toEqual(1);
    });

    describe('with a second proxy for scriptable options', function() {
      // As Config.resolveNamedOptions builds them: the second proxy resolves the same
      // scopes without the hover prefixes, in the same context
      function attachWithSubProxy(scopes, context, prefixes = ['']) {
        const subPrefixes = prefixes.filter(p => !p.toLowerCase().includes('hover'));
        const subProxy = _attachContext(_createResolver(scopes, subPrefixes), context);
        return _attachContext(_createResolver(scopes, prefixes), context, subProxy);
      }

      it('should give scriptable options the new context after setContext', function() {
        const options = {
          a: (ctx, opts) => ctx.n + ':' + opts.b,
          b: ctx => ctx.n
        };
        const opts = attachWithSubProxy([options], {n: 1});

        expect(opts.a).toEqual('1:1');
        expect(opts.setContext({n: 2}).a).toEqual('2:2');
        expect(opts.a).toEqual('1:1');
      });

      it('should give scriptable options the plain object override', function() {
        const options = {
          label: {
            type: 'box',
            kind: (ctx, opts) => opts.type
          }
        };

        const opts = attachWithSubProxy([options], {});
        expect(opts.label.kind).toEqual('box');
        expect(opts.label.override({type: 'label'}).kind).toEqual('label');

        const hovered = attachWithSubProxy([options], {}, ['hover', '']);
        expect(hovered.label.override({type: 'label'}).kind).toEqual('label');
      });

      it('should give scriptable options in an item of an array the options of that item', function() {
        const options = {
          items: [
            {a: 1, b: (ctx, opts) => Array.isArray(opts), c: (ctx, opts) => opts.a},
            {a: 2, b: (ctx, opts) => Array.isArray(opts), c: (ctx, opts) => opts.a}
          ]
        };
        const opts = attachWithSubProxy([options], {});

        expect(opts.items[0].b).toBe(false);
        expect(opts.items[0].c).toBe(1);
        expect(opts.items[1].b).toBe(false);
        expect(opts.items[1].c).toBe(2);
      });
    });

    it('should support changing prefixes', function() {
      const res = _createResolver([{test: 1, hoverTest: 2}]);
      const opts = _attachContext(res, {ctx: 1});
      expect(opts.test).toEqual(1);
      expect(opts.setContext({ctx: 2}, ['hover', '']).test).toEqual(2);
      expect(opts.test).toEqual(1);
      expect(opts.override({}).setContext({ctx: 2}, ['hover', '']).test).toEqual(2);
    });

    it('should support prefixes to subnodes', function() {
      const res = _createResolver([{node: {test: 1, hoverTest: 2}}], ['hover', '']);
      expect(res.node.test).toEqual(2);
    });

    it('should support common object methods', function() {
      const defaults = {
        option1: 'defaults'
      };
      class Options {
        constructor() {
          this.option2 = () => 'options';
        }
        get getter() {
          return 'options getter';
        }
      }
      const options = new Options();
      const resolver = _createResolver([options, defaults]);
      const opts = _attachContext(resolver, {index: 1});

      expect(Object.prototype.hasOwnProperty.call(opts, 'option2')).toBe(true);

      expect(Object.prototype.hasOwnProperty.call(opts, 'option1')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(opts, 'getter')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(opts, 'nonexistent')).toBe(false);

      expect(Object.keys(opts)).toEqual(['option2']);
      expect(Object.getOwnPropertyNames(opts)).toEqual(['option2', 'option1']);

      expect('option2' in opts).toBe(true);
      expect('option1' in opts).toBe(true);
      expect('getter' in opts).toBe(false);
      expect('nonexistent' in opts).toBe(false);

      expect(opts instanceof Options).toBe(true);

      expect(opts.getter).toEqual('options getter');

      expect('test' in opts).toBe(false);
      expect(opts.test).toBeUndefined();

      opts.test = true;
      expect('test' in opts).toBe(true);
      expect(opts.test).toBe(true);

      delete opts.test;
      expect('test' in opts).toBe(false);

      opts.test = (ctx) => ctx.index;
      expect('test' in opts).toBe(true);
      expect(opts.test).toBe(1);

      delete opts.test;
      expect('test' in opts).toBe(false);
    });

    it('should not create proxy for adapters', function() {
      const defaults = {
        scales: {
          time: {
            adapters: {
              date: {
                locale: {
                  method: (arg) => arg === undefined ? 'ok' : 'fail'
                }
              }
            }
          }
        }
      };

      const resolver = _createResolver([{}, defaults]);
      const opts = _attachContext(resolver, {index: 1});
      const fn = opts.scales.time.adapters.date.locale.method;
      expect(typeof fn).toBe('function');
      expect(fn()).toEqual('ok');
    });

    it('should not create proxy for objects with custom constructor', function() {
      class MyClass {
        constructor() {
          this.string = 'test string';
        }
        method(arg) {
          return arg === undefined ? 'ok' : 'fail';
        }
      }

      const defaults = {
        test: new MyClass()
      };

      const resolver = _createResolver([{}, defaults]);
      const opts = _attachContext(resolver, {index: 1});
      const fn = opts.test.method;
      expect(typeof fn).toBe('function');
      expect(fn()).toEqual('ok');
      expect(opts.test.string).toEqual('test string');
      expect(opts.test.constructor).toEqual(MyClass);
    });

    it('should properly set value to object in array of objects', function() {
      const defaults = {};
      const options = {
        annotations: [{
          value: 10
        }, {
          value: 20
        }]
      };
      const resolver = _attachContext(_createResolver([options, defaults]), {test: true});
      expect(resolver.annotations[0].value).toEqual(10);

      resolver.annotations[0].value = 15;
      expect(options.annotations[0].value).toEqual(15);
      expect(options.annotations[1].value).toEqual(20);
    });

    describe('_indexable and _scriptable', function() {
      it('should default to true', function() {
        const options = {
          array: [1, 2, 3],
          func: (ctx) => ctx.index * 10
        };
        const opts = _attachContext(_createResolver([options]), {index: 1});
        expect(opts.array).toEqual(2);
        expect(opts.func).toEqual(10);
      });

      it('should allow false', function() {
        const fn = () => 'test';
        const options = {
          _indexable: false,
          _scriptable: false,
          array: [1, 2, 3],
          func: fn
        };
        const opts = _attachContext(_createResolver([options]), {index: 1});
        expect(opts.array).toEqual([1, 2, 3]);
        expect(opts.func).toEqual(fn);
        expect(opts.func()).toEqual('test');
      });

      it('should allow function', function() {
        const fn = () => 'test';
        const options = {
          _indexable: (prop) => prop !== 'array',
          _scriptable: (prop) => prop === 'func',
          array: [1, 2, 3],
          array2: ['a', 'b', 'c'],
          func: fn
        };
        const opts = _attachContext(_createResolver([options]), {index: 1});
        expect(opts.array).toEqual([1, 2, 3]);
        expect(opts.func).toEqual('test');
        expect(opts.array2).toEqual('b');
      });
    });
  });

  describe('prefixes', function() {
    const hover = ['hover', ''];

    describe('in nested options', function() {
      it('should apply to a static object', function() {
        const res = _createResolver([{node: {test: 1, hoverTest: 2}}], hover);
        expect(res.node.test).toEqual(2);
      });

      it('should apply two levels down', function() {
        const res = _createResolver([{a: {b: {test: 1, hoverTest: 2}}}], hover);
        expect(res.a.b.test).toEqual(2);
      });

      it('should apply to an object returned by a function', function() {
        const opts = _attachContext(_createResolver([{node: () => ({test: 1, hoverTest: 2})}], hover), {});
        expect(opts.node.test).toEqual(2);
      });

      it('should apply to the items of an array', function() {
        const opts = _attachContext(_createResolver([{nodes: [{test: 1, hoverTest: 2}]}], hover), {});
        expect(opts.nodes[0].test).toEqual(2);
      });

      it('should apply to the item an indexable array gives for the context index', function() {
        const nodes = [{test: 1, hoverTest: 2}, {test: 3, hoverTest: 4}];
        const opts = _attachContext(_createResolver([{nodes}], hover), {index: 1});
        expect(opts.nodes.test).toEqual(4);
      });

      it('should apply to the item an indexable array gives for a context index past its length', function() {
        const nodes = [{test: 1, hoverTest: 2}, {test: 3, hoverTest: 4}];
        const opts = _attachContext(_createResolver([{nodes}], hover), {index: 3});
        expect(opts.nodes.test).toEqual(4);
      });

      it('should not merge a lower object under the same key into the item an indexable array gives', function() {
        const nodes = [{test: 1, hoverTest: 2}];
        const opts = _attachContext(_createResolver([{nodes}, {nodes: {extra: 5}}], hover), {index: 0});
        expect(opts.nodes.test).toEqual(2);
        expect(opts.nodes.extra).toBeUndefined();
      });

      it('should resolve as before when no nested key has a prefix', function() {
        const res = _createResolver([{node: {test: 1, other: 2}}], hover);
        expect(res.node.test).toEqual(1);
        expect(res.node.other).toEqual(2);
      });
    });

    describe('setContext', function() {
      it('should resolve every level with the prefixes and keep the original options', function() {
        const options = {color: 'red', hoverColor: 'blue', label: {color: 'black', hoverColor: 'white'}};
        const opts = _attachContext(_createResolver([options]), {});
        const hovered = opts.setContext({}, hover);

        expect(hovered.color).toEqual('blue');
        expect(hovered.label.color).toEqual('white');
        expect(opts.color).toEqual('red');
        expect(opts.label.color).toEqual('black');
      });

      it('should keep the prefixes when they are left out or empty, and reset them with [\'\']', function() {
        const options = {color: 'red', hoverColor: 'blue', label: {color: 'black', hoverColor: 'white'}};
        const hovered = _attachContext(_createResolver([options]), {}).setContext({}, hover);

        expect(hovered.setContext({}).color).toEqual('blue');
        expect(hovered.setContext({}).label.color).toEqual('white');
        expect(hovered.setContext({}, []).color).toEqual('blue');
        expect(hovered.setContext({}, []).label.color).toEqual('white');
        expect(hovered.setContext({}, ['']).color).toEqual('red');
        expect(hovered.setContext({}, ['']).label.color).toEqual('black');
      });

      it('should not detect recursion when a hover option reads its option from the second argument', function() {
        const hoverColor = (ctx, opts) => opts.color + '+dark';
        const options = {color: 'red', hoverColor, label: {color: 'red', hoverColor}};
        const hovered = _attachContext(_createResolver([options]), {}).setContext({}, hover);

        expect(hovered.color).toEqual('red+dark');
        expect(hovered.label.color).toEqual('red+dark');
      });

      it('should not detect recursion in an item of an array', function() {
        const options = {nodes: [{color: 'red', hoverColor: (ctx, opts) => opts.color + '+dark'}]};
        const hovered = _attachContext(_createResolver([options]), {}).setContext({}, hover);

        expect(hovered.nodes[0].color).toEqual('red+dark');
      });

      it('should give the second argument of an item of an array the context', function() {
        const options = {nodes: [{size: ctx => ctx.n, color: 'red', hoverColor: (ctx, opts) => 'c' + opts.size}]};
        const hovered = _attachContext(_createResolver([options]), {n: 1}).setContext({n: 7}, hover);

        expect(hovered.nodes[0].color).toEqual('c7');
      });

      it('should not detect recursion for a prefix that is not named hover', function() {
        const options = {color: 'red', activeColor: (ctx, opts) => opts.color + '+dark'};
        const active = _attachContext(_createResolver([options]), {}).setContext({}, ['active', '']);

        expect(active.color).toEqual('red+dark');
      });

      it('should give scriptable options the prefixes in effect before the call', function() {
        const options = {
          color: 'red',
          pointColor: 'green',
          pointHoverColor: (ctx, opts) => opts.color + '+dark'
        };
        const point = _attachContext(_createResolver([options]), {}).setContext({}, ['point', '']);
        expect(point.color).toEqual('green');

        // Each call with prefixes wraps the options it is called on as the second proxy,
        // so chained calls nest the second proxies
        const pointHover = point.setContext({}, ['pointHover', 'point', '']);
        expect(pointHover.color).toEqual('green+dark');
      });

      it('should give scriptable options and the second proxy the new context', function() {
        const options = {
          a: (ctx, opts) => ctx.n + ':' + opts.b,
          b: ctx => ctx.n,
          hoverB: ctx => 'h' + ctx.n
        };
        const opts = _attachContext(_createResolver([options]), {n: 1});
        const hovered = opts.setContext({n: 2}, hover);

        expect(hovered.b).toEqual('h2');
        expect(hovered.a).toEqual('2:2');
        expect(hovered.setContext({n: 3}).a).toEqual('3:3');
        expect(opts.a).toEqual('1:1');
      });

      it('should give an item of an array the same item without the prefixes as the second argument', function() {
        // The prefixed key picks another array than the second proxy resolves
        const options = {
          nodes: [{a: 1, hoverA: 5, b: (ctx, opts) => opts.a}],
          hoverNodes: [{a: 2, hoverA: 6, b: (ctx, opts) => opts.a}]
        };
        const hovered = _attachContext(_createResolver([options]), {}).setContext({}, hover);

        expect(hovered.nodes[0].a).toEqual(6);
        expect(hovered.nodes[0].b).toEqual(2);
      });

      it('should build the second argument of an item of an array from the scopes of the second proxy', function() {
        // One level down, so that the scopes of the second proxy are not its root scopes
        const main = _createResolver([{wrapper: {nodes: [{b: (ctx, opts) => opts.a}]}}], hover);
        const second = _attachContext(_createResolver([{wrapper: {nodes: [{}]}}, {wrapper: {nodes: {a: 'second'}}}]), {});
        const opts = _attachContext(main, {}, second);

        expect(opts.wrapper.nodes[0].b).toEqual('second');
      });

      it('should give an item of an array the plain object override as the second argument', function() {
        const options = {nodes: [{type: 'box'}]};
        const hovered = _attachContext(_createResolver([options]), {}).setContext({}, hover);
        const overridden = hovered.override({
          nodes: [{type: 'label', hoverType: 'hovered label', kind: (ctx, opts) => opts.type}]
        });

        expect(overridden.nodes[0].type).toEqual('hovered label');
        expect(overridden.nodes[0].kind).toEqual('label');
      });

      it('should set a value where it is set without the prefixes', function() {
        const defaults = {label: {color: 'red'}};
        const options = {};
        const opts = _attachContext(_createResolver([options, defaults]), {});

        const hovered = opts.label.setContext({}, hover);
        hovered.color = 'blue';
        expect(options.label.color).toEqual('blue');
        expect(defaults.label.color).toEqual('red');
      });

      it('should fall back to the root scopes the options fall back to without the prefixes', function() {
        const defaults = {other: {b: 2}, label: {sub: {_fallback: 'other'}}};
        const options = {label: {sub: {a: 1}}};
        const opts = _attachContext(_createResolver([options, defaults]), {});

        expect(opts.label.sub.b).toEqual(2);
        expect(opts.label.setContext({}, hover).sub.b).toEqual(2);
      });

      it('should keep the fallback of the options it is called on', function() {
        const descriptors = {_fallback: (prop) => (prop === 'label' ? 'other' : undefined)};
        const options = {label: {sub: {a: 1}}, other: {b: 2}};
        const opts = _attachContext(_createResolver([options, descriptors]), {});

        expect(opts.label.sub.b).toEqual(2);
        expect(opts.label.setContext({}, hover).sub.b).toEqual(2);
      });
    });
  });
});
