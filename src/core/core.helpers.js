(function() {

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		Chart = root.Chart;

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
									if (typeof baseArray[index] == 'object' && baseArray[index] !== null && typeof valueObj == 'object' && valueObj !== null) {
										// Two objects are coming together. Do a merge of them.
										baseArray[index] = helpers.configMerge(baseArray[index], valueObj);
									} else {
										// Just overwrite in this case since there is nothing to merge
										baseArray[index] = valueObj;
									}
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
		extendDeep = helpers.extendDeep = function(_base) {
			return _extendDeep.apply(this, arguments);

			function _extendDeep(dst) {
				helpers.each(arguments, function(obj) {
					if (obj !== dst) {
						helpers.each(obj, function(value, key) {
							if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
								_extendDeep(dst[key], value);
							} else {
								dst[key] = value;
							}
						});
					}
				});
				return dst;
			}
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
									base[key][index] = helpers.configMerge(base[key][index], valueObj.type ? Chart.scaleService.getScaleDefaults(valueObj.type) : {}, valueObj);
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
			if (value === undefined || value === null) {
				return defaultValue;
			}

			if (helpers.isArray(value)) {
				return index < value.length ? value[index] : defaultValue;
			}

			return value;
		},
		getValueOrDefault = helpers.getValueOrDefault = function(value, defaultValue) {
			return value === undefined ? defaultValue : value;
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
			if (startIndex === undefined || startIndex === null) {
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
			if (startIndex === undefined || startIndex === null) {
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
			if (console && typeof console.warn === "function") {
				console.warn(str);
			}
		},
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
				return Math.log10(x);
			} else {
				return Math.log(x) / Math.LN10;
			}
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
		splineCurve = helpers.splineCurve = function(firstPoint, middlePoint, afterPoint, t) {
			//Props to Rob Spencer at scaled innovation for his post on splining between points
			//http://scaledinnovation.com/analytics/splines/aboutSplines.html

			// This function must also respect "skipped" points

			var previous = firstPoint.skip ? middlePoint : firstPoint,
				current = middlePoint,
				next = afterPoint.skip ? middlePoint : afterPoint;

			var d01 = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
			var d12 = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));

			var s01 = d01 / (d01 + d12);
			var s12 = d12 / (d01 + d12);

			// If all points are the same, s01 & s02 will be inf
			s01 = isNaN(s01) ? 0 : s01;
			s12 = isNaN(s12) ? 0 : s12;

			var fa = t * s01; // scaling factor for triangle Ta
			var fb = t * s12;

			return {
				previous: {
					x: current.x - fa * (next.x - previous.x),
					y: current.y - fa * (next.y - previous.y)
				},
				next: {
					x: current.x + fb * (next.x - previous.x),
					y: current.y + fb * (next.y - previous.y)
				}
			};
		},
		nextItem = helpers.nextItem = function(collection, index, loop) {
			if (loop) {
				return index >= collection.length - 1 ? collection[0] : collection[index + 1];
			}

			return index >= collection.length - 1 ? collection[collection.length - 1] : collection[index + 1];
		},
		previousItem = helpers.previousItem = function(collection, index, loop) {
			if (loop) {
				return index <= 0 ? collection[collection.length - 1] : collection[index - 1];
			}
			return index <= 0 ? collection[0] : collection[index - 1];
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
		getRelativePosition = helpers.getRelativePosition = function(evt, chart) {
			var mouseX, mouseY;
			var e = evt.originalEvent || evt,
				canvas = evt.currentTarget || evt.srcElement,
				boundingRect = canvas.getBoundingClientRect();

			if (e.touches && e.touches.length > 0) {
				mouseX = e.touches[0].clientX;
				mouseY = e.touches[0].clientY;

			} else {
				mouseX = e.clientX;
				mouseY = e.clientY;
			}

			// Scale mouse coordinates into canvas coordinates
			// by following the pattern laid out by 'jerryj' in the comments of
			// http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/

			// We divide by the current device pixel ratio, because the canvas is scaled up by that amount in each direction. However
			// the backend model is in unscaled coordinates. Since we are going to deal with our model coordinates, we go back here
			mouseX = Math.round((mouseX - boundingRect.left) / (boundingRect.right - boundingRect.left) * canvas.width / chart.currentDevicePixelRatio);
			mouseY = Math.round((mouseY - boundingRect.top) / (boundingRect.bottom - boundingRect.top) * canvas.height / chart.currentDevicePixelRatio);

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
		getConstraintWidth = helpers.getConstraintWidth = function(domNode) { // returns Number or undefined if no constraint
			var constrainedWidth;
			var constrainedWNode = document.defaultView.getComputedStyle(domNode)['max-width'];
			var constrainedWContainer = document.defaultView.getComputedStyle(domNode.parentNode)['max-width'];
			var hasCWNode = constrainedWNode !== null && constrainedWNode !== "none";
			var hasCWContainer = constrainedWContainer !== null && constrainedWContainer !== "none";

			if (hasCWNode || hasCWContainer) {
				constrainedWidth = Math.min((hasCWNode ? parseInt(constrainedWNode, 10) : Number.POSITIVE_INFINITY), (hasCWContainer ? parseInt(constrainedWContainer, 10) : Number.POSITIVE_INFINITY));
			}
			return constrainedWidth;
		},
		getConstraintHeight = helpers.getConstraintHeight = function(domNode) { // returns Number or undefined if no constraint

			var constrainedHeight;
			var constrainedHNode = document.defaultView.getComputedStyle(domNode)['max-height'];
			var constrainedHContainer = document.defaultView.getComputedStyle(domNode.parentNode)['max-height'];
			var hasCHNode = constrainedHNode !== null && constrainedHNode !== "none";
			var hasCHContainer = constrainedHContainer !== null && constrainedHContainer !== "none";

			if (constrainedHNode || constrainedHContainer) {
				constrainedHeight = Math.min((hasCHNode ? parseInt(constrainedHNode, 10) : Number.POSITIVE_INFINITY), (hasCHContainer ? parseInt(constrainedHContainer, 10) : Number.POSITIVE_INFINITY));
			}
			return constrainedHeight;
		},
		getMaximumWidth = helpers.getMaximumWidth = function(domNode) {
			var container = domNode.parentNode;
			var padding = parseInt(getStyle(container, 'padding-left')) + parseInt(getStyle(container, 'padding-right'));

			var w = container.clientWidth - padding;
			var cw = getConstraintWidth(domNode);
			if (cw !== undefined) {
				w = Math.min(w, cw);
			}

			return w;
		},
		getMaximumHeight = helpers.getMaximumHeight = function(domNode) {
			var container = domNode.parentNode;
			var padding = parseInt(getStyle(container, 'padding-top')) + parseInt(getStyle(container, 'padding-bottom'));

			var h = container.clientHeight - padding;
			var ch = getConstraintHeight(domNode);
			if (ch !== undefined) {
				h = Math.min(h, ch);
			}

			return h;
		},
		getStyle = helpers.getStyle = function(el, property) {
			return el.currentStyle ?
				el.currentStyle[property] :
				document.defaultView.getComputedStyle(el, null).getPropertyValue(property);
		},
		getMaximumSize = helpers.getMaximumSize = helpers.getMaximumWidth, // legacy support
		retinaScale = helpers.retinaScale = function(chart) {
			var ctx = chart.ctx;
			var width = chart.canvas.width;
			var height = chart.canvas.height;
			var pixelRatio = chart.currentDevicePixelRatio = window.devicePixelRatio || 1;

			if (pixelRatio !== 1) {
				ctx.canvas.height = height * pixelRatio;
				ctx.canvas.width = width * pixelRatio;
				ctx.scale(pixelRatio, pixelRatio);

				ctx.canvas.style.width = width + 'px';
				ctx.canvas.style.height = height + 'px';

				// Store the device pixel ratio so that we can go backwards in `destroy`.
				// The devicePixelRatio changes with zoom, so there are no guarantees that it is the same
				// when destroy is called
				chart.originalDevicePixelRatio = chart.originalDevicePixelRatio || pixelRatio;
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
			if (!root.Color) {
				console.log('Color.js not found!');
				return color;
			}
			return root.Color(color);
		},
		addResizeListener = helpers.addResizeListener = function(node, callback) {
			// Hide an iframe before the node
			var hiddenIframe = document.createElement('iframe');
			var hiddenIframeClass = 'chartjs-hidden-iframe';

			if (hiddenIframe.classlist) {
				// can use classlist
				hiddenIframe.classlist.add(hiddenIframeClass);
			} else {
				hiddenIframe.setAttribute('class', hiddenIframeClass);
			}

			// Set the style
			hiddenIframe.style.width = '100%';
			hiddenIframe.style.display = 'block';
			hiddenIframe.style.border = 0;
			hiddenIframe.style.height = 0;
			hiddenIframe.style.margin = 0;
			hiddenIframe.style.position = 'absolute';
			hiddenIframe.style.left = 0;
			hiddenIframe.style.right = 0;
			hiddenIframe.style.top = 0;
			hiddenIframe.style.bottom = 0;

			// Insert the iframe so that contentWindow is available
			node.insertBefore(hiddenIframe, node.firstChild);

			var timer = 0;
			(hiddenIframe.contentWindow || hiddenIframe).onresize = function() {
				if (callback) {
					callback();
				}
			};
		},
		removeResizeListener = helpers.removeResizeListener = function(node) {
			var hiddenIframe = node.querySelector('.chartjs-hidden-iframe');

			// Remove the resize detect iframe
			if (hiddenIframe) {
				hiddenIframe.parentNode.removeChild(hiddenIframe);
			}
		},
		isArray = helpers.isArray = function(obj) {
			if (!Array.isArray) {
				return Object.prototype.toString.call(arg) === '[object Array]';
			}
			return Array.isArray(obj);
		},
		isDatasetVisible = helpers.isDatasetVisible = function(dataset) {
			return !dataset.hidden;
		};

	helpers.callCallback = function(fn, args, _tArg) {
		if (fn && typeof fn.call === 'function') {
			fn.apply(_tArg, args);
		}
	}
}).call(this);
