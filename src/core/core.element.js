'use strict';

import {extend, inherits} from '../helpers/helpers.core';
import {isNumber} from '../helpers/helpers.math';

class Element {

	/**
	 * @param {object} [cfg] optional configuration
	 */
	constructor(cfg) {
		this.x = undefined;
		this.y = undefined;
		this.hidden = undefined;

		if (cfg) {
			extend(this, cfg);
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

Element.extend = inherits;
export default Element;
