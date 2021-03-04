describe('Chart.registry', function() {
  it('should handle an ES6 controller extension', function() {
    class CustomController extends Chart.DatasetController {}
    CustomController.id = 'custom';
    CustomController.defaults = {
      foo: 'bar'
    };
    CustomController.overrides = {
      bar: 'foo'
    };
    Chart.register(CustomController);

    expect(Chart.registry.getController('custom')).toEqual(CustomController);
    expect(Chart.defaults.datasets.custom).toEqual(CustomController.defaults);
    expect(Chart.overrides.custom).toEqual(CustomController.overrides);

    Chart.unregister(CustomController);

    expect(function() {
      Chart.registry.getController('custom');
    }).toThrow(new Error('"custom" is not a registered controller.'));
    expect(Chart.overrides.custom).not.toBeDefined();
    expect(Chart.defaults.datasets.custom).not.toBeDefined();
  });

  it('should handle an ES6 scale extension', function() {
    class CustomScale extends Chart.Scale {}
    CustomScale.id = 'es6Scale';
    CustomScale.defaults = {
      foo: 'bar'
    };
    Chart.register(CustomScale);

    expect(Chart.registry.getScale('es6Scale')).toEqual(CustomScale);
    expect(Chart.defaults.scales.es6Scale).toEqual(CustomScale.defaults);

    Chart.unregister(CustomScale);

    expect(function() {
      Chart.registry.getScale('es6Scale');
    }).toThrow(new Error('"es6Scale" is not a registered scale.'));
    expect(Chart.defaults.scales.es6Scale).not.toBeDefined();
  });

  it('should handle an ES6 element extension', function() {
    class CustomElement extends Chart.Element {}
    CustomElement.id = 'es6element';
    CustomElement.defaults = {
      foo: 'bar'
    };
    Chart.register(CustomElement);

    expect(Chart.registry.getElement('es6element')).toEqual(CustomElement);
    expect(Chart.defaults.elements.es6element).toEqual(CustomElement.defaults);

    Chart.unregister(CustomElement);

    expect(function() {
      Chart.registry.getElement('es6element');
    }).toThrow(new Error('"es6element" is not a registered element.'));
    expect(Chart.defaults.elements.es6element).not.toBeDefined();
  });

  it('should handle an ES6 plugin', function() {
    class CustomPlugin {}
    CustomPlugin.id = 'es6plugin';
    CustomPlugin.defaults = {
      foo: 'bar'
    };
    Chart.register(CustomPlugin);

    expect(Chart.registry.getPlugin('es6plugin')).toEqual(CustomPlugin);
    expect(Chart.defaults.plugins.es6plugin).toEqual(CustomPlugin.defaults);

    Chart.unregister(CustomPlugin);

    expect(function() {
      Chart.registry.getPlugin('es6plugin');
    }).toThrow(new Error('"es6plugin" is not a registered plugin.'));
    expect(Chart.defaults.plugins.es6plugin).not.toBeDefined();
  });

  it('should not accept an object without id', function() {
    expect(function() {
      Chart.register({foo: 'bar'});
    }).toThrow(new Error('class does not have id: bar'));

    class FaultyPlugin {}

    expect(function() {
      Chart.register(FaultyPlugin);
    }).toThrow(new Error('class does not have id: class FaultyPlugin {}'));
  });

  it('should not fail when unregistering an object that is not registered', function() {
    expect(function() {
      Chart.unregister({id: 'foo'});
    }).not.toThrow();
  });

  describe('Should allow registering explicitly', function() {
    class customExtension {}
    customExtension.id = 'custom';
    customExtension.defaults = {
      prop: true
    };

    it('as controller', function() {
      Chart.registry.addControllers(customExtension);

      expect(Chart.registry.getController('custom')).toEqual(customExtension);
      expect(Chart.defaults.datasets.custom).toEqual(customExtension.defaults);

      Chart.registry.removeControllers(customExtension);

      expect(function() {
        Chart.registry.getController('custom');
      }).toThrow(new Error('"custom" is not a registered controller.'));
      expect(Chart.defaults.datasets.custom).not.toBeDefined();
    });

    it('as scale', function() {
      Chart.registry.addScales(customExtension);

      expect(Chart.registry.getScale('custom')).toEqual(customExtension);
      expect(Chart.defaults.scales.custom).toEqual(customExtension.defaults);

      Chart.registry.removeScales(customExtension);

      expect(function() {
        Chart.registry.getScale('custom');
      }).toThrow(new Error('"custom" is not a registered scale.'));
      expect(Chart.defaults.scales.custom).not.toBeDefined();
    });

    it('as element', function() {
      Chart.registry.addElements(customExtension);

      expect(Chart.registry.getElement('custom')).toEqual(customExtension);
      expect(Chart.defaults.elements.custom).toEqual(customExtension.defaults);

      Chart.registry.removeElements(customExtension);

      expect(function() {
        Chart.registry.getElement('custom');
      }).toThrow(new Error('"custom" is not a registered element.'));
      expect(Chart.defaults.elements.custom).not.toBeDefined();
    });

    it('as plugin', function() {
      Chart.registry.addPlugins(customExtension);

      expect(Chart.registry.getPlugin('custom')).toEqual(customExtension);
      expect(Chart.defaults.plugins.custom).toEqual(customExtension.defaults);

      Chart.registry.removePlugins(customExtension);

      expect(function() {
        Chart.registry.getPlugin('custom');
      }).toThrow(new Error('"custom" is not a registered plugin.'));
      expect(Chart.defaults.plugins.custom).not.toBeDefined();
    });
  });

  it('should fire before/after callbacks', function() {
    let beforeRegisterCount = 0;
    let afterRegisterCount = 0;
    let beforeUnregisterCount = 0;
    let afterUnregisterCount = 0;
    class custom {}
    custom.id = 'custom';
    custom.beforeRegister = () => beforeRegisterCount++;
    custom.afterRegister = () => afterRegisterCount++;
    custom.beforeUnregister = () => beforeUnregisterCount++;
    custom.afterUnregister = () => afterUnregisterCount++;

    Chart.registry.addControllers(custom);
    expect(beforeRegisterCount).withContext('beforeRegister').toBe(1);
    expect(afterRegisterCount).withContext('afterRegister').toBe(1);
    Chart.registry.removeControllers(custom);
    expect(beforeUnregisterCount).withContext('beforeUnregister').toBe(1);
    expect(afterUnregisterCount).withContext('afterUnregister').toBe(1);

    Chart.registry.addScales(custom);
    expect(beforeRegisterCount).withContext('beforeRegister').toBe(2);
    expect(afterRegisterCount).withContext('afterRegister').toBe(2);
    Chart.registry.removeScales(custom);
    expect(beforeUnregisterCount).withContext('beforeUnregister').toBe(2);
    expect(afterUnregisterCount).withContext('afterUnregister').toBe(2);

    Chart.registry.addElements(custom);
    expect(beforeRegisterCount).withContext('beforeRegister').toBe(3);
    expect(afterRegisterCount).withContext('afterRegister').toBe(3);
    Chart.registry.removeElements(custom);
    expect(beforeUnregisterCount).withContext('beforeUnregister').toBe(3);
    expect(afterUnregisterCount).withContext('afterUnregister').toBe(3);

    Chart.register(custom);
    expect(beforeRegisterCount).withContext('beforeRegister').toBe(4);
    expect(afterRegisterCount).withContext('afterRegister').toBe(4);
    Chart.unregister(custom);
    expect(beforeUnregisterCount).withContext('beforeUnregister').toBe(4);
    expect(afterUnregisterCount).withContext('afterUnregister').toBe(4);
  });

  it('should preserve existing defaults', function() {
    Chart.defaults.datasets.test = {test1: true, test3: false};
    Chart.overrides.test = {testA: true, testC: false};

    class testController extends Chart.DatasetController {}
    testController.id = 'test';
    testController.defaults = {test1: false, test2: true};
    testController.overrides = {testA: false, testB: true};

    Chart.register(testController);
    expect(Chart.defaults.datasets.test).toEqual({test1: false, test2: true, test3: false});
    expect(Chart.overrides.test).toEqual({testA: false, testB: true, testC: false});

    Chart.unregister(testController);
    expect(Chart.defaults.datasets.test).not.toBeDefined();
    expect(Chart.overrides.test).not.toBeDefined();
  });

  describe('should handle multiple items', function() {
    class test1 extends Chart.DatasetController {}
    test1.id = 'test1';
    class test2 extends Chart.Scale {}
    test2.id = 'test2';

    it('separately', function() {
      Chart.register(test1, test2);
      expect(Chart.registry.getController('test1')).toEqual(test1);
      expect(Chart.registry.getScale('test2')).toEqual(test2);
      Chart.unregister(test1, test2);
      expect(function() {
        Chart.registry.getController('test1');
      }).toThrow();
      expect(function() {
        Chart.registry.getScale('test2');
      }).toThrow();
    });

    it('as array', function() {
      Chart.register([test1, test2]);
      expect(Chart.registry.getController('test1')).toEqual(test1);
      expect(Chart.registry.getScale('test2')).toEqual(test2);
      Chart.unregister([test1, test2]);
      expect(function() {
        Chart.registry.getController('test1');
      }).toThrow();
      expect(function() {
        Chart.registry.getScale('test2');
      }).toThrow();
    });

    it('as object', function() {
      Chart.register({test1, test2});
      expect(Chart.registry.getController('test1')).toEqual(test1);
      expect(Chart.registry.getScale('test2')).toEqual(test2);
      Chart.unregister({test1, test2});
      expect(function() {
        Chart.registry.getController('test1');
      }).toThrow();
      expect(function() {
        Chart.registry.getScale('test2');
      }).toThrow();
    });
  });
});
