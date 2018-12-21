'use strict';

var moment;
try {
	moment = require('moment'); // eslint-disable-line global-require
	moment = typeof moment === 'function' ? moment : window.moment;
} catch (mte) {
	// swallow the error here
}

module.exports = {

	moment: moment,

	createDate: function(value) {
		if (value === undefined) {
			return moment();
		}

		if (value instanceof moment) {
			return value;
		}

		return moment(value);
	},

	isValid: function(date) {
		return date.isValid();
	},

	millisecond: function(date) {
		return date.millisecond();
	},

	second: function(date) {
		return date.second();
	},

	minute: function(date) {
		return date.minute();
	},

	hour: function(date) {
		return date.hour();
	},

	isoWeekday: function(date, value) {
		return date.clone().isoWeekday(value);
	},

	startOf: function(date, value) {
		return date.clone().startOf(value);
	},

	endOf: function(date, value) {
		return date.clone().endOf(value);
	},

	valueOf: function(date) {
		return date.valueOf();
	},

	toFormat: function(date, format) {
		return date.format(format);
	},

	add: function(date, value, type) {
		return date.clone().add(value, type);
	},

	diff: function(date, other, unit) {
		var duration = moment.duration(date.clone().diff(other));
		return duration.as(unit);
	},

	defaultDisplayFormats: {
		millisecond: 'h:mm:ss.SSS a', // 11:20:01.123 AM,
		second: 'h:mm:ss a', // 11:20:01 AM
		minute: 'h:mm a', // 11:20 AM
		hour: 'hA', // 5PM
		day: 'MMM D', // Sep 4
		week: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
		month: 'MMM YYYY', // Sept 2015
		quarter: '[Q]Q - YYYY', // Q3 - 2015
		year: 'YYYY' // 2015
	}
};
