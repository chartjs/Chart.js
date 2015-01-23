(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        helpers = Chart.helpers;

    var defaultConfig = {
        //Function - Whether the current x-axis label should be filtered out, takes in current label and 
        //index, return true to filter out the label return false to keep the label
        labelsFilter: function(label, index) {
            return false;
        },

        ///Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines: true,

        //String - Colour of the grid lines
        scaleGridLineColor: "rgba(0,0,0,.05)",

        //Number - Width of the grid lines
        scaleGridLineWidth: 1,

        //Boolean - Whether the line is curved between points
        bezierCurve: true,

        //Number - Tension of the bezier curve between points
        bezierCurveTension: 0.4,

        //Boolean - Whether to show a dot for each point
        pointDot: true,

        //Number - Radius of each point dot in pixels
        pointDotRadius: 4,

        //Number - Pixel width of point dot stroke
        pointDotStrokeWidth: 1,

        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHitDetectionRadius: 20,

        //Boolean - Whether to show a stroke for datasets
        datasetStroke: true,

        //Number - Pixel width of dataset stroke
        datasetStrokeWidth: 2,

        //Boolean - Whether to fill the dataset with a colour
        datasetFill: true,

        //Boolean - Whetther to try and fill sparse datasets to keep one consecutive line
        populateSparseData: false,

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    };


    Chart.Type.extend({
        name: "Line",
        defaults: defaultConfig,
        initialize: function(data) {
            //Declare the extension of the default point, to cater for the options passed in to the constructor
            this.PointClass = Chart.Point.extend({
                strokeWidth: this.options.pointDotStrokeWidth,
                radius: this.options.pointDotRadius,
                display: this.options.pointDot,
                hitDetectionRadius: this.options.pointHitDetectionRadius,
                ctx: this.chart.ctx,
                inRange: function(mouseX) {
                    return (Math.pow(mouseX - this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius, 2));
                }
            });

            this.datasets = [];

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt) {
                    var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
                    this.eachPoints(function(point) {
                        point.restore(['fillColor', 'strokeColor']);
                    });
                    helpers.each(activePoints, function(activePoint) {
                        activePoint.fillColor = activePoint.highlightFill;
                        activePoint.strokeColor = activePoint.highlightStroke;
                    });
                    this.showTooltip(activePoints);
                });
            }
            var sparseDatasetValues = [];
            if (this.options.populateSparseData) {
                //go through array
                //find null blocks
                //find values at end and start of null blocks
                //take first away from second
                //dived by number of nulls in block + 1
                //use this number to assign values to nulls adding it to the values
                //


                for (var i = 0; i < data.datasets.length; i++) {
                    var startNullBlockIndex = null,
                        endNullBlockIndex = null;
                    for (var j = 0; j < data.datasets[i].data.length; j++) {
                        var dataPointValue = data.datasets[i].data[j];

                        if (dataPointValue === null && startNullBlockIndex !== null) {
                            endNullBlockIndex = j - 1;
                        } else if (dataPointValue === null && startNullBlockIndex === null) {

                        }
                    }
                }
            }

            //Iterate through each of the datasets, and build this into a property of the chart
            helpers.each(data.datasets, function(dataset) {
                var datasetObject = {
                    label: dataset.label || null,
                    fillColor: dataset.fillColor,
                    strokeColor: dataset.strokeColor,
                    pointColor: dataset.pointColor,
                    pointStrokeColor: dataset.pointStrokeColor,
                    showTooltip: dataset.showTooltip,
                    points: []
                };

                this.datasets.push(datasetObject);


                helpers.each(dataset.data, function(dataPoint, index) {
                    //Add a new point for each piece of data, passing any required data to draw.
                    datasetObject.points.push(new this.PointClass({

                        //if datapoint is null add a flag to ignore this point
                        ignore: dataPoint === null,
                        showTooltip: dataset.showTooltip === undefined ? true : dataset.showTooltip,
                        value: dataPoint === null ? 0 : dataPoint,
                        label: data.labels[index],
                        datasetLabel: dataset.label,
                        strokeColor: dataset.pointStrokeColor,
                        fillColor: dataset.pointColor,
                        highlightFill: dataset.pointHighlightFill || dataset.pointColor,
                        highlightStroke: dataset.pointHighlightStroke || dataset.pointStrokeColor
                    }));
                }, this);

                this.buildScale(data.labels);


                this.eachPoints(function(point, index) {
                    helpers.extend(point, {
                        x: this.scale.calculateX(index),
                        y: this.scale.endPoint
                    });
                    point.save();
                }, this);

            }, this);


            this.render();
        },
        update: function() {
            this.scale.update();
            // Reset any highlight colours before updating.
            helpers.each(this.activeElements, function(activeElement) {
                activeElement.restore(['fillColor', 'strokeColor']);
            });
            this.eachPoints(function(point) {
                point.save();
            });
            this.render();
        },
        eachPoints: function(callback) {
            helpers.each(this.datasets, function(dataset) {
                helpers.each(dataset.points, callback, this);
            }, this);
        },
        getPointsAtEvent: function(e) {
            var pointsArray = [],
                eventPosition = helpers.getRelativePosition(e);
            helpers.each(this.datasets, function(dataset) {
                helpers.each(dataset.points, function(point) {
                    if (point.inRange(eventPosition.x, eventPosition.y) && point.showTooltip && !point.ignore) pointsArray.push(point);
                });
            }, this);
            return pointsArray;
        },
        buildScale: function(labels) {
            var self = this;

            var dataTotal = function() {
                var values = [];
                self.eachPoints(function(point) {
                    if (point.value !== null) {
                        values.push(point.value);
                    }
                });

                return values;
            };

            var scaleOptions = {
                templateString: this.options.scaleLabel,
                height: this.chart.height,
                width: this.chart.width,
                ctx: this.chart.ctx,
                labelsFilter: this.options.labelsFilter,
                textColor: this.options.scaleFontColor,
                fontSize: this.options.scaleFontSize,
                fontStyle: this.options.scaleFontStyle,
                fontFamily: this.options.scaleFontFamily,
                valuesCount: labels.length,
                beginAtZero: this.options.scaleBeginAtZero,
                integersOnly: this.options.scaleIntegersOnly,
                calculateYRange: function(currentHeight) {
                    var updatedRanges = helpers.calculateScaleRange(
                        dataTotal(),
                        currentHeight,
                        this.fontSize,
                        this.beginAtZero,
                        this.integersOnly
                    );
                    helpers.extend(this, updatedRanges);
                },
                xLabels: labels,
                font: helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                lineWidth: this.options.scaleLineWidth,
                lineColor: this.options.scaleLineColor,
                gridLineWidth: (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
                gridLineColor: (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
                padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
                showLabels: this.options.scaleShowLabels,
                display: this.options.showScale
            };

            if (this.options.scaleOverride) {
                helpers.extend(scaleOptions, {
                    calculateYRange: helpers.noop,
                    steps: this.options.scaleSteps,
                    stepValue: this.options.scaleStepWidth,
                    min: this.options.scaleStartValue,
                    max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
                });
            }


            this.scale = new Chart.Scale(scaleOptions);
        },
        addData: function(valuesArray, label) {
            //Map the values array for each of the datasets

            helpers.each(valuesArray, function(value, datasetIndex) {
                //Add a new point for each piece of data, passing any required data to draw.
                this.datasets[datasetIndex].points.push(new this.PointClass({
                    value: value,
                    label: label,
                    x: this.scale.calculateX(this.scale.valuesCount + 1),
                    y: this.scale.endPoint,
                    strokeColor: this.datasets[datasetIndex].pointStrokeColor,
                    fillColor: this.datasets[datasetIndex].pointColor
                }));
            }, this);

            this.scale.addXLabel(label);
            //Then re-render the chart.
            this.update();
        },
        removeData: function() {
            this.scale.removeXLabel();
            //Then re-render the chart.
            helpers.each(this.datasets, function(dataset) {
                dataset.points.shift();
            }, this);
            this.update();
        },
        reflow: function() {
            var newScaleProps = helpers.extend({
                height: this.chart.height,
                width: this.chart.width
            });
            this.scale.update(newScaleProps);
        },

        //extracted from draw() so it can be used to draw any line datasets
        drawDatasets: function(datasets, easingDecimal) {
            var ctx = this.chart.ctx;

            // Some helper methods for getting the next/prev points
            var hasValue = function(item) {
                    return item.value !== null;
                },
                nextPoint = function(point, collection, index) {
                    return helpers.findNextWhere(collection, hasValue, index) || point;
                },
                previousPoint = function(point, collection, index) {
                    return helpers.findPreviousWhere(collection, hasValue, index) || point;
                };

            this.scale.draw(easingDecimal);


            helpers.each(this.datasets, function(dataset) {
                    //Transition each point first so that the line and point drawing isn't out of sync
                    //We can use this extra loop to calculate the control points of this dataset also in this loop

                helpers.each(dataset.points, function(point, index) {
                    point.transition({
                        y: this.scale.calculateY(point.value),
                        x: this.scale.calculateX(index)
                    }, easingDecimal);

                }, this);


                // Control points need to be calculated in a seperate loop, because we need to know the current x/y of the point
                // This would cause issues when there is no animation, because the y of the next point would be 0, so beziers would be skewed
                if (this.options.bezierCurve) {
                    helpers.each(dataset.points, function(point, index) {
                        //If we're at the start or end, we don't have a previous/next point
                        //By setting the tension to 0 here, the curve will transition to straight at the end
                        var nextPoint, previousPoint, thispoint;
                        if (index === 0) {
                            nextPoint = this.getNextDataPoint(dataset, index) || point;
                            point.controlPoints = helpers.splineCurve(point, point, nextPoint, 0);
                        } else if (index === dataset.points.length - 1) {
                            previousPoint = this.getLastDataPoint(dataset, index) || point;
                            point.controlPoints = helpers.splineCurve(previousPoint, point, point, 0);
                        } else {
                            previousPoint = this.getLastDataPoint(dataset, index) || point;
                            nextPoint = this.getNextDataPoint(dataset, index) || point;
                            thispoint = this.getThisPoint(dataset, index) || point;
                            point.controlPoints = helpers.splineCurve(previousPoint, thispoint, nextPoint, this.options.bezierCurveTension);
                        }
                    }, this);
                }


                //Draw the line between all the points
                ctx.lineWidth = this.options.datasetStrokeWidth;
                ctx.strokeStyle = dataset.strokeColor;


                var penDown = false;
                var start = null;
                var started = false;

                helpers.each(dataset.points, function(point, index) {

                    /**
                     * no longer draw if the last point was ignore (as we don;t have anything to draw from)
                     * or if this point is ignore
                     * or if it's the first
                     */
                    if ((!point.ignore || (this.options.populateSparseData && started)) && !penDown) {
                        ctx.beginPath();
                        penDown = true;
                        start = point;
                        started = true;
                    }
                    if (index > 0 && (!dataset.points[index - 1].ignore || this.options.populateSparseData) && (!point.ignore || this.options.populateSparseData)) {
                        if (dataset.points[index].ignore) {

                        } else if (this.options.bezierCurve) {
                            var lastDataPoint = this.getLastDataPoint(dataset, index);
                            if (lastDataPoint) {

                                ctx.bezierCurveTo(
                                    lastDataPoint.controlPoints.outer.x,
                                    lastDataPoint.controlPoints.outer.y,
                                    point.controlPoints.inner.x,
                                    point.controlPoints.inner.y,
                                    point.x,
                                    point.y
                                );
                            } else {
                                ctx.moveTo(point.x, point.y);
                            }
                        } else {
                            ctx.lineTo(point.x, point.y);
                        }

                    } else if (index === 0 || (dataset.points[index - 1].ignore && !this.options.populateSparseData)) {
                        ctx.moveTo(point.x, point.y);
                    }

                    if (((dataset.points.length > index + 1 && (dataset.points[index + 1].ignore && !this.options.populateSparseData)) ||
                            dataset.points.length == index + 1) && (!point.ignore || this.options.populateSparseData)) {
                        ctx.stroke();

                        if (dataset.points.length == index + 1 && point.ignore) {
                            point = this.getLastDataPoint(dataset, index);
                        }
                        if (this.options.datasetFill) {
                            ctx.lineTo(point.x, this.scale.endPoint);
                            ctx.lineTo(start.x, this.scale.endPoint);
                            ctx.fillStyle = dataset.fillColor;
                            ctx.closePath();
                            if (point.x != start.x) {
                                ctx.fill();
                            }
                        }



                        penDown = false;
                    }

                }, this);


                //Now draw the points over the line
                //A little inefficient double looping, but better than the line
                //lagging behind the point positions
                helpers.each(dataset.points, function(point) {
                    /**
                     * don't draw the dot if we are ignoring
                     */
                    if (!point.ignore)
                        point.draw();
                });

            }, this);

        },

        getLastDataPoint: function(dataset, index) {
            var lastPointWithData = null;
            if (this.options.populateSparseData) {
                for (var i = index - 1; i >= 0; i--) {
                    if (!dataset.points[i].ignore) {
                        lastPointWithData = dataset.points[i];
                        break;
                    }
                }
            } else {
                index--;
                if (index >= 0 && !dataset.points[index].ignore) {
                    lastPointWithData = dataset.points[index];
                }
            }
            return lastPointWithData;
        },

        getNextDataPoint: function(dataset, index) {
            var nextDataPoint = null;
            if (this.options.populateSparseData) {
                for (var i = index + 1; i < dataset.points.length; i++) {
                    if (!dataset.points[i].ignore) {
                        nextDataPoint = dataset.points[i];
                        break;
                    }
                }


            } else {
                index++;
                if (index < dataset.points.length && !dataset.points[index].ignore) {
                    nextDataPoint = dataset.points[index];
                }
            }
            return nextDataPoint;
        },

        getThisPoint: function(dataset, index) {
            var thisDataPoint = null;
            if (dataset.points[index].ignore) {
                var groupLength, pointInGroup, startValue, endValue, startIndex, endIndex;
                for (var i = index + 1; i < dataset.points.length; i++) {
                    if (!dataset.points[i].ignore && i + 1 <= dataset.points.length) {
                        endIndex = i;
                        endValue = dataset.points[i + 1];
                    }
                }
            }


        },
        draw: function(ease) {
            var easingDecimal = ease || 1;
            this.clear();

            this.scale.draw(easingDecimal);
            this.drawDatasets(this.datasets, easingDecimal);
        }
    });


}).call(this);
