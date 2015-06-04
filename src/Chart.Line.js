(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        helpers = Chart.helpers;

    var defaultConfig = {

        stacked: false,

        hover: {
            mode: "label"
        },

        scales: {
            xAxes: [{
                scaleType: "dataset", // scatter should not use a dataset axis
                display: true,
                position: "bottom",
                id: "x-axis-1", // need an ID so datasets can reference the scale

                // grid line settings
                gridLines: {
                    show: true,
                    color: "rgba(0, 0, 0, 0.05)",
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
            }],
            yAxes: [{
                scaleType: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: "left",
                id: "y-axis-1",

                // grid line settings
                gridLines: {
                    show: true,
                    color: "rgba(0, 0, 0, 0.05)",
                    lineWidth: 1,
                    drawOnChartArea: true,
                    drawTicks: true, // draw ticks extending towards the label
                    zeroLineWidth: 1,
                    zeroLineColor: "rgba(0,0,0,0.25)",
                },

                // scale numbers
                beginAtZero: false,
                override: null,

                // label settings
                labels: {
                    show: true,
                    template: "<%=value%>",
                    fontSize: 12,
                    fontStyle: "normal",
                    fontColor: "#666",
                    fontFamily: "Helvetica Neue",
                }
            }],
        },
    };


    Chart.Type.extend({
        name: "Line",
        defaults: defaultConfig,
        initialize: function() {

            var _this = this;

            // Events
            helpers.bindEvents(this, this.options.events, this.events);

            // Create a new line and its points for each dataset and piece of data
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {

                dataset.metaDataset = new Chart.Line({
                    _chart: this.chart,
                    _datasetIndex: datasetIndex,
                    _points: dataset.metaData,
                });

                dataset.metaData = [];

                helpers.each(dataset.data, function(dataPoint, index) {
                    dataset.metaData.push(new Chart.Point({
                        _datasetIndex: datasetIndex,
                        _index: index,
                        _chart: this.chart,
                        _model: {
                            x: 0, //xScale.getPixelForValue(null, index, true),
                            y: 0, //this.chartArea.bottom,
                        },
                    }));

                }, this);

                // The line chart onlty supports a single x axis because the x axis is always a dataset axis
                dataset.xAxisID = this.options.scales.xAxes[0].id;

                if (!dataset.yAxisID) {
                    dataset.yAxisID = this.options.scales.yAxes[0].id;
                }

            }, this);

            // Build and fit the scale. Needs to happen after the axis IDs have been set
            this.buildScale();

            // Create tooltip instance exclusively for this chart with some defaults.
            this.tooltip = new Chart.Tooltip({
                _chart: this.chart,
                _data: this.data,
                _options: this.options,
            }, this);

            // Need to fit scales before we reset elements. 
            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // Reset so that we animation from the baseline
            this.resetElements();

            // Update that shiz
            this.update();
        },
        nextPoint: function(collection, index) {
            return collection[index + 1] || collection[index];
        },
        previousPoint: function(collection, index) {
            return collection[index - 1] || collection[index];
        },
        resetElements: function() {
            // Update the points
            this.eachElement(function(point, index, dataset, datasetIndex) {
                var xScale = this.scales[this.data.datasets[datasetIndex].xAxisID];
                var yScale = this.scales[this.data.datasets[datasetIndex].yAxisID];

                var yScalePoint;

                if (yScale.min < 0 && yScale.max <0) {
                    // all less than 0. use the top
                    yScalePoint = yScale.getPixelForValue(yScale.max);
                } else if (yScale.min > 0 && yScale.max > 0) {
                    yScalePoint = yScale.getPixelForValue(yScale.min);
                } else {
                    yScalePoint = yScale.getPixelForValue(0);
                }

                helpers.extend(point, {
                    // Utility
                    _chart: this.chart,
                    _xScale: xScale,
                    _yScale: yScale,
                    _datasetIndex: datasetIndex,
                    _index: index,

                    // Desired view properties
                    _model: {
                        x: xScale.getPixelForValue(null, index, true), // value not used in dataset scale, but we want a consistent API between scales
                        y: yScalePoint,

                        // Appearance
                        tension: point.custom && point.custom.tension ? point.custom.tension : this.options.elements.line.tension,
                        radius: point.custom && point.custom.radius ? point.custom.pointRadius : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].pointRadius, index, this.options.elements.point.radius),
                        backgroundColor: point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].pointBackgroundColor, index, this.options.elements.point.backgroundColor),
                        borderColor: point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].pointBorderColor, index, this.options.elements.point.borderColor),
                        borderWidth: point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].pointBorderWidth, index, this.options.elements.point.borderWidth),
                        skip: typeof this.data.datasets[datasetIndex].data[index] != 'number',

                        // Tooltip
                        hoverRadius: point.custom && point.custom.hoverRadius ? point.custom.hoverRadius : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].pointHitRadius, index, this.options.elements.point.hitRadius),
                    },
                });
            }, this);

            // Update control points for the bezier curve
            this.eachElement(function(point, index, dataset, datasetIndex) {
                var controlPoints = helpers.splineCurve(
                    this.previousPoint(dataset, index)._model,
                    point._model,
                    this.nextPoint(dataset, index)._model,
                    point._model.tension
                );

                point._model.controlPointPreviousX = controlPoints.previous.x;
                point._model.controlPointNextX = controlPoints.next.x;

                // Prevent the bezier going outside of the bounds of the graph

                // Cap puter bezier handles to the upper/lower scale bounds
                if (controlPoints.next.y > this.chartArea.bottom) {
                    point._model.controlPointNextY = this.chartArea.bottom;
                } else if (controlPoints.next.y < this.chartArea.top) {
                    point._model.controlPointNextY = this.chartArea.top;
                } else {
                    point._model.controlPointNextY = controlPoints.next.y;
                }

                // Cap inner bezier handles to the upper/lower scale bounds
                if (controlPoints.previous.y > this.chartArea.bottom) {
                    point._model.controlPointPreviousY = this.chartArea.bottom;
                } else if (controlPoints.previous.y < this.chartArea.top) {
                    point._model.controlPointPreviousY = this.chartArea.top;
                } else {
                    point._model.controlPointPreviousY = controlPoints.previous.y;
                }

                // Now pivot the point for animation
                point.pivot();
            }, this);
        },
        update: function() {

            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // Update the lines
            this.eachDataset(function(dataset, datasetIndex) {
                var yScale = this.scales[dataset.yAxisID];

                helpers.extend(dataset.metaDataset, {
                    // Utility
                    _scale: yScale,
                    _datasetIndex: datasetIndex,
                    // Data
                    _children: dataset.metaData,
                    // Model
                    _model: {
                        // Appearance
                        tension: dataset.tension || this.options.elements.line.tension,
                        backgroundColor: dataset.backgroundColor || this.options.elements.line.backgroundColor,
                        borderWidth: dataset.borderWidth || this.options.elements.line.borderWidth,
                        borderColor: dataset.borderColor || this.options.elements.line.borderColor,
                        fill: dataset.fill !== undefined ? dataset.fill : this.options.elements.line.fill, // use the value from the dataset if it was provided. else fall back to the default
                        skipNull: dataset.skipNull !== undefined ? dataset.skipNull : this.options.elements.line.skipNull,
                        drawNull: dataset.drawNull !== undefined ? dataset.drawNull : this.options.elements.line.drawNull,
                        // Scale
                        scaleTop: yScale.top,
                        scaleBottom: yScale.bottom,
                        scaleZero: yScale.getPixelForValue(0),
                    },
                });

                dataset.metaDataset.pivot();
            });

            // Update the points
            this.eachElement(function(point, index, dataset, datasetIndex) {
                var xScale = this.scales[this.data.datasets[datasetIndex].xAxisID];
                var yScale = this.scales[this.data.datasets[datasetIndex].yAxisID];

                helpers.extend(point, {
                    // Utility
                    _chart: this.chart,
                    _xScale: xScale,
                    _yScale: yScale,
                    _datasetIndex: datasetIndex,
                    _index: index,

                    // Desired view properties
                    _model: {
                        x: xScale.getPixelForValue(null, index, true), // value not used in dataset scale, but we want a consistent API between scales
                        y: yScale.getPointPixelForValue(this.data.datasets[datasetIndex].data[index], index, datasetIndex),

                        // Appearance
                        tension: point.custom && point.custom.tension ? point.custom.tension : this.options.elements.line.tension,
                        radius: point.custom && point.custom.radius ? point.custom.pointRadius : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].pointRadius, index, this.options.elements.point.radius),
                        backgroundColor: point.custom && point.custom.backgroundColor ? point.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].pointBackgroundColor, index, this.options.elements.point.backgroundColor),
                        borderColor: point.custom && point.custom.borderColor ? point.custom.borderColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].pointBorderColor, index, this.options.elements.point.borderColor),
                        borderWidth: point.custom && point.custom.borderWidth ? point.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].pointBorderWidth, index, this.options.elements.point.borderWidth),
                        skip: typeof this.data.datasets[datasetIndex].data[index] != 'number',

                        // Tooltip
                        hoverRadius: point.custom && point.custom.hoverRadius ? point.custom.hoverRadius : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].pointHitRadius, index, this.options.elements.point.hitRadius),
                    },
                });
            }, this);


            // Update control points for the bezier curve
            this.eachElement(function(point, index, dataset, datasetIndex) {
                var controlPoints = helpers.splineCurve(
                    this.previousPoint(dataset, index)._model,
                    point._model,
                    this.nextPoint(dataset, index)._model,
                    point._model.tension
                );

                point._model.controlPointPreviousX = controlPoints.previous.x;
                point._model.controlPointNextX = controlPoints.next.x;

                // Prevent the bezier going outside of the bounds of the graph

                // Cap puter bezier handles to the upper/lower scale bounds
                if (controlPoints.next.y > this.chartArea.bottom) {
                    point._model.controlPointNextY = this.chartArea.bottom;
                } else if (controlPoints.next.y < this.chartArea.top) {
                    point._model.controlPointNextY = this.chartArea.top;
                } else {
                    point._model.controlPointNextY = controlPoints.next.y;
                }

                // Cap inner bezier handles to the upper/lower scale bounds
                if (controlPoints.previous.y > this.chartArea.bottom) {
                    point._model.controlPointPreviousY = this.chartArea.bottom;
                } else if (controlPoints.previous.y < this.chartArea.top) {
                    point._model.controlPointPreviousY = this.chartArea.top;
                } else {
                    point._model.controlPointPreviousY = controlPoints.previous.y;
                }

                // Now pivot the point for animation
                point.pivot();
            }, this);

            this.render();
        },
        buildScale: function() {
            var self = this;

            // Function to determine the range of all the 
            var calculateYRange = function() {
                this.min = null;
                this.max = null;

                var positiveValues = [];
                var negativeValues = [];

                if (self.options.stacked) {
                    helpers.each(self.data.datasets, function(dataset) {
                        if (dataset.yAxisID === this.id) {
                            helpers.each(dataset.data, function(value, index) {
                                positiveValues[index] = positiveValues[index] || 0;
                                negativeValues[index] = negativeValues[index] || 0;

                                if (self.options.relativePoints) {
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
                    helpers.each(self.data.datasets, function(dataset) {
                        if (dataset.yAxisID === this.id) {
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
                        }
                    }, this);
                }
            };

            // Map of scale ID to scale object so we can lookup later 
            this.scales = {};

            // Build the x axis. The line chart only supports a single x axis
            var ScaleClass = Chart.scales.getScaleConstructor(this.options.scales.xAxes[0].scaleType);
            var xScale = new ScaleClass({
                ctx: this.chart.ctx,
                options: this.options.scales.xAxes[0],
                calculateRange: function() {
                    this.labels = self.data.labels;
                    this.min = 0;
                    this.max = this.labels.length;
                },
                id: this.options.scales.xAxes[0].id,
            });
            this.scales[xScale.id] = xScale;

            // Build up all the y scales
            helpers.each(this.options.scales.yAxes, function(yAxisOptions) {
                var ScaleClass = Chart.scales.getScaleConstructor(yAxisOptions.scaleType);
                var scale = new ScaleClass({
                    ctx: this.chart.ctx,
                    options: yAxisOptions,
                    calculateRange: calculateYRange,
                    getPointPixelForValue: function(value, index, datasetIndex) {
                        if (self.options.stacked) {
                            var offsetPos = 0;
                            var offsetNeg = 0;

                            for (var i = 0; i < datasetIndex; ++i) {
                                if (self.data.datasets[i].data[index] < 0) {
                                    offsetNeg += self.data.datasets[i].data[index];
                                } else {
                                    offsetPos += self.data.datasets[i].data[index];
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
                    id: yAxisOptions.id,
                });

                this.scales[scale.id] = scale;
            }, this);
        },
        draw: function(ease) {

            var easingDecimal = ease || 1;
            this.clear();

            // Draw all the scales
            helpers.each(this.scales, function(scale) {
                scale.draw(this.chartArea);
            }, this);

            // reverse for-loop for proper stacking
            for (var i = this.data.datasets.length - 1; i >= 0; i--) {

                var dataset = this.data.datasets[i];

                // Transition Point Locations
                helpers.each(dataset.metaData, function(point, index) {
                    point.transition(easingDecimal);
                }, this);

                // Transition and Draw the line
                dataset.metaDataset.transition(easingDecimal).draw();

                // Draw the points
                helpers.each(dataset.metaData, function(point) {
                    point.draw();
                });
            }

            // Finally draw the tooltip
            this.tooltip.transition(easingDecimal).draw();
        },
        events: function(e) {

            // If exiting chart
            if (e.type == 'mouseout') {
                return this;
            }

            this.lastActive = this.lastActive || [];

            // Find Active Elements
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
                        dataset = this.data.datasets[this.lastActive[0]._datasetIndex];
                        index = this.lastActive[0]._index;

                        this.lastActive[0]._model.radius = this.lastActive[0].custom && this.lastActive[0].custom.radius ? this.lastActive[0].custom.pointRadius : helpers.getValueAtIndexOrDefault(dataset.pointRadius, index, this.options.elements.point.radius);
                        this.lastActive[0]._model.backgroundColor = this.lastActive[0].custom && this.lastActive[0].custom.backgroundColor ? this.lastActive[0].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointBackgroundColor, index, this.options.elements.point.backgroundColor);
                        this.lastActive[0]._model.borderColor = this.lastActive[0].custom && this.lastActive[0].custom.borderColor ? this.lastActive[0].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.pointBorderColor, index, this.options.elements.point.borderColor);
                        this.lastActive[0]._model.borderWidth = this.lastActive[0].custom && this.lastActive[0].custom.borderWidth ? this.lastActive[0].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, this.options.elements.point.borderWidth);
                        break;
                    case 'label':
                        for (var i = 0; i < this.lastActive.length; i++) {
                            dataset = this.data.datasets[this.lastActive[i]._datasetIndex];
                            index = this.lastActive[i]._index;

                            this.lastActive[i]._model.radius = this.lastActive[i].custom && this.lastActive[i].custom.radius ? this.lastActive[i].custom.pointRadius : helpers.getValueAtIndexOrDefault(dataset.pointRadius, index, this.options.elements.point.radius);
                            this.lastActive[i]._model.backgroundColor = this.lastActive[i].custom && this.lastActive[i].custom.backgroundColor ? this.lastActive[i].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointBackgroundColor, index, this.options.elements.point.backgroundColor);
                            this.lastActive[i]._model.borderColor = this.lastActive[i].custom && this.lastActive[i].custom.borderColor ? this.lastActive[i].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.pointBorderColor, index, this.options.elements.point.borderColor);
                            this.lastActive[i]._model.borderWidth = this.lastActive[i].custom && this.lastActive[i].custom.borderWidth ? this.lastActive[i].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, this.options.elements.point.borderWidth);
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
                        dataset = this.data.datasets[this.active[0]._datasetIndex];
                        index = this.active[0]._index;

                        this.active[0]._model.radius = this.active[0].custom && this.active[0].custom.hoverRadius ? this.active[0].custom.hoverRadius : helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.active[0]._model.radius + 2);
                        this.active[0]._model.backgroundColor = this.active[0].custom && this.active[0].custom.hoverBackgroundColor ? this.active[0].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.color(this.active[0]._model.backgroundColor).saturate(0.5).darken(0.35).rgbString());
                        this.active[0]._model.borderColor = this.active[0].custom && this.active[0].custom.hoverBorderColor ? this.active[0].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.color(this.active[0]._model.borderColor).saturate(0.5).darken(0.35).rgbString());
                        this.active[0]._model.borderWidth = this.active[0].custom && this.active[0].custom.hoverBorderWidth ? this.active[0].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, this.active[0]._model.borderWidth + 2);
                        break;
                    case 'label':
                        for (var i = 0; i < this.active.length; i++) {
                            dataset = this.data.datasets[this.active[i]._datasetIndex];
                            index = this.active[i]._index;

                            this.active[i]._model.radius = this.active[i].custom && this.active[i].custom.hoverRadius ? this.active[i].custom.hoverRadius : helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.active[i]._model.radius + 2);
                            this.active[i]._model.backgroundColor = this.active[i].custom && this.active[i].custom.hoverBackgroundColor ? this.active[i].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.color(this.active[i]._model.backgroundColor).saturate(0.5).darken(0.35).rgbString());
                            this.active[i]._model.borderColor = this.active[i].custom && this.active[i].custom.hoverBorderColor ? this.active[i].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.color(this.active[i]._model.borderColor).saturate(0.5).darken(0.35).rgbString());
                            this.active[i]._model.borderWidth = this.active[i].custom && this.active[i].custom.hoverBorderWidth ? this.active[i].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, this.active[i]._model.borderWidth + 2);
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
