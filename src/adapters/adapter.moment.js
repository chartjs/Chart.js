// TODO v3 - make this adapter external (chartjs-adapter-moment)

import moment from 'moment';
import adapters from '../core/core.adapters';

const FORMATS = {
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

	formats() {
		return FORMATS;
	},

	parse(value, format) {
		if (typeof value === 'string' && typeof format === 'string') {
			value = moment(value, format);
		} else if (!(value instanceof moment)) {
			value = moment(value);
		}
		return value.isValid() ? value.valueOf() : null;
	},

	format(time, format) {
		return moment(time).format(format);
	},

	add(time, amount, unit) {
		return moment(time).add(amount, unit).valueOf();
	},

	diff(max, min, unit) {
		return moment(max).diff(moment(min), unit);
	},

	startOf(time, unit, weekday) {
		time = moment(time);
		if (unit === 'isoWeek') {
			return time.isoWeekday(weekday).valueOf();
		}
		return time.startOf(unit).valueOf();
	},

	endOf(time, unit) {
		return moment(time).endOf(unit).valueOf();
	}
} : {});
