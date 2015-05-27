(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        //Cache a local reference to Chart.helpers
        helpers = Chart.helpers;

    var defaultConfig = {
        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,

        //String - The colour of each segment stroke
        segmentStrokeColor: "#fff",

        //Number - The width of each segment stroke
        borderWidth: 2,

        //The percentage of the chart that we cut out of the middle.
        cutoutPercentage: 50,

        // The duration of animations triggered by hover events
        hoverAnimationDuration: 400,

        //String - Animation easing effect
        animationEasing: "easeOutQuart",

        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate: true,

        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale: false,

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].backgroundColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

    };

    Chart.Type.extend({
        //Passing in a name registers this chart in the Chart namespace
        name: "Doughnut",
        //Providing a defaults will also register the deafults in the chart namespace
        defaults: defaultConfig,
        //Initialize is fired when the chart is initialized - Data is passed in as a parameter
        //Config is automatically merged by the core of Chart.js, and is available at this.options
        initialize: function() {
            // Slice Type and defaults
            this.Slice = Chart.Arc.extend({
                _chart: this.chart,
                x: this.chart.width / 2,
                y: this.chart.height / 2
            });

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.events, this.onHover);
            }

            // Create new slice for each piece of data
            this.data.metaData = [];
            helpers.each(this.data.data, function(slice, index) {
                var metaSlice = new this.Slice();
                if (typeof slice == 'number') {
                    helpers.extend(metaSlice, {
                        value: slice
                    });
                } else {
                    helpers.extend(metaSlice, slice);
                }
                helpers.extend(metaSlice, {
                    startAngle: Math.PI * 1.5,
                    circumference: (this.options.animateRotate) ? 0 : this.calculateCircumference(metaSlice.value),
                    outerRadius: (this.options.animateScale) ? 0 : this.outerRadius,
                    innerRadius: (this.options.animateScale) ? 0 : (this.outerRadius / 100) * this.options.percentageInnerCutout,
                });
                if (!metaSlice.backgroundColor) {
                    slice.backgroundColor = 'hsl(' + (360 * index / this.data.data.length) + ', 100%, 50%)';
                }
                metaSlice.save();
                this.data.metaData.push(metaSlice);
            }, this);

            // Create tooltip instance exclusively for this chart with some defaults.
            this.tooltip = new Chart.Tooltip({
                _chart: this.chart,
                _data: this.data,
                _options: this.options,
            }, this);

            this.update();
        },
        onHover: function(e) {

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
            if (this.active.length && this.options.hoverMode) {
                this.active[0].backgroundColor = this.data.data[this.active[0]._index].hoverBackgroundColor || helpers.color(this.data.data[this.active[0]._index].backgroundColor).saturate(0.5).darken(0.35).rgbString();
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
        getSliceAtEvent: function(e) {
            var elements = [];

            var location = helpers.getRelativePosition(e);

            helpers.each(this.data.metaData, function(slice, index) {
                if (slice.inRange(location.x, location.y)) elements.push(slice);
            }, this);
            return elements;
        },
        calculateCircumference: function(value) {
            if (this.total > 0) {
                return (Math.PI * 2) * (value / this.total);
            } else {
                return 0;
            }
        },
        update: function() {

            // Calc Total
            this.total = 0;
            helpers.each(this.data.data, function(slice) {
                this.total += Math.abs(slice.value);
            }, this);

            this.outerRadius = (helpers.min([this.chart.width, this.chart.height]) - this.options.borderWidth / 2) / 2;

            // Map new data to data points
            helpers.each(this.data.metaData, function(slice, index) {

                var datapoint = this.data.data[index];

                helpers.extend(slice, {
                    _index: index,
                    x: this.chart.width / 2,
                    y: this.chart.height / 2,
                    value: datapoint.value,
                    label: datapoint.label,
                    circumference: this.calculateCircumference(datapoint.value),
                    outerRadius: this.outerRadius,
                    innerRadius: (this.outerRadius / 100) * this.options.cutoutPercentage,

                    backgroundColor: datapoint.backgroundColor,
                    hoverBackgroundColor: datapoint.hoverBackgroundColor || datapoint.backgroundColor,
                    borderWidth: this.options.borderWidth,
                    borderColor: this.options.segmentStrokeColor,
                });

                helpers.extend(slice, {
                    endAngle: slice.startAngle + slice.circumference,
                });

                if (index === 0) {
                    slice.startAngle = Math.PI * 1.5;
                }

                //Check to see if it's the last slice, if not get the next and update its start angle
                if (index < this.data.data.length - 1) {
                    this.data.metaData[index + 1].startAngle = slice.endAngle;
                }

                slice.pivot();

            }, this);

            this.render();
        },
        draw: function(easeDecimal) {
            easeDecimal = easeDecimal || 1;
            this.clear();

            helpers.each(this.data.metaData, function(slice, index) {
                slice.transition(easeDecimal).draw();
            }, this);

            this.tooltip.transition(easeDecimal).draw();
        }
    });

    Chart.types.Doughnut.extend({
        name: "Pie",
        defaults: helpers.merge(defaultConfig, {
            cutoutPercentage: 0
        })
    });

}).call(this);
