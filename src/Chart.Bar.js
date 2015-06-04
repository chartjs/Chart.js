(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        helpers = Chart.helpers;

    var defaultConfig = {

        stacked: false,

        hover: {
            mode: "label"
        },

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

    };


    Chart.Type.extend({
        name: "Bar",
        defaults: defaultConfig,
        initialize: function() {

            var _this = this;

            // Events
            helpers.bindEvents(this, this.options.events, this.events);

            //Create a new bar for each piece of data
            helpers.each(this.data.datasets, function(dataset, datasetIndex) {
                dataset.metaData = [];
                helpers.each(dataset.data, function(dataPoint, index) {
                    dataset.metaData.push(new Chart.Rectangle({
                        _chart: this.chart,
                        _datasetIndex: datasetIndex,
                        _index: index,
                    }));
                }, this);

                // The bar chart only supports a single x axis because the x axis is always a dataset axis
                dataset.xAxisID = this.options.scales.xAxes[0].id;

                if (!dataset.yAxisID) {
                    dataset.yAxisID = this.options.scales.yAxes[0].id;
                }
            }, this);

            // Build and fit the scale. Needs to happen after the axis IDs have been set
            this.buildScale();

            // Create tooltip instance exclusively for this chart with some defaults.
            this.tooltip = new Chart.Tooltip({
                _chart: this.chart,
                _data: this.data,
                _options: this.options,
            }, this);

            // Need to fit scales before we reset elements. 
            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // So that we animate from the baseline
            this.resetElements();

            // Update the chart with the latest data.
            this.update();
        },
        resetElements: function() {
            // Update the points
            this.eachElement(function(bar, index, dataset, datasetIndex) {
                var xScale = this.scales[this.data.datasets[datasetIndex].xAxisID];
                var yScale = this.scales[this.data.datasets[datasetIndex].yAxisID];

                var yScalePoint;

                if (yScale.min < 0 && yScale.max <0) {
                    // all less than 0. use the top
                    yScalePoint = yScale.getPixelForValue(yScale.max);
                } else if (yScale.min > 0 && yScale.max > 0) {
                    yScalePoint = yScale.getPixelForValue(yScale.min);
                } else {
                    yScalePoint = yScale.getPixelForValue(0);
                }

                helpers.extend(bar, {
                    // Utility
                    _chart: this.chart,
                    _xScale: xScale,
                    _yScale: yScale,
                    _datasetIndex: datasetIndex,
                    _index: index,

                    // Desired view properties
                    _model: {
                        x: xScale.calculateBarX(this.data.datasets.length, datasetIndex, index),
                        y: yScalePoint,

                        // Appearance
                        base: yScale.calculateBarBase(datasetIndex, index),
                        width: xScale.calculateBarWidth(this.data.datasets.length),
                        backgroundColor: bar.custom && bar.custom.backgroundColor ? bar.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].backgroundColor, index, this.options.elements.bar.backgroundColor),
                        borderColor: bar.custom && bar.custom.borderColor ? bar.custom.borderColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].borderColor, index, this.options.elements.bar.borderColor),
                        borderWidth: bar.custom && bar.custom.borderWidth ? bar.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].borderWidth, index, this.options.elements.bar.borderWidth),

                        // Tooltip
                        label: this.data.labels[index],
                        datasetLabel: this.data.datasets[datasetIndex].label,
                    },
                });
                bar.pivot();
            }, this);
        },
        update: function() {
            // Update the scale sizes
            Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

            // Update the points
            this.eachElement(function(bar, index, dataset, datasetIndex) {
                var xScale = this.scales[this.data.datasets[datasetIndex].xAxisID];
                var yScale = this.scales[this.data.datasets[datasetIndex].yAxisID];

                helpers.extend(bar, {
                    // Utility
                    _chart: this.chart,
                    _xScale: xScale,
                    _yScale: yScale,
                    _datasetIndex: datasetIndex,
                    _index: index,

                    // Desired view properties
                    _model: {
                        x: xScale.calculateBarX(this.data.datasets.length, datasetIndex, index),
                        y: yScale.calculateBarY(datasetIndex, index),

                        // Appearance
                        base: yScale.calculateBarBase(datasetIndex, index),
                        width: xScale.calculateBarWidth(this.data.datasets.length),
                        backgroundColor: bar.custom && bar.custom.backgroundColor ? bar.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].backgroundColor, index, this.options.elements.bar.backgroundColor),
                        borderColor: bar.custom && bar.custom.borderColor ? bar.custom.borderColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].borderColor, index, this.options.elements.bar.borderColor),
                        borderWidth: bar.custom && bar.custom.borderWidth ? bar.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].borderWidth, index, this.options.elements.bar.borderWidth),

                        // Tooltip
                        label: this.data.labels[index],
                        datasetLabel: this.data.datasets[datasetIndex].label,
                    },
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
                    return (this.getPixelForValue(null, 1, true) - this.getPixelForValue(null, 0, true)) - (2 * self.options.elements.bar.valueSpacing);
                },
                calculateBarWidth: function(datasetCount) {
                    //The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
                    var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * self.options.elements.bar.datasetSpacing);

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

                    return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * self.options.elements.bar.datasetSpacing) + barWidth / 2;
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

                            var value = self.data.datasets[datasetIndex].data[index];

                            if (value < 0) {
                                for (var i = 0; i < datasetIndex; i++) {
                                    if (self.data.datasets[i].yAxisID === this.id) {
                                        base += self.data.datasets[i].data[index] < 0 ? self.data.datasets[i].data[index] : 0;
                                    }
                                }
                            } else {
                                for (var j = 0; j < datasetIndex; j++) {
                                    if (self.data.datasets[j].yAxisID === this.id) {
                                        base += self.data.datasets[j].data[index] > 0 ? self.data.datasets[j].data[index] : 0;
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
                    calculateBarY: function(datasetIndex, index) {

                        var value = self.data.datasets[datasetIndex].data[index];

                        if (self.options.stacked) {

                            var sumPos = 0,
                                sumNeg = 0;

                            for (var i = 0; i < datasetIndex; i++) {
                                if (self.data.datasets[i].data[index] < 0) {
                                    sumNeg += self.data.datasets[i].data[index] || 0;
                                } else {
                                    sumPos += self.data.datasets[i].data[index] || 0;
                                }
                            }

                            if (value < 0) {
                                return this.getPixelForValue(sumNeg + value);
                            } else {
                                return this.getPixelForValue(sumPos + value);
                            }

                            return this.getPixelForValue(value);
                        }

                        var offset = 0;

                        for (var j = datasetIndex; j < self.data.datasets.length; j++) {
                            if (j === datasetIndex && value) {
                                offset += value;
                            } else {
                                offset = offset + value;
                            }
                        }

                        return this.getPixelForValue(value);
                    },
                    id: yAxisOptions.id,
                });

                this.scales[scale.id] = scale;
            }, this);
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

                        this.lastActive[0]._model.backgroundColor = this.lastActive[0].custom && this.lastActive[0].custom.backgroundColor ? this.lastActive[0].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.options.elements.bar.backgroundColor);
                        this.lastActive[0]._model.borderColor = this.lastActive[0].custom && this.lastActive[0].custom.borderColor ? this.lastActive[0].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.options.elements.bar.borderColor);
                        this.lastActive[0]._model.borderWidth = this.lastActive[0].custom && this.lastActive[0].custom.borderWidth ? this.lastActive[0].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.options.elements.bar.borderWidth);
                        break;
                    case 'label':
                        for (var i = 0; i < this.lastActive.length; i++) {
                            dataset = this.data.datasets[this.lastActive[i]._datasetIndex];
                            index = this.lastActive[i]._index;

                            this.lastActive[i]._model.backgroundColor = this.lastActive[i].custom && this.lastActive[i].custom.backgroundColor ? this.lastActive[i].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.options.elements.bar.backgroundColor);
                            this.lastActive[i]._model.borderColor = this.lastActive[i].custom && this.lastActive[i].custom.borderColor ? this.lastActive[i].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.options.elements.bar.borderColor);
                            this.lastActive[i]._model.borderWidth = this.lastActive[i].custom && this.lastActive[i].custom.borderWidth ? this.lastActive[i].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.options.elements.bar.borderWidth);
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

                        this.active[0]._model.backgroundColor = this.active[0].custom && this.active[0].custom.hoverBackgroundColor ? this.active[0].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(this.active[0]._model.backgroundColor).saturate(0.5).darken(0.35).rgbString());
                        this.active[0]._model.borderColor = this.active[0].custom && this.active[0].custom.hoverBorderColor ? this.active[0].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(this.active[0]._model.borderColor).saturate(0.5).darken(0.35).rgbString());
                        this.active[0]._model.borderWidth = this.active[0].custom && this.active[0].custom.hoverBorderWidth ? this.active[0].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.active[0]._model.borderWidth);
                        break;
                    case 'label':
                        for (var i = 0; i < this.active.length; i++) {
                            dataset = this.data.datasets[this.active[i]._datasetIndex];
                            index = this.active[i]._index;

                            this.active[i]._model.backgroundColor = this.active[i].custom && this.active[i].custom.hoverBackgroundColor ? this.active[i].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(this.active[i]._model.backgroundColor).saturate(0.5).darken(0.35).rgbString());
                            this.active[i]._model.borderColor = this.active[i].custom && this.active[i].custom.hoverBorderColor ? this.active[i].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(this.active[i]._model.borderColor).saturate(0.5).darken(0.35).rgbString());
                            this.active[i]._model.borderWidth = this.active[i].custom && this.active[i].custom.hoverBorderWidth ? this.active[i].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.active[i]._model.borderWidth);
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
    });


}).call(this);
