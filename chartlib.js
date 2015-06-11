/*!
 * VertaChart.js
 * http://chartjs.org/
 * Version: 1.0.2
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/VertaChart.js/blob/master/LICENSE.md
 */


(function() {

    "use strict";
    window.first_run_handler = true;
    //Declare root variable - window in the browser, global on the server
    var root = this,
        previous = root.VertaChart;

    //Occupy the global variable of VertaChart, and create a simple base class
    var VertaChart = function(context) {
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
    //Globally expose the defaults to allow for user updating/changing
    VertaChart.defaults = {
        global: {
            // Boolean - Whether to animate the chart
            animation: true,

            // Number - Number of animation steps
            animationSteps: 60,

            // String - Animation easing effect
            animationEasing: "easeOutQuart",

            // Boolean - If we should show the scale at all
            showScale: true,

            // Boolean - If we want to override with a hard coded scale
            scaleOverride: false,

            // ** Required if scaleOverride is true **
            // Number - The number of steps in a hard coded scale
            scaleSteps: null,
            // Number - The value jump in the hard coded scale
            scaleStepWidth: null,
            // Number - The scale starting value
            scaleStartValue: null,

            // String - Colour of the scale line
            scaleLineColor: "rgba(0,0,0,.1)",

            // Number - Pixel width of the scale line
            scaleLineWidth: 1,

            // Boolean - Whether to show labels on the scale
            scaleShowLabels: true,

            // Interpolated JS string - can access value
            scaleLabel: "<%=value%>",

            // Boolean - Whether the scale should stick to integers, and not show any floats even if drawing space is there
            scaleIntegersOnly: true,

            // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
            scaleBeginAtZero: false,

            // String - Scale label font declaration for the scale label
            scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Number - Scale label font size in pixels
            scaleFontSize: 12,

            // String - Scale label font weight style
            scaleFontStyle: "normal",

            // String - Scale label font colour
            scaleFontColor: "#666",

            // Boolean - whether or not the chart should be responsive and resize when the browser does.
            responsive: false,

            // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
            maintainAspectRatio: true,

            // Boolean - Determines whether to draw tooltips on the canvas or not - attaches events to touchmove & mousemove
            showTooltips: true,

            // Boolean - Determines whether to draw built-in tooltip or call custom tooltip function
            customTooltips: false,

            // Array - Array of string names to attach tooltip events
            tooltipEvents: ["mousemove", "touchstart", "touchmove", "mouseout"],

            // String - Tooltip background colour
            tooltipFillColor: "rgba(0,0,0,0.8)",

            // String - Tooltip label font declaration for the scale label
            tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Number - Tooltip label font size in pixels
            tooltipFontSize: 14,

            // String - Tooltip font weight style
            tooltipFontStyle: "normal",

            // String - Tooltip label font colour
            tooltipFontColor: "#fff",

            // String - Tooltip title font declaration for the scale label
            tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Number - Tooltip title font size in pixels
            tooltipTitleFontSize: 14,

            // String - Tooltip title font weight style
            tooltipTitleFontStyle: "bold",

            // String - Tooltip title font colour
            tooltipTitleFontColor: "#fff",

            // Number - pixel width of padding around tooltip text
            tooltipYPadding: 6,

            // Number - pixel width of padding around tooltip text
            tooltipXPadding: 6,

            // Number - Size of the caret on the tooltip
            tooltipCaretSize: 8,

            // Number - Pixel radius of the tooltip border
            tooltipCornerRadius: 6,

            // Number - Pixel offset from point x to tooltip edge
            tooltipXOffset: 10,

            // String - Template string for single tooltips
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

            // String - Template string for single tooltips
            multiTooltipTemplate: "<%= value %>",

            // String - Colour behind the legend colour block
            multiTooltipKeyBackground: '#fff',

            // Function - Will fire on animation progression.
            onAnimationProgress: function() {},

            // Function - Will fire on animation completion.
            onAnimationComplete: function() {}

        }
    };

    //Create a dictionary of chart types, to allow for extension of existing types
    VertaChart.types = {};

    //Global VertaChart helpers object for utility methods and classes
    var helpers = VertaChart.helpers = {};

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
            var VertaChartElement = (extensions && extensions.hasOwnProperty("constructor")) ? extensions.constructor : function() {
                return parent.apply(this, arguments);
            };

            var Surrogate = function() {
                this.constructor = VertaChartElement;
            };
            Surrogate.prototype = parent.prototype;
            VertaChartElement.prototype = new Surrogate();

            VertaChartElement.extend = inherits;

            if (extensions) extend(VertaChartElement.prototype, extensions);

            VertaChartElement.__super__ = parent.prototype;

            return VertaChartElement;
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
        toRadians = helpers.radians = function(degrees) {
            return degrees * (Math.PI / 180);
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
                inner: {
                    x: MiddlePoint.x - fa * (AfterPoint.x - FirstPoint.x),
                    y: MiddlePoint.y - fa * (AfterPoint.y - FirstPoint.y)
                },
                outer: {
                    x: MiddlePoint.x + fb * (AfterPoint.x - FirstPoint.x),
                    y: MiddlePoint.y + fb * (AfterPoint.y - FirstPoint.y)
                }
            };
        },
        calculateOrderOfMagnitude = helpers.calculateOrderOfMagnitude = function(val) {
            return Math.floor(Math.log(val) / Math.LN10);
        },
        calculateScaleRange = helpers.calculateScaleRange = function(valuesArray, drawingSize, textSize, startFromZero, integersOnly) {
            if (valuesArray.length > 0) {
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

            } else {
                return {
                    steps: 0,
                    stepValue: 0,
                    min: 0,
                    max: 0
                };
            }

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
            var container = domNode.parentNode;
            // TODO = check cross browser stuff with this.
            return container.clientWidth;
        },
        getMaximumHeight = helpers.getMaximumHeight = function(domNode) {
            var container = domNode.parentNode;
            // TODO = check cross browser stuff with this.
            return container.clientHeight;
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
        };


    //Store a reference to each instance - allowing us to globally resize chart instances on window resize.
    //Destroy method on the chart will remove the instance of the chart from this reference.
    VertaChart.instances = {};

    VertaChart.Type = function(data, options, chart) {
        this.options = options;
        this.chart = chart;
        this.id = uid();
        //Add the chart instance to the global namespace
        VertaChart.instances[this.id] = this;

        // Initialize is always called when a chart type is created
        // By default it is a no op, but it should be extended
        if (options.responsive) {
            this.resize();
        }
        this.initialize.call(this, data);
    };

    //Core methods that'll be a part of every chart type
    extend(VertaChart.Type.prototype, {
        initialize: function() {
            return this;
        },
        clear: function() {
            clear(this.chart);
            return this;
        },
        resize: function(callback) {
            var canvas = this.chart.canvas,
                newWidth = getMaximumWidth(this.chart.canvas),
                newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : getMaximumHeight(this.chart.canvas);

            canvas.width = this.chart.width = newWidth;
            canvas.height = this.chart.height = newHeight;

            retinaScale(this.chart);

            if (typeof callback === "function") {
                callback.apply(this, Array.prototype.slice.call(arguments, 1));
            }
            return this;
        },
        reflow: noop,
        render: function(reflow) {
            if (reflow) {
                this.reflow();
            }
            if (this.options.animation && !reflow) {
                helpers.animationLoop(
                    this.draw,
                    this.options.animationSteps,
                    this.options.animationEasing,
                    this.options.onAnimationProgress,
                    this.options.onAnimationComplete,
                    this
                );
            } else {
                this.draw();
                this.options.onAnimationComplete.call(this);
            }
            return this;
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

            delete VertaChart.instances[this.id];
        },
        toBase64Image: function() {
            return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
        }
    });

    VertaChart.Type.extend = function(extensions) {

        var parent = this;

        var VertaChartType = function() {
            return parent.apply(this, arguments);
        };

        //Copy the prototype object of the this class
        VertaChartType.prototype = clone(parent.prototype);
        //Now overwrite some of the properties in the base class with the new extensions
        extend(VertaChartType.prototype, extensions);

        VertaChartType.extend = VertaChart.Type.extend;

        if (extensions.name || parent.prototype.name) {

            var chartName = extensions.name || parent.prototype.name;
            //Assign any potential default values of the new chart type

            //If none are defined, we'll use a clone of the chart type this is being extended from.
            //I.e. if we extend a line chart, we'll use the defaults from the line chart if our new chart
            //doesn't define some defaults of their own.

            var baseDefaults = (VertaChart.defaults[parent.prototype.name]) ? clone(VertaChart.defaults[parent.prototype.name]) : {};

            VertaChart.defaults[chartName] = extend(baseDefaults, extensions.defaults);

            VertaChart.types[chartName] = VertaChartType;

            //Register this new chart type in the VertaChart prototype
            VertaChart.prototype[chartName] = function(data, options) {
                var config = merge(VertaChart.defaults.global, VertaChart.defaults[chartName], options || {});
                return new VertaChartType(data, config, this);
            };
        } else {
            warn("Name not provided for this chart, so it hasn't been registered");
        }
        return parent;
    };

    VertaChart.Element = function(configuration) {
        extend(this, configuration);
        this.initialize.apply(this, arguments);
        this.save();
    };
    extend(VertaChart.Element.prototype, {
        initialize: function() {},
        restore: function(props) {
            if (!props) {
                extend(this, this._saved);
            } else {
                each(props, function(key) {
                    this[key] = this._saved[key];
                }, this);
            }
            return this;
        },
        save: function() {
            this._saved = clone(this);
            delete this._saved._saved;
            return this;
        },
        update: function(newProps) {
            each(newProps, function(value, key) {
                this._saved[key] = this[key];
                this[key] = value;
            }, this);
            return this;
        },
        transition: function(props, ease) {
            each(props, function(value, key) {
                this[key] = ((value - this._saved[key]) * ease) + this._saved[key];
            }, this);
            return this;
        },
        hasValue: function() {
            return isNumber(this.value);
        }
    });

    VertaChart.Element.extend = inherits;


    VertaChart.Point = VertaChart.Element.extend({
        display: true,
        inRange: function(chartX, chartY) {
            var hitDetectionRange = this.hitDetectionRadius + this.radius;
            return ((Math.pow(chartX - this.x, 2) + Math.pow(chartY - this.y, 2)) < Math.pow(hitDetectionRange, 2));
        },
        draw: function() {
            if (this.display) {
                var ctx = this.ctx;
                ctx.beginPath();

                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.closePath();

                ctx.strokeStyle = this.strokeColor;
                ctx.lineWidth = this.strokeWidth;

                ctx.fillStyle = this.fillColor;

                ctx.fill();
                ctx.stroke();
            } else {
                console.log(this);
                var ctx = this.ctx;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
                ctx.closePath();
                ctx.strokeStyle = "rgba(24,205,229,0.5)";
                ctx.lineWidth = 2;
                ctx.stroke();
            }


            //Quick debug for bezier curve splining
            //Highlights control points and the line between them.
            //Handy for dev - stripped in the min version.

            // ctx.save();
            // ctx.fillStyle = "black";
            // ctx.strokeStyle = "black"
            // ctx.beginPath();
            // ctx.arc(this.controlPoints.inner.x,this.controlPoints.inner.y, 2, 0, Math.PI*2);
            // ctx.fill();

            // ctx.beginPath();
            // ctx.arc(this.controlPoints.outer.x,this.controlPoints.outer.y, 2, 0, Math.PI*2);
            // ctx.fill();

            // ctx.moveTo(this.controlPoints.inner.x,this.controlPoints.inner.y);
            // ctx.lineTo(this.x, this.y);
            // ctx.lineTo(this.controlPoints.outer.x,this.controlPoints.outer.y);
            // ctx.stroke();

            // ctx.restore();



        }
    });

    VertaChart.Arc = VertaChart.Element.extend({
        inRange: function(chartX, chartY) {

            var pointRelativePosition = helpers.getAngleFromPoint(this, {
                x: chartX,
                y: chartY
            });

            //Check if within the range of the open/close angle
            var betweenAngles = (pointRelativePosition.angle >= this.startAngle && pointRelativePosition.angle <= this.endAngle),
                withinRadius = (pointRelativePosition.distance >= this.innerRadius && pointRelativePosition.distance <= this.outerRadius);

            return (betweenAngles && withinRadius);
            //Ensure within the outside of the arc centre, but inside arc outer
        },
        draw: function(animationPercent) {

            var easingDecimal = animationPercent || 1;

            var ctx = this.ctx;

            ctx.beginPath();

            ctx.arc(this.x, this.y, this.outerRadius, this.startAngle, this.endAngle);

            ctx.arc(this.x, this.y, this.innerRadius, this.endAngle, this.startAngle, true);

            ctx.closePath();
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;

            ctx.fillStyle = this.fillColor;

            ctx.fill();
            ctx.lineJoin = 'bevel';

            if (this.showStroke) {
                ctx.stroke();
            }
        }
    });

    VertaChart.Rectangle = VertaChart.Element.extend({
        draw: function() {
            var ctx = this.ctx,
                halfWidth = this.width / 2,
                leftX = this.x - halfWidth,
                rightX = this.x + halfWidth,
                top = this.base - (this.base - this.y),
                halfStroke = this.strokeWidth / 2;

            // Canvas doesn't allow us to stroke inside the width so we can
            // adjust the sizes to fit if we're setting a stroke on the line
            if (this.showStroke) {
                leftX += halfStroke;
                rightX -= halfStroke;
                top += halfStroke;
            }

            ctx.beginPath();

            ctx.fillStyle = this.fillColor;
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;

            // It'd be nice to keep this class totally generic to any rectangle
            // and simply specify which border to miss out.
            ctx.moveTo(leftX, this.base);
            ctx.lineTo(leftX, top);
            ctx.lineTo(rightX, top);
            ctx.lineTo(rightX, this.base);
            ctx.fill();
            if (this.showStroke) {
                ctx.stroke();
            }
        },
        height: function() {
            return this.base - this.y;
        },
        inRange: function(chartX, chartY) {
            return (chartX >= this.x - this.width / 2 && chartX <= this.x + this.width / 2) && (chartY >= this.y && chartY <= this.base);
        }
    });

    VertaChart.YAxis = VertaChart.Element.extend({

        initialize: function() {
            this.data = this.data || [];
        },

        addData: function(data) {
            this.data = this.data.concat(data);
        },
        buildLabels: function() {

            this.yLabels = [];

            var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

            for (var i = 0; i <= this.steps; i++) {
                this.yLabels.push(template(this.templateString, {
                    value: (this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)
                }));
            }
            this.yLabelWidth = (this.display && this.showLabels && this.data.length > 0) ? longestText(this.ctx, this.font, this.yLabels) + 20 : 0;
        },
        calculateYRange: function(currentHeight) {
            if (!this.scaleOverride) {
                var updatedRanges = helpers.calculateScaleRange(
                    this.data,
                    currentHeight,
                    this.fontSize,
                    this.beginAtZero,
                    this.integersOnly
                );
                helpers.extend(this, updatedRanges);

            }
        },
        draw: function(labelOffset, leftLabelsWidth, rightLabelsWidth, isMain) {
            var ctx = this.ctx,
                yLabelGap = (this.endPoint - this.startPoint) / this.steps,
                xStart = Math.round(leftLabelsWidth),
                xEnd = Math.round(this.width - rightLabelsWidth),
                cachedFillStyle = ctx.fillStyle,
                cachedFont = ctx.font;
            ctx.fillStyle = this.textColor;
            ctx.font = this.font;
            each(this.yLabels, function(labelString, index) {
                var yLabelCenter = this.endPoint - (yLabelGap * index),
                    linePositionY = Math.round(yLabelCenter),
                    drawHorizontalLine = this.showHorizontalLines;
                ctx.textAlign = this.positionLeft ? "right" : "left";
                ctx.textBaseline = "middle";
                if (this.showLabels) {
                    ctx.fillStyle = this.textColor;
                    if (this.positionLeft) {
                        ctx.fillText(labelString, (xStart - 10) - labelOffset, yLabelCenter);
                    } else {
                        ctx.fillText(labelString, (xEnd + 20) + labelOffset, yLabelCenter);
                    }
                }

                // This is X axis, so draw it
                if (index === 0 && !drawHorizontalLine) {
                    drawHorizontalLine = true;
                }

                if (drawHorizontalLine) {
                    ctx.beginPath();
                }

                if (index > 0) {
                    // This is a grid line in the centre, so drop that
                    ctx.lineWidth = this.gridLineWidth;
                    ctx.strokeStyle = this.gridLineColor;
                } else {
                    // This is the first line on the scale
                    ctx.lineWidth = this.lineWidth;
                    ctx.strokeStyle = this.lineColor;
                }

                linePositionY += helpers.aliasPixel(ctx.lineWidth);
                if (drawHorizontalLine && isMain) {
                    ctx.moveTo(xStart, linePositionY);
                    ctx.lineTo(xEnd, linePositionY);
                    ctx.stroke();
                    ctx.closePath();
                }
                if (isMain) {

                    ctx.lineWidth = this.lineWidth;
                    ctx.strokeStyle = this.lineColor;
                    ctx.beginPath();
                    if (this.positionLeft) {
                        ctx.moveTo((xStart - 5), linePositionY);
                        ctx.lineTo((xStart), linePositionY);
                    } else {
                        ctx.moveTo((xEnd + 5), linePositionY);
                        ctx.lineTo(xEnd, linePositionY);
                    }
                    ctx.stroke();
                    ctx.closePath();
                }




            }, this);
            ctx.fillStyle = cachedFillStyle;
            ctx.font = cachedFont;
        },
    });

    VertaChart.YAxes = VertaChart.Element.extend({
        initialize: function() {
            this._yAxes = [];
            this.setUpYAxes();

        },

        //create inital axes from the ones passed in. By default if none are present create the deafult
        //axis, if a dataset refrences a axis not present in the axes group create it and provided default setup
        setUpYAxes: function() {
            var defaultConfig = {
                positionLeft: this.positionLeft,
                fontSize: this.fontSize,
                beginAtZero: this.beginAtZero,
                integersOnly: this.integersOnly,
                templateString: this.templateString,
                textColor: this.textColor,
                ctx: this.ctx,
                display: this.display,
                showLabels: this.showLabels,
                showHorizontalLines: this.showHorizontalLines,
                gridLineWidth: this.gridLineWidth,
                gridLineColor: this.gridLineColor,
                lineWidth: this.lineWidth,
                lineColor: this.lineColor,
                width: this.width,
                padding: this.padding,
                font: this.font,
            };
            var counter_count = 0;
            each(this.yAxes, function(yAxis) {
                this._yAxes.push(new VertaChart.YAxis({
                    name: yAxis.name,
                    positionLeft: yAxis.scalePositionLeft !== undefined ? yAxis.scalePositionLeft : this.positionLeft,
                    fontSize: yAxis.scaleFontSize !== undefined ? yaxis.scaleFontSize : this.fontSize,
                    beginAtZero: yAxis.scaleBeginAtZero !== undefined ? yAxis.scaleBeginAtZero : this.beginAtZero,
                    integersOnly: yAxis.scaleIntegersOnly !== undefined ? yAxis.scaleIntegersOnly : this.integersOnly,
                    templateString: yAxis.scaleLabel !== undefined ? yAxis.scaleLabel : this.templateString,
                    textColor: yAxis.scaleFontColor !== undefined ? yAxis.scaleFontColor : this.textColor,
                    showLabels: yAxis.scaleShowLabels !== undefined ? yaxis.scaleShowLabels : this.showLabels,
                    showHorizontalLines: yAxis.showHorizontalLines !== undefined ? yaxis.showHorizontalLines : this.showHorizontalLines,
                    gridLineWidth: (yAxis.scaleShowGridLines !== undefined) ? yAxis.scaleShowGridLines : this.gridLineWidth,
                    gridLineColor: (yAxis.scaleShowGridLines !== undefined) ? yAxis.scaleGridLineColor : this.gridLineColor,
                    lineWidth: yAxis.scaleLineWidth !== undefined ? yAxis.scaleLineWidth : this.lineWidth,
                    lineColor: yAxis.scaleLineColor !== undefined ? yAxis.scaleLineColor : this.lineColor,
                    padding: yAxis.showScale !== undefined && yAxis.showScale? 0 : this.padding,
                    font: helpers.fontString(
                        yAxis.scaleFontSize ? yAxis.scaleFontSize : this.fontSize,
                        yAxis.scaleFontStyle ? yAxis.scaleFontStyle : this.fontStyle,
                        yAxis.scaleFontFamily ? yAxis.scaleFontFamily : this.fontFamily),
                    scaleOverride: yAxis.scaleOverride !== undefined ? yaxis.scaleOverride : this.scaleOverride,
                    steps: yAxis.scaleOverride ? yaxis.scaleSteps : this.scaleSteps,
                    stepValue: yAxis.scaleOverride ? yaxis.scaleStepWidth : this.stepValue,
                    min: yAxis.scaleOverride ? yaxis.scaleStartValue : this.min,
                    max: (window.max_set) ? window.max_set[counter_count] : this.max,
                    display: yAxis.showScale !== undefined ? yAxis.showScale : this.display,
                    width: this.width,
                    ctx: this.ctx,
                }));
                counter_count++;
            }, this);
            if (this._yAxes.length === 0) {
                this._yAxes.push(new VertaChart.YAxis(helpers.extend({
                    name: "default"
                }, defaultConfig)));
            }
            counter_count = 0;
            each(this.datasets, function(data) {
                var yAxis;
                if (data.yAxesGroup) {
                    yAxis = this.getYAxisByGroupName(data.yAxesGroup);
                    if (yAxis) {
                        yAxis.addData(data.values);
                        if(window.max_set){
                            yAxis.max = window.max_set[counter_count];
                        }
                    } else {
                        yAxis = new VertaChart.YAxis(new VertaChart.YAxis(helpers.extend({
                            name: data.yAxesGroup
                        }, defaultConfig)));
                        this._yAxes.push(yAxis);
                        yAxis.addData(data.values);
                    }

                } else {
                    var yAxesGroup = this.getYAxisByIndex(0);
                    data.yAxesGroup = yAxesGroup.name;
                    yAxesGroup.addData(data.values);
                }
                counter_count++;
            }, this);
            counter_count = 0;
        },

        draw: function() {
            var num_axes = this._yAxes.length;
            var final_label = [];
            var unit = [' w', ' bpm', ' km/h', ' rpm', ' m', ' %', ' ºC', 'km'];
            if (window.first_run_handler){
                        window.max_set = [];
            }
            for (var i = 0; i < num_axes; i++){
                var num_labels = this._yAxes[i].yLabels.length;
                if (window.first_run_handler){
                    window.max_set[i] = this._yAxes[i].max;
                    if (i == num_axes -1){
                        window.first_run_handler = false;
                    }
                }
                final_label[i] = window.max_set[i] + unit[i];
                for (var j = 0; j < num_labels; j++){
                    this._yAxes[i].yLabels[j] = '';
                }
            }
            var num_labels = this._yAxes[0].yLabels.length;
            var counter = 0;
            for (var i = num_labels - 1; i >= num_labels - 7; i--){
                this._yAxes[0].yLabels[i] = final_label[counter];
                counter++;
            }
            this._yAxes[0].yLabels[0] = '0';
            var widthModifyLeft = 0;
            var widthModifyRight = 0;
            var drawLines = true;
            var rightLabelsWidth = this.getRightLabelsWidth();
            var leftLabelsWidth = this.getLeftLabelsWidth();
            each(this._yAxes, function(yAxis) {
                if (yAxis.data.length > 0) {
                    if (yAxis.positionLeft) {
                        yAxis.draw(widthModifyLeft, leftLabelsWidth, rightLabelsWidth, drawLines);
                        widthModifyLeft += yAxis.yLabelWidth;
                    } else {
                        yAxis.draw(widthModifyRight, leftLabelsWidth, rightLabelsWidth, drawLines);
                        widthModifyRight += yAxis.yLabelWidth;
                    }

                    if (drawLines) {
                        drawLines = false;
                    }
                }
            });
        },
        getYAxisByIndex: function(index) {
            return this._yAxes[index];
        },

        getYAxisByGroupName: function(groupName) {
            var axis = null;

            each(this._yAxes, function(yAxis) {
                if (yAxis.name === groupName) {
                    axis = yAxis;
                }
            });

            return axis;
        },

        calculateRanges: function(currentHeight) {
            each(this._yAxes, function(axis) {
                axis.calculateYRange(currentHeight);
            });
        },

        setStartEndPoints: function(startPoint, endPoint) {
            each(this._yAxes, function(axis) {
                axis.startPoint = startPoint;
                axis.endPoint = endPoint;
            });
        },
        buildAllLabels: function(currentHeight) {
            each(this._yAxes, function(axis) {
                axis.buildLabels(currentHeight);
            });
        },

        getRightLabelsWidth: function() {
            var width = 0;
            each(this._yAxes, function(axis) {
                if (!axis.positionLeft) {

                    width += axis.yLabelWidth;
                }

            });
            if(this.xLabels && this.xLabels.length > 0 && width === 0)
            {
                return width + (this.ctx.measureText(this.xLabels[this.xLabels.length -1]).width/2);
            }
            return width;
        },

        getLeftLabelsWidth: function() {
            var width = 0;
            each(this._yAxes, function(axis) {
                if (axis.positionLeft) {
                    width += axis.yLabelWidth;
                }
            });

            if(this.xLabels && this.xLabels.length > 0 && width === 0)
            {
                return width + (this.ctx.measureText(this.xLabels[0]).width/2);
            }
            return width;
        }




    });

    VertaChart.Scale = VertaChart.Element.extend({
        initialize: function() {
            this.setUpYAxes();
            this.fit();

        },

        setUpYAxes: function() {
            this.yAxes = new VertaChart.YAxes({
                datasets: this.datasets,
                templateString: this.templateString,
                height: this.height,
                width: this.width,
                ctx: this.ctx,
                textColor: this.textColor,
                offsetGridLines: this.offsetGridLines,
                fontSize: this.fontSize,
                fontStyle: this.fontStyle,
                fontFamily: this.fontFamily,
                beginAtZero: this.beginAtZero,
                integersOnly: this.integersOnly,
                font: helpers.fontString(this.fontSize, this.fontStyle, this.fontFamily),
                lineWidth: this.lineWidth,
                lineColor: this.lineColor,
                showHorizontalLines: this.showHorizontalLines,
                gridLineWidth: this.gridLineWidth,
                gridLineColor: this.gridLineColor,
                padding: this.padding,
                showLabels: this.showLabels,
                display: this.display,
                yAxes: this.yAxes,
                positionLeft: this.positionLeft,
                xLabels: this.xLabels
            });

        },

        addXLabel: function(label) {
            this.xLabels.push(label);
            this.valuesCount++;
            this.fit();
        },
        removeXLabel: function() {
            this.xLabels.shift();
            this.valuesCount--;
            this.fit();
        },
        // Fitting loop to rotate x Labels and figure out what fits there, and also calculate how many Y steps to use
        fit: function() {
            // First we need the width of the yLabels, assuming the xLabels aren't rotated

            // To do that we need the base line at the top and base of the chart, assuming there is no x label rotation
            this.startPoint = (this.display) ? this.fontSize : 0;
            this.endPoint = (this.display) ? this.height - (this.fontSize * 1.5) - 5 : this.height; // -5 to pad labels

            // Apply padding settings to the start and end point.
            this.startPoint += this.padding;
            this.endPoint -= this.padding;

            // Cache the starting endpoint, excluding the space for x labels
            var cachedEndPoint = this.endPoint;

            // Cache the starting height, so can determine if we need to recalculate the scale yAxis
            var cachedHeight = this.endPoint - this.startPoint,
                cachedYLabelWidth;

            // Build the current yLabels so we have an idea of what size they'll be to start
            /*
             *  This sets what is returned from calculateScaleRange as static properties of this class:
             *
                this.steps;
                this.stepValue;
                this.min;
                this.max;
             *
             */
            this.yAxes.calculateRanges(cachedHeight);
            this.yAxes.setStartEndPoints(this.startPoint, this.endPoint);

            // With these properties set we can now build the array of yLabels
            // and also the width of the largest yLabel
            this.yAxes.buildAllLabels();

            this.calculateXLabelRotation();

            while ((cachedHeight > this.endPoint - this.startPoint)) {
                cachedHeight = this.endPoint - this.startPoint;
                cachedYLabelWidth = this.yAxes.getLeftLabelsWidth() + this.yAxes.getRightLabelsWidth();

                this.yAxes.calculateRanges(cachedHeight);
                this.yAxes.setStartEndPoints(this.startPoint, this.endPoint);



                // With these properties set we can now build the array of yLabels
                // and also the width of the largest yLabel
                this.yAxes.buildAllLabels();


                // Only go through the xLabel loop again if the yLabel width has changed
                if (cachedYLabelWidth < this.yAxes.getLeftLabelsWidth() + this.yAxes.getRightLabelsWidth()) {
                    this.endPoint = cachedEndPoint;
                    this.calculateXLabelRotation();
                    this.yAxes.setStartEndPoints(this.startPoint, this.endPoint);

                }
            }



        },
        calculateXLabelRotation: function() {
            //Get the width of each grid by calculating the difference
            //between x offsets between 0 and 1.

            this.ctx.font = this.font;

            var firstWidth = this.ctx.measureText(this.xLabels[0]).width,
                lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width,
                firstRotated,
                lastRotated;


            this.xScalePaddingRight = this.yAxes.getRightLabelsWidth();
            this.xScalePaddingLeft = this.yAxes.getLeftLabelsWidth();

            this.xLabelRotation = 0;
            if (this.display) {
                var originalLabelWidth = longestText(this.ctx, this.font, this.xLabels),
                    cosRotation,
                    firstRotatedWidth;
                this.xLabelWidth = originalLabelWidth;
                //Allow 3 pixels x2 padding either side for label readability
                var xGridWidth = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6;

                //Max label rotate should be 90 - also act as a loop counter
                while ((this.xLabelWidth > xGridWidth && this.xLabelRotation === 0) || (this.xLabelWidth > xGridWidth && this.xLabelRotation <= 90 && this.xLabelRotation > 0)) {
                    cosRotation = Math.cos(toRadians(this.xLabelRotation));

                    firstRotated = cosRotation * firstWidth;
                    lastRotated = cosRotation * lastWidth;


                    this.xLabelRotation++;
                    this.xLabelWidth = cosRotation * originalLabelWidth;

                }
                if (this.xLabelRotation > 0) {
                    this.endPoint -= Math.sin(toRadians(this.xLabelRotation)) * originalLabelWidth + 3;
                }
            } else {
                this.xLabelWidth = 0;
                this.xScalePaddingRight = this.padding;
                this.xScalePaddingLeft = this.padding;
            }

        },
        // Needs to be overidden in each VertaChart type
        // Otherwise we need to pass all the data into the scale class
        calculateYRange: noop,
        drawingArea: function() {
            return this.startPoint - this.endPoint;
        },
        calculateY: function(point) {
            var yAxesGroup = this.yAxes.getYAxisByGroupName(point.yAxesGroup) || this.yAxes.getYAxisByIndex(0);
            var min = 0,
                max = window.max_set[window.counter],
                //max = 900,
                scalingFactor = this.drawingArea() / (min - max);
            return this.endPoint - (scalingFactor * (point.value - min));
          //  return 200;
        },
        calculateX: function(index) {
            var isRotated = (this.xLabelRotation > 0),
                // innerWidth = (this.offsetGridLines) ? this.width - offsetLeft - this.padding : this.width - (offsetLeft + halfLabelWidth * 2) - this.padding,
                innerWidth = this.width - (this.yAxes.getLeftLabelsWidth() + this.yAxes.getRightLabelsWidth()),
                valueWidth = innerWidth / Math.max((this.valuesCount - ((this.offsetGridLines) ? 0 : 1)), 1),
                valueOffset = (valueWidth * index) + this.yAxes.getLeftLabelsWidth();
            if (this.offsetGridLines) {
                valueOffset += (valueWidth / 2);
            }

            return Math.round(valueOffset);
        },
        update: function(newProps) {
            helpers.extend(this, newProps);
            this.fit();
        },


        draw: function() {
            var ctx = this.ctx;
            if (this.display) {
                this.yAxes.draw();
                each(this.xLabels, function(label, index) {
                    var xPos = this.calculateX(index) + aliasPixel(this.lineWidth),
                        // Check to see if line/bar here and decide where to place the line
                        linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + aliasPixel(this.lineWidth),
                        isRotated = (this.xLabelRotation > 0),
                        drawVerticalLine = this.showVerticalLines;

                    ctx.fillStyle = this.textColor;
                    ctx.font = this.font;

                    // This is Y axis, so draw it
                    if (index === 0 && !drawVerticalLine) {
                        drawVerticalLine = true;
                    }

                    if (drawVerticalLine) {
                        ctx.beginPath();
                    }

                    if (index > 0) {
                        // This is a grid line in the centre, so drop that
                        ctx.lineWidth = this.gridLineWidth;
                        ctx.strokeStyle = this.gridLineColor;
                    } else {
                        // This is the first line on the scale
                        ctx.lineWidth = this.lineWidth;
                        ctx.strokeStyle = this.lineColor;
                    }

                    if (drawVerticalLine) {
                        ctx.moveTo(linePos, this.endPoint);
                        ctx.lineTo(linePos, this.startPoint - 3);
                        ctx.stroke();
                        ctx.closePath();
                    }


                    ctx.lineWidth = this.lineWidth;
                    ctx.strokeStyle = this.lineColor;


                    // Small lines at the bottom of the base grid line
                    ctx.beginPath();
                    ctx.moveTo(linePos, this.endPoint);
                    ctx.lineTo(linePos, this.endPoint + 5);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.save();
                    ctx.translate(xPos, (isRotated) ? this.endPoint + 12 : this.endPoint + 8);
                    ctx.rotate(toRadians(this.xLabelRotation) * -1);
                    ctx.font = this.font;
                    ctx.textAlign = (isRotated) ? "right" : "center";
                    ctx.textBaseline = (isRotated) ? "middle" : "top";
                    ctx.fillText(label, 0, 0);
                    ctx.restore();
                }, this);

            }
        }

    });

    VertaChart.RadialScale = VertaChart.Element.extend({
        initialize: function() {
            this.size = min([this.height, this.width]);
            this.drawingArea = (this.display) ? (this.size / 2) - (this.fontSize / 2 + this.backdropPaddingY) : (this.size / 2);
        },
        calculateCenterOffset: function(value) {
            // Take into account half font size + the yPadding of the top value
            var scalingFactor = this.drawingArea / (this.max - this.min);

            return (value - this.min) * scalingFactor;
        },
        update: function() {
            if (!this.lineArc) {
                this.setScaleSize();
            } else {
                this.drawingArea = (this.display) ? (this.size / 2) - (this.fontSize / 2 + this.backdropPaddingY) : (this.size / 2);
            }
            this.buildYLabels();
        },
        buildYLabels: function() {
            this.yLabels = [];

            var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

            for (var i = 0; i <= this.steps; i++) {
                this.yLabels.push(template(this.templateString, {
                    value: (this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)
                }));
            }
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
            var largestPossibleRadius = min([(this.height / 2 - this.pointLabelFontSize - 5), this.width / 2]),
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
            this.ctx.font = fontString(this.pointLabelFontSize, this.pointLabelFontStyle, this.pointLabelFontFamily);
            for (i = 0; i < this.valuesCount; i++) {
                // 5px to space the text slightly out - similar to what we do in the draw function.
                pointPosition = this.getPointPosition(i, largestPossibleRadius);
                textWidth = this.ctx.measureText(template(this.templateString, {
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
            radiusReductionRight = (isNumber(radiusReductionRight)) ? radiusReductionRight : 0;
            radiusReductionLeft = (isNumber(radiusReductionLeft)) ? radiusReductionLeft : 0;

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
        getPointPosition: function(index, distanceFromCenter) {
            var thisAngle = this.getIndexAngle(index);
            return {
                x: (Math.cos(thisAngle) * distanceFromCenter) + this.xCenter,
                y: (Math.sin(thisAngle) * distanceFromCenter) + this.yCenter
            };
        },
        draw: function() {
            if (this.display) {
                var ctx = this.ctx;
                each(this.yLabels, function(label, index) {
                    // Don't draw a centre value
                    if (index > 0) {
                        var yCenterOffset = index * (this.drawingArea / this.steps),
                            yHeight = this.yCenter - yCenterOffset,
                            pointPosition;

                        // Draw circular lines around the scale
                        if (this.lineWidth > 0) {
                            ctx.strokeStyle = this.lineColor;
                            ctx.lineWidth = this.lineWidth;

                            if (this.lineArc) {
                                ctx.beginPath();
                                ctx.arc(this.xCenter, this.yCenter, yCenterOffset, 0, Math.PI * 2);
                                ctx.closePath();
                                ctx.stroke();
                            } else {
                                ctx.beginPath();
                                for (var i = 0; i < this.valuesCount; i++) {
                                    pointPosition = this.getPointPosition(i, this.calculateCenterOffset(this.min + (index * this.stepValue)));
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
                        if (this.showLabels) {
                            ctx.font = fontString(this.fontSize, this.fontStyle, this.fontFamily);
                            if (this.showLabelBackdrop) {
                                var labelWidth = ctx.measureText(label).width;
                                ctx.fillStyle = this.backdropColor;
                                ctx.fillRect(
                                    this.xCenter - labelWidth / 2 - this.backdropPaddingX,
                                    yHeight - this.fontSize / 2 - this.backdropPaddingY,
                                    labelWidth + this.backdropPaddingX * 2,
                                    this.fontSize + this.backdropPaddingY * 2
                                );
                            }
                            ctx.textAlign = 'center';
                            ctx.textBaseline = "middle";
                            ctx.fillStyle = this.fontColor;
                            ctx.fillText(label, this.xCenter, yHeight);
                        }
                    }
                }, this);

                if (!this.lineArc) {
                    ctx.lineWidth = this.angleLineWidth;
                    ctx.strokeStyle = this.angleLineColor;
                    for (var i = this.valuesCount - 1; i >= 0; i--) {
                        if (this.angleLineWidth > 0) {
                            var outerPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max));
                            ctx.beginPath();
                            ctx.moveTo(this.xCenter, this.yCenter);
                            ctx.lineTo(outerPosition.x, outerPosition.y);
                            ctx.stroke();
                            ctx.closePath();
                        }
                        // Extra 3px out for some label spacing
                        var pointLabelPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max) + 5);
                        ctx.font = fontString(this.pointLabelFontSize, this.pointLabelFontStyle, this.pointLabelFontFamily);
                        ctx.fillStyle = this.pointLabelFontColor;

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

    // Attach global event to resize each chart instance when the browser resizes
    helpers.addEvent(window, "resize", (function() {
        // Basic debounce of resize function so it doesn't hurt performance when resizing browser.
        var timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                each(VertaChart.instances, function(instance) {
                    // If the responsive flag is set in the chart instance config
                    // Cascade the resize event down to the chart.
                    if (instance.options.responsive) {
                        instance.resize(instance.render, true);
                    }
                });
            }, 50);
        };
    })());


    if (amd) {
        define(function() {
            return VertaChart;
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = VertaChart;
    }

    root.VertaChart = VertaChart;

    VertaChart.noConflict = function() {
        root.VertaChart = previous;
        return VertaChart;
    };

}).call(this);

(function(){
    "use strict";

    var root = this,
        VertaChart = root.VertaChart,
        helpers = VertaChart.helpers;


    var defaultConfig = {
        //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero : true,

        //Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines : true,

        //String - Colour of the grid lines
        scaleGridLineColor : "rgba(0,0,0,.05)",

        //Number - Width of the grid lines
        scaleGridLineWidth : 1,

        //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowHorizontalLines: true,

        //Boolean - Whether to show vertical lines (except Y axis)
        scaleShowVerticalLines: true,

        //Boolean - If there is a stroke on each bar
        barShowStroke : true,

        //Number - Pixel width of the bar stroke
        barStrokeWidth : 2,

        //Number - Spacing between each of the X value sets
        barValueSpacing : 5,

        //Number - Spacing between data sets within X values
        barDatasetSpacing : 1,

        //String - A legend template
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };

VertaChart.Type.extend({
        name: "Line",
        defaults: defaultConfig,
        initialize: function(data) {
            //Declare the extension of the default point, to cater for the options passed in to the constructor
            this.PointClass = VertaChart.Point.extend({
                offsetGridLines: this.options.offsetGridLines,
                strokeWidth: this.options.pointDotStrokeWidth,
                radius: this.options.pointDotRadius,
                display: this.options.pointDot,
                hitDetectionRadius: this.options.pointHitDetectionRadius,
                ctx: this.chart.ctx,
                inRange: function(mouseX) {
                    return (Math.pow(mouseX - this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius, 2));
                }
            });

            this.datasets = [];
            this.yAxes = data.yAxes;

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt) {
                    var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
                    this.eachPoints(function(point) {
                        point.restore(['fillColor', 'strokeColor']);
                    });
                    helpers.each(activePoints, function(activePoint) {
                        activePoint.fillColor = activePoint.highlightFill;
                        activePoint.strokeColor = activePoint.highlightStroke;
                    });
                    this.showTooltip(activePoints);
                });
            }

            //Iterate through each of the datasets, and build this into a property of the chart
            helpers.each(data.datasets, function(dataset) {

                var datasetObject = {
                    label: dataset.label || null,
                    fillColor: dataset.fillColor,
                    strokeColor: dataset.strokeColor,
                    pointColor: dataset.pointColor,
                    pointStrokeColor: dataset.pointStrokeColor,
                    points: [],
                    yAxesGroup: dataset.yAxesGroup,
                    values: dataset.data
                };

                this.datasets.push(datasetObject);


                helpers.each(dataset.data, function(dataPoint, index) {

                    //Add a new point for each piece of data, passing any required data to draw.
                    datasetObject.points.push(new this.PointClass({
                        value: dataPoint,
                        label: data.labels[index],
                        datasetLabel: dataset.label,
                        strokeColor: dataset.pointStrokeColor,
                        fillColor: dataset.pointColor,
                        highlightFill: dataset.pointHighlightFill || dataset.pointColor,
                        highlightStroke: dataset.pointHighlightStroke || dataset.pointStrokeColor,
                        yAxesGroup: dataset.yAxesGroup
                    }));
                }, this);



            }, this);

            this.buildScale(data.labels);

            this.eachPoints(function(point, index) {
                helpers.extend(point, {
                    x: this.scale.calculateX(index),
                    y: this.scale.endPoint
                });
                point.save();
            }, this);




            this.render();
        },
        update: function() {
            this.scale.update();
            // Reset any highlight colours before updating.
            helpers.each(this.activeElements, function(activeElement) {
                activeElement.restore(['fillColor', 'strokeColor']);
            });
            this.eachPoints(function(point) {
                point.save();
            });
            this.render();
        },
        eachPoints: function(callback) {
            helpers.each(this.datasets, function(dataset) {
                helpers.each(dataset.points, callback, this);
            }, this);
        },
        getPointsAtEvent: function(e) {
            var pointsArray = [],
                eventPosition = helpers.getRelativePosition(e);
            helpers.each(this.datasets, function(dataset) {
                helpers.each(dataset.points, function(point) {
                    if (point.inRange(eventPosition.x, eventPosition.y)) pointsArray.push(point);
                });
            }, this);
            return pointsArray;
        },
        buildScale: function(labels) {
            var self = this;

            var scaleOptions = {
                templateString: this.options.scaleLabel,
                height: this.chart.height,
                width: this.chart.width,
                ctx: this.chart.ctx,
                textColor: this.options.scaleFontColor,
                offsetGridLines: this.options.offsetGridLines,
                fontSize: this.options.scaleFontSize,
                fontStyle: this.options.scaleFontStyle,
                fontFamily: this.options.scaleFontFamily,
                valuesCount: labels.length,
                beginAtZero: this.options.scaleBeginAtZero,
                integersOnly: this.options.scaleIntegersOnly,
                datasets: this.datasets,
                xLabels: labels,
                font: helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                lineWidth: this.options.scaleLineWidth,
                lineColor: this.options.scaleLineColor,
                showHorizontalLines: this.options.scaleShowHorizontalLines,
                showVerticalLines: this.options.scaleShowVerticalLines,
                gridLineWidth: (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
                gridLineColor: (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
                padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
                showLabels: this.options.scaleShowLabels,
                display: this.options.showScale,
                yAxes: this.yAxes,
                positionLeft: this.options.scalePositionLeft

            };

            if (this.options.scaleOverride) {
                helpers.extend(scaleOptions, {
                    calculateYRange: helpers.noop,
                    steps: this.options.scaleSteps,
                    stepValue: this.options.scaleStepWidth,
                    min: this.options.scaleStartValue,
                    max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
                });
            }

            this.scale = new VertaChart.Scale(scaleOptions);
        },
        addData: function(valuesArray, label) {
            //Map the values array for each of the datasets

            helpers.each(valuesArray, function(value, datasetIndex) {
                //Add a new point for each piece of data, passing any required data to draw.
                this.datasets[datasetIndex].points.push(new this.PointClass({
                    value: value,
                    label: label,
                    x: this.scale.calculateX(this.scale.valuesCount + 1),
                    y: this.scale.endPoint,
                    strokeColor: this.datasets[datasetIndex].pointStrokeColor,
                    fillColor: this.datasets[datasetIndex].pointColor,
                    yAxesGroup: this.datasets[datasetIndex].yAxesGroup
                }));
            }, this);

            this.scale.addXLabel(label);
            //Then re-render the chart.
            this.update();
        },
        removeData: function() {
            this.scale.removeXLabel();
            //Then re-render the chart.
            helpers.each(this.datasets, function(dataset) {
                dataset.points.shift();
            }, this);
            this.update();
        },
        reflow: function() {
            var newScaleProps = helpers.extend({
                height: this.chart.height,
                width: this.chart.width
            });
            this.scale.update(newScaleProps);
        },
        draw: function(ease) {
            var easingDecimal = ease || 1;
            this.clear();

            var ctx = this.chart.ctx;

            // Some helper methods for getting the next/prev points
            var hasValue = function(item) {
                    return item.value !== null;
                },
                nextPoint = function(point, collection, index) {
                    return helpers.findNextWhere(collection, hasValue, index) || point;
                },
                previousPoint = function(point, collection, index) {
                    return helpers.findPreviousWhere(collection, hasValue, index) || point;
                };

            this.scale.draw(easingDecimal);

            window.counter = 0;
            helpers.each(this.datasets, function(dataset) {
                var pointsWithValues = helpers.where(dataset.points, hasValue);

                //Transition each point first so that the line and point drawing isn't out of sync
                //We can use this extra loop to calculate the control points of this dataset also in this loop

                helpers.each(dataset.points, function(point, index) {
                    if (point.hasValue()) {
                        point.transition({
                            y: this.scale.calculateY(point),
                            x: this.scale.calculateX(index)
                        }, easingDecimal);
                    }
                }, this);

                window.counter++;

                // Control points need to be calculated in a seperate loop, because we need to know the current x/y of the point
                // This would cause issues when there is no animation, because the y of the next point would be 0, so beziers would be skewed
                if (this.options.bezierCurve) {
                    helpers.each(pointsWithValues, function(point, index) {
                        var tension = (index > 0 && index < pointsWithValues.length - 1) ? this.options.bezierCurveTension : 0;
                        point.controlPoints = helpers.splineCurve(
                            previousPoint(point, pointsWithValues, index),
                            point,
                            nextPoint(point, pointsWithValues, index),
                            tension
                        );

                        // Prevent the bezier going outside of the bounds of the graph

                        // Cap puter bezier handles to the upper/lower scale bounds
                        if (point.controlPoints.outer.y > this.scale.endPoint) {
                            point.controlPoints.outer.y = this.scale.endPoint;
                        } else if (point.controlPoints.outer.y < this.scale.startPoint) {
                            point.controlPoints.outer.y = this.scale.startPoint;
                        }

                        // Cap inner bezier handles to the upper/lower scale bounds
                        if (point.controlPoints.inner.y > this.scale.endPoint) {
                            point.controlPoints.inner.y = this.scale.endPoint;
                        } else if (point.controlPoints.inner.y < this.scale.startPoint) {
                            point.controlPoints.inner.y = this.scale.startPoint;
                        }
                    }, this);
                }


                //Draw the line between all the points
                ctx.lineWidth = this.options.datasetStrokeWidth;
                ctx.strokeStyle = (dataset.label == "leftRightBalance") ? "transparent" : dataset.strokeColor;
                ctx.beginPath();

                helpers.each(pointsWithValues, function(point, index) {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        if (this.options.bezierCurve) {
                            var previous = previousPoint(point, pointsWithValues, index);

                            ctx.bezierCurveTo(
                                previous.controlPoints.outer.x,
                                previous.controlPoints.outer.y,
                                point.controlPoints.inner.x,
                                point.controlPoints.inner.y,
                                point.x,
                                point.y
                            );
                        } else {
                            ctx.lineTo(point.x, point.y);
                        }
                    }
                }, this);

                ctx.stroke();

                if (this.options.datasetFill && pointsWithValues.length > 0) {
                    //Round off the line by going to the base of the chart, back to the start, then fill.
                    console.log(this);
                    if(point.datasetLabel !== "leftRightBalance"){
                        ctx.lineTo(pointsWithValues[pointsWithValues.length - 1].x, this.scale.endPoint);
                        ctx.lineTo(pointsWithValues[0].x, this.scale.endPoint);
                        ctx.fillStyle = dataset.fillColor;
                        ctx.closePath();
                        ctx.fill();
                    }
                }

                //Now draw the points over the line
                //A little inefficient double looping, but better than the line
                //lagging behind the point positions

                helpers.each(pointsWithValues, function(point) {
                    if ((point.datasetLabel == "leftRightBalance") && (dataset.strokeColor !== "transparent")){
                        point.draw();
                    }
                });
            }, this);
        }
    });

                window.counter = 0;

}).call(this);

(function(){
    "use strict";

    var root = this,
        VertaChart = root.VertaChart,
        //Cache a local reference to VertaChart.helpers
        helpers = VertaChart.helpers;

    var defaultConfig = {
        //Boolean - Show a backdrop to the scale label
        scaleShowLabelBackdrop : true,

        //String - The colour of the label backdrop
        scaleBackdropColor : "rgba(255,255,255,0.75)",

        // Boolean - Whether the scale should begin at zero
        scaleBeginAtZero : true,

        //Number - The backdrop padding above & below the label in pixels
        scaleBackdropPaddingY : 2,

        //Number - The backdrop padding to the side of the label in pixels
        scaleBackdropPaddingX : 2,

        //Boolean - Show line for each value in the scale
        scaleShowLine : true,

        //Boolean - Stroke a line around each segment in the chart
        segmentShowStroke : true,

        //String - The colour of the stroke on each segement.
        segmentStrokeColor : "#fff",

        //Number - The width of the stroke value in pixels
        segmentStrokeWidth : 2,

        //Number - Amount of animation steps
        animationSteps : 100,

        //String - Animation easing effect.
        animationEasing : "easeOutBounce",

        //Boolean - Whether to animate the rotation of the chart
        animateRotate : true,

        //Boolean - Whether to animate scaling the chart from the centre
        animateScale : false,

        //String - A legend template
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
    };

}).call(this);
