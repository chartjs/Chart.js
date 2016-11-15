// Test the core element functionality
describe('Core element tests', function() {
	it ('should transition model properties', function() {
		var element = new Chart.Element({
			_model: {
				numberProp: 0,
				numberProp2: 100,
				_underscoreProp: 0,
				stringProp: 'abc',
				objectProp: {
					myObject: true
				},
				colorProp: 'rgb(0, 0, 0)'
			}
		});

		// First transition clones model into view
		element.transition(0.25);
		expect(element._view).toEqual(element._model);
		expect(element._start).toEqual(element._model); // also cloned

		expect(element._view.objectProp).toBe(element._model.objectProp); // not cloned
		expect(element._start.objectProp).toEqual(element._model.objectProp); // not cloned

		element._model.numberProp = 100;
		element._model.numberProp2 = 250;
		element._model._underscoreProp = 200;
		element._model.stringProp = 'def';
		element._model.newStringProp = 'newString';
		element._model.colorProp = 'rgb(255, 255, 0)';

		element.transition(0.25);
		expect(element._view).toEqual({
			numberProp: 25,
			numberProp2: 137.5,
			_underscoreProp: 0, // underscore props are not transition to a new value
			stringProp: 'def',
			newStringProp: 'newString',
			objectProp: {
				myObject: true
			},
			colorProp: 'rgb(64, 64, 0)',
		});
	});

	it ('should adjust the index of the element passed in', function() {
		var chartConfig = {
			options: {
				scales: {
					xAxes: [{
						ticks: {
							min: 'Point 2'
						}
					}]
				}
			},
			data: {
				labels: ['Point 1', 'Point 2', 'Point 3']
			}
		};

		var element = new Chart.Element({
			_index: 1
		});

		element.adjustIndex(chartConfig);

		expect(element._adjustedIndex).toEqual(true);
		expect(element._index).toEqual(0);
	});

	describe ('skipIndexAdjustment method', function() {
		var element;

		beforeEach(function() {
			element = new Chart.Element({});
		});

		it ('should return true when min is undefined', function() {
			var chartConfig = {
				options: {
					scales: {
						xAxes: [{
							ticks: {
								min: undefined
							}
						}]
					}
				}
			};
			expect(element.skipIndexAdjustment(chartConfig)).toEqual(true);
		});

		it ('should return true when index is already adjusted (_adjustedIndex = true)', function() {
			var chartConfig = {
				options: {
					scales: {
						xAxes: [{
							ticks: {
								min: 'Point 1'
							}
						}]
					}
				}
			};
			element._adjustedIndex = true;
			expect(element.skipIndexAdjustment(chartConfig)).toEqual(true);
		});

		it ('should return true when more than one xAxes is defined', function() {
			var chartConfig = {
				options: {
					scales: {
						xAxes: [{
							ticks: {
								min: 'Point 1'
							}
						}, {
							ticks: {
								min: 'Point 2'
							}
						}]
					}
				}
			};
			expect(element.skipIndexAdjustment(chartConfig)).toEqual(true);
		});
	});
});
