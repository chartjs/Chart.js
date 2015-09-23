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
            this.ticks = [];

            if (this.options.ticks.userCallback) {
                this.data.labels.forEach(function(labelString, index) {
                    this.ticks.push(this.options.ticks.userCallback(labelString, index));
                }, this);
            } else {
                this.ticks = this.data.labels;
            }
        },
        buildRuler: function() {
            var datasetCount = this.data.datasets.length;

            this.ruler = {};
            this.ruler.tickWidth = this.getPixelFromTickIndex(1) - this.getPixelFromTickIndex(0) + 3; // TODO: Why is 2 needed here to make it take the full width?
            this.ruler.categoryWidth = this.ruler.tickWidth * this.options.categoryPercentage;
            this.ruler.categorySpacing = (this.ruler.tickWidth - (this.ruler.tickWidth * this.options.categoryPercentage)) / 2;
            this.ruler.allBarsWidth = ((this.ruler.tickWidth - (this.ruler.categorySpacing * 2)) / datasetCount);
            this.ruler.barWidth = this.ruler.allBarsWidth * this.options.barPercentage;
            this.ruler.barSpacing = this.ruler.allBarsWidth - (this.ruler.allBarsWidth * this.options.barPercentage);
        },

    });


    Chart.scaleService.registerScaleType("category", DatasetScale, defaultConfig);
}).call(this);
