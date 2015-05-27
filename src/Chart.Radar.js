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

            line: {

                //Boolean - Whether to show a dot for each point
                show: true,

                //Number - Pixel width of dot border
                borderWidth: 1,

                backgroundColor: Chart.defaults.global.defaultColor,

                borderColor: Chart.defaults.global.defaultColor,

                //Number - amount extra to add to the radius to cater for hit detection outside the drawn 
                hitRadius: 20,

                //Number - Tension of the bezier curve between points. Use 0 to turn off bezier tension
                tension: 0.4,
            },

            point: {
                //Boolean - Whether to show a dot for each point
                show: true,

                //Number - Radius of each dot in pixels
                radius: 3,

                //Number - Pixel width of dot border
                borderWidth: 1,

                //Number - Pixel width of on hover
                hoverRadius: 5,

                //Number - Pixel width of dot border on hover
                hoverBorderWidth: 2,

                backgroundColor: Chart.defaults.global.defaultColor,

                borderColor: Chart.defaults.global.defaultColor,

                //Number - amount extra to add to the radius to cater for hit detection outside the drawn 
                hitRadius: 20,
            },

            //String - A legend template
            legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

        },

        initialize: function() {

            this.buildScale(this.data);



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
            }, this);

            // Build and fit the scale. Needs to happen after the axis IDs have been set
            this.buildScale();
            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // Set defaults for lines
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {
                helpers.extend(dataset.metaDataset, {
                    _points: dataset.metaData,
                    _datasetIndex: datasetIndex,
                    _chart: this.chart,
                    loop: true
                });
                // Fill in dataset defaults from options
                helpers.extend(dataset, helpers.merge(this.options, dataset));
                // Copy to view modele
                dataset.metaDataset.save();
            }, this);

            // Set defaults for points
            this.eachElement(function(point, index, dataset, datasetIndex) {

                helpers.extend(point, {
                    _datasetIndex: datasetIndex,
                    _index: index,
                    _chart: this.chart,
                    display: this.options.pointDot,
                    x: this.scale.xCenter,
                    y: this.scale.yCenter,
                });

                // Default bezier control points
                helpers.extend(point, {
                    controlPointPreviousX: this.scale.xCenter,
                    controlPointPreviousY: this.scale.yCenter,
                    controlPointNextX: this.scale.xCenter,
                    controlPointNextY: this.scale.yCenter,
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

        /*getPointsAtEvent: function(evt) {
            var mousePosition = helpers.getRelativePosition(evt),
                fromCenter = helpers.getAngleFromPoint({
                    x: this.scale.xCenter,
                    y: this.scale.yCenter
                }, mousePosition);

            var anglePerIndex = (Math.PI * 2) / this.scale.valuesCount,
                pointIndex = Math.round((fromCenter.angle - Math.PI * 1.5) / anglePerIndex),
                activePointsCollection = [];

            // If we're at the top, make the pointIndex 0 to get the first of the array.
            if (pointIndex >= this.scale.valuesCount || pointIndex < 0) {
                pointIndex = 0;
            }

            if (fromCenter.distance <= this.scale.drawingArea) {
                helpers.each(this.data.datasets, function(dataset) {
                    activePointsCollection.push(dataset.points[pointIndex]);
                });
            }

            return activePointsCollection;
        },*/
        nextPoint: function(collection, index) {
            return collection[index - 1] || collection[collection.length - 1];
        },
        previousPoint: function(collection, index) {
            return collection[index + 1] || collection[0];
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
        update: function() {

            // Update the lines
            this.eachDataset(function(dataset, datasetIndex) {

                helpers.extend(dataset.metaDataset, {
                    // Utility
                    _datasetIndex: datasetIndex,

                    // Data
                    _points: dataset.metaData,

                    // Geometry
                    scaleTop: this.scale.top,
                    scaleBottom: this.scale.bottom,
                    scaleZero: this.scale.getPointPosition(0),

                    // Appearance
                    tension: dataset.tension || this.options.line.tension,
                    backgroundColor: dataset.backgroundColor || this.options.backgroundColor,
                    borderWidth: dataset.borderWidth || this.options.borderWidth,
                    borderColor: dataset.borderColor || this.options.borderColor,
                });
                dataset.metaDataset.pivot();
            }, this);

            // Update the points
            this.eachElement(function(point, index, dataset, datasetIndex) {

                var pointPosition = this.scale.getPointPosition(index, this.scale.calculateCenterOffset(this.data.datasets[datasetIndex].data[index]));

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
                    x: pointPosition.x,
                    y: pointPosition.y,
                    tension: this.data.datasets[datasetIndex].metaDataset.tension,

                    // Appearnce
                    radius: this.data.datasets[datasetIndex].pointRadius || this.options.point.radius,
                    backgroundColor: this.data.datasets[datasetIndex].pointBackgroundColor || this.options.point.backgroundColor,
                    borderWidth: this.data.datasets[datasetIndex].pointBorderWidth || this.options.pointsborderWidth,

                    // Tooltip
                    hoverRadius: this.data.datasets[datasetIndex].pointHitRadius || this.options.point.hitRadius,
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
        draw: function(ease) {

            var easingDecimal = ease || 1;
            this.clear();


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

            // Draw all the scales
            this.scale.draw(this.chartArea);

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
                switch (this.options.hover.mode) {
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
            if (this.active.length && this.options.hover.mode) {
                switch (this.options.hover.mode) {
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
            if (this.options.tooltips.enabled) {

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
