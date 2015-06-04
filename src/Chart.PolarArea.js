(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        //Cache a local reference to Chart.helpers
        helpers = Chart.helpers;

    var defaultConfig = {

        scale: {
            scaleType: "radialLinear",
            display: true,

            //Boolean - Whether to animate scaling the chart from the centre
            animate: false,

            lineArc: true,

            // grid line settings
            gridLines: {
                show: true,
                color: "rgba(0, 0, 0, 0.05)",
                lineWidth: 1,
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
            }
        },

        //Boolean - Whether to animate the rotation of the chart
        animateRotate: true,
    };


    Chart.Type.extend({
        //Passing in a name registers this chart in the Chart namespace
        name: "PolarArea",
        //Providing a defaults will also register the deafults in the chart namespace
        defaults: defaultConfig,
        //Initialize is fired when the chart is initialized - Data is passed in as a parameter
        //Config is automatically merged by the core of Chart.js, and is available at this.options
        initialize: function() {

            // Scale setup
            var self = this;
            var ScaleClass = Chart.scales.getScaleConstructor(this.options.scale.scaleType);
            this.scale = new ScaleClass({
                options: this.options.scale,
                lineArc: true,
                width: this.chart.width,
                height: this.chart.height,
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2,
                ctx: this.chart.ctx,
                valuesCount: this.data.length,
                calculateRange: function() {
                    this.min = null;
                    this.max = null;

                    helpers.each(self.data.datasets[0].data, function(value) {
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
            });

            helpers.bindEvents(this, this.options.events, this.events);

            //Set up tooltip events on the chart
            helpers.bindEvents(this, this.options.events, this.events);

            //Create a new bar for each piece of data
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {
                dataset.metaData = [];
                helpers.each(dataset.data, function(dataPoint, index) {
                    dataset.metaData.push(new Chart.Arc({
                        _chart: this.chart,
                        _datasetIndex: datasetIndex,
                        _index: index,
                        _model: {}
                    }));
                }, this);
            }, this);

            // Create tooltip instance exclusively for this chart with some defaults.
            this.tooltip = new Chart.Tooltip({
                _chart: this.chart,
                _data: this.data,
                _options: this.options,
            }, this);

            // Fit the scale before we animate
            this.updateScaleRange();
            this.scale.calculateRange();
            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // so that we animate nicely
            this.resetElements();

            // Update the chart with the latest data.
            this.update();

        },
        updateScaleRange: function() {
            helpers.extend(this.scale, {
                size: helpers.min([this.chart.width, this.chart.height]),
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2
            });
        },
        resetElements: function() {
            var circumference = 1 / this.data.datasets[0].data.length * 2;

            // Map new data to data points
            helpers.each(this.data.datasets[0].metaData, function(slice, index) {

                var value = this.data.datasets[0].data[index];

                var startAngle = Math.PI * 1.5 + (Math.PI * circumference) * index;
                var endAngle = startAngle + (circumference * Math.PI);

                helpers.extend(slice, {
                    _index: index,
                    _model: {
                        x: this.chart.width / 2,
                        y: this.chart.height / 2,
                        innerRadius: 0,
                        outerRadius: 0,
                        startAngle: Math.PI * 1.5,
                        endAngle: Math.PI * 1.5,

                        backgroundColor: slice.custom && slice.custom.backgroundColor ? slice.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.data.datasets[0].backgroundColor, index, this.options.elements.slice.backgroundColor),
                        hoverBackgroundColor: slice.custom && slice.custom.hoverBackgroundColor ? slice.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(this.data.datasets[0].hoverBackgroundColor, index, this.options.elements.slice.hoverBackgroundColor),
                        borderWidth: slice.custom && slice.custom.borderWidth ? slice.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.data.datasets[0].borderWidth, index, this.options.elements.slice.borderWidth),
                        borderColor: slice.custom && slice.custom.borderColor ? slice.custom.borderColor : helpers.getValueAtIndexOrDefault(this.data.datasets[0].borderColor, index, this.options.elements.slice.borderColor),

                        label: helpers.getValueAtIndexOrDefault(this.data.datasets[0].labels, index, this.data.datasets[0].labels[index])
                    },
                });

                slice.pivot();
            }, this);
        },
        update: function() {

            this.updateScaleRange();
            this.scale.calculateRange();
            this.scale.generateTicks();
            this.scale.buildYLabels();

            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            var circumference = 1 / this.data.datasets[0].data.length * 2;

            // Map new data to data points
            helpers.each(this.data.datasets[0].metaData, function(slice, index) {

                var value = this.data.datasets[0].data[index];

                var startAngle = Math.PI * 1.5 + (Math.PI * circumference) * index;
                var endAngle = startAngle + (circumference * Math.PI);

                helpers.extend(slice, {
                    _index: index,
                    _model: {
                        x: this.chart.width / 2,
                        y: this.chart.height / 2,
                        innerRadius: 0,
                        outerRadius: this.scale.calculateCenterOffset(value),
                        startAngle: startAngle,
                        endAngle: endAngle,

                        backgroundColor: slice.custom && slice.custom.backgroundColor ? slice.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.data.datasets[0].backgroundColor, index, this.options.elements.slice.backgroundColor),
                        hoverBackgroundColor: slice.custom && slice.custom.hoverBackgroundColor ? slice.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(this.data.datasets[0].hoverBackgroundColor, index, this.options.elements.slice.hoverBackgroundColor),
                        borderWidth: slice.custom && slice.custom.borderWidth ? slice.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.data.datasets[0].borderWidth, index, this.options.elements.slice.borderWidth),
                        borderColor: slice.custom && slice.custom.borderColor ? slice.custom.borderColor : helpers.getValueAtIndexOrDefault(this.data.datasets[0].borderColor, index, this.options.elements.slice.borderColor),

                        label: helpers.getValueAtIndexOrDefault(this.data.datasets[0].labels, index, this.data.datasets[0].labels[index])
                    },
                });
                slice.pivot();

                console.log(slice);

            }, this);

            this.render();
        },
        draw: function(ease) {
            var easingDecimal = ease || 1;

            this.clear();

            helpers.each(this.data.datasets[0].metaData, function(slice, index) {
                slice.transition(easingDecimal).draw();
            }, this);

            this.scale.draw();

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
                        return this.getSliceAtEvent(e);
                    case 'label':
                        return this.getSlicesAtEvent(e);
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

                        this.lastActive[0]._model.backgroundColor = this.lastActive[0].custom && this.lastActive[0].custom.backgroundColor ? this.lastActive[0].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.options.elements.slice.backgroundColor);
                        this.lastActive[0]._model.borderColor = this.lastActive[0].custom && this.lastActive[0].custom.borderColor ? this.lastActive[0].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.options.elements.slice.borderColor);
                        this.lastActive[0]._model.borderWidth = this.lastActive[0].custom && this.lastActive[0].custom.borderWidth ? this.lastActive[0].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.options.elements.slice.borderWidth);
                        break;
                    case 'label':
                        for (var i = 0; i < this.lastActive.length; i++) {
                            dataset = this.data.datasets[this.lastActive[i]._datasetIndex];
                            index = this.lastActive[i]._index;

                            this.lastActive[i]._model.backgroundColor = this.lastActive[i].custom && this.lastActive[i].custom.backgroundColor ? this.lastActive[i].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.options.elements.slice.backgroundColor);
                            this.lastActive[i]._model.borderColor = this.lastActive[i].custom && this.lastActive[i].custom.borderColor ? this.lastActive[i].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.options.elements.slice.borderColor);
                            this.lastActive[i]._model.borderWidth = this.lastActive[i].custom && this.lastActive[i].custom.borderWidth ? this.lastActive[i].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.options.elements.slice.borderWidth);
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
        getSliceAtEvent: function(e) {
            var elements = [];

            var location = helpers.getRelativePosition(e);

            this.eachElement(function(slice, index) {
                if (slice.inRange(location.x, location.y)) {
                    elements.push(slice);
                }
            }, this);
            return elements;
        },
        /*getSlicesAtEvent: function(e) {
            var elements = [];

            var location = helpers.getRelativePosition(e);

            this.eachElement(function(slice, index) {
                if (slice.inGroupRange(location.x, location.y)) {
                    elements.push(slice);
                }
            }, this);
            return elements;
        },*/
    });

}).call(this);
