describe('Curve helper tests', function() {
	let helpers;

	beforeAll(function() {
		helpers = window.Chart.helpers.curve;
	});

	it('should spline curves', function() {
		expect(helpers.splineCurve({
			x: 0,
			y: 0
		}, {
			x: 1,
			y: 1
		}, {
			x: 2,
			y: 0
		}, 0)).toEqual({
			previous: {
				x: 1,
				y: 1,
			},
			next: {
				x: 1,
				y: 1,
			}
		});

		expect(helpers.splineCurve({
			x: 0,
			y: 0
		}, {
			x: 1,
			y: 1
		}, {
			x: 2,
			y: 0
		}, 1)).toEqual({
			previous: {
				x: 0,
				y: 1,
			},
			next: {
				x: 2,
				y: 1,
			}
		});
	});

	it('should spline curves with monotone cubic interpolation', function() {
		var dataPoints = [
			{_model: {x: 0, y: 0, skip: false}},
			{_model: {x: 3, y: 6, skip: false}},
			{_model: {x: 9, y: 6, skip: false}},
			{_model: {x: 12, y: 60, skip: false}},
			{_model: {x: 15, y: 60, skip: false}},
			{_model: {x: 18, y: 120, skip: false}},
			{_model: {x: null, y: null, skip: true}},
			{_model: {x: 21, y: 180, skip: false}},
			{_model: {x: 24, y: 120, skip: false}},
			{_model: {x: 27, y: 125, skip: false}},
			{_model: {x: 30, y: 105, skip: false}},
			{_model: {x: 33, y: 110, skip: false}},
			{_model: {x: 33, y: 110, skip: false}},
			{_model: {x: 36, y: 170, skip: false}}
		];
		helpers.splineCurveMonotone(dataPoints);
		expect(dataPoints).toEqual([{
			_model: {
				x: 0,
				y: 0,
				skip: false,
				controlPointNextX: 1,
				controlPointNextY: 2
			}
		},
		{
			_model: {
				x: 3,
				y: 6,
				skip: false,
				controlPointPreviousX: 2,
				controlPointPreviousY: 6,
				controlPointNextX: 5,
				controlPointNextY: 6
			}
		},
		{
			_model: {
				x: 9,
				y: 6,
				skip: false,
				controlPointPreviousX: 7,
				controlPointPreviousY: 6,
				controlPointNextX: 10,
				controlPointNextY: 6
			}
		},
		{
			_model: {
				x: 12,
				y: 60,
				skip: false,
				controlPointPreviousX: 11,
				controlPointPreviousY: 60,
				controlPointNextX: 13,
				controlPointNextY: 60
			}
		},
		{
			_model: {
				x: 15,
				y: 60,
				skip: false,
				controlPointPreviousX: 14,
				controlPointPreviousY: 60,
				controlPointNextX: 16,
				controlPointNextY: 60
			}
		},
		{
			_model: {
				x: 18,
				y: 120,
				skip: false,
				controlPointPreviousX: 17,
				controlPointPreviousY: 100
			}
		},
		{
			_model: {
				x: null,
				y: null,
				skip: true
			}
		},
		{
			_model: {
				x: 21,
				y: 180,
				skip: false,
				controlPointNextX: 22,
				controlPointNextY: 160
			}
		},
		{
			_model: {
				x: 24,
				y: 120,
				skip: false,
				controlPointPreviousX: 23,
				controlPointPreviousY: 120,
				controlPointNextX: 25,
				controlPointNextY: 120
			}
		},
		{
			_model: {
				x: 27,
				y: 125,
				skip: false,
				controlPointPreviousX: 26,
				controlPointPreviousY: 125,
				controlPointNextX: 28,
				controlPointNextY: 125
			}
		},
		{
			_model: {
				x: 30,
				y: 105,
				skip: false,
				controlPointPreviousX: 29,
				controlPointPreviousY: 105,
				controlPointNextX: 31,
				controlPointNextY: 105
			}
		},
		{
			_model: {
				x: 33,
				y: 110,
				skip: false,
				controlPointPreviousX: 32,
				controlPointPreviousY: 110,
				controlPointNextX: 33,
				controlPointNextY: 110
			}
		},
		{
			_model: {
				x: 33,
				y: 110,
				skip: false,
				controlPointPreviousX: 33,
				controlPointPreviousY: 110,
				controlPointNextX: 34,
				controlPointNextY: 110
			}
		},
		{
			_model: {
				x: 36,
				y: 170,
				skip: false,
				controlPointPreviousX: 35,
				controlPointPreviousY: 150
			}
		}]);
	});
});
