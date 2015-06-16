/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 2.0.0-alpha
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


(function() {

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart;

	//Occupy the global variable of Chart, and create a simple base class
	var Chart = function(context, config) {
		var chart = this;
		this.config = config;

		// Support a jQuery'd canvas element
		if (context.length && context[0].getContext) {
			context = context[0];
		}

		// Support a canvas domnode
		if (context.getContext) {
			context = context.getContext("2d");
		}

		this.canvas = context.canvas;

		this.ctx = context;

		//Variables global to the chart
		var computeDimension = function(element, dimension) {
			if (element['offset' + dimension]) {
				return element['offset' + dimension];
			} else {
				return document.defaultView.getComputedStyle(element).getPropertyValue(dimension);
			}
		};

		var width = this.width = computeDimension(context.canvas, 'Width') || context.canvas.width;
		var height = this.height = computeDimension(context.canvas, 'Height') || context.canvas.height;

		// Firefox requires this to work correctly
		context.canvas.width = width;
		context.canvas.height = height;

		width = this.width = context.canvas.width;
		height = this.height = context.canvas.height;
		this.aspectRatio = this.width / this.height;
		//High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
		Chart.helpers.retinaScale(this);

		if (config) {
			this.controller = new Chart.Controller(this);
			return this.controller;
		}

		return this;

	};

	//Globally expose the defaults to allow for user updating/changing
	Chart.defaults = {
		global: {
			responsive: true,
			responsiveAnimationDuration: 0,
			maintainAspectRatio: true,
			events: ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"],
			hover: {
				onHover: null,
				mode: 'single',
				animationDuration: 400,
			},
			onClick: null,
			defaultColor: 'rgba(0,0,0,0.1)',

			// Element defaults defined in element extensions
			elements: {}

		},
	};

	if (typeof amd !== 'undefined') {
		define(function() {
			return Chart;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = Chart;
	}

	root.Chart = Chart;

	Chart.noConflict = function() {
		root.Chart = previous;
		return Chart;
	};

}).call(this);

(function() {

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart;

	//Global Chart helpers object for utility methods and classes
	var helpers = Chart.helpers = {};

	//-- Basic js utility methods
	var each = helpers.each = function(loopable, callback, self, reverse) {
			var additionalArgs = Array.prototype.slice.call(arguments, 3);
			// Check to see if null or undefined firstly.
			if (loopable) {
				if (loopable.length === +loopable.length) {
					var i;
					if (reverse) {
						for (i = loopable.length - 1; i >= 0; i--) {
							callback.apply(self, [loopable[i], i].concat(additionalArgs));
						}
					} else {
						for (i = 0; i < loopable.length; i++) {
							callback.apply(self, [loopable[i], i].concat(additionalArgs));
						}
					}
				} else {
					for (var item in loopable) {
						callback.apply(self, [loopable[item], item].concat(additionalArgs));
					}
				}
			}
		},
		clone = helpers.clone = function(obj) {
			var objClone = {};
			each(obj, function(value, key) {
				if (obj.hasOwnProperty(key)) {
					if (helpers.isArray(value)) {
						objClone[key] = value.slice(0);
					} else if (typeof value === 'object' && value !== null) {
						objClone[key] = clone(value);
					} else {
						objClone[key] = value;
					}
				}
			});
			return objClone;
		},
		extend = helpers.extend = function(base) {
			each(Array.prototype.slice.call(arguments, 1), function(extensionObject) {
				each(extensionObject, function(value, key) {
					if (extensionObject.hasOwnProperty(key)) {
						base[key] = value;
					}
				});
			});
			return base;
		},
		merge = helpers.merge = function(base, master) {
			//Merge properties in left object over to a shallow clone of object right.
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift({});
			return extend.apply(null, args);
		},
		// Need a special merge function to chart configs since they are now grouped
		configMerge = helpers.configMerge = function(_base) {
			var base = clone(_base);
			helpers.each(Array.prototype.slice.call(arguments, 1), function(extension) {
				helpers.each(extension, function(value, key) {
					if (extension.hasOwnProperty(key)) {
						if (key === 'scales') {
							// Scale config merging is complex. Add out own function here for that
							base[key] = helpers.scaleMerge(base.hasOwnProperty(key) ? base[key] : {}, value);

						} else if (key === 'scale') {
							// Used in polar area & radar charts since there is only one scale
							base[key] = helpers.configMerge(base.hasOwnProperty(key) ? base[key] : {}, Chart.scaleService.getScaleDefaults(value.type), value);
						} else if (base.hasOwnProperty(key) && helpers.isArray(base[key]) && helpers.isArray(value)) {
							// In this case we have an array of objects replacing another array. Rather than doing a strict replace,
							// merge. This allows easy scale option merging
							var baseArray = base[key];

							helpers.each(value, function(valueObj, index) {

								if (index < baseArray.length) {
									baseArray[index] = helpers.configMerge(baseArray[index], valueObj);
								} else {
									baseArray.push(valueObj); // nothing to merge
								}
							});

						} else if (base.hasOwnProperty(key) && typeof base[key] == "object" && base[key] !== null && typeof value == "object") {
							// If we are overwriting an object with an object, do a merge of the properties.
							base[key] = helpers.configMerge(base[key], value);

						} else {
							// can just overwrite the value in this case
							base[key] = value;
						}
					}
				});
			});

			return base;
		},
		scaleMerge = helpers.scaleMerge = function(_base, extension) {
			var base = clone(_base);

			helpers.each(extension, function(value, key) {
				if (extension.hasOwnProperty(key)) {
					if (key === 'xAxes' || key === 'yAxes') {
						// These properties are arrays of items
						if (base.hasOwnProperty(key)) {
							helpers.each(value, function(valueObj, index) {
								if (index >= base[key].length || !base[key][index].type) {
									base[key].push(helpers.configMerge(valueObj.type ? Chart.scaleService.getScaleDefaults(valueObj.type) : {}, valueObj));
								} else if (valueObj.type !== base[key][index].type) {
									// Type changed. Bring in the new defaults before we bring in valueObj so that valueObj can override the correct scale defaults
									base[key][index] = helpers.configMerge(base[key][index], valueObj.type ? Chart.scaleService.getScaleDefaults(valueObj.type) : {}, valueObj)
								} else {
									// Type is the same
									base[key][index] = helpers.configMerge(base[key][index], valueObj);
								}
							});
						} else {
							base[key] = [];
							helpers.each(value, function(valueObj) {
								base[key].push(helpers.configMerge(valueObj.type ? Chart.scaleService.getScaleDefaults(valueObj.type) : {}, valueObj));
							});
						}
					} else if (base.hasOwnProperty(key) && typeof base[key] == "object" && base[key] !== null && typeof value == "object") {
						// If we are overwriting an object with an object, do a merge of the properties.
						base[key] = helpers.configMerge(base[key], value);

					} else {
						// can just overwrite the value in this case
						base[key] = value;
					}
				}
			});

			return base;
		},
		getValueAtIndexOrDefault = helpers.getValueAtIndexOrDefault = function(value, index, defaultValue) {
			if (!value) {
				return defaultValue;
			}

			if (helpers.isArray(value) && index < value.length) {
				return value[index];
			}

			return value;
		},
		indexOf = helpers.indexOf = function(arrayToSearch, item) {
			if (Array.prototype.indexOf) {
				return arrayToSearch.indexOf(item);
			} else {
				for (var i = 0; i < arrayToSearch.length; i++) {
					if (arrayToSearch[i] === item) return i;
				}
				return -1;
			}
		},
		where = helpers.where = function(collection, filterCallback) {
			var filtered = [];

			helpers.each(collection, function(item) {
				if (filterCallback(item)) {
					filtered.push(item);
				}
			});

			return filtered;
		},
		findNextWhere = helpers.findNextWhere = function(arrayToSearch, filterCallback, startIndex) {
			// Default to start of the array
			if (!startIndex) {
				startIndex = -1;
			}
			for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
				var currentItem = arrayToSearch[i];
				if (filterCallback(currentItem)) {
					return currentItem;
				}
			}
		},
		findPreviousWhere = helpers.findPreviousWhere = function(arrayToSearch, filterCallback, startIndex) {
			// Default to end of the array
			if (!startIndex) {
				startIndex = arrayToSearch.length;
			}
			for (var i = startIndex - 1; i >= 0; i--) {
				var currentItem = arrayToSearch[i];
				if (filterCallback(currentItem)) {
					return currentItem;
				}
			}
		},
		inherits = helpers.inherits = function(extensions) {
			//Basic javascript inheritance based on the model created in Backbone.js
			var parent = this;
			var ChartElement = (extensions && extensions.hasOwnProperty("constructor")) ? extensions.constructor : function() {
				return parent.apply(this, arguments);
			};

			var Surrogate = function() {
				this.constructor = ChartElement;
			};
			Surrogate.prototype = parent.prototype;
			ChartElement.prototype = new Surrogate();

			ChartElement.extend = inherits;

			if (extensions) extend(ChartElement.prototype, extensions);

			ChartElement.__super__ = parent.prototype;

			return ChartElement;
		},
		noop = helpers.noop = function() {},
		uid = helpers.uid = (function() {
			var id = 0;
			return function() {
				return "chart-" + id++;
			};
		})(),
		warn = helpers.warn = function(str) {
			//Method for warning of errors
			if (window.console && typeof window.console.warn === "function") console.warn(str);
		},
		amd = helpers.amd = (typeof define === 'function' && define.amd),
		//-- Math methods
		isNumber = helpers.isNumber = function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		},
		max = helpers.max = function(array) {
			return Math.max.apply(Math, array);
		},
		min = helpers.min = function(array) {
			return Math.min.apply(Math, array);
		},
		sign = helpers.sign = function(x) {
			if (Math.sign) {
				return Math.sign(x);
			} else {
				x = +x; // convert to a number
				if (x === 0 || isNaN(x)) {
					return x;
				}
				return x > 0 ? 1 : -1;
			}
		},
		log10 = helpers.log10 = function(x) {
			if (Math.log10) {
				return Math.log10(x)
			} else {
				return Math.log(x) / Math.LN10;
			}
		},
		cap = helpers.cap = function(valueToCap, maxValue, minValue) {
			if (isNumber(maxValue)) {
				if (valueToCap > maxValue) {
					return maxValue;
				}
			} else if (isNumber(minValue)) {
				if (valueToCap < minValue) {
					return minValue;
				}
			}
			return valueToCap;
		},
		getDecimalPlaces = helpers.getDecimalPlaces = function(num) {
			if (num % 1 !== 0 && isNumber(num)) {
				var s = num.toString();
				if (s.indexOf("e-") < 0) {
					// no exponent, e.g. 0.01
					return s.split(".")[1].length;
				} else if (s.indexOf(".") < 0) {
					// no decimal point, e.g. 1e-9
					return parseInt(s.split("e-")[1]);
				} else {
					// exponent and decimal point, e.g. 1.23e-9
					var parts = s.split(".")[1].split("e-");
					return parts[0].length + parseInt(parts[1]);
				}
			} else {
				return 0;
			}
		},
		toRadians = helpers.toRadians = function(degrees) {
			return degrees * (Math.PI / 180);
		},
		toDegrees = helpers.toDegrees = function(radians) {
			return radians * (180 / Math.PI);
		},
		// Gets the angle from vertical upright to the point about a centre.
		getAngleFromPoint = helpers.getAngleFromPoint = function(centrePoint, anglePoint) {
			var distanceFromXCenter = anglePoint.x - centrePoint.x,
				distanceFromYCenter = anglePoint.y - centrePoint.y,
				radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);

			var angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);

			if (angle < (-0.5 * Math.PI)) {
				angle += 2.0 * Math.PI; // make sure the returned angle is in the range of (-PI/2, 3PI/2]
			}

			return {
				angle: angle,
				distance: radialDistanceFromCenter
			};
		},
		aliasPixel = helpers.aliasPixel = function(pixelWidth) {
			return (pixelWidth % 2 === 0) ? 0 : 0.5;
		},
		splineCurve = helpers.splineCurve = function(FirstPoint, MiddlePoint, AfterPoint, t) {
			//Props to Rob Spencer at scaled innovation for his post on splining between points
			//http://scaledinnovation.com/analytics/splines/aboutSplines.html
			var d01 = Math.sqrt(Math.pow(MiddlePoint.x - FirstPoint.x, 2) + Math.pow(MiddlePoint.y - FirstPoint.y, 2)),
				d12 = Math.sqrt(Math.pow(AfterPoint.x - MiddlePoint.x, 2) + Math.pow(AfterPoint.y - MiddlePoint.y, 2)),
				fa = t * d01 / (d01 + d12), // scaling factor for triangle Ta
				fb = t * d12 / (d01 + d12);
			return {
				previous: {
					x: MiddlePoint.x - fa * (AfterPoint.x - FirstPoint.x),
					y: MiddlePoint.y - fa * (AfterPoint.y - FirstPoint.y)
				},
				next: {
					x: MiddlePoint.x + fb * (AfterPoint.x - FirstPoint.x),
					y: MiddlePoint.y + fb * (AfterPoint.y - FirstPoint.y)
				}
			};
		},
		nextItem = helpers.nextItem = function(collection, index, loop) {
			if (loop) {
				return collection[index + 1] || collection[0];
			}
			return collection[index + 1] || collection[collection.length - 1];
		},
		previousItem = helpers.previousItem = function(collection, index, loop) {
			if (loop) {
				return collection[index - 1] || collection[collection.length - 1];
			}
			return collection[index - 1] || collection[0];
		},
		calculateOrderOfMagnitude = helpers.calculateOrderOfMagnitude = function(val) {
			return Math.floor(Math.log(val) / Math.LN10);
		},
		calculateScaleRange = helpers.calculateScaleRange = function(valuesArray, drawingSize, textSize, startFromZero, integersOnly) {

			//Set a minimum step of two - a point at the top of the graph, and a point at the base
			var minSteps = 2,
				maxSteps = Math.floor(drawingSize / (textSize * 1.5)),
				skipFitting = (minSteps >= maxSteps);

			var maxValue = max(valuesArray),
				minValue = min(valuesArray);

			// We need some degree of seperation here to calculate the scales if all the values are the same
			// Adding/minusing 0.5 will give us a range of 1.
			if (maxValue === minValue) {
				maxValue += 0.5;
				// So we don't end up with a graph with a negative start value if we've said always start from zero
				if (minValue >= 0.5 && !startFromZero) {
					minValue -= 0.5;
				} else {
					// Make up a whole number above the values
					maxValue += 0.5;
				}
			}

			var valueRange = Math.abs(maxValue - minValue),
				rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange),
				graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
				graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
				graphRange = graphMax - graphMin,
				stepValue = Math.pow(10, rangeOrderOfMagnitude),
				numberOfSteps = Math.round(graphRange / stepValue);

			//If we have more space on the graph we'll use it to give more definition to the data
			while ((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
				if (numberOfSteps > maxSteps) {
					stepValue *= 2;
					numberOfSteps = Math.round(graphRange / stepValue);
					// Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
					if (numberOfSteps % 1 !== 0) {
						skipFitting = true;
					}
				}
				//We can fit in double the amount of scale points on the scale
				else {
					//If user has declared ints only, and the step value isn't a decimal
					if (integersOnly && rangeOrderOfMagnitude >= 0) {
						//If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
						if (stepValue / 2 % 1 === 0) {
							stepValue /= 2;
							numberOfSteps = Math.round(graphRange / stepValue);
						}
						//If it would make it a float break out of the loop
						else {
							break;
						}
					}
					//If the scale doesn't have to be an int, make the scale more granular anyway.
					else {
						stepValue /= 2;
						numberOfSteps = Math.round(graphRange / stepValue);
					}

				}
			}

			if (skipFitting) {
				numberOfSteps = minSteps;
				stepValue = graphRange / numberOfSteps;
			}
			return {
				steps: numberOfSteps,
				stepValue: stepValue,
				min: graphMin,
				max: graphMin + (numberOfSteps * stepValue)
			};

		},
		// Implementation of the nice number algorithm used in determining where axis labels will go
		niceNum = helpers.niceNum = function(range, round) {
			var exponent = Math.floor(helpers.log10(range));
			var fraction = range / Math.pow(10, exponent);
			var niceFraction;

			if (round) {
				if (fraction < 1.5) {
					niceFraction = 1;
				} else if (fraction < 3) {
					niceFraction = 2;
				} else if (fraction < 7) {
					niceFraction = 5;
				} else {
					niceFraction = 10;
				}
			} else {
				if (fraction <= 1.0) {
					niceFraction = 1;
				} else if (fraction <= 2) {
					niceFraction = 2;
				} else if (fraction <= 5) {
					niceFraction = 5;
				} else {
					niceFraction = 10;
				}
			}

			return niceFraction * Math.pow(10, exponent);
		},
		/* jshint ignore:start */
		// Blows up jshint errors based on the new Function constructor
		//Templating methods
		//Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
		template = helpers.template = function(templateString, valuesObject) {

			// If templateString is function rather than string-template - call the function for valuesObject

			if (templateString instanceof Function) {
				return templateString(valuesObject);
			}

			var cache = {};

			function tmpl(str, data) {
				// Figure out if we're getting a template, or if we need to
				// load the template - and be sure to cache the result.
				var fn = !/\W/.test(str) ?
					cache[str] = cache[str] :

					// Generate a reusable function that will serve as a template
					// generator (and which will be cached).
					new Function("obj",
						"var p=[],print=function(){p.push.apply(p,arguments);};" +

						// Introduce the data as local variables using with(){}
						"with(obj){p.push('" +

						// Convert the template into pure JavaScript
						str
						.replace(/[\r\t\n]/g, " ")
						.split("<%").join("\t")
						.replace(/((^|%>)[^\t]*)'/g, "$1\r")
						.replace(/\t=(.*?)%>/g, "',$1,'")
						.split("\t").join("');")
						.split("%>").join("p.push('")
						.split("\r").join("\\'") +
						"');}return p.join('');"
					);

				// Provide some basic currying to the user
				return data ? fn(data) : fn;
			}
			return tmpl(templateString, valuesObject);
		},
		/* jshint ignore:end */
		generateLabels = helpers.generateLabels = function(templateString, numberOfSteps, graphMin, stepValue) {
			var labelsArray = new Array(numberOfSteps);
			if (templateString) {
				each(labelsArray, function(val, index) {
					labelsArray[index] = template(templateString, {
						value: (graphMin + (stepValue * (index + 1)))
					});
				});
			}
			return labelsArray;
		},
		//--Animation methods
		//Easing functions adapted from Robert Penner's easing equations
		//http://www.robertpenner.com/easing/
		easingEffects = helpers.easingEffects = {
			linear: function(t) {
				return t;
			},
			easeInQuad: function(t) {
				return t * t;
			},
			easeOutQuad: function(t) {
				return -1 * t * (t - 2);
			},
			easeInOutQuad: function(t) {
				if ((t /= 1 / 2) < 1) {
					return 1 / 2 * t * t;
				}
				return -1 / 2 * ((--t) * (t - 2) - 1);
			},
			easeInCubic: function(t) {
				return t * t * t;
			},
			easeOutCubic: function(t) {
				return 1 * ((t = t / 1 - 1) * t * t + 1);
			},
			easeInOutCubic: function(t) {
				if ((t /= 1 / 2) < 1) {
					return 1 / 2 * t * t * t;
				}
				return 1 / 2 * ((t -= 2) * t * t + 2);
			},
			easeInQuart: function(t) {
				return t * t * t * t;
			},
			easeOutQuart: function(t) {
				return -1 * ((t = t / 1 - 1) * t * t * t - 1);
			},
			easeInOutQuart: function(t) {
				if ((t /= 1 / 2) < 1) {
					return 1 / 2 * t * t * t * t;
				}
				return -1 / 2 * ((t -= 2) * t * t * t - 2);
			},
			easeInQuint: function(t) {
				return 1 * (t /= 1) * t * t * t * t;
			},
			easeOutQuint: function(t) {
				return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
			},
			easeInOutQuint: function(t) {
				if ((t /= 1 / 2) < 1) {
					return 1 / 2 * t * t * t * t * t;
				}
				return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
			},
			easeInSine: function(t) {
				return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
			},
			easeOutSine: function(t) {
				return 1 * Math.sin(t / 1 * (Math.PI / 2));
			},
			easeInOutSine: function(t) {
				return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
			},
			easeInExpo: function(t) {
				return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
			},
			easeOutExpo: function(t) {
				return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
			},
			easeInOutExpo: function(t) {
				if (t === 0) {
					return 0;
				}
				if (t === 1) {
					return 1;
				}
				if ((t /= 1 / 2) < 1) {
					return 1 / 2 * Math.pow(2, 10 * (t - 1));
				}
				return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
			},
			easeInCirc: function(t) {
				if (t >= 1) {
					return t;
				}
				return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
			},
			easeOutCirc: function(t) {
				return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
			},
			easeInOutCirc: function(t) {
				if ((t /= 1 / 2) < 1) {
					return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
				}
				return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
			},
			easeInElastic: function(t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) {
					return 0;
				}
				if ((t /= 1) == 1) {
					return 1;
				}
				if (!p) {
					p = 1 * 0.3;
				}
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else {
					s = p / (2 * Math.PI) * Math.asin(1 / a);
				}
				return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
			},
			easeOutElastic: function(t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) {
					return 0;
				}
				if ((t /= 1) == 1) {
					return 1;
				}
				if (!p) {
					p = 1 * 0.3;
				}
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else {
					s = p / (2 * Math.PI) * Math.asin(1 / a);
				}
				return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
			},
			easeInOutElastic: function(t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) {
					return 0;
				}
				if ((t /= 1 / 2) == 2) {
					return 1;
				}
				if (!p) {
					p = 1 * (0.3 * 1.5);
				}
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else {
					s = p / (2 * Math.PI) * Math.asin(1 / a);
				}
				if (t < 1) {
					return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
				}
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
			},
			easeInBack: function(t) {
				var s = 1.70158;
				return 1 * (t /= 1) * t * ((s + 1) * t - s);
			},
			easeOutBack: function(t) {
				var s = 1.70158;
				return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
			},
			easeInOutBack: function(t) {
				var s = 1.70158;
				if ((t /= 1 / 2) < 1) {
					return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
				}
				return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
			},
			easeInBounce: function(t) {
				return 1 - easingEffects.easeOutBounce(1 - t);
			},
			easeOutBounce: function(t) {
				if ((t /= 1) < (1 / 2.75)) {
					return 1 * (7.5625 * t * t);
				} else if (t < (2 / 2.75)) {
					return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
				} else if (t < (2.5 / 2.75)) {
					return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
				} else {
					return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
				}
			},
			easeInOutBounce: function(t) {
				if (t < 1 / 2) {
					return easingEffects.easeInBounce(t * 2) * 0.5;
				}
				return easingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
			}
		},
		//Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
		requestAnimFrame = helpers.requestAnimFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(callback) {
					return window.setTimeout(callback, 1000 / 60);
				};
		})(),
		cancelAnimFrame = helpers.cancelAnimFrame = (function() {
			return window.cancelAnimationFrame ||
				window.webkitCancelAnimationFrame ||
				window.mozCancelAnimationFrame ||
				window.oCancelAnimationFrame ||
				window.msCancelAnimationFrame ||
				function(callback) {
					return window.clearTimeout(callback, 1000 / 60);
				};
		})(),
		//-- DOM methods
		getRelativePosition = helpers.getRelativePosition = function(evt) {
			var mouseX, mouseY;
			var e = evt.originalEvent || evt,
				canvas = evt.currentTarget || evt.srcElement,
				boundingRect = canvas.getBoundingClientRect();

			if (e.touches) {
				mouseX = e.touches[0].clientX - boundingRect.left;
				mouseY = e.touches[0].clientY - boundingRect.top;

			} else {
				mouseX = e.clientX - boundingRect.left;
				mouseY = e.clientY - boundingRect.top;
			}

			return {
				x: mouseX,
				y: mouseY
			};

		},
		addEvent = helpers.addEvent = function(node, eventType, method) {
			if (node.addEventListener) {
				node.addEventListener(eventType, method);
			} else if (node.attachEvent) {
				node.attachEvent("on" + eventType, method);
			} else {
				node["on" + eventType] = method;
			}
		},
		removeEvent = helpers.removeEvent = function(node, eventType, handler) {
			if (node.removeEventListener) {
				node.removeEventListener(eventType, handler, false);
			} else if (node.detachEvent) {
				node.detachEvent("on" + eventType, handler);
			} else {
				node["on" + eventType] = noop;
			}
		},
		bindEvents = helpers.bindEvents = function(chartInstance, arrayOfEvents, handler) {
			// Create the events object if it's not already present
			if (!chartInstance.events) chartInstance.events = {};

			each(arrayOfEvents, function(eventName) {
				chartInstance.events[eventName] = function() {
					handler.apply(chartInstance, arguments);
				};
				addEvent(chartInstance.chart.canvas, eventName, chartInstance.events[eventName]);
			});
		},
		unbindEvents = helpers.unbindEvents = function(chartInstance, arrayOfEvents) {
			each(arrayOfEvents, function(handler, eventName) {
				removeEvent(chartInstance.chart.canvas, eventName, handler);
			});
		},
		getMaximumWidth = helpers.getMaximumWidth = function(domNode) {
			var container = domNode.parentNode,
				padding = parseInt(getStyle(container, 'padding-left')) + parseInt(getStyle(container, 'padding-right'));
			// TODO = check cross browser stuff with this.
			return container.clientWidth - padding;
		},
		getMaximumHeight = helpers.getMaximumHeight = function(domNode) {
			var container = domNode.parentNode,
				padding = parseInt(getStyle(container, 'padding-bottom')) + parseInt(getStyle(container, 'padding-top'));
			// TODO = check cross browser stuff with this.
			return container.clientHeight - padding;
		},
		getStyle = helpers.getStyle = function(el, property) {
			return el.currentStyle ?
				el.currentStyle[property] :
				document.defaultView.getComputedStyle(el, null).getPropertyValue(property);
		},
		getMaximumSize = helpers.getMaximumSize = helpers.getMaximumWidth, // legacy support
		retinaScale = helpers.retinaScale = function(chart) {
			var ctx = chart.ctx,
				width = chart.canvas.width,
				height = chart.canvas.height;

			if (window.devicePixelRatio) {
				ctx.canvas.style.width = width + "px";
				ctx.canvas.style.height = height + "px";
				ctx.canvas.height = height * window.devicePixelRatio;
				ctx.canvas.width = width * window.devicePixelRatio;
				ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
			}
		},
		//-- Canvas methods
		clear = helpers.clear = function(chart) {
			chart.ctx.clearRect(0, 0, chart.width, chart.height);
		},
		fontString = helpers.fontString = function(pixelSize, fontStyle, fontFamily) {
			return fontStyle + " " + pixelSize + "px " + fontFamily;
		},
		longestText = helpers.longestText = function(ctx, font, arrayOfStrings) {
			ctx.font = font;
			var longest = 0;
			each(arrayOfStrings, function(string) {
				var textWidth = ctx.measureText(string).width;
				longest = (textWidth > longest) ? textWidth : longest;
			});
			return longest;
		},
		drawRoundedRectangle = helpers.drawRoundedRectangle = function(ctx, x, y, width, height, radius) {
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
		},
		color = helpers.color = function(color) {
			if (!window.Color) {
				console.log('Color.js not found!');
				return color;
			}
			return window.Color(color);
		},
		isArray = helpers.isArray = function(obj) {
			if (!Array.isArray) {
				return Object.prototype.toString.call(arg) === '[object Array]';
			}
			return Array.isArray(obj);
		};

}).call(this);

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

(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.global.animation = {
		duration: 1000,
		easing: "easeOutQuart",
		onProgress: function() {},
		onComplete: function() {},
	};

	Chart.Animation = Chart.Element.extend({
		currentStep: null, // the current animation step
		numSteps: 60, // default number of steps
		easing: "", // the easing to use for this animation
		render: null, // render function used by the animation service

		onAnimationProgress: null, // user specified callback to fire on each step of the animation 
		onAnimationComplete: null, // user specified callback to fire when the animation finishes
	});

	Chart.animationService = {
		frameDuration: 17,
		animations: [],
		dropFrames: 0,
		addAnimation: function(chartInstance, animationObject, duration) {

			if (typeof duration !== 'number' || duration === 0) {
				chartInstance.animating = true;
			}

			for (var index = 0; index < this.animations.length; ++index) {
				if (this.animations[index].chartInstance === chartInstance) {
					// replacing an in progress animation
					this.animations[index].animationObject = animationObject;
					return;
				}
			}

			this.animations.push({
				chartInstance: chartInstance,
				animationObject: animationObject
			});

			// If there are no animations queued, manually kickstart a digest, for lack of a better word
			if (this.animations.length == 1) {
				helpers.requestAnimFrame.call(window, this.digestWrapper);
			}
		},
		// Cancel the animation for a given chart instance
		cancelAnimation: function(chartInstance) {
			var index = helpers.findNextWhere(this.animations, function(animationWrapper) {
				return animationWrapper.chartInstance === chartInstance;
			});

			if (index) {
				this.animations.splice(index, 1);
				chartInstance.animating = false;
			}
		},
		// calls startDigest with the proper context
		digestWrapper: function() {
			Chart.animationService.startDigest.call(Chart.animationService);
		},
		startDigest: function() {

			var startTime = Date.now();
			var framesToDrop = 0;

			if (this.dropFrames > 1) {
				framesToDrop = Math.floor(this.dropFrames);
				this.dropFrames -= framesToDrop;
			}

			for (var i = 0; i < this.animations.length; i++) {

				if (this.animations[i].animationObject.currentStep === null) {
					this.animations[i].animationObject.currentStep = 0;
				}

				this.animations[i].animationObject.currentStep += 1 + framesToDrop;
				if (this.animations[i].animationObject.currentStep > this.animations[i].animationObject.numSteps) {
					this.animations[i].animationObject.currentStep = this.animations[i].animationObject.numSteps;
				}

				this.animations[i].animationObject.render(this.animations[i].chartInstance, this.animations[i].animationObject);

				if (this.animations[i].animationObject.currentStep == this.animations[i].animationObject.numSteps) {
					// executed the last frame. Remove the animation.
					this.animations[i].chartInstance.animating = false;
					this.animations.splice(i, 1);
					// Keep the index in place to offset the splice
					i--;
				}
			}

			var endTime = Date.now();
			var delay = endTime - startTime - this.frameDuration;
			var frameDelay = delay / this.frameDuration;

			if (frameDelay > 1) {
				this.dropFrames += frameDelay;
			}

			// Do we have more stuff to animate?
			if (this.animations.length > 0) {
				helpers.requestAnimFrame.call(window, this.digestWrapper);
			}
		}
	};

}).call(this);

(function() {

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart,
		helpers = Chart.helpers;


	//Create a dictionary of chart types, to allow for extension of existing types
	Chart.types = {};

	//Store a reference to each instance - allowing us to globally resize chart instances on window resize.
	//Destroy method on the chart will remove the instance of the chart from this reference.
	Chart.instances = {};

	// Controllers available for dataset visualization eg. bar, line, slice, etc.
	Chart.controllers = {};

	// The main controller of a chart
	Chart.Controller = function(instance) {

		this.chart = instance;
		this.config = instance.config;
		this.data = this.config.data;
		this.options = this.config.options = helpers.configMerge(Chart.defaults.global, Chart.defaults[this.config.type], this.config.options || {});
		this.id = helpers.uid();

		//Add the chart instance to the global namespace
		Chart.instances[this.id] = this;

		if (this.options.responsive) {
			// Silent resize before chart draws
			this.resize(true);
		}

		this.initialize.call(this);

		return this;
	};

	helpers.extend(Chart.Controller.prototype, {

		initialize: function initialize() {

			// TODO
			// If BeforeInit(this) doesn't return false, proceed

			this.bindEvents();

			// Make sure controllers are built first so that each dataset is bound to an axis before the scales
			// are built
			this.buildControllers();
			this.buildScales();
			this.resetElements();
			this.initToolTip();
			this.update();

			// TODO
			// If AfterInit(this) doesn't return false, proceed

			return this;
		},

		clear: function clear() {
			helpers.clear(this.chart);
			return this;
		},

		stop: function stop() {
			// Stops any current animation loop occuring
			Chart.animationService.cancelAnimation(this);
			return this;
		},

		resize: function resize(silent) {
			this.stop();
			var canvas = this.chart.canvas,
				newWidth = helpers.getMaximumWidth(this.chart.canvas),
				newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : helpers.getMaximumHeight(this.chart.canvas);

			canvas.width = this.chart.width = newWidth;
			canvas.height = this.chart.height = newHeight;

			helpers.retinaScale(this.chart);

			if (!silent) {
				this.update(this.options.responsiveAnimationDuration);
			}

			return this;
		},

		buildScales: function buildScales() {
			// Map of scale ID to scale object so we can lookup later 
			this.scales = {};

			// Build the x axes
			if (this.options.scales) {
				if (this.options.scales.xAxes && this.options.scales.xAxes.length) {
					helpers.each(this.options.scales.xAxes, function(xAxisOptions) {
						var ScaleClass = Chart.scaleService.getScaleConstructor(xAxisOptions.type);
						var scale = new ScaleClass({
							ctx: this.chart.ctx,
							options: xAxisOptions,
							data: this.data,
							id: xAxisOptions.id,
						});

						this.scales[scale.id] = scale;
					}, this);
				}

				if (this.options.scales.yAxes && this.options.scales.yAxes.length) {
					// Build the y axes
					helpers.each(this.options.scales.yAxes, function(yAxisOptions) {
						var ScaleClass = Chart.scaleService.getScaleConstructor(yAxisOptions.type);
						var scale = new ScaleClass({
							ctx: this.chart.ctx,
							options: yAxisOptions,
							data: this.data,
							id: yAxisOptions.id,
						});

						this.scales[scale.id] = scale;
					}, this);
				}
			}
			if (this.options.scale) {
				// Build radial axes
				var ScaleClass = Chart.scaleService.getScaleConstructor(this.options.scale.type);
				var scale = new ScaleClass({
					ctx: this.chart.ctx,
					options: this.options.scale,
					data: this.data,
					chart: this.chart,
				});

				this.scale = scale;
			}

			Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);
		},

		buildControllers: function() {
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				var type = dataset.type || this.config.type;
				if (dataset.controller) {
					dataset.controller.updateIndex(datasetIndex);
					return;
				}
				dataset.controller = new Chart.controllers[type](this, datasetIndex);
			}, this);
		},

		resetElements: function resetElements() {
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				dataset.controller.reset();
			}, this);
		},


		update: function update(animationDuration) {
			// This will loop through any data and do the appropriate element update for the type
			Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				dataset.controller.update();
			}, this);
			this.render(animationDuration);
		},

		render: function render(duration) {

			if (this.options.animation.duration !== 0 || duration) {
				var animation = new Chart.Animation();
				animation.numSteps = (duration || this.options.animation.duration) / 16.66; //60 fps
				animation.easing = this.options.animation.easing;

				// render function
				animation.render = function(chartInstance, animationObject) {
					var easingFunction = helpers.easingEffects[animationObject.easing];
					var stepDecimal = animationObject.currentStep / animationObject.numSteps;
					var easeDecimal = easingFunction(stepDecimal);

					chartInstance.draw(easeDecimal, stepDecimal, animationObject.currentStep);
				};

				// user events
				animation.onAnimationProgress = this.options.onAnimationProgress;
				animation.onAnimationComplete = this.options.onAnimationComplete;

				Chart.animationService.addAnimation(this, animation, duration);
			} else {
				this.draw();
				this.options.onAnimationComplete.call(this);
			}
			return this;
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			this.clear();

			// Draw all the scales
			helpers.each(this.scales, function(scale) {
				scale.draw(this.chartArea);
			}, this);
			if (this.scale) {
				this.scale.draw();
			}

			// Draw each dataset via its respective controller (reversed to support proper line stacking)
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				dataset.controller.draw(ease);
			}, this, true);

			// Finally draw the tooltip
			this.tooltip.transition(easingDecimal).draw();
		},





		// Get the single element that was clicked on
		// @return : An object containing the dataset index and element index of the matching element. Also contains the rectangle that was draw
		getElementAtEvent: function(e) {

			var eventPosition = helpers.getRelativePosition(e);
			var elementsArray = [];

			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				helpers.each(dataset.metaData, function(element, index) {
					if (element.inRange(eventPosition.x, eventPosition.y)) {
						elementsArray.push(element);
						return elementsArray;
					}
				}, this);
			}, this);

			return elementsArray;
		},

		getElementsAtEvent: function(e) {
			var eventPosition = helpers.getRelativePosition(e);
			var elementsArray = [];

			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				helpers.each(dataset.metaData, function(element, index) {
					if (element.inLabelRange(eventPosition.x, eventPosition.y)) {
						elementsArray.push(element);
					}
				}, this);
			}, this);

			return elementsArray;
		},

		getDatasetAtEvent: function(e) {
			var eventPosition = helpers.getRelativePosition(e);
			var elementsArray = [];

			for (var datasetIndex = 0; datasetIndex < this.chart.data.datasets.length; datasetIndex++) {
				for (elementIndex = 0; elementIndex < this.chart.data.datasets[datasetIndex].metaData.length; elementIndex++) {
					if (this.chart.data.datasets[datasetIndex].metaData[elementIndex].inLabelRange(eventPosition.x, eventPosition.y)) {
						helpers.each(this.chart.data.datasets, datasetIterator);
					}
				}
			}

			return elementsArray.length ? elementsArray : [];
		},

		generateLegend: function generateLegend() {
			return template(this.options.legendTemplate, this);
		},

		destroy: function destroy() {
			this.clear();
			helpers.unbindEvents(this, this.events);
			var canvas = this.chart.canvas;

			// Reset canvas height/width attributes starts a fresh with the canvas context
			canvas.width = this.chart.width;
			canvas.height = this.chart.height;

			// < IE9 doesn't support removeProperty
			if (canvas.style.removeProperty) {
				canvas.style.removeProperty('width');
				canvas.style.removeProperty('height');
			} else {
				canvas.style.removeAttribute('width');
				canvas.style.removeAttribute('height');
			}

			delete Chart.instances[this.id];
		},

		toBase64Image: function toBase64Image() {
			return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
		},

		initToolTip: function initToolTip() {
			this.tooltip = new Chart.Tooltip({
				_chart: this.chart,
				_data: this.data,
				_options: this.options,
			}, this);
		},

		bindEvents: function bindEvents() {
			helpers.bindEvents(this, this.options.events, function(evt) {
				this.eventHandler(evt);
			});
		},
		eventHandler: function eventHandler(e) {
			this.lastActive = this.lastActive || [];

			// Find Active Elements
			if (e.type == 'mouseout') {
				this.active = [];
			} else {
				this.active = function() {
					switch (this.options.hover.mode) {
						case 'single':
							return this.getElementAtEvent(e);
						case 'label':
							return this.getElementsAtEvent(e);
						case 'dataset':
							return this.getDatasetAtEvent(e);
						default:
							return e;
					}
				}.call(this);
			}

			// On Hover hook
			if (this.options.hover.onHover) {
				this.options.hover.onHover.call(this, this.active);
			}

			if (e.type == 'mouseup' || e.type == 'click') {
				if (this.options.onClick) {
					this.options.onClick.call(this, e, this.active);
				}
			}

			var dataset;
			var index;
			// Remove styling for last active (even if it may still be active)
			if (this.lastActive.length) {
				switch (this.options.hover.mode) {
					case 'single':
						this.data.datasets[this.lastActive[0]._datasetIndex].controller.removeHoverStyle(this.lastActive[0], this.lastActive[0]._datasetIndex, this.lastActive[0]._index);
						break;
					case 'label':
						for (var i = 0; i < this.lastActive.length; i++) {
							this.data.datasets[this.lastActive[i]._datasetIndex].controller.removeHoverStyle(this.lastActive[i], this.lastActive[i]._datasetIndex, this.lastActive[i]._index);
						}
						break;
					case 'dataset':
						break;
					default:
						// Don't change anything
				}
			}

			// Built in hover styling
			if (this.active.length && this.options.hover.mode) {
				switch (this.options.hover.mode) {
					case 'single':
						this.data.datasets[this.active[0]._datasetIndex].controller.setHoverStyle(this.active[0]);
						break;
					case 'label':
						for (var i = 0; i < this.active.length; i++) {
							this.data.datasets[this.active[i]._datasetIndex].controller.setHoverStyle(this.active[i]);
						}
						break;
					case 'dataset':
						break;
					default:
						// Don't change anything
				}
			}


			// Built in Tooltips
			if (this.options.tooltips.enabled) {

				// The usual updates
				this.tooltip.initialize();

				// Active
				if (this.active.length) {
					this.tooltip._model.opacity = 1;

					helpers.extend(this.tooltip, {
						_active: this.active,
					});

					this.tooltip.update();
				} else {
					// Inactive
					this.tooltip._model.opacity = 0;
				}
			}

			// Hover animations
			this.tooltip.pivot();

			if (!this.animating) {
				var changed;

				helpers.each(this.active, function(element, index) {
					if (element !== this.lastActive[index]) {
						changed = true;
					}
				}, this);

				// If entering, leaving, or changing elements, animate the change via pivot
				if ((!this.lastActive.length && this.active.length) ||
					(this.lastActive.length && !this.active.length) ||
					(this.lastActive.length && this.active.length && changed)) {

					this.stop();
					this.render(this.options.hover.animationDuration);
				}
			}

			// Remember Last Active
			this.lastActive = this.active;
			return this;
		},
	});

}).call(this);

(function() {

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart,
		helpers = Chart.helpers;


	// Attach global event to resize each chart instance when the browser resizes
	helpers.addEvent(window, "resize", (function() {
		// Basic debounce of resize function so it doesn't hurt performance when resizing browser.
		var timeout;
		return function() {
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				helpers.each(Chart.instances, function(instance) {
					// If the responsive flag is set in the chart instance config
					// Cascade the resize event down to the chart.
					if (instance.options.responsive) {
						instance.resize();
					}
				});
			}, 16);
		};
	})());

}).call(this);

(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	// The scale service is used to resize charts along with all of their axes. We make this as
	// a service where scales are registered with their respective charts so that changing the 
	// scales does not require 
	Chart.scaleService = {
		// Scale registration object. Extensions can register new scale types (such as log or DB scales) and then
		// use the new chart options to grab the correct scale
		constructors: {},
		// Use a registration function so that we can move to an ES6 map when we no longer need to support
		// old browsers
		// Scale config defaults
		defaults: {},
		registerScaleType: function(type, scaleConstructor, defaults) {
			this.constructors[type] = scaleConstructor;
			this.defaults[type] = defaults;
		},
		getScaleConstructor: function(type) {
			return this.constructors.hasOwnProperty(type) ? this.constructors[type] : undefined;
		},
		getScaleDefaults: function(type) {
			return this.defaults.hasOwnProperty(type) ? this.defaults[type] : {};
		},
		// The interesting function
		fitScalesForChart: function(chartInstance, width, height) {
			var xPadding = width > 30 ? 5 : 2;
			var yPadding = height > 30 ? 5 : 2;

			if (chartInstance) {
				var leftScales = helpers.where(chartInstance.scales, function(scaleInstance) {
					return scaleInstance.options.position == "left";
				});
				var rightScales = helpers.where(chartInstance.scales, function(scaleInstance) {
					return scaleInstance.options.position == "right";
				});
				var topScales = helpers.where(chartInstance.scales, function(scaleInstance) {
					return scaleInstance.options.position == "top";
				});
				var bottomScales = helpers.where(chartInstance.scales, function(scaleInstance) {
					return scaleInstance.options.position == "bottom";
				});

				// Essentially we now have any number of scales on each of the 4 sides.
				// Our canvas looks like the following.
				// The areas L1 and L2 are the left axes. R1 is the right axis, T1 is the top axis and 
				// B1 is the bottom axis
				// |------------------------------------------------------|
				// |          |             T1                      |     |
				// |----|-----|-------------------------------------|-----|
				// |    |     |                                     |     |
				// | L1 |  L2 |         Chart area                  |  R1 |
				// |    |     |                                     |     |
				// |    |     |                                     |     |
				// |----|-----|-------------------------------------|-----|
				// |          |             B1                      |     |
				// |          |                                     |     |
				// |------------------------------------------------------|

				// What we do to find the best sizing, we do the following
				// 1. Determine the minimum size of the chart area. 
				// 2. Split the remaining width equally between each vertical axis
				// 3. Split the remaining height equally between each horizontal axis
				// 4. Give each scale the maximum size it can be. The scale will return it's minimum size
				// 5. Adjust the sizes of each axis based on it's minimum reported size. 
				// 6. Refit each axis
				// 7. Position each axis in the final location
				// 8. Tell the chart the final location of the chart area

				// Step 1
				var chartWidth = width / 2; // min 50%
				var chartHeight = height / 2; // min 50%

				chartWidth -= (2 * xPadding);
				chartHeight -= (2 * yPadding);


				// Step 2
				var verticalScaleWidth = (width - chartWidth) / (leftScales.length + rightScales.length);

				// Step 3
				var horizontalScaleHeight = (height - chartHeight) / (topScales.length + bottomScales.length);

				// Step 4;
				var minimumScaleSizes = [];

				var verticalScaleMinSizeFunction = function(scaleInstance) {
					var minSize = scaleInstance.fit(verticalScaleWidth, chartHeight);
					minimumScaleSizes.push({
						horizontal: false,
						minSize: minSize,
						scale: scaleInstance,
					});
				};

				var horizontalScaleMinSizeFunction = function(scaleInstance) {
					var minSize = scaleInstance.fit(chartWidth, horizontalScaleHeight);
					minimumScaleSizes.push({
						horizontal: true,
						minSize: minSize,
						scale: scaleInstance,
					});
				};

				// vertical scales
				helpers.each(leftScales, verticalScaleMinSizeFunction);
				helpers.each(rightScales, verticalScaleMinSizeFunction);

				// horizontal scales
				helpers.each(topScales, horizontalScaleMinSizeFunction);
				helpers.each(bottomScales, horizontalScaleMinSizeFunction);

				// Step 5
				var maxChartHeight = height - (2 * yPadding);
				var maxChartWidth = width - (2 * xPadding);

				helpers.each(minimumScaleSizes, function(wrapper) {
					if (wrapper.horizontal) {
						maxChartHeight -= wrapper.minSize.height;
					} else {
						maxChartWidth -= wrapper.minSize.width;
					}
				});

				// At this point, maxChartHeight and maxChartWidth are the size the chart area could
				// be if the axes are drawn at their minimum sizes.

				// Step 6
				var verticalScaleFitFunction = function(scaleInstance) {
					var wrapper = helpers.findNextWhere(minimumScaleSizes, function(wrapper) {
						return wrapper.scale === scaleInstance;
					});

					if (wrapper) {
						scaleInstance.fit(wrapper.minSize.width, maxChartHeight);
					}
				};

				var horizontalScaleFitFunction = function(scaleInstance) {
					var wrapper = helpers.findNextWhere(minimumScaleSizes, function(wrapper) {
						return wrapper.scale === scaleInstance;
					});

					var scaleMargin = {
						left: totalLeftWidth,
						right: totalRightWidth,
						top: 0,
						bottom: 0,
					};

					if (wrapper) {
						scaleInstance.fit(maxChartWidth, wrapper.minSize.height, scaleMargin);
					}
				};

				var totalLeftWidth = xPadding;
				var totalRightWidth = xPadding;
				var totalTopHeight = yPadding;
				var totalBottomHeight = yPadding;

				helpers.each(leftScales, verticalScaleFitFunction);
				helpers.each(rightScales, verticalScaleFitFunction);

				// Figure out how much margin is on the left and right of the horizontal axes
				helpers.each(leftScales, function(scaleInstance) {
					totalLeftWidth += scaleInstance.width;
				});

				helpers.each(rightScales, function(scaleInstance) {
					totalRightWidth += scaleInstance.width;
				});

				helpers.each(topScales, horizontalScaleFitFunction);
				helpers.each(bottomScales, horizontalScaleFitFunction);

				helpers.each(topScales, function(scaleInstance) {
					totalTopHeight += scaleInstance.height;
				});
				helpers.each(bottomScales, function(scaleInstance) {
					totalBottomHeight += scaleInstance.height;
				});

				// Let the left scale know the final margin
				helpers.each(leftScales, function(scaleInstance) {
					var wrapper = helpers.findNextWhere(minimumScaleSizes, function(wrapper) {
						return wrapper.scale === scaleInstance;
					});

					var scaleMargin = {
						left: 0,
						right: 0,
						top: totalTopHeight,
						bottom: totalBottomHeight
					};

					if (wrapper) {
						scaleInstance.fit(wrapper.minSize.width, maxChartHeight, scaleMargin);
					}
				});

				helpers.each(rightScales, function(scaleInstance) {
					var wrapper = helpers.findNextWhere(minimumScaleSizes, function(wrapper) {
						return wrapper.scale === scaleInstance;
					});

					var scaleMargin = {
						left: 0,
						right: 0,
						top: totalTopHeight,
						bottom: totalBottomHeight
					};

					if (wrapper) {
						scaleInstance.fit(wrapper.minSize.width, maxChartHeight, scaleMargin);
					}
				});

				// Step 7 
				// Position the scales
				var left = xPadding;
				var top = yPadding;
				var right = 0;
				var bottom = 0;

				var verticalScalePlacer = function(scaleInstance) {
					scaleInstance.left = left;
					scaleInstance.right = left + scaleInstance.width;
					scaleInstance.top = totalTopHeight;
					scaleInstance.bottom = totalTopHeight + maxChartHeight;

					// Move to next point
					left = scaleInstance.right;
				};

				var horizontalScalePlacer = function(scaleInstance) {
					scaleInstance.left = totalLeftWidth;
					scaleInstance.right = totalLeftWidth + maxChartWidth;
					scaleInstance.top = top;
					scaleInstance.bottom = top + scaleInstance.height;

					// Move to next point 
					top = scaleInstance.bottom;
				};

				helpers.each(leftScales, verticalScalePlacer);
				helpers.each(topScales, horizontalScalePlacer);

				// Account for chart width and height
				left += maxChartWidth;
				top += maxChartHeight;

				helpers.each(rightScales, verticalScalePlacer);
				helpers.each(bottomScales, horizontalScalePlacer);

				// Step 8
				chartInstance.chartArea = {
					left: totalLeftWidth,
					top: totalTopHeight,
					right: totalLeftWidth + maxChartWidth,
					bottom: totalTopHeight + maxChartHeight,
				};
			}
		}
	};
}).call(this);

(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.global.tooltips = {
		enabled: true,
		custom: null,
		backgroundColor: "rgba(0,0,0,0.8)",
		fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		fontSize: 10,
		fontStyle: "normal",
		fontColor: "#fff",
		titleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
		titleFontSize: 12,
		titleFontStyle: "bold",
		titleFontColor: "#fff",
		yPadding: 6,
		xPadding: 6,
		caretSize: 8,
		cornerRadius: 6,
		xOffset: 10,
		template: [
			'<% if(label){ %>',
			'<%=label %>: ',
			'<% } %>',
			'<%=value %>',
		].join(''),
		multiTemplate: [
			'<%if (datasetLabel){ %>',
			'<%=datasetLabel %>: ',
			'<% } %>',
			'<%=value %>'
		].join(''),
		multiKeyBackground: '#fff',
	};

	Chart.Tooltip = Chart.Element.extend({
		initialize: function() {
			var options = this._options;
			helpers.extend(this, {
				_model: {
					// Positioning
					xPadding: options.tooltips.xPadding,
					yPadding: options.tooltips.yPadding,
					xOffset: options.tooltips.xOffset,

					// Labels
					textColor: options.tooltips.fontColor,
					_fontFamily: options.tooltips.fontFamily,
					_fontStyle: options.tooltips.fontStyle,
					fontSize: options.tooltips.fontSize,

					// Title
					titleTextColor: options.tooltips.titleFontColor,
					_titleFontFamily: options.tooltips.titleFontFamily,
					_titleFontStyle: options.tooltips.titleFontStyle,
					titleFontSize: options.tooltips.titleFontSize,

					// Appearance
					caretHeight: options.tooltips.caretSize,
					cornerRadius: options.tooltips.cornerRadius,
					backgroundColor: options.tooltips.backgroundColor,
					opacity: 0,
					legendColorBackground: options.tooltips.multiKeyBackground,
				},
			});
		},
		update: function() {

			var ctx = this._chart.ctx;

			switch (this._options.hover.mode) {
				case 'single':
					helpers.extend(this._model, {
						text: helpers.template(this._options.tooltips.template, {
							// These variables are available in the template function. Add others here
							element: this._active[0],
							value: this._data.datasets[this._active[0]._datasetIndex].data[this._active[0]._index],
							label: this._data.labels ? this._data.labels[this._active[0]._index] : '',
						}),
					});

					var tooltipPosition = this._active[0].tooltipPosition();
					helpers.extend(this._model, {
						x: Math.round(tooltipPosition.x),
						y: Math.round(tooltipPosition.y),
						caretPadding: tooltipPosition.padding
					});

					break;

				case 'label':

					// Tooltip Content

					var dataArray,
						dataIndex;

					var labels = [],
						colors = [];

					for (var i = this._data.datasets.length - 1; i >= 0; i--) {
						dataArray = this._data.datasets[i].metaData;
						dataIndex = helpers.indexOf(dataArray, this._active[0]);
						if (dataIndex !== -1) {
							break;
						}
					}

					var medianPosition = (function(index) {
						// Get all the points at that particular index
						var elements = [],
							dataCollection,
							xPositions = [],
							yPositions = [],
							xMax,
							yMax,
							xMin,
							yMin;
						helpers.each(this._data.datasets, function(dataset) {
							dataCollection = dataset.metaData;
							if (dataCollection[dataIndex] && dataCollection[dataIndex].hasValue()) {
								elements.push(dataCollection[dataIndex]);
							}
						}, this);

						// Reverse labels if stacked
						helpers.each(this._options.stacked ? elements.reverse() : elements, function(element) {
							xPositions.push(element._view.x);
							yPositions.push(element._view.y);

							//Include any colour information about the element
							labels.push(helpers.template(this._options.tooltips.multiTemplate, {
								// These variables are available in the template function. Add others here
								element: element,
								datasetLabel: this._data.datasets[element._datasetIndex].label,
								value: this._data.datasets[element._datasetIndex].data[element._index],
							}));
							colors.push({
								fill: element._view.backgroundColor,
								stroke: element._view.borderColor
							});

						}, this);

						yMin = helpers.min(yPositions);
						yMax = helpers.max(yPositions);

						xMin = helpers.min(xPositions);
						xMax = helpers.max(xPositions);

						return {
							x: (xMin > this._chart.width / 2) ? xMin : xMax,
							y: (yMin + yMax) / 2,
						};
					}).call(this, dataIndex);

					// Apply for now
					helpers.extend(this._model, {
						x: medianPosition.x,
						y: medianPosition.y,
						labels: labels,
						title: this._data.labels && this._data.labels.length ? this._data.labels[this._active[0]._index] : '',
						legendColors: colors,
						legendBackgroundColor: this._options.tooltips.multiKeyBackground,
					});


					// Calculate Appearance Tweaks

					this._model.height = (labels.length * this._model.fontSize) + ((labels.length - 1) * (this._model.fontSize / 2)) + (this._model.yPadding * 2) + this._model.titleFontSize * 1.5;

					var titleWidth = ctx.measureText(this.title).width,
						//Label has a legend square as well so account for this.
						labelWidth = helpers.longestText(ctx, this.font, labels) + this._model.fontSize + 3,
						longestTextWidth = helpers.max([labelWidth, titleWidth]);

					this._model.width = longestTextWidth + (this._model.xPadding * 2);


					var halfHeight = this._model.height / 2;

					//Check to ensure the height will fit on the canvas
					if (this._model.y - halfHeight < 0) {
						this._model.y = halfHeight;
					} else if (this._model.y + halfHeight > this._chart.height) {
						this._model.y = this._chart.height - halfHeight;
					}

					//Decide whether to align left or right based on position on canvas
					if (this._model.x > this._chart.width / 2) {
						this._model.x -= this._model.xOffset + this._model.width;
					} else {
						this._model.x += this._model.xOffset;
					}
					break;
			}

			return this;
		},
		draw: function() {

			var ctx = this._chart.ctx;
			var vm = this._view;

			switch (this._options.hover.mode) {
				case 'single':

					ctx.font = helpers.fontString(vm.fontSize, vm._fontStyle, vm._fontFamily);

					vm.xAlign = "center";
					vm.yAlign = "above";

					//Distance between the actual element.y position and the start of the tooltip caret
					var caretPadding = vm.caretPadding || 2;

					var tooltipWidth = ctx.measureText(vm.text).width + 2 * vm.xPadding,
						tooltipRectHeight = vm.fontSize + 2 * vm.yPadding,
						tooltipHeight = tooltipRectHeight + vm.caretHeight + caretPadding;

					if (vm.x + tooltipWidth / 2 > this._chart.width) {
						vm.xAlign = "left";
					} else if (vm.x - tooltipWidth / 2 < 0) {
						vm.xAlign = "right";
					}

					if (vm.y - tooltipHeight < 0) {
						vm.yAlign = "below";
					}

					var tooltipX = vm.x - tooltipWidth / 2,
						tooltipY = vm.y - tooltipHeight;

					ctx.fillStyle = helpers.color(vm.backgroundColor).alpha(vm.opacity).rgbString();

					// Custom Tooltips
					if (this._custom) {
						this._custom(this._view);
					} else {
						switch (vm.yAlign) {
							case "above":
								//Draw a caret above the x/y
								ctx.beginPath();
								ctx.moveTo(vm.x, vm.y - caretPadding);
								ctx.lineTo(vm.x + vm.caretHeight, vm.y - (caretPadding + vm.caretHeight));
								ctx.lineTo(vm.x - vm.caretHeight, vm.y - (caretPadding + vm.caretHeight));
								ctx.closePath();
								ctx.fill();
								break;
							case "below":
								tooltipY = vm.y + caretPadding + vm.caretHeight;
								//Draw a caret below the x/y
								ctx.beginPath();
								ctx.moveTo(vm.x, vm.y + caretPadding);
								ctx.lineTo(vm.x + vm.caretHeight, vm.y + caretPadding + vm.caretHeight);
								ctx.lineTo(vm.x - vm.caretHeight, vm.y + caretPadding + vm.caretHeight);
								ctx.closePath();
								ctx.fill();
								break;
						}

						switch (vm.xAlign) {
							case "left":
								tooltipX = vm.x - tooltipWidth + (vm.cornerRadius + vm.caretHeight);
								break;
							case "right":
								tooltipX = vm.x - (vm.cornerRadius + vm.caretHeight);
								break;
						}

						helpers.drawRoundedRectangle(ctx, tooltipX, tooltipY, tooltipWidth, tooltipRectHeight, vm.cornerRadius);

						ctx.fill();

						ctx.fillStyle = helpers.color(vm.textColor).alpha(vm.opacity).rgbString();
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.fillText(vm.text, tooltipX + tooltipWidth / 2, tooltipY + tooltipRectHeight / 2);

					}
					break;
				case 'label':

					helpers.drawRoundedRectangle(ctx, vm.x, vm.y - vm.height / 2, vm.width, vm.height, vm.cornerRadius);
					ctx.fillStyle = helpers.color(vm.backgroundColor).alpha(vm.opacity).rgbString();
					ctx.fill();
					ctx.closePath();

					ctx.textAlign = "left";
					ctx.textBaseline = "middle";
					ctx.fillStyle = helpers.color(vm.titleTextColor).alpha(vm.opacity).rgbString();
					ctx.font = helpers.fontString(vm.fontSize, vm._titleFontStyle, vm._titleFontFamily);
					ctx.fillText(vm.title, vm.x + vm.xPadding, this.getLineHeight(0));

					ctx.font = helpers.fontString(vm.fontSize, vm._fontStyle, vm._fontFamily);
					helpers.each(vm.labels, function(label, index) {
						ctx.fillStyle = helpers.color(vm.textColor).alpha(vm.opacity).rgbString();
						ctx.fillText(label, vm.x + vm.xPadding + vm.fontSize + 3, this.getLineHeight(index + 1));

						//A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
						//ctx.clearRect(vm.x + vm.xPadding, this.getLineHeight(index + 1) - vm.fontSize/2, vm.fontSize, vm.fontSize);
						//Instead we'll make a white filled block to put the legendColour palette over.

						ctx.fillStyle = helpers.color(vm.legendColors[index].stroke).alpha(vm.opacity).rgbString();
						ctx.fillRect(vm.x + vm.xPadding - 1, this.getLineHeight(index + 1) - vm.fontSize / 2 - 1, vm.fontSize + 2, vm.fontSize + 2);

						ctx.fillStyle = helpers.color(vm.legendColors[index].fill).alpha(vm.opacity).rgbString();
						ctx.fillRect(vm.x + vm.xPadding, this.getLineHeight(index + 1) - vm.fontSize / 2, vm.fontSize, vm.fontSize);


					}, this);
					break;
			}
		},
		getLineHeight: function(index) {
			var baseLineHeight = this._view.y - (this._view.height / 2) + this._view.yPadding,
				afterTitleIndex = index - 1;

			//If the index is zero, we're getting the title
			if (index === 0) {
				return baseLineHeight + this._view.titleFontSize / 2;
			} else {
				return baseLineHeight + ((this._view.fontSize * 1.5 * afterTitleIndex) + this._view.fontSize / 2) + this._view.titleFontSize * 1.5;
			}

		},
	});

}).call(this);

(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.bar = {
		hover: {
			mode: "label"
		},

		scales: {
			xAxes: [{
				type: "category",
				categorySpacing: 10,
				spacing: 1,

				// grid line settings
				gridLines: {
					offsetGridLines: true,
				},
			}],
			yAxes: [{
				type: "linear",
			}],
		},
	};

	Chart.controllers.bar = function(chart, datasetIndex) {
		this.initialize.call(this, chart, datasetIndex);
	};

	helpers.extend(Chart.controllers.bar.prototype, {

		initialize: function(chart, datasetIndex) {
			this.chart = chart;
			this.index = datasetIndex;
			this.linkScales();
			this.addElements();
		},

		linkScales: function() {
			if (!this.getDataset().xAxisID) {
				this.getDataset().xAxisID = this.chart.options.scales.xAxes[0].id;
			}

			if (!this.getDataset().yAxisID) {
				this.getDataset().yAxisID = this.chart.options.scales.yAxes[0].id;
			}
		},

		getDataset: function() {
			return this.chart.data.datasets[this.index];
		},

		getScaleForId: function(scaleID) {
			return this.chart.scales[scaleID];
		},

		addElements: function() {
			this.getDataset().metaData = this.getDataset().metaData || [];
			helpers.each(this.getDataset().data, function(value, index) {
				this.getDataset().metaData[index] = this.getDataset().metaData[index] || new Chart.elements.Rectangle({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,
				});
			}, this);
		},

		reset: function() {
			this.update(true);
		},

		update: function(reset) {

			var xScale = this.getScaleForId(this.getDataset().xAxisID);
			var yScale = this.getScaleForId(this.getDataset().yAxisID);
			helpers.each(this.getDataset().metaData, function(rectangle, index) {

				var yScalePoint;

				if (yScale.min < 0 && yScale.max < 0) {
					// all less than 0. use the top
					yScalePoint = yScale.getPixelForValue(yScale.max);
				} else if (yScale.min > 0 && yScale.max > 0) {
					yScalePoint = yScale.getPixelForValue(yScale.min);
				} else {
					yScalePoint = yScale.getPixelForValue(0);
				}

				helpers.extend(rectangle, {
					// Utility
					_chart: this.chart.chart,
					_xScale: xScale,
					_yScale: yScale,
					_datasetIndex: this.index,
					_index: index,


					// Desired view properties
					_model: {
						x: xScale.calculateBarX(this.chart.data.datasets.length, this.index, index),
						y: reset ? yScalePoint : yScale.calculateBarY(this.index, index),

						// Tooltip
						label: this.chart.data.labels[index],
						datasetLabel: this.getDataset().label,

						// Appearance
						base: yScale.calculateBarBase(this.index, index),
						width: xScale.calculateBarWidth(this.chart.data.datasets.length),
						backgroundColor: rectangle.custom && rectangle.custom.backgroundColor ? rectangle.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.rectangle.backgroundColor),
						borderColor: rectangle.custom && rectangle.custom.borderColor ? rectangle.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.rectangle.borderColor),
						borderWidth: rectangle.custom && rectangle.custom.borderWidth ? rectangle.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.rectangle.borderWidth),
					},
				});
				rectangle.pivot();
			}, this);
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			helpers.each(this.getDataset().metaData, function(rectangle, index) {
				rectangle.transition(easingDecimal).draw();
			}, this);
		},

		setHoverStyle: function(rectangle) {
			var dataset = this.chart.data.datasets[rectangle._datasetIndex];
			var index = rectangle._index;

			rectangle._model.backgroundColor = rectangle.custom && rectangle.custom.hoverBackgroundColor ? rectangle.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(rectangle._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			rectangle._model.borderColor = rectangle.custom && rectangle.custom.hoverBorderColor ? rectangle.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(rectangle._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			rectangle._model.borderWidth = rectangle.custom && rectangle.custom.hoverBorderWidth ? rectangle.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, rectangle._model.borderWidth);
		},

		removeHoverStyle: function(rectangle) {
			var dataset = this.chart.data.datasets[rectangle._datasetIndex];
			var index = rectangle._index;

			rectangle._model.backgroundColor = rectangle.custom && rectangle.custom.backgroundColor ? rectangle.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.rectangle.backgroundColor);
			rectangle._model.borderColor = rectangle.custom && rectangle.custom.borderColor ? rectangle.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.rectangle.borderColor);
			rectangle._model.borderWidth = rectangle.custom && rectangle.custom.borderWidth ? rectangle.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.rectangle.borderWidth);
		}

	});



}).call(this);

(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;

	Chart.defaults.doughnut = {
		animation: {
			//Boolean - Whether we animate the rotation of the Doughnut
			animateRotate: true,
			//Boolean - Whether we animate scaling the Doughnut from the centre
			animateScale: false,
		},
		hover: {
			mode: 'single'
		},
		//The percentage of the chart that we cut out of the middle.
		cutoutPercentage: 50,
	};

	Chart.defaults.pie = helpers.clone(Chart.defaults.doughnut);
	helpers.extend(Chart.defaults.pie, {
		cutoutPercentage: 0
	});


	Chart.controllers.doughnut = Chart.controllers.pie = function(chart, datasetIndex) {
		this.initialize.call(this, chart, datasetIndex);
	};

	helpers.extend(Chart.controllers.doughnut.prototype, {

		initialize: function(chart, datasetIndex) {
			this.chart = chart;
			this.index = datasetIndex;
			this.linkScales();
			this.addElements();
		},

		linkScales: function() {
			// no scales for doughnut
		},

		getDataset: function() {
			return this.chart.data.datasets[this.index];
		},

		getScaleForId: function(scaleID) {
			return this.chart.scales[scaleID];
		},

		addElements: function() {
			this.getDataset().metaData = this.getDataset().metaData || [];
			helpers.each(this.getDataset().data, function(value, index) {
				this.getDataset().metaData[index] = this.getDataset().metaData[index] || new Chart.elements.Arc({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,
				});
			}, this);
		},

		reset: function() {
			this.update(true);
		},

		update: function(reset) {

			this.chart.outerRadius = (helpers.min([this.chart.chart.width, this.chart.chart.height]) - this.chart.options.elements.arc.borderWidth / 2) / 2;
			this.chart.innerRadius = this.chart.options.cutoutPercentage ? (this.chart.outerRadius / 100) * (this.chart.options.cutoutPercentage) : 1;
			this.chart.radiusLength = (this.chart.outerRadius - this.chart.innerRadius) / this.chart.data.datasets.length;


			this.getDataset().total = 0;
			helpers.each(this.getDataset().data, function(value) {
				this.getDataset().total += Math.abs(value);
			}, this);

			this.outerRadius = this.chart.outerRadius - (this.chart.radiusLength * this.index);
			this.innerRadius = this.outerRadius - this.chart.radiusLength;

			helpers.each(this.getDataset().metaData, function(arc, index) {

				var resetModel = {
					x: this.chart.chart.width / 2,
					y: this.chart.chart.height / 2,
					startAngle: Math.PI * -0.5, // use - PI / 2 instead of 3PI / 2 to make animations better. It means that we never deal with overflow during the transition function
					circumference: (this.chart.options.animation.animateRotate) ? 0 : this.calculateCircumference(this.getDataset().data[index]),
					outerRadius: (this.chart.options.animation.animateScale) ? 0 : this.outerRadius,
					innerRadius: (this.chart.options.animation.animateScale) ? 0 : this.innerRadius,
				};

				helpers.extend(arc, {
					// Utility
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,

					// Desired view properties
					_model: reset ? resetModel : {
						x: this.chart.chart.width / 2,
						y: this.chart.chart.height / 2,
						circumference: this.calculateCircumference(this.getDataset().data[index]),
						outerRadius: this.outerRadius,
						innerRadius: this.innerRadius,

						backgroundColor: arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor),
						hoverBackgroundColor: arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().hoverBackgroundColor, index, this.chart.options.elements.arc.hoverBackgroundColor),
						borderWidth: arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth),
						borderColor: arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor),

						label: helpers.getValueAtIndexOrDefault(this.getDataset().label, index, this.chart.data.labels[index])
					},
				});

				if (!reset) {

					if (index === 0) {
						arc._model.startAngle = Math.PI * -0.5; // use - PI / 2 instead of 3PI / 2 to make animations better. It means that we never deal with overflow during the transition function
					} else {
						arc._model.startAngle = this.getDataset().metaData[index - 1]._model.endAngle;
					}

					arc._model.endAngle = arc._model.startAngle + arc._model.circumference;


					//Check to see if it's the last arc, if not get the next and update its start angle
					if (index < this.getDataset().data.length - 1) {
						this.getDataset().metaData[index + 1]._model.startAngle = arc._model.endAngle;
					}
				}

				arc.pivot();
			}, this);
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			helpers.each(this.getDataset().metaData, function(arc, index) {
				arc.transition(easingDecimal).draw();
			}, this);
		},



		setHoverStyle: function(arc) {
			var dataset = this.chart.data.datasets[arc._datasetIndex];
			var index = arc._index;

			arc._model.backgroundColor = arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(arc._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			arc._model.borderColor = arc.custom && arc.custom.hoverBorderColor ? arc.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(arc._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			arc._model.borderWidth = arc.custom && arc.custom.hoverBorderWidth ? arc.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, arc._model.borderWidth);
		},

		removeHoverStyle: function(arc) {
			var dataset = this.chart.data.datasets[arc._datasetIndex];
			var index = arc._index;

			arc._model.backgroundColor = arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor);
			arc._model.borderColor = arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor);
			arc._model.borderWidth = arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth);
		},

		calculateCircumference: function(value) {
			if (this.getDataset().total > 0) {
				return (Math.PI * 1.999999) * (value / this.getDataset().total);
			} else {
				return 0;
			}
		},

	});


}).call(this);

(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.line = {
		hover: {
			mode: "label"
		},

		scales: {
			xAxes: [{
				type: "category",
			}],
			yAxes: [{
				type: "linear",
			}],
		},
	};


	Chart.controllers.line = function(chart, datasetIndex) {
		this.initialize.call(this, chart, datasetIndex);
	};

	helpers.extend(Chart.controllers.line.prototype, {

		initialize: function(chart, datasetIndex) {
			this.chart = chart;
			this.index = datasetIndex;
			this.linkScales();
			this.addElements();
		},

		linkScales: function() {
			if (!this.getDataset().xAxisID) {
				this.getDataset().xAxisID = this.chart.options.scales.xAxes[0].id;
			}

			if (!this.getDataset().yAxisID) {
				this.getDataset().yAxisID = this.chart.options.scales.yAxes[0].id;
			}
		},

		getDataset: function() {
			return this.chart.data.datasets[this.index];
		},

		getScaleForId: function(scaleID) {
			return this.chart.scales[scaleID];
		},

		addElements: function() {

			this.getDataset().metaData = this.getDataset().metaData || [];

			this.getDataset().metaDataset = this.getDataset().metaDataset || new Chart.elements.Line({
				_chart: this.chart.chart,
				_datasetIndex: this.index,
				_points: this.getDataset().metaData,
			});

			helpers.each(this.getDataset().data, function(value, index) {
				this.getDataset().metaData[index] = this.getDataset().metaData[index] || new Chart.elements.Point({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,
				});
			}, this);
		},

		reset: function() {
			this.update(true);
		},

		update: function(reset) {

			var line = this.getDataset().metaDataset;
			var points = this.getDataset().metaData;

			var yScale = this.getScaleForId(this.getDataset().yAxisID);
			var xScale = this.getScaleForId(this.getDataset().xAxisID);
			var scaleBase;

			if (yScale.min < 0 && yScale.max < 0) {
				scaleBase = yScale.getPixelForValue(yScale.max);
			} else if (yScale.min > 0 && yScale.max > 0) {
				scaleBase = yScale.getPixelForValue(yScale.min);
			} else {
				scaleBase = yScale.getPixelForValue(0);
			}


			// Update Line
			helpers.extend(line, {
				// Utility
				_scale: yScale,
				_datasetIndex: this.index,
				// Data
				_children: points,
				// Model
				_model: {
					// Appearance
					tension: line.custom && line.custom.tension ? line.custom.tension : (this.getDataset().tension || this.chart.options.elements.line.tension),
					backgroundColor: line.custom && line.custom.backgroundColor ? line.custom.backgroundColor : (this.getDataset().backgroundColor || this.chart.options.elements.line.backgroundColor),
					borderWidth: line.custom && line.custom.borderWidth ? line.custom.borderWidth : (this.getDataset().borderWidth || this.chart.options.elements.line.borderWidth),
					borderColor: line.custom && line.custom.borderColor ? line.custom.borderColor : (this.getDataset().borderColor || this.chart.options.elements.line.borderColor),
					fill: line.custom && line.custom.fill ? line.custom.fill : (this.getDataset().fill !== undefined ? this.getDataset().fill : this.chart.options.elements.line.fill),
					skipNull: this.getDataset().skipNull !== undefined ? this.getDataset().skipNull : this.chart.options.elements.line.skipNull,
					drawNull: this.getDataset().drawNull !== undefined ? this.getDataset().drawNull : this.chart.options.elements.line.drawNull,
					// Scale
					scaleTop: yScale.top,
					scaleBottom: yScale.bottom,
					scaleZero: scaleBase,
				},
			});
			line.pivot();

			// Update Points
			helpers.each(points, function(point, index) {
				helpers.extend(point, {
					// Utility
					_chart: this.chart.chart,
					_xScale: xScale,
					_yScale: yScale,
					_datasetIndex: this.index,
					_index: index,

					// Desired view properties
					_model: {
						x: xScale.getPointPixelForValue(this.getDataset().data[index], index, this.index),
						y: reset ? scaleBase : yScale.getPointPixelForValue(this.getDataset().data[index], index, this.index),
						// Appearance
						tension: point.custom && point.custom.tension ? point.custom.tension : this.chart.options.elements.line.tension,
						radius: point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(this.getDataset().radius, index, this.chart.options.elements.point.radius),
						backgroundColor: point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBackgroundColor, index, this.chart.options.elements.point.backgroundColor),
						borderColor: point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderColor, index, this.chart.options.elements.point.borderColor),
						borderWidth: point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderWidth, index, this.chart.options.elements.point.borderWidth),
						skip: this.getDataset().data[index] === null,

						// Tooltip
						hitRadius: point.custom && point.custom.hitRadius ? point.custom.hitRadius : helpers.getValueAtIndexOrDefault(this.getDataset().hitRadius, index, this.chart.options.elements.point.hitRadius),
					},

				});
			}, this);

			// Update bezier control points
			helpers.each(this.getDataset().metaData, function(point, index) {
				var controlPoints = helpers.splineCurve(
					helpers.previousItem(this.getDataset().metaData, index)._model,
					point._model,
					helpers.nextItem(this.getDataset().metaData, index)._model,
					point._model.tension
				);

				point._model.controlPointPreviousX = controlPoints.previous.x;
				point._model.controlPointNextX = controlPoints.next.x;

				// Prevent the bezier going outside of the bounds of the graph

				// Cap puter bezier handles to the upper/lower scale bounds
				if (controlPoints.next.y > this.chart.chartArea.bottom) {
					point._model.controlPointNextY = this.chart.chartArea.bottom;
				} else if (controlPoints.next.y < this.chart.chartArea.top) {
					point._model.controlPointNextY = this.chart.chartArea.top;
				} else {
					point._model.controlPointNextY = controlPoints.next.y;
				}

				// Cap inner bezier handles to the upper/lower scale bounds
				if (controlPoints.previous.y > this.chart.chartArea.bottom) {
					point._model.controlPointPreviousY = this.chart.chartArea.bottom;
				} else if (controlPoints.previous.y < this.chart.chartArea.top) {
					point._model.controlPointPreviousY = this.chart.chartArea.top;
				} else {
					point._model.controlPointPreviousY = controlPoints.previous.y;
				}

				// Now pivot the point for animation
				point.pivot();
			}, this);

		},

		draw: function(ease) {
			var easingDecimal = ease || 1;

			// Transition Point Locations
			helpers.each(this.getDataset().metaData, function(point, index) {
				point.transition(easingDecimal);
			}, this);

			// Transition and Draw the line
			this.getDataset().metaDataset.transition(easingDecimal).draw();

			// Draw the points
			helpers.each(this.getDataset().metaData, function(point) {
				point.draw();
			});
		},

		setHoverStyle: function(point) {
			// Point
			var dataset = this.chart.data.datasets[point._datasetIndex];
			var index = point._index;

			point._model.radius = point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.chart.options.elements.point.hoverRadius);
			point._model.backgroundColor = point.custom && point.custom.hoverBackgroundColor ? point.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.color(point._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			point._model.borderColor = point.custom && point.custom.hoverBorderColor ? point.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.color(point._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			point._model.borderWidth = point.custom && point.custom.hoverBorderWidth ? point.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, point._model.borderWidth);
		},

		removeHoverStyle: function(point) {
			var dataset = this.chart.data.datasets[point._datasetIndex];
			var index = point._index;

			point._model.radius = point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(this.getDataset().radius, index, this.chart.options.elements.point.radius);
			point._model.backgroundColor = point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBackgroundColor, index, this.chart.options.elements.point.backgroundColor);
			point._model.borderColor = point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderColor, index, this.chart.options.elements.point.borderColor);
			point._model.borderWidth = point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderWidth, index, this.chart.options.elements.point.borderWidth);
		}

	});



}).call(this);

(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;


	Chart.defaults.polarArea = {

		scale: {
			type: "radialLinear",
			lineArc: true, // so that lines are circular
		},

		//Boolean - Whether to animate the rotation of the chart
		animateRotate: true,
	};

	Chart.controllers.polarArea = function(chart, datasetIndex) {
		this.initialize.call(this, chart, datasetIndex);
	};

	helpers.extend(Chart.controllers.polarArea.prototype, {

		initialize: function(chart, datasetIndex) {
			this.chart = chart;
			this.index = datasetIndex;
			this.linkScales();
			this.addElements();
		},

		linkScales: function() {
			// no scales for doughnut
		},

		getDataset: function() {
			return this.chart.data.datasets[this.index];
		},

		getScaleForId: function(scaleID) {
			return this.chart.scales[scaleID];
		},

		addElements: function() {
			this.getDataset().metaData = this.getDataset().metaData || [];
			helpers.each(this.getDataset().data, function(value, index) {
				this.getDataset().metaData[index] = this.getDataset().metaData[index] || new Chart.elements.Arc({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,
				});
			}, this);
		},

		reset: function() {
			this.update(true);
		},

		update: function(reset) {

			Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);
			//this.chart.scale.setScaleSize();
			this.chart.scale.calculateRange();
			this.chart.scale.generateTicks();
			this.chart.scale.buildYLabels();

			this.chart.outerRadius = (helpers.min([this.chart.chart.width, this.chart.chart.height]) - this.chart.options.elements.arc.borderWidth / 2) / 2;
			this.chart.innerRadius = this.chart.options.cutoutPercentage ? (this.chart.outerRadius / 100) * (this.chart.options.cutoutPercentage) : 1;
			this.chart.radiusLength = (this.chart.outerRadius - this.chart.innerRadius) / this.chart.data.datasets.length;

			this.getDataset().total = 0;
			helpers.each(this.getDataset().data, function(value) {
				this.getDataset().total += Math.abs(value);
			}, this);

			this.outerRadius = this.chart.outerRadius - (this.chart.radiusLength * this.index);
			this.innerRadius = this.outerRadius - this.chart.radiusLength;

			helpers.each(this.getDataset().metaData, function(arc, index) {

				var resetModel = {
					x: this.chart.chart.width / 2,
					y: this.chart.chart.height / 2,
					innerRadius: 0,
					outerRadius: 0,
					startAngle: Math.PI * -0.5,
					endAngle: Math.PI * -0.5,

					backgroundColor: arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor),
					hoverBackgroundColor: arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().hoverBackgroundColor, index, this.chart.options.elements.arc.hoverBackgroundColor),
					borderWidth: arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth),
					borderColor: arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor),

					label: helpers.getValueAtIndexOrDefault(this.chart.data.labels, index, this.chart.data.labels[index])
				};

				var circumference = 1 / this.getDataset().data.length * 2;
				var startAngle = (-0.5 * Math.PI) + (Math.PI * circumference) * index;
				var endAngle = startAngle + (circumference * Math.PI);

				console.log()

				helpers.extend(arc, {
					// Utility
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,

					// Desired view properties
					_model: reset ? resetModel : {
						x: this.chart.chart.width / 2,
						y: this.chart.chart.height / 2,
						innerRadius: 0,
						outerRadius: this.chart.scale.getDistanceFromCenterForValue(this.getDataset().data[index]),
						startAngle: startAngle,
						endAngle: endAngle,

						backgroundColor: arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor),
						hoverBackgroundColor: arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().hoverBackgroundColor, index, this.chart.options.elements.arc.hoverBackgroundColor),
						borderWidth: arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth),
						borderColor: arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor),

						label: helpers.getValueAtIndexOrDefault(this.chart.data.labels, index, this.chart.data.labels[index])
					},
				});

				arc.pivot();
			}, this);
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			helpers.each(this.getDataset().metaData, function(arc, index) {
				arc.transition(easingDecimal).draw();
				console.log(arc);
			}, this);
		},



		setHoverStyle: function(arc) {
			var dataset = this.chart.data.datasets[arc._datasetIndex];
			var index = arc._index;

			arc._model.backgroundColor = arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(arc._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			arc._model.borderColor = arc.custom && arc.custom.hoverBorderColor ? arc.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(arc._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			arc._model.borderWidth = arc.custom && arc.custom.hoverBorderWidth ? arc.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, arc._model.borderWidth);
		},

		removeHoverStyle: function(arc) {
			var dataset = this.chart.data.datasets[arc._datasetIndex];
			var index = arc._index;

			arc._model.backgroundColor = arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor);
			arc._model.borderColor = arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor);
			arc._model.borderWidth = arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth);
		},

		calculateCircumference: function(value) {
			if (this.getDataset().total > 0) {
				return (Math.PI * 2) * (value / this.getDataset().total);
			} else {
				return 0;
			}
		},
		updateScaleRange: function() {
			helpers.extend(this.chart.scale, {
				size: helpers.min([this.chart.width, this.chart.height]),
				xCenter: this.chart.width / 2,
				yCenter: this.chart.height / 2
			});
		},

	});



	return;


	Chart.Type.extend({});

}).call(this);

(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;



	Chart.defaults.radar = {
		scale: {
			type: "radialLinear",
		},
		elements: {
			line: {
				tension: 0, // no bezier in radar
			}
		},
	};

	Chart.controllers.radar = function(chart, datasetIndex) {
		this.initialize.call(this, chart, datasetIndex);
	};


	helpers.extend(Chart.controllers.radar.prototype, {

		initialize: function(chart, datasetIndex) {
			this.chart = chart;
			this.index = datasetIndex;
			this.linkScales();
			this.addElements();
		},

		linkScales: function() {
			// No need. Single scale only
		},

		getDataset: function() {
			return this.chart.data.datasets[this.index];
		},

		getScaleForId: function(scaleID) {
			return this.chart.scales[scaleID];
		},

		addElements: function() {

			this.getDataset().metaData = this.getDataset().metaData || [];

			this.getDataset().metaDataset = this.getDataset().metaDataset || new Chart.elements.Line({
				_chart: this.chart.chart,
				_datasetIndex: this.index,
				_points: this.getDataset().metaData,
				_loop: true
			});

			helpers.each(this.getDataset().data, function(value, index) {
				this.getDataset().metaData[index] = this.getDataset().metaData[index] || new Chart.elements.Point({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,
					_model: {
						x: 0, //xScale.getPixelForValue(null, index, true),
						y: 0, //this.chartArea.bottom,
					},
				});
			}, this);
		},

		reset: function() {
			this.update(true);
		},

		update: function(reset) {

			var line = this.getDataset().metaDataset;
			var points = this.getDataset().metaData;

			var scale = this.chart.scale;
			var scaleBase;

			scale.setScaleSize();
			scale.calculateRange();
			scale.generateTicks();
			scale.buildYLabels();

			if (scale.min < 0 && scale.max < 0) {
				scaleBase = scale.getPointPositionForValue(0, scale.max);
			} else if (scale.min > 0 && scale.max > 0) {
				scaleBase = scale.getPointPositionForValue(0, scale.min);
			} else {
				scaleBase = scale.getPointPositionForValue(0, 0);
			}

			helpers.extend(this.getDataset().metaDataset, {
				// Utility
				_datasetIndex: this.index,
				// Data
				_children: this.getDataset().metaData,
				// Model
				_model: {
					// Appearance
					tension: this.getDataset().tension || this.chart.options.elements.line.tension,
					backgroundColor: this.getDataset().backgroundColor || this.chart.options.elements.line.backgroundColor,
					borderWidth: this.getDataset().borderWidth || this.chart.options.elements.line.borderWidth,
					borderColor: this.getDataset().borderColor || this.chart.options.elements.line.borderColor,
					fill: this.getDataset().fill !== undefined ? this.getDataset().fill : this.chart.options.elements.line.fill, // use the value from the this.getDataset() if it was provided. else fall back to the default
					skipNull: this.getDataset().skipNull !== undefined ? this.getDataset().skipNull : this.chart.options.elements.line.skipNull,
					drawNull: this.getDataset().drawNull !== undefined ? this.getDataset().drawNull : this.chart.options.elements.line.drawNull,

					// Scale
					scaleTop: scale.top,
					scaleBottom: scale.bottom,
					scaleZero: scaleBase,
				},
			});

			this.getDataset().metaDataset.pivot();

			// Update Points
			helpers.each(points, function(point, index) {
				var pointPosition = scale.getPointPositionForValue(index, this.getDataset().data[index]);

				helpers.extend(point, {
					// Utility
					_datasetIndex: this.index,
					_index: index,

					// Desired view properties
					_model: {
						x: reset ? scale.xCenter : pointPosition.x, // value not used in dataset scale, but we want a consistent API between scales
						y: reset ? scale.yCenter : pointPosition.y,

						// Appearance
						tension: point.custom && point.custom.tension ? point.custom.tension : this.chart.options.elements.line.tension,
						radius: point.custom && point.custom.radius ? point.custom.pointRadius : helpers.getValueAtIndexOrDefault(this.getDataset().pointRadius, index, this.chart.options.elements.point.radius),
						backgroundColor: point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBackgroundColor, index, this.chart.options.elements.point.backgroundColor),
						borderColor: point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderColor, index, this.chart.options.elements.point.borderColor),
						borderWidth: point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderWidth, index, this.chart.options.elements.point.borderWidth),
						skip: this.getDataset().data[index] === null,

						// Tooltip
						hitRadius: point.custom && point.custom.hitRadius ? point.custom.hitRadius : helpers.getValueAtIndexOrDefault(this.getDataset().hitRadius, index, this.chart.options.elements.point.hitRadius),
					},
				});
			}, this);


			// Update bezier control points
			helpers.each(this.getDataset().metaData, function(point, index) {
				var controlPoints = helpers.splineCurve(
					helpers.previousItem(this.getDataset().metaData, index, true)._model,
					point._model,
					helpers.nextItem(this.getDataset().metaData, index, true)._model,
					point._model.tension
				);

				point._model.controlPointPreviousX = controlPoints.previous.x;
				point._model.controlPointNextX = controlPoints.next.x;

				// Prevent the bezier going outside of the bounds of the graph

				// Cap puter bezier handles to the upper/lower scale bounds
				if (controlPoints.next.y > this.chart.chartArea.bottom) {
					point._model.controlPointNextY = this.chart.chartArea.bottom;
				} else if (controlPoints.next.y < this.chart.chartArea.top) {
					point._model.controlPointNextY = this.chart.chartArea.top;
				} else {
					point._model.controlPointNextY = controlPoints.next.y;
				}

				// Cap inner bezier handles to the upper/lower scale bounds
				if (controlPoints.previous.y > this.chart.chartArea.bottom) {
					point._model.controlPointPreviousY = this.chart.chartArea.bottom;
				} else if (controlPoints.previous.y < this.chart.chartArea.top) {
					point._model.controlPointPreviousY = this.chart.chartArea.top;
				} else {
					point._model.controlPointPreviousY = controlPoints.previous.y;
				}

				// Now pivot the point for animation
				point.pivot();
			}, this);

		},

		draw: function(ease) {
			var easingDecimal = ease || 1;

			// Transition Point Locations
			helpers.each(this.getDataset().metaData, function(point, index) {
				point.transition(easingDecimal);
			}, this);

			// Transition and Draw the line
			this.getDataset().metaDataset.transition(easingDecimal).draw();

			// Draw the points
			helpers.each(this.getDataset().metaData, function(point) {
				point.draw();
			});
		},

		setHoverStyle: function(point) {
			// Point
			var dataset = this.chart.data.datasets[point._datasetIndex];
			var index = point._index;

			point._model.radius = point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.chart.options.elements.point.hoverRadius);
			point._model.backgroundColor = point.custom && point.custom.hoverBackgroundColor ? point.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.color(point._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			point._model.borderColor = point.custom && point.custom.hoverBorderColor ? point.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.color(point._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			point._model.borderWidth = point.custom && point.custom.hoverBorderWidth ? point.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, point._model.borderWidth);
		},

		removeHoverStyle: function(point) {
			var dataset = this.chart.data.datasets[point._datasetIndex];
			var index = point._index;

			point._model.radius = point.custom && point.custom.radius ? point.custom.radius : helpers.getValueAtIndexOrDefault(this.getDataset().radius, index, this.chart.options.elements.point.radius);
			point._model.backgroundColor = point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBackgroundColor, index, this.chart.options.elements.point.backgroundColor);
			point._model.borderColor = point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderColor, index, this.chart.options.elements.point.borderColor);
			point._model.borderWidth = point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().pointBorderWidth, index, this.chart.options.elements.point.borderWidth);
		}

	});



}).call(this);

(function() {
	"use strict";

	return;

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
		hover: {
			mode: 'single',
		},

		scales: {
			xAxes: [{
				type: "linear", // scatter should not use a category axis
				position: "bottom",
				id: "x-axis-1", // need an ID so datasets can reference the scale
			}],
			yAxes: [{
				type: "linear",
				position: "left",
				id: "y-axis-1",
			}],
		},

		//String - A legend template
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].borderColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",

		tooltips: {
			template: "(<%= value.x %>, <%= value.y %>)",
			multiTemplate: "<%if (datasetLabel){%><%=datasetLabel%>: <%}%>(<%= value.x %>, <%= value.y %>)",
		},

	};


	Chart.types.Line.extend({
		name: "Scatter",
		defaults: defaultConfig,
	});
}).call(this);

(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	// Default config for a category scale
	var defaultConfig = {
		display: true,
		position: "bottom",
		id: "x-axis-1", // need an ID so datasets can reference the scale

		// grid line settings
		gridLines: {
			show: true,
			color: "rgba(0, 0, 0, 0.1)",
			lineWidth: 1,
			drawOnChartArea: true,
			drawTicks: true,
			zeroLineWidth: 1,
			zeroLineColor: "rgba(0,0,0,0.25)",
			offsetGridLines: false,
		},

		// label settings
		labels: {
			show: true,
			template: "<%=value%>",
			fontSize: 12,
			fontStyle: "normal",
			fontColor: "#666",
			fontFamily: "Helvetica Neue",
		},
	};

	var DatasetScale = Chart.Element.extend({
		isHorizontal: function() {
			return this.options.position == "top" || this.options.position == "bottom";
		},
		getPixelForValue: function(value, index, datasetIndex, includeOffset) {
			// This must be called after fit has been run so that 
			//      this.left, this.top, this.right, and this.bottom have been defined
			if (this.isHorizontal()) {
				var isRotated = (this.labelRotation > 0);
				var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
				var valueWidth = innerWidth / Math.max((this.data.labels.length - ((this.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
				var valueOffset = (valueWidth * index) + this.paddingLeft;

				if (this.options.gridLines.offsetGridLines && includeOffset) {
					valueOffset += (valueWidth / 2);
				}

				return this.left + Math.round(valueOffset);
			} else {
				return this.top + (index * (this.height / this.data.labels.length));
			}
		},
		getPointPixelForValue: function(value, index, datasetIndex) {
			return this.getPixelForValue(value, index, datasetIndex, true);
		},

		// Functions needed for bar charts
		calculateBaseWidth: function() {
			return (this.getPixelForValue(null, 1, 0, true) - this.getPixelForValue(null, 0, 0, true)) - (2 * this.options.categorySpacing);
		},
		calculateBarWidth: function(datasetCount) {
			//The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
			var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * this.options.spacing);

			if (this.options.stacked) {
				return baseWidth;
			}
			return (baseWidth / datasetCount);
		},
		calculateBarX: function(datasetCount, datasetIndex, elementIndex) {
			var xWidth = this.calculateBaseWidth(),
				xAbsolute = this.getPixelForValue(null, elementIndex, datasetIndex, true) - (xWidth / 2),
				barWidth = this.calculateBarWidth(datasetCount);

			if (this.options.stacked) {
				return xAbsolute + barWidth / 2;
			}

			return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * this.options.spacing) + barWidth / 2;
		},

		calculateLabelRotation: function(maxHeight, margins) {
			//Get the width of each grid by calculating the difference
			//between x offsets between 0 and 1.
			var labelFont = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);
			this.ctx.font = labelFont;

			var firstWidth = this.ctx.measureText(this.data.labels[0]).width;
			var lastWidth = this.ctx.measureText(this.data.labels[this.data.labels.length - 1]).width;
			var firstRotated;
			var lastRotated;

			this.paddingRight = lastWidth / 2 + 3;
			this.paddingLeft = firstWidth / 2 + 3;

			this.labelRotation = 0;

			if (this.options.display) {
				var originalLabelWidth = helpers.longestText(this.ctx, labelFont, this.data.labels);
				var cosRotation;
				var sinRotation;
				var firstRotatedWidth;

				this.labelWidth = originalLabelWidth;

				//Allow 3 pixels x2 padding either side for label readability
				// only the index matters for a dataset scale, but we want a consistent interface between scales
				var gridWidth = Math.floor(this.getPixelForValue(0, 1) - this.getPixelForValue(0, 0)) - 6;

				//Max label rotate should be 90 - also act as a loop counter
				while ((this.labelWidth > gridWidth && this.labelRotation === 0) || (this.labelWidth > gridWidth && this.labelRotation <= 90 && this.labelRotation > 0)) {
					cosRotation = Math.cos(helpers.toRadians(this.labelRotation));
					sinRotation = Math.sin(helpers.toRadians(this.labelRotation));

					firstRotated = cosRotation * firstWidth;
					lastRotated = cosRotation * lastWidth;

					// We're right aligning the text now.
					if (firstRotated + this.options.labels.fontSize / 2 > this.yLabelWidth) {
						this.paddingLeft = firstRotated + this.options.labels.fontSize / 2;
					}

					this.paddingRight = this.options.labels.fontSize / 2;

					if (sinRotation * originalLabelWidth > maxHeight) {
						// go back one step
						this.labelRotation--;
						break;
					}

					this.labelRotation++;
					this.labelWidth = cosRotation * originalLabelWidth;

				}
			} else {
				this.labelWidth = 0;
				this.paddingRight = 0;
				this.paddingLeft = 0;
			}

			if (margins) {
				this.paddingLeft -= margins.left;
				this.paddingRight -= margins.right;

				this.paddingLeft = Math.max(this.paddingLeft, 0);
				this.paddingRight = Math.max(this.paddingRight, 0);
			}

		},
		// Fit this axis to the given size
		// @param {number} maxWidth : the max width the axis can be
		// @param {number} maxHeight: the max height the axis can be
		// @return {object} minSize : the minimum size needed to draw the axis
		fit: function(maxWidth, maxHeight, margins) {
			this.calculateLabelRotation(maxHeight, margins);

			var minSize = {
				width: 0,
				height: 0,
			};

			var labelFont = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);
			var longestLabelWidth = helpers.longestText(this.ctx, labelFont, this.data.labels);

			// Width
			if (this.isHorizontal()) {
				minSize.width = maxWidth;
				this.width = maxWidth;
			} else if (this.options.display) {
				minSize.width = Math.min(longestLabelWidth + 6, maxWidth);
			}

			// Height
			if (this.isHorizontal() && this.options.display) {
				var labelHeight = (Math.cos(helpers.toRadians(this.labelRotation)) * longestLabelWidth) + 1.5 * this.options.labels.fontSize;
				minSize.height = Math.min(labelHeight, maxHeight);
			} else if (this.options.display) {
				minSize.width = Math.min(longestLabelWidth + 6, maxWidth);
			}

			this.width = minSize.width;
			this.height = minSize.height;
			return minSize;
		},
		// Actualy draw the scale on the canvas
		// @param {rectangle} chartArea : the area of the chart to draw full grid lines on
		draw: function(chartArea) {
			if (this.options.display) {

				var setContextLineSettings;

				// Make sure we draw text in the correct color
				this.ctx.fillStyle = this.options.labels.fontColor;

				if (this.isHorizontal()) {
					setContextLineSettings = true;
					var yTickStart = this.options.position == "bottom" ? this.top : this.bottom - 10;
					var yTickEnd = this.options.position == "bottom" ? this.top + 10 : this.bottom;
					var isRotated = this.labelRotation !== 0;

					helpers.each(this.data.labels, function(label, index) {
						var xLineValue = this.getPixelForValue(label, index, null, false); // xvalues for grid lines
						var xLabelValue = this.getPixelForValue(label, index, null, true); // x values for labels (need to consider offsetLabel option)

						if (this.options.gridLines.show) {
							if (index === 0) {
								// Draw the first index specially
								this.ctx.lineWidth = this.options.gridLines.zeroLineWidth;
								this.ctx.strokeStyle = this.options.gridLines.zeroLineColor;
								setContextLineSettings = true; // reset next time
							} else if (setContextLineSettings) {
								this.ctx.lineWidth = this.options.gridLines.lineWidth;
								this.ctx.strokeStyle = this.options.gridLines.color;
								setContextLineSettings = false;
							}

							xLineValue += helpers.aliasPixel(this.ctx.lineWidth);

							// Draw the label area
							this.ctx.beginPath();

							if (this.options.gridLines.drawTicks) {
								this.ctx.moveTo(xLineValue, yTickStart);
								this.ctx.lineTo(xLineValue, yTickEnd);
							}

							// Draw the chart area
							if (this.options.gridLines.drawOnChartArea) {
								this.ctx.moveTo(xLineValue, chartArea.top);
								this.ctx.lineTo(xLineValue, chartArea.bottom);
							}

							// Need to stroke in the loop because we are potentially changing line widths & colours
							this.ctx.stroke();
						}

						if (this.options.labels.show) {
							this.ctx.save();
							this.ctx.translate(xLabelValue, (isRotated) ? this.top + 12 : this.top + 8);
							this.ctx.rotate(helpers.toRadians(this.labelRotation) * -1);
							this.ctx.font = this.font;
							this.ctx.textAlign = (isRotated) ? "right" : "center";
							this.ctx.textBaseline = (isRotated) ? "middle" : "top";
							this.ctx.fillText(label, 0, 0);
							this.ctx.restore();
						}
					}, this);
				} else {
					// Vertical
					if (this.options.gridLines.show) {}

					if (this.options.labels.show) {
						// Draw the labels
					}
				}
			}
		}
	});
	Chart.scaleService.registerScaleType("category", DatasetScale, defaultConfig);
}).call(this);

(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
		display: true,
		position: "left",
		id: "y-axis-1",

		// grid line settings
		gridLines: {
			show: true,
			color: "rgba(0, 0, 0, 0.1)",
			lineWidth: 1,
			drawOnChartArea: true,
			drawTicks: true, // draw ticks extending towards the label
			zeroLineWidth: 1,
			zeroLineColor: "rgba(0,0,0,0.25)",
		},

		// scale numbers
		reverse: false,
		beginAtZero: false,
		override: null,

		// label settings
		labels: {
			show: true,
			template: "<%=value.toLocaleString()%>",
			fontSize: 12,
			fontStyle: "normal",
			fontColor: "#666",
			fontFamily: "Helvetica Neue",
		}
	};

	var LinearScale = Chart.Element.extend({
		isHorizontal: function() {
			return this.options.position == "top" || this.options.position == "bottom";
		},
		generateTicks: function(width, height) {
			// We need to decide how many ticks we are going to have. Each tick draws a grid line.
			// There are two possibilities. The first is that the user has manually overridden the scale
			// calculations in which case the job is easy. The other case is that we have to do it ourselves
			// 
			// We assume at this point that the scale object has been updated with the following values
			// by the chart.
			//  min: this is the minimum value of the scale
			//  max: this is the maximum value of the scale
			//  options: contains the options for the scale. This is referenced from the user settings
			//      rather than being cloned. This ensures that updates always propogate to a redraw

			// Reset the ticks array. Later on, we will draw a grid line at these positions
			// The array simply contains the numerical value of the spots where ticks will be
			this.ticks = [];

			if (this.options.override) {
				// The user has specified the manual override. We use <= instead of < so that 
				// we get the final line
				for (var i = 0; i <= this.options.override.steps; ++i) {
					var value = this.options.override.start + (i * this.options.override.stepWidth);
					ticks.push(value);
				}
			} else {
				// Figure out what the max number of ticks we can support it is based on the size of
				// the axis area. For now, we say that the minimum tick spacing in pixels must be 50
				// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on 
				// the graph

				var maxTicks;

				if (this.isHorizontal()) {
					maxTicks = Math.min(11, Math.ceil(width / 50));
				} else {
					// The factor of 2 used to scale the font size has been experimentally determined.
					maxTicks = Math.min(11, Math.ceil(height / (2 * this.options.labels.fontSize)));
				}

				// Make sure we always have at least 2 ticks 
				maxTicks = Math.max(2, maxTicks);

				// To get a "nice" value for the tick spacing, we will use the appropriately named 
				// "nice number" algorithm. See http://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
				// for details.

				// If we are forcing it to begin at 0, but 0 will already be rendered on the chart,
				// do nothing since that would make the chart weird. If the user really wants a weird chart
				// axis, they can manually override it
				if (this.options.beginAtZero) {
					var minSign = helpers.sign(this.min);
					var maxSign = helpers.sign(this.max);

					if (minSign < 0 && maxSign < 0) {
						// move the top up to 0
						this.max = 0;
					} else if (minSign > 0 && maxSign > 0) {
						// move the botttom down to 0
						this.min = 0;
					}
				}

				var niceRange = helpers.niceNum(this.max - this.min, false);
				var spacing = helpers.niceNum(niceRange / (maxTicks - 1), true);
				var niceMin = Math.floor(this.min / spacing) * spacing;
				var niceMax = Math.ceil(this.max / spacing) * spacing;

				// Put the values into the ticks array
				for (var j = niceMin; j <= niceMax; j += spacing) {
					this.ticks.push(j);
				}
			}

			if (this.options.position == "left" || this.options.position == "right") {
				// We are in a vertical orientation. The top value is the highest. So reverse the array
				this.ticks.reverse();
			}

			// At this point, we need to update our max and min given the tick values since we have expanded the
			// range of the scale
			this.max = helpers.max(this.ticks);
			this.min = helpers.min(this.ticks);

			if (this.options.reverse) {
				this.ticks.reverse();

				this.start = this.max;
				this.end = this.min;
			} else {
				this.start = this.min;
				this.end = this.max;
			}
		},
		buildLabels: function() {
			// We assume that this has been run after ticks have been generated. We try to figure out
			// a label for each tick. 
			this.labels = [];

			helpers.each(this.ticks, function(tick, index, ticks) {
				var label;

				if (this.options.labels.userCallback) {
					// If the user provided a callback for label generation, use that as first priority
					label = this.options.labels.userCallback(tick, index, ticks);
				} else if (this.options.labels.template) {
					// else fall back to the template string
					label = helpers.template(this.options.labels.template, {
						value: tick
					});
				}

				this.labels.push(label ? label : ""); // empty string will not render so we're good
			}, this);
		},
		// Get the correct value. If the value type is object get the x or y based on whether we are horizontal or not
		getRightValue: function(rawValue) {
			return typeof rawValue === "object" ? (this.isHorizontal() ? rawValue.x : rawValue.y) : rawValue;
		},
		getPixelForValue: function(value) {
			// This must be called after fit has been run so that 
			//      this.left, this.top, this.right, and this.bottom have been defined
			var pixel;
			var range = this.end - this.start;

			if (this.isHorizontal()) {
				pixel = this.left + (this.width / range * (value - this.start));
			} else {
				// Bottom - top since pixels increase downard on a screen
				pixel = this.bottom - (this.height / range * (value - this.start));
			}

			return pixel;
		},

		// Functions needed for line charts
		calculateRange: function() {
			this.min = null;
			this.max = null;

			var positiveValues = [];
			var negativeValues = [];

			if (this.options.stacked) {
				helpers.each(this.data.datasets, function(dataset) {
					if (this.isHorizontal() ? dataset.xAxisID === this.id : dataset.yAxisID === this.id) {
						helpers.each(dataset.data, function(rawValue, index) {

							var value = this.getRightValue(rawValue);

							positiveValues[index] = positiveValues[index] || 0;
							negativeValues[index] = negativeValues[index] || 0;

							if (this.options.relativePoints) {
								positiveValues[index] = 100;
							} else {
								if (value < 0) {
									negativeValues[index] += value;
								} else {
									positiveValues[index] += value;
								}
							}
						}, this);
					}
				}, this);

				var values = positiveValues.concat(negativeValues);
				this.min = helpers.min(values);
				this.max = helpers.max(values);

			} else {
				helpers.each(this.data.datasets, function(dataset) {
					if (this.isHorizontal() ? dataset.xAxisID === this.id : dataset.yAxisID === this.id) {
						helpers.each(dataset.data, function(rawValue, index) {
							var value = this.getRightValue(rawValue);

							if (this.min === null) {
								this.min = value;
							} else if (value < this.min) {
								this.min = value;
							}

							if (this.max === null) {
								this.max = value;
							} else if (value > this.max) {
								this.max = value;
							}
						}, this);
					}
				}, this);
			}

			if (this.min === this.max) {
				this.min--;
				this.max++;
			}
		},

		getPointPixelForValue: function(rawValue, index, datasetIndex) {
			var value = this.getRightValue(rawValue);

			if (this.options.stacked) {
				var offsetPos = 0;
				var offsetNeg = 0;

				for (var i = 0; i < datasetIndex; ++i) {
					if (this.data.datasets[i].data[index] < 0) {
						offsetNeg += this.data.datasets[i].data[index];
					} else {
						offsetPos += this.data.datasets[i].data[index];
					}
				}

				if (value < 0) {
					return this.getPixelForValue(offsetNeg + value);
				} else {
					return this.getPixelForValue(offsetPos + value);
				}
			} else {
				return this.getPixelForValue(value);
			}
		},

		// Functions needed for bar charts
		calculateBarBase: function(datasetIndex, index) {
			var base = 0;

			if (this.options.stacked) {

				var value = this.data.datasets[datasetIndex].data[index];

				if (value < 0) {
					for (var i = 0; i < datasetIndex; i++) {
						if (this.data.datasets[i].yAxisID === this.id) {
							base += this.data.datasets[i].data[index] < 0 ? this.data.datasets[i].data[index] : 0;
						}
					}
				} else {
					for (var j = 0; j < datasetIndex; j++) {
						if (this.data.datasets[j].yAxisID === this.id) {
							base += this.data.datasets[j].data[index] > 0 ? this.data.datasets[j].data[index] : 0;
						}
					}
				}

				return this.getPixelForValue(base);
			}

			base = this.getPixelForValue(this.min);

			if (this.beginAtZero || ((this.min <= 0 && this.max >= 0) || (this.min >= 0 && this.max <= 0))) {
				base = this.getPixelForValue(0);
				base += this.options.gridLines.lineWidth;
			} else if (this.min < 0 && this.max < 0) {
				// All values are negative. Use the top as the base
				base = this.getPixelForValue(this.max);
			}

			return base;

		},
		calculateBarY: function(datasetIndex, index) {
			var value = this.data.datasets[datasetIndex].data[index];

			if (this.options.stacked) {

				var sumPos = 0,
					sumNeg = 0;

				for (var i = 0; i < datasetIndex; i++) {
					if (this.data.datasets[i].data[index] < 0) {
						sumNeg += this.data.datasets[i].data[index] || 0;
					} else {
						sumPos += this.data.datasets[i].data[index] || 0;
					}
				}

				if (value < 0) {
					return this.getPixelForValue(sumNeg + value);
				} else {
					return this.getPixelForValue(sumPos + value);
				}

				return this.getPixelForValue(value);
			}

			var offset = 0;

			for (var j = datasetIndex; j < this.data.datasets.length; j++) {
				if (j === datasetIndex && value) {
					offset += value;
				} else {
					offset = offset + value;
				}
			}

			return this.getPixelForValue(value);
		},

		// Fit this axis to the given size
		// @param {number} maxWidth : the max width the axis can be
		// @param {number} maxHeight: the max height the axis can be
		// @return {object} minSize : the minimum size needed to draw the axis
		fit: function(maxWidth, maxHeight) {
			this.calculateRange();
			this.generateTicks(maxWidth, maxHeight);
			this.buildLabels();

			var minSize = {
				width: 0,
				height: 0,
			};

			// In a horizontal axis, we need some room for the scale to be drawn
			//
			//      -----------------------------------------------------
			//          |           |           |           |           |
			//
			// In a vertical axis, we need some room for the scale to be drawn.
			// The actual grid lines will be drawn on the chart area, however, we need to show 
			// ticks where the axis actually is.
			// We will allocate 25px for this width
			//      |
			//     -|
			//      |
			//      |
			//     -|
			//      |
			//      |
			//     -|


			// Width
			if (this.isHorizontal()) {
				minSize.width = maxWidth; // fill all the width
			} else {
				minSize.width = this.options.gridLines.show && this.options.display ? 10 : 0;
			}

			// height
			if (this.isHorizontal()) {
				minSize.height = this.options.gridLines.show && this.options.display ? 10 : 0;
			} else {
				minSize.height = maxHeight; // fill all the height
			}



			if (this.options.labels.show && this.options.display) {
				// Don't bother fitting the labels if we are not showing them
				var labelFont = helpers.fontString(this.options.labels.fontSize,
					this.options.labels.fontStyle, this.options.labels.fontFamily);

				if (this.isHorizontal()) {
					// A horizontal axis is more constrained by the height.
					var maxLabelHeight = maxHeight - minSize.height;
					var labelHeight = 1.5 * this.options.labels.fontSize;
					minSize.height = Math.min(maxHeight, minSize.height + labelHeight);
				} else {
					// A vertical axis is more constrained by the width. Labels are the dominant factor 
					// here, so get that length first
					var maxLabelWidth = maxWidth - minSize.width;
					var largestTextWidth = helpers.longestText(this.ctx, labelFont, this.labels);

					if (largestTextWidth < maxLabelWidth) {
						// We don't need all the room
						minSize.width += largestTextWidth;
					} else {
						// Expand to max size
						minSize.width = maxWidth;
					}
				}
			}

			this.width = minSize.width;
			this.height = minSize.height;
			return minSize;
		},
		// Actualy draw the scale on the canvas
		// @param {rectangle} chartArea : the area of the chart to draw full grid lines on
		draw: function(chartArea) {
			if (this.options.display) {

				var setContextLineSettings;
				var hasZero;

				// Make sure we draw text in the correct color
				this.ctx.fillStyle = this.options.labels.fontColor;

				if (this.isHorizontal()) {
					if (this.options.gridLines.show) {
						// Draw the horizontal line
						setContextLineSettings = true;
						hasZero = helpers.findNextWhere(this.ticks, function(tick) {
							return tick === 0;
						}) !== undefined;
						var yTickStart = this.options.position == "bottom" ? this.top : this.bottom - 5;
						var yTickEnd = this.options.position == "bottom" ? this.top + 5 : this.bottom;

						helpers.each(this.ticks, function(tick, index) {
							// Grid lines are vertical
							var xValue = this.getPixelForValue(tick);

							if (tick === 0 || (!hasZero && index === 0)) {
								// Draw the 0 point specially or the left if there is no 0
								this.ctx.lineWidth = this.options.gridLines.zeroLineWidth;
								this.ctx.strokeStyle = this.options.gridLines.zeroLineColor;
								setContextLineSettings = true; // reset next time
							} else if (setContextLineSettings) {
								this.ctx.lineWidth = this.options.gridLines.lineWidth;
								this.ctx.strokeStyle = this.options.gridLines.color;
								setContextLineSettings = false;
							}

							xValue += helpers.aliasPixel(this.ctx.lineWidth);

							// Draw the label area
							this.ctx.beginPath();

							if (this.options.gridLines.drawTicks) {
								this.ctx.moveTo(xValue, yTickStart);
								this.ctx.lineTo(xValue, yTickEnd);
							}

							// Draw the chart area
							if (this.options.gridLines.drawOnChartArea) {
								this.ctx.moveTo(xValue, chartArea.top);
								this.ctx.lineTo(xValue, chartArea.bottom);
							}

							// Need to stroke in the loop because we are potentially changing line widths & colours
							this.ctx.stroke();
						}, this);
					}

					if (this.options.labels.show) {
						// Draw the labels

						var labelStartY;

						if (this.options.position == "top") {
							labelStartY = this.bottom - 10;
							this.ctx.textBaseline = "bottom";
						} else {
							// bottom side
							labelStartY = this.top + 10;
							this.ctx.textBaseline = "top";
						}

						this.ctx.textAlign = "center";
						this.ctx.font = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);

						helpers.each(this.labels, function(label, index) {
							var xValue = this.getPixelForValue(this.ticks[index]);
							this.ctx.fillText(label, xValue, labelStartY);
						}, this);
					}
				} else {
					// Vertical
					if (this.options.gridLines.show) {

						// Draw the vertical line
						setContextLineSettings = true;
						hasZero = helpers.findNextWhere(this.ticks, function(tick) {
							return tick === 0;
						}) !== undefined;
						var xTickStart = this.options.position == "right" ? this.left : this.right - 5;
						var xTickEnd = this.options.position == "right" ? this.left + 5 : this.right;

						helpers.each(this.ticks, function(tick, index) {
							// Grid lines are horizontal
							var yValue = this.getPixelForValue(tick);

							if (tick === 0 || (!hasZero && index === 0)) {
								// Draw the 0 point specially or the bottom if there is no 0
								this.ctx.lineWidth = this.options.gridLines.zeroLineWidth;
								this.ctx.strokeStyle = this.options.gridLines.zeroLineColor;
								setContextLineSettings = true; // reset next time
							} else if (setContextLineSettings) {
								this.ctx.lineWidth = this.options.gridLines.lineWidth;
								this.ctx.strokeStyle = this.options.gridLines.color;
								setContextLineSettings = false; // use boolean to indicate that we only want to do this once
							}

							yValue += helpers.aliasPixel(this.ctx.lineWidth);

							// Draw the label area
							this.ctx.beginPath();

							if (this.options.gridLines.drawTicks) {
								this.ctx.moveTo(xTickStart, yValue);
								this.ctx.lineTo(xTickEnd, yValue);
							}

							// Draw the chart area
							if (this.options.gridLines.drawOnChartArea) {
								this.ctx.moveTo(chartArea.left, yValue);
								this.ctx.lineTo(chartArea.right, yValue);
							}

							this.ctx.stroke();
						}, this);
					}

					if (this.options.labels.show) {
						// Draw the labels

						var labelStartX;

						if (this.options.position == "left") {
							labelStartX = this.right - 10;
							this.ctx.textAlign = "right";
						} else {
							// right side
							labelStartX = this.left + 5;
							this.ctx.textAlign = "left";
						}

						this.ctx.textBaseline = "middle";
						this.ctx.font = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);

						helpers.each(this.labels, function(label, index) {
							var yValue = this.getPixelForValue(this.ticks[index]);
							this.ctx.fillText(label, labelStartX, yValue);
						}, this);
					}
				}
			}
		}
	});
	Chart.scaleService.registerScaleType("linear", LinearScale, defaultConfig);

}).call(this);

(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
		display: true,

		//Boolean - Whether to animate scaling the chart from the centre
		animate: true,

		lineArc: false,

		// grid line settings
		gridLines: {
			show: true,
			color: "rgba(0, 0, 0, 0.1)",
			lineWidth: 1,
		},

		angleLines: {
			show: true,
			color: "rgba(0,0,0, 0.1)",
			lineWidth: 1
		},

		// scale numbers
		beginAtZero: true,

		// label settings
		labels: {
			show: true,
			template: "<%=value.toLocaleString()%>",
			fontSize: 12,
			fontStyle: "normal",
			fontColor: "#666",
			fontFamily: "Helvetica Neue",

			//Boolean - Show a backdrop to the scale label
			showLabelBackdrop: true,

			//String - The colour of the label backdrop
			backdropColor: "rgba(255,255,255,0.75)",

			//Number - The backdrop padding above & below the label in pixels
			backdropPaddingY: 2,

			//Number - The backdrop padding to the side of the label in pixels
			backdropPaddingX: 2,
		},

		pointLabels: {
			//String - Point label font declaration
			fontFamily: "'Arial'",

			//String - Point label font weight
			fontStyle: "normal",

			//Number - Point label font size in pixels
			fontSize: 10,

			//String - Point label font colour
			fontColor: "#666",
		},
	};

	var LinearRadialScale = Chart.Element.extend({
		initialize: function() {
			this.height = this.chart.height;
			this.width = this.chart.width;
			this.xCenter = this.chart.width / 2;
			this.yCenter = this.chart.height / 2;
			this.size = helpers.min([this.height, this.width]);
			this.valuesCount = this.data.labels.length;
			this.labels = this.data.labels;
			this.drawingArea = (this.options.display) ? (this.size / 2) - (this.options.labels.fontSize / 2 + this.options.labels.backdropPaddingY) : (this.size / 2);
		},
		update: function() {
			if (!this.options.lineArc) {
				this.setScaleSize();
			} else {
				this.drawingArea = (this.options.display) ? (this.size / 2) - (this.fontSize / 2 + this.backdropPaddingY) : (this.size / 2);
			}

			this.buildYLabels();
		},
		calculateRange: function() {
			this.min = null;
			this.max = null;

			helpers.each(this.data.datasets, function(dataset) {
				helpers.each(dataset.data, function(value, index) {
					if (this.min === null) {
						this.min = value;
					} else if (value < this.min) {
						this.min = value;
					}

					if (this.max === null) {
						this.max = value;
					} else if (value > this.max) {
						this.max = value;
					}
				}, this);
			}, this);
		},
		generateTicks: function() {
			// We need to decide how many ticks we are going to have. Each tick draws a grid line.
			// There are two possibilities. The first is that the user has manually overridden the scale
			// calculations in which case the job is easy. The other case is that we have to do it ourselves
			// 
			// We assume at this point that the scale object has been updated with the following values
			// by the chart.
			//  min: this is the minimum value of the scale
			//  max: this is the maximum value of the scale
			//  options: contains the options for the scale. This is referenced from the user settings
			//      rather than being cloned. This ensures that updates always propogate to a redraw

			// Reset the ticks array. Later on, we will draw a grid line at these positions
			// The array simply contains the numerical value of the spots where ticks will be
			this.ticks = [];

			if (this.options.override) {
				// The user has specified the manual override. We use <= instead of < so that 
				// we get the final line
				for (var i = 0; i <= this.options.override.steps; ++i) {
					var value = this.options.override.start + (i * this.options.override.stepWidth);
					ticks.push(value);
				}
			} else {
				// Figure out what the max number of ticks we can support it is based on the size of
				// the axis area. For now, we say that the minimum tick spacing in pixels must be 50
				// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on 
				// the graph

				var maxTicks = Math.min(11, Math.ceil(this.drawingArea / (2 * this.options.labels.fontSize)));

				// Make sure we always have at least 2 ticks 
				maxTicks = Math.max(2, maxTicks);

				// To get a "nice" value for the tick spacing, we will use the appropriately named 
				// "nice number" algorithm. See http://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
				// for details.

				// If we are forcing it to begin at 0, but 0 will already be rendered on the chart,
				// do nothing since that would make the chart weird. If the user really wants a weird chart
				// axis, they can manually override it
				if (this.options.beginAtZero) {
					var minSign = helpers.sign(this.min);
					var maxSign = helpers.sign(this.max);

					if (minSign < 0 && maxSign < 0) {
						// move the top up to 0
						this.max = 0;
					} else if (minSign > 0 && maxSign > 0) {
						// move the botttom down to 0
						this.min = 0;
					}
				}

				var niceRange = helpers.niceNum(this.max - this.min, false);
				var spacing = helpers.niceNum(niceRange / (maxTicks - 1), true);
				var niceMin = Math.floor(this.min / spacing) * spacing;
				var niceMax = Math.ceil(this.max / spacing) * spacing;

				// Put the values into the ticks array
				for (var j = niceMin; j <= niceMax; j += spacing) {
					this.ticks.push(j);
				}
			}

			if (this.options.position == "left" || this.options.position == "right") {
				// We are in a vertical orientation. The top value is the highest. So reverse the array
				this.ticks.reverse();
			}

			// At this point, we need to update our max and min given the tick values since we have expanded the
			// range of the scale
			this.max = helpers.max(this.ticks);
			this.min = helpers.min(this.ticks);
		},
		buildYLabels: function() {
			this.yLabels = [];

			helpers.each(this.ticks, function(tick, index, ticks) {
				var label;

				if (this.options.labels.userCallback) {
					// If the user provided a callback for label generation, use that as first priority
					label = this.options.labels.userCallback(tick, index, ticks);
				} else if (this.options.labels.template) {
					// else fall back to the template string
					label = helpers.template(this.options.labels.template, {
						value: tick
					});
				}

				this.yLabels.push(label ? label : "");
			}, this);
		},
		getCircumference: function() {
			return ((Math.PI * 2) / this.valuesCount);
		},
		setScaleSize: function() {
			/*
			 * Right, this is really confusing and there is a lot of maths going on here
			 * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
			 *
			 * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
			 *
			 * Solution:
			 *
			 * We assume the radius of the polygon is half the size of the canvas at first
			 * at each index we check if the text overlaps.
			 *
			 * Where it does, we store that angle and that index.
			 *
			 * After finding the largest index and angle we calculate how much we need to remove
			 * from the shape radius to move the point inwards by that x.
			 *
			 * We average the left and right distances to get the maximum shape radius that can fit in the box
			 * along with labels.
			 *
			 * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
			 * on each side, removing that from the size, halving it and adding the left x protrusion width.
			 *
			 * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
			 * and position it in the most space efficient manner
			 *
			 * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
			 */


			// Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
			// Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
			var largestPossibleRadius = helpers.min([(this.height / 2 - this.options.pointLabels.fontSize - 5), this.width / 2]),
				pointPosition,
				i,
				textWidth,
				halfTextWidth,
				furthestRight = this.width,
				furthestRightIndex,
				furthestRightAngle,
				furthestLeft = 0,
				furthestLeftIndex,
				furthestLeftAngle,
				xProtrusionLeft,
				xProtrusionRight,
				radiusReductionRight,
				radiusReductionLeft,
				maxWidthRadius;
			this.ctx.font = helpers.fontString(this.options.pointLabels.fontSize, this.options.pointLabels.fontStyle, this.options.pointLabels.fontFamily);
			for (i = 0; i < this.valuesCount; i++) {
				// 5px to space the text slightly out - similar to what we do in the draw function.
				pointPosition = this.getPointPosition(i, largestPossibleRadius);
				textWidth = this.ctx.measureText(helpers.template(this.options.labels.template, {
					value: this.labels[i]
				})).width + 5;
				if (i === 0 || i === this.valuesCount / 2) {
					// If we're at index zero, or exactly the middle, we're at exactly the top/bottom
					// of the radar chart, so text will be aligned centrally, so we'll half it and compare
					// w/left and right text sizes
					halfTextWidth = textWidth / 2;
					if (pointPosition.x + halfTextWidth > furthestRight) {
						furthestRight = pointPosition.x + halfTextWidth;
						furthestRightIndex = i;
					}
					if (pointPosition.x - halfTextWidth < furthestLeft) {
						furthestLeft = pointPosition.x - halfTextWidth;
						furthestLeftIndex = i;
					}
				} else if (i < this.valuesCount / 2) {
					// Less than half the values means we'll left align the text
					if (pointPosition.x + textWidth > furthestRight) {
						furthestRight = pointPosition.x + textWidth;
						furthestRightIndex = i;
					}
				} else if (i > this.valuesCount / 2) {
					// More than half the values means we'll right align the text
					if (pointPosition.x - textWidth < furthestLeft) {
						furthestLeft = pointPosition.x - textWidth;
						furthestLeftIndex = i;
					}
				}
			}

			xProtrusionLeft = furthestLeft;

			xProtrusionRight = Math.ceil(furthestRight - this.width);

			furthestRightAngle = this.getIndexAngle(furthestRightIndex);

			furthestLeftAngle = this.getIndexAngle(furthestLeftIndex);

			radiusReductionRight = xProtrusionRight / Math.sin(furthestRightAngle + Math.PI / 2);

			radiusReductionLeft = xProtrusionLeft / Math.sin(furthestLeftAngle + Math.PI / 2);

			// Ensure we actually need to reduce the size of the chart
			radiusReductionRight = (helpers.isNumber(radiusReductionRight)) ? radiusReductionRight : 0;
			radiusReductionLeft = (helpers.isNumber(radiusReductionLeft)) ? radiusReductionLeft : 0;

			this.drawingArea = largestPossibleRadius - (radiusReductionLeft + radiusReductionRight) / 2;

			//this.drawingArea = min([maxWidthRadius, (this.height - (2 * (this.pointLabelFontSize + 5)))/2])
			this.setCenterPoint(radiusReductionLeft, radiusReductionRight);

		},
		setCenterPoint: function(leftMovement, rightMovement) {

			var maxRight = this.width - rightMovement - this.drawingArea,
				maxLeft = leftMovement + this.drawingArea;

			this.xCenter = (maxLeft + maxRight) / 2;
			// Always vertically in the centre as the text height doesn't change
			this.yCenter = (this.height / 2);
		},

		getIndexAngle: function(index) {
			var angleMultiplier = (Math.PI * 2) / this.valuesCount;
			// Start from the top instead of right, so remove a quarter of the circle

			return index * angleMultiplier - (Math.PI / 2);
		},
		getDistanceFromCenterForValue: function(value) {
			// Take into account half font size + the yPadding of the top value
			var scalingFactor = this.drawingArea / (this.max - this.min);
			return (value - this.min) * scalingFactor;
		},
		getPointPosition: function(index, distanceFromCenter) {
			var thisAngle = this.getIndexAngle(index);
			return {
				x: (Math.cos(thisAngle) * distanceFromCenter) + this.xCenter,
				y: (Math.sin(thisAngle) * distanceFromCenter) + this.yCenter
			};
		},
		getPointPositionForValue: function(index, value) {
			return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
		},
		draw: function() {
			if (this.options.display) {
				var ctx = this.ctx;
				helpers.each(this.yLabels, function(label, index) {
					// Don't draw a centre value
					if (index > 0) {
						var yCenterOffset = this.getDistanceFromCenterForValue(this.ticks[index]);
						var yHeight = this.yCenter - yCenterOffset;

						// Draw circular lines around the scale
						if (this.options.gridLines.show) {
							ctx.strokeStyle = this.options.gridLines.color;
							ctx.lineWidth = this.options.gridLines.lineWidth;

							if (this.options.lineArc) {
								// Draw circular arcs between the points
								ctx.beginPath();
								ctx.arc(this.xCenter, this.yCenter, yCenterOffset, 0, Math.PI * 2);
								ctx.closePath();
								ctx.stroke();
							} else {
								// Draw straight lines connecting each index
								ctx.beginPath();
								for (var i = 0; i < this.valuesCount; i++) {
									var pointPosition = this.getPointPosition(i, this.getDistanceFromCenterForValue(this.ticks[index]));
									if (i === 0) {
										ctx.moveTo(pointPosition.x, pointPosition.y);
									} else {
										ctx.lineTo(pointPosition.x, pointPosition.y);
									}
								}
								ctx.closePath();
								ctx.stroke();
							}
						}

						if (this.options.labels.show) {
							ctx.font = helpers.fontString(this.options.labels.fontSize, this.options.labels.fontStyle, this.options.labels.fontFamily);

							if (this.options.labels.showLabelBackdrop) {
								var labelWidth = ctx.measureText(label).width;
								ctx.fillStyle = this.options.labels.backdropColor;
								ctx.fillRect(
									this.xCenter - labelWidth / 2 - this.options.labels.backdropPaddingX,
									yHeight - this.fontSize / 2 - this.options.labels.backdropPaddingY,
									labelWidth + this.options.labels.backdropPaddingX * 2,
									this.options.labels.fontSize + this.options.labels.backdropPaddingY * 2
								);
							}

							ctx.textAlign = 'center';
							ctx.textBaseline = "middle";
							ctx.fillStyle = this.options.labels.fontColor;
							ctx.fillText(label, this.xCenter, yHeight);
						}
					}
				}, this);

				if (!this.options.lineArc) {
					ctx.lineWidth = this.options.angleLines.lineWidth;
					ctx.strokeStyle = this.options.angleLines.color;

					for (var i = this.valuesCount - 1; i >= 0; i--) {
						if (this.options.angleLines.show) {
							var outerPosition = this.getPointPosition(i, this.getDistanceFromCenterForValue(this.max));
							ctx.beginPath();
							ctx.moveTo(this.xCenter, this.yCenter);
							ctx.lineTo(outerPosition.x, outerPosition.y);
							ctx.stroke();
							ctx.closePath();
						}
						// Extra 3px out for some label spacing
						var pointLabelPosition = this.getPointPosition(i, this.getDistanceFromCenterForValue(this.max) + 5);
						ctx.font = helpers.fontString(this.options.pointLabels.fontSize, this.options.pointLabels.fontStyle, this.options.pointLabels.fontFamily);
						ctx.fillStyle = this.options.pointLabels.fontColor;

						var labelsCount = this.labels.length,
							halfLabelsCount = this.labels.length / 2,
							quarterLabelsCount = halfLabelsCount / 2,
							upperHalf = (i < quarterLabelsCount || i > labelsCount - quarterLabelsCount),
							exactQuarter = (i === quarterLabelsCount || i === labelsCount - quarterLabelsCount);
						if (i === 0) {
							ctx.textAlign = 'center';
						} else if (i === halfLabelsCount) {
							ctx.textAlign = 'center';
						} else if (i < halfLabelsCount) {
							ctx.textAlign = 'left';
						} else {
							ctx.textAlign = 'right';
						}

						// Set the correct text baseline based on outer positioning
						if (exactQuarter) {
							ctx.textBaseline = 'middle';
						} else if (upperHalf) {
							ctx.textBaseline = 'bottom';
						} else {
							ctx.textBaseline = 'top';
						}

						ctx.fillText(this.labels[i], pointLabelPosition.x, pointLabelPosition.y);
					}
				}
			}
		}
	});
	Chart.scaleService.registerScaleType("radialLinear", LinearRadialScale, defaultConfig);


}).call(this);

/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 2.0.0-alpha
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.global.elements.arc = {
		backgroundColor: Chart.defaults.global.defaultColor,
		borderColor: "#fff",
		borderWidth: 2
	};

	Chart.elements.Arc = Chart.Element.extend({
		inLabelRange: function(mouseX) {
			var vm = this._view;

			if (vm) {
				return (Math.pow(mouseX - vm.x, 2) < Math.pow(vm.radius + vm.hoverRadius, 2));
			} else {
				return false;
			}
		},
		inRange: function(chartX, chartY) {

			var vm = this._view;

			var pointRelativePosition = helpers.getAngleFromPoint(vm, {
				x: chartX,
				y: chartY
			});

			// Put into the range of (-PI/2, 3PI/2]
			var startAngle = vm.startAngle < (-0.5 * Math.PI) ? vm.startAngle + (2.0 * Math.PI) : vm.startAngle > (1.5 * Math.PI) ? vm.startAngle - (2.0 * Math.PI) : vm.startAngle;
			var endAngle = vm.endAngle < (-0.5 * Math.PI) ? vm.endAngle + (2.0 * Math.PI) : vm.endAngle > (1.5 * Math.PI) ? vm.endAngle - (2.0 * Math.PI) : vm.endAngle

			//Check if within the range of the open/close angle
			var betweenAngles = (pointRelativePosition.angle >= startAngle && pointRelativePosition.angle <= endAngle),
				withinRadius = (pointRelativePosition.distance >= vm.innerRadius && pointRelativePosition.distance <= vm.outerRadius);

			return (betweenAngles && withinRadius);
			//Ensure within the outside of the arc centre, but inside arc outer
		},
		tooltipPosition: function() {
			var vm = this._view;

			var centreAngle = vm.startAngle + ((vm.endAngle - vm.startAngle) / 2),
				rangeFromCentre = (vm.outerRadius - vm.innerRadius) / 2 + vm.innerRadius;
			return {
				x: vm.x + (Math.cos(centreAngle) * rangeFromCentre),
				y: vm.y + (Math.sin(centreAngle) * rangeFromCentre)
			};
		},
		draw: function() {

			var ctx = this._chart.ctx;
			var vm = this._view;

			ctx.beginPath();

			ctx.arc(vm.x, vm.y, vm.outerRadius, vm.startAngle, vm.endAngle);

			ctx.arc(vm.x, vm.y, vm.innerRadius, vm.endAngle, vm.startAngle, true);

			ctx.closePath();
			ctx.strokeStyle = vm.borderColor;
			ctx.lineWidth = vm.borderWidth;

			ctx.fillStyle = vm.backgroundColor;

			ctx.fill();
			ctx.lineJoin = 'bevel';

			if (vm.borderWidth) {
				ctx.stroke();
			}
		}
	});


}).call(this);

/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 2.0.0-alpha
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.global.elements.line = {
		tension: 0.4,
		backgroundColor: Chart.defaults.global.defaultColor,
		borderWidth: 3,
		borderColor: Chart.defaults.global.defaultColor,
		fill: true, // do we fill in the area between the line and its base axis
		skipNull: true,
		drawNull: false,
	};


	Chart.elements.Line = Chart.Element.extend({
		draw: function() {

			var vm = this._view;
			var ctx = this._chart.ctx;
			var first = this._children[0];
			var last = this._children[this._children.length - 1];

			// Draw the background first (so the border is always on top)
			helpers.each(this._children, function(point, index) {
				var previous = helpers.previousItem(this._children, index);
				var next = helpers.nextItem(this._children, index);

				// First point only
				if (index === 0) {
					ctx.moveTo(point._view.x, point._view.y);
					return;
				}

				// Start Skip and drag along scale baseline
				if (point._view.skip && vm.skipNull && !this._loop) {
					ctx.lineTo(previous._view.x, point._view.y);
					ctx.moveTo(next._view.x, point._view.y);
				}
				// End Skip Stright line from the base line
				else if (previous._view.skip && vm.skipNull && !this._loop) {
					ctx.moveTo(point._view.x, previous._view.y);
					ctx.lineTo(point._view.x, point._view.y);
				}

				if (previous._view.skip && vm.skipNull) {
					ctx.moveTo(point._view.x, point._view.y);
				}
				// Normal Bezier Curve
				else {
					if (vm.tension > 0) {
						ctx.bezierCurveTo(
							previous._view.controlPointNextX,
							previous._view.controlPointNextY,
							point._view.controlPointPreviousX,
							point._view.controlPointPreviousY,
							point._view.x,
							point._view.y
						);
					} else {
						ctx.lineTo(point._view.x, point._view.y);
					}
				}
			}, this);

			// For radial scales, loop back around to the first point
			if (this._loop) {
				if (vm.tension > 0 && !first._view.skip) {

					ctx.bezierCurveTo(
						last._view.controlPointNextX,
						last._view.controlPointNextY,
						first._view.controlPointPreviousX,
						first._view.controlPointPreviousY,
						first._view.x,
						first._view.y
					);
				} else {
					ctx.lineTo(first._view.x, first._view.y);
				}
			}

			// If we had points and want to fill this line, do so.
			if (this._children.length > 0 && vm.fill) {
				//Round off the line by going to the base of the chart, back to the start, then fill.
				ctx.lineTo(this._children[this._children.length - 1]._view.x, vm.scaleZero);
				ctx.lineTo(this._children[0]._view.x, vm.scaleZero);
				ctx.fillStyle = vm.backgroundColor || Chart.defaults.global.defaultColor;
				ctx.closePath();
				ctx.fill();
			}


			// Now draw the line between all the points with any borders
			ctx.lineWidth = vm.borderWidth || Chart.defaults.global.defaultColor;
			ctx.strokeStyle = vm.borderColor || Chart.defaults.global.defaultColor;
			ctx.beginPath();

			helpers.each(this._children, function(point, index) {
				var previous = helpers.previousItem(this._children, index);
				var next = helpers.nextItem(this._children, index);

				// First point only
				if (index === 0) {
					ctx.moveTo(point._view.x, point._view.y);
					return;
				}

				// Start Skip and drag along scale baseline
				if (point._view.skip && vm.skipNull && !this._loop) {
					ctx.moveTo(previous._view.x, point._view.y);
					ctx.moveTo(next._view.x, point._view.y);
					return;
				}
				// End Skip Stright line from the base line
				if (previous._view.skip && vm.skipNull && !this._loop) {
					ctx.moveTo(point._view.x, previous._view.y);
					ctx.moveTo(point._view.x, point._view.y);
					return;
				}

				if (previous._view.skip && vm.skipNull) {
					ctx.moveTo(point._view.x, point._view.y);
					return;
				}
				// Normal Bezier Curve
				if (vm.tension > 0) {
					ctx.bezierCurveTo(
						previous._view.controlPointNextX,
						previous._view.controlPointNextY,
						point._view.controlPointPreviousX,
						point._view.controlPointPreviousY,
						point._view.x,
						point._view.y
					);
				} else {
					ctx.lineTo(point._view.x, point._view.y);
				}
			}, this);

			if (this._loop && !first._view.skip) {
				if (vm.tension > 0) {

					ctx.bezierCurveTo(
						last._view.controlPointNextX,
						last._view.controlPointNextY,
						first._view.controlPointPreviousX,
						first._view.controlPointPreviousY,
						first._view.x,
						first._view.y
					);
				} else {
					ctx.lineTo(first._view.x, first._view.y);
				}
			}


			ctx.stroke();

		},
	});

}).call(this);

/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 2.0.0-alpha
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.global.elements.point = {
		radius: 3,
		backgroundColor: Chart.defaults.global.defaultColor,
		borderWidth: 1,
		borderColor: Chart.defaults.global.defaultColor,
		// Hover
		hitRadius: 1,
		hoverRadius: 4,
		hoverBorderWidth: 1,
	};


	Chart.elements.Point = Chart.Element.extend({
		inRange: function(mouseX, mouseY) {
			var vm = this._view;
			var hoverRange = vm.hitRadius + vm.radius;
			return ((Math.pow(mouseX - vm.x, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(hoverRange, 2));
		},
		inLabelRange: function(mouseX) {
			var vm = this._view;

			if (vm) {
				return (Math.pow(mouseX - vm.x, 2) < Math.pow(vm.radius + vm.hitRadius, 2));
			} else {
				return false;
			}
		},
		tooltipPosition: function() {
			var vm = this._view;
			return {
				x: vm.x,
				y: vm.y,
				padding: vm.radius + vm.borderWidth
			};
		},
		draw: function() {

			var vm = this._view;
			var ctx = this._chart.ctx;


			if (vm.skip) {
				return;
			}

			if (vm.radius > 0 || vm.borderWidth > 0) {

				ctx.beginPath();

				ctx.arc(vm.x, vm.y, vm.radius || Chart.defaults.global.elements.point.radius, 0, Math.PI * 2);
				ctx.closePath();

				ctx.strokeStyle = vm.borderColor || Chart.defaults.global.defaultColor;
				ctx.lineWidth = vm.borderWidth || Chart.defaults.global.elements.point.borderWidth;

				ctx.fillStyle = vm.backgroundColor || Chart.defaults.global.defaultColor;

				ctx.fill();
				ctx.stroke();
			}
		}
	});


}).call(this);

(function() {

	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.defaults.global.elements.rectangle = {
		backgroundColor: Chart.defaults.global.defaultColor,
		borderWidth: 0,
		borderColor: Chart.defaults.global.defaultColor,
	};

	Chart.elements.Rectangle = Chart.Element.extend({
		draw: function() {

			var ctx = this._chart.ctx;
			var vm = this._view;

			var halfWidth = vm.width / 2,
				leftX = vm.x - halfWidth,
				rightX = vm.x + halfWidth,
				top = vm.base - (vm.base - vm.y),
				halfStroke = vm.borderWidth / 2;

			// Canvas doesn't allow us to stroke inside the width so we can
			// adjust the sizes to fit if we're setting a stroke on the line
			if (vm.borderWidth) {
				leftX += halfStroke;
				rightX -= halfStroke;
				top += halfStroke;
			}

			ctx.beginPath();

			ctx.fillStyle = vm.backgroundColor;
			ctx.strokeStyle = vm.borderColor;
			ctx.lineWidth = vm.borderWidth;

			// It'd be nice to keep this class totally generic to any rectangle
			// and simply specify which border to miss out.
			ctx.moveTo(leftX, vm.base);
			ctx.lineTo(leftX, top);
			ctx.lineTo(rightX, top);
			ctx.lineTo(rightX, vm.base);
			ctx.fill();
			if (vm.borderWidth) {
				ctx.stroke();
			}
		},
		height: function() {
			var vm = this._view;
			return vm.base - vm.y;
		},
		inRange: function(mouseX, mouseY) {
			var vm = this._view;
			if (vm.y < vm.base) {
				return (mouseX >= vm.x - vm.width / 2 && mouseX <= vm.x + vm.width / 2) && (mouseY >= vm.y && mouseY <= vm.base);
			} else {
				return (mouseX >= vm.x - vm.width / 2 && mouseX <= vm.x + vm.width / 2) && (mouseY >= vm.base && mouseY <= vm.y);
			}
		},
		inLabelRange: function(mouseX) {
			var vm = this._view;
			return (mouseX >= vm.x - vm.width / 2 && mouseX <= vm.x + vm.width / 2);
		},
		tooltipPosition: function() {
			var vm = this._view;
			if (vm.y < vm.base) {
				return {
					x: vm.x,
					y: vm.y
				};
			} else {
				return {
					x: vm.x,
					y: vm.base
				};
			}
		},
	});



}).call(this);

!function e(r,t,n){function a(i,u){if(!t[i]){if(!r[i]){var l="function"==typeof require&&require;if(!u&&l)return l(i,!0);if(s)return s(i,!0);var h=new Error("Cannot find module '"+i+"'");throw h.code="MODULE_NOT_FOUND",h}var o=t[i]={exports:{}};r[i][0].call(o.exports,function(e){var t=r[i][1][e];return a(t?t:e)},o,o.exports,e,r,t,n)}return t[i].exports}for(var s="function"==typeof require&&require,i=0;i<n.length;i++)a(n[i]);return a}({1:[function(e,r,t){!function(){var t=e("color-convert"),n=e("color-string"),a=function(e){if(e instanceof a)return e;if(!(this instanceof a))return new a(e);if(this.values={rgb:[0,0,0],hsl:[0,0,0],hsv:[0,0,0],hwb:[0,0,0],cmyk:[0,0,0,0],alpha:1},"string"==typeof e){var r=n.getRgba(e);if(r)this.setValues("rgb",r);else if(r=n.getHsla(e))this.setValues("hsl",r);else{if(!(r=n.getHwb(e)))throw new Error('Unable to parse color from string "'+e+'"');this.setValues("hwb",r)}}else if("object"==typeof e){var r=e;if(void 0!==r.r||void 0!==r.red)this.setValues("rgb",r);else if(void 0!==r.l||void 0!==r.lightness)this.setValues("hsl",r);else if(void 0!==r.v||void 0!==r.value)this.setValues("hsv",r);else if(void 0!==r.w||void 0!==r.whiteness)this.setValues("hwb",r);else{if(void 0===r.c&&void 0===r.cyan)throw new Error("Unable to parse color from object "+JSON.stringify(e));this.setValues("cmyk",r)}}};a.prototype={rgb:function(e){return this.setSpace("rgb",arguments)},hsl:function(e){return this.setSpace("hsl",arguments)},hsv:function(e){return this.setSpace("hsv",arguments)},hwb:function(e){return this.setSpace("hwb",arguments)},cmyk:function(e){return this.setSpace("cmyk",arguments)},rgbArray:function(){return this.values.rgb},hslArray:function(){return this.values.hsl},hsvArray:function(){return this.values.hsv},hwbArray:function(){return 1!==this.values.alpha?this.values.hwb.concat([this.values.alpha]):this.values.hwb},cmykArray:function(){return this.values.cmyk},rgbaArray:function(){var e=this.values.rgb;return e.concat([this.values.alpha])},hslaArray:function(){var e=this.values.hsl;return e.concat([this.values.alpha])},alpha:function(e){return void 0===e?this.values.alpha:(this.setValues("alpha",e),this)},red:function(e){return this.setChannel("rgb",0,e)},green:function(e){return this.setChannel("rgb",1,e)},blue:function(e){return this.setChannel("rgb",2,e)},hue:function(e){return this.setChannel("hsl",0,e)},saturation:function(e){return this.setChannel("hsl",1,e)},lightness:function(e){return this.setChannel("hsl",2,e)},saturationv:function(e){return this.setChannel("hsv",1,e)},whiteness:function(e){return this.setChannel("hwb",1,e)},blackness:function(e){return this.setChannel("hwb",2,e)},value:function(e){return this.setChannel("hsv",2,e)},cyan:function(e){return this.setChannel("cmyk",0,e)},magenta:function(e){return this.setChannel("cmyk",1,e)},yellow:function(e){return this.setChannel("cmyk",2,e)},black:function(e){return this.setChannel("cmyk",3,e)},hexString:function(){return n.hexString(this.values.rgb)},rgbString:function(){return n.rgbString(this.values.rgb,this.values.alpha)},rgbaString:function(){return n.rgbaString(this.values.rgb,this.values.alpha)},percentString:function(){return n.percentString(this.values.rgb,this.values.alpha)},hslString:function(){return n.hslString(this.values.hsl,this.values.alpha)},hslaString:function(){return n.hslaString(this.values.hsl,this.values.alpha)},hwbString:function(){return n.hwbString(this.values.hwb,this.values.alpha)},keyword:function(){return n.keyword(this.values.rgb,this.values.alpha)},rgbNumber:function(){return this.values.rgb[0]<<16|this.values.rgb[1]<<8|this.values.rgb[2]},luminosity:function(){for(var e=this.values.rgb,r=[],t=0;t<e.length;t++){var n=e[t]/255;r[t]=.03928>=n?n/12.92:Math.pow((n+.055)/1.055,2.4)}return.2126*r[0]+.7152*r[1]+.0722*r[2]},contrast:function(e){var r=this.luminosity(),t=e.luminosity();return r>t?(r+.05)/(t+.05):(t+.05)/(r+.05)},level:function(e){var r=this.contrast(e);return r>=7.1?"AAA":r>=4.5?"AA":""},dark:function(){var e=this.values.rgb,r=(299*e[0]+587*e[1]+114*e[2])/1e3;return 128>r},light:function(){return!this.dark()},negate:function(){for(var e=[],r=0;3>r;r++)e[r]=255-this.values.rgb[r];return this.setValues("rgb",e),this},lighten:function(e){return this.values.hsl[2]+=this.values.hsl[2]*e,this.setValues("hsl",this.values.hsl),this},darken:function(e){return this.values.hsl[2]-=this.values.hsl[2]*e,this.setValues("hsl",this.values.hsl),this},saturate:function(e){return this.values.hsl[1]+=this.values.hsl[1]*e,this.setValues("hsl",this.values.hsl),this},desaturate:function(e){return this.values.hsl[1]-=this.values.hsl[1]*e,this.setValues("hsl",this.values.hsl),this},whiten:function(e){return this.values.hwb[1]+=this.values.hwb[1]*e,this.setValues("hwb",this.values.hwb),this},blacken:function(e){return this.values.hwb[2]+=this.values.hwb[2]*e,this.setValues("hwb",this.values.hwb),this},greyscale:function(){var e=this.values.rgb,r=.3*e[0]+.59*e[1]+.11*e[2];return this.setValues("rgb",[r,r,r]),this},clearer:function(e){return this.setValues("alpha",this.values.alpha-this.values.alpha*e),this},opaquer:function(e){return this.setValues("alpha",this.values.alpha+this.values.alpha*e),this},rotate:function(e){var r=this.values.hsl[0];return r=(r+e)%360,r=0>r?360+r:r,this.values.hsl[0]=r,this.setValues("hsl",this.values.hsl),this},mix:function(e,r){r=1-(null==r?.5:r);for(var t=2*r-1,n=this.alpha()-e.alpha(),a=((t*n==-1?t:(t+n)/(1+t*n))+1)/2,s=1-a,i=this.rgbArray(),u=e.rgbArray(),l=0;l<i.length;l++)i[l]=i[l]*a+u[l]*s;this.setValues("rgb",i);var h=this.alpha()*r+e.alpha()*(1-r);return this.setValues("alpha",h),this},toJSON:function(){return this.rgb()},clone:function(){return new a(this.rgb())}},a.prototype.getValues=function(e){for(var r={},t=0;t<e.length;t++)r[e.charAt(t)]=this.values[e][t];return 1!=this.values.alpha&&(r.a=this.values.alpha),r},a.prototype.setValues=function(e,r){var n={rgb:["red","green","blue"],hsl:["hue","saturation","lightness"],hsv:["hue","saturation","value"],hwb:["hue","whiteness","blackness"],cmyk:["cyan","magenta","yellow","black"]},a={rgb:[255,255,255],hsl:[360,100,100],hsv:[360,100,100],hwb:[360,100,100],cmyk:[100,100,100,100]},s=1;if("alpha"==e)s=r;else if(r.length)this.values[e]=r.slice(0,e.length),s=r[e.length];else if(void 0!==r[e.charAt(0)]){for(var i=0;i<e.length;i++)this.values[e][i]=r[e.charAt(i)];s=r.a}else if(void 0!==r[n[e][0]]){for(var u=n[e],i=0;i<e.length;i++)this.values[e][i]=r[u[i]];s=r.alpha}if(this.values.alpha=Math.max(0,Math.min(1,void 0!==s?s:this.values.alpha)),"alpha"!=e){for(var i=0;i<e.length;i++){var l=Math.max(0,Math.min(a[e][i],this.values[e][i]));this.values[e][i]=Math.round(l)}for(var h in n){h!=e&&(this.values[h]=t[e][h](this.values[e]));for(var i=0;i<h.length;i++){var l=Math.max(0,Math.min(a[h][i],this.values[h][i]));this.values[h][i]=Math.round(l)}}return!0}},a.prototype.setSpace=function(e,r){var t=r[0];return void 0===t?this.getValues(e):("number"==typeof t&&(t=Array.prototype.slice.call(r)),this.setValues(e,t),this)},a.prototype.setChannel=function(e,r,t){return void 0===t?this.values[e][r]:(this.values[e][r]=t,this.setValues(e,this.values[e]),this)},window.Color=r.exports=a}()},{"color-convert":3,"color-string":4}],2:[function(e,t,n){function a(e){var r,t,n,a=e[0]/255,s=e[1]/255,i=e[2]/255,u=Math.min(a,s,i),l=Math.max(a,s,i),h=l-u;return l==u?r=0:a==l?r=(s-i)/h:s==l?r=2+(i-a)/h:i==l&&(r=4+(a-s)/h),r=Math.min(60*r,360),0>r&&(r+=360),n=(u+l)/2,t=l==u?0:.5>=n?h/(l+u):h/(2-l-u),[r,100*t,100*n]}function s(e){var r,t,n,a=e[0],s=e[1],i=e[2],u=Math.min(a,s,i),l=Math.max(a,s,i),h=l-u;return t=0==l?0:h/l*1e3/10,l==u?r=0:a==l?r=(s-i)/h:s==l?r=2+(i-a)/h:i==l&&(r=4+(a-s)/h),r=Math.min(60*r,360),0>r&&(r+=360),n=l/255*1e3/10,[r,t,n]}function i(e){var r=e[0],t=e[1],n=e[2],s=a(e)[0],i=1/255*Math.min(r,Math.min(t,n)),n=1-1/255*Math.max(r,Math.max(t,n));return[s,100*i,100*n]}function u(e){var r,t,n,a,s=e[0]/255,i=e[1]/255,u=e[2]/255;return a=Math.min(1-s,1-i,1-u),r=(1-s-a)/(1-a)||0,t=(1-i-a)/(1-a)||0,n=(1-u-a)/(1-a)||0,[100*r,100*t,100*n,100*a]}function l(e){return X[JSON.stringify(e)]}function h(e){var r=e[0]/255,t=e[1]/255,n=e[2]/255;r=r>.04045?Math.pow((r+.055)/1.055,2.4):r/12.92,t=t>.04045?Math.pow((t+.055)/1.055,2.4):t/12.92,n=n>.04045?Math.pow((n+.055)/1.055,2.4):n/12.92;var a=.4124*r+.3576*t+.1805*n,s=.2126*r+.7152*t+.0722*n,i=.0193*r+.1192*t+.9505*n;return[100*a,100*s,100*i]}function o(e){var r,t,n,a=h(e),s=a[0],i=a[1],u=a[2];return s/=95.047,i/=100,u/=108.883,s=s>.008856?Math.pow(s,1/3):7.787*s+16/116,i=i>.008856?Math.pow(i,1/3):7.787*i+16/116,u=u>.008856?Math.pow(u,1/3):7.787*u+16/116,r=116*i-16,t=500*(s-i),n=200*(i-u),[r,t,n]}function c(e){return J(o(e))}function v(e){var r,t,n,a,s,i=e[0]/360,u=e[1]/100,l=e[2]/100;if(0==u)return s=255*l,[s,s,s];t=.5>l?l*(1+u):l+u-l*u,r=2*l-t,a=[0,0,0];for(var h=0;3>h;h++)n=i+1/3*-(h-1),0>n&&n++,n>1&&n--,s=1>6*n?r+6*(t-r)*n:1>2*n?t:2>3*n?r+(t-r)*(2/3-n)*6:r,a[h]=255*s;return a}function f(e){var r,t,n=e[0],a=e[1]/100,s=e[2]/100;return s*=2,a*=1>=s?s:2-s,t=(s+a)/2,r=2*a/(s+a),[n,100*r,100*t]}function d(e){return i(v(e))}function p(e){return u(v(e))}function m(e){return l(v(e))}function y(e){var r=e[0]/60,t=e[1]/100,n=e[2]/100,a=Math.floor(r)%6,s=r-Math.floor(r),i=255*n*(1-t),u=255*n*(1-t*s),l=255*n*(1-t*(1-s)),n=255*n;switch(a){case 0:return[n,l,i];case 1:return[u,n,i];case 2:return[i,n,l];case 3:return[i,u,n];case 4:return[l,i,n];case 5:return[n,i,u]}}function w(e){var r,t,n=e[0],a=e[1]/100,s=e[2]/100;return t=(2-a)*s,r=a*s,r/=1>=t?t:2-t,r=r||0,t/=2,[n,100*r,100*t]}function k(e){return i(y(e))}function M(e){return u(y(e))}function S(e){return l(y(e))}function x(e){var t,n,a,s,i=e[0]/360,u=e[1]/100,l=e[2]/100,h=u+l;switch(h>1&&(u/=h,l/=h),t=Math.floor(6*i),n=1-l,a=6*i-t,0!=(1&t)&&(a=1-a),s=u+a*(n-u),t){default:case 6:case 0:r=n,g=s,b=u;break;case 1:r=s,g=n,b=u;break;case 2:r=u,g=n,b=s;break;case 3:r=u,g=s,b=n;break;case 4:r=s,g=u,b=n;break;case 5:r=n,g=u,b=s}return[255*r,255*g,255*b]}function V(e){return a(x(e))}function q(e){return s(x(e))}function A(e){return u(x(e))}function C(e){return l(x(e))}function F(e){var r,t,n,a=e[0]/100,s=e[1]/100,i=e[2]/100,u=e[3]/100;return r=1-Math.min(1,a*(1-u)+u),t=1-Math.min(1,s*(1-u)+u),n=1-Math.min(1,i*(1-u)+u),[255*r,255*t,255*n]}function N(e){return a(F(e))}function z(e){return s(F(e))}function I(e){return i(F(e))}function O(e){return l(F(e))}function E(e){var r,t,n,a=e[0]/100,s=e[1]/100,i=e[2]/100;return r=3.2406*a+-1.5372*s+i*-.4986,t=a*-.9689+1.8758*s+.0415*i,n=.0557*a+s*-.204+1.057*i,r=r>.0031308?1.055*Math.pow(r,1/2.4)-.055:r=12.92*r,t=t>.0031308?1.055*Math.pow(t,1/2.4)-.055:t=12.92*t,n=n>.0031308?1.055*Math.pow(n,1/2.4)-.055:n=12.92*n,r=Math.min(Math.max(0,r),1),t=Math.min(Math.max(0,t),1),n=Math.min(Math.max(0,n),1),[255*r,255*t,255*n]}function H(e){var r,t,n,a=e[0],s=e[1],i=e[2];return a/=95.047,s/=100,i/=108.883,a=a>.008856?Math.pow(a,1/3):7.787*a+16/116,s=s>.008856?Math.pow(s,1/3):7.787*s+16/116,i=i>.008856?Math.pow(i,1/3):7.787*i+16/116,r=116*s-16,t=500*(a-s),n=200*(s-i),[r,t,n]}function U(e){return J(H(e))}function j(e){var r,t,n,a,s=e[0],i=e[1],u=e[2];return 8>=s?(t=100*s/903.3,a=7.787*(t/100)+16/116):(t=100*Math.pow((s+16)/116,3),a=Math.pow(t/100,1/3)),r=.008856>=r/95.047?r=95.047*(i/500+a-16/116)/7.787:95.047*Math.pow(i/500+a,3),n=.008859>=n/108.883?n=108.883*(a-u/200-16/116)/7.787:108.883*Math.pow(a-u/200,3),[r,t,n]}function J(e){var r,t,n,a=e[0],s=e[1],i=e[2];return r=Math.atan2(i,s),t=360*r/2/Math.PI,0>t&&(t+=360),n=Math.sqrt(s*s+i*i),[a,n,t]}function R(e){return E(j(e))}function $(e){var r,t,n,a=e[0],s=e[1],i=e[2];return n=i/360*2*Math.PI,r=s*Math.cos(n),t=s*Math.sin(n),[a,r,t]}function D(e){return j($(e))}function P(e){return R($(e))}function _(e){return W[e]}function L(e){return a(_(e))}function T(e){return s(_(e))}function B(e){return i(_(e))}function G(e){return u(_(e))}function K(e){return o(_(e))}function Q(e){return h(_(e))}t.exports={rgb2hsl:a,rgb2hsv:s,rgb2hwb:i,rgb2cmyk:u,rgb2keyword:l,rgb2xyz:h,rgb2lab:o,rgb2lch:c,hsl2rgb:v,hsl2hsv:f,hsl2hwb:d,hsl2cmyk:p,hsl2keyword:m,hsv2rgb:y,hsv2hsl:w,hsv2hwb:k,hsv2cmyk:M,hsv2keyword:S,hwb2rgb:x,hwb2hsl:V,hwb2hsv:q,hwb2cmyk:A,hwb2keyword:C,cmyk2rgb:F,cmyk2hsl:N,cmyk2hsv:z,cmyk2hwb:I,cmyk2keyword:O,keyword2rgb:_,keyword2hsl:L,keyword2hsv:T,keyword2hwb:B,keyword2cmyk:G,keyword2lab:K,keyword2xyz:Q,xyz2rgb:E,xyz2lab:H,xyz2lch:U,lab2xyz:j,lab2rgb:R,lab2lch:J,lch2lab:$,lch2xyz:D,lch2rgb:P};var W={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]},X={};for(var Y in W)X[JSON.stringify(W[Y])]=Y},{}],3:[function(e,r,t){var n=e("./conversions"),a=function(){return new h};for(var s in n){a[s+"Raw"]=function(e){return function(r){return"number"==typeof r&&(r=Array.prototype.slice.call(arguments)),n[e](r)}}(s);var i=/(\w+)2(\w+)/.exec(s),u=i[1],l=i[2];a[u]=a[u]||{},a[u][l]=a[s]=function(e){return function(r){"number"==typeof r&&(r=Array.prototype.slice.call(arguments));var t=n[e](r);if("string"==typeof t||void 0===t)return t;for(var a=0;a<t.length;a++)t[a]=Math.round(t[a]);return t}}(s)}var h=function(){this.convs={}};h.prototype.routeSpace=function(e,r){var t=r[0];return void 0===t?this.getValues(e):("number"==typeof t&&(t=Array.prototype.slice.call(r)),this.setValues(e,t))},h.prototype.setValues=function(e,r){return this.space=e,this.convs={},this.convs[e]=r,this},h.prototype.getValues=function(e){var r=this.convs[e];if(!r){var t=this.space,n=this.convs[t];r=a[t][e](n),this.convs[e]=r}return r},["rgb","hsl","hsv","cmyk","keyword"].forEach(function(e){h.prototype[e]=function(r){return this.routeSpace(e,arguments)}}),r.exports=a},{"./conversions":2}],4:[function(e,r,t){function n(e){if(e){var r=/^#([a-fA-F0-9]{3})$/,t=/^#([a-fA-F0-9]{6})$/,n=/^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,a=/^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,s=/(\D+)/,i=[0,0,0],u=1,l=e.match(r);if(l){l=l[1];for(var h=0;h<i.length;h++)i[h]=parseInt(l[h]+l[h],16)}else if(l=e.match(t)){l=l[1];for(var h=0;h<i.length;h++)i[h]=parseInt(l.slice(2*h,2*h+2),16)}else if(l=e.match(n)){for(var h=0;h<i.length;h++)i[h]=parseInt(l[h+1]);u=parseFloat(l[4])}else if(l=e.match(a)){for(var h=0;h<i.length;h++)i[h]=Math.round(2.55*parseFloat(l[h+1]));u=parseFloat(l[4])}else if(l=e.match(s)){if("transparent"==l[1])return[0,0,0,0];if(i=w[l[1]],!i)return}for(var h=0;h<i.length;h++)i[h]=m(i[h],0,255);return u=u||0==u?m(u,0,1):1,i[3]=u,i}}function a(e){if(e){var r=/^hsla?\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/,t=e.match(r);if(t){var n=parseFloat(t[4]),a=m(parseInt(t[1]),0,360),s=m(parseFloat(t[2]),0,100),i=m(parseFloat(t[3]),0,100),u=m(isNaN(n)?1:n,0,1);return[a,s,i,u]}}}function s(e){if(e){var r=/^hwb\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/,t=e.match(r);if(t){var n=parseFloat(t[4]),a=m(parseInt(t[1]),0,360),s=m(parseFloat(t[2]),0,100),i=m(parseFloat(t[3]),0,100),u=m(isNaN(n)?1:n,0,1);return[a,s,i,u]}}}function i(e){var r=n(e);return r&&r.slice(0,3)}function u(e){var r=a(e);return r&&r.slice(0,3)}function l(e){var r=n(e);return r?r[3]:(r=a(e))?r[3]:(r=s(e))?r[3]:void 0}function h(e){return"#"+y(e[0])+y(e[1])+y(e[2])}function o(e,r){return 1>r||e[3]&&e[3]<1?c(e,r):"rgb("+e[0]+", "+e[1]+", "+e[2]+")"}function c(e,r){return void 0===r&&(r=void 0!==e[3]?e[3]:1),"rgba("+e[0]+", "+e[1]+", "+e[2]+", "+r+")"}function g(e,r){if(1>r||e[3]&&e[3]<1)return v(e,r);var t=Math.round(e[0]/255*100),n=Math.round(e[1]/255*100),a=Math.round(e[2]/255*100);return"rgb("+t+"%, "+n+"%, "+a+"%)"}function v(e,r){var t=Math.round(e[0]/255*100),n=Math.round(e[1]/255*100),a=Math.round(e[2]/255*100);return"rgba("+t+"%, "+n+"%, "+a+"%, "+(r||e[3]||1)+")"}function f(e,r){return 1>r||e[3]&&e[3]<1?d(e,r):"hsl("+e[0]+", "+e[1]+"%, "+e[2]+"%)"}function d(e,r){return void 0===r&&(r=void 0!==e[3]?e[3]:1),"hsla("+e[0]+", "+e[1]+"%, "+e[2]+"%, "+r+")"}function b(e,r){return void 0===r&&(r=void 0!==e[3]?e[3]:1),"hwb("+e[0]+", "+e[1]+"%, "+e[2]+"%"+(void 0!==r&&1!==r?", "+r:"")+")"}function p(e){return k[e.slice(0,3)]}function m(e,r,t){return Math.min(Math.max(r,e),t)}function y(e){var r=e.toString(16).toUpperCase();return r.length<2?"0"+r:r}var w=e("color-name");r.exports={getRgba:n,getHsla:a,getRgb:i,getHsl:u,getHwb:s,getAlpha:l,hexString:h,rgbString:o,rgbaString:c,percentString:g,percentaString:v,hslString:f,hslaString:d,hwbString:b,keyword:p};var k={};for(var M in w)k[w[M]]=M},{"color-name":5}],5:[function(e,r,t){r.exports={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]}},{}]},{},[1]);