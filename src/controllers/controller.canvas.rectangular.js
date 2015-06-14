(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.RectangularCanvasController = function(chart, elementController) {
		this.chartInstance = chart;
		this.elementController = elementController;
	};

	Chart.RectangularCanvasController.prototype.initialize = function() {
		this.bindEvents();
		this.buildScales();

		// Need to fit scales before we reset elements. 
		Chart.scaleService.fitScalesForChart(this.chartInstance, this.chartInstance.chart.width, this.chartInstance.chart.height);
		this.elementController.resetElements();

		this.initToolTip();

		this.chartInstance.update();
	};

	Chart.RectangularCanvasController.prototype.bindEvents = function() {
		helpers.bindEvents(this.chartInstance, this.chartInstance.options.events, function(evt) {
			// this will be the chart instance
			this.canvasController.eventHandler(evt);
		});
	};

	Chart.RectangularCanvasController.prototype.eventHandler = function(e) {
		this.lastActive = this.lastActive || [];

		// Find Active Elements
		if (e.type == 'mouseout') {
			this.active = [];
		} else {
			this.active = function() {
				switch (this.chartInstance.options.hover.mode) {
					case 'single':
						return this.elementController.getElementAtEvent(e);
					case 'label':
						return this.elementController.getElementsAtEvent(e);
					case 'dataset':
						return this.elementController.getDatasetAtEvent(e);
					default:
						return e;
				}
			}.call(this);
		}

		// On Hover hook
		if (this.chartInstance.options.hover.onHover) {
			this.chartInstance.options.hover.onHover.call(this.chartInstance, this.active);
		}

		if (e.type == 'mouseup' || e.type == 'click') {
			if (this.chartInstance.options.onClick) {
				this.chartInstance.options.onClick.call(this, e, this.active);
			}
		}

		var dataset;
		var index;
		// Remove styling for last active (even if it may still be active)
		if (this.lastActive.length) {
			switch (this.chartInstance.options.hover.mode) {
				case 'single':
					this.elementController.updatePointElementAppearance(this.lastActive[0], this.lastActive[0]._datasetIndex, this.lastActive[0]._index);
					break;
				case 'label':
					for (var i = 0; i < this.lastActive.length; i++) {
						this.elementController.updatePointElementAppearance(this.lastActive[i], this.lastActive[i]._datasetIndex, this.lastActive[i]._index);
					}
					break;
				case 'dataset':
					break;
				default:
					// Don't change anything
			}
		}

		// Built in hover styling
		if (this.active.length && this.chartInstance.options.hover.mode) {
			switch (this.chartInstance.options.hover.mode) {
				case 'single':
					this.elementController.setPointHoverStyle(this.active[0]);
					break;
				case 'label':
					for (var i = 0; i < this.active.length; i++) {
						this.elementController.setPointHoverStyle(this.active[i]);
					}
					break;
				case 'dataset':
					break;
				default:
					// Don't change anything
			}
		}


		// Built in Tooltips
		if (this.chartInstance.options.tooltips.enabled) {

			// The usual updates
			this.chartInstance.tooltip.initialize();

			// Active
			if (this.active.length) {
				this.chartInstance.tooltip._model.opacity = 1;

				helpers.extend(this.chartInstance.tooltip, {
					_active: this.active,
				});

				this.chartInstance.tooltip.update();
			} else {
				// Inactive
				this.chartInstance.tooltip._model.opacity = 0;
			}
		}

		// Hover animations
		this.chartInstance.tooltip.pivot();

		if (!this.chartInstance.animating) {
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

				this.chartInstance.stop();
				this.chartInstance.render(this.chartInstance.options.hover.animationDuration);
			}
		}

		// Remember Last Active
		this.lastActive = this.active;
		return this;
	};

	Chart.RectangularCanvasController.prototype.initToolTip = function() {
		this.chartInstance.tooltip = new Chart.Tooltip({
			_chart: this.chartInstance.chart,
			_data: this.chartInstance.data,
			_options: this.chartInstance.options,
		}, this);
	};

	Chart.RectangularCanvasController.prototype.buildScales = function() {
		// Map of scale ID to scale object so we can lookup later 
		this.chartInstance.scales = {};

		// Build the x axes
		helpers.each(this.chartInstance.options.scales.xAxes, function(xAxisOptions) {
			var ScaleClass = Chart.scaleService.getScaleConstructor(xAxisOptions.type);
			var scale = new ScaleClass({
				ctx: this.chartInstance.chart.ctx,
				options: xAxisOptions,
				data: this.chartInstance.data,
				id: xAxisOptions.id,
			});

			this.chartInstance.scales[scale.id] = scale;
		}, this);

		// Build the y axes
		helpers.each(this.chartInstance.options.scales.yAxes, function(yAxisOptions) {
			var ScaleClass = Chart.scaleService.getScaleConstructor(yAxisOptions.type);
			var scale = new ScaleClass({
				ctx: this.chartInstance.chart.ctx,
				options: yAxisOptions,
				data: this.chartInstance.data,
				id: yAxisOptions.id,
			});

			this.chartInstance.scales[scale.id] = scale;
		}, this);
	};

	Chart.RectangularCanvasController.prototype.update = function() {
		Chart.scaleService.fitScalesForChart(this.chartInstance, this.chartInstance.chart.width, this.chartInstance.chart.height);
		this.elementController.updateElements();
	};
}).call(this);
