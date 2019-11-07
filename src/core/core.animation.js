'use strict';

const Element = require('./core.element');
const helpers = require('../helpers/index');

class Animation extends Element {

	constructor(props) {
		super({
			chart: null, // the animation associated chart instance
			currentStep: 0, // the current animation step
			numSteps: 60, // default number of steps
			easing: '', // the easing to use for this animation
			render: null, // render function used by the animation service

			onAnimationProgress: null, // user specified callback to fire on each step of the animation
			onAnimationComplete: null, // user specified callback to fire when the animation finishes
		});
		helpers.extend(this, props);
	}

}

module.exports = Animation;
