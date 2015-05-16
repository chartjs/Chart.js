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
        segmentStrokeWidth: 2,

        //The percentage of the chart that we cut out of the middle.
        percentageInnerCutout: 50,

        //Number - Amount of animation steps
        animationSteps: 100,

        //String - Animation easing effect
        animationEasing: "easeOutBounce",

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
        initialize: function(data) {

            // Save data as a source for updating of values & methods
            this.data = data;

            // Slice Type and defaults
            this.Slice = Chart.Arc.extend({
                _chart: this.chart,
                x: this.chart.width / 2,
                y: this.chart.height / 2
            });

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, this.onHover);
            }
            this.calculateTotal(data);

            // Create new slice for each piece of data
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {
                dataset.metaData = [];
                helpers.each(dataset.data, function(slice, index) {
                    var metaSlice = new this.Slice();
                    if (typeof slice == 'number') {
                        helpers.extend(metaSlice, {
                            value: slice
                        });
                    } else {
                        helpers.extend(metaSlice, slice);
                    }
                    if (!metaSlice.color) {
                        slice.color = 'hsl(' + (360 * index / data.length) + ', 100%, 50%)';
                    }
                    metaSlice.save();
                    dataset.metaData.push(metaSlice);
                }, this);
            }, this);

            // Create tooltip instance exclusively for this chart with some defaults.
            this.tooltip = new Chart.Tooltip({
                _chart: this.chart,
                _data: this.data,
                _options: this.options,
            }, this);

            this.update();
        },
        onHover: function(evt) {

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
                        this.lastActive[0].backgroundColor = this.data.datasets[0].backgroundColor;
                        break;
                    case 'label':
                        for (var i = 0; i < this.lastActive.length; i++) {
                            this.lastActive[i].backgroundColor = this.data.datasets[this.lastActive[i]._datasetIndex].backgroundColor;
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
                        break;
                    case 'label':
                        for (var i = 0; i < this.active.length; i++) {
                            this.active[i].backgroundColor = this.data.datasets[this.active[i]._datasetIndex].hoverBackgroundColor || helpers.color(this.active[i].backgroundColor).saturate(0.5).darken(0.35).rgbString();
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
        getSegmentsAtEvent: function(e) {
            var segmentsArray = [];

            var location = helpers.getRelativePosition(e);

            helpers.each(this.segments, function(segment) {
                if (segment.inRange(location.x, location.y)) segmentsArray.push(segment);
            }, this);
            return segmentsArray;
        },
        calculateCircumference: function(value) {
            if (this.total > 0) {
                return (Math.PI * 2) * (value / this.total);
            } else {
                return 0;
            }
        },
        calculateTotal: function(data) {
            this.total = 0;
            helpers.each(data, function(segment) {
                this.total += Math.abs(segment.value);
            }, this);
        },
        update: function() {

            this.outerRadius = (helpers.min([this.chart.width, this.chart.height]) - this.options.segmentStrokeWidth / 2) / 2;


            // Map new data to data points
            helpers.each(this.data, function(segment, i) {
                helpers.extend(this.segments[i], {
                    x: this.chart.width / 2,
                    y: this.chart.height / 2,
                    value: segment.value,
                    backgroundColor: segment.color,
                    hoverBackgroundColor: segment.highlight || segment.color,
                    borderWidth: this.options.segmentStrokeWidth,
                    borderColor: this.options.segmentStrokeColor,
                    label: segment.label,
                    startAngle: Math.PI * 1.5,
                    circumference: (this.options.animateRotate) ? 0 : this.calculateCircumference(segment.value),
                    innerRadius: (this.options.animateScale) ? 0 : (this.outerRadius / 100) * this.options.percentageInnerCutout,
                    outerRadius: (this.options.animateScale) ? 0 : this.outerRadius,
                });
            }, this);

            this.calculateTotal(this.segments);

            // Reset any highlight colours before updating.
            helpers.each(this.activeElements, function(activeElement) {
                activeElement.restore(['backgroundColor']);
            });

            helpers.each(this.segments, function(segment) {
                segment.save();
            });
            this.render();
        },

        removeData: function(atIndex) {
            var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length - 1;
            this.segments.splice(indexToDelete, 1);
            this.reflow();
            this.update();
        },

        reflow: function() {
            helpers.extend(this.Slice.prototype, {
                x: this.chart.width / 2,
                y: this.chart.height / 2
            });
            this.outerRadius = (helpers.min([this.chart.width, this.chart.height]) - this.options.segmentStrokeWidth / 2) / 2;
            helpers.each(this.segments, function(segment) {
                segment.update({
                    outerRadius: this.outerRadius,
                    innerRadius: (this.outerRadius / 100) * this.options.percentageInnerCutout
                });
            }, this);
        },
        draw: function(easeDecimal) {
            var animDecimal = (easeDecimal) ? easeDecimal : 1;
            this.clear();
            helpers.each(this.segments, function(segment, index) {
                segment.transition({
                    circumference: this.calculateCircumference(segment.value),
                    outerRadius: this.outerRadius,
                    innerRadius: (this.outerRadius / 100) * this.options.percentageInnerCutout
                }, animDecimal);

                segment.endAngle = segment.startAngle + segment.circumference;

                segment.draw();
                if (index === 0) {
                    segment.startAngle = Math.PI * 1.5;
                }
                //Check to see if it's the last segment, if not get the next and update the start angle
                if (index < this.segments.length - 1) {
                    this.segments[index + 1].startAngle = segment.endAngle;
                }
            }, this);

        }
    });

    Chart.types.Doughnut.extend({
        name: "Pie",
        defaults: helpers.merge(defaultConfig, {
            percentageInnerCutout: 0
        })
    });

}).call(this);
