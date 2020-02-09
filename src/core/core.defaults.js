'use strict';

import {merge} from '../helpers/helpers.core';

class Defaults {
	constructor() {
		this.color = 'rgba(0,0,0,0.1)';
		this.elements = {};
		this.events = [
			'mousemove',
			'mouseout',
			'click',
			'touchstart',
			'touchmove'
		];
		this.fontColor = '#666';
		this.fontFamily = "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
		this.fontSize = 12;
		this.fontStyle = 'normal';
		this.lineHeight = 1.2;
		this.hover = {
			onHover: null,
			mode: 'nearest',
			intersect: true
		};
		this.maintainAspectRatio = true;
		this.onClick = null;
		this.responsive = true;
		this.showLines = true;
		this.plugins = undefined;
		this.scale = undefined;
		this.legend = undefined;
		this.title = undefined;
		this.tooltips = undefined;
		this.doughnut = undefined;
	}
	/**
	 * @param {string} scope
	 * @param {*} values
	 * @private
	 */
	set(scope, values) {
		return merge(this[scope] || (this[scope] = {}), values);
	}
}

// singleton instance
export default new Defaults();
