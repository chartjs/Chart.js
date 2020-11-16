import {isNullOrUndef, valueOrDefault} from '../helpers/helpers.core';
import {almostEquals, almostWhole, log10, _decimalPlaces, _setMinAndMaxByKey, sign} from '../helpers/helpers.math';
import Scale from '../core/core.scale';

/**
 * Implementation of the nice number algorithm used in determining where axis labels will go
 * @return {number}
 */
function niceNum(range) {
	const exponent = Math.floor(log10(range));
	const fraction = range / Math.pow(10, exponent);
	let niceFraction;

	if (fraction <= 1.0) {
		niceFraction = 1;
	} else if (fraction <= 2) {
		niceFraction = 2;
	} else if (fraction <= 5) {
		niceFraction = 5;
	} else {
		niceFraction = 10;
	}

	return niceFraction * Math.pow(10, exponent);
}

/**
 * Generate a set of linear ticks
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {object[]} array of tick objects
 */
function generateTicks(generationOptions, dataRange) {
	const ticks = [];
	// To get a "nice" value for the tick spacing, we will use the appropriately named
	// "nice number" algorithm. See https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
	// for details.

	const MIN_SPACING = 1e-14;
	const {stepSize, min, max, precision} = generationOptions;
	const unit = stepSize || 1;
	const maxNumSpaces = generationOptions.maxTicks - 1;
	const {min: rmin, max: rmax} = dataRange;
	let spacing = niceNum((rmax - rmin) / maxNumSpaces / unit) * unit;
	let factor, niceMin, niceMax, numSpaces;

	// Beyond MIN_SPACING floating point numbers being to lose precision
	// such that we can't do the math necessary to generate ticks
	if (spacing < MIN_SPACING && isNullOrUndef(min) && isNullOrUndef(max)) {
		return [{value: rmin}, {value: rmax}];
	}

	numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
	if (numSpaces > maxNumSpaces) {
		// If the calculated num of spaces exceeds maxNumSpaces, recalculate it
		spacing = niceNum(numSpaces * spacing / maxNumSpaces / unit) * unit;
	}

	if (stepSize || isNullOrUndef(precision)) {
		// If a precision is not specified, calculate factor based on spacing
		factor = Math.pow(10, _decimalPlaces(spacing));
	} else {
		// If the user specified a precision, round to that number of decimal places
		factor = Math.pow(10, precision);
		spacing = Math.ceil(spacing * factor) / factor;
	}

	niceMin = Math.floor(rmin / spacing) * spacing;
	niceMax = Math.ceil(rmax / spacing) * spacing;

	// If min, max and stepSize is set and they make an evenly spaced scale use it.
	if (stepSize && !isNullOrUndef(min) && !isNullOrUndef(max)) {
		// If very close to our whole number, use it.
		if (almostWhole((max - min) / stepSize, spacing / 1000)) {
			niceMin = min;
			niceMax = max;
		}
	}

	numSpaces = (niceMax - niceMin) / spacing;
	// If very close to our rounded value, use it.
	if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
		numSpaces = Math.round(numSpaces);
	} else {
		numSpaces = Math.ceil(numSpaces);
	}

	niceMin = Math.round(niceMin * factor) / factor;
	niceMax = Math.round(niceMax * factor) / factor;
	ticks.push({value: isNullOrUndef(min) ? niceMin : min});
	for (let j = 1; j < numSpaces; ++j) {
		ticks.push({value: Math.round((niceMin + j * spacing) * factor) / factor});
	}
	ticks.push({value: isNullOrUndef(max) ? niceMax : max});

	return ticks;
}

export default class LinearScaleBase extends Scale {

	constructor(cfg) {
		super(cfg);

		/** @type {number} */
		this.start = undefined;
		/** @type {number} */
		this.end = undefined;
		/** @type {number} */
		this._startValue = undefined;
		/** @type {number} */
		this._endValue = undefined;
		this._valueRange = 0;
	}

	parse(raw, index) { // eslint-disable-line no-unused-vars
		if (isNullOrUndef(raw)) {
			return NaN;
		}
		if ((typeof raw === 'number' || raw instanceof Number) && !isFinite(+raw)) {
			return NaN;
		}

		return +raw;
	}

	handleTickRangeOptions() {
		const me = this;
		const {beginAtZero, stacked} = me.options;
		const {minDefined, maxDefined} = me.getUserBounds();
		let {min, max} = me;

		const setMin = v => (min = minDefined ? min : v);
		const setMax = v => (max = maxDefined ? max : v);

		if (beginAtZero || stacked) {
			const minSign = sign(min);
			const maxSign = sign(max);

			if (minSign < 0 && maxSign < 0) {
				setMax(0);
			} else if (minSign > 0 && maxSign > 0) {
				setMin(0);
			}
		}

		if (min === max) {
			setMax(max + 1);

			if (!beginAtZero) {
				setMin(min - 1);
			}
		}
		me.min = min;
		me.max = max;
	}

	getTickLimit() {
		const me = this;
		const tickOpts = me.options.ticks;
		// eslint-disable-next-line prefer-const
		let {maxTicksLimit, stepSize} = tickOpts;
		let maxTicks;

		if (stepSize) {
			maxTicks = Math.ceil(me.max / stepSize) - Math.floor(me.min / stepSize) + 1;
		} else {
			maxTicks = me.computeTickLimit();
			maxTicksLimit = maxTicksLimit || 11;
		}

		if (maxTicksLimit) {
			maxTicks = Math.min(maxTicksLimit, maxTicks);
		}

		return maxTicks;
	}

	/**
	 * @protected
	 */
	computeTickLimit() {
		return Number.POSITIVE_INFINITY;
	}

	buildTicks() {
		const me = this;
		const opts = me.options;
		const tickOpts = opts.ticks;

		// Figure out what the max number of ticks we can support it is based on the size of
		// the axis area. For now, we say that the minimum tick spacing in pixels must be 40
		// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
		// the graph. Make sure we always have at least 2 ticks
		let maxTicks = me.getTickLimit();
		maxTicks = Math.max(2, maxTicks);

		const numericGeneratorOptions = {
			maxTicks,
			min: opts.min,
			max: opts.max,
			precision: tickOpts.precision,
			stepSize: valueOrDefault(tickOpts.fixedStepSize, tickOpts.stepSize)
		};
		const ticks = generateTicks(numericGeneratorOptions, me);

		// At this point, we need to update our max and min given the tick values,
		// since we probably have expanded the range of the scale
		if (opts.bounds === 'ticks') {
			_setMinAndMaxByKey(ticks, me, 'value');
		}

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

	/**
	 * @protected
	 */
	configure() {
		const me = this;
		const ticks = me.ticks;
		let start = me.min;
		let end = me.max;

		super.configure();

		if (me.options.offset && ticks.length) {
			const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
			start -= offset;
			end += offset;
		}
		me._startValue = start;
		me._endValue = end;
		me._valueRange = end - start;
	}

	getLabelForValue(value) {
		return new Intl.NumberFormat(this.options.locale).format(value);
	}
}
