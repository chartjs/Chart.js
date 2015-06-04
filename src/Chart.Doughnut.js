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

        hover: {
            mode: 'single'
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

            this.resetElements();

            // Update the chart with the latest data.
            this.update();

        },

        calculateCircumference: function(dataset, value) {
            if (dataset.total > 0) {
                return (Math.PI * 2) * (value / dataset.total);
            } else {
                return 0;
            }
        },
        resetElements: function() {
            this.outerRadius = (helpers.min([this.chart.width, this.chart.height]) - this.options.elements.slice.borderWidth / 2) / 2;
            this.innerRadius = this.options.cutoutPercentage ? (this.outerRadius / 100) * (this.options.cutoutPercentage) : 1;
            this.radiusLength = (this.outerRadius - this.innerRadius) / this.data.datasets.length;

            // Update the points
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {
                // So that calculateCircumference works
                dataset.total = 0;
                helpers.each(dataset.data, function(value) {
                    dataset.total += Math.abs(value);
                }, this);

                dataset.outerRadius = this.outerRadius - (this.radiusLength * datasetIndex);
                dataset.innerRadius = dataset.outerRadius - this.radiusLength;

                helpers.each(dataset.metaData, function(slice, index) {
                    helpers.extend(slice, {
                        _model: {
                            x: this.chart.width / 2,
                            y: this.chart.height / 2,
                            startAngle: Math.PI * -0.5, // use - PI / 2 instead of 3PI / 2 to make animations better. It means that we never deal with overflow during the transition function
                            circumference: (this.options.animation.animateRotate) ? 0 : this.calculateCircumference(metaSlice.value),
                            outerRadius: (this.options.animation.animateScale) ? 0 : dataset.outerRadius,
                            innerRadius: (this.options.animation.animateScale) ? 0 : dataset.innerRadius,

                            backgroundColor: slice.custom && slice.custom.backgroundColor ? slice.custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.options.elements.slice.backgroundColor),
                            hoverBackgroundColor: slice.custom && slice.custom.hoverBackgroundColor ? slice.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, this.options.elements.slice.hoverBackgroundColor),
                            borderWidth: slice.custom && slice.custom.borderWidth ? slice.custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.options.elements.slice.borderWidth),
                            borderColor: slice.custom && slice.custom.borderColor ? slice.custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.options.elements.slice.borderColor),

                            label: helpers.getValueAtIndexOrDefault(dataset.label, index, this.data.labels[index])
                        },
                    });

                    slice.pivot();
                }, this);

            }, this);
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
                        slice._model.startAngle = Math.PI * -0.5; // use - PI / 2 instead of 3PI / 2 to make animations better. It means that we never deal with overflow during the transition function
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

                        this.active[0]._model.radius = this.active[0].custom && this.active[0].custom.hoverRadius ? this.active[0].custom.hoverRadius : helpers.getValueAtIndexOrDefault(dataset.hoverRadius, index, this.active[0]._model.radius + 2);
                        this.active[0]._model.backgroundColor = this.active[0].custom && this.active[0].custom.hoverBackgroundColor ? this.active[0].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(this.active[0]._model.backgroundColor).saturate(0.5).darken(0.35).rgbString());
                        this.active[0]._model.borderColor = this.active[0].custom && this.active[0].custom.hoverBorderColor ? this.active[0].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, this.active[0]._model.borderColor);
                        this.active[0]._model.borderWidth = this.active[0].custom && this.active[0].custom.hoverBorderWidth ? this.active[0].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.hoverBorderWidth, index, this.active[0]._model.borderWidth);
                        break;
                    case 'label':
                        for (var i = 0; i < this.active.length; i++) {
                            dataset = this.data.datasets[this.active[i]._datasetIndex];
                            index = this.active[i]._index;

                            this.active[i]._model.radius = this.active[i].custom && this.active[i].custom.hoverRadius ? this.active[i].custom.hoverRadius : helpers.getValueAtIndexOrDefault(dataset.hoverRadius, index, this.active[i]._model.radius + 2);
                            this.active[i]._model.backgroundColor = this.active[i].custom && this.active[i].custom.hoverBackgroundColor ? this.active[i].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(this.active[i]._model.backgroundColor).saturate(0.5).darken(0.35).rgbString());
                            this.active[i]._model.borderColor = this.active[i].custom && this.active[i].custom.hoverBorderColor ? this.active[i].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, this.active[0]._model.borderColor);
                            this.active[i]._model.borderWidth = this.active[i].custom && this.active[i].custom.hoverBorderWidth ? this.active[i].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.hoverBorderWidth, index, this.active[i]._model.borderWidth);
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

    Chart.types.Doughnut.extend({
        name: "Pie",
        defaults: helpers.merge(defaultConfig, {
            cutoutPercentage: 0
        })
    });

}).call(this);
