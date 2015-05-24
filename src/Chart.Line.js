(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        helpers = Chart.helpers;

    var defaultConfig = {

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

                // scale numbers
                beginAtZero: false,
                integersOnly: false,
                override: null,

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
                integersOnly: false,
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

        //Boolean - Whether to stack the lines essentially creating a stacked area chart.
        stacked: false,

        //Number - Tension of the bezier curve between points
        tension: 0.4,

        //Number - Radius of each point dot in pixels
        pointRadius: 3,
        //Number - Pixel width of point dot border
        pointBorderWidth: 1,
        //Number - Pixel width of point on hover
        pointHoverRadius: 5,
        //Number - Pixel width of point dot border on hover
        pointHoverBorderWidth: 2,
        pointBackgroundColor: Chart.defaults.global.defaultColor,
        pointBorderColor: Chart.defaults.global.defaultColor,

        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHitRadius: 6,

        //Number - Pixel width of dataset border
        borderWidth: 2,
        //Number - Pixel width of dataset border on hover
        hoverBorderWidth: 2,

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].borderColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
    };


    Chart.Type.extend({
        name: "Line",
        defaults: defaultConfig,
        initialize: function() {

            // Events
            helpers.bindEvents(this, this.options.events, this.events);

            var _this = this;

            //Create a new line and its points for each dataset and piece of data
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {
                dataset.metaDataset = new Chart.Line();
                dataset.metaData = [];
                helpers.each(dataset.data, function(dataPoint, index) {
                    dataset.metaData.push(new Chart.Point());
                }, this);

                // The line chart only supports a single x axis because the x axis is always a dataset axis
                dataset.xAxisID = this.options.scales.xAxes[0].id;

                if (!dataset.yAxisID) {
                    dataset.yAxisID = this.options.scales.yAxes[0].id;
                }
            }, this);

            // Build and fit the scale. Needs to happen after the axis IDs have been set
            this.buildScale();
            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // Set defaults for lines
            this.eachDataset(function(dataset, datasetIndex) {
                helpers.extend(dataset.metaDataset, {
                    _points: dataset.metaData,
                    _datasetIndex: datasetIndex,
                    _chart: this.chart,
                });
                // Fill in dataset defaults from options
                helpers.extend(dataset, helpers.merge(this.options, dataset));
                // Copy to view modele
                dataset.metaDataset.save();
            }, this);

            // Set defaults for points
            this.eachElement(function(point, index, dataset, datasetIndex) {
                var xScale = this.scales[this.data.datasets[datasetIndex].xAxisID];

                helpers.extend(point, {
                    x: xScale.getPixelForValue(null, index, true),
                    y: this.chartArea.bottom,
                    _datasetIndex: datasetIndex,
                    _index: index,
                    _chart: this.chart
                });

                // Default bezier control points
                helpers.extend(point, {
                    controlPointPreviousX: this.previousPoint(dataset, index).x,
                    controlPointPreviousY: this.nextPoint(dataset, index).y,
                    controlPointNextX: this.previousPoint(dataset, index).x,
                    controlPointNextY: this.nextPoint(dataset, index).y,
                });
                // Copy to view model
                point.save();
            }, this);

            // Create tooltip instance exclusively for this chart with some defaults.
            this.tooltip = new Chart.Tooltip({
                _chart: this.chart,
                _data: this.data,
                _options: this.options,
            }, this);

            this.update();
        },
        nextPoint: function(collection, index) {
            return collection[index - 1] || collection[index];
        },
        previousPoint: function(collection, index) {
            return collection[index + 1] || collection[index];
        },
        update: function() {
            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // Update the lines
            this.eachDataset(function(dataset, datasetIndex) {
                var yScale = this.scales[dataset.yAxisID];

                helpers.extend(dataset.metaDataset, {
                    // Utility
                    _datasetIndex: datasetIndex,
                    
                    // Data
                    _points: dataset.metaData,
                    
                    // Geometry
                    scaleTop: yScale.top,
                    scaleBottom: yScale.bottom,
                    scaleZero: yScale.getPixelForValue(0),
                    
                    // Appearance
                    tension: dataset.tension || this.options.tension,
                    backgroundColor: dataset.backgroundColor || this.options.backgroundColor,
                    borderWidth: dataset.borderWidth || this.options.borderWidth,
                    borderColor: dataset.borderColor || this.options.borderColor,
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
                    _datasetIndex: datasetIndex,
                    _index: index,
                    
                    // Data
                    label: this.data.labels[index],
                    value: this.data.datasets[datasetIndex].data[index],
                    datasetLabel: this.data.datasets[datasetIndex].label,
                    
                    // Geometry
                    offsetGridLines: this.options.offsetGridLines,
                    x: xScale.getPixelForValue(null, index, true), // value not used in dataset scale, but we want a consistent API between scales
                    y: yScale.getPointPixelForValue(this.data.datasets[datasetIndex].data[index], index, datasetIndex),
                    tension: this.data.datasets[datasetIndex].metaDataset.tension,
                    
                    // Appearnce
                    radius: this.data.datasets[datasetIndex].pointRadius || this.options.pointRadius,
                    backgroundColor: this.data.datasets[datasetIndex].pointBackgroundColor || this.options.pointBackgroundColor,
                    borderWidth: this.data.datasets[datasetIndex].pointBorderWidth || this.options.pointBorderWidth,
                    
                    // Tooltip
                    hoverRadius: this.data.datasets[datasetIndex].pointHitRadius || this.options.pointHitRadius,
                });
            }, this);

            // Update control points for the bezier curve
            this.eachElement(function(point, index, dataset, datasetIndex) {
                var controlPoints = helpers.splineCurve(
                    this.previousPoint(dataset, index),
                    point,
                    this.nextPoint(dataset, index),
                    point.tension
                );

                point.controlPointPreviousX = controlPoints.previous.x;
                point.controlPointNextX = controlPoints.next.x;

                // Prevent the bezier going outside of the bounds of the graph

                // Cap puter bezier handles to the upper/lower scale bounds
                if (controlPoints.next.y > this.chartArea.bottom) {
                    point.controlPointNextY = this.chartArea.bottom;
                } else if (controlPoints.next.y < this.chartArea.top) {
                    point.controlPointNextY = this.chartArea.top;
                } else {
                    point.controlPointNextY = controlPoints.next.y;
                }

                // Cap inner bezier handles to the upper/lower scale bounds
                if (controlPoints.previous.y > this.chartArea.bottom) {
                    point.controlPointPreviousY = this.chartArea.bottom;
                } else if (controlPoints.previous.y < this.chartArea.top) {
                    point.controlPointPreviousY = this.chartArea.top;
                } else {
                    point.controlPointPreviousY = controlPoints.previous.y;
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
        redraw: function() {

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
                var datasetIndex = i;

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
                switch (this.options.hoverMode) {
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
            if (this.options.onHover) {
                this.options.onHover.call(this, this.active);
            }

            if (e.type == 'mouseup' || e.type == 'click') {
                if (this.options.onClick) {
                    this.options.onClick.call(this, e, this.active);
                }
            }

            var dataset;
            // Remove styling for last active (even if it may still be active)
            if (this.lastActive.length) {
                switch (this.options.hoverMode) {
                    case 'single':
                        dataset = this.data.datasets[this.lastActive[0]._datasetIndex];

                        this.lastActive[0].radius = dataset.pointRadius;
                        this.lastActive[0].backgroundColor = dataset.pointBackgroundColor;
                        this.lastActive[0].borderColor = dataset.pointBorderColor;
                        this.lastActive[0].borderWidth = dataset.pointBorderWidth;
                        break;
                    case 'label':
                        for (var i = 0; i < this.lastActive.length; i++) {
                            dataset = this.data.datasets[this.lastActive[i]._datasetIndex];

                            this.lastActive[i].radius = dataset.pointRadius;
                            this.lastActive[i].backgroundColor = dataset.pointBackgroundColor;
                            this.lastActive[i].borderColor = dataset.pointBorderColor;
                            this.lastActive[i].borderWidth = dataset.pointBorderWidth;
                        }
                        break;
                    case 'dataset':
                        break;
                    default:
                        // Don't change anything
                }
            }

            // Built in hover styling
            if (this.active.length && this.options.hoverMode) {
                switch (this.options.hoverMode) {
                    case 'single':
                        dataset = this.data.datasets[this.active[0]._datasetIndex];

                        this.active[0].radius = dataset.pointHoverRadius || dataset.pointRadius + 2;
                        this.active[0].backgroundColor = dataset.pointHoverBackgroundColor || helpers.color(dataset.pointBackgroundColor).saturate(0.5).darken(0.35).rgbString();
                        this.active[0].borderColor = dataset.pointHoverBorderColor || helpers.color(dataset.pointBorderColor).saturate(0.5).darken(0.35).rgbString();
                        this.active[0].borderWidth = dataset.pointHoverBorderWidth || dataset.pointBorderWidth + 2;
                        break;
                    case 'label':
                        for (var i = 0; i < this.active.length; i++) {
                            dataset = this.data.datasets[this.active[i]._datasetIndex];

                            this.active[i].radius = dataset.pointHoverRadius || dataset.pointRadius + 2;
                            this.active[i].backgroundColor = dataset.pointHoverBackgroundColor || helpers.color(dataset.pointBackgroundColor).saturate(0.5).darken(0.35).rgbString();
                            this.active[i].borderColor = dataset.pointHoverBorderColor || helpers.color(dataset.pointBorderColor).saturate(0.5).darken(0.35).rgbString();
                            this.active[i].borderWidth = dataset.pointHoverBorderWidth || dataset.pointBorderWidth + 2;
                        }
                        break;
                    case 'dataset':
                        break;
                    default:
                        // Don't change anything
                }
            }


            // Built in Tooltips
            if (this.options.showTooltips) {

                // The usual updates
                this.tooltip.initialize();

                // Active
                if (this.active.length) {
                    helpers.extend(this.tooltip, {
                        opacity: 1,
                        _active: this.active,
                    });

                    this.tooltip.update();
                } else {
                    // Inactive
                    helpers.extend(this.tooltip, {
                        opacity: 0,
                    });
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
                    this.render(this.options.hoverAnimationDuration);
                }
            }

            // Remember Last Active
            this.lastActive = this.active;
            return this;
        },
    });


}).call(this);
