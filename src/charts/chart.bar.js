(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
		hover: {
			mode: "label"
		},

		scales: {
			xAxes: [{
				type: "category", // scatter should not use a dataset axis
				display: true,
				position: "bottom",
				id: "x-axis-1", // need an ID so datasets can reference the scale

				categorySpacing: 10,
				spacing: 1,

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
				type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
				display: true,
				position: "left",
				id: "y-axis-1",

				spacing: 1,

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

				if (yScale.min < 0 && yScale.max < 0) {
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
						backgroundColor: bar.custom && bar.custom.backgroundColor ? bar.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].backgroundColor, index, this.options.elements.rectangle.backgroundColor),
						borderColor: bar.custom && bar.custom.borderColor ? bar.custom.borderColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].borderColor, index, this.options.elements.rectangle.borderColor),
						borderWidth: bar.custom && bar.custom.borderWidth ? bar.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].borderWidth, index, this.options.elements.rectangle.borderWidth),

						// Tooltip
						label: this.data.labels[index],
						datasetLabel: this.data.datasets[datasetIndex].label,
					},
				});
				bar.pivot();
			}, this);
		},
		update: function(animationDuration) {
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
						backgroundColor: bar.custom && bar.custom.backgroundColor ? bar.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].backgroundColor, index, this.options.elements.rectangle.backgroundColor),
						borderColor: bar.custom && bar.custom.borderColor ? bar.custom.borderColor : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].borderColor, index, this.options.elements.rectangle.borderColor),
						borderWidth: bar.custom && bar.custom.borderWidth ? bar.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.data.datasets[datasetIndex].borderWidth, index, this.options.elements.rectangle.borderWidth),

						// Tooltip
						label: this.data.labels[index],
						datasetLabel: this.data.datasets[datasetIndex].label,
					},
				});
				bar.pivot();
			}, this);


			this.render(animationDuration);
		},
		buildScale: function(labels) {
			var self = this;

			// Map of scale ID to scale object so we can lookup later 
			this.scales = {};

			// Build the x axis. The line chart only supports a single x axis
			var ScaleClass = Chart.scaleService.getScaleConstructor(this.options.scales.xAxes[0].type);
			var xScale = new ScaleClass({
				ctx: this.chart.ctx,
				options: this.options.scales.xAxes[0],
				id: this.options.scales.xAxes[0].id,
				data: this.data,
			});
			this.scales[xScale.id] = xScale;

			// Build up all the y scales
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

						this.lastActive[0]._model.backgroundColor = this.lastActive[0].custom && this.lastActive[0].custom.backgroundColor ? this.lastActive[0].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.options.elements.rectangle.backgroundColor);
						this.lastActive[0]._model.borderColor = this.lastActive[0].custom && this.lastActive[0].custom.borderColor ? this.lastActive[0].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.options.elements.rectangle.borderColor);
						this.lastActive[0]._model.borderWidth = this.lastActive[0].custom && this.lastActive[0].custom.borderWidth ? this.lastActive[0].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.options.elements.rectangle.borderWidth);
						break;
					case 'label':
						for (var i = 0; i < this.lastActive.length; i++) {
							dataset = this.data.datasets[this.lastActive[i]._datasetIndex];
							index = this.lastActive[i]._index;

							this.lastActive[i]._model.backgroundColor = this.lastActive[i].custom && this.lastActive[i].custom.backgroundColor ? this.lastActive[i].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.options.elements.rectangle.backgroundColor);
							this.lastActive[i]._model.borderColor = this.lastActive[i].custom && this.lastActive[i].custom.borderColor ? this.lastActive[i].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.options.elements.rectangle.borderColor);
							this.lastActive[i]._model.borderWidth = this.lastActive[i].custom && this.lastActive[i].custom.borderWidth ? this.lastActive[i].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.options.elements.rectangle.borderWidth);
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

						this.active[0]._model.backgroundColor = this.active[0].custom && this.active[0].custom.hoverBackgroundColor ? this.active[0].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(this.active[0]._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
						this.active[0]._model.borderColor = this.active[0].custom && this.active[0].custom.hoverBorderColor ? this.active[0].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(this.active[0]._model.borderColor).saturate(0.5).darken(0.1).rgbString());
						this.active[0]._model.borderWidth = this.active[0].custom && this.active[0].custom.hoverBorderWidth ? this.active[0].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.active[0]._model.borderWidth);
						break;
					case 'label':
						for (var i = 0; i < this.active.length; i++) {
							dataset = this.data.datasets[this.active[i]._datasetIndex];
							index = this.active[i]._index;

							this.active[i]._model.backgroundColor = this.active[i].custom && this.active[i].custom.hoverBackgroundColor ? this.active[i].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(this.active[i]._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
							this.active[i]._model.borderColor = this.active[i].custom && this.active[i].custom.hoverBorderColor ? this.active[i].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(this.active[i]._model.borderColor).saturate(0.5).darken(0.1).rgbString());
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
