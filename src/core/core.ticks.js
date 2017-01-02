'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;

	/**
	 * Namespace to hold static tick generation functions
	 * @namespace Chart.Ticks
	 */
	Chart.Ticks = {
		/**
		 * Namespace to hold generators for different types of ticks
		 * @namespace Chart.Ticks.generators
		 */
		generators: {
			/**
			 * Interface for the options provided to the numeric tick generator
			 * @interface INumericTickGenerationOptions
			 */
			/**
			 * The maximum number of ticks to display
			 * @name INumericTickGenerationOptions#maxTicks
			 * @type Number
			 */
			/**
			 * The distance between each tick.
			 * @name INumericTickGenerationOptions#stepSize
			 * @type Number
			 * @optional
			 */
			/**
			 * Forced minimum for the ticks. If not specified, the minimum of the data range is used to calculate the tick minimum
			 * @name INumericTickGenerationOptions#min
			 * @type Number
			 * @optional
			 */
			/**
			 * The maximum value of the ticks. If not specified, the maximum of the data range is used to calculate the tick maximum
			 * @name INumericTickGenerationOptions#max
			 * @type Number
			 * @optional
			 */

			/**
			 * Generate a set of linear ticks
			 * @method Chart.Ticks.generators.linear
			 * @param generationOptions {INumericTickGenerationOptions} the options used to generate the ticks
			 * @param dataRange {IRange} the range of the data
			 * @returns {Array<Number>} array of tick values
			 */
			linear: function(generationOptions, dataRange) {
				var ticks = [];
				// To get a "nice" value for the tick spacing, we will use the appropriately named
				// "nice number" algorithm. See http://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
				// for details.

				var spacing;
				if (generationOptions.stepSize && generationOptions.stepSize > 0) {
					spacing = generationOptions.stepSize;
				} else {
					var niceRange = helpers.niceNum(dataRange.max - dataRange.min, false);
					spacing = helpers.niceNum(niceRange / (generationOptions.maxTicks - 1), true);
				}
				var niceMin = Math.floor(dataRange.min / spacing) * spacing;
				var niceMax = Math.ceil(dataRange.max / spacing) * spacing;

				// If min, max and stepSize is set and they make an evenly spaced scale use it.
				if (generationOptions.min && generationOptions.max && generationOptions.stepSize) {
					// If very close to our whole number, use it.
					if (helpers.almostWhole((generationOptions.max - generationOptions.min) / generationOptions.stepSize, spacing / 1000)) {
						niceMin = generationOptions.min;
						niceMax = generationOptions.max;
					}
				}

				var numSpaces = (niceMax - niceMin) / spacing;
				// If very close to our rounded value, use it.
				if (helpers.almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
					numSpaces = Math.round(numSpaces);
				} else {
					numSpaces = Math.ceil(numSpaces);
				}

				// Put the values into the ticks array
				ticks.push(generationOptions.min !== undefined ? generationOptions.min : niceMin);
				for (var j = 1; j < numSpaces; ++j) {
					ticks.push(niceMin + (j * spacing));
				}
				ticks.push(generationOptions.max !== undefined ? generationOptions.max : niceMax);

				return ticks;
			},

			/**
			 * Generate a set of logarithmic ticks
			 * @method Chart.Ticks.generators.logarithmic
			 * @param generationOptions {INumericTickGenerationOptions} the options used to generate the ticks
			 * @param dataRange {IRange} the range of the data
			 * @returns {Array<Number>} array of tick values
			 */
			logarithmic: function(generationOptions, dataRange) {
				var ticks = [];
				var getValueOrDefault = helpers.getValueOrDefault;

				// Figure out what the max number of ticks we can support it is based on the size of
				// the axis area. For now, we say that the minimum tick spacing in pixels must be 50
				// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
				// the graph
				var tickVal = getValueOrDefault(generationOptions.min, Math.pow(10, Math.floor(helpers.log10(dataRange.min))));

				var endExp = Math.floor(helpers.log10(dataRange.max));
				var endSignificand = Math.ceil(dataRange.max / Math.pow(10, endExp));
				var exp;
				var significand;

				if (tickVal === 0) {
					exp = Math.floor(helpers.log10(dataRange.minNotZero));
					significand = Math.floor(dataRange.minNotZero / Math.pow(10, exp));

					ticks.push(tickVal);
					tickVal = significand * Math.pow(10, exp);
				} else {
					exp = Math.floor(helpers.log10(tickVal));
					significand = Math.floor(tickVal / Math.pow(10, exp));
				}

				do {
					ticks.push(tickVal);

					++significand;
					if (significand === 10) {
						significand = 1;
						++exp;
					}

					tickVal = significand * Math.pow(10, exp);
				} while (exp < endExp || (exp === endExp && significand < endSignificand));

				var lastTick = getValueOrDefault(generationOptions.max, tickVal);
				ticks.push(lastTick);

				return ticks;
			},

			// Generator of fine linear ticks data
			fineLinear: function(generationOptions, dataRange, callback) {
				// for return
				var ticks = [];
				var levels = [];

				var niceNum = callback? callback: helpers.niceNumForFineScale;
				var niceRange = niceNum(dataRange.max - dataRange.min, false);
				var stepSize = [];
				stepSize[0] = niceNum(niceRange, true, generationOptions.maxTicks, 0);
				stepSize[1] = niceNum(stepSize[0], true, 11, 1);
				stepSize[2] = niceNum(stepSize[1], true, 11, 2);
				// Pointer of minimum stepSize.
				var pointerStepSize = 2;
				// var isRev = dataRange.max < dataRange.min;
				// var min = isRev? dataRange.max: dataRange.min;
				// var max = isRev? dataRange.min: dataRange.max;

				// process of stepSize option
				if (generationOptions.stepSize && generationOptions.stepSize > 0) {
					// The maximum number of ticks is 1000.
					// This is for performance.
					var gStepSize = generationOptions.stepSize;
					while ((dataRange.max - dataRange.min) / gStepSize > 1000) {
						gStepSize *= 10;
					}
					// Check the stepSize of each tick level and
					// set the minimum stepSize to generationOptions.stepSize.
					var value = gStepSize;
					for (var i = 0; i < generationOptions.levelMax; i++) {
						if (stepSize[i] <= gStepSize) {
							stepSize[i] = value;
							pointerStepSize = value !== 0? i: pointerStepSize;
							value = 0;
						}
					}
					stepSize[pointerStepSize] = stepSize[pointerStepSize] > gStepSize? gStepSize: stepSize[pointerStepSize];
				}

				// Nice numerical value for min & max
				var niceMin = Math.floor(dataRange.min / stepSize[0]) * stepSize[0];
				var niceMax = Math.ceil(dataRange.max / stepSize[0]) * stepSize[0];
				// If min, max and stepSize is set and they make an evenly spaced scale use it.
				if (generationOptions.min && generationOptions.max && generationOptions.stepSize) {
					// If very close to our whole number, use it.
					// if (helpers.almostWhole((generationOptions.max - generationOptions.min) / generationOptions.stepSize, spacing / 1000)) {
					niceMin = generationOptions.min;
					niceMax = generationOptions.max;
					// }
				}
				// Max and Min value of scale
				var startTick = generationOptions.min !== undefined? generationOptions.min: niceMin;
				var endTick = generationOptions.max !== undefined? generationOptions.max: niceMax;

				// ss: stepSize
				var getDicimalDigits = function(ss) {
					ss = ss === 0? 1: ss;
					var exponent = Math.floor(helpers.log10(ss));

					return {
						digits: exponent > 0? 0: Math.abs(exponent),
						magnification: Math.pow(10, exponent)
					};
				};

				// Calculation parameters
				var stepSizeDicimal = [
					getDicimalDigits(stepSize[0]),
					getDicimalDigits(stepSize[1]),
					getDicimalDigits(stepSize[2])
				];

				// -------
				// Create ticks data

				// ----
				// Calculation of scale level (0-2)
				// nm : niceMin
				// tv: tickValue
				// ss: stepSize[]
				// mc: magnification
				// ----
				var level, tickValue;
				var getLevel = function(nm, tv, ss, mc) {
					// Level discrimination
					var t1 = (tv - nm) / mc % (ss[0] / mc);
					var t2 = (tv - nm) / mc % (ss[1] / mc);
					return t1 === 0? 0: (t2 === 0? 1: 2);
				};

				// Number of tick for loop
				var stepCount = +(((niceMax - niceMin) / stepSize[pointerStepSize]).toFixed(stepSizeDicimal[pointerStepSize].digits));
				// --push start tick--
				ticks.push(startTick);
				levels.push(getLevel(niceMin, startTick, stepSize, stepSizeDicimal[pointerStepSize].magnification));
				for (var index = 1; index < stepCount; index++) {
					tickValue = +(niceMin + index * stepSize[pointerStepSize]).toFixed(stepSizeDicimal[pointerStepSize].digits);
					if ((tickValue <= startTick) || (endTick <= tickValue)) {
						continue;
					}
					level = getLevel(niceMin, tickValue, stepSize, stepSizeDicimal[pointerStepSize].magnification);
					// --push ticks--
					ticks.push(+((tickValue).toFixed(stepSizeDicimal[level].digits)));
					levels.push(level);
				}
				// --push end tick--
				ticks.push(endTick);
				levels.push(getLevel(niceMin, endTick, stepSize, stepSizeDicimal[pointerStepSize].magnification));

				// -------
				return {
					ticks: ticks,
					levels: levels,
					min: startTick,
					max: endTick,
				};
			}
		},

		/**
		 * Namespace to hold formatters for different types of ticks
		 * @namespace Chart.Ticks.formatters
		 */
		formatters: {
			/**
			 * Formatter for value labels
			 * @method Chart.Ticks.formatters.values
			 * @param value the value to display
			 * @return {String|Array} the label to display
			 */
			values: function(value) {
				return helpers.isArray(value) ? value : '' + value;
			},

			/**
			 * Formatter for linear numeric ticks
			 * @method Chart.Ticks.formatters.linear
			 * @param tickValue {Number} the value to be formatted
			 * @param index {Number} the position of the tickValue parameter in the ticks array
			 * @param ticks {Array<Number>} the list of ticks being converted
			 * @return {String} string representation of the tickValue parameter
			 */
			linear: function(tickValue, index, ticks) {
				// If we have lots of ticks, don't use the ones
				var delta = ticks.length > 3 ? ticks[2] - ticks[1] : ticks[1] - ticks[0];

				// If we have a number like 2.5 as the delta, figure out how many decimal places we need
				if (Math.abs(delta) > 1) {
					if (tickValue !== Math.floor(tickValue)) {
						// not an integer
						delta = tickValue - Math.floor(tickValue);
					}
				}

				var logDelta = helpers.log10(Math.abs(delta));
				var tickString = '';

				if (tickValue !== 0) {
					var numDecimal = -1 * Math.floor(logDelta);
					numDecimal = Math.max(Math.min(numDecimal, 20), 0); // toFixed has a max of 20 decimal places
					tickString = tickValue.toFixed(numDecimal);
				} else {
					tickString = '0'; // never show decimal places for 0
				}

				return tickString;
			},

			logarithmic: function(tickValue, index, ticks) {
				var remain = tickValue / (Math.pow(10, Math.floor(helpers.log10(tickValue))));

				if (tickValue === 0) {
					return '0';
				} else if (remain === 1 || remain === 2 || remain === 5 || index === 0 || index === ticks.length - 1) {
					return tickValue.toExponential();
				}
				return '';
			}
		}
	};
};
