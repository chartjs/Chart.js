(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        //Cache a local reference to Chart.helpers
        helpers = Chart.helpers;

    var defaultConfig = {

        segment: {
            //String - The colour of the border on each segment.
            borderColor: "#fff",

            //Number - The width of the border value in pixels
            borderWidth: 2,
        },

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

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
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

                    helpers.each(self.data.data, function(data) {
                        if (this.min === null) {
                            this.min = data.value;
                        } else if (data.value < this.min) {
                            this.min = data.value;
                        }

                        if (this.max === null) {
                            this.max = data.value;
                        } else if (data.value > this.max) {
                            this.max = data.value;
                        }
                    }, this);
                }
            });

            //Declare segment class as a chart instance specific class, so it can share props for this instance
            this.Slice = Chart.Arc.extend();

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.events, this.onHover);
            }

            // Create new slice for each piece of data
            this.data.metaData = [];
            helpers.each(this.data.data, function(slice, index) {
                var metaSlice = new this.Slice({
                    _chart: this.chart,
                    innerRadius: 0,
                    startAngle: Math.PI * 1.5,
                    endAngle: Math.PI * 1.5,
                    x: this.chart.width / 2,
                    y: this.chart.height / 2
                });
                if (typeof slice == 'number') {
                    helpers.extend(metaSlice, {
                        value: slice
                    });
                } else {
                    helpers.extend(metaSlice, slice);
                }
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
        updateScaleRange: function() {
            helpers.extend(this.scale, {
                size: helpers.min([this.chart.width, this.chart.height]),
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2
            });
        },
        update: function() {

            this.updateScaleRange();
            this.scale.calculateRange();
            this.scale.generateTicks();
            this.scale.buildYLabels();

            this.outerRadius = (helpers.min([this.chart.width, this.chart.height]) - this.options.segment.borderWidth / 2) / 2;

            var circumference = 1 / this.data.data.length * 2;

            // Map new data to data points
            helpers.each(this.data.metaData, function(slice, index) {

                var datapoint = this.data.data[index];

                var startAngle = Math.PI * 1.5 + (Math.PI * circumference) * index;
                var endAngle = startAngle + (circumference * Math.PI);

                helpers.extend(slice, {
                    _index: index,
                    x: this.chart.width / 2,
                    y: this.chart.height / 2,
                    value: datapoint.value,
                    label: datapoint.label,
                    innerRadius: 0,
                    outerRadius: this.scale.calculateCenterOffset(slice.value),
                    startAngle: startAngle,
                    endAngle: endAngle,

                    backgroundColor: datapoint.backgroundColor,
                    hoverBackgroundColor: datapoint.hoverBackgroundColor || datapoint.backgroundColor,
                    borderWidth: this.options.borderWidth,
                    borderColor: this.options.segmentStrokeColor,
                });
                slice.pivot();

            }, this);

            this.render();
        },
        draw: function(ease) {
            var easingDecimal = ease || 1;

            this.clear();

            helpers.each(this.data.metaData, function(segment, index) {
                segment.transition(easingDecimal).draw();
            }, this);

            this.scale.draw();
        }
    });

}).call(this);
