import {merge} from '../helpers/helpers.core';

/**
 * Please use the module's default export which provides a singleton instance
 */
export class Defaults {
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
		this.font = {
			color: '#666',
			family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
			size: 12,
			style: 'normal',
			lineHeight: 1.2,
			weight: null,
			lineWidth: 0,
			strokeStyle: undefined
		};
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
	 */
	set(scope, values) {
		return merge(this[scope] || (this[scope] = {}), values);
	}
}

// singleton instance
export default new Defaults();
