'use strict';

var helpers = require('../helpers/index');
var scaleService = require('../core/core.scaleService');

helpers.configMerge = helpers.configMerge || function(/* objects ... */) {
	return helpers.merge(helpers.clone(arguments[0]), [].slice.call(arguments, 1), {
		merger: function(key, target, source, options) {
			var tval = target[key] || {};
			var sval = source[key];

			if (key === 'scales') {
				// scale config merging is complex. Add our own function here for that
				target[key] = helpers.scaleMerge(tval, sval);
			} else if (key === 'scale') {
				// used in polar area & radar charts since there is only one scale
				target[key] = helpers.merge(tval, [scaleService.getScaleDefaults(sval.type), sval]);
			} else {
				helpers._merger(key, target, source, options);
			}
		}
	});
};

helpers.scaleMerge = helpers.scaleMerge || function(/* objects ... */) {
	return helpers.merge(helpers.clone(arguments[0]), [].slice.call(arguments, 1), {
		merger: function(key, target, source, options) {
			if (key === 'xAxes' || key === 'yAxes') {
				var slen = source[key].length;
				var i, type, scale;

				if (!target[key]) {
					target[key] = [];
				}

				for (i = 0; i < slen; ++i) {
					scale = source[key][i];
					type = helpers.valueOrDefault(scale.type, key === 'xAxes' ? 'category' : 'linear');

					if (i >= target[key].length) {
						target[key].push({});
					}

					if (!target[key][i].type || (scale.type && scale.type !== target[key][i].type)) {
						// new/untyped scale or type changed: let's apply the new defaults
						// then merge source scale to correctly overwrite the defaults.
						helpers.merge(target[key][i], [scaleService.getScaleDefaults(type), scale]);
					} else {
						// scales type are the same
						helpers.merge(target[key][i], scale);
					}
				}
			} else {
				helpers._merger(key, target, source, options);
			}
		}
	});
};

module.exports = helpers;
