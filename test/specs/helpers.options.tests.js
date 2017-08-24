'use strict';

describe('Chart.helpers.options', function() {
	var options = Chart.helpers.options;

	describe('toLineHeight', function() {
		it ('should support keyword values', function() {
			expect(options.toLineHeight('normal', 16)).toBe(16 * 1.2);
		});
		it ('should support unitless values', function() {
			expect(options.toLineHeight(1.4, 16)).toBe(16 * 1.4);
			expect(options.toLineHeight('1.4', 16)).toBe(16 * 1.4);
		});
		it ('should support length values', function() {
			expect(options.toLineHeight('42px', 16)).toBe(42);
			expect(options.toLineHeight('1.4em', 16)).toBe(16 * 1.4);
		});
		it ('should support percentage values', function() {
			expect(options.toLineHeight('140%', 16)).toBe(16 * 1.4);
		});
		it ('should fallback to default (1.2) for invalid values', function() {
			expect(options.toLineHeight(null, 16)).toBe(16 * 1.2);
			expect(options.toLineHeight(undefined, 16)).toBe(16 * 1.2);
			expect(options.toLineHeight('foobar', 16)).toBe(16 * 1.2);
		});
	});

	describe('toPadding', function() {
		it ('should support number values', function() {
			expect(options.toPadding(4)).toEqual(
				{top: 4, right: 4, bottom: 4, left: 4, height: 8, width: 8});
			expect(options.toPadding(4.5)).toEqual(
				{top: 4.5, right: 4.5, bottom: 4.5, left: 4.5, height: 9, width: 9});
		});
		it ('should support string values', function() {
			expect(options.toPadding('4')).toEqual(
				{top: 4, right: 4, bottom: 4, left: 4, height: 8, width: 8});
			expect(options.toPadding('4.5')).toEqual(
				{top: 4.5, right: 4.5, bottom: 4.5, left: 4.5, height: 9, width: 9});
		});
		it ('should support object values', function() {
			expect(options.toPadding({top: 1, right: 2, bottom: 3, left: 4})).toEqual(
				{top: 1, right: 2, bottom: 3, left: 4, height: 4, width: 6});
			expect(options.toPadding({top: 1.5, right: 2.5, bottom: 3.5, left: 4.5})).toEqual(
				{top: 1.5, right: 2.5, bottom: 3.5, left: 4.5, height: 5, width: 7});
			expect(options.toPadding({top: '1', right: '2', bottom: '3', left: '4'})).toEqual(
				{top: 1, right: 2, bottom: 3, left: 4, height: 4, width: 6});
		});
		it ('should fallback to 0 for invalid values', function() {
			expect(options.toPadding({top: 'foo', right: 'foo', bottom: 'foo', left: 'foo'})).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
			expect(options.toPadding({top: null, right: null, bottom: null, left: null})).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
			expect(options.toPadding({})).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
			expect(options.toPadding('foo')).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
			expect(options.toPadding(null)).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
			expect(options.toPadding(undefined)).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
		});
	});

	describe('resolve', function() {
		it ('should fallback to the first defined input', function() {
			expect(options.resolve([42])).toBe(42);
			expect(options.resolve([42, 'foo'])).toBe(42);
			expect(options.resolve([undefined, 42, 'foo'])).toBe(42);
			expect(options.resolve([42, 'foo', undefined])).toBe(42);
			expect(options.resolve([undefined])).toBe(undefined);
		});
		it ('should correctly handle empty values (null, 0, "")', function() {
			expect(options.resolve([0, 'foo'])).toBe(0);
			expect(options.resolve(['', 'foo'])).toBe('');
			expect(options.resolve([null, 'foo'])).toBe(null);
		});
		it ('should support indexable options if index is provided', function() {
			var input = [42, 'foo', 'bar'];
			expect(options.resolve([input], undefined, 0)).toBe(42);
			expect(options.resolve([input], undefined, 1)).toBe('foo');
			expect(options.resolve([input], undefined, 2)).toBe('bar');
		});
		it ('should fallback if an indexable option value is undefined', function() {
			var input = [42, undefined, 'bar'];
			expect(options.resolve([input], undefined, 5)).toBe(undefined);
			expect(options.resolve([input, 'foo'], undefined, 1)).toBe('foo');
			expect(options.resolve([input, 'foo'], undefined, 5)).toBe('foo');
		});
		it ('should not handle indexable options if index is undefined', function() {
			var array = [42, 'foo', 'bar'];
			expect(options.resolve([array])).toBe(array);
			expect(options.resolve([array], undefined, undefined)).toBe(array);
		});
		it ('should support scriptable options if context is provided', function() {
			var input = function(context) {
				return context.v * 2;
			};
			expect(options.resolve([42], {v: 42})).toBe(42);
			expect(options.resolve([input], {v: 42})).toBe(84);
		});
		it ('should fallback if a scriptable option returns undefined', function() {
			var input = function() {};
			expect(options.resolve([input], {v: 42})).toBe(undefined);
			expect(options.resolve([input, 'foo'], {v: 42})).toBe('foo');
			expect(options.resolve([input, undefined, 'foo'], {v: 42})).toBe('foo');
		});
		it ('should not handle scriptable options if context is undefined', function() {
			var input = function(context) {
				return context.v * 2;
			};
			expect(options.resolve([input])).toBe(input);
			expect(options.resolve([input], undefined)).toBe(input);
		});
		it ('should handle scriptable and indexable option', function() {
			var input = function(context) {
				return [context.v, undefined, 'bar'];
			};
			expect(options.resolve([input, 'foo'], {v: 42}, 0)).toBe(42);
			expect(options.resolve([input, 'foo'], {v: 42}, 1)).toBe('foo');
			expect(options.resolve([input, 'foo'], {v: 42}, 5)).toBe('foo');
			expect(options.resolve([input, ['foo', 'bar']], {v: 42}, 1)).toBe('bar');
		});
	});
});
