(function() {
    "use strict";

    var root = this,
        Chart = root.Chart,
        helpers = Chart.helpers;

    // Default config for a category scale
    var defaultConfig = {
        position: "bottom",
    };

    var DatasetScale = Chart.Scale.extend({
        buildTicks: function(index) {
            this.ticks = this.chart.data.labels;
        },

        getLabelForIndex: function(index, datasetIndex) {
            return this.ticks[index];
        },

        // Used to get data value locations.  Value can either be an index or a numerical value
        getPixelForValue: function(value, index, datasetIndex, includeOffset) {
            if (this.isHorizontal()) {
                var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
                var valueWidth = innerWidth / Math.max((this.chart.data.labels.length - ((this.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
                var widthOffset = (valueWidth * index) + this.paddingLeft;

                if (this.options.gridLines.offsetGridLines && includeOffset) {
                    widthOffset += (valueWidth / 2);
                }

                return this.left + Math.round(widthOffset);
            } else {
                var innerHeight = this.height - (this.paddingTop + this.paddingBottom);
                var valueHeight = innerHeight / Math.max((this.chart.data.labels.length - ((this.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
                var heightOffset = (valueHeight * index) + this.paddingTop;

                if (this.options.gridLines.offsetGridLines && includeOffset) {
                    heightOffset += (valueHeight / 2);
                }

                return this.top + Math.round(heightOffset);
            }
        },
    });

    Chart.scaleService.registerScaleType("category", DatasetScale, defaultConfig);

}).call(this);
