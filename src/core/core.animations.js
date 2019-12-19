'use strict';

const Animator = require('./core.animator');
const Animation = require('./core.animation');
const helpers = require('../helpers/index');
const defaults = require('./core.defaults');

defaults._set('global', {
	animation: {
		duration: 1000,
		easing: 'easeOutQuart',
		active: {
			duration: 400
		},
		resize: {
			duration: 0
		},
		numbers: {
			type: 'number',
			properties: ['x', 'y', 'borderWidth', 'radius', 'tension']
		},
		colors: {
			type: 'color',
			properties: ['borderColor', 'backgroundColor']
		},
		onProgress: helpers.noop,
		onComplete: helpers.noop
	}
});

function copyOptions(target, values) {
	let oldOpts = target.options;
	let newOpts = values.options;
	if (!oldOpts || !newOpts || newOpts.$shared) {
		return;
	}
	if (oldOpts.$shared) {
		target.options = helpers.extend({}, oldOpts, newOpts, {$shared: false});
	} else {
		helpers.extend(oldOpts, newOpts);
	}
	delete values.options;
}

class Animations {
	constructor(chart, animations) {
		this._chart = chart;
		this._properties = new Map();
		this.configure(animations);
	}

	configure(animations) {
		const animatedProps = this._properties;
		const animDefaults = Object.fromEntries(Object.entries(animations).filter(({1: value}) => !helpers.isObject(value)));

		for (let [key, cfg] of Object.entries(animations)) {
			if (!helpers.isObject(cfg)) {
				continue;
			}
			for (let prop of cfg.properties || [key]) {
				// Can have only one config per animation.
				if (!animatedProps.has(prop)) {
					animatedProps.set(prop, helpers.extend({}, animDefaults, cfg));
				} else if (prop === key) {
					// Single property targetting config wins over multi-targetting.
					animatedProps.set(prop, helpers.extend({}, animatedProps.get(prop), cfg));
				}
			}
		}
	}

	/**
	 * Utility to handle animation of `options`.
	 * This should not be called, when animating $shared options to $shared new options.
	 * @private
	 * @todo if new options are $shared, target.options should be replaced with those new shared
	 *  options after all animations have completed
	 */
	_animateOptions(target, values) {
		const newOptions = values.options;
		let animations = [];

		if (!newOptions) {
			return animations;
		}
		let options = target.options;
		if (options) {
			if (options.$shared) {
				// If the current / old options are $shared, meaning other elements are
				// using the same options, we need to clone to become unique.
				target.options = options = helpers.extend({}, options, {$shared: false, $animations: {}});
			}
			animations = this._createAnimations(options, newOptions);
		} else {
			target.options = newOptions;
		}
		return animations;
	}

	/**
	 * @private
	 */
	_createAnimations(target, values) {
		const animatedProps = this._properties;
		const animations = [];
		const running = target.$animations || (target.$animations = {});
		const props = Object.keys(values);
		let i;

		for (i = props.length - 1; i >= 0; --i) {
			let prop = props[i];
			if (prop.charAt(0) === '$') {
				continue;
			}

			if (prop === 'options') {
				animations.push.apply(animations, this._animateOptions(target, values));
				continue;
			}
			let value = values[prop];

			const cfg = animatedProps.get(prop);
			if (!cfg || !cfg.duration) {
				// not animated, set directly to new value
				target[prop] = value;
				continue;
			}

			let animation = running[prop];
			if (animation) {
				animation.cancel();
			}
			running[prop] = animation = new Animation(cfg, target, prop, value);
			animations.push(animation);
		}
		return animations;
	}


	/**
	 * Update `target` properties to new values, using configured animations
	 * @param {object} target - object to update
	 * @param {object} values - new target properties
	 * @returns {boolean|undefined} - `true` if animations were started
	 **/
	update(target, values) {
		if (this._properties.size === 0) {
			// Nothing is animated, just apply the new values.
			// Options can be shared, need to account for that.
			copyOptions(target, values);
			// copyOptions removes the `options` from `values`,
			// unless it can be directly assigned.
			helpers.extend(target, values);
			return;
		}

		const animations = this._createAnimations(target, values);

		if (animations.length) {
			Animator.add(this._chart, animations);
			return true;
		}
	}
}

module.exports = Animations;
