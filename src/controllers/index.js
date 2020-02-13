import bar from './controller.bar';
import bubble from './controller.bubble';
import doughnut from './controller.doughnut';
import horizontalBar from './controller.horizontalBar';
import line from './controller.line';
import polarArea from './controller.polarArea';
import pie from './controller.pie';
import radar from './controller.radar';
import scatter from './controller.scatter';

// NOTE export a map in which the key represents the controller type, not
// the class, and so must be CamelCase in order to be correctly retrieved
// by the controller in core.controller.js (`controllers[meta.type]`).

export default {
	bar,
	bubble,
	doughnut,
	horizontalBar,
	line,
	polarArea,
	pie,
	radar,
	scatter
};
