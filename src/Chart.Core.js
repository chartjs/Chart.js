/*!
 * Chart.js
 * http://chartjs.org/
 * Version: {{ version }}
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
    var Chart = function(context) {
        var chart = this;
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
        helpers.retinaScale(this);

        return this;
    };

    var defaultColor = 'rgba(0,0,0,0.1)';

    //Globally expose the defaults to allow for user updating/changing
    Chart.defaults = {
        global: {
            animation: {
                duration: 1000,
                easing: "easeOutQuart",
                onProgress: function() {},
                onComplete: function() {},
            },
            responsive: true,
            maintainAspectRatio: true,
            events: ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"],
            hover: {
                onHover: null,
                mode: 'single',
                animationDuration: 400,
            },
            onClick: null,
            tooltips: {
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
                    '<%=label %>:',
                    '<% } %>',
                    '<%=value %>',
                ].join(''),
                multiTemplate: [
                    '<%if (datasetLabel){ %>',
                    '<%=datasetLabel %>:',
                    '<% } %>',
                    '<%=value %>'
                ].join(''),
                multiKeyBackground: '#fff',

            },
            defaultColor: defaultColor,

            // Element defaults
            elements: {
                line: {
                    tension: 0.4,
                    backgroundColor: defaultColor,
                    borderWidth: 3,
                    borderColor: defaultColor,
                    fill: true, // do we fill in the area between the line and the x axis
                    skipNull: true,
                    drawNull: false,
                },
                point: {
                    radius: 3,
                    backgroundColor: defaultColor,
                    borderWidth: 1,
                    borderColor: defaultColor,
                    // Hover
                    hitRadius: 6,
                    hoverRadius: 4,
                    hoverBorderWidth: 2,
                },
                bar: {
                    backgroundColor: defaultColor,
                    borderWidth: 0,
                    borderColor: defaultColor,
                    valueSpacing: 5,
                    datasetSpacing: 1,
                },
                slice: {
                    backgroundColor: defaultColor,
                    borderColor: "#fff",
                    borderWidth: 2,
                },
            }
        },
    };

    //Create a dictionary of chart types, to allow for extension of existing types
    Chart.types = {};

    //Global Chart helpers object for utility methods and classes
    var helpers = Chart.helpers = {};

    //-- Basic js utility methods
    var each = helpers.each = function(loopable, callback, self) {
            var additionalArgs = Array.prototype.slice.call(arguments, 3);
            // Check to see if null or undefined firstly.
            if (loopable) {
                if (loopable.length === +loopable.length) {
                    var i;
                    for (i = 0; i < loopable.length; i++) {
                        callback.apply(self, [loopable[i], i].concat(additionalArgs));
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
                    objClone[key] = value;
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
        configMerge = helpers.configMerge = function(base) {
            helpers.each(Array.prototype.slice.call(arguments, 1), function(extension) {
                helpers.each(extension, function(value, key) {
                    if (extension.hasOwnProperty(key)) {
                        if (base.hasOwnProperty(key) && helpers.isArray(base[key]) && helpers.isArray(value)) {
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
                        } else if (base.hasOwnProperty(key) && typeof base[key] == "object" && typeof value == "object") {
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


            var angle = Math.PI * 2 + Math.atan2(distanceFromYCenter, distanceFromXCenter);

            //If the segment is in the top left quadrant, we need to add another rotation to the angle
            if (distanceFromXCenter < 0 && distanceFromYCenter < 0) {
                angle += Math.PI * 2;
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
            var exponent = Math.floor(Math.log10(range));
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
        animationLoop = helpers.animationLoop = function(callback, totalSteps, easingString, onProgress, onComplete, chartInstance) {

            var currentStep = 0,
                easingFunction = easingEffects[easingString] || easingEffects.linear;

            var animationFrame = function() {
                currentStep++;
                var stepDecimal = currentStep / totalSteps;
                var easeDecimal = easingFunction(stepDecimal);

                callback.call(chartInstance, easeDecimal, stepDecimal, currentStep);
                onProgress.call(chartInstance, easeDecimal, stepDecimal);
                if (currentStep < totalSteps) {
                    chartInstance.animationFrame = requestAnimFrame(animationFrame);
                } else {
                    onComplete.apply(chartInstance);
                }
            };
            requestAnimFrame(animationFrame);
        },
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

    //Store a reference to each instance - allowing us to globally resize chart instances on window resize.
    //Destroy method on the chart will remove the instance of the chart from this reference.
    Chart.instances = {};

    Chart.Type = function(config, instance) {
        this.data = config.data;
        this.options = config.options;
        this.chart = instance;
        this.id = uid();
        //Add the chart instance to the global namespace
        Chart.instances[this.id] = this;

        // Initialize is always called when a chart type is created
        // By default it is a no op, but it should be extended
        if (this.options.responsive) {
            this.resize();
        }
        this.initialize.call(this);
    };

    //Core methods that'll be a part of every chart type
    extend(Chart.Type.prototype, {
        initialize: function() {
            return this;
        },
        clear: function() {
            clear(this.chart);
            return this;
        },
        stop: function() {
            // Stops any current animation loop occuring
            Chart.animationService.cancelAnimation(this);
            return this;
        },
        resize: function() {
            this.stop();
            var canvas = this.chart.canvas,
                newWidth = getMaximumWidth(this.chart.canvas),
                newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : getMaximumHeight(this.chart.canvas);

            canvas.width = this.chart.width = newWidth;
            canvas.height = this.chart.height = newHeight;

            retinaScale(this.chart);

            return this;
        },
        redraw: noop,
        render: function(duration) {

            if (this.options.animation.duration !== 0) {
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
        eachElement: function(callback) {
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {
                helpers.each(dataset.metaData, callback, this, dataset.metaData, datasetIndex);
            }, this);
        },
        eachValue: function(callback) {
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {
                helpers.each(dataset.data, callback, this, datasetIndex);
            }, this);
        },
        eachDataset: function(callback) {
            helpers.each(this.data.datasets, callback, this);
        },
        getElementsAtEvent: function(e) {
            var elementsArray = [],
                eventPosition = helpers.getRelativePosition(e),
                datasetIterator = function(dataset) {
                    elementsArray.push(dataset.metaData[elementIndex]);
                },
                elementIndex;

            for (var datasetIndex = 0; datasetIndex < this.data.datasets.length; datasetIndex++) {
                for (elementIndex = 0; elementIndex < this.data.datasets[datasetIndex].metaData.length; elementIndex++) {
                    if (this.data.datasets[datasetIndex].metaData[elementIndex].inGroupRange(eventPosition.x, eventPosition.y)) {
                        helpers.each(this.data.datasets, datasetIterator);
                    }
                }
            }

            return elementsArray.length ? elementsArray : [];
        },
        // Get the single element that was clicked on
        // @return : An object containing the dataset index and element index of the matching element. Also contains the rectangle that was drawn
        getElementAtEvent: function(e) {
            var element = [];
            var eventPosition = helpers.getRelativePosition(e);

            for (var datasetIndex = 0; datasetIndex < this.data.datasets.length; ++datasetIndex) {
                for (var elementIndex = 0; elementIndex < this.data.datasets[datasetIndex].metaData.length; ++elementIndex) {
                    if (this.data.datasets[datasetIndex].metaData[elementIndex].inRange(eventPosition.x, eventPosition.y)) {
                        element.push(this.data.datasets[datasetIndex].metaData[elementIndex]);
                        return element;
                    }
                }
            }

            return [];
        },
        generateLegend: function() {
            return template(this.options.legendTemplate, this);
        },
        destroy: function() {
            this.clear();
            unbindEvents(this, this.events);
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
        toBase64Image: function() {
            return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
        }
    });

    Chart.Type.extend = function(extensions) {

        var parent = this;

        var ChartType = function() {
            return parent.apply(this, arguments);
        };

        //Copy the prototype object of the this class
        ChartType.prototype = clone(parent.prototype);
        //Now overwrite some of the properties in the base class with the new extensions
        extend(ChartType.prototype, extensions);

        ChartType.extend = Chart.Type.extend;

        if (extensions.name || parent.prototype.name) {

            var chartName = extensions.name || parent.prototype.name;
            //Assign any potential default values of the new chart type

            //If none are defined, we'll use a clone of the chart type this is being extended from.
            //I.e. if we extend a line chart, we'll use the defaults from the line chart if our new chart
            //doesn't define some defaults of their own.

            var baseDefaults = (Chart.defaults[parent.prototype.name]) ? clone(Chart.defaults[parent.prototype.name]) : {};

            Chart.defaults[chartName] = helpers.configMerge(baseDefaults, extensions.defaults);

            Chart.types[chartName] = ChartType;

            //Register this new chart type in the Chart prototype
            Chart.prototype[chartName] = function(config) {
                config.options = helpers.configMerge(Chart.defaults.global, Chart.defaults[chartName], config.options || {});
                return new ChartType(config, this);
            };
        } else {
            warn("Name not provided for this chart, so it hasn't been registered");
        }
        return parent;
    };

    Chart.Element = function(configuration) {
        extend(this, configuration);
        this.initialize.apply(this, arguments);
    };
    extend(Chart.Element.prototype, {
        initialize: function() {},
        pivot: function() {
            if (!this._view) {
                this._view = clone(this._model);
            }
            this._start = clone(this._view);
            return this;
        },
        transition: function(ease) {
            if (!this._view) {
                this._view = clone(this._model);
            }
            if (!this._start) {
                this.pivot();
            }

            each(this._model, function(value, key) {

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
            return isNumber(this._model.x) && isNumber(this._model.y);
        }
    });

    Chart.Element.extend = inherits;


    Chart.Point = Chart.Element.extend({
        inRange: function(mouseX, mouseY) {
            var vm = this._view;
            var hoverRange = vm.hoverRadius + vm.radius;
            return ((Math.pow(mouseX - vm.x, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(hoverRange, 2));
        },
        inGroupRange: function(mouseX) {
            var vm = this._view;

            if (vm) {
                return (Math.pow(mouseX - vm.x, 2) < Math.pow(vm.radius + vm.hoverRadius, 2));
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

                ctx.arc(vm.x, vm.y, vm.radius, 0, Math.PI * 2);
                ctx.closePath();

                ctx.strokeStyle = vm.borderColor || Chart.defaults.global.defaultColor;
                ctx.lineWidth = vm.borderWidth || Chart.defaults.global.defaultColor;

                ctx.fillStyle = vm.backgroundColor || Chart.defaults.global.defaultColor;

                ctx.fill();
                ctx.stroke();
            }
        }
    });


    Chart.Line = Chart.Element.extend({
        draw: function() {

            var vm = this._view;
            var ctx = this._chart.ctx;
            var first = this._children[0];
            var last = this._children[this._children.length - 1];

            // Draw the background first (so the border is always on top)
            helpers.each(this._children, function(point, index) {
                var previous = this.previousPoint(point, this._children, index);
                var next = this.nextPoint(point, this._children, index);

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
                var previous = this.previousPoint(point, this._children, index);
                var next = this.nextPoint(point, this._children, index);

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
        nextPoint: function(point, collection, index) {
            if (this.loop) {
                return collection[index + 1] || collection[0];
            }
            return collection[index + 1] || collection[collection.length - 1];
        },
        previousPoint: function(point, collection, index) {
            if (this.loop) {
                return collection[index - 1] || collection[collection.length - 1];
            }
            return collection[index - 1] || collection[0];
        },
    });

    Chart.Arc = Chart.Element.extend({
        inGroupRange: function(mouseX) {
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

            //Check if within the range of the open/close angle
            var betweenAngles = (pointRelativePosition.angle >= vm.startAngle && pointRelativePosition.angle <= vm.endAngle),
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

    Chart.Rectangle = Chart.Element.extend({
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
        inGroupRange: function(mouseX) {
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

    Chart.Animation = Chart.Element.extend({
        currentStep: null, // the current animation step
        numSteps: 60, // default number of steps
        easing: "", // the easing to use for this animation
        render: null, // render function used by the animation service

        onAnimationProgress: null, // user specified callback to fire on each step of the animation 
        onAnimationComplete: null, // user specified callback to fire when the animation finishes
    });

    Chart.Tooltip = Chart.Element.extend({
        initialize: function() {
            var options = this._options;
            extend(this, {
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
                        text: template(this._options.tooltips.template, {
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
                        dataIndex = indexOf(dataArray, this._active[0]);
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

                        helpers.each(elements, function(element) {
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

                        yMin = min(yPositions);
                        yMax = max(yPositions);

                        xMin = min(xPositions);
                        xMax = max(xPositions);

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
                        labelWidth = longestText(ctx, this.font, labels) + this._model.fontSize + 3,
                        longestTextWidth = max([labelWidth, titleWidth]);

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

                    ctx.font = fontString(vm.fontSize, vm._fontStyle, vm._fontFamily);

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

                        drawRoundedRectangle(ctx, tooltipX, tooltipY, tooltipWidth, tooltipRectHeight, vm.cornerRadius);

                        ctx.fill();

                        ctx.fillStyle = helpers.color(vm.textColor).alpha(vm.opacity).rgbString();
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(vm.text, tooltipX + tooltipWidth / 2, tooltipY + tooltipRectHeight / 2);

                    }
                    break;
                case 'label':

                    drawRoundedRectangle(ctx, vm.x, vm.y - vm.height / 2, vm.width, vm.height, vm.cornerRadius);
                    ctx.fillStyle = helpers.color(vm.backgroundColor).alpha(vm.opacity).rgbString();
                    ctx.fill();
                    ctx.closePath();

                    ctx.textAlign = "left";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = helpers.color(vm.titleTextColor).alpha(vm.opacity).rgbString();
                    ctx.font = fontString(vm.fontSize, vm._titleFontStyle, vm._titleFontFamily);
                    ctx.fillText(vm.title, vm.x + vm.xPadding, this.getLineHeight(0));

                    ctx.font = fontString(vm.fontSize, vm._fontStyle, vm._fontFamily);
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

    Chart.animationService = {
        frameDuration: 17,
        animations: [],
        dropFrames: 0,
        addAnimation: function(chartInstance, animationObject, duration) {

            if (!duration) {
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

    // Attach global event to resize each chart instance when the browser resizes
    helpers.addEvent(window, "resize", (function() {
        // Basic debounce of resize function so it doesn't hurt performance when resizing browser.
        var timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                each(Chart.instances, function(instance) {
                    // If the responsive flag is set in the chart instance config
                    // Cascade the resize event down to the chart.
                    if (instance.options.responsive) {
                        instance.resize();
                        instance.update();
                        instance.render();
                    }
                });
            }, 50);
        };
    })());


    if (amd) {
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
