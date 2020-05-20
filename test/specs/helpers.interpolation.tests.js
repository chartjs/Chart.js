import {_pointInLine, _steppedInterpolation, _bezierInterpolation} from '../../src/helpers/helpers.interpolation';

describe('helpers.interpolation', function() {
	it('Should interpolate a point in line', function() {
		expect(_pointInLine({x: 10, y: 10}, {x: 20, y: 20}, 0)).toEqual({x: 10, y: 10});
		expect(_pointInLine({x: 10, y: 10}, {x: 20, y: 20}, 0.5)).toEqual({x: 15, y: 15});
		expect(_pointInLine({x: 10, y: 10}, {x: 20, y: 20}, 1)).toEqual({x: 20, y: 20});
	});

	it('Should intepolate a point in stepped line', function() {
		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 0, 'before')).toEqual({x: 10, y: 10});
		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 0.4, 'before')).toEqual({x: 14, y: 20});
		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 0.5, 'before')).toEqual({x: 15, y: 20});
		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 1, 'before')).toEqual({x: 20, y: 20});

		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 0, 'middle')).toEqual({x: 10, y: 10});
		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 0.4, 'middle')).toEqual({x: 14, y: 10});
		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 0.5, 'middle')).toEqual({x: 15, y: 20});
		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 1, 'middle')).toEqual({x: 20, y: 20});

		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 0, 'after')).toEqual({x: 10, y: 10});
		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 0.4, 'after')).toEqual({x: 14, y: 10});
		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 0.5, 'after')).toEqual({x: 15, y: 10});
		expect(_steppedInterpolation({x: 10, y: 10}, {x: 20, y: 20}, 1, 'after')).toEqual({x: 20, y: 20});
	});

	it('Should interpolate a point in curve', function() {
		const pt1 = {x: 10, y: 10, controlPointNextX: 12, controlPointNextY: 12};
		const pt2 = {x: 20, y: 30, controlPointPreviousX: 18, controlPointPreviousY: 28};

		expect(_bezierInterpolation(pt1, pt2, 0)).toEqual({x: 10, y: 10});
		expect(_bezierInterpolation(pt1, pt2, 0.2)).toBeCloseToPoint({x: 11.616, y: 12.656});
		expect(_bezierInterpolation(pt1, pt2, 1)).toEqual({x: 20, y: 30});
	});
});
