'use strict';

var bar = require('./controller.bar');
var bubble = require('./controller.bubble');
var doughnut = require('./controller.doughnut');
var horizontalBar = require('./controller.horizontalBar');
var line = require('./controller.line');
var polarArea = require('./controller.polarArea');
var pie = require('./controller.pie');
var radar = require('./controller.radar');
var scatter = require('./controller.scatter');

// NOTE export a map in which the key represents the controller type, not
// the class, and so must be CamelCase in order to be correctly retrieved
// by the controller in core.controller.js (`controllers[meta.type]`).

module.exports = {
	bar: bar,
	bubble: bubble,
	doughnut: doughnut,
	horizontalBar: horizontalBar,
	line: line,
	polarArea: polarArea,
	pie: pie,
	radar: radar,
	scatter: scatter
};
