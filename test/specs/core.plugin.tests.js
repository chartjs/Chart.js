describe('Chart.plugins', function() {
  describe('Chart.notifyPlugins', function() {
    it('should call inline plugins with arguments', function() {
      var plugin = {hook: function() {}};
      var chart = window.acquireChart({
        plugins: [plugin]
      });
      var args = {value: 42};

      spyOn(plugin, 'hook');

      chart.notifyPlugins('hook', args);
      expect(plugin.hook.calls.count()).toBe(1);
      expect(plugin.hook.calls.first().args[0]).toBe(chart);
      expect(plugin.hook.calls.first().args[1]).toBe(args);
      expect(plugin.hook.calls.first().args[2]).toEqualOptions({});
    });

    it('should call global plugins with arguments', function() {
      var plugin = {id: 'a', hook: function() {}};
      var chart = window.acquireChart({});
      var args = {value: 42};

      spyOn(plugin, 'hook');

      Chart.register(plugin);
      chart.notifyPlugins('hook', args);
      expect(plugin.hook.calls.count()).toBe(1);
      expect(plugin.hook.calls.first().args[0]).toBe(chart);
      expect(plugin.hook.calls.first().args[1]).toBe(args);
      expect(plugin.hook.calls.first().args[2]).toEqualOptions({});
      Chart.unregister(plugin);
    });

    it('should call plugin only once even if registered multiple times', function() {
      var plugin = {id: 'test', hook: function() {}};
      var chart = window.acquireChart({
        plugins: [plugin, plugin]
      });

      spyOn(plugin, 'hook');

      Chart.register([plugin, plugin]);
      chart.notifyPlugins('hook');
      expect(plugin.hook.calls.count()).toBe(1);
      Chart.unregister(plugin);
    });

    it('should call plugins in the correct order (global first)', function() {
      var results = [];
      var chart = window.acquireChart({
        plugins: [{
          hook: function() {
            results.push(1);
          }
        }, {
          hook: function() {
            results.push(2);
          }
        }, {
          hook: function() {
            results.push(3);
          }
        }]
      });

      var plugins = [{
        id: 'a',
        hook: function() {
          results.push(4);
        }
      }, {
        id: 'b',
        hook: function() {
          results.push(5);
        }
      }, {
        id: 'c',
        hook: function() {
          results.push(6);
        }
      }];
      Chart.register(plugins);

      var ret = chart.notifyPlugins('hook');
      expect(ret).toBeTruthy();
      expect(results).toEqual([4, 5, 6, 1, 2, 3]);
      Chart.unregister(plugins);
    });

    it('should return TRUE if no plugin explicitly returns FALSE', function() {
      var chart = window.acquireChart({
        plugins: [{
          hook: function() {}
        }, {
          hook: function() {
            return null;
          }
        }, {
          hook: function() {
            return 0;
          }
        }, {
          hook: function() {
            return true;
          }
        }, {
          hook: function() {
            return 1;
          }
        }]
      });

      var plugins = chart.config.plugins;
      plugins.forEach(function(plugin) {
        spyOn(plugin, 'hook').and.callThrough();
      });

      var ret = chart.notifyPlugins('hook');
      expect(ret).toBeTruthy();
      plugins.forEach(function(plugin) {
        expect(plugin.hook).toHaveBeenCalled();
      });
    });

    it('should return FALSE if any plugin explicitly returns FALSE', function() {
      var chart = window.acquireChart({
        plugins: [{
          hook: function() {}
        }, {
          hook: function() {
            return null;
          }
        }, {
          hook: function() {
            return false;
          }
        }, {
          hook: function() {
            return 42;
          }
        }, {
          hook: function() {
            return 'bar';
          }
        }]
      });

      var plugins = chart.config.plugins;
      plugins.forEach(function(plugin) {
        spyOn(plugin, 'hook').and.callThrough();
      });

      var ret = chart.notifyPlugins('hook', {cancelable: true});
      expect(ret).toBeFalsy();
      expect(plugins[0].hook).toHaveBeenCalled();
      expect(plugins[1].hook).toHaveBeenCalled();
      expect(plugins[2].hook).toHaveBeenCalled();
      expect(plugins[3].hook).not.toHaveBeenCalled();
      expect(plugins[4].hook).not.toHaveBeenCalled();
    });
  });

  describe('config.options.plugins', function() {
    it('should call plugins with options at last argument', function() {
      var plugin = {id: 'foo', hook: function() {}};

      var chart = window.acquireChart({
        options: {
          plugins: {
            foo: {a: '123'},
          }
        }
      });

      spyOn(plugin, 'hook');

      Chart.register(plugin);
      chart.notifyPlugins('hook');
      chart.notifyPlugins('hook', {arg1: 'bla'});
      chart.notifyPlugins('hook', {arg1: 'bla', arg2: 42});

      expect(plugin.hook.calls.count()).toBe(3);
      expect(plugin.hook.calls.argsFor(0)[2]).toEqualOptions({a: '123'});
      expect(plugin.hook.calls.argsFor(1)[2]).toEqualOptions({a: '123'});
      expect(plugin.hook.calls.argsFor(2)[2]).toEqualOptions({a: '123'});

      Chart.unregister(plugin);
    });

    it('should call plugins with options associated to their identifier', function() {
      var plugins = {
        a: {id: 'a', hook: function() {}},
        b: {id: 'b', hook: function() {}},
        c: {id: 'c', hook: function() {}}
      };

      Chart.register(plugins.a);

      var chart = window.acquireChart({
        plugins: [plugins.b, plugins.c],
        options: {
          plugins: {
            a: {a: '123'},
            b: {b: '456'},
            c: {c: '789'}
          }
        }
      });

      spyOn(plugins.a, 'hook');
      spyOn(plugins.b, 'hook');
      spyOn(plugins.c, 'hook');

      chart.notifyPlugins('hook');

      expect(plugins.a.hook).toHaveBeenCalled();
      expect(plugins.b.hook).toHaveBeenCalled();
      expect(plugins.c.hook).toHaveBeenCalled();
      expect(plugins.a.hook.calls.first().args[2]).toEqualOptions({a: '123'});
      expect(plugins.b.hook.calls.first().args[2]).toEqualOptions({b: '456'});
      expect(plugins.c.hook.calls.first().args[2]).toEqualOptions({c: '789'});

      Chart.unregister(plugins.a);
    });

    it('should not call plugins when config.options.plugins.{id} is FALSE', function() {
      var plugins = {
        a: {id: 'a', hook: function() {}},
        b: {id: 'b', hook: function() {}},
        c: {id: 'c', hook: function() {}}
      };

      Chart.register(plugins.a);

      var chart = window.acquireChart({
        plugins: [plugins.b, plugins.c],
        options: {
          plugins: {
            a: false,
            b: false
          }
        }
      });

      spyOn(plugins.a, 'hook');
      spyOn(plugins.b, 'hook');
      spyOn(plugins.c, 'hook');

      chart.notifyPlugins('hook');

      expect(plugins.a.hook).not.toHaveBeenCalled();
      expect(plugins.b.hook).not.toHaveBeenCalled();
      expect(plugins.c.hook).toHaveBeenCalled();

      Chart.unregister(plugins.a);
    });

    it('should call plugins with default options when plugin options is TRUE', function() {
      var plugin = {id: 'a', hook: function() {}, defaults: {a: 42}};

      Chart.register(plugin);

      var chart = window.acquireChart({
        options: {
          plugins: {
            a: true
          }
        }
      });

      spyOn(plugin, 'hook');

      chart.notifyPlugins('hook');

      expect(plugin.hook).toHaveBeenCalled();
      expect(Object.keys(plugin.hook.calls.first().args[2])).toEqual(['a']);
      expect(plugin.hook.calls.first().args[2]).toEqual(jasmine.objectContaining({a: 42}));

      Chart.unregister(plugin);
    });


    it('should call plugins with default options if plugin config options is undefined', function() {
      var plugin = {id: 'a', hook: function() {}, defaults: {a: 'foobar'}};

      Chart.register(plugin);
      spyOn(plugin, 'hook');

      var chart = window.acquireChart();

      chart.notifyPlugins('hook');

      expect(plugin.hook).toHaveBeenCalled();
      expect(plugin.hook.calls.first().args[2]).toEqualOptions({a: 'foobar'});

      Chart.unregister(plugin);
    });

    // https://github.com/chartjs/Chart.js/issues/10482
    it('should resolve defaults for local plugins', function() {
      var plugin = {id: 'a', hook: function() {}, defaults: {bar: 'bar'}};
      var chart = window.acquireChart({
        plugins: [plugin],
        options: {
          plugins: {
            a: {
              foo: 'foo'
            }
          }
        },
      });

      spyOn(plugin, 'hook');
      chart.notifyPlugins('hook');

      expect(plugin.hook).toHaveBeenCalled();
      expect(plugin.hook.calls.first().args[2]).toEqualOptions({foo: 'foo', bar: 'bar'});

      Chart.unregister(plugin);
    });

    // https://github.com/chartjs/Chart.js/issues/5111#issuecomment-355934167
    it('should update plugin options', function() {
      var plugin = {id: 'a', hook: function() {}};
      var chart = window.acquireChart({
        plugins: [plugin],
        options: {
          plugins: {
            a: {
              foo: 'foo'
            }
          }
        },
      });

      spyOn(plugin, 'hook');

      chart.notifyPlugins('hook');

      expect(plugin.hook).toHaveBeenCalled();
      expect(plugin.hook.calls.first().args[2]).toEqualOptions({foo: 'foo'});

      chart.options.plugins.a = {bar: 'bar'};
      chart.update();

      plugin.hook.calls.reset();
      chart.notifyPlugins('hook');

      expect(plugin.hook).toHaveBeenCalled();
      expect(plugin.hook.calls.first().args[2]).toEqualOptions({bar: 'bar'});
    });

    // https://github.com/chartjs/Chart.js/issues/10654
    it('should resolve options even if some subnodes are set as undefined', function() {
      var runtimeOptions;
      var plugin = {
        id: 'a',
        afterUpdate: function(chart, args, options) {
          options.l1.l2.l3.display = true;
          runtimeOptions = options;
        },
        defaults: {
          l1: {
            l2: {
              l3: {
                display: false
              }
            }
          }
        }
      };
      window.acquireChart({
        plugins: [plugin],
        options: {
          plugins: {
            a: {
              l1: {
                l2: undefined
              }
            },
          }
        },
      });

      expect(runtimeOptions.l1.l2.l3.display).toBe(true);
      Chart.unregister(plugin);
    });

    it('should disable all plugins', function() {
      var plugin = {id: 'a', hook: function() {}};
      var chart = window.acquireChart({
        plugins: [plugin],
        options: {
          plugins: false
        }
      });

      spyOn(plugin, 'hook');

      chart.notifyPlugins('hook');

      expect(plugin.hook).not.toHaveBeenCalled();
    });

    it('should not restart plugins when a double register occurs', function() {
      var results = [];
      var chart = window.acquireChart({
        plugins: [{
          start: function() {
            results.push(1);
          }
        }]
      });

      Chart.register({id: 'abc', hook: function() {}});
      Chart.register({id: 'def', hook: function() {}});

      chart.update();

      // The plugin on the chart should only be started once
      expect(results).toEqual([1]);
    });

    it('should default to false for _scriptable, _indexable', function(done) {
      const plugin = {
        id: 'test',
        start: function(chart, args, opts) {
          expect(opts.fun).toEqual(jasmine.any(Function));
          expect(opts.fun()).toEqual('test');
          expect(opts.arr).toEqual([1, 2, 3]);

          expect(opts.sub.subfun).toEqual(jasmine.any(Function));
          expect(opts.sub.subfun()).toEqual('subtest');
          expect(opts.sub.subarr).toEqual([3, 2, 1]);
          done();
        }
      };
      window.acquireChart({
        options: {
          plugins: {
            test: {
              fun: () => 'test',
              arr: [1, 2, 3],
              sub: {
                subfun: () => 'subtest',
                subarr: [3, 2, 1],
              }
            }
          }
        },
        plugins: [plugin]
      });
    });

    it('should filter event callbacks by plugin events array', async function() {
      const results = [];
      const chart = window.acquireChart({
        options: {
          events: ['mousemove', 'test', 'test2', 'pointerleave'],
          plugins: {
            testPlugin: {
              events: ['test', 'pointerleave']
            }
          }
        },
        plugins: [{
          id: 'testPlugin',
          beforeEvent: function(_chart, args) {
            results.push('before' + args.event.type);
          },
          afterEvent: function(_chart, args) {
            results.push('after' + args.event.type);
          }
        }]
      });
      await jasmine.triggerMouseEvent(chart, 'mousemove', {x: 0, y: 0});
      await jasmine.triggerMouseEvent(chart, 'test', {x: 0, y: 0});
      await jasmine.triggerMouseEvent(chart, 'test2', {x: 0, y: 0});
      await jasmine.triggerMouseEvent(chart, 'pointerleave', {x: 0, y: 0});
      expect(results).toEqual(['beforetest', 'aftertest', 'beforemouseout', 'aftermouseout']);
    });

    it('should not call plugins after uninstall', async function() {
      const results = [];
      const chart = window.acquireChart({
        options: {
          events: ['test'],
          plugins: {
            testPlugin: {
              events: ['test']
            }
          }
        },
        plugins: [{
          id: 'testPlugin',
          reset: () => results.push('reset'),
          afterDestroy: () => results.push('afterDestroy'),
          uninstall: () => results.push('uninstall'),
        }]
      });
      chart.reset();
      expect(results).toEqual(['reset']);
      chart.destroy();
      expect(results).toEqual(['reset', 'afterDestroy', 'uninstall']);
      chart.reset();
      expect(results).toEqual(['reset', 'afterDestroy', 'uninstall']);
    });
  });
});

describe('Plugin object lifecycle', function() {
  ['same', 'anonymous', 'distinct'].forEach(function(identity) {
    [false, true].forEach(function(disableReplacement) {
      it('should stop the old object and start the replacement (' + identity + ', ' + disableReplacement + ')', function() {
        const calls = [];
        const makePlugin = function(name) {
          return {
            ...(identity === 'anonymous' ? {} : {id: identity === 'same' ? 'resource' : name}),
            start: function() {
              calls.push(name + ':start');
            },
            stop: function() {
              calls.push(name + ':stop');
            },
            beforeUpdate: function() {
              calls.push(name + ':update');
            }
          };
        };
        const oldPlugin = makePlugin('old');
        const replacement = makePlugin('new');
        const config = {
          type: 'line',
          data: {labels: ['a', 'b'], datasets: [{data: [1, 2]}]},
          plugins: [oldPlugin]
        };
        const chart = window.acquireChart(config);
        expect(calls).toEqual(['old:start', 'old:update']);
        calls.length = 0;
        config.plugins = [replacement];
        if (disableReplacement) {
          chart.options.plugins = false;
        }
        chart.update();
        expect(calls).toEqual(disableReplacement ? ['old:stop'] : ['old:stop', 'new:start', 'new:update']);
        calls.length = 0;
        chart.options.plugins = {};
        chart.update();
        expect(calls).toEqual(disableReplacement ? ['new:start', 'new:update'] : ['new:update']);
        calls.length = 0;
        chart.update();
        expect(calls).toEqual(['new:update']);
        calls.length = 0;
        window.releaseChart(chart);
        expect(calls).toEqual(['new:stop']);
      });
    });
  });
});

describe('Plugin object lifecycle registry transitions', function() {
  it('should stop an unregistered object before starting a new object with the same ID', function() {
    const calls = [];
    const oldPlugin = {
      id: 'resource',
      start: function() {
        calls.push('old:start');
      },
      stop: function() {
        calls.push('old:stop');
      }
    };
    const replacement = {
      id: 'resource',
      start: function() {
        calls.push('new:start');
      },
      stop: function() {
        calls.push('new:stop');
      }
    };
    Chart.register(oldPlugin);
    const chart = window.acquireChart({});
    expect(calls).toEqual(['old:start']);
    calls.length = 0;
    Chart.unregister(oldPlugin);
    Chart.register(replacement);
    chart.update();
    expect(calls).toEqual(['old:stop', 'new:start']);
    calls.length = 0;
    Chart.register(replacement);
    chart.update();
    expect(calls).toEqual([]);
    Chart.unregister(replacement);
    chart.update();
    expect(calls).toEqual(['new:stop']);
    window.releaseChart(chart);
  });

  it('should start and stop distinct anonymous local plugins independently', function() {
    const calls = [];
    const first = {
      start: function() {
        calls.push('first:start');
      },
      stop: function() {
        calls.push('first:stop');
      }
    };
    const second = {
      start: function() {
        calls.push('second:start');
      },
      stop: function() {
        calls.push('second:stop');
      }
    };
    const config = {plugins: [first]};
    const chart = window.acquireChart(config);
    calls.length = 0;
    config.plugins.push(second);
    chart.update();
    expect(calls).toEqual(['second:start']);
    calls.length = 0;
    config.plugins.splice(0, 1);
    chart.update();
    expect(calls).toEqual(['first:stop']);
    calls.length = 0;
    window.releaseChart(chart);
    expect(calls).toEqual(['second:stop']);
  });
});

describe('Plugin-owned event listeners', function() {
  [true, false].forEach(function(withId) {
    it('should transfer event handling to the replacement object (' + withId + ')', function() {
      const events = [];
      const listeners = new WeakMap();
      const makePlugin = function(name) {
        return {
          ...(withId ? {id: 'listener'} : {}),
          start: function(chart) {
            const listener = function() {
              events.push(name);
            };
            listeners.set(this, {canvas: chart.canvas, listener});
            chart.canvas.addEventListener('test-resource', listener);
          },
          stop: function() {
            const resource = listeners.get(this);
            if (resource) {
              resource.canvas.removeEventListener('test-resource', resource.listener);
            }
            listeners.delete(this);
          },
          beforeUpdate: function() {
            expect(listeners.has(this)).toBeTrue();
          }
        };
      };
      const oldPlugin = makePlugin('old');
      const replacement = makePlugin('new');
      const config = {plugins: [oldPlugin]};
      const chart = window.acquireChart(config);
      config.plugins = [replacement];
      chart.update();
      chart.canvas.dispatchEvent(new Event('test-resource'));
      expect(events).toEqual(['new']);
      expect(listeners.has(oldPlugin)).toBeFalse();
      const canvas = chart.canvas;
      window.releaseChart(chart);
      canvas.dispatchEvent(new Event('test-resource'));
      expect(events).toEqual(['new']);
      expect(listeners.has(replacement)).toBeFalse();
    });
  });
});
