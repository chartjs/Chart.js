// TODO v3 - make this adapter external (chartjs-adapter-moment)

'use strict';

var moment = require('moment');
var adapter = require('../core/core.adapters')._date;
var helpers = require('../helpers/helpers.core');

var FORMATS = {
	millisecond: 'h:mm:ss.SSS a',
	second: 'h:mm:ss a',
	minute: 'h:mm a',
	hour: 'hA',
	day: 'MMM D',
	week: 'll',
	month: 'MMM YYYY',
	quarter: '[Q]Q - YYYY',
	year: 'YYYY'
};

var PRESETS = {
	full: 'MMM D, YYYY h:mm:ss.SSS a',
	time: 'MMM D, YYYY h:mm:ss a',
	date: 'MMM D, YYYY'
};

helpers.merge(adapter, moment ? {
	_id: 'moment', // DEBUG ONLY

	formats: function() {
		return FORMATS;
	},

	presets: function() {
		return PRESETS;
	},

	parse: function(value, format) {
		if (typeof value === 'string' && typeof format === 'string') {
			value = moment(value, format);
		} else if (!(value instanceof moment)) {
			value = moment(value);
		}
		return value.isValid() ? +value : null;
	},

	format: function(time, format) {
		return moment(time).format(format);
	},

	add: function(time, amount, unit) {
		return +moment(time).add(amount, unit);
	},

	diff: function(max, min, unit) {
		return moment.duration(moment(max).diff(moment(min))).as(unit);
	},

	startOf: function(time, unit, weekday) {
		time = moment(time);
		if (unit === 'isoWeek') {
			return +time.isoWeekday(weekday);
		}
		return +time.startOf(unit);
	},

	endOf: function(time, unit) {
		return +moment(time).endOf(unit);
	},

	// DEPRECATIONS

	/**
	 * Provided for backward compatibility with scale.getValueForPixel().
	 * @deprecated since version 2.8.0
	 * @todo remove at version 3
	 * @private
	 */
	_create: function(time) {
		return moment(time);
	},
} : {});
