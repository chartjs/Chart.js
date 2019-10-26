'use strict';

var helpers = require('../helpers/helpers.core');

var defaults = {
	/**
	 * @private
	 */
	_set: function(scope, values) {
		return helpers.merge(this[scope] || (this[scope] = {}), values);
	}
};

// TODO(v3): remove 'global' from namespace.  all default are global and
// there's inconsistency around which options are under 'global'
defaults._set('global', {
	defaultColor: 'rgba(0,0,0,0.1)',
	defaultFontColor: '#666',
	defaultFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
	defaultFontSize: 12,
	defaultFontStyle: 'normal',
	defaultLineHeight: 1.2,
	showLines: true
});

module.exports = defaults;
