// Tests of the scale service
describe('Test the scale service', function() {

	it('should update scale defaults', function() {
		var type = 'my_test_type';
		var Constructor = function() {
			this.initialized = true;
		};
		Constructor.id = type;
		Constructor.defaults = {
			testProp: true
		};
		Chart.scaleService.registerScale(Constructor);

		// Should equal defaults but not be an identical object
		expect(Chart.scaleService.getScaleDefaults(type)).toEqual(jasmine.objectContaining({
			testProp: true
		}));

		Chart.scaleService.updateScaleDefaults(type, {
			testProp: 'red',
			newProp: 42
		});

		expect(Chart.scaleService.getScaleDefaults(type)).toEqual(jasmine.objectContaining({
			testProp: 'red',
			newProp: 42
		}));
	});
});
