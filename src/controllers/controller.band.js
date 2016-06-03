"use strict";

module.exports = function(Chart) {

    var helpers = Chart.helpers;

    Chart.defaults.band = {

        hover: {
            mode: "single"
        },

        scales: {
            xAxes: [{
                type: "linear",
                id: 'x-axis-0',
                position: "bottom",
                ticks: {
                    min:0,
                    max:100
                }
               
            }],
            yAxes: [{
                type: "linear",
                id: 'y-axis-0',
                position: "left",
                ticks: {
                    min:0,
                    max:100
                }
            }],
        },

      
       options:{
            responsive:true,
            responsiveAnimationDuration:0,
            defaultLineBorderWidth:2
        },

        tooltips: {
            callbacks: {
                title: function(tooltipItems, data) {
                   return '';
                },
                label: function(tooltipItem, data) {
                    var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                    var dp = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    
                    var label = dp.label != undefined ? dp.label + ': ' : '';

                    label += dp.x ? ( dp.x2 ? dp.x + ' - ' + dp.x2 : dp.x ) : '';
                    label += dp.y ? ( dp.y2 ? dp.y + ' - ' + dp.y2 : dp.y ) : '';

                    return label;
                }
            }
        }
    }

	Chart.controllers.band = Chart.DatasetController.extend({

        initialize: function(chart, datasetIndex) {
            Chart.DatasetController.prototype.initialize.call(this, chart, datasetIndex);
        },

    	// Create elements for each piece of data in the dataset. Store elements in an array on the dataset as dataset.metaData
        addElements: function() {

            var meta = this.getMeta();

            helpers.each(this.getDataset().data, function(value, index) {
                    meta.data[index] = meta.data[index] || new Chart.elements.Rectangle({
                        _chart: this.chart.chart,
                        _datasetIndex: this.index,
                        _index: index,
                    });
                }, this); 

        },

        // Create a single element for the data at the given index and reset its state
        addElementAndReset: function(index) {
            var rectangle = new Chart.elements.Rectangle({
                _chart: this.chart.chart,
                _datasetIndex: this.index,
                _index: index
            });
            this.getMeta().splice(index, 0, rectangle);
            this.updateElement(rectangle, index, true);
        },

        // Update the elements in response to new data
        // @param reset : if true, put the elements into a reset state so they can animate to their final values
        update: function(reset) 
        { 
            helpers.each(this.getMeta().data, function(rectangle, index) {
                this.updateElement(rectangle, index, reset);
            }, this);
        },

        updateElement: function updateElement(rectangle, index, reset)
        {
            // console.log("update element " + index);

            var meta   = this.getMeta();
            var xScale = this.getScaleForId(meta.xAxisID);
            var yScale = this.getScaleForId(meta.yAxisID);
            var rdata  = this.getDataset().data[index];

            var isLine = false;
            var left, top, right, bottom, width, height = null;
            var scaleBase;

            if (yScale.min < 0 && yScale.max < 0) {
                scaleBase = yScale.getPixelForValue(yScale.max);
            } else if (yScale.min > 0 && yScale.max > 0) {
                scaleBase = yScale.getPixelForValue(yScale.min);
            } else {
                scaleBase = yScale.getPixelForValue(0);
            }

            if( rdata.y == undefined && rdata.y2 == undefined )
            {
                // x axis line / area
                left        = rdata.x == undefined ? 0 : xScale.getPixelForValue(rdata.x);
                right       = rdata.x2 == undefined ? left : xScale.getPixelForValue(rdata.x2);
                top         = yScale.getPixelForValue(yScale.min);
                bottom      = yScale.getPixelForValue(yScale.max);

                isLine = (left==right)

            } else if ( rdata.x == undefined && rdata.x2 == undefined ) {
                // y axis line / area 
                top      = rdata.y == undefined ? 0 : yScale.getPixelForValue(rdata.y);
                bottom   = rdata.y2 == undefined ? top : yScale.getPixelForValue(rdata.y2);
                left     = xScale.getPixelForValue(xScale.min);
                right    = xScale.getPixelForValue(xScale.max);

                isLine = (top==bottom);
            } 

            width  = Math.abs(right - left);
            height = Math.abs(bottom - top);
           
            
            // Need to do this outside of the extend function so we can refer to it for lines           
            var backgroundColor = rectangle.custom && rectangle.custom.backgroundColor 
                ? rectangle.custom.backgroundColor 
                : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.rectangle.backgroundColor);



            helpers.extend(rectangle, {
                // Utility
                _chart: this.chart.chart,
                _xScale: xScale,
                _yScale: yScale,
                _datasetIndex: this.index,
                _index: index,

                // Desired view properties
                _model: {
                    // rectangle draws from center
                    x: left + width/2, 
                    y: reset ? scaleBase : top,
                    width: width,
                    isLine : isLine,

                    // Tooltip
                    label: '',
                    datasetLabel: this.getDataset().label,

                    // Appearance
                    base: bottom,

                    backgroundColor: backgroundColor,
                    borderSkipped: rectangle.custom && rectangle.custom.borderSkipped 
                        ? rectangle.custom.borderSkipped 
                        : this.chart.options.elements.rectangle.borderSkipped,
                    // If the dataset is a line, the fill wont appear, so we need to make 
                    // ure we use a line and make the color the same as the background color
                    borderColor: isLine 
                        ? backgroundColor 
                        : ( rectangle.custom && rectangle.custom.borderColor 
                                ? rectangle.custom.borderColor 
                                : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.rectangle.borderColor)),
                    borderWidth: isLine 
                        ? Chart.defaults.band.options.defaultLineBorderWidth 
                        : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.rectangle.borderWidth)
                },



                tooltipPosition: function()
                {
                    var vm = this._view;
                    return {
                        x: left+ width/2,
                        y: top/2
                    };
                }
            });
            
            rectangle.pivot();

        },

        // Draw the representation of the dataset
        // @param ease : if specified, this number represents how far to transition elements. See the implementation of draw() in any of the provided controllers to see how this should be used
        draw: function(ease) {

            var easingDecimal = ease || 1;
            helpers.each(this.getMeta().data, function(rectangle, index) {
                var d = this.getDataset().data[index];
                if (d !== null && d !== undefined && (d.x || d.x2 || d.y || d.y2) ) {
                    rectangle.transition(easingDecimal).draw();
                } 
            }, this);
        },

        // Remove hover styling from the given element
        setHoverStyle: function(rectangle) {
            console.log('remove hover style');
            var dataset = this.chart.data.datasets[rectangle._datasetIndex];
            var index = rectangle._index;

            rectangle._model.backgroundColor = rectangle.custom && rectangle.custom.hoverBackgroundColor 
                        ? rectangle.custom.hoverBackgroundColor 
                        : helpers.getValueAtIndexOrDefault(this.getDataset().hoverBackgroundColor, index, this.chart.options.elements.rectangle.hoverBackgroundColor);
            
            rectangle._model.borderColor = rectangle._model.isLine 
                        ? rectangle._model.hoverBackgroundColor
                        : ( rectangle.custom && rectangle.custom.HoverBorderColor 
                                ? rectangle.custom.HoverBorderColor 
                                : helpers.getValueAtIndexOrDefault(this.getDataset().HoverBorderColor, index, this.chart.options.elements.rectangle.HoverBorderColor));
            
            rectangle._model.borderWidth = rectangle.custom && rectangle.custom.hoverBorderWidth ? rectangle.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.hoverBorderWidth, index, rectangle._model.borderWidth);

        },

        // Add hover styling to the given element
        removeHoverStyle: function(rectangle) {
            console.log('set hover style');
            var dataset = this.chart.data.datasets[rectangle._datasetIndex];
            var index = rectangle._index;

            rectangle._model.backgroundColor = rectangle.custom && rectangle.custom.backgroundColor 
                        ? rectangle.custom.backgroundColor 
                        : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.rectangle.backgroundColor);
            
            rectangle._model.borderColor = rectangle._model.isLine 
                        ? rectangle._model.backgroundColor
                        : ( rectangle.custom && rectangle.custom.borderColor 
                                ? rectangle.custom.borderColor 
                                : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.rectangle.borderColor));
            
            rectangle._model.borderWidth = rectangle._model.isLine 
                        ? Chart.defaults.band.options.defaultLineBorderWidth 
                        : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.rectangle.borderWidth);

        }


        

	});

}