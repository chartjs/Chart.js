(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.RectangularCanvasController = function(chart, elementController) {
		this.chart = chart;
		this.elementController = elementController;
	};

	Chart.RectangularCanvasController.prototype.initialize = function() {
		this.bindEvents();
		this.buildScales();

		// Need to fit scales before we reset elements. 
		Chart.scaleService.fitScalesForChart(this.chart, this.chart.chart.width, this.chart.chart.height);
		this.elementController.resetElements();

		this.initToolTip();

		this.chart.update();
	};

	Chart.RectangularCanvasController.prototype.bindEvents = function() {
		helpers.bindEvents(this.chart, this.chart.options.events, this.chart.events);
	};

	Chart.RectangularCanvasController.prototype.initToolTip = function() {
		this.chart.tooltip = new Chart.Tooltip({
			_chart: this.chart.chart,
			_data: this.chart.data,
			_options: this.chart.options,
		}, this);
	};

	Chart.RectangularCanvasController.prototype.buildScales = function() {
		// Map of scale ID to scale object so we can lookup later 
		this.chart.scales = {};

		// Build the x axes
		helpers.each(this.chart.options.scales.xAxes, function(xAxisOptions) {
			var ScaleClass = Chart.scaleService.getScaleConstructor(xAxisOptions.type);
			var scale = new ScaleClass({
				ctx: this.chart.chart.ctx,
				options: xAxisOptions,
				data: this.chart.data,
				id: xAxisOptions.id,
			});

			this.chart.scales[scale.id] = scale;
		}, this);

		// Build the y axes
		helpers.each(this.chart.options.scales.yAxes, function(yAxisOptions) {
			var ScaleClass = Chart.scaleService.getScaleConstructor(yAxisOptions.type);
			var scale = new ScaleClass({
				ctx: this.chart.chart.ctx,
				options: yAxisOptions,
				data: this.chart.data,
				id: yAxisOptions.id,
			});

			this.chart.scales[scale.id] = scale;
		}, this);
	};

	Chart.RectangularCanvasController.prototype.update = function() {
		Chart.scaleService.fitScalesForChart(this.chart, this.chart.chart.width, this.chart.chart.height);
		this.elementController.updateElements();
	};
}).call(this);
