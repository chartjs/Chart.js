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
  });
});
