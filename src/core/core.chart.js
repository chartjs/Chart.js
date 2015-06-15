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

	Chart.Type = function(config, instance) {
		this.data = config.data;
		this.options = config.options;
		this.chart = instance;
		this.id = helpers.uid();
		//Add the chart instance to the global namespace
		Chart.instances[this.id] = this;

		// Initialize is always called when a chart type is created
		// By default it is a no op, but it should be extended
		if (this.options.responsive) {
			this.resize();
		}
		this.initialize.call(this);
	};

	//Core methods that'll be a part of every chart type
	helpers.extend(Chart.Type.prototype, {
		initialize: function() {
			return this;
		},
		clear: function() {
			helpers.clear(this.chart);
			return this;
		},
		stop: function() {
			// Stops any current animation loop occuring
			Chart.animationService.cancelAnimation(this);
			return this;
		},
		resize: function() {
			this.stop();
			var canvas = this.chart.canvas,
				newWidth = helpers.getMaximumWidth(this.chart.canvas),
				newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : getMaximumHeight(this.chart.canvas);

			canvas.width = this.chart.width = newWidth;
			canvas.height = this.chart.height = newHeight;

			helpers.retinaScale(this.chart);

			return this;
		},
		update: function(animationDuration) {
			this.canvasController.update();
			this.render(animationDuration);
		},
		render: function(duration) {

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
		eachElement: function(callback) {
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				helpers.each(dataset.metaData, callback, this, dataset.metaData, datasetIndex);
			}, this);
		},
		eachValue: function(callback) {
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				helpers.each(dataset.data, callback, this, datasetIndex);
			}, this);
		},
		eachDataset: function(callback) {
			helpers.each(this.data.datasets, callback, this);
		},
		getElementsAtEvent: function(e) {
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
		// Get the single element that was clicked on
		// @return : An object containing the dataset index and element index of the matching element. Also contains the rectangle that was drawn
		getElementAtEvent: function(e) {
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
		generateLegend: function() {
			return template(this.options.legendTemplate, this);
		},
		destroy: function() {
			this.clear();
			unbindEvents(this, this.events);
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
		toBase64Image: function() {
			return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
		}
	});

	Chart.Type.extend = function(extensions) {

		var parent = this;

		var ChartType = function() {
			return parent.apply(this, arguments);
		};

		//Copy the prototype object of the this class
		ChartType.prototype = helpers.clone(parent.prototype);

		//Now overwrite some of the properties in the base class with the new extensions
		helpers.extend(ChartType.prototype, extensions);
		ChartType.extend = Chart.Type.extend;

		if (extensions.name || parent.prototype.name) {

			var chartName = extensions.name || parent.prototype.name;
			//Assign any potential default values of the new chart type

			//If none are defined, we'll use a clone of the chart type this is being extended from.
			//I.e. if we extend a line chart, we'll use the defaults from the line chart if our new chart
			//doesn't define some defaults of their own.

			var baseDefaults = (Chart.defaults[parent.prototype.name]) ? helpers.clone(Chart.defaults[parent.prototype.name]) : {};

			Chart.defaults[chartName] = helpers.configMerge(baseDefaults, extensions.defaults);

			Chart.types[chartName] = ChartType;

			//Register this new chart type in the Chart prototype
			Chart.prototype[chartName] = function(config) {
				config.options = helpers.configMerge(Chart.defaults.global, Chart.defaults[chartName], config.options || {});
				return new ChartType(config, this);
			};
		} else {
			warn("Name not provided for this chart, so it hasn't been registered");
		}
		return parent;
	};

}).call(this);
