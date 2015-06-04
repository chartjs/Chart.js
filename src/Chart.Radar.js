(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        helpers = Chart.helpers;



    Chart.Type.extend({
        name: "Radar",
        defaults: {

            scale: {
                scaleType: "radialLinear",
                display: true,

                //Boolean - Whether to animate scaling the chart from the centre
                animate: false,

                lineArc: false,

                // grid line settings
                gridLines: {
                    show: true,
                    color: "rgba(0, 0, 0, 0.05)",
                    lineWidth: 1,
                },

                angleLines: {
                    show: true,
                    color: "rgba(0,0,0,.1)",
                    lineWidth: 1
                },

                // scale numbers
                beginAtZero: true,

                // label settings
                labels: {
                    show: true,
                    template: "<%=value%>",
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
            },

            elements: {
                line: {
                    tension: 0, // no bezier in radar
                }
            },

            //String - A legend template
            legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

        },

        initialize: function() {
            // Events
            helpers.bindEvents(this, this.options.events, this.events);

            // Create a new line and its points for each dataset and piece of data
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {

                dataset.metaDataset = new Chart.Line({
                    _chart: this.chart,
                    _datasetIndex: datasetIndex,
                    _points: dataset.metaData,
                    _loop: true
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
            }, this);

            // Build the scale.
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
            return collection[index + 1] || collection[0];
        },
        previousPoint: function(collection, index) {
            return collection[index - 1] || collection[collection.length - 1];
        },
        resetElements: function() {

            // Update the points
            this.eachElement(function(point, index, dataset, datasetIndex) {
                helpers.extend(point, {
                    // Utility
                    _chart: this.chart,
                    _datasetIndex: datasetIndex,
                    _index: index,
                    _scale: this.scale,

                    // Desired view properties
                    _model: {
                        x: this.scale.xCenter,
                        y: this.scale.yCenter,

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

                point._model.controlPointPreviousX = this.scale.xCenter;
                point._model.controlPointPreviousY = this.scale.yCenter;
                point._model.controlPointNextX = this.scale.xCenter;
                point._model.controlPointNextY = this.scale.yCenter;

                // Now pivot the point for animation
                point.pivot();
            }, this);
        },
        update: function() {
            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // Update the lines
            this.eachDataset(function(dataset, datasetIndex) {
                helpers.extend(dataset.metaDataset, {
                    // Utility
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
                        scaleTop: this.scale.top,
                        scaleBottom: this.scale.bottom,
                        scaleZero: this.scale.getPointPosition(0),
                    },
                });

                dataset.metaDataset.pivot();
            });

            // Update the points
            this.eachElement(function(point, index, dataset, datasetIndex) {
                var pointPosition = this.scale.getPointPosition(index, this.scale.calculateCenterOffset(this.data.datasets[datasetIndex].data[index]));

                helpers.extend(point, {
                    // Utility
                    _chart: this.chart,
                    _datasetIndex: datasetIndex,
                    _index: index,

                    // Desired view properties
                    _model: {
                        x: pointPosition.x, // value not used in dataset scale, but we want a consistent API between scales
                        y: pointPosition.y,

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

            var ScaleConstructor = Chart.scales.getScaleConstructor(this.options.scale.scaleType);
            this.scale = new ScaleConstructor({
                options: this.options.scale,
                height: this.chart.height,
                width: this.chart.width,
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2,
                ctx: this.chart.ctx,
                labels: this.data.labels,
                valuesCount: this.data.datasets[0].data.length,
                calculateRange: function() {
                    this.min = null;
                    this.max = null;

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
            });

            this.scale.setScaleSize();
            this.scale.calculateRange();
            this.scale.generateTicks();
            this.scale.buildYLabels();
        },
        draw: function(ease) {
            var easingDecimal = ease || 1;
            this.clear();

            // Draw all the scales
            this.scale.draw(this.chartArea);

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
