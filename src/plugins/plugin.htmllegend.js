'use strict';

var defaults = require('../core/core.defaults');
var Element = require('../core/core.element');
var helpers = require('../helpers/index');

// don't set defaults to preserve legacy behaviour of legendCallback

/**
 * Returns value at the given `index` in object if defined, else returns `defaultValue`.
 * @param {Object} value - The object to lookup for value at `index`.
 * @param {String} / {Number} index - The index in `value` to lookup for value.
 * @param {*} defaultValue - The value to return if `value[index]` is undefined.
 * @returns {*}
 */
function optionOrDefault(value, index, defaultValue) {
	return helpers.isObject(value) && value.hasOwnProperty(index) ? value[index] : defaultValue;
}

/**
 * Returns evaluated string (replace '{variable}' with options[variable] value)
 * @param {String} str - template string containing '{variable}' parameters
 * @param {Object} options - object containing 'variable: "replacement string"' entries
 * @return {Object} The evaluated string
 */
function evalString(str, options) {
	return typeof str === 'string' && helpers.isObject(options)
		? str.replace(/{(\w+)}/g, function(match, prop) {
			return (options && options.hasOwnProperty(prop)) ? options[prop] : prop;
		})
		: str;
}

/**
 * Returns formatted DOM node
 * @param {String}/{Object} tag - tag string or object containing the tag and attributes
 * @param {String}/{Object} attributes - textContent string or default element attributes
 * @return {Object} The DOM node
 */
var createElement = function(type, attributes, replace) {
	var node;

	if (!helpers.isObject(attributes)) {
		attributes = {textContent: attributes};
	}

	if (helpers.isObject(type)) {
		attributes = helpers.merge(attributes, type.attributes);
		type = optionOrDefault(type, 'tag', 'div');
	}

	if (type === 'textnode') {
		var textContent = optionOrDefault(attributes, 'textContent', '');
		node = document.createTextNode(textContent);
	} else {
		node = document.createElement(type);

		helpers.each(attributes, function(value, key) {
			// allow nested properties like node.style
			if (helpers.isObject(value)) {
				helpers.each(value, function(subValue, subKey) {
					node[key][subKey] = subValue;
				});
			} else {
				value = evalString(value, replace);
				switch (key) {
				case 'classList':
					if (helpers.isArray(value)) {
						helpers.each(value, function(className) {
							className = evalString(className, replace);
							node.classList.add(className);
						});
					} else {
						node.classList.add(value);
					}
					break;
				default:
					node[key] = value;
				}
			}
		});
	}

	return node;
};

module.exports = function(Chart) {
	Chart.HTMLLegend = Element.extend({
		/**
		 * Returns HTML formatted string or DOM node of the legend
		 * @param {Object} chart - The chart object.
		 * @param {Object} options - The configuration options.
		 * @param {Array} - The optional arguments array passed by user (ignored by default).
		 * @returns {String/DOM node} HTML legend string/node.
		 */
		create: function(chart, options) {
			// in legacy mode:
			// - generate html output
			// - do not set the box border (only box background-color)
			// - use default container: UL, items: LI, box: SPAN and label tags: TEXTNODE
			// - set container class '{charId}-legend'
			// - do not set 'hidden'-class
			var legacy = options === undefined;
			var output = optionOrDefault(options, 'output', legacy ? 'HTML' : 'DOM');
			var nodes = optionOrDefault(options, 'nodes', {});
			var containerTag = optionOrDefault(nodes, 'container', 'ul');
			var itemsTag = optionOrDefault(nodes, 'items', 'li');
			var boxTag = optionOrDefault(nodes, 'box', 'span');
			var labelTag = optionOrDefault(nodes, 'label', 'textnode');
			var replaceOpts = optionOrDefault(options, 'replace', {});

			replaceOpts.chartId = chart.id;

			// add `{chartId}-legend` class for legacy purposes
			var container = createElement(containerTag, {classList: '{chartId}-legend'}, replaceOpts);

			// allow for hiddenClass not to be set on hidden items setting empty option
			var hiddenClass = optionOrDefault(options, 'hiddenClass', legacy ? '' : 'hidden');
			var items = chart.legend.legendItems;
			helpers.each(items, function(item, id) {
				var globalDefault = defaults.global;
				var lineDefault = globalDefault.elements.line;
				var valueOrDefault = helpers.valueOrDefault;

				// add {identifier} replacement for legend items
				replaceOpts.id = id;
				replaceOpts.datasetIndex = item.datasetIndex; // might be undefined
				replaceOpts.index = item.index; // might be undefined

				var element = createElement(itemsTag, {}, replaceOpts);

				if (item.hidden && hiddenClass) {
					element.classList.add(hiddenClass);
				}

				var fillStyle = valueOrDefault(item.fillStyle, globalDefault.defaultColor);
				var lineDash = valueOrDefault(item.lineDash, lineDefault.borderDash);
				var lineWidth = valueOrDefault(item.lineWidth, lineDefault.borderWidth);
				var strokeStyle = valueOrDefault(item.strokeStyle, globalDefault.defaultColor);

				var boxAttributes = {
					style: {
						backgroundColor: fillStyle
					}
				};
				if (!legacy && strokeStyle && lineWidth > 0) {
					boxAttributes.style.borderStyle = (lineDash.length > 0) ? 'dotted' : 'solid';
					boxAttributes.style.borderColor = strokeStyle;
					boxAttributes.style.borderWidth = lineWidth + 'px';
				}
				var box = createElement(boxTag, boxAttributes, replaceOpts);
				element.appendChild(box);

				var label = createElement(labelTag, item.text, replaceOpts);
				element.appendChild(label);

				container.appendChild(element);
			});

			if (output === 'HTML') {
				container = container.outerHTML; // output html by default for legacy purposes
			}
			return container;
		},

		/**
		 * Returns a HTML legend (wrapper for generateLegend)
		 * @param {DOM node/*} defaultTarget - The defaultTarget or optional parameter if not DOM node.
		 * @param {*} optional - The optional arguments from `generateLegend()`, to be passed to callback function.
		 * @returns {String/DOM node} HTML legend string/node.
		 */
		generate: function(defaultTarget) {
			var options = this.chart.options.htmllegend;
			var legendFn;

			if (typeof this.chart.options.legendCallback === 'function') {
				legendFn = this.options.legendCallback;
				console.warn('options.legendCallback is deprecated, replace by options.htmllegend or options.htmllegend.callback');
			} else {
				legendFn = this.create;
				if (typeof options === 'function') {
					legendFn = options;
					options = undefined;
				} else if (options && typeof options.callback === 'function') {
					legendFn = options.callback;
				}
			}

			// remove default target from optional arguments
			var args = defaultTarget && defaultTarget.nodeType === Node.ELEMENT_NODE
				? Array.prototype.slice.call(arguments, 1)
				: Array.prototype.slice.call(arguments);
			var legend = legendFn.call(this, this.chart, options, args);

			// attach legend to DOM and bind event listeners
			var legendNode = legend;
			var target = optionOrDefault(options, 'target', defaultTarget);
			if (target && target.nodeType === Node.ELEMENT_NODE) {
				if (typeof legend === 'string') {
					target.innerHTML = legend;
					legendNode = target.childNodes[0];
				} else {
					target.appendChild(legend);
				}

			}

			// save a link to the legend to fire afterUpdate event
			if (legendNode.nodeType === Node.ELEMENT_NODE) {
				var listeners = optionOrDefault(options, 'listeners');
				this.bindEventListeners(legendNode, listeners);

				this.chart.htmllegend.container = legendNode;
			}

			return legend;
		},

		/**
		 * Binds event listeners to legend
		 * @param {Object} node - The DOM node
		 * @param {Object} node - The listeners object
		 * @returns undefined
		 */
		bindEventListeners: function(node, listeners) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				helpers.each(listeners, function(listener, type) {
					var options = optionOrDefault(listener, 'options', false);
					listener = optionOrDefault(listener, 'listener', listener);

					node.addEventListener(type, listener, options);
				});
			}
		}
	});


	function createNewLegendAndAttach(chart, legendOpts) {
		var htmllegend = new Chart.HTMLLegend({
			options: legendOpts,
			chart: chart,
			_construct: true // temporary flag to auto-generate legend
		});

		chart.htmllegend = htmllegend;
	}

	return {
		id: 'htmllegend',

		beforeInit: function(chart) {
			// extends default legend
			if (chart.legend) {
				var legendOpts = chart.options.htmllegend;
				createNewLegendAndAttach(chart, legendOpts);
			}
		},

		beforeUpdate: function(chart) {
			if (chart.legend) {
				var legendOpts = chart.options.htmllegend;
				var htmllegend = chart.htmllegend;

				helpers.mergeIf(legendOpts, defaults.global.htmllegend);

				if (htmllegend) {
					htmllegend.options = legendOpts;
				} else {
					createNewLegendAndAttach(chart, legendOpts);
				}
			} else if (htmllegend) {
				delete chart.htmllegend;
			}
		},

		afterUpdate: function(chart) {
			var legendOpts = chart.options.htmllegend;
			var htmllegend = chart.htmllegend;
			// do not fire event when not loaded or in legacy mode
			if (!htmllegend || !legendOpts) {
				return;
			}

			if (htmllegend.hasOwnProperty('_construct')) {
				delete htmllegend._construct; // remove flag to prevent misuse

				var target = optionOrDefault(legendOpts, 'target');
				if (chart.legend && target) {
					htmllegend.generate(); // auto-generate and attach html legend
				}
			} else {
				// trigger afterUpdate on html legend in case some items have been hidden
				var container = htmllegend.container;
				if (container) {
					var event = new Event('afterUpdate');
					container.dispatchEvent(event);
				}
			}
		},
	};
};
