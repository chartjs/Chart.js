import {inherits} from '../helpers/helpers.core';
import {isNumber} from '../helpers/helpers.math';

export default class Element {

	static extend = inherits;

	/**
	 * @param {object} [cfg] optional configuration
	 */
	constructor(cfg) {
		this.x = undefined;
		this.y = undefined;
		this.hidden = undefined;

		if (cfg) {
			Object.assign(this, cfg);
		}
	}

	tooltipPosition() {
		return {
			x: this.x,
			y: this.y
		};
	}

	hasValue() {
		return isNumber(this.x) && isNumber(this.y);
	}
}
