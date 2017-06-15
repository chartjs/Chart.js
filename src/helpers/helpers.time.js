'use strict';

var moment = require('moment');
moment = typeof(moment) === 'function' ? moment : window.moment;

module.exports = function(Chart) {

	var interval = {
		millisecond: {
			size: 1,
			steps: [1, 2, 5, 10, 20, 50, 100, 250, 500]
		},
		second: {
			size: 1000,
			steps: [1, 2, 5, 10, 30]
		},
		minute: {
			size: 60000,
			steps: [1, 2, 5, 10, 30]
		},
		hour: {
			size: 3600000,
			steps: [1, 2, 3, 6, 12]
		},
		day: {
			size: 86400000,
			steps: [1, 2, 5]
		},
		week: {
			size: 604800000,
			maxStep: 4
		},
		month: {
			size: 2.628e9,
			maxStep: 3
		},
		quarter: {
			size: 7.884e9,
			maxStep: 4
		},
		year: {
			size: 3.154e10,
			maxStep: false
		}
	};

	/**
	 * Helper for generating axis labels.
	 * @param options {ITimeGeneratorOptions} the options for generation
	 * @param dataRange {IRange} the data range
	 * @param niceRange {IRange} the pretty range to display
	 * @return {Number[]} ticks
	 */
	function generateTicksNiceRange(options, dataRange, niceRange) {
		var ticks = [];
		if (options.maxTicks) {
			var stepSize = options.stepSize;
			var startTick = options.min !== undefined ? options.min : niceRange.min;
			var majorUnit = options.majorUnit;
			var majorUnitStart = majorUnit ? moment(startTick).add(1, majorUnit).startOf(majorUnit) : startTick;
			var startRange = majorUnitStart.valueOf() - startTick;
			var stepValue = interval[options.unit].size * stepSize;
			var startFraction = startRange % stepValue;
			var alignedTick = startTick;
			if (startFraction && majorUnit && !options.timeOpts.round && !options.timeOpts.isoWeekday) {
				alignedTick += startFraction - stepValue;
				ticks.push(alignedTick);
			} else {
				ticks.push(startTick);
			}
			var cur = moment(alignedTick);
			var realMax = options.max || niceRange.max;
			while (cur.add(stepSize, options.unit).valueOf() < realMax) {
				ticks.push(cur.valueOf());
			}
			ticks.push(cur.valueOf());
		}
		return ticks;
	}

	Chart.helpers = Chart.helpers || {};

	Chart.helpers.time = {

		/**
		 * Helper function to parse time to a moment object
		 * @param axis {TimeAxis} the time axis
		 * @param label {Date|string|number|Moment} The thing to parse
		 * @return {Moment} parsed time
		 */
		parseTime: function(axis, label) {
			var timeOpts = axis.options.time;
			if (typeof timeOpts.parser === 'string') {
				return moment(label, timeOpts.parser);
			}
			if (typeof timeOpts.parser === 'function') {
				return timeOpts.parser(label);
			}
			if (typeof label.getMonth === 'function' || typeof label === 'number') {
				// Date objects
				return moment(label);
			}
			if (label.isValid && label.isValid()) {
				// Moment support
				return label;
			}
			var format = timeOpts.format;
			if (typeof format !== 'string' && format.call) {
				// Custom parsing (return an instance of moment)
				console.warn('options.time.format is deprecated and replaced by options.time.parser.');
				return format(label);
			}
			// Moment format parsing
			return moment(label, format);
		},

		/**
		 * Figure out which is the best unit for the scale
		 * @param minUnit {String} minimum unit to use
		 * @param min {Number} scale minimum
		 * @param max {Number} scale maximum
		 * @return {String} the unit to use
		 */
		determineUnit: function(minUnit, min, max, maxTicks) {
			var units = Object.keys(interval);
			var unit;
			var numUnits = units.length;

			for (var i = units.indexOf(minUnit); i < numUnits; i++) {
				unit = units[i];
				var unitDetails = interval[unit];
				var steps = (unitDetails.steps && unitDetails.steps[unitDetails.steps.length - 1]) || unitDetails.maxStep;
				if (steps === undefined || Math.ceil((max - min) / (steps * unitDetails.size)) <= maxTicks) {
					break;
				}
			}

			return unit;
		},

		/**
		 * Determine major unit accordingly to passed unit
		 * @param unit {String} relative unit
		 * @return {String} major unit
		 */
		determineMajorUnit: function(unit) {
			var units = Object.keys(interval);
			var unitIndex = units.indexOf(unit);
			while (unitIndex < units.length) {
				var majorUnit = units[++unitIndex];
				// exclude 'week' and 'quarter' units
				if (majorUnit !== 'week' && majorUnit !== 'quarter') {
					return majorUnit;
				}
			}

			return null;
		},

		/**
		 * Determines how we scale the unit
		 * @param min {Number} the scale minimum
		 * @param max {Number} the scale maximum
		 * @param unit {String} the unit determined by the {@see determineUnit} method
		 * @return {Number} the axis step size as a multiple of unit
		 */
		determineStepSize: function(min, max, unit, maxTicks) {
			// Using our unit, figure out what we need to scale as
			var unitDefinition = interval[unit];
			var unitSizeInMilliSeconds = unitDefinition.size;
			var sizeInUnits = Math.ceil((max - min) / unitSizeInMilliSeconds);
			var multiplier = 1;
			var range = max - min;

			if (unitDefinition.steps) {
				// Have an array of steps
				var numSteps = unitDefinition.steps.length;
				for (var i = 0; i < numSteps && sizeInUnits > maxTicks; i++) {
					multiplier = unitDefinition.steps[i];
					sizeInUnits = Math.ceil(range / (unitSizeInMilliSeconds * multiplier));
				}
			} else {
				while (sizeInUnits > maxTicks && maxTicks > 0) {
					++multiplier;
					sizeInUnits = Math.ceil(range / (unitSizeInMilliSeconds * multiplier));
				}
			}

			return multiplier;
		},

		/**
		 * @function generateTicks
		 * @param options {ITimeGeneratorOptions} the options for generation
		 * @param dataRange {IRange} the data range
		 * @return {Number[]} ticks
		 */
		generateTicks: function(options, dataRange) {
			var niceMin;
			var niceMax;
			var isoWeekday = options.timeOpts.isoWeekday;
			if (options.unit === 'week' && isoWeekday !== false) {
				niceMin = moment(dataRange.min).startOf('isoWeek').isoWeekday(isoWeekday).valueOf();
				niceMax = moment(dataRange.max).startOf('isoWeek').isoWeekday(isoWeekday);
				if (dataRange.max - niceMax > 0) {
					niceMax.add(1, 'week');
				}
				niceMax = niceMax.valueOf();
			} else {
				niceMin = moment(dataRange.min).startOf(options.unit).valueOf();
				niceMax = moment(dataRange.max).startOf(options.unit);
				if (dataRange.max - niceMax > 0) {
					niceMax.add(1, options.unit);
				}
				niceMax = niceMax.valueOf();
			}
			return generateTicksNiceRange(options, dataRange, {
				min: niceMin,
				max: niceMax
			});
		}

	};

};
