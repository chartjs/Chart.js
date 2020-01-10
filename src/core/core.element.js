'use strict';

import {extend, inherits} from '../helpers/helpers.core';
import {isNumber} from '../helpers/helpers.math';

class Element {

	constructor(configuration) {
		if (configuration) {
			extend(this, configuration);
		}

		// this.hidden = false; we assume Element has an attribute called hidden, but do not initialize to save memory
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
