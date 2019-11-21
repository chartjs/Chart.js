'use strict';

const color = require('chartjs-color');
const helpers = require('../helpers/index');

function interpolate(start, view, model, ease) {
	var keys = Object.keys(model);
	var i, ilen, key, actual, origin, target, type, c0, c1;

	for (i = 0, ilen = keys.length; i < ilen; ++i) {
		key = keys[i];

		target = model[key];

		// if a value is added to the model after pivot() has been called, the view
		// doesn't contain it, so let's initialize the view to the target value.
		if (!Object.prototype.hasOwnProperty.call(view, key)) {
			view[key] = target;
		}

		actual = view[key];

		if (actual === target || key[0] === '_') {
			continue;
		}

		if (!Object.prototype.hasOwnProperty.call(start, key)) {
			start[key] = actual;
		}

		origin = start[key];

		type = typeof target;

		if (type === typeof origin) {
			if (type === 'string') {
				c0 = color(origin);
				if (c0.valid) {
					c1 = color(target);
					if (c1.valid) {
						view[key] = c1.mix(c0, ease).rgbString();
						continue;
					}
				}
			} else if (helpers.isFinite(origin) && helpers.isFinite(target)) {
				view[key] = origin + (target - origin) * ease;
				continue;
			}
		}

		view[key] = target;
	}
}

class Element {

	constructor(configuration) {
		helpers.extend(this, configuration);

		// this.hidden = false; we assume Element has an attribute called hidden, but do not initialize to save memory
	}

	pivot(animationsDisabled) {
		var me = this;
		if (animationsDisabled) {
			me._view = me._model;
			return me;
		}

		if (!me._view) {
			me._view = helpers.extend({}, me._model);
		}
		me._start = {};
		return me;
	}

	transition(ease) {
		var me = this;
		var model = me._model;
		var start = me._start;
		var view = me._view;

		// No animation -> No Transition
		if (!model || ease === 1) {
			// _model has to be cloned to _view
			// Otherwise, when _model properties are set on hover, _view.* is also set to the same value, and hover animation doesn't occur
			me._view = helpers.extend({}, model);
			me._start = null;
			return me;
		}

		if (!view) {
			view = me._view = {};
		}

		if (!start) {
			start = me._start = {};
		}

		interpolate(start, view, model, ease);

		return me;
	}

	tooltipPosition() {
		return {
			x: this._model.x,
			y: this._model.y
		};
	}

	hasValue() {
		return helpers.isNumber(this._model.x) && helpers.isNumber(this._model.y);
	}
}

Element.extend = helpers.inherits;

module.exports = Element;
