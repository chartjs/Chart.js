(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        helpers = Chart.helpers;

    var defaultConfig = {
        hoverMode: 'single',
        scales: {
            xAxes: [{
                scaleType: "linear", // scatter should not use a dataset axis
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
                show: true,
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

        //Number - Tension of the bezier curve between points
        tension: 0.4,

        //Number - Radius of each point dot in pixels
        pointRadius: 4,

        //Number - Pixel width of point dot border
        pointBorderWidth: 1,

        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHoverRadius: 20,

        //Number - Pixel width of dataset border
        borderWidth: 2,

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].borderColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",

        tooltipTemplate: "(<%= dataX %>, <%= dataY %>)",
        multiTooltipTemplate: "<%if (datasetLabel){%><%=datasetLabel%>: <%}%>(<%= dataX %>, <%= dataY %>)",

    };


    Chart.Type.extend({
        name: "Scatter",
        defaults: defaultConfig,
        initialize: function() {
            //Custom Point Defaults
            this.PointClass = Chart.Point.extend({
                _chart: this.chart,
                offsetGridLines: this.options.offsetGridLines,
                borderWidth: this.options.pointBorderWidth,
                radius: this.options.pointRadius,
                hoverRadius: this.options.pointHoverRadius,
            });

            // Events
            helpers.bindEvents(this, this.options.events, this.events);

            // Build Scale
            this.buildScale();
			Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            //Create a new line and its points for each dataset and piece of data
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {
                dataset.metaDataset = new Chart.Line();
                dataset.metaData = [];
                helpers.each(dataset.data, function(dataPoint, index) {
                    dataset.metaData.push(new this.PointClass());
                }, this);

                // Make sure each dataset is bound to an x and a y axis
                if (!dataset.xAxisID) {
                    dataset.xAxisID = this.options.scales.xAxes[0].id;
                }

                if (!dataset.yAxisID) {
                    dataset.yAxisID = this.options.scales.yAxes[0].id;
                }
            }, this);

            // Set defaults for lines
            this.eachDataset(function(dataset, datasetIndex) {
                dataset = helpers.merge(this.options, dataset);
                helpers.extend(dataset.metaDataset, {
                    _points: dataset.metaData,
                    _datasetIndex: datasetIndex,
                    _chart: this.chart,
                });
                // Copy to view model
                dataset.metaDataset.save();
            }, this);

            // Set defaults for points
            this.eachElement(function(point, index, dataset, datasetIndex) {
                var xScale = this.scales[this.data.datasets[datasetIndex].xAxisID];

                helpers.extend(point, {
                    x: xScale.getPixelForValue(index),
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

            // Remove styling for last active (even if it may still be active)
            if (this.lastActive.length) {
                switch (this.options.hoverMode) {
                    case 'single':
                        this.lastActive[0].backgroundColor = this.data.datasets[this.lastActive[0]._datasetIndex].pointBackgroundColor;
                        this.lastActive[0].borderColor = this.data.datasets[this.lastActive[0]._datasetIndex].pointBorderColor;
                        this.lastActive[0].borderWidth = this.data.datasets[this.lastActive[0]._datasetIndex].pointBorderWidth;
                        break;
                    case 'label':
                        for (var i = 0; i < this.lastActive.length; i++) {
                            this.lastActive[i].backgroundColor = this.data.datasets[this.lastActive[i]._datasetIndex].pointBackgroundColor;
                            this.lastActive[i].borderColor = this.data.datasets[this.lastActive[i]._datasetIndex].pointBorderColor;
                            this.lastActive[i].borderWidth = this.data.datasets[this.lastActive[0]._datasetIndex].pointBorderWidth;
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
                        this.active[0].backgroundColor = this.data.datasets[this.active[0]._datasetIndex].hoverBackgroundColor || helpers.color(this.active[0].backgroundColor).saturate(0.5).darken(0.35).rgbString();
                        this.active[0].borderColor = this.data.datasets[this.active[0]._datasetIndex].hoverBorderColor || helpers.color(this.active[0].borderColor).saturate(0.5).darken(0.35).rgbString();
                        this.active[0].borderWidth = this.data.datasets[this.active[0]._datasetIndex].borderWidth + 10;
                        break;
                    case 'label':
                        for (var i = 0; i < this.active.length; i++) {
                            this.active[i].backgroundColor = this.data.datasets[this.active[i]._datasetIndex].hoverBackgroundColor || helpers.color(this.active[i].backgroundColor).saturate(0.5).darken(0.35).rgbString();
                            this.active[i].borderColor = this.data.datasets[this.active[i]._datasetIndex].hoverBorderColor || helpers.color(this.active[i].borderColor).saturate(0.5).darken(0.35).rgbString();
                            this.active[i].borderWidth = this.data.datasets[this.active[i]._datasetIndex].borderWidth + 2;
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
        update: function() {
			Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // Update the lines
            this.eachDataset(function(dataset, datasetIndex) {
                helpers.extend(dataset.metaDataset, {
                    backgroundColor: dataset.backgroundColor || this.options.backgroundColor,
                    borderWidth: dataset.borderWidth || this.options.borderWidth,
                    borderColor: dataset.borderColor || this.options.borderColor,
                    tension: dataset.tension || this.options.tension,
                    scaleTop: this.chartArea.top,
                    scaleBottom: this.chartArea.bottom,
                    _points: dataset.metaData,
                    _datasetIndex: datasetIndex,
                });
                dataset.metaDataset.pivot();
            });

            // Update the points
            this.eachElement(function(point, index, dataset, datasetIndex) {
                var xScale = this.scales[this.data.datasets[datasetIndex].xAxisID];
                var yScale = this.scales[this.data.datasets[datasetIndex].yAxisID];

                helpers.extend(point, {
                    x: xScale.getPixelForValue(this.data.datasets[datasetIndex].data[index].x),
                    y: yScale.getPixelForValue(this.data.datasets[datasetIndex].data[index].y),
                    dataX: this.data.datasets[datasetIndex].data[index].x,
                    dataY: this.data.datasets[datasetIndex].data[index].y,
                    label: '', // so that the multitooltip looks ok
                    value: this.data.datasets[datasetIndex].data[index].y, // for legacy reasons
                    datasetLabel: this.data.datasets[datasetIndex].label,
                    // Appearance
                    hoverBackgroundColor: this.data.datasets[datasetIndex].pointHoverBackgroundColor || this.options.pointHoverBackgroundColor,
                    hoverBorderColor: this.data.datasets[datasetIndex].pointHoverBorderColor || this.options.pointHoverBorderColor,
                    hoverRadius: this.data.datasets[datasetIndex].pointHoverRadius || this.options.pointHoverRadius,
                    radius: this.data.datasets[datasetIndex].pointRadius || this.options.pointRadius,
                    borderWidth: this.data.datasets[datasetIndex].pointBorderWidth || this.options.pointBorderWidth,
                    borderColor: this.data.datasets[datasetIndex].pointBorderColor || this.options.pointBorderColor,
                    backgroundColor: this.data.datasets[datasetIndex].pointBackgroundColor || this.options.pointBackgroundColor,
                    tension: this.data.datasets[datasetIndex].metaDataset.tension,
                    _datasetIndex: datasetIndex,
                    _index: index,
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

            var calculateXRange = function() {
                this.min = null;
                this.max = null;
                
                helpers.each(self.data.datasets, function(dataset) {
                    // Only set the scale range for datasets that actually use this axis
                    if (dataset.xAxisID === this.id) {
                        helpers.each(dataset.data, function(value) {
                            if (this.min === null) {
                                this.min = value.x;
                            } else if (value.x < this.min) {
                                this.min = value.x;
                            }
                            
                            if (this.max === null) {
                                this.max = value.x;
                            } else if (value.x > this.max) {
                                this.max = value.x;
                            }
                        }, this);
                    }
                }, this);
            };

            var calculateYRange = function() {
                this.min = null;
                this.max = null;
                
                helpers.each(self.data.datasets, function(dataset) {
                    if (dataset.yAxisID === this.id) {
                        helpers.each(dataset.data, function(value) {
                            if (this.min === null) {
                                this.min = value.y;
                            } else if (value.y < this.min) {
                                this.min = value.y;
                            }
                            
                            if (this.max === null) {
                                this.max = value.y;
                            } else if (value.y > this.max) {
                                this.max = value.y;
                            }
                        }, this);
                    }
                }, this);
            };

            // Map of scale ID to scale object so we can lookup later 
            this.scales = {};

            helpers.each(this.options.scales.xAxes, function(xAxisOptions) {
                var ScaleClass = Chart.scales.getScaleConstructor(xAxisOptions.scaleType);
                var scale = new ScaleClass({
                    ctx: this.chart.ctx,
                    options: xAxisOptions,
                    calculateRange: calculateXRange,
                    id: xAxisOptions.id,
                });

                this.scales[scale.id] = scale;
            }, this);

            helpers.each(this.options.scales.yAxes, function(yAxisOptions) {
                var ScaleClass = Chart.scales.getScaleConstructor(yAxisOptions.scaleType);
                var scale = new ScaleClass({
                    ctx: this.chart.ctx,
                    options: yAxisOptions,
                    calculateRange: calculateYRange,
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

            this.eachDataset(function(dataset, datasetIndex) {
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
            }, this);

            // Finally draw the tooltip
            this.tooltip.transition(easingDecimal).draw();
        }
    });


}).call(this);
