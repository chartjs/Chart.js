describe('Core.scale', function() {
	describe('auto', jasmine.specsFromFixtures('core.scale'));

	it('should provide default scale label options', function() {
		expect(Chart.defaults.scale.scaleLabel).toEqual({
			// display property
			display: false,

			// actual label
			labelString: '',

			// actual label
			lineHeight: 1.2,

			// top/bottom padding
			padding: {
				top: 4,
				bottom: 4
			}
		});
	});
});
