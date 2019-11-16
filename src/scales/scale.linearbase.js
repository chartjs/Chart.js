'use strict';

const helpers = require('../helpers/index');
const Scale = require('../core/core.scale');

const isNullOrUndef = helpers.isNullOrUndef;

/**
 * Generate a set of linear ticks
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {number[]} array of tick values
 */
function generateTicks(generationOptions, dataRange) {
	var ticks = [];
	// To get a "nice" value for the tick spacing, we will use the appropriately named
	// "nice number" algorithm. See https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
	// for details.

	var MIN_SPACING = 1e-14;
	var stepSize = generationOptions.stepSize;
	var unit = stepSize || 1;
	var maxNumSpaces = generationOptions.maxTicks - 1;
	var min = generationOptions.min;
	var max = generationOptions.max;
	var precision = generationOptions.precision;
	var rmin = dataRange.min;
	var rmax = dataRange.max;
	var spacing = helpers.niceNum((rmax - rmin) / maxNumSpaces / unit) * unit;
	var factor, niceMin, niceMax, numSpaces;

	// Beyond MIN_SPACING floating point numbers being to lose precision
	// such that we can't do the math necessary to generate ticks
	if (spacing < MIN_SPACING && isNullOrUndef(min) && isNullOrUndef(max)) {
		return [{value: rmin}, {value: rmax}];
	}

	numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
	if (numSpaces > maxNumSpaces) {
		// If the calculated num of spaces exceeds maxNumSpaces, recalculate it
		spacing = helpers.niceNum(numSpaces * spacing / maxNumSpaces / unit) * unit;
	}

	if (stepSize || isNullOrUndef(precision)) {
		// If a precision is not specified, calculate factor based on spacing
		factor = Math.pow(10, helpers._decimalPlaces(spacing));
	} else {
		// If the user specified a precision, round to that number of decimal places
		factor = Math.pow(10, precision);
		spacing = Math.ceil(spacing * factor) / factor;
	}

	niceMin = Math.floor(rmin / spacing) * spacing;
	niceMax = Math.ceil(rmax / spacing) * spacing;

	// If min, max and stepSize is set and they make an evenly spaced scale use it.
	if (stepSize) {
		// If very close to our whole number, use it.
		if (!isNullOrUndef(min) && helpers.almostWhole(min / spacing, spacing / 1000)) {
			niceMin = min;
		}
		if (!isNullOrUndef(max) && helpers.almostWhole(max / spacing, spacing / 1000)) {
			niceMax = max;
		}
	}

	numSpaces = (niceMax - niceMin) / spacing;
	// If very close to our rounded value, use it.
	if (helpers.almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
		numSpaces = Math.round(numSpaces);
	} else {
		numSpaces = Math.ceil(numSpaces);
	}

	niceMin = Math.round(niceMin * factor) / factor;
	niceMax = Math.round(niceMax * factor) / factor;
	ticks.push({value: isNullOrUndef(min) ? niceMin : min});
	for (var j = 1; j < numSpaces; ++j) {
		ticks.push({value: Math.round((niceMin + j * spacing) * factor) / factor});
	}
	ticks.push({value: isNullOrUndef(max) ? niceMax : max});

	return ticks;
}

class LinearScaleBase extends Scale {
	_parse(raw, index) { // eslint-disable-line no-unused-vars
		if (helpers.isNullOrUndef(raw)) {
			return NaN;
		}
		if ((typeof raw === 'number' || raw instanceof Number) && !isFinite(raw)) {
			return NaN;
		}

		return +raw;
	}

	handleTickRangeOptions() {
		var me = this;
		var opts = me.options;

		// If we are forcing it to begin at 0, but 0 will already be rendered on the chart,
		// do nothing since that would make the chart weird. If the user really wants a weird chart
		// axis, they can manually override it
		if (opts.beginAtZero) {
			var minSign = helpers.sign(me.min);
			var maxSign = helpers.sign(me.max);

			if (minSign < 0 && maxSign < 0) {
				// move the top up to 0
				me.max = 0;
			} else if (minSign > 0 && maxSign > 0) {
				// move the bottom down to 0
				me.min = 0;
			}
		}

		var setMin = opts.min !== undefined || opts.suggestedMin !== undefined;
		var setMax = opts.max !== undefined || opts.suggestedMax !== undefined;

		if (opts.min !== undefined) {
			me.min = opts.min;
		} else if (opts.suggestedMin !== undefined) {
			if (me.min === null) {
				me.min = opts.suggestedMin;
			} else {
				me.min = Math.min(me.min, opts.suggestedMin);
			}
		}

		if (opts.max !== undefined) {
			me.max = opts.max;
		} else if (opts.suggestedMax !== undefined) {
			if (me.max === null) {
				me.max = opts.suggestedMax;
			} else {
				me.max = Math.max(me.max, opts.suggestedMax);
			}
		}

		if (setMin !== setMax) {
			// We set the min or the max but not both.
			// So ensure that our range is good
			// Inverted or 0 length range can happen when
			// min is set, and no datasets are visible
			if (me.min >= me.max) {
				if (setMin) {
					me.max = me.min + 1;
				} else {
					me.min = me.max - 1;
				}
			}
		}

		if (me.min === me.max) {
			me.max++;

			if (!opts.beginAtZero) {
				me.min--;
			}
		}
	}

	getTickLimit() {
		var me = this;
		var tickOpts = me.options.ticks;
		var stepSize = tickOpts.stepSize;
		var maxTicksLimit = tickOpts.maxTicksLimit;
		var maxTicks;

		if (stepSize) {
			maxTicks = Math.ceil(me.max / stepSize) - Math.floor(me.min / stepSize) + 1;
		} else {
			maxTicks = me._computeTickLimit();
			maxTicksLimit = maxTicksLimit || 11;
		}

		if (maxTicksLimit) {
			maxTicks = Math.min(maxTicksLimit, maxTicks);
		}

		return maxTicks;
	}

	_computeTickLimit() {
		return Number.POSITIVE_INFINITY;
	}

	_handleDirectionalChanges(ticks) {
		return ticks;
	}

	buildTicks() {
		var me = this;
		var opts = me.options;
		var tickOpts = opts.ticks;

		// Figure out what the max number of ticks we can support it is based on the size of
		// the axis area. For now, we say that the minimum tick spacing in pixels must be 40
		// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
		// the graph. Make sure we always have at least 2 ticks
		var maxTicks = me.getTickLimit();
		maxTicks = Math.max(2, maxTicks);

		var numericGeneratorOptions = {
			maxTicks: maxTicks,
			min: opts.min,
			max: opts.max,
			precision: tickOpts.precision,
			stepSize: helpers.valueOrDefault(tickOpts.fixedStepSize, tickOpts.stepSize)
		};
		var ticks = generateTicks(numericGeneratorOptions, me);

		ticks = me._handleDirectionalChanges(ticks);

		// At this point, we need to update our max and min given the tick values since we have expanded the
		// range of the scale
		helpers._setMinAndMaxByKey(ticks, me, 'value');

		if (opts.reverse) {
			ticks.reverse();

			me.start = me.max;
			me.end = me.min;
		} else {
			me.start = me.min;
			me.end = me.max;
		}

		return ticks;
	}

	generateTickLabels(ticks) {
		var me = this;
		me._tickValues = ticks.map(t => t.value);
		Scale.prototype.generateTickLabels.call(me, ticks);
	}

	_configure() {
		var me = this;
		var ticks = me.getTicks();
		var start = me.min;
		var end = me.max;
		var offset;

		Scale.prototype._configure.call(me);

		if (me.options.offset && ticks.length) {
			offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
			start -= offset;
			end += offset;
		}
		me._startValue = start;
		me._endValue = end;
		me._valueRange = end - start;
	}
}

module.exports = LinearScaleBase;
