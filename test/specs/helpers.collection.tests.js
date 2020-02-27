import {_lookup, _lookupByKey, _rlookupByKey} from '../../src/helpers/helpers.collection';

describe('helpers.interpolation', function() {
	it('Should do binary search', function() {
		const data = [0, 2, 6, 9];
		expect(_lookup(data, 0)).toEqual({lo: 0, hi: 1});
		expect(_lookup(data, 1)).toEqual({lo: 0, hi: 1});
		expect(_lookup(data, 3)).toEqual({lo: 1, hi: 2});
		expect(_lookup(data, 6)).toEqual({lo: 1, hi: 2});
		expect(_lookup(data, 9)).toEqual({lo: 2, hi: 3});
	});

	it('Should do binary search by key', function() {
		const data = [{x: 0}, {x: 2}, {x: 6}, {x: 9}];
		expect(_lookupByKey(data, 'x', 0)).toEqual({lo: 0, hi: 1});
		expect(_lookupByKey(data, 'x', 1)).toEqual({lo: 0, hi: 1});
		expect(_lookupByKey(data, 'x', 3)).toEqual({lo: 1, hi: 2});
		expect(_lookupByKey(data, 'x', 6)).toEqual({lo: 1, hi: 2});
		expect(_lookupByKey(data, 'x', 9)).toEqual({lo: 2, hi: 3});
	});

	it('Should do reverse binary search by key', function() {
		const data = [{x: 10}, {x: 7}, {x: 3}, {x: 0}];
		expect(_rlookupByKey(data, 'x', 0)).toEqual({lo: 2, hi: 3});
		expect(_rlookupByKey(data, 'x', 3)).toEqual({lo: 2, hi: 3});
		expect(_rlookupByKey(data, 'x', 5)).toEqual({lo: 1, hi: 2});
		expect(_rlookupByKey(data, 'x', 8)).toEqual({lo: 0, hi: 1});
		expect(_rlookupByKey(data, 'x', 10)).toEqual({lo: 0, hi: 1});
	});
});
