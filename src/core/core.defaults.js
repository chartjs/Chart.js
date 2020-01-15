'use strict';

import {merge} from '../helpers/helpers.core';

export default {
	color: 'rgba(0,0,0,0.1)',
	elements: {},
	events: [
		'mousemove',
		'mouseout',
		'click',
		'touchstart',
		'touchmove'
	],
	fontColor: '#666',
	fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
	fontSize: 12,
	fontStyle: 'normal',
	lineHeight: 1.2,
	hover: {
		onHover: null,
		mode: 'nearest',
		intersect: true
	},
	maintainAspectRatio: true,
	onClick: null,
	responsive: true,
	showLines: true,

	/**
	 * @private
	 */
	_set: function(scope, values) {
		return merge(this[scope] || (this[scope] = {}), values);
	}
};
