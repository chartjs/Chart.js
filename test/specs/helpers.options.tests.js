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
});
