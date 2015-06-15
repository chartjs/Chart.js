(function() {

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart,
		helpers = Chart.helpers;


	//Create a dictionary of chart types, to allow for extension of existing types
	Chart.types = {};

	//Store a reference to each instance - allowing us to globally resize chart instances on window resize.
	//Destroy method on the chart will remove the instance of the chart from this reference.
	Chart.instances = {};

	Chart.Controller = function(instance) {

		this.chart = instance;
		var config = instance.config;
		this.data = config.data;
		this.options = config.options = helpers.configMerge(Chart.defaults.global, Chart.defaults[config.type], config.options || {});
		this.id = helpers.uid();

		console.log(this.options);

		//Add the chart instance to the global namespace
		Chart.instances[this.id] = this;

		// Initialize is always called when a chart type is created
		// By default it is a no op, but it should be extended

		if (this.options.responsive) {
			this.resize();
		}

		this.initialize.call(this);

		return this;
	};

	helpers.extend(Chart.Controller.prototype, {

		initialize: function initialize() {

			this.bindEvents();
			this.buildScales();

			Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);

			this.resetElements();

			this.initToolTip();

			this.update();

			return this;
		},

		clear: function clear() {
			helpers.clear(this.chart);
			return this;
		},

		stop: function stop() {
			// Stops any current animation loop occuring
			Chart.animationService.cancelAnimation(this);
			return this;
		},

		resize: function resize() {
			this.stop();
			var canvas = this.chart.canvas,
				newWidth = helpers.getMaximumWidth(this.chart.canvas),
				newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : getMaximumHeight(this.chart.canvas);

			canvas.width = this.chart.width = newWidth;
			canvas.height = this.chart.height = newHeight;

			helpers.retinaScale(this.chart);

			return this;
		},

		buildScales: function buildScales() {
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

		resetElements: function resetElements() {
			// This will loop through any data and do the appropriate element reset for the type
		},
		update: function update(animationDuration) {
			// This will loop through any data and do the appropriate element update for the type
			//this.render(animationDuration);
		},

		render: function render(duration) {

			if (this.options.animation.duration !== 0 || duration) {
				var animation = new Chart.Animation();
				animation.numSteps = (duration || this.options.animation.duration) / 16.66; //60 fps
				animation.easing = this.options.animation.easing;

				// render function
				animation.render = function(chartInstance, animationObject) {
					var easingFunction = helpers.easingEffects[animationObject.easing];
					var stepDecimal = animationObject.currentStep / animationObject.numSteps;
					var easeDecimal = easingFunction(stepDecimal);

					chartInstance.draw(easeDecimal, stepDecimal, animationObject.currentStep);
				};

				// user events
				animation.onAnimationProgress = this.options.onAnimationProgress;
				animation.onAnimationComplete = this.options.onAnimationComplete;

				Chart.animationService.addAnimation(this, animation, duration);
			} else {
				this.draw();
				this.options.onAnimationComplete.call(this);
			}
			return this;
		},

		eachValue: function eachValue(callback) {
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				helpers.each(dataset.data, callback, this, datasetIndex);
			}, this);
		},

		eachElement: function eachElement(callback) {
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				helpers.each(dataset.metaData, callback, this, dataset.metaData, datasetIndex);
			}, this);
		},

		eachDataset: function eachDataset(callback) {
			helpers.each(this.data.datasets, callback, this);
		},

		// Get the single element that was clicked on
		// @return : An object containing the dataset index and element index of the matching element. Also contains the rectangle that was draw
		getElementAtEvent: function getElementAtEvent(e) {

			var element = [];
			var eventPosition = helpers.getRelativePosition(e);

			for (var datasetIndex = 0; datasetIndex < this.data.datasets.length; ++datasetIndex) {
				for (var elementIndex = 0; elementIndex < this.data.datasets[datasetIndex].metaData.length; ++elementIndex) {
					if (this.data.datasets[datasetIndex].metaData[elementIndex].inRange(eventPosition.x, eventPosition.y)) {
						element.push(this.data.datasets[datasetIndex].metaData[elementIndex]);
						return element;
					}
				}
			}

			return [];
		},

		getElementsAtEvent: function getElementsAtEvent(e) {

			var elementsArray = [],
				eventPosition = helpers.getRelativePosition(e),
				datasetIterator = function(dataset) {
					elementsArray.push(dataset.metaData[elementIndex]);
				},
				elementIndex;

			for (var datasetIndex = 0; datasetIndex < this.data.datasets.length; datasetIndex++) {
				for (elementIndex = 0; elementIndex < this.data.datasets[datasetIndex].metaData.length; elementIndex++) {
					if (this.data.datasets[datasetIndex].metaData[elementIndex].inGroupRange(eventPosition.x, eventPosition.y)) {
						helpers.each(this.data.datasets, datasetIterator);
					}
				}
			}

			return elementsArray.length ? elementsArray : [];
		},

		generateLegend: function generateLegend() {
			return template(this.options.legendTemplate, this);
		},

		destroy: function destroy() {
			this.clear();
			helpers.unbindEvents(this, this.events);
			var canvas = this.chart.canvas;

			// Reset canvas height/width attributes starts a fresh with the canvas context
			canvas.width = this.chart.width;
			canvas.height = this.chart.height;

			// < IE9 doesn't support removeProperty
			if (canvas.style.removeProperty) {
				canvas.style.removeProperty('width');
				canvas.style.removeProperty('height');
			} else {
				canvas.style.removeAttribute('width');
				canvas.style.removeAttribute('height');
			}

			delete Chart.instances[this.id];
		},

		toBase64Image: function toBase64Image() {
			return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
		},
		bindEvents: function bindEvents() {
			helpers.bindEvents(this, this.options.events, function(evt) {
				// this will be the chart instance
				this.canvasController.eventHandler(evt);
			});
		},

		eventHandler: function eventHandler(e) {
			this.lastActive = this.lastActive || [];

			// Find Active Elements
			if (e.type == 'mouseout') {
				this.active = [];
			} else {
				this.active = function() {
					switch (this.options.hover.mode) {
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
						this.elementController.resetElementAppearance(this.lastActive[0], this.lastActive[0]._datasetIndex, this.lastActive[0]._index);
						break;
					case 'label':
						for (var i = 0; i < this.lastActive.length; i++) {
							this.elementController.resetElementAppearance(this.lastActive[i], this.lastActive[i]._datasetIndex, this.lastActive[i]._index);
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
						this.elementController.setElementHoverStyle(this.active[0]);
						break;
					case 'label':
						for (var i = 0; i < this.active.length; i++) {
							this.elementController.setElementHoverStyle(this.active[i]);
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

		initToolTip: function initToolTip() {
			this.tooltip = new Chart.Tooltip({
				_chart: this.chart,
				_data: this.data,
				_options: this.options,
			}, this);
		},


		update: function update() {
			Chart.scaleService.fitScalesForChart(this, this.chart.width, this.chart.height);
			this.elementController.updateElements();
		}
	});

}).call(this);
