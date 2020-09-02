describe('Chart.animations', function() {
	it('should override property collection with property', function() {
		const chart = {};
		const anims = new Chart.Animations(chart, {
			collection1: {
				properties: ['property1', 'property2'],
				duration: 1000
			},
			property2: {
				duration: 2000
			}
		});
		expect(anims._properties.get('property1')).toEqual(jasmine.objectContaining({duration: 1000}));
		expect(anims._properties.get('property2')).toEqual({duration: 2000});
	});

	it('should ignore duplicate definitions from collections', function() {
		const chart = {};
		const anims = new Chart.Animations(chart, {
			collection1: {
				properties: ['property1'],
				duration: 1000
			},
			collection2: {
				properties: ['property1', 'property2'],
				duration: 2000
			}
		});
		expect(anims._properties.get('property1')).toEqual(jasmine.objectContaining({duration: 1000}));
		expect(anims._properties.get('property2')).toEqual(jasmine.objectContaining({duration: 2000}));
	});

	it('should not animate undefined options key', function() {
		const chart = {};
		const anims = new Chart.Animations(chart, {value: {duration: 100}, option: {duration: 200}});
		const target = {
			value: 1,
			options: {
				option: 2
			}
		};
		expect(anims.update(target, {
			options: undefined
		})).toBeUndefined();
	});

	it('should assign shared options to target after animations complete', function(done) {
		const chart = {
			draw: function() {},
			options: {
				animation: {
					debug: false
				}
			}
		};
		const anims = new Chart.Animations(chart, {value: {duration: 100}, option: {duration: 200}});

		const target = {
			value: 1,
			options: {
				option: 2
			}
		};
		const sharedOpts = {option: 10, $shared: true};

		expect(anims.update(target, {
			options: sharedOpts
		})).toBeTrue();

		expect(target.options !== sharedOpts).toBeTrue();

		Chart.animator.start(chart);

		setTimeout(function() {
			expect(Chart.animator.running(chart)).toBeFalse();
			expect(target.options === sharedOpts).toBeTrue();

			Chart.animator.remove(chart);
			done();
		}, 300);
	});
});
