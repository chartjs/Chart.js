(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;

	Chart.defaults.doughnut = {
		animation: {
			//Boolean - Whether we animate the rotation of the Doughnut
			animateRotate: true,
			//Boolean - Whether we animate scaling the Doughnut from the centre
			animateScale: false,
		},
		hover: {
			mode: 'single'
		},
		//The percentage of the chart that we cut out of the middle.
		cutoutPercentage: 50,

	};


	Chart.controllers.doughnut = function(chart, datasetIndex) {
		this.initialize.call(this, chart, datasetIndex);
	};

	helpers.extend(Chart.controllers.doughnut.prototype, {

		initialize: function(chart, datasetIndex) {
			this.chart = chart;
			this.index = datasetIndex;
			this.linkScales();
			this.addElements();
		},

		linkScales: function() {
			// no scales for doughnut
		},

		getDataset: function() {
			return this.chart.data.datasets[this.index];
		},

		getScaleForId: function(scaleID) {
			return this.chart.scales[scaleID];
		},

		addElements: function() {
			this.getDataset().metaData = this.getDataset().metaData || [];
			helpers.each(this.getDataset().data, function(value, index) {
				this.getDataset().metaData[index] = this.getDataset().metaData[index] || new Chart.elements.Arc({
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,
				});
			}, this);
		},

		reset: function() {
			this.update(true);
		},

		update: function(reset) {

			this.chart.outerRadius = (helpers.min([this.chart.chart.width, this.chart.chart.height]) - this.chart.options.elements.arc.borderWidth / 2) / 2;
			this.chart.innerRadius = this.chart.options.cutoutPercentage ? (this.chart.outerRadius / 100) * (this.chart.options.cutoutPercentage) : 1;
			this.chart.radiusLength = (this.chart.outerRadius - this.chart.innerRadius) / this.chart.data.datasets.length;


			this.getDataset().total = 0;
			helpers.each(this.getDataset().data, function(value) {
				this.getDataset().total += Math.abs(value);
			}, this);

			this.outerRadius = this.chart.outerRadius - (this.chart.radiusLength * this.index);
			this.innerRadius = this.chart.outerRadius - this.chart.radiusLength;

			helpers.each(this.getDataset().metaData, function(arc, index) {

				var resetModel = {
					x: this.chart.chart.width / 2,
					y: this.chart.chart.height / 2,
					startAngle: Math.PI * -0.5, // use - PI / 2 instead of 3PI / 2 to make animations better. It means that we never deal with overflow during the transition function
					circumference: (this.chart.options.animation.animateRotate) ? 0 : this.calculateCircumference(this.getDataset().data[index]),
					outerRadius: (this.chart.options.animation.animateScale) ? 0 : this.outerRadius,
					innerRadius: (this.chart.options.animation.animateScale) ? 0 : this.innerRadius,
				};

				helpers.extend(arc, {
					// Utility
					_chart: this.chart.chart,
					_datasetIndex: this.index,
					_index: index,

					// Desired view properties
					_model: reset ? resetModel : {
						x: this.chart.chart.width / 2,
						y: this.chart.chart.height / 2,
						circumference: this.calculateCircumference(this.getDataset().data[index]),
						outerRadius: this.outerRadius,
						innerRadius: this.innerRadius,

						backgroundColor: arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor),
						hoverBackgroundColor: arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().hoverBackgroundColor, index, this.chart.options.elements.arc.hoverBackgroundColor),
						borderWidth: arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth),
						borderColor: arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor),

						label: helpers.getValueAtIndexOrDefault(this.getDataset().label, index, this.chart.data.labels[index])
					},
				});

				if (!reset) {

					if (index === 0) {
						arc._model.startAngle = Math.PI * -0.5; // use - PI / 2 instead of 3PI / 2 to make animations better. It means that we never deal with overflow during the transition function
					} else {
						arc._model.startAngle = this.getDataset().metaData[index - 1]._model.endAngle;
					}

					arc._model.endAngle = arc._model.startAngle + arc._model.circumference;


					//Check to see if it's the last arc, if not get the next and update its start angle
					if (index < this.getDataset().data.length - 1) {
						this.getDataset().metaData[index + 1]._model.startAngle = arc._model.endAngle;
					}
				}

				arc.pivot();
			}, this);
		},

		draw: function(ease) {
			var easingDecimal = ease || 1;
			helpers.each(this.getDataset().metaData, function(arc, index) {
				arc.transition(easingDecimal).draw();
			}, this);
		},



		setHoverStyle: function(rectangle) {
			var dataset = this.chart.data.datasets[rectangle._datasetIndex];
			var index = rectangle._index;

			rectangle._model.backgroundColor = rectangle.custom && rectangle.custom.hoverBackgroundColor ? rectangle.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(rectangle._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			rectangle._model.borderColor = rectangle.custom && rectangle.custom.hoverBorderColor ? rectangle.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(rectangle._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			rectangle._model.borderWidth = rectangle.custom && rectangle.custom.hoverBorderWidth ? rectangle.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, rectangle._model.borderWidth);
		},

		removeHoverStyle: function(rectangle) {
			// TODO
		},

		calculateCircumference: function(value) {
			if (this.getDataset().total > 0) {
				return (Math.PI * 2) * (value / this.getDataset().total);
			} else {
				return 0;
			}
		},

	});









	return;

	Chart.Type.extend({
		//Passing in a name registers this chart in the Chart namespace
		name: "Doughnut",
		//Providing a defaults will also register the deafults in the chart namespace
		defaults: defaultConfig,
		//Initialize is fired when the chart is initialized - Data is passed in as a parameter
		//Config is automatically merged by the core of Chart.js, and is available at this.options
		initialize: function() {

			//Set up tooltip events on the chart
			helpers.bindEvents(this, this.chart.options.events, this.events);

			//Create a new bar for each piece of data
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				dataset.metaData = [];
				helpers.each(dataset.data, function(dataPoint, index) {
					dataset.metaData.push(new Chart.Arc({
						_chart: this.chart,
						_datasetIndex: datasetIndex,
						_index: index,
						_model: {}
					}));
				}, this);
			}, this);

			// Create tooltip instance exclusively for this chart with some defaults.
			this.tooltip = new Chart.Tooltip({
				_chart: this.chart,
				_data: this.data,
				_options: this.options,
			}, this);

			this.resetElements();

			// Update the chart with the latest data.
			this.update();

		},

		resetElements: function() {
			this.outerRadius = (helpers.min([this.chart.width, this.chart.height]) - this.chart.options.elements.arc.borderWidth / 2) / 2;
			this.innerRadius = this.chart.options.cutoutPercentage ? (this.outerRadius / 100) * (this.chart.options.cutoutPercentage) : 1;
			this.radiusLength = (this.outerRadius - this.innerRadius) / this.data.datasets.length;

			// Update the points
			helpers.each(this.data.datasets, function(dataset, datasetIndex) {
				// So that calculateCircumference works
				dataset.total = 0;
				helpers.each(dataset.data, function(value) {
					dataset.total += Math.abs(value);
				}, this);

				dataset.outerRadius = this.outerRadius - (this.radiusLength * datasetIndex);
				dataset.innerRadius = dataset.outerRadius - this.radiusLength;

				helpers.each(dataset.metaData, function(arc, index) {
					helpers.extend(arc, {
						_model: {
							x: this.chart.width / 2,
							y: this.chart.height / 2,
							startAngle: Math.PI * -0.5, // use - PI / 2 instead of 3PI / 2 to make animations better. It means that we never deal with overflow during the transition function
							circumference: (this.chart.options.animation.animateRotate) ? 0 : this.calculateCircumference(metaSlice.value),
							outerRadius: (this.chart.options.animation.animateScale) ? 0 : dataset.outerRadius,
							innerRadius: (this.chart.options.animation.animateScale) ? 0 : dataset.innerRadius,

							backgroundColor: arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.chart.options.elements.arc.backgroundColor),
							hoverBackgroundColor: arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, this.chart.options.elements.arc.hoverBackgroundColor),
							borderWidth: arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.chart.options.elements.arc.borderWidth),
							borderColor: arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.chart.options.elements.arc.borderColor),

							label: helpers.getValueAtIndexOrDefault(dataset.label, index, this.chart.data.labels[index])
						},
					});

					arc.pivot();
				}, this);

			}, this);
		},
		update: function(animationDuration) {


		},
		draw: function(easeDecimal) {
			easeDecimal = easeDecimal || 1;
			this.clear();

			this.eachElement(function(arc) {
				arc.transition(easeDecimal).draw();
			}, this);

			this.tooltip.transition(easeDecimal).draw();
		},
		events: function(e) {

			this.lastActive = this.lastActive || [];

			// Find Active Elements
			if (e.type == 'mouseout') {
				this.active = [];
			} else {

				this.active = function() {
					switch (this.chart.options.hover.mode) {
						case 'single':
							return this.getSliceAtEvent(e);
						case 'label':
							return this.getSlicesAtEvent(e);
						case 'dataset':
							return this.getDatasetAtEvent(e);
						default:
							return e;
					}
				}.call(this);
			}

			// On Hover hook
			if (this.chart.options.hover.onHover) {
				this.chart.options.hover.onHover.call(this, this.active);
			}

			if (e.type == 'mouseup' || e.type == 'click') {
				if (this.chart.options.onClick) {
					this.chart.options.onClick.call(this, e, this.active);
				}
			}

			var dataset;
			var index;
			// Remove styling for last active (even if it may still be active)
			if (this.lastActive.length) {
				switch (this.chart.options.hover.mode) {
					case 'single':
						dataset = this.data.datasets[this.lastActive[0]._datasetIndex];
						index = this.lastActive[0]._index;

						this.lastActive[0]._model.backgroundColor = this.lastActive[0].custom && this.lastActive[0].custom.backgroundColor ? this.lastActive[0].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.chart.options.elements.arc.backgroundColor);
						this.lastActive[0]._model.borderColor = this.lastActive[0].custom && this.lastActive[0].custom.borderColor ? this.lastActive[0].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.chart.options.elements.arc.borderColor);
						this.lastActive[0]._model.borderWidth = this.lastActive[0].custom && this.lastActive[0].custom.borderWidth ? this.lastActive[0].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.chart.options.elements.arc.borderWidth);
						break;
					case 'label':
						for (var i = 0; i < this.lastActive.length; i++) {
							dataset = this.data.datasets[this.lastActive[i]._datasetIndex];
							index = this.lastActive[i]._index;

							this.lastActive[i]._model.backgroundColor = this.lastActive[i].custom && this.lastActive[i].custom.backgroundColor ? this.lastActive[i].custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, this.chart.options.elements.arc.backgroundColor);
							this.lastActive[i]._model.borderColor = this.lastActive[i].custom && this.lastActive[i].custom.borderColor ? this.lastActive[i].custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, this.chart.options.elements.arc.borderColor);
							this.lastActive[i]._model.borderWidth = this.lastActive[i].custom && this.lastActive[i].custom.borderWidth ? this.lastActive[i].custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, this.chart.options.elements.arc.borderWidth);
						}
						break;
					case 'dataset':
						break;
					default:
						// Don't change anything
				}
			}

			// Built in hover styling
			if (this.active.length && this.chart.options.hover.mode) {
				switch (this.chart.options.hover.mode) {
					case 'single':
						dataset = this.data.datasets[this.active[0]._datasetIndex];
						index = this.active[0]._index;

						this.active[0]._model.backgroundColor = this.active[0].custom && this.active[0].custom.hoverBackgroundColor ? this.active[0].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(this.active[0]._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
						this.active[0]._model.borderColor = this.active[0].custom && this.active[0].custom.hoverBorderColor ? this.active[0].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, this.active[0]._model.borderColor);
						this.active[0]._model.borderWidth = this.active[0].custom && this.active[0].custom.hoverBorderWidth ? this.active[0].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.hoverBorderWidth, index, this.active[0]._model.borderWidth);
						break;
					case 'label':
						for (var i = 0; i < this.active.length; i++) {
							dataset = this.data.datasets[this.active[i]._datasetIndex];
							index = this.active[i]._index;

							this.active[i]._model.backgroundColor = this.active[i].custom && this.active[i].custom.hoverBackgroundColor ? this.active[i].custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(this.active[i]._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
							this.active[i]._model.borderColor = this.active[i].custom && this.active[i].custom.hoverBorderColor ? this.active[i].custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, this.active[0]._model.borderColor);
							this.active[i]._model.borderWidth = this.active[i].custom && this.active[i].custom.hoverBorderWidth ? this.active[i].custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.hoverBorderWidth, index, this.active[i]._model.borderWidth);
						}
						break;
					case 'dataset':
						break;
					default:
						// Don't change anything
				}
			}


			// Built in Tooltips
			if (this.chart.options.tooltips.enabled) {

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
					this.render(this.chart.options.hover.animationDuration);
				}
			}

			// Remember Last Active
			this.lastActive = this.active;
			return this;
		},
		getSliceAtEvent: function(e) {
			var elements = [];

			var location = helpers.getRelativePosition(e);

			this.eachElement(function(arc, index) {
				if (arc.inRange(location.x, location.y)) {
					elements.push(arc);
				}
			}, this);
			return elements;
		},
		/*getSlicesAtEvent: function(e) {
			var elements = [];

			var location = helpers.getRelativePosition(e);

			this.eachElement(function(arc, index) {
				if (arc.inLabelRange(location.x, location.y)) {
					elements.push(arc);
				}
			}, this);
			return elements;
		},*/
	});

	Chart.types.Doughnut.extend({
		name: "Pie",
		defaults: helpers.merge(defaultConfig, {
			cutoutPercentage: 0
		})
	});

}).call(this);
