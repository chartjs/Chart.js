'use strict';

var luxon, DateTime;
try {
	luxon = require('luxon'); // eslint-disable-line global-require
	luxon = (luxon && luxon.DateTime) ? luxon : window.luxon;
	DateTime = luxon.DateTime;
} catch (lxe) {
	// swallow the error here
}


module.exports = {

	luxon: luxon,

	createDate: function(value) {
		if (value === undefined) {
			value = new Date();
		}

		if (typeof value === 'number') {
			return DateTime.fromMillis(value);
		}
		if (value instanceof Date) {
			return DateTime.fromJSDate(value);
		}
		if (value instanceof DateTime) {
			return value;
		}
		return undefined;
	},

	isValid: function(date) {
		return date.isValid;
	},

	millisecond: function(date) {
		return date.millisecond;
	},

	second: function(date) {
		return date.second;
	},

	minute: function(date) {
		return date.minute;
	},

	hour: function(date) {
		return date.hour;
	},

	isoWeekday: function(date, value) {
		return date.isoWeekday(value);
	},

	startOf: function(date, value) {
		return date.startOf(value);
	},

	endOf: function(date, value) {
		return date.endOf(value);
	},

	valueOf: function(date) {
		return date.valueOf();
	},

	toFormat: function(date, format) {
		return date.toFormat(format);
	},

	add: function(date, value, type) {
		var arg = {};
		arg[type] = value;
		return date.plus(arg);
	},

	diff: function(date, other, unit) {
		var duration = date.diff(other);
		return duration.as(unit);
	},

	defaultDisplayFormats: {
		millisecond: 'h:mm:ss.SSS a', // 11:20:01.123 AM,
		second: 'h:mm:ss a', // 11:20:01 AM
		minute: 'h:mm a', // 11:20 AM
		hour: 'ha', // 5PM
		day: 'MMM d', // Sep 4
		week: 'WW', // Week 46, or maybe "[W]WW - YYYY" ?
		month: 'MMM yyyy', // Sept 2015
		quarter: '\'Q\'q - yyyy', // Q3 - 2015
		year: 'yyyy' // 2015
	}
};
