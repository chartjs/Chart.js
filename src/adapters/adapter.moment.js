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

	parse: function(args) {
		var value = args.value;
		var format = args.format;
		if (typeof value === 'string' && typeof format === 'string') {
			value = moment(value, format);
		} else if (!(value instanceof moment)) {
			value = moment(value);
		}
		return value.isValid() ? value.valueOf() : null;
	},

	format: function(args) {
		return moment(args.timestamp).format(args.format);
	},

	add: function(args) {
		return moment(args.timestamp).add(args.amount, args.unit).valueOf();
	},

	diff: function(args) {
		return moment.duration(moment(args.max).diff(moment(args.min))).as(args.unit);
	},

	startOf: function(args) {
		var time = moment(args.timestamp);
		if (args.unit === 'isoWeek') {
			return time.isoWeekday(args.weekday).valueOf();
		}
		return time.startOf(args.unit).valueOf();
	},

	endOf: function(args) {
		return moment(args.timestamp).endOf(args.unit).valueOf();
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
