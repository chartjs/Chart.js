'use strict';

// NOTE export a map in which the key represents the controller type, not
// the class, and so must be CamelCase in order to be correctly retrieved
// by the controller in core.controller.js (`controllers[meta.type]`).

/* eslint-disable global-require */
module.exports = {
	bar: require('./controller.bar'),
	bubble: require('./controller.bubble'),
	doughnut: require('./controller.doughnut'),
	horizontalBar: require('./controller.horizontalBar'),
	line: require('./controller.line'),
	polarArea: require('./controller.polarArea'),
	pie: require('./controller.pie'),
	radar: require('./controller.radar'),
	scatter: require('./controller.scatter')
};
