'use strict';

describe('Chart.helpers.options', function() {
	var options = Chart.helpers.options;

	describe('toLineHeight', function() {
		var toLineHeight = options.toLineHeight;

		it ('should support keyword values', function() {
			expect(toLineHeight('normal', 16)).toBe(16 * 1.2);
		});
		it ('should support unitless values', function() {
			expect(toLineHeight(1.4, 16)).toBe(16 * 1.4);
			expect(toLineHeight('1.4', 16)).toBe(16 * 1.4);
		});
		it ('should support length values', function() {
			expect(toLineHeight('42px', 16)).toBe(42);
			expect(toLineHeight('1.4em', 16)).toBe(16 * 1.4);
		});
		it ('should support percentage values', function() {
			expect(toLineHeight('140%', 16)).toBe(16 * 1.4);
		});
		it ('should fallback to default (1.2) for invalid values', function() {
			expect(toLineHeight(null, 16)).toBe(16 * 1.2);
			expect(toLineHeight(undefined, 16)).toBe(16 * 1.2);
			expect(toLineHeight('foobar', 16)).toBe(16 * 1.2);
		});
	});

	describe('toPadding', function() {
		var toPadding = options.toPadding;

		it ('should support number values', function() {
			expect(toPadding(4)).toEqual(
				{top: 4, right: 4, bottom: 4, left: 4, height: 8, width: 8});
			expect(toPadding(4.5)).toEqual(
				{top: 4.5, right: 4.5, bottom: 4.5, left: 4.5, height: 9, width: 9});
		});
		it ('should support string values', function() {
			expect(toPadding('4')).toEqual(
				{top: 4, right: 4, bottom: 4, left: 4, height: 8, width: 8});
			expect(toPadding('4.5')).toEqual(
				{top: 4.5, right: 4.5, bottom: 4.5, left: 4.5, height: 9, width: 9});
		});
		it ('should support object values', function() {
			expect(toPadding({top: 1, right: 2, bottom: 3, left: 4})).toEqual(
				{top: 1, right: 2, bottom: 3, left: 4, height: 4, width: 6});
			expect(toPadding({top: 1.5, right: 2.5, bottom: 3.5, left: 4.5})).toEqual(
				{top: 1.5, right: 2.5, bottom: 3.5, left: 4.5, height: 5, width: 7});
			expect(toPadding({top: '1', right: '2', bottom: '3', left: '4'})).toEqual(
				{top: 1, right: 2, bottom: 3, left: 4, height: 4, width: 6});
		});
		it ('should fallback to 0 for invalid values', function() {
			expect(toPadding({top: 'foo', right: 'foo', bottom: 'foo', left: 'foo'})).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
			expect(toPadding({top: null, right: null, bottom: null, left: null})).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
			expect(toPadding({})).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
			expect(toPadding('foo')).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
			expect(toPadding(null)).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
			expect(toPadding(undefined)).toEqual(
				{top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0});
		});
	});

	describe('_parseFont', function() {
		var parseFont = options._parseFont;

		it ('should return a font with default values', function() {
			var global = Chart.defaults.global;

			Chart.defaults.global = {
				defaultFontFamily: 'foobar',
				defaultFontSize: 42,
				defaultFontStyle: 'xxxyyy',
				defaultLineHeight: 1.5
			};

			expect(parseFont({})).toEqual({
				family: 'foobar',
				lineHeight: 63,
				size: 42,
				string: 'xxxyyy 42px foobar',
				style: 'xxxyyy',
				weight: null
			});

			Chart.defaults.global = global;
		});
		it ('should return a font with given values', function() {
			expect(parseFont({
				fontFamily: 'bla',
				lineHeight: 8,
				fontSize: 21,
				fontStyle: 'zzz'
			})).toEqual({
				family: 'bla',
				lineHeight: 8 * 21,
				size: 21,
				string: 'zzz 21px bla',
				style: 'zzz',
				weight: null
			});
		});
		it('should return null as a font string if fontSize or fontFamily are missing', function() {
			var global = Chart.defaults.global;

			Chart.defaults.global = {};

			expect(parseFont({
				fontStyle: 'italic',
				fontSize: 12
			}).string).toBeNull();
			expect(parseFont({
				fontStyle: 'italic',
				fontFamily: 'serif'
			}).string).toBeNull();

			Chart.defaults.global = global;
		});
		it('fontStyle should be optional for font strings', function() {
			var global = Chart.defaults.global;

			Chart.defaults.global = {};

			expect(parseFont({
				fontSize: 12,
				fontFamily: 'serif'
			}).string).toBe('12px serif');

			Chart.defaults.global = global;
		});
	});

	describe('resolve', function() {
		var resolve = options.resolve;

		it ('should fallback to the first defined input', function() {
			expect(resolve([42])).toBe(42);
			expect(resolve([42, 'foo'])).toBe(42);
			expect(resolve([undefined, 42, 'foo'])).toBe(42);
			expect(resolve([42, 'foo', undefined])).toBe(42);
			expect(resolve([undefined])).toBe(undefined);
		});
		it ('should correctly handle empty values (null, 0, "")', function() {
			expect(resolve([0, 'foo'])).toBe(0);
			expect(resolve(['', 'foo'])).toBe('');
			expect(resolve([null, 'foo'])).toBe(null);
		});
		it ('should support indexable options if index is provided', function() {
			var input = [42, 'foo', 'bar'];
			expect(resolve([input], undefined, 0)).toBe(42);
			expect(resolve([input], undefined, 1)).toBe('foo');
			expect(resolve([input], undefined, 2)).toBe('bar');
		});
		it ('should fallback if an indexable option value is undefined', function() {
			var input = [42, undefined, 'bar'];
			expect(resolve([input], undefined, 5)).toBe(undefined);
			expect(resolve([input, 'foo'], undefined, 1)).toBe('foo');
			expect(resolve([input, 'foo'], undefined, 5)).toBe('foo');
		});
		it ('should not handle indexable options if index is undefined', function() {
			var array = [42, 'foo', 'bar'];
			expect(resolve([array])).toBe(array);
			expect(resolve([array], undefined, undefined)).toBe(array);
		});
		it ('should support scriptable options if context is provided', function() {
			var input = function(context) {
				return context.v * 2;
			};
			expect(resolve([42], {v: 42})).toBe(42);
			expect(resolve([input], {v: 42})).toBe(84);
		});
		it ('should fallback if a scriptable option returns undefined', function() {
			var input = function() {};
			expect(resolve([input], {v: 42})).toBe(undefined);
			expect(resolve([input, 'foo'], {v: 42})).toBe('foo');
			expect(resolve([input, undefined, 'foo'], {v: 42})).toBe('foo');
		});
		it ('should not handle scriptable options if context is undefined', function() {
			var input = function(context) {
				return context.v * 2;
			};
			expect(resolve([input])).toBe(input);
			expect(resolve([input], undefined)).toBe(input);
		});
		it ('should handle scriptable and indexable option', function() {
			var input = function(context) {
				return [context.v, undefined, 'bar'];
			};
			expect(resolve([input, 'foo'], {v: 42}, 0)).toBe(42);
			expect(resolve([input, 'foo'], {v: 42}, 1)).toBe('foo');
			expect(resolve([input, 'foo'], {v: 42}, 5)).toBe('foo');
			expect(resolve([input, ['foo', 'bar']], {v: 42}, 1)).toBe('bar');
		});
	});
});
