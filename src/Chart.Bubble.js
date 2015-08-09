(function(){
    "use strict";

    var root = this,
        Chart = root.Chart,
        helpers = Chart.helpers;

    var defaultConfig = {

        ///Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines : true,

        //String - Colour of the grid lines
        scaleGridLineColor : "rgba(0,0,0,.05)",

        //Number - Width of the grid lines
        scaleGridLineWidth : 1,

        //
        scaleFormatterXLabels: false,

        //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowHorizontalLines: true,

        //Boolean - Whether to show vertical lines (except Y axis)
        scaleShowVerticalLines: true,

        //Boolean - Whether to show X axis
        scaleShowXAxis: true,

        //Boolean - Whether to show Y axis
        scaleShowYAxis: true,

        //Boolean - Whether to show X labels
        scaleShowXLabels: true,

        //Boolean - Whether to show Y labels
        scaleShowYLabels: true,

        //Number - Maximum radius of the bubble on the chart
        bubbleMaxRadius: 44,

        //Number - Pixel width of the bubble stroke
        bubbleStrokeWidth: 1,

        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        bubbleHitDetectionRadius : 20,

        //String - A legend template
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>",

        //Boolean - Whether to horizontally center the label and point dot inside the grid
        offsetGridLines : false

    };


    Chart.Type.extend({
        name: "Bubble",
        defaults : defaultConfig,
        initialize:  function(data){
            //Declare the extension of the default point, to cater for the options passed in to the constructor
            this.PointClass = Chart.Point.extend({
                offsetGridLines : this.options.offsetGridLines,
                strokeWidth : this.options.bubbleStrokeWidth,
                display: true,
                hitDetectionRadius : this.options.bubbleHitDetectionRadius,
                ctx : this.chart.ctx,
                inRange : function(mouseX){
                    return (Math.pow(mouseX-this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius,2));
                }
            });

            this.datasets = [];

            //Set up tooltip events on the chart
            if (this.options.showTooltips){
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
                    var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
                    this.eachPoints(function(point){
                        point.restore(['fillColor', 'strokeColor']);
                    });
                    helpers.each(activePoints, function(activePoint){
                        activePoint.fillColor = activePoint.highlightFill;
                        activePoint.strokeColor = activePoint.highlightStroke;
                    });
                    this.showTooltip(activePoints);
                });
            }

            //Iterate through each of the datasets, and build this into a property of the chart
            helpers.each(data.datasets,function(dataset){

                var datasetObject = {
                    label : dataset.label || null,
                    fillColor : dataset.fillColor,
                    strokeColor : dataset.strokeColor,
                    pointColor : dataset.pointColor,
                    pointStrokeColor : dataset.pointStrokeColor,
                    points : []
                };

                this.datasets.push(datasetObject);

                // Нормализация данных c вычислением максимального значения пузыря.
                // Данные должны быть представленны в виде массива массивов,
                // В каждом элементе-массиве первое значение - радиус пузыря,
                // а второе его смещение по оси Y.
                var maxValue = 0;
                helpers.each(dataset.data, function(dataPoint,index) {
                    if(helpers.isNumber(dataPoint)) {
                        dataset.data[index] = dataPoint = [dataPoint, 0];
                    }
                    if(dataPoint[0] > maxValue) {
                        maxValue = dataPoint[0];
                    }
                });

                // коэффициент для расчета радиуса пузыря
                var radiusFactor = this.options.bubbleMaxRadius / maxValue;

                helpers.each(dataset.data,function(dataPoint,index){
                    //Add a new point for each piece of data, passing any required data to draw.
                    datasetObject.points.push(new this.PointClass({
                        radius: Math.round(dataPoint[0] * radiusFactor),
                        value : dataPoint[1],
                        label : data.labels[index],
                        datasetLabel: dataset.label,
                        strokeColor : dataset.pointStrokeColor,
                        fillColor : dataset.pointColor,
                        highlightFill : dataset.pointHighlightFill || dataset.pointColor,
                        highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
                    }));
                },this);

                this.buildScale(data.labels);


                this.eachPoints(function(point, index){
                    helpers.extend(point, {
                        x: this.scale.calculateX(index),
                        y: this.scale.endPoint
                    });
                    point.save();
                }, this);

            },this);


            this.render();
        },
        update : function(){
            this.scale.update();
            // Reset any highlight colours before updating.
            helpers.each(this.activeElements, function(activeElement){
                activeElement.restore(['fillColor', 'strokeColor']);
            });
            this.eachPoints(function(point){
                point.save();
            });
            this.render();
        },
        eachPoints : function(callback){
            helpers.each(this.datasets,function(dataset){
                helpers.each(dataset.points,callback,this);
            },this);
        },
        getPointsAtEvent : function(e){
            var pointsArray = [],
                eventPosition = helpers.getRelativePosition(e);
            helpers.each(this.datasets,function(dataset){
                helpers.each(dataset.points,function(point){
                    if (point.inRange(eventPosition.x,eventPosition.y)) pointsArray.push(point);
                });
            },this);
            return pointsArray;
        },
        buildScale : function(labels){
            var self = this;

            var dataTotal = function(){
                var values = [];
                self.eachPoints(function(point){
                    values.push(point.value);
                });

                return values;
            };

            var scaleOptions = {
                templateString : this.options.scaleLabel,
                height : this.chart.height,
                width : this.chart.width,
                ctx : this.chart.ctx,
                textColor : this.options.scaleFontColor,
                offsetGridLines : this.options.offsetGridLines,
                fontSize : this.options.scaleFontSize,
                fontStyle : this.options.scaleFontStyle,
                fontFamily : this.options.scaleFontFamily,
                valuesCount : labels.length,
                beginAtZero : this.options.scaleBeginAtZero,
                integersOnly : this.options.scaleIntegersOnly,
                calculateYRange : function(currentHeight){
                    var updatedRanges = helpers.calculateScaleRange(
                        dataTotal(),
                        currentHeight,
                        this.fontSize,
                        this.beginAtZero,
                        this.integersOnly
                    );
                    helpers.extend(this, updatedRanges);
                },
                xLabels : helpers.isFunction(this.options.scaleFormatterXLabels) ? labels.map(this.options.scaleFormatterXLabels.bind(this)) : labels,
                font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                lineWidth : this.options.scaleLineWidth,
                lineColor : this.options.scaleLineColor,
                showHorizontalLines : this.options.scaleShowHorizontalLines,
                showVerticalLines : this.options.scaleShowVerticalLines,
                showXAxis : this.options.scaleShowXAxis,
                showYAxis : this.options.scaleShowYAxis,
                showXLabels : this.options.scaleShowXLabels,
                showYLabels : this.options.scaleShowYLabels,
                gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
                gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
                padding: this.options.bubbleMaxRadius + this.options.bubbleStrokeWidth,
                showLabels : this.options.scaleShowLabels,
                display : this.options.showScale
            };

            if (this.options.scaleOverride){
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
        addData : function(valuesArray,label){
            //Map the values array for each of the datasets

            helpers.each(valuesArray,function(value,datasetIndex){
                if(helpers.isNumber(value)) {
                    value = [value, 0];
                }
                //Add a new point for each piece of data, passing any required data to draw.
                this.datasets[datasetIndex].points.push(new this.PointClass({
                    radius: value[0],
                    value : value[1],
                    label : label,
                    datasetLabel: this.datasets[datasetIndex].label,
                    x: this.scale.calculateX(this.scale.valuesCount+1),
                    y: this.scale.endPoint,
                    strokeColor : this.datasets[datasetIndex].pointStrokeColor,
                    fillColor : this.datasets[datasetIndex].pointColor
                }));
            },this);

            this.scale.addXLabel(label);
            //Then re-render the chart.
            this.update();
        },
        removeData : function(){
            this.scale.removeXLabel();
            //Then re-render the chart.
            helpers.each(this.datasets,function(dataset){
                dataset.points.shift();
            },this);
            this.update();
        },
        reflow : function(){
            var newScaleProps = helpers.extend({
                height : this.chart.height,
                width : this.chart.width
            });
            this.scale.update(newScaleProps);
        },
        draw : function(ease){
            var easingDecimal = ease || 1;
            this.clear();

            var ctx = this.chart.ctx;

            // Some helper methods for getting the next/prev points
            var hasValue = function(item){
                    return item.value !== null;
                };

            this.scale.draw(easingDecimal);


            helpers.each(this.datasets,function(dataset){
                var pointsWithValues = helpers.where(dataset.points, hasValue);

                //Transition each point first so that the line and point drawing isn't out of sync
                //We can use this extra loop to calculate the control points of this dataset also in this loop

                helpers.each(dataset.points, function(point, index){
                    if (point.hasValue()){
                        point.transition({
                            y : this.scale.calculateY(point.value),
                            x : this.scale.calculateX(index)
                        }, easingDecimal);
                    }
                },this);


                //Draw the line between all the points
                ctx.lineWidth = this.options.datasetStrokeWidth;
                ctx.fillStyle = dataset.fillColor;
                ctx.strokeStyle = dataset.strokeColor;

                //Now draw the points over the line
                //A little inefficient double looping, but better than the line
                //lagging behind the point positions
                helpers.each(pointsWithValues,function(point){
                    point.draw();
                });
            },this);
        },
        _createBubble: function() {
            var bubble;

            return bubble;
        }
    });


}).call(this);
