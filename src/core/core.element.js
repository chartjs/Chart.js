(function() {

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart,
		helpers = Chart.helpers;

	Chart.elements = {};

	Chart.Element = function(configuration) {
		helpers.extend(this, configuration);
		this.initialize.apply(this, arguments);
	};
	helpers.extend(Chart.Element.prototype, {
		initialize: function() {},
		pivot: function() {
			if (!this._view) {
				this._view = helpers.clone(this._model);
			}
			this._start = helpers.clone(this._view);
			return this;
		},
		transition: function(ease) {
			if (!this._view) {
				this._view = helpers.clone(this._model);
			}
			if (!this._start) {
				this.pivot();
			}

			helpers.each(this._model, function(value, key) {

				if (key[0] === '_' || !this._model.hasOwnProperty(key)) {
					// Only non-underscored properties
				}

				// Init if doesn't exist
				else if (!this._view[key]) {
					if (typeof value === 'number') {
						this._view[key] = value * ease;
					} else {
						this._view[key] = value || null;
					}
				}

				// No unnecessary computations
				else if (this._model[key] === this._view[key]) {
					// It's the same! Woohoo!
				}

				// Color transitions if possible
				else if (typeof value === 'string') {
					try {
						var color = helpers.color(this._start[key]).mix(helpers.color(this._model[key]), ease);
						this._view[key] = color.rgbString();
					} catch (err) {
						this._view[key] = value;
					}
				}
				// Number transitions
				else if (typeof value === 'number') {
					var startVal = this._start[key] !== undefined ? this._start[key] : 0;
					this._view[key] = ((this._model[key] - startVal) * ease) + startVal;
				}
				// Everything else
				else {
					this._view[key] = value;
				}

			}, this);

			if (ease === 1) {
				delete this._start;
			}
			return this;
		},
		tooltipPosition: function() {
			return {
				x: this._model.x,
				y: this._model.y
			};
		},
		hasValue: function() {
			return helpers.isNumber(this._model.x) && helpers.isNumber(this._model.y);
		}
	});

	Chart.Element.extend = helpers.inherits;

}).call(this);
