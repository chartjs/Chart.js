describe('Curve helper tests', function() {
	let helpers;

	beforeAll(function() {
		helpers = window.Chart.helpers;
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
			{x: 0, y: 0, skip: false},
			{x: 3, y: 6, skip: false},
			{x: 9, y: 6, skip: false},
			{x: 12, y: 60, skip: false},
			{x: 15, y: 60, skip: false},
			{x: 18, y: 120, skip: false},
			{x: null, y: null, skip: true},
			{x: 21, y: 180, skip: false},
			{x: 24, y: 120, skip: false},
			{x: 27, y: 125, skip: false},
			{x: 30, y: 105, skip: false},
			{x: 33, y: 110, skip: false},
			{x: 33, y: 110, skip: false},
			{x: 36, y: 170, skip: false}
		];
		helpers.splineCurveMonotone(dataPoints);
		expect(dataPoints).toEqual([{
			x: 0,
			y: 0,
			skip: false,
			controlPointNextX: 1,
			controlPointNextY: 2
		},
		{
			x: 3,
			y: 6,
			skip: false,
			controlPointPreviousX: 2,
			controlPointPreviousY: 6,
			controlPointNextX: 5,
			controlPointNextY: 6
		},
		{
			x: 9,
			y: 6,
			skip: false,
			controlPointPreviousX: 7,
			controlPointPreviousY: 6,
			controlPointNextX: 10,
			controlPointNextY: 6
		},
		{
			x: 12,
			y: 60,
			skip: false,
			controlPointPreviousX: 11,
			controlPointPreviousY: 60,
			controlPointNextX: 13,
			controlPointNextY: 60
		},
		{
			x: 15,
			y: 60,
			skip: false,
			controlPointPreviousX: 14,
			controlPointPreviousY: 60,
			controlPointNextX: 16,
			controlPointNextY: 60
		},
		{
			x: 18,
			y: 120,
			skip: false,
			controlPointPreviousX: 17,
			controlPointPreviousY: 100
		},
		{
			x: null,
			y: null,
			skip: true
		},
		{
			x: 21,
			y: 180,
			skip: false,
			controlPointNextX: 22,
			controlPointNextY: 160
		},
		{
			x: 24,
			y: 120,
			skip: false,
			controlPointPreviousX: 23,
			controlPointPreviousY: 120,
			controlPointNextX: 25,
			controlPointNextY: 120
		},
		{
			x: 27,
			y: 125,
			skip: false,
			controlPointPreviousX: 26,
			controlPointPreviousY: 125,
			controlPointNextX: 28,
			controlPointNextY: 125
		},
		{
			x: 30,
			y: 105,
			skip: false,
			controlPointPreviousX: 29,
			controlPointPreviousY: 105,
			controlPointNextX: 31,
			controlPointNextY: 105
		},
		{
			x: 33,
			y: 110,
			skip: false,
			controlPointPreviousX: 32,
			controlPointPreviousY: 110,
			controlPointNextX: 33,
			controlPointNextY: 110
		},
		{
			x: 33,
			y: 110,
			skip: false,
			controlPointPreviousX: 33,
			controlPointPreviousY: 110,
			controlPointNextX: 34,
			controlPointNextY: 110
		},
		{
			x: 36,
			y: 170,
			skip: false,
			controlPointPreviousX: 35,
			controlPointPreviousY: 150
		}]);
	});
});
