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
                    offsetGridLines: true,
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

        bars: {
            //Number - Pixel width of the bar border
            borderWidth: 2,

            //Number - Spacing between each of the X value sets
            valueSpacing: 5,

            //Number - Spacing between data sets within X values
            datasetSpacing: 1,
        }

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].backgroundColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };


    Chart.Type.extend({
        name: "Bar",
        defaults: defaultConfig,
        initialize: function() {
            // Events
            helpers.bindEvents(this, this.options.events, this.onHover);

            //Declare the extension of the default point, to cater for the options passed in to the constructor
            this.BarClass = Chart.Rectangle.extend({
                ctx: this.chart.ctx,
            });

            //Create a new bar for each piece of data
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {
                dataset.metaData = [];
                helpers.each(dataset.data, function(dataPoint, index) {
                    dataset.metaData.push(new this.BarClass());
                }, this);

                 // The bar chart only supports a single x axis because the x axis is always a dataset axis
                dataset.xAxisID = this.options.scales.xAxes[0].id;

                if (!dataset.yAxisID) {
                    dataset.yAxisID = this.options.scales.yAxes[0].id;
                }
            }, this);

            // Build and fit the scale. Needs to happen after the axis IDs have been set
            this.buildScale();
            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // Set defaults for bars
            this.eachElement(function(bar, index, dataset, datasetIndex) {
                var xScale = this.scales[this.data.datasets[datasetIndex].xAxisID];
                var yScale = this.scales[this.data.datasets[datasetIndex].yAxisID];

                helpers.extend(bar, {
                    base: yScale.getPixelForValue(0),
                    width: xScale.calculateBarWidth(this.data.datasets.length),
                    x: xScale.calculateBarX(this.data.datasets.length, datasetIndex, index),
                    y: yScale.calculateBarY(this.data.datasets, datasetIndex, index, this.data.datasets[datasetIndex].data[index]),
                    _datasetIndex: datasetIndex,
                    _index: index,
                });
                // Copy to view model
                bar.save();
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
        onHover: function(e) {


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
                        this.lastActive[0].backgroundColor = this.data.datasets[this.lastActive[0]._datasetIndex].backgroundColor;
                        this.lastActive[0].borderColor = this.data.datasets[this.lastActive[0]._datasetIndex].borderColor;
                        break;
                    case 'label':
                        for (var i = 0; i < this.lastActive.length; i++) {
                            this.lastActive[i].backgroundColor = this.data.datasets[this.lastActive[i]._datasetIndex].backgroundColor;
                            this.lastActive[i].borderColor = this.data.datasets[this.lastActive[i]._datasetIndex].borderColor;
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
                        this.active[0].backgroundColor = this.data.datasets[this.active[0]._datasetIndex].hoverBackgroundColor || helpers.color(this.active[0].backgroundColor).saturate(0.8).darken(0.2).rgbString();
                        this.active[0].borderColor = this.data.datasets[this.active[0]._datasetIndex].hoverBorderColor || helpers.color(this.active[0].borderColor).saturate(0.8).darken(0.2).rgbString();
                        break;
                    case 'label':
                        for (var i = 0; i < this.active.length; i++) {
                            this.active[i].backgroundColor = this.data.datasets[this.active[i]._datasetIndex].hoverBackgroundColor || helpers.color(this.active[i].backgroundColor).saturate(0.8).darken(0.2).rgbString();
                            this.active[i].borderColor = this.data.datasets[this.active[i]._datasetIndex].hoverBorderColor || helpers.color(this.active[i].borderColor).saturate(0.8).darken(0.2).rgbString();
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


            this.tooltip.pivot();

            // Hover animations
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
            // Update the scale sizes
            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            this.eachElement(function(bar, index, dataset, datasetIndex) {
                helpers.extend(bar, {
                    value: this.data.datasets[datasetIndex].data[index],
                });

                bar.pivot();
            }, this);

            this.eachElement(function(bar, index, dataset, datasetIndex) {
                var xScale = this.scales[this.data.datasets[datasetIndex].xAxisID];
                var yScale = this.scales[this.data.datasets[datasetIndex].yAxisID];

                helpers.extend(bar, {
                    base: yScale.calculateBarBase(datasetIndex, index),
                    x: xScale.calculateBarX(this.data.datasets.length, datasetIndex, index),
                    y: yScale.calculateBarY(this.data.datasets, datasetIndex, index, this.data.datasets[datasetIndex].data[index]),
                    width: xScale.calculateBarWidth(this.data.datasets.length),
                    label: this.data.labels[index],
                    datasetLabel: this.data.datasets[datasetIndex].label,
                    borderColor: this.data.datasets[datasetIndex].borderColor,
                    borderWidth: this.data.datasets[datasetIndex].borderWidth,
                    backgroundColor: this.data.datasets[datasetIndex].backgroundColor,
                    _datasetIndex: datasetIndex,
                    _index: index,
                });

                bar.pivot();
            }, this);

            this.render();
        },
        buildScale: function(labels) {
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
                id: this.options.scales.xAxes[0].id,
                calculateRange: function() {
                    this.labels = self.data.labels;
                    this.min = 0;
                    this.max = this.labels.length;
                },
                calculateBaseWidth: function() {
                    return (this.getPixelForValue(null, 1, true) - this.getPixelForValue(null, 0, true)) - (2 * self.options.bars.valueSpacing);
                },
                calculateBarWidth: function(datasetCount) {
                    //The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
                    var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * self.options.bars.datasetSpacing);

                    if (self.options.stacked) {
                        return baseWidth;
                    }
                    return (baseWidth / datasetCount);
                },
                calculateBarX: function(datasetCount, datasetIndex, elementIndex) {
                    var xWidth = this.calculateBaseWidth(),
                        xAbsolute = this.getPixelForValue(null, elementIndex, true) - (xWidth / 2),
                        barWidth = this.calculateBarWidth(datasetCount);

                    if (self.options.stacked) {
                        return xAbsolute + barWidth / 2;
                    }

                    return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * self.options.bars.datasetSpacing) + barWidth / 2;
                },
            });
            this.scales[xScale.id] = xScale;

            // Build up all the y scales
            helpers.each(this.options.scales.yAxes, function(yAxisOptions) {
                var ScaleClass = Chart.scales.getScaleConstructor(yAxisOptions.scaleType);
                var scale = new ScaleClass({
                    ctx: this.chart.ctx,
                    options: yAxisOptions,
                    calculateRange: calculateYRange,
                    calculateBarBase: function(datasetIndex, index) {
                        var base = 0;

                        if (self.options.stacked) {
                            var bar = self.data.datasets[datasetIndex].metaData[index];

                            if (bar.value < 0) {
                                for (var i = 0; i < datasetIndex; i++) {
                                    if (self.data.datasets[i].yAxisID === this.id) {
                                        base += self.data.datasets[i].metaData[index].value < base ? self.data.datasets[i].metaData[index].value : 0;
                                    }
                                }
                            } else {
                                for (var i = 0; i < datasetIndex; i++) {
                                    if (self.data.datasets[i].yAxisID === this.id) {
                                        base += self.data.datasets[i].metaData[index].value > base ? self.data.datasets[i].metaData[index].value : 0;
                                    }
                                }
                            }

                            return this.getPixelForValue(base);
                        }

                        base = this.getPixelForValue(this.min);

                        if (this.beginAtZero || ((this.min <= 0 && this.max >= 0) || (this.min >= 0 && this.max <= 0))) {
                            base = this.getPixelForValue(0);
                            base += this.options.gridLines.lineWidth;
                        } else if (this.min < 0 && this.max < 0) {
                            // All values are negative. Use the top as the base
                            base = this.getPixelForValue(this.max);
                        }

                        return base;

                    },
                    calculateBarY: function(datasets, datasetIndex, barIndex, value) {

                        if (self.options.stacked) {

                            var sumPos = 0,
                                sumNeg = 0;

                            for (var i = 0; i < datasetIndex; i++) {
                                if (datasets[i].metaData[barIndex].value < 0) {
                                    sumNeg += datasets[i].metaData[barIndex].value || 0;
                                } else {
                                    sumPos += datasets[i].metaData[barIndex].value || 0;
                                }
                            }

                            if (value < 0) {
                                return this.getPixelForValue(sumNeg + value);
                            } else {
                                return this.getPixelForValue(sumPos + value);
                            }

                            return this.getPixelForValue(0);
                        }

                        var offset = 0;

                        for (i = datasetIndex; i < datasets.length; i++) {
                            if (i === datasetIndex && value) {
                                offset += value;
                            } else {
                                offset = offset + (datasets[i].metaData[barIndex].value);
                            }
                        }

                        return this.getPixelForValue(value);
                    },
                    
                    calculateBaseHeight: function() {
                        return (this.getPixelForValue(1) - this.getPixelForValue(0));
                    },
                    id: yAxisOptions.id,
                });

                this.scales[scale.id] = scale;
            }, this);
        },
        // This should be incorportated into the init as something like a default value. "Reflow" seems like a weird word for a fredraw function
        redraw: function() {
            this.eachElement(function(element, index, datasetIndex) {
                var yScale = this.scales[this.data.datasets[datasetIndex].yAxisID];
                var base = yScale.getPixelForValue(yScale.min);

                if (yScale.min <= 0 && yScale.max >= 0) {
                    // have a 0 point
                    base = yScale.getPixelForValue(0);
                } else if (yScale.min < 0 && yScale.max < 0) {
                    // all megative
                    base = yScale.getPixelForValue(yScale.max);
                }

                helpers.extend(element, {
                    y: base,
                    base: base
                });
            });
            this.render();
        },
        draw: function(ease) {

            var easingDecimal = ease || 1;
            this.clear();

            // Draw all the scales
            helpers.each(this.scales, function(scale) {
                scale.draw(this.chartArea);
            }, this);

            //Draw all the bars for each dataset
            this.eachElement(function(bar, index, datasetIndex) {
                bar.transition(easingDecimal).draw();
            }, this);

            // Finally draw the tooltip
            this.tooltip.transition(easingDecimal).draw();
        }
    });


}).call(this);
