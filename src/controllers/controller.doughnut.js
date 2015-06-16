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

	Chart.defaults.pie = helpers.clone(Chart.defaults.doughnut);
	helpers.extend(Chart.defaults.pie, {
		cutoutPercentage: 0
	});


	Chart.controllers.doughnut = Chart.controllers.pie = function(chart, datasetIndex) {
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
			this.innerRadius = this.outerRadius - this.chart.radiusLength;

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



		setHoverStyle: function(arc) {
			var dataset = this.chart.data.datasets[arc._datasetIndex];
			var index = arc._index;

			arc._model.backgroundColor = arc.custom && arc.custom.hoverBackgroundColor ? arc.custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.color(arc._model.backgroundColor).saturate(0.5).darken(0.1).rgbString());
			arc._model.borderColor = arc.custom && arc.custom.hoverBorderColor ? arc.custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.color(arc._model.borderColor).saturate(0.5).darken(0.1).rgbString());
			arc._model.borderWidth = arc.custom && arc.custom.hoverBorderWidth ? arc.custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, arc._model.borderWidth);
		},

		removeHoverStyle: function(arc) {
			var dataset = this.chart.data.datasets[arc._datasetIndex];
			var index = arc._index;

			arc._model.backgroundColor = arc.custom && arc.custom.backgroundColor ? arc.custom.backgroundColor : helpers.getValueAtIndexOrDefault(this.getDataset().backgroundColor, index, this.chart.options.elements.arc.backgroundColor);
			arc._model.borderColor = arc.custom && arc.custom.borderColor ? arc.custom.borderColor : helpers.getValueAtIndexOrDefault(this.getDataset().borderColor, index, this.chart.options.elements.arc.borderColor);
			arc._model.borderWidth = arc.custom && arc.custom.borderWidth ? arc.custom.borderWidth : helpers.getValueAtIndexOrDefault(this.getDataset().borderWidth, index, this.chart.options.elements.arc.borderWidth);
		},

		calculateCircumference: function(value) {
			if (this.getDataset().total > 0) {
				return (Math.PI * 1.999999) * (value / this.getDataset().total);
			} else {
				return 0;
			}
		},

	});


}).call(this);
