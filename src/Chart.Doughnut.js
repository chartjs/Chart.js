(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        //Cache a local reference to Chart.helpers
        helpers = Chart.helpers;

    var defaultConfig = {

        animation: {
            //Boolean - Whether we animate the rotation of the Doughnut
            animateRotate: true,

            //Boolean - Whether we animate scaling the Doughnut from the centre
            animateScale: false,
        },

        //The percentage of the chart that we cut out of the middle.

        cutoutPercentage: 50,

    };

    Chart.Type.extend({
        //Passing in a name registers this chart in the Chart namespace
        name: "Doughnut",
        //Providing a defaults will also register the deafults in the chart namespace
        defaults: defaultConfig,
        //Initialize is fired when the chart is initialized - Data is passed in as a parameter
        //Config is automatically merged by the core of Chart.js, and is available at this.options
        initialize: function() {

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

            // Update the chart with the latest data.
            this.update();

        },
        getSliceAtEvent: function(e) {
            var elements = [];

            var location = helpers.getRelativePosition(e);

            helpers.each(this.data.metaData, function(slice, index) {
                if (slice.inRange(location.x, location.y)) elements.push(slice);
            }, this);
            return elements;
        },
        calculateCircumference: function(dataset, value) {
            if (dataset.total > 0) {
                return (Math.PI * 2) * (value / dataset.total);
            } else {
                return 0;
            }
        },
        update: function() {

            this.outerRadius = (helpers.min([this.chart.width, this.chart.height]) - this.options.elements.slice.borderWidth / 2) / 2;
            this.innerRadius = this.options.cutoutPercentage ? (this.outerRadius / 100) * (this.options.cutoutPercentage) : 1;
            this.radiusLength = (this.outerRadius - this.innerRadius) / this.data.datasets.length;


            // Update the points
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {

                dataset.total = 0;
                helpers.each(dataset.data, function(value) {
                    dataset.total += Math.abs(value);
                }, this);


                dataset.outerRadius = this.outerRadius - (this.radiusLength * datasetIndex);

                dataset.innerRadius = dataset.outerRadius - this.radiusLength;

                helpers.each(dataset.metaData, function(slice, index) {

                    helpers.extend(slice, {
                        // Utility
                        _chart: this.chart,
                        _datasetIndex: datasetIndex,
                        _index: index,

                        // Desired view properties
                        _model: {
                            x: this.chart.width / 2,
                            y: this.chart.height / 2,
                            circumference: this.calculateCircumference(dataset, dataset.data[index]),
                            outerRadius: dataset.outerRadius,
                            innerRadius: dataset.innerRadius,

                            backgroundColor: slice.custom && slice.custom.backgroundColor ? slice.custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.options.elements.slice.backgroundColor),
                            hoverBackgroundColor: slice.custom && slice.custom.hoverBackgroundColor ? slice.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, this.options.elements.slice.hoverBackgroundColor),
                            borderWidth: slice.custom && slice.custom.borderWidth ? slice.custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.options.elements.slice.borderWidth),
                            borderColor: slice.custom && slice.custom.borderColor ? slice.custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.options.elements.slice.borderColor),

                            label: helpers.getValueAtIndexOrDefault(dataset.label, index, this.data.labels[index])
                        },
                    });

                    if (index === 0) {
                        slice._model.startAngle = Math.PI * 1.5;
                    } else {
                        slice._model.startAngle = dataset.metaData[index - 1]._model.endAngle;
                    }

                    slice._model.endAngle = slice._model.startAngle + slice._model.circumference;


                    //Check to see if it's the last slice, if not get the next and update its start angle
                    if (index < dataset.data.length - 1) {
                        dataset.metaData[index + 1]._model.startAngle = slice._model.endAngle;
                    }

                    slice.pivot();
                }, this);

            }, this);

            this.render();
        },
        draw: function(easeDecimal) {
            easeDecimal = easeDecimal || 1;
            this.clear();

            this.eachElement(function(slice) {
                slice.transition(easeDecimal).draw();
            }, this);

            this.tooltip.transition(easeDecimal).draw();
        },
        events: function(e) {

            // If exiting chart
            if (e.type == 'mouseout') {
                return this;
            }

            this.lastActive = this.lastActive || [];

            // Find Active Elements
            this.active = this.getSliceAtEvent(e);

            // On Hover hook
            if (this.options.onHover) {
                this.options.onHover.call(this, this.active);
            }

            // Remove styling for last active (even if it may still be active)
            if (this.lastActive.length) {
                this.lastActive[0].backgroundColor = this.data.data[this.lastActive[0]._index].backgroundColor;
            }

            // Built in hover styling
            if (this.active.length && this.options.hover.mode) {
                this.active[0].backgroundColor = this.data.data[this.active[0]._index].hoverBackgroundColor || helpers.color(this.data.data[this.active[0]._index].backgroundColor).saturate(0.5).darken(0.35).rgbString();
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
                    this.render(this.options.hover.animationDuration);
                }
            }

            // Remember Last Active
            this.lastActive = this.active;
            return this;

        },
    });

    Chart.types.Doughnut.extend({
        name: "Pie",
        defaults: helpers.merge(defaultConfig, {
            cutoutPercentage: 0
        })
    });

}).call(this);
