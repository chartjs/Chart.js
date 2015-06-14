(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {

	};

	// Rectangular base class that derives into line & bar charts
	Chart.Type.extend({
		name: "RectangularBase",
		defaults: defaultConfig,
		initialize: function() {
			// Events
			helpers.bindEvents(this, this.options.events, this.events);

			// Build and fit the scale. Needs to happen after the axis IDs have been set
			this.buildScales();

			// Create tooltip instance exclusively for this chart with some defaults.
			this.tooltip = new Chart.Tooltip({
				_chart: this.chart,
				_data: this.data,
				_options: this.options,
			}, this);

			// Need to fit scales before we reset elements. 
			Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

			// Reset so that we animation from the baseline
			this.resetElements();

			// Update that shiz
			this.update();
		},
		resetElements: function() {
			this.controller.resetElements();
		},
		update: function(animationDuration) {

			Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);
			this.controller.updateElements();
			this.render(animationDuration);
		},
		buildScales: function() {
			// Map of scale ID to scale object so we can lookup later 
			this.scales = {};

			// Build the x axes
			helpers.each(this.options.scales.xAxes, function(xAxisOptions) {
				var ScaleClass = Chart.scaleService.getScaleConstructor(xAxisOptions.type);
				var scale = new ScaleClass({
					ctx: this.chart.ctx,
					options: xAxisOptions,
					data: this.data,
					id: xAxisOptions.id,
				});

				this.scales[scale.id] = scale;
			}, this);

			// Build the y axes
			helpers.each(this.options.scales.yAxes, function(yAxisOptions) {
				var ScaleClass = Chart.scaleService.getScaleConstructor(yAxisOptions.type);
				var scale = new ScaleClass({
					ctx: this.chart.ctx,
					options: yAxisOptions,
					data: this.data,
					id: yAxisOptions.id,
				});

				this.scales[scale.id] = scale;
			}, this);
		},
		draw: helpers.noop,
		events: function(e) {

			this.lastActive = this.lastActive || [];

			// Find Active Elements
			if (e.type == 'mouseout') {
				this.active = [];
			} else {
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
			}

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

						this.lastActive[0]._model.radius = this.lastActive[0].custom && this.lastActive[0].custom.radius ? this.lastActive[0].custom.radius : helpers.getValueAtIndexOrDefault(dataset.radius, index, this.options.elements.point.radius);
						this.lastActive[0]._model.backgroundColor = this.lastActive[0].custom && this.lastActive[0].custom.backgroundColor ? this.lastActive[0].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointBackgroundColor, index, this.options.elements.point.backgroundColor);
						this.lastActive[0]._model.borderColor = this.lastActive[0].custom && this.lastActive[0].custom.borderColor ? this.lastActive[0].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.pointBorderColor, index, this.options.elements.point.borderColor);
						this.lastActive[0]._model.borderWidth = this.lastActive[0].custom && this.lastActive[0].custom.borderWidth ? this.lastActive[0].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, this.options.elements.point.borderWidth);
						break;
					case 'label':
						for (var i = 0; i < this.lastActive.length; i++) {
							dataset = this.data.datasets[this.lastActive[i]._datasetIndex];
							index = this.lastActive[i]._index;

							this.lastActive[i]._model.radius = this.lastActive[i].custom && this.lastActive[i].custom.radius ? this.lastActive[i].custom.radius : helpers.getValueAtIndexOrDefault(dataset.radius, index, this.options.elements.point.radius);
							this.lastActive[i]._model.backgroundColor = this.lastActive[i].custom && this.lastActive[i].custom.backgroundColor ? this.lastActive[i].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointBackgroundColor, index, this.options.elements.point.backgroundColor);
							this.lastActive[i]._model.borderColor = this.lastActive[i].custom && this.lastActive[i].custom.borderColor ? this.lastActive[i].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.pointBorderColor, index, this.options.elements.point.borderColor);
							this.lastActive[i]._model.borderWidth = this.lastActive[i].custom && this.lastActive[i].custom.borderWidth ? this.lastActive[i].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, this.options.elements.point.borderWidth);
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

						this.active[0]._model.radius = this.active[0].custom && this.active[0].custom.radius ? this.active[0].custom.radius : helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.options.elements.point.hoverRadius);
						this.active[0]._model.backgroundColor = this.active[0].custom && this.active[0].custom.hoverBackgroundColor ? this.active[0].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.color(this.active[0]._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
						this.active[0]._model.borderColor = this.active[0].custom && this.active[0].custom.hoverBorderColor ? this.active[0].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.color(this.active[0]._model.borderColor).saturate(0.5).darken(0.1).rgbString());
						this.active[0]._model.borderWidth = this.active[0].custom && this.active[0].custom.hoverBorderWidth ? this.active[0].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, this.active[0]._model.borderWidth);
						break;
					case 'label':
						for (var i = 0; i < this.active.length; i++) {
							dataset = this.data.datasets[this.active[i]._datasetIndex];
							index = this.active[i]._index;

							this.active[i]._model.radius = this.active[i].custom && this.active[i].custom.radius ? this.active[i].custom.radius : helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.options.elements.point.hoverRadius);
							this.active[i]._model.backgroundColor = this.active[i].custom && this.active[i].custom.hoverBackgroundColor ? this.active[i].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.color(this.active[i]._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
							this.active[i]._model.borderColor = this.active[i].custom && this.active[i].custom.hoverBorderColor ? this.active[i].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.color(this.active[i]._model.borderColor).saturate(0.5).darken(0.1).rgbString());
							this.active[i]._model.borderWidth = this.active[i].custom && this.active[i].custom.hoverBorderWidth ? this.active[i].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, this.active[i]._model.borderWidth);
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


			// Hover animations
			this.tooltip.pivot();

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
					this.render(this.options.hover.animationDuration);
				}
			}

			// Remember Last Active
			this.lastActive = this.active;
			return this;
		},
	});


}).call(this);
