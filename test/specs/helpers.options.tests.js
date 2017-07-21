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
});
