// TODO v3 - make this adapter external (chartjs-adapter-moment)

'use strict';

var moment = require('moment');
var adapters = require('../core/core.adapters');

var FORMATS = {
	datetime: 'MMM D, YYYY, h:mm:ss a',
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

adapters._date.override(typeof moment === 'function' ? {
	_id: 'moment', // DEBUG ONLY

	formats: function() {
		return FORMATS;
	},

	parse: function(value, format) {
		if (typeof value === 'string' && typeof format === 'string') {
			value = moment(value, format);
		} else if (!(value instanceof moment)) {
			value = moment(value);
		}
		return value.isValid() ? value.valueOf() : null;
	},

	format: function(time, format) {
		return moment(time).format(format);
	},

	add: function(time, amount, unit) {
		return moment(time).add(amount, unit).valueOf();
	},

	diff: function(max, min, unit) {
		return moment.duration(moment(max).diff(moment(min))).as(unit);
	},

	startOf: function(time, unit, weekday) {
		time = moment(time);
		if (unit === 'isoWeek') {
			return time.isoWeekday(weekday).valueOf();
		}
		return time.startOf(unit).valueOf();
	},

	endOf: function(time, unit) {
		return moment(time).endOf(unit).valueOf();
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
