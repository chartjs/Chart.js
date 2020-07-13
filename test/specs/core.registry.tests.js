describe('Chart.registry', function() {
	it('should handle a classic controller extension', function() {
		function CustomController() {
			Chart.controllers.line.apply(this, arguments);
		}
		CustomController.prototype = Object.create(Chart.controllers.line.prototype);
		CustomController.prototype.constructor = CustomController;
		CustomController.id = 'myline';
		CustomController.defaults = Chart.defaults.line;

		Chart.register(CustomController);

		expect(Chart.registry.getController('myline')).toEqual(CustomController);
		expect(Chart.defaults.myline).toEqual(CustomController.defaults);

		Chart.unregister(CustomController);
	});

	it('should handle a classic scale extension', function() {
		function CustomScale() {
			Chart.Scale.apply(this, arguments);
		}
		CustomScale.prototype = Object.create(Chart.Scale.prototype);
		CustomScale.prototype.constructor = CustomScale;
		CustomScale.id = 'myScale';
		CustomScale.defaults = {
			foo: 'bar'
		};

		Chart.register(CustomScale);

		expect(Chart.registry.getScale('myScale')).toEqual(CustomScale);
		expect(Chart.defaults.scales.myScale).toEqual(CustomScale.defaults);

		Chart.unregister(CustomScale);

		expect(function() {
			Chart.registry.getScale('myScale');
		}).toThrow(new Error('"myScale" is not a registered scale.'));
		expect(Chart.defaults.scales.myScale).not.toBeDefined();
	});

	it('should handle a classic element extension', function() {
		function CustomElement() {
			Chart.Element.apply(this, arguments);
		}
		CustomElement.prototype = Object.create(Chart.Element.prototype);
		CustomElement.prototype.constructor = CustomElement;
		CustomElement.id = 'myElement';
		CustomElement.defaults = {
			foo: 'baz'
		};

		Chart.register(CustomElement);

		expect(Chart.registry.getElement('myElement')).toEqual(CustomElement);
		expect(Chart.defaults.elements.myElement).toEqual(CustomElement.defaults);

		Chart.unregister(CustomElement);

		expect(function() {
			Chart.registry.getElement('myElement');
		}).toThrow(new Error('"myElement" is not a registered element.'));
		expect(Chart.defaults.elements.myElement).not.toBeDefined();
	});

	it('should handle a classig plugin', function() {
		const CustomPlugin = {
			id: 'customPlugin',
			defaults: {
				custom: 'plugin'
			}
		};

		Chart.register(CustomPlugin);

		expect(Chart.registry.getPlugin('customPlugin')).toEqual(CustomPlugin);
		expect(Chart.defaults.plugins.customPlugin).toEqual(CustomPlugin.defaults);

		Chart.unregister(CustomPlugin);

		expect(function() {
			Chart.registry.getPlugin('customPlugin');
		}).toThrow(new Error('"customPlugin" is not a registered plugin.'));
		expect(Chart.defaults.plugins.customPlugin).not.toBeDefined();
	});

	it('should handle an ES6 controller extension', function() {
		class CustomController extends Chart.DatasetController {}
		CustomController.id = 'custom';
		CustomController.defaults = {
			foo: 'bar'
		};
		Chart.register(CustomController);

		expect(Chart.registry.getController('custom')).toEqual(CustomController);
		expect(Chart.defaults.custom).toEqual(CustomController.defaults);

		Chart.unregister(CustomController);

		expect(function() {
			Chart.registry.getController('custom');
		}).toThrow(new Error('"custom" is not a registered controller.'));
		expect(Chart.defaults.custom).not.toBeDefined();
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
		expect(Chart.defaults.custom).not.toBeDefined();
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
});
